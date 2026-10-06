"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireMerchant, requireUser } from "@/lib/auth";
import { REWARDS } from "@/lib/config";
import { randomSuffix, slugify, toCents } from "@/lib/format";
import { changeOrderStatus } from "@/lib/orders";
import type { FormState } from "./auth";

export async function applyMerchantAction(_: FormState, fd: FormData): Promise<FormState> {
  const user = await requireUser();
  if (user.merchant) return { error: "You already have a merchant application." };
  const name = String(fd.get("name") ?? "").trim();
  if (name.length < 3) return { error: "Store name must be at least 3 characters." };
  const description = String(fd.get("description") ?? "").trim().slice(0, 500);
  const emoji = String(fd.get("emoji") ?? "🏪").trim().slice(0, 4) || "🏪";
  let slug = slugify(name);
  if (await prisma.merchant.findUnique({ where: { slug } })) slug = `${slug}-${randomSuffix(3)}`;
  await prisma.merchant.create({ data: { ownerId: user.id, name, slug, description, emoji } });
  revalidatePath("/become-merchant");
  return { ok: "Application submitted! An admin will review your store shortly." };
}

function readProduct(fd: FormData) {
  const compare = toCents(fd.get("compareAt"));
  return {
    name: String(fd.get("name") ?? "").trim(),
    description: String(fd.get("description") ?? "").trim(),
    priceCents: toCents(fd.get("price")),
    compareAtCents: compare > 0 ? compare : null,
    stock: Math.max(0, parseInt(String(fd.get("stock") ?? "0")) || 0),
    categoryId: String(fd.get("categoryId") ?? ""),
    imageUrl: String(fd.get("imageUrl") ?? "").trim() || null,
    active: fd.get("active") === "on",
    featured: fd.get("featured") === "on",
  };
}

export async function saveProductAction(_: FormState, fd: FormData): Promise<FormState> {
  const { merchant } = await requireMerchant();
  const id = String(fd.get("id") ?? "");
  const data = readProduct(fd);
  if (data.name.length < 2) return { error: "Product name is required." };
  if (data.priceCents <= 0) return { error: "Enter a price greater than 0." };
  if (!data.categoryId) return { error: "Choose a category." };
  if (data.imageUrl && !/^(\/|https?:\/\/)/.test(data.imageUrl)) {
    return { error: "Please upload an image or provide a valid URL." };
  }

  if (id) {
    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing || existing.merchantId !== merchant.id) return { error: "Product not found." };
    await prisma.product.update({
      where: { id },
      data: {
        ...data,
        approvalStatus: existing.approvalStatus === "REJECTED" ? "PENDING" : existing.approvalStatus,
      },
    });
  } else {
    await prisma.product.create({
      data: {
        ...data,
        merchantId: merchant.id,
        slug: `${slugify(data.name)}-${randomSuffix(4)}`,
        approvalStatus: "PENDING",
      },
    });
  }
  revalidatePath("/", "layout");
  redirect("/merchant-portal/products");
}

export async function updateStockAction(fd: FormData) {
  const { merchant } = await requireMerchant();
  const id = String(fd.get("id"));
  const stock = Math.max(0, parseInt(String(fd.get("stock"))) || 0);
  const p = await prisma.product.findUnique({ where: { id } });
  if (!p || p.merchantId !== merchant.id) return;
  await prisma.product.update({ where: { id }, data: { stock } });
  revalidatePath("/merchant-portal/products");
  revalidatePath("/merchant-portal");
}

export async function deleteProductAction(fd: FormData) {
  const { merchant } = await requireMerchant();
  const id = String(fd.get("id"));
  const p = await prisma.product.findUnique({ where: { id }, include: { _count: { select: { orderItems: true } } } });
  if (!p || p.merchantId !== merchant.id) return;
  // Products that were ordered are archived (kept for order history), others are deleted.
  if (p._count.orderItems > 0) await prisma.product.update({ where: { id }, data: { active: false } });
  else await prisma.product.delete({ where: { id } });
  revalidatePath("/", "layout");
}

