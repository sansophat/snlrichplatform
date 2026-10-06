import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { ProductApprovalTable } from "./ProductApprovalTable";
import { AdminProductModal } from "./AdminProductModal";
import { Package, CheckCircle, Clock, AlertTriangle, Plus } from "lucide-react";

export const dynamic = "force-dynamic";
export const metadata = { title: "Product Reviews & Approval | SNLRICH Admin" };

export default async function AdminProductsPage() {
  await requireAdmin();

  const [products, merchants, categories] = await Promise.all([
    prisma.product.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        merchant: { select: { id: true, name: true, slug: true, emoji: true } },
        category: { select: { id: true, name: true, emoji: true } },
      },
    }),
    prisma.merchant.findMany({
      where: { status: "ACTIVE" },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    prisma.category.findMany({
      select: { id: true, name: true, emoji: true },
      orderBy: { name: "asc" },
    }),
  ]);

  const pendingCount = products.filter((p) => p.approvalStatus === "PENDING").length;
  const approvedCount = products.filter((p) => p.approvalStatus === "APPROVED").length;
  const outOfStockCount = products.filter((p) => p.stock === 0).length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-navy-900">Products & Catalog Approval</h1>
            {pendingCount > 0 && (
              <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-bold text-amber-800 animate-pulse">
                {pendingCount} Pending Review
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Review, approve or reject products submitted by marketplace merchants, or add new catalog items directly.
          </p>
        </div>

        <AdminProductModal
          merchants={merchants}
          categories={categories}
        />
      </div>

      {/* Metrics Row */}
      <div className="grid gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Products</p>
          <p className="mt-1 text-2xl font-black text-navy-900">{products.length}</p>
        </div>
        <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-4 shadow-xs">
          <p className="text-xs font-bold uppercase tracking-wider text-amber-700">Pending Review</p>
          <p className="mt-1 text-2xl font-black text-amber-950">{pendingCount}</p>
        </div>
        <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-4 shadow-xs">
          <p className="text-xs font-bold uppercase tracking-wider text-emerald-700">Approved & Live</p>
          <p className="mt-1 text-2xl font-black text-emerald-950">{approvedCount}</p>
        </div>
        <div className="rounded-xl border border-red-200 bg-red-50/60 p-4 shadow-xs">
          <p className="text-xs font-bold uppercase tracking-wider text-red-700">Out of Stock</p>
          <p className="mt-1 text-2xl font-black text-red-950">{outOfStockCount}</p>
        </div>
      </div>

      {/* Product Table */}
      <ProductApprovalTable
        products={products}
        merchants={merchants}
        categories={categories}
      />
    </div>
  );
}
