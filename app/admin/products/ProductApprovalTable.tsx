"use client";

import { useState } from "react";
import Image from "next/image";
import { money, dateFmt } from "@/lib/format";
import { reviewProductAction, adminDeleteProductAction } from "@/app/actions/admin";
import { SubmitButton } from "@/components/SubmitButton";
import { AdminProductModal } from "./AdminProductModal";
import {
  Check, X, Eye, Package, Sparkles, Store, Search,
  AlertTriangle, CheckCircle, ShieldCheck
} from "lucide-react";

type ProductRow = {
  id: string;
  name: string;
  description: string;
  priceCents: number;
  compareAtCents: number | null;
  stock: number;
  imageUrl: string | null;
  categoryId: string;
  merchantId: string;
  active: boolean;
  featured: boolean;
  approvalStatus: string;
  approvalNotes: string | null;
  createdAt: Date;
  merchant: { id: string; name: string; slug: string; emoji: string };
  category: { id: string; name: string; emoji: string };
};

export function ProductApprovalTable({
  products,
  merchants,
  categories,
}: {
  products: ProductRow[];
  merchants: { id: string; name: string }[];
  categories: { id: string; name: string; emoji: string }[];
}) {
  const [filter, setFilter] = useState<string>("ALL");
  const [search, setSearch] = useState<string>("");
  const [rejectingId, setRejectingId] = useState<string | null>(null);

  const filtered = products.filter((p) => {
    const matchesFilter =
      filter === "ALL"
        ? true
        : filter === "PENDING"
        ? p.approvalStatus === "PENDING"
        : filter === "APPROVED"
        ? p.approvalStatus === "APPROVED"
        : filter === "REJECTED"
        ? p.approvalStatus === "REJECTED"
        : true;

    const q = search.toLowerCase();
    const matchesSearch =
      !q ||
      p.name.toLowerCase().includes(q) ||
      p.merchant.name.toLowerCase().includes(q) ||
      p.category.name.toLowerCase().includes(q);

    return matchesFilter && matchesSearch;
  });

  const pendingCount = products.filter((p) => p.approvalStatus === "PENDING").length;

  return (
    <div className="space-y-4">
      {/* Search & Filter Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-1.5 rounded-xl bg-slate-100 p-1 text-xs font-semibold">
          {[
            { id: "ALL", label: `All (${products.length})` },
            { id: "PENDING", label: `Pending Review (${pendingCount})` },
            { id: "APPROVED", label: `Approved (${products.filter((p) => p.approvalStatus === "APPROVED").length})` },
            { id: "REJECTED", label: `Rejected (${products.filter((p) => p.approvalStatus === "REJECTED").length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`rounded-lg px-3 py-1.5 transition ${
                filter === tab.id
                  ? "bg-white text-navy-900 shadow-xs"
                  : "text-slate-600 hover:text-navy-900"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative">
          <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search products or stores..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input !py-1.5 pl-8 text-xs max-w-xs"
          />
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-x-auto border border-slate-200/90 shadow-xs">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs font-bold text-slate-600">
            <tr>
              <th className="th">Product</th>
              <th className="th">Merchant Store</th>
              <th className="th">Category</th>
              <th className="th">Price / Stock</th>
              <th className="th">Approval Status</th>
              <th className="th text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((p) => {
              const statusTone =
                p.approvalStatus === "APPROVED"
                  ? "bg-emerald-100 text-emerald-800"
                  : p.approvalStatus === "PENDING"
                  ? "bg-amber-100 text-amber-800 font-bold animate-pulse"
                  : "bg-red-100 text-red-800";

              return (
                <tr key={p.id} className="hover:bg-slate-50/60 transition">
                  {/* Product info */}
                  <td className="td">
                    <div className="flex items-center gap-3">
                      <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
                        {p.imageUrl ? (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img src={p.imageUrl} alt={p.name} className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-lg">{p.category.emoji}</div>
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-navy-900">{p.name}</p>
                        <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-0.5">
                          <span>{p.active ? "Active" : "Hidden"}</span>
                          {p.featured && (
                            <span className="inline-flex items-center gap-0.5 text-gold-600 font-bold">
                              · <Sparkles size={11} /> Featured
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Merchant */}
                  <td className="td">
                    <span className="inline-flex items-center gap-1.5 font-medium text-slate-800">
                      <span>{p.merchant.emoji}</span>
                      <span>{p.merchant.name}</span>
                    </span>
                  </td>

                  {/* Category */}
                  <td className="td text-slate-600">
                    {p.category.emoji} {p.category.name}
                  </td>

                  {/* Price & Stock */}
                  <td className="td">
                    <div className="font-bold text-navy-900">{money(p.priceCents)}</div>
                    <div className={`text-xs ${p.stock <= 5 ? "font-bold text-red-600" : "text-slate-400"}`}>
                      {p.stock} units
                    </div>
                  </td>

                  {/* Approval Status Badge */}
                  <td className="td">
                    <span className={`badge ${statusTone}`}>
                      {p.approvalStatus}
                    </span>
                    {p.approvalNotes && (
                      <p className="mt-1 text-[11px] text-slate-400 max-w-xs truncate" title={p.approvalNotes}>
                        {p.approvalNotes}
                      </p>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="td text-right">
                    <div className="flex flex-wrap items-center justify-end gap-1.5">
                      {/* Approve button (if pending or rejected) */}
                      {p.approvalStatus !== "APPROVED" && (
                        <form action={reviewProductAction}>
                          <input type="hidden" name="productId" value={p.id} />
                          <input type="hidden" name="status" value="APPROVED" />
                          <input type="hidden" name="notes" value="Approved by marketplace administrator" />
                          <SubmitButton className="btn btn-outline btn-sm !py-1 !px-2.5 text-xs text-emerald-700 border-emerald-300 hover:bg-emerald-50" pendingText="…">
                            <Check size={12} className="mr-1" /> Approve
                          </SubmitButton>
                        </form>
                      )}

                      {/* Reject button */}
                      {p.approvalStatus !== "REJECTED" && (
                        <button
                          type="button"
                          onClick={() => setRejectingId(rejectingId === p.id ? null : p.id)}
                          className="btn btn-outline btn-sm !py-1 !px-2 text-xs text-red-600 border-red-300 hover:bg-red-50"
                        >
                          Reject
                        </button>
                      )}

                      {/* Edit Modal */}
                      <AdminProductModal
                        product={p}
                        merchants={merchants}
                        categories={categories}
                      />

                      {/* Delete Action */}
                      <form action={adminDeleteProductAction}>
                        <input type="hidden" name="id" value={p.id} />
                        <SubmitButton className="btn btn-danger btn-sm !py-1 !px-2 text-xs" pendingText="…">
                          <X size={12} />
                        </SubmitButton>
                      </form>
                    </div>

                    {/* Inline Rejection Reason Form */}
                    {rejectingId === p.id && (
                      <form action={reviewProductAction} className="mt-2 text-left bg-slate-50 p-2.5 rounded-lg border border-red-200 max-w-xs ml-auto">
                        <input type="hidden" name="productId" value={p.id} />
                        <input type="hidden" name="status" value="REJECTED" />
                        <label className="text-[11px] font-semibold text-slate-700 block mb-1">Reason for Rejection</label>
                        <input
                          name="notes"
                          placeholder="e.g. Inappropriate photo, misleading title..."
                          className="input !py-1 text-xs mb-1.5 w-full"
                          required
                        />
                        <div className="flex justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setRejectingId(null)}
                            className="btn btn-outline btn-sm !py-0.5 !px-2 text-xs"
                          >
                            Cancel
                          </button>
                          <SubmitButton className="btn btn-danger btn-sm !py-0.5 !px-2 text-xs" pendingText="…">
                            Confirm Reject
                          </SubmitButton>
                        </div>
                      </form>
                    )}
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="td text-center text-slate-400 py-10">
                  No products found matching the criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
