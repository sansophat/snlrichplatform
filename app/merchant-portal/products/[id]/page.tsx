import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireMerchant } from "@/lib/auth";
import { ProductForm } from "../ProductForm";

export const dynamic = "force-dynamic";
export const metadata = { title: "Edit product" };

export default async function EditProduct({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { merchant } = await requireMerchant();
  const [product, categories] = await Promise.all([
    prisma.product.findUnique({ where: { id } }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);
  if (!product || product.merchantId !== merchant.id) notFound();
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-navy-900">Edit product</h1>
      <ProductForm product={product} categories={categories} />
    </div>
  );
}
