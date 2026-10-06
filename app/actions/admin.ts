"use server";

import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { changeOrderStatus } from "@/lib/orders";
import { randomSuffix, slugify, toCents } from "@/lib/format";
import type { FormState } from "./auth";

export async function setMerchantStatusAction(fd: FormData) {
  await requireAdmin();
  const id = String(fd.get("id"));
  const status = String(fd.get("status"));
  if (!["ACTIVE", "SUSPENDED", "PENDING"].includes(status)) return;
  const m = await prisma.merchant.update({ where: { id }, data: { status } });
  const owner = await prisma.user.findUnique({ where: { id: m.ownerId } });
  if (owner && owner.role !== "ADMIN") {
    await prisma.user.update({ where: { id: owner.id }, data: { role: status === "ACTIVE" ? "MERCHANT" : "CUSTOMER" } });
  }
  revalidatePath("/", "layout");
}

export async function setCommissionAction(fd: FormData) {
  await requireAdmin();
  const pct = Math.max(0, Math.min(50, parseFloat(String(fd.get("commission"))) || 0));
  await prisma.merchant.update({ where: { id: String(fd.get("id")) }, data: { commissionPct: pct } });
  revalidatePath("/admin/merchants");
}

export async function adjustRewardsAction(fd: FormData) {
  await requireAdmin();
  const userId = String(fd.get("userId"));
  const points = parseInt(String(fd.get("points"))) || 0;
  const cash = toCents(fd.get("cash"));
  const note = String(fd.get("note") ?? "Manual adjustment").slice(0, 200) || "Manual adjustment";
  if (!points && !cash) return;
  await prisma.$transaction(async (tx) => {
    if (points) await tx.transaction.create({ data: { userId, type: "POINTS", amount: points, reason: "ADJUST", note } });
    if (cash) await tx.transaction.create({ data: { userId, type: "CASH", amount: cash, reason: "ADJUST", note } });
    await tx.user.update({ where: { id: userId }, data: { points: { increment: points }, walletCents: { increment: cash } } });
  });
  revalidatePath("/admin/users");
}

export async function adminOrderStatusAction(fd: FormData) {
  await requireAdmin();
  try {
    await changeOrderStatus(String(fd.get("orderId")), String(fd.get("status")));
  } catch (e) {
    console.error(e);
  }
  revalidatePath("/admin/orders");
}

export async function createCouponAction(_: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin();
  const code = String(fd.get("code") ?? "").trim().toUpperCase();
  const percentOff = parseInt(String(fd.get("percentOff"))) || 0;
  if (!/^[A-Z0-9_-]{3,20}$/.test(code)) return { error: "Code must be 3-20 letters/numbers." };
  if (percentOff < 1 || percentOff > 90) return { error: "Percent off must be between 1 and 90." };
  if (await prisma.coupon.findUnique({ where: { code } })) return { error: "That code already exists." };
  const uses = String(fd.get("usesLeft") ?? "").trim();
  await prisma.coupon.create({
    data: {
      code,
      percentOff,
      minSubtotalCents: toCents(fd.get("minSubtotal")),
      usesLeft: uses ? Math.max(1, parseInt(uses) || 1) : null,
    },
  });
  revalidatePath("/admin/coupons");
  return { ok: `Coupon ${code} created.` };
}

export async function toggleCouponAction(fd: FormData) {
  await requireAdmin();
  const id = String(fd.get("id"));
  const c = await prisma.coupon.findUnique({ where: { id } });
  if (c) await prisma.coupon.update({ where: { id }, data: { active: !c.active } });
  revalidatePath("/admin/coupons");
}

export async function updatePlatformSettingsAction(_: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin();
  try {
    const siteName = String(fd.get("siteName") ?? "").trim() || "SNLRICH";
    const siteTagline = String(fd.get("siteTagline") ?? "").trim() || "SHOP · EARN · REPEAT";
    const supportPhone = String(fd.get("supportPhone") ?? "").trim() || "(123) 456-7890";
    const currencySymbol = String(fd.get("currencySymbol") ?? "").trim() || "$";
    const logoUrl = String(fd.get("logoUrl") ?? "").trim() || null;
    const logoLightUrl = String(fd.get("logoLightUrl") ?? "").trim() || null;

    const signupBonusPoints = Math.max(0, parseInt(String(fd.get("signupBonusPoints"))) || 0);
    const referredBonusPoints = Math.max(0, parseInt(String(fd.get("referredBonusPoints"))) || 0);
    const referrerBonusPoints = Math.max(0, parseInt(String(fd.get("referrerBonusPoints"))) || 0);
    const pointValueCents = Math.max(1, parseInt(String(fd.get("pointValueCents"))) || 1);

    const freeShippingCents = toCents(fd.get("freeShipping"));
    const flatShippingCents = toCents(fd.get("flatShipping"));

    await prisma.platformSetting.upsert({
      where: { id: "global" },
      create: {
        id: "global",
        siteName,
        siteTagline,
        supportPhone,
        currencySymbol,
        logoUrl,
        logoLightUrl,
        signupBonusPoints,
        referredBonusPoints,
        referrerBonusPoints,
        pointValueCents,
        freeShippingCents: Math.max(0, freeShippingCents),
        flatShippingCents: Math.max(0, flatShippingCents),
      },
      update: {
        siteName,
        siteTagline,
        supportPhone,
        currencySymbol,
        logoUrl,
        logoLightUrl,
        signupBonusPoints,
        referredBonusPoints,
        referrerBonusPoints,
        pointValueCents,
        freeShippingCents: Math.max(0, freeShippingCents),
        flatShippingCents: Math.max(0, flatShippingCents),
      },
    });

    revalidatePath("/", "layout");
    revalidatePath("/admin/settings");
    return { ok: "Platform settings updated successfully." };
  } catch (err: unknown) {
    console.error("Failed to update settings:", err);
    return { error: "Failed to update platform settings. Please try again." };
  }
}

