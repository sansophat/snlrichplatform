import Link from "next/link";
import Image from "next/image";
import { requireMerchant } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { money } from "@/lib/format";
import { deleteProductAction, updateStockAction } from "@/app/actions/merchant";
import { SubmitButton } from "@/components/SubmitButton";
import { Plus, AlertTriangle, Check, Package, Sparkles } from "lucide-react";

export const dynamic = "force-dynamic";
export const metadata = { title: "Products & Inventory | Merchant Portal" };

export default async function MerchantProducts() {
  const { merchant } = await requireMerchant();
  const products = await prisma.product.findMany({
    where: { merchantId: merchant.id },
    include: { category: true },
    orderBy: { createdAt: "desc" },
  });

  const totalStock = products.reduce((acc, p) => acc + p.stock, 0);
  const lowStockCount = products.filter((p) => p.stock > 0 && p.stock <= 5).length;
  const outOfStockCount = products.filter((p) => p.stock === 0).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">Products & Inventory</h1>
          <p className="text-xs text-slate-500">Manage catalog, pricing, quick stock levels, and store visibility.</p>
        </div>
        <Link href="/merchant-portal/products/new" className="btn btn-primary btn-sm flex items-center gap-1.5 self-start">
          <Plus size={15} /> Add product
        </Link>
      </div>

      {/* Stock Summary Metrics */}
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Products</p>
          <p className="mt-1 text-2xl font-black text-navy-900">{products.length} <span className="text-xs font-normal text-slate-500">({totalStock} units in stock)</span></p>
        </div>
        <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-4 shadow-xs">
          <p className="text-xs font-semibold uppercase tracking-wider text-amber-700">Low Stock Alert</p>
          <p className="mt-1 text-2xl font-black text-amber-900">{lowStockCount} <span className="text-xs font-normal text-amber-700">products (≤ 5 units)</span></p>
        </div>
        <div className="rounded-xl border border-red-200 bg-red-50/50 p-4 shadow-xs">
          <p className="text-xs font-semibold uppercase tracking-wider text-red-700">Out of Stock</p>
          <p className="mt-1 text-2xl font-black text-red-900">{outOfStockCount} <span className="text-xs font-normal text-red-700">products</span></p>
        </div>
      </div>

      <div className="card overflow-x-auto shadow-xs border border-slate-200/90">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50/80 text-xs font-bold text-slate-600">
            <tr>
              <th className="th">Product</th>
              <th className="th">Category</th>
              <th className="th">Price</th>
              <th className="th">Stock Level</th>
              <th className="th">Status</th>
              <th className="th text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {products.map((p) => (
              <tr key={p.id} className="hover:bg-slate-50/60 transition">
                <td className="td">
                  <div className="flex items-center gap-3">
                    <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
                      {p.imageUrl ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img src={p.imageUrl} alt={p.name} className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-base">{p.category.emoji}</div>
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-navy-900">{p.name}</p>
                      {p.featured && <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-gold-600"><Sparkles size={10} /> Featured</span>}
                    </div>
                  </div>
                </td>
                <td className="td text-slate-500">{p.category.name}</td>
                <td className="td font-semibold text-slate-900">
                  {money(p.priceCents)}
                  {p.compareAtCents && (
                    <span className="block text-[11px] text-slate-400 line-through">{money(p.compareAtCents)}</span>
                  )}
                </td>
                <td className="td">
                  <form action={updateStockAction} className="flex items-center gap-1.5">
                    <input type="hidden" name="id" value={p.id} />
                    <input
                      name="stock"
                      type="number"
                      min={0}
                      defaultValue={p.stock}
                      className={`input w-20 !py-1 text-xs font-semibold ${
                        p.stock === 0 ? "border-red-300 bg-red-50 text-red-700" : p.stock <= 5 ? "border-amber-300 bg-amber-50 text-amber-800" : ""
                      }`}
                    />
                    <SubmitButton className="btn btn-outline btn-sm !py-1 !px-2 text-xs" pendingText="…">
                      Update
                    </SubmitButton>
                  </form>
                  {p.stock === 0 && <span className="mt-1 inline-block text-[10px] font-bold text-red-600">Out of stock</span>}
                </td>
                <td className="td">
                  <span className={`badge ${p.active ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-600"}`}>
                    {p.active ? "Active" : "Hidden"}
                  </span>
                </td>
                <td className="td text-right">
                  <div className="flex justify-end gap-2">
                    <Link href={`/merchant-portal/products/${p.id}`} className="btn btn-outline btn-sm">Edit</Link>
                    <form action={deleteProductAction}>
                      <input type="hidden" name="id" value={p.id} />
                      <SubmitButton className="btn btn-danger btn-sm" pendingText="…">Delete</SubmitButton>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr>
                <td className="td text-center text-slate-500 py-10" colSpan={6}>
                  <Package size={32} className="mx-auto mb-2 opacity-40 text-slate-400" />
                  No products in your store yet. Click <b>+ Add product</b> above to create your first item!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
