import { prisma } from "@/lib/db";
import { requireMerchant } from "@/lib/auth";
import { ProductForm } from "../ProductForm";

export const dynamic = "force-dynamic";
export const metadata = { title: "New product" };

export default async function NewProduct() {
  await requireMerchant();
  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-navy-900">New product</h1>
      <ProductForm categories={categories} />
    </div>
  );
}