export async function createMerchantAction(_: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin();
  const storeName = String(fd.get("name") ?? "").trim();
  const ownerName = String(fd.get("ownerName") ?? "").trim();
  const ownerEmail = String(fd.get("email") ?? "").trim().toLowerCase();
  const password = String(fd.get("password") ?? "");
  const description = String(fd.get("description") ?? "").trim().slice(0, 500);
  const emoji = String(fd.get("emoji") ?? "🏪").trim().slice(0, 4) || "🏪";
  const commissionPct = Math.max(0, Math.min(50, parseFloat(String(fd.get("commissionPct"))) || 10));
  const pointsRate = Math.max(0, parseInt(String(fd.get("pointsRate"))) || 2);
  const cashbackPct = Math.max(0, parseFloat(String(fd.get("cashbackPct"))) || 3);

  if (storeName.length < 2) return { error: "Store name must be at least 2 characters." };
  if (!ownerEmail || !ownerEmail.includes("@")) return { error: "Valid owner email is required." };
  if (password.length < 8) return { error: "Initial password must be at least 8 characters." };

  let owner = await prisma.user.findUnique({ where: { email: ownerEmail }, include: { merchant: true } });
  if (owner?.merchant) {
    return { error: "A merchant store already exists for this email address." };
  }

  let slug = slugify(storeName);
  if (await prisma.merchant.findUnique({ where: { slug } })) {
    slug = `${slug}-${randomSuffix(4)}`;
  }

  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.$transaction(async (tx) => {
    if (!owner) {
      owner = await tx.user.create({
        data: {
          email: ownerEmail,
          name: ownerName || `${storeName} Owner`,
          passwordHash,
          role: "MERCHANT",
          referralCode: `SNL${slug.slice(0, 5).toUpperCase().replace(/-/g, "")}${randomSuffix(3).toUpperCase()}`,
          kycStatus: "BYPASSED",
        },
        include: { merchant: true },
      });
    } else {
      await tx.user.update({
        where: { id: owner.id },
        data: { role: "MERCHANT", passwordHash, kycStatus: "BYPASSED" },
      });
    }

    await tx.merchant.create({
      data: {
        ownerId: owner.id,
        name: storeName,
        slug,
        description,
        emoji,
        status: "ACTIVE",
        commissionPct,
        pointsRate,
        cashbackPct,
      },
    });
  });

  revalidatePath("/admin/merchants");
  return { ok: `Merchant "${storeName}" created successfully! Owner login: ${ownerEmail}` };
}

export async function reviewKycAction(fd: FormData) {
  await requireAdmin();
  const userId = String(fd.get("userId"));
  const status = String(fd.get("status"));
  const notes = String(fd.get("notes") ?? "").trim();
  if (!["VERIFIED", "REJECTED"].includes(status)) return;

  await prisma.user.update({
    where: { id: userId },
    data: {
      kycStatus: status,
      kycNotes: notes || (status === "VERIFIED" ? "Approved by compliance" : "Document rejected"),
      kycReviewedAt: new Date(),
    },
  });
  revalidatePath("/admin/kyc");
  revalidatePath("/admin/users");
}

export async function bypassKycAction(fd: FormData) {
  await requireAdmin();
  const userId = String(fd.get("userId"));
  await prisma.user.update({
    where: { id: userId },
    data: {
      kycStatus: "BYPASSED",
      kycNotes: "Bypassed and approved by administrator",
      kycReviewedAt: new Date(),
    },
  });
  revalidatePath("/admin/kyc");
  revalidatePath("/admin/users");
}

export async function reviewPayoutAction(fd: FormData) {
  await requireAdmin();
  const id = String(fd.get("id"));
  const status = String(fd.get("status"));
  const notes = String(fd.get("notes") ?? "").trim();
  if (!["APPROVED", "PAID", "REJECTED"].includes(status)) return;

  const payout = await prisma.payoutRequest.findUnique({ where: { id } });
  if (!payout) return;

  await prisma.$transaction(async (tx) => {
    await tx.payoutRequest.update({
      where: { id },
      data: { status, notes: notes || null },
    });
    // If rejected, return funds to merchant wallet
    if (status === "REJECTED" && payout.status !== "REJECTED") {
      await tx.merchant.update({
        where: { id: payout.merchantId },
        data: { walletCents: { increment: payout.amountCents } },
      });
    }
  });
  revalidatePath("/admin/payouts");
}