export async function merchantOrderStatusAction(fd: FormData) {
  const { merchant } = await requireMerchant();
  try {
    await changeOrderStatus(String(fd.get("orderId")), String(fd.get("status")), { merchantId: merchant.id });
  } catch (e) {
    console.error(e);
  }
  revalidatePath("/", "layout");
}

export async function updateOrderTrackingAction(fd: FormData) {
  const { merchant } = await requireMerchant();
  const orderId = String(fd.get("orderId"));
  const carrier = String(fd.get("carrier") ?? "").trim();
  const trackingNumber = String(fd.get("trackingNumber") ?? "").trim();
  const merchantNotes = String(fd.get("merchantNotes") ?? "").trim();

  const o = await prisma.order.findUnique({ where: { id: orderId } });
  if (!o || o.merchantId !== merchant.id) return;

  await prisma.order.update({
    where: { id: orderId },
    data: {
      carrier: carrier || null,
      trackingNumber: trackingNumber || null,
      merchantNotes: merchantNotes || null,
    },
  });
  revalidatePath("/merchant-portal/orders");
}

export async function requestPayoutAction(_: FormState, fd: FormData): Promise<FormState> {
  const { merchant } = await requireMerchant();
  const amount = toCents(fd.get("amount"));
  const method = String(fd.get("method") ?? "BANK_TRANSFER").trim();
  const details = String(fd.get("details") ?? "").trim();
  const notes = String(fd.get("notes") ?? "").trim();

  if (amount < 1000) return { error: "Minimum payout request is $10.00." };
  if (amount > merchant.walletCents) {
    return { error: `Insufficient wallet balance. Available: $${(merchant.walletCents / 100).toFixed(2)}.` };
  }
  if (!details) return { error: "Please provide your payout receiving details (e.g. Bank Account or PayPal)." };

  await prisma.$transaction(async (tx) => {
    await tx.payoutRequest.create({
      data: {
        merchantId: merchant.id,
        amountCents: amount,
        method,
        details,
        notes: notes || null,
        status: "PENDING",
      },
    });
    await tx.merchant.update({
      where: { id: merchant.id },
      data: { walletCents: { decrement: amount } },
    });
  });

  revalidatePath("/merchant-portal/payments");
  return { ok: "Payout request submitted successfully. Admin will process it shortly." };
}

export async function saveMerchantSettingsAction(_: FormState, fd: FormData): Promise<FormState> {
  const { merchant } = await requireMerchant();
  const name = String(fd.get("name") ?? "").trim();
  if (name.length < 3) return { error: "Store name must be at least 3 characters." };
  const pointsRate = Math.max(0, Math.min(REWARDS.MAX_POINTS_RATE, parseInt(String(fd.get("pointsRate"))) || 0));
  const cashbackPct = Math.max(0, Math.min(REWARDS.MAX_CASHBACK_PCT, parseFloat(String(fd.get("cashbackPct"))) || 0));
  const logoUrl = String(fd.get("logoUrl") ?? "").trim() || null;
  const bannerUrl = String(fd.get("bannerUrl") ?? "").trim() || null;
  const phone = String(fd.get("phone") ?? "").trim() || null;
  const address = String(fd.get("address") ?? "").trim() || null;
  const payoutMethod = String(fd.get("payoutMethod") ?? "").trim() || null;
  const payoutDetails = String(fd.get("payoutDetails") ?? "").trim() || null;

  await prisma.merchant.update({
    where: { id: merchant.id },
    data: {
      name,
      description: String(fd.get("description") ?? "").slice(0, 500),
      emoji: String(fd.get("emoji") ?? "🏪").slice(0, 4) || "🏪",
      logoUrl,
      bannerUrl,
      phone,
      address,
      payoutMethod,
      payoutDetails,
      pointsRate,
      cashbackPct,
    },
  });
  revalidatePath("/", "layout");
  return { ok: "Store settings saved successfully." };
}
