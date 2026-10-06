"use client";

import { useState, useActionState, useEffect } from "react";
import { adminSaveProductAction } from "@/app/actions/admin";
import type { FormState } from "@/app/actions/auth";
import { SubmitButton } from "@/components/SubmitButton";
import { ImageUploader } from "@/components/ImageUploader";
import { Plus, X, Package, Check, AlertCircle, Edit3 } from "lucide-react";

type ProductData = {
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
};

export function AdminProductModal({
  product,
  merchants,
  categories,
}: {
  product?: ProductData;
  merchants: { id: string; name: string }[];
  categories: { id: string; name: string; emoji: string }[];
}) {
  const [open, setOpen] = useState(false);
  const [state, action] = useActionState<FormState, FormData>(adminSaveProductAction, undefined);

  useEffect(() => {
    if (state?.ok) {
      const timer = setTimeout(() => {
        setOpen(false);
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [state?.ok]);

  const isEditing = !!product;

  return (
    <>
      {isEditing ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="btn btn-outline btn-sm !py-1 !px-2 text-xs"
        >
          <Edit3 size={12} className="mr-1" /> Edit
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="btn btn-primary btn-sm flex items-center gap-1.5 font-semibold"
        >
          <Plus size={16} /> Add Product
        </button>
      )}

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-in fade-in">
          <div className="card max-h-[90vh] w-full max-w-2xl overflow-y-auto p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Package size={20} className="text-navy-700" />
                <h3 className="text-lg font-bold text-navy-900">
                  {isEditing ? `Edit Product: ${product.name}` : "Create Marketplace Product"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={18} />
              </button>
            </div>

            <form action={action} className="mt-4 space-y-4">
              {product && <input type="hidden" name="id" value={product.id} />}

              {state?.error && (
                <div className="flex items-center gap-2 rounded-xl bg-red-50 p-3 text-xs font-medium text-red-700 border border-red-200">
                  <AlertCircle size={15} className="shrink-0" />
                  <span>{state.error}</span>
                </div>
              )}
              {state?.ok && (
                <div className="flex items-center gap-2 rounded-xl bg-emerald-50 p-3 text-xs font-medium text-emerald-800 border border-emerald-200">
                  <Check size={15} className="shrink-0" />
                  <span>{state.ok}</span>
                </div>
              )}

              {/* Merchant & Category pickers */}
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="label">Merchant Store *</label>
                  <select
                    name="merchantId"
                    required
                    defaultValue={product?.merchantId ?? ""}
                    className="input text-sm"
                  >
                    <option value="" disabled>Choose Store…</option>
                    {merchants.map((m) => (
                      <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="label">Category *</label>
                  <select
                    name="categoryId"
                    required
                    defaultValue={product?.categoryId ?? ""}
                    className="input text-sm"
                  >
                    <option value="" disabled>Choose Category…</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.emoji} {c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="label">Product Name *</label>
                <input
                  name="name"
                  required
                  defaultValue={product?.name ?? ""}
                  placeholder="e.g. Wireless Noise Canceling Headphones"
                  className="input text-sm"
                />
              </div>

              <div>
                <label className="label">Description</label>
                <textarea
                  name="description"
                  rows={3}
                  defaultValue={product?.description ?? ""}
                  placeholder="Key features, specifications, and warranty info..."
                  className="input text-sm"
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div>
                  <label className="label">Price ($) *</label>
                  <input
                    name="price"
                    required
                    inputMode="decimal"
                    defaultValue={product ? (product.priceCents / 100).toFixed(2) : ""}
                    placeholder="29.99"
                    className="input text-sm font-semibold"
                  />
                </div>
                <div>
                  <label className="label">Compare-at Price ($)</label>
                  <input
                    name="compareAt"
                    inputMode="decimal"
                    defaultValue={product?.compareAtCents ? (product.compareAtCents / 100).toFixed(2) : ""}
                    placeholder="39.99"
                    className="input text-sm"
                  />
                </div>
                <div>
                  <label className="label">Stock Units *</label>
                  <input
                    name="stock"
                    type="number"
                    min={0}
                    required
                    defaultValue={product?.stock ?? 10}
                    className="input text-sm"
                  />
                </div>
              </div>

              {/* Product Photo Upload */}
              <div>
                <ImageUploader
                  name="imageUrl"
                  label="Product Photo"
                  defaultValue={product?.imageUrl}
                  helpText="Upload a product photo (PNG, JPG, WEBP). No manual URL required."
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-2 pt-2 border-t border-slate-100">
                <div>
                  <label className="label">Approval Status</label>
                  <select
                    name="approvalStatus"
                    defaultValue={product?.approvalStatus ?? "APPROVED"}
                    className="input text-sm"
                  >
                    <option value="APPROVED">Approved (Visible to Buyers)</option>
                    <option value="PENDING">Pending Review</option>
                    <option value="REJECTED">Rejected</option>
                  </select>
                </div>

                <div className="flex flex-col justify-end gap-2 pb-1 text-xs">
                  <label className="flex items-center gap-2 cursor-pointer font-medium">
                    <input
                      type="checkbox"
                      name="active"
                      defaultChecked={product?.active ?? true}
                    />
                    <span>Active in Catalog</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer font-medium">
                    <input
                      type="checkbox"
                      name="featured"
                      defaultChecked={product?.featured ?? false}
                    />
                    <span>Featured on Homepage</span>
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="btn btn-outline btn-sm"
                >
                  Cancel
                </button>
                <SubmitButton className="btn btn-primary btn-sm" pendingText="Saving Product…">
                  {isEditing ? "Save Changes" : "Create Product"}
                </SubmitButton>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