export async function reviewProductAction(fd: FormData) {
  await requireAdmin();
  const productId = String(fd.get("productId"));
  const status = String(fd.get("status"));
  const notes = String(fd.get("notes") ?? "").trim();
  if (!["APPROVED", "REJECTED"].includes(status)) return;

  await prisma.product.update({
    where: { id: productId },
    data: {
      approvalStatus: status,
      approvalNotes: notes || (status === "APPROVED" ? "Approved by marketplace admin" : "Product rejected by compliance"),
    },
  });
  revalidatePath("/admin/products");
  revalidatePath("/merchant-portal/products");
  revalidatePath("/", "layout");
}

export async function adminSaveProductAction(_: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin();
  const id = String(fd.get("id") ?? "");
  const merchantId = String(fd.get("merchantId") ?? "");
  const categoryId = String(fd.get("categoryId") ?? "");
  const name = String(fd.get("name") ?? "").trim();
  const description = String(fd.get("description") ?? "").trim();
  const priceCents = toCents(fd.get("price"));
  const compare = toCents(fd.get("compareAt"));
  const compareAtCents = compare > 0 ? compare : null;
  const stock = Math.max(0, parseInt(String(fd.get("stock") ?? "0")) || 0);
  const imageUrl = String(fd.get("imageUrl") ?? "").trim() || null;
  const active = fd.get("active") === "on";
  const featured = fd.get("featured") === "on";
  const approvalStatus = String(fd.get("approvalStatus") ?? "APPROVED");

  if (!merchantId) return { error: "Please select a merchant store." };
  if (!categoryId) return { error: "Please select a product category." };
  if (name.length < 2) return { error: "Product name is required." };
  if (priceCents <= 0) return { error: "Enter a valid price greater than 0." };

  if (id) {
    await prisma.product.update({
      where: { id },
      data: {
        merchantId,
        categoryId,
        name,
        description,
        priceCents,
        compareAtCents,
        stock,
        imageUrl,
        active,
        featured,
        approvalStatus,
      },
    });
  } else {
    let slug = slugify(name);
    if (await prisma.product.findUnique({ where: { slug } })) {
      slug = `${slug}-${randomSuffix(4)}`;
    }
    await prisma.product.create({
      data: {
        merchantId,
        categoryId,
        name,
        slug,
        description,
        priceCents,
        compareAtCents,
        stock,
        imageUrl,
        active,
        featured,
        approvalStatus,
      },
    });
  }

  revalidatePath("/admin/products");
  revalidatePath("/", "layout");
  return { ok: `Product "${name}" saved successfully.` };
}

export async function adminDeleteProductAction(fd: FormData) {
  await requireAdmin();
  const id = String(fd.get("id"));
  const p = await prisma.product.findUnique({ where: { id }, include: { _count: { select: { orderItems: true } } } });
  if (!p) return;
  if (p._count.orderItems > 0) {
    await prisma.product.update({ where: { id }, data: { active: false } });
  } else {
    await prisma.product.delete({ where: { id } });
  }
  revalidatePath("/admin/products");
  revalidatePath("/", "layout");
}

export async function saveCategoryAction(_: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin();
  const id = String(fd.get("id") ?? "");
  const name = String(fd.get("name") ?? "").trim();
  const emoji = String(fd.get("emoji") ?? "🛍️").trim().slice(0, 4) || "🛍️";
  const imageUrl = String(fd.get("imageUrl") ?? "").trim() || null;

  if (name.length < 2) return { error: "Category name must be at least 2 characters." };

  let slug = slugify(name);
  if (id) {
    const existing = await prisma.category.findUnique({ where: { id } });
    if (!existing) return { error: "Category not found." };
    await prisma.category.update({
      where: { id },
      data: { name, emoji, imageUrl },
    });
  } else {
    if (await prisma.category.findUnique({ where: { slug } })) {
      slug = `${slug}-${randomSuffix(3)}`;
    }
    await prisma.category.create({
      data: { name, slug, emoji, imageUrl },
    });
  }

  revalidatePath("/admin/categories");
  revalidatePath("/", "layout");
  return { ok: `Category "${name}" saved successfully.` };
}

export async function deleteCategoryAction(fd: FormData) {
  await requireAdmin();
  const id = String(fd.get("id"));
  const cat = await prisma.category.findUnique({ where: { id }, include: { _count: { select: { products: true } } } });
  if (!cat) return;
  if (cat._count.products > 0) {
    return;
  }
  await prisma.category.delete({ where: { id } });
  revalidatePath("/admin/categories");
  revalidatePath("/", "layout");
}


