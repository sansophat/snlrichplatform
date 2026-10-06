"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { REWARDS } from "@/lib/config";
import { money } from "@/lib/format";
import type { FormState } from "./auth";

/**
 * Converts loyalty points directly into cash deposited to the user's wallet.
 * Enforces that user is verified and has sufficient valid points.
 */
export async function redeemPointsToCashAction(_: FormState, fd: FormData): Promise<FormState> {
  const user = await requireUser();

  const isVerified = user.kycStatus === "VERIFIED" || user.kycStatus === "BYPASSED";
  if (!isVerified) {
    return {
      error: "KYC verification is required to redeem points as cash. Please complete identity verification in Account > KYC.",
    };
  }

  const pointsToRedeem = Math.floor(Number(fd.get("points") ?? 0));
  if (pointsToRedeem < 100) {
    return { error: "Minimum points redemption is 100 points ($1.00)." };
  }

  if (pointsToRedeem > user.points) {
    return {
      error: `Insufficient points. You requested ${pointsToRedeem.toLocaleString()} pts, but your balance is ${user.points.toLocaleString()} pts.`,
    };
  }

  const cashCents = pointsToRedeem * REWARDS.POINT_VALUE_CENTS;

  await prisma.$transaction(async (tx) => {
    // Deduct points and credit wallet cash
    await tx.user.update({
      where: { id: user.id },
      data: {
        points: { decrement: pointsToRedeem },
        walletCents: { increment: cashCents },
      },
    });

    // Record Points Ledger deduction
    await tx.transaction.create({
      data: {
        userId: user.id,
        type: "POINTS",
        amount: -pointsToRedeem,
        reason: "REDEEM",
        note: `Redeemed ${pointsToRedeem.toLocaleString()} pts for ${money(cashCents)} wallet cash`,
      },
    });

    // Record Cash Ledger deposit
    await tx.transaction.create({
      data: {
        userId: user.id,
        type: "CASH",
        amount: cashCents,
        reason: "POINTS_TO_CASH",
        note: `Converted from ${pointsToRedeem.toLocaleString()} points`,
      },
    });
  });

  revalidatePath("/account", "layout");
  revalidatePath("/account/wallet");
  revalidatePath("/account/rewards");
  revalidatePath("/checkout");

  return {
    ok: `Successfully converted ${pointsToRedeem.toLocaleString()} points into ${money(cashCents)} wallet balance!`,
  };
}

/**
 * Adds funds to user's SNLRICH Wallet balance.
 */
export async function topUpWalletAction(_: FormState, fd: FormData): Promise<FormState> {
  const user = await requireUser();

  const amountStr = String(fd.get("amount") ?? "0").trim();
  const amountDollars = parseFloat(amountStr);
  if (isNaN(amountDollars) || amountDollars <= 0) {
    return { error: "Please enter a valid top-up amount." };
  }

  const amountCents = Math.round(amountDollars * 100);
  if (amountCents < 500) {
    return { error: "Minimum top-up amount is $5.00." };
  }
  if (amountCents > 200000) {
    return { error: "Maximum single top-up amount is $2,000.00." };
  }

  const paymentSource = String(fd.get("source") ?? "CARD").trim();

  await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: user.id },
      data: {
        walletCents: { increment: amountCents },
      },
    });

    await tx.transaction.create({
      data: {
        userId: user.id,
        type: "CASH",
        amount: amountCents,
        reason: "TOPUP",
        note: `Wallet top-up via ${paymentSource === "BANK" ? "Bank Transfer" : "Card"}`,
      },
    });
  });

  revalidatePath("/account", "layout");
  revalidatePath("/account/wallet");
  revalidatePath("/checkout");

  return {
    ok: `Successfully added ${money(amountCents)} to your SNLRICH Wallet!`,
  };
}
