import { prisma } from "./db";
import { NEXT_STATUS, REWARDS, SHIPPING } from "./config";

export type CheckoutInput = {
  items: { productId: string; quantity: number }[];
  shippingName: string;
  shippingPhone: string;
  shippingAddress: string;
  paymentMethod: "COD" | "CARD" | "BANK" | "WALLET" | "POINTS";
  usePoints: boolean;
  useWallet: boolean;
  couponCode?: string;
};

export class CheckoutError extends Error {}

/**
 * Creates one order per merchant (all sharing a groupId) inside a single DB transaction.
 * Prices are always re-read from the database; the client cart is never trusted.
 */
export async function createOrders(userId: string, input: CheckoutInput) {
  if (!input.items.length) throw new CheckoutError("Your cart is empty.");

  return prisma.$transaction(async (tx) => {
    const user = await tx.user.findUnique({ where: { id: userId } });
    if (!user) throw new CheckoutError("Please sign in again.");

    // Enforce KYC verification when wallet or points are used
    const isVerified = user.kycStatus === "VERIFIED" || user.kycStatus === "BYPASSED";
    if (
      (input.paymentMethod === "WALLET" ||
        input.paymentMethod === "POINTS" ||
        input.usePoints ||
        input.useWallet) &&
      !isVerified
    ) {
      throw new CheckoutError(
        "KYC identity verification is required to use your wallet or redeem points. Please complete verification in Account > KYC."
      );
    }

    const qtyById = new Map<string, number>();
    for (const it of input.items) {
      const q = Math.max(1, Math.min(99, Math.floor(it.quantity)));
      qtyById.set(it.productId, (qtyById.get(it.productId) ?? 0) + q);
    }

    const products = await tx.product.findMany({
      where: { id: { in: [...qtyById.keys()] } },
      include: { merchant: true },
    });

    type Line = { productId: string; name: string; priceCents: number; quantity: number };
    const groups = new Map<string, { merchant: (typeof products)[number]["merchant"]; lines: Line[]; subtotal: number }>();

    for (const [id, quantity] of qtyById) {
      const p = products.find((x) => x.id === id);
      if (!p || !p.active || p.merchant.status !== "ACTIVE") {
        throw new CheckoutError("A product in your cart is no longer available.");
      }
      if (p.stock < quantity) {
        throw new CheckoutError(`Only ${p.stock} left of "${p.name}".`);
      }
      const g = groups.get(p.merchantId) ?? { merchant: p.merchant, lines: [], subtotal: 0 };
      g.lines.push({ productId: p.id, name: p.name, priceCents: p.priceCents, quantity });
      g.subtotal += p.priceCents * quantity;
      groups.set(p.merchantId, g);
    }

    const cartSubtotal = [...groups.values()].reduce((s, g) => s + g.subtotal, 0);

    // Coupon
    let coupon: Awaited<ReturnType<typeof tx.coupon.findUnique>> = null;
    if (input.couponCode?.trim()) {
      coupon = await tx.coupon.findUnique({ where: { code: input.couponCode.trim().toUpperCase() } });
      const bad =
        !coupon ||
        !coupon.active ||
        (coupon.expiresAt && coupon.expiresAt < new Date()) ||
        (coupon.usesLeft !== null && coupon.usesLeft <= 0) ||
        cartSubtotal < coupon.minSubtotalCents;
      if (bad) throw new CheckoutError("That coupon code is not valid for this order.");
    }

    // Calculate total order payable across all merchants
    let totalPayableWithShipping = 0;
    for (const g of groups.values()) {
      const discount = coupon ? Math.floor((g.subtotal * coupon.percentOff) / 100) : 0;
      const payable = g.subtotal - discount;
      const shipping = g.subtotal >= SHIPPING.FREE_OVER_CENTS ? 0 : SHIPPING.FLAT_CENTS;
      totalPayableWithShipping += payable + shipping;
    }

    // Direct Wallet payment verification
    if (input.paymentMethod === "WALLET") {
      if (user.walletCents < totalPayableWithShipping) {
        throw new CheckoutError(
          `Insufficient wallet balance. Total order is $${(totalPayableWithShipping / 100).toFixed(2)}, but your wallet has $${(user.walletCents / 100).toFixed(2)}. Please top up your wallet or select another payment method.`
        );
      }
    }

    // Direct Points payment verification
    if (input.paymentMethod === "POINTS") {
      const totalPointsNeeded = Math.ceil(totalPayableWithShipping / REWARDS.POINT_VALUE_CENTS);
      if (user.points < totalPointsNeeded) {
        throw new CheckoutError(
          `Insufficient points balance. Total order requires ${totalPointsNeeded.toLocaleString()} points ($${(totalPayableWithShipping / 100).toFixed(2)}), but your balance is ${user.points.toLocaleString()} points.`
        );
      }
    }

    let pointsPool = input.usePoints ? user.points : 0;
    let walletPool = input.useWallet ? user.walletCents : 0;
    let totalPointsUsed = 0;
    let totalWalletUsed = 0;

    const groupId = `G${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).slice(2, 5).toUpperCase()}`;
    let idx = 0;

    for (const g of groups.values()) {
      idx++;
      const discount = coupon ? Math.floor((g.subtotal * coupon.percentOff) / 100) : 0;
      const payable = g.subtotal - discount;
      const shipping = g.subtotal >= SHIPPING.FREE_OVER_CENTS ? 0 : SHIPPING.FLAT_CENTS;
      const grandTotalForMerchant = payable + shipping;

      let pointsCents = 0;
      let pointsUsed = 0;
      let walletUsed = 0;
      let cashPaid = 0;
      let total = 0;
      let isPaid = false;

      if (input.paymentMethod === "WALLET") {
        walletUsed = grandTotalForMerchant;
        cashPaid = 0;
        total = 0;
        isPaid = true;
      } else if (input.paymentMethod === "POINTS") {
        pointsCents = grandTotalForMerchant;
        pointsUsed = Math.ceil(grandTotalForMerchant / REWARDS.POINT_VALUE_CENTS);
        cashPaid = 0;
        total = 0;
        isPaid = true;
      } else {
        // Partial points & wallet discounts
        pointsCents = Math.min(payable, pointsPool * REWARDS.POINT_VALUE_CENTS);
        pointsUsed = Math.ceil(pointsCents / REWARDS.POINT_VALUE_CENTS);
        pointsPool -= pointsUsed;

        walletUsed = Math.min(payable - pointsCents, walletPool);
        walletPool -= walletUsed;

        cashPaid = payable - pointsCents - walletUsed;
        total = cashPaid + shipping;
        isPaid = total === 0 || input.paymentMethod === "CARD";
      }

      const pointsEarned = Math.floor((cashPaid / 100) * g.merchant.pointsRate);
      const cashback = Math.floor((cashPaid * g.merchant.cashbackPct) / 100);
      const commission = Math.floor((g.subtotal - discount) * (g.merchant.commissionPct / 100));

      const order = await tx.order.create({
        data: {
          groupId,
          number: `SNL-${Math.random().toString(36).slice(2, 8).toUpperCase()}${Date.now().toString(36).slice(-3).toUpperCase()}-${idx}`,
          userId,
          merchantId: g.merchant.id,
          paymentMethod: input.paymentMethod,
          paymentStatus: isPaid ? "PAID" : "UNPAID",
          subtotalCents: g.subtotal,
          discountCents: discount,
          pointsUsed,
          pointsDiscountCents: pointsCents,
          walletUsedCents: walletUsed,
          shippingCents: shipping,
          totalCents: total,
          pointsEarned,
          cashbackCents: cashback,
          commissionCents: commission,
          couponCode: coupon?.code,
          shippingName: input.shippingName,
          shippingPhone: input.shippingPhone,
          shippingAddress: input.shippingAddress,
          items: { create: g.lines },
        },
      });

      for (const l of g.lines) {
        const r = await tx.product.updateMany({
          where: { id: l.productId, stock: { gte: l.quantity } },
          data: { stock: { decrement: l.quantity } },
        });
        if (r.count === 0) throw new CheckoutError(`"${l.name}" just sold out.`);
      }

      if (pointsUsed > 0) {
        await tx.transaction.create({
          data: {
            userId,
            type: "POINTS",
            amount: -pointsUsed,
            reason: input.paymentMethod === "POINTS" ? "POINTS_PAY" : "REDEEM",
            note: `${input.paymentMethod === "POINTS" ? "Direct Points Payment" : "Points discount"} on ${order.number}`,
            orderId: order.id,
          },
        });
      }
      if (walletUsed > 0) {
        await tx.transaction.create({
          data: {
            userId,
            type: "CASH",
            amount: -walletUsed,
            reason: "WALLET_PAY",
            note: `${input.paymentMethod === "WALLET" ? "100% Wallet Payment" : "Wallet discount"} on ${order.number}`,
            orderId: order.id,
          },
        });
      }
      totalPointsUsed += pointsUsed;
      totalWalletUsed += walletUsed;
    }

    if (totalPointsUsed || totalWalletUsed) {
      await tx.user.update({
        where: { id: userId },
        data: { points: { decrement: totalPointsUsed }, walletCents: { decrement: totalWalletUsed } },
      });
    }
    if (coupon && coupon.usesLeft !== null) {
      await tx.coupon.update({ where: { id: coupon.id }, data: { usesLeft: { decrement: 1 } } });
    }
    return groupId;
  });
}

