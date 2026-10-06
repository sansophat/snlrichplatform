"use client";

import { useActionState } from "react";
import { saveProductAction } from "@/app/actions/merchant";
import type { FormState } from "@/app/actions/auth";
import { SubmitButton } from "@/components/SubmitButton";
import { ImageUploader } from "@/components/ImageUploader";

type Product = {
  id: string;
  name: string;
  description: string;
  priceCents: number;
  compareAtCents: number | null;
  stock: number;
  categoryId: string;
  imageUrl: string | null;
  active: boolean;
  featured: boolean;
};

export function ProductForm({ product, categories }: { product?: Product; categories: { id: string; name: string }[] }) {
  const [state, action] = useActionState<FormState, FormData>(saveProductAction, undefined);
  return (
    <form action={action} className="card max-w-2xl space-y-4 p-6">
      {product && <input type="hidden" name="id" value={product.id} />}
      <div><label className="label">Name</label><input name="name" required defaultValue={product?.name} className="input" /></div>
      <div><label className="label">Description</label><textarea name="description" rows={4} defaultValue={product?.description} className="input" /></div>
      <div className="grid gap-4 sm:grid-cols-3">
        <div><label className="label">Price</label><input name="price" required inputMode="decimal" defaultValue={product ? (product.priceCents / 100).toFixed(2) : ""} className="input" /></div>
        <div><label className="label">Compare-at price</label><input name="compareAt" inputMode="decimal" defaultValue={product?.compareAtCents ? (product.compareAtCents / 100).toFixed(2) : ""} className="input" placeholder="Optional" /></div>
        <div><label className="label">Stock</label><input name="stock" type="number" min={0} required defaultValue={product?.stock ?? 0} className="input" /></div>
      </div>
      <div>
        <label className="label">Category</label>
        <select name="categoryId" required defaultValue={product?.categoryId ?? ""} className="input">
          <option value="" disabled>Choose…</option>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>
      <div>
        <ImageUploader
          name="imageUrl"
          label="Product photo"
          defaultValue={product?.imageUrl}
          helpText="Upload a high quality product photo (PNG, JPG, WEBP). Recommended size: 800×800."
        />
      </div>
      <div className="flex gap-6 text-sm">
        <label className="flex items-center gap-2"><input type="checkbox" name="active" defaultChecked={product?.active ?? true} /> Visible in store</label>
        <label className="flex items-center gap-2"><input type="checkbox" name="featured" defaultChecked={product?.featured ?? false} /> Featured on home</label>
      </div>
      {state?.error && <p className="rounded-lg bg-red-50 p-2 text-sm text-red-700">{state.error}</p>}
      <SubmitButton pendingText="Saving…">{product ? "Save changes" : "Create product"}</SubmitButton>
    </form>
  );
}
