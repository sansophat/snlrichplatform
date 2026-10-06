"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getCurrentUser, requireUser } from "@/lib/auth";
import { CheckoutError, createOrders } from "@/lib/orders";

const checkoutSchema = z.object({
  items: z.array(z.object({ productId: z.string(), quantity: z.number().int().min(1).max(99) })).min(1),
  shippingName: z.string().trim().min(2, "Enter the recipient name"),
  shippingPhone: z.string().trim().min(6, "Enter a phone number"),
  shippingAddress: z.string().trim().min(8, "Enter a full delivery address"),
  paymentMethod: z.enum(["COD", "CARD", "BANK", "WALLET", "POINTS"]),
  usePoints: z.boolean(),
  useWallet: z.boolean(),
  couponCode: z.string().optional(),
});

export async function placeOrderAction(payload: unknown): Promise<{ error?: string; groupId?: string }> {
  const user = await getCurrentUser();
  if (!user) return { error: "Please sign in to check out." };
  const parsed = checkoutSchema.safeParse(payload);
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  try {
    const groupId = await createOrders(user.id, parsed.data);
    revalidatePath("/account", "layout");
    return { groupId };
  } catch (e) {
    if (e instanceof CheckoutError) return { error: e.message };
    console.error(e);
    return { error: "Something went wrong placing your order. Please try again." };
  }
}

export async function toggleWishlist(formData: FormData) {
  const user = await requireUser();
  const productId = String(formData.get("productId"));
  const existing = await prisma.wishlistItem.findUnique({ where: { userId_productId: { userId: user.id, productId } } });
  if (existing) await prisma.wishlistItem.delete({ where: { id: existing.id } });
  else await prisma.wishlistItem.create({ data: { userId: user.id, productId } });
  revalidatePath("/", "layout");
}

export async function submitReview(formData: FormData) {
  const user = await requireUser();
  const productId = String(formData.get("productId"));
  const slug = String(formData.get("slug"));
  const rating = Math.max(1, Math.min(5, Number(formData.get("rating")) || 5));
  const body = String(formData.get("body") ?? "").slice(0, 1000);

  const purchased = await prisma.orderItem.findFirst({
    where: { productId, order: { userId: user.id, status: "DELIVERED" } },
  });
  if (!purchased) redirect(`/product/${slug}?review=denied#reviews`);

  await prisma.review.upsert({
    where: { userId_productId: { userId: user.id, productId } },
    update: { rating, body },
    create: { userId: user.id, productId, rating, body },
  });
  revalidatePath(`/product/${slug}`);
  redirect(`/product/${slug}#reviews`);
}

export async function cancelMyOrder(formData: FormData) {
  const user = await requireUser();
  const id = String(formData.get("orderId"));
  const order = await prisma.order.findUnique({ where: { id } });
  if (!order || order.userId !== user.id || !["PENDING"].includes(order.status)) return;
  const { changeOrderStatus } = await import("@/lib/orders");
  await changeOrderStatus(id, "CANCELLED");
  revalidatePath("/account", "layout");
}