/**
 * Moves an order to a new status, enforcing the allowed flow.
 * DELIVERED grants points + cashback (+ one-time referral bonus). CANCELLED restores stock and refunds redemptions.
 */
export async function changeOrderStatus(orderId: string, next: string, opts?: { merchantId?: string }) {
  return prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({
      where: { id: orderId },
      include: { items: true, user: true },
    });
    if (!order) throw new Error("Order not found");
    if (opts?.merchantId && order.merchantId !== opts.merchantId) throw new Error("Not your order");
    if (!NEXT_STATUS[order.status]?.includes(next as never)) {
      throw new Error(`Cannot change ${order.status} to ${next}`);
    }

    await tx.order.update({ where: { id: order.id }, data: { status: next } });

    if (next === "DELIVERED") {
      const updates: { points: number; cash: number } = { points: 0, cash: 0 };
      if (!order.rewardsGranted) {
        if (order.pointsEarned > 0) {
          updates.points += order.pointsEarned;
          await tx.transaction.create({
            data: { userId: order.userId, type: "POINTS", amount: order.pointsEarned, reason: "EARN", note: `Earned on ${order.number}`, orderId: order.id },
          });
        }
        if (order.cashbackCents > 0) {
          updates.cash += order.cashbackCents;
          await tx.transaction.create({
            data: { userId: order.userId, type: "CASH", amount: order.cashbackCents, reason: "CASHBACK", note: `Cashback on ${order.number}`, orderId: order.id },
          });
        }
        // Credit merchant's wallet with net order earnings (order total minus platform commission)
        const merchantEarnings = Math.max(0, order.totalCents - order.commissionCents);
        await tx.merchant.update({
          where: { id: order.merchantId },
          data: { walletCents: { increment: merchantEarnings } },
        });
        await tx.order.update({ where: { id: order.id }, data: { rewardsGranted: true, paymentStatus: "PAID" } });
      }
      if (updates.points || updates.cash) {
        await tx.user.update({
          where: { id: order.userId },
          data: { points: { increment: updates.points }, walletCents: { increment: updates.cash } },
        });
      }
      // Referral reward: referrer is paid once, when the friend's first order is delivered.
      if (order.user.referredById && !order.user.referralRewarded) {
        await tx.user.update({ where: { id: order.user.referredById }, data: { points: { increment: REWARDS.REFERRER_BONUS } } });
        await tx.transaction.create({
          data: {
            userId: order.user.referredById,
            type: "POINTS",
            amount: REWARDS.REFERRER_BONUS,
            reason: "REFERRAL",
            note: `Referral bonus: ${order.user.name} completed a first order`,
          },
        });
        await tx.user.update({ where: { id: order.userId }, data: { referralRewarded: true } });
      }
    }

    if (next === "CANCELLED") {
      for (const it of order.items) {
        await tx.product.update({ where: { id: it.productId }, data: { stock: { increment: it.quantity } } });
      }
      if (order.pointsUsed > 0) {
        await tx.transaction.create({
          data: { userId: order.userId, type: "POINTS", amount: order.pointsUsed, reason: "REFUND", note: `Refund for ${order.number}`, orderId: order.id },
        });
      }
      if (order.walletUsedCents > 0) {
        await tx.transaction.create({
          data: { userId: order.userId, type: "CASH", amount: order.walletUsedCents, reason: "REFUND", note: `Refund for ${order.number}`, orderId: order.id },
        });
      }
      await tx.user.update({
        where: { id: order.userId },
        data: { points: { increment: order.pointsUsed }, walletCents: { increment: order.walletUsedCents } },
      });
      if (order.paymentStatus === "PAID") {
        await tx.order.update({ where: { id: order.id }, data: { paymentStatus: "REFUNDED" } });
      }
    }
  });
}
