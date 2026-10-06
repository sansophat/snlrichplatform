import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { CategoryTable } from "./CategoryTable";
import { CategoryModal } from "./CategoryModal";
import { Layers, Package, Image as ImageIcon } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  await requireAdmin();

  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: {
        select: { products: true },
      },
    },
  });

  const totalProducts = categories.reduce((sum: number, c: { _count: { products: number } }) => sum + c._count.products, 0);
  const categoriesWithCustomImages = categories.filter((c: { imageUrl: string | null }) => Boolean(c.imageUrl)).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-black text-navy-900 tracking-tight">Product Categories</h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage storefront categories, icon pods, and product organization across SNLRICH.
          </p>
        </div>
        <CategoryModal />
      </div>

      {/* Metrics */}
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="card p-4 flex items-center gap-3 border border-slate-200">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-navy-50 text-navy-700">
            <Layers size={22} />
          </div>
          <div>
            <div className="text-xl font-black text-navy-900">{categories.length}</div>
            <div className="text-xs text-slate-500 font-medium">Active Categories</div>
          </div>
        </div>

        <div className="card p-4 flex items-center gap-3 border border-slate-200">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-sand-100 text-amber-800">
            <Package size={22} />
          </div>
          <div>
            <div className="text-xl font-black text-navy-900">{totalProducts}</div>
            <div className="text-xs text-slate-500 font-medium">Categorized Products</div>
          </div>
        </div>

        <div className="card p-4 flex items-center gap-3 border border-slate-200">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
            <ImageIcon size={22} />
          </div>
          <div>
            <div className="text-xl font-black text-navy-900">{categoriesWithCustomImages}</div>
            <div className="text-xs text-slate-500 font-medium">Custom Image Pods</div>
          </div>
        </div>
      </div>

      {/* Categories Table */}
      <CategoryTable categories={categories} />
    </div>
  );
}
