import { Prisma } from "@prisma/client";

export const productInclude = {
  merchant: { select: { id: true, name: true, slug: true, emoji: true, pointsRate: true, cashbackPct: true } },
  category: { select: { name: true, slug: true, emoji: true } },
  reviews: { select: { rating: true } },
} satisfies Prisma.ProductInclude;

export type ProductWithMeta = Prisma.ProductGetPayload<{ include: typeof productInclude }>;

/** Only products that can actually be bought (active product, approved by admin, active merchant). */
export const visibleProduct = { active: true, approvalStatus: "APPROVED", merchant: { status: "ACTIVE" } } satisfies Prisma.ProductWhereInput;
