"use client";

import Link from "next/link";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useCart } from "@/components/CartProvider";
import { ProductImage } from "@/components/ProductImage";
import { money } from "@/lib/format";

export default function CartPage() {
  const { items, setQty, remove, subtotalCents, ready } = useCart();

  if (!ready) return <div className="container-x py-12 text-slate-500">Loading cart…</div>;
  if (items.length === 0) {
    return (
      <div className="container-x py-16 text-center">
        <div className="text-6xl">🛒</div>
        <h1 className="mt-4 text-2xl font-bold text-navy-900">Your cart is empty</h1>
        <Link href="/shop" className="btn btn-primary mt-6">Start shopping</Link>
      </div>
    );
  }

  const byMerchant = new Map<string, typeof items>();
  for (const i of items) byMerchant.set(i.merchantName, [...(byMerchant.get(i.merchantName) ?? []), i]);

  return (
    <div className="container-x py-8">
      <h1 className="mb-6 text-2xl font-bold text-navy-900">Shopping cart</h1>
      <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
        <div className="space-y-5">
          {[...byMerchant.entries()].map(([merchant, lines]) => (
            <div key={merchant} className="card overflow-hidden">
              <div className="border-b border-slate-100 bg-slate-50 px-4 py-2 text-sm font-semibold text-navy-800">Sold by {merchant}</div>
              <ul className="divide-y divide-slate-100">
                {lines.map((i) => (
                  <li key={i.productId} className="flex items-center gap-4 p-4">
                    <Link href={`/product/${i.slug}`} className="h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-slate-100">
                      <ProductImage imageUrl={i.imageUrl} categorySlug={i.categorySlug} name={i.name} iconSize={40} />
                    </Link>
                    <div className="min-w-0 flex-1">
                      <Link href={`/product/${i.slug}`} className="block truncate font-semibold text-slate-800 hover:underline">{i.name}</Link>
                      <p className="text-sm text-slate-500">{money(i.priceCents)}</p>
                      <div className="mt-2 inline-flex items-center rounded-lg border border-slate-200">
                        <button className="p-2 hover:bg-slate-50" onClick={() => setQty(i.productId, i.quantity - 1)} aria-label="Decrease"><Minus size={14} /></button>
                        <span className="w-8 text-center text-sm">{i.quantity}</span>
                        <button className="p-2 hover:bg-slate-50" onClick={() => setQty(i.productId, i.quantity + 1)} aria-label="Increase"><Plus size={14} /></button>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-navy-900">{money(i.priceCents * i.quantity)}</p>
                      <button onClick={() => remove(i.productId)} className="mt-2 text-red-500 hover:text-red-700" aria-label="Remove"><Trash2 size={16} /></button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <aside className="card h-fit p-5">
          <h2 className="font-bold text-navy-900">Summary</h2>
          <div className="mt-3 flex justify-between text-sm"><span>Subtotal</span><span className="font-semibold">{money(subtotalCents)}</span></div>
          <p className="mt-1 text-xs text-slate-500">Shipping, coupons, points and wallet are applied at checkout.</p>
          <Link href="/checkout" className="btn btn-primary mt-4 w-full">Proceed to checkout</Link>
        </aside>
      </div>
    </div>
  );
}
