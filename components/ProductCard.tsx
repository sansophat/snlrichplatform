import Link from "next/link";
import { Heart, Star } from "lucide-react";
import { ProductImage } from "./ProductImage";
import { AddToCartButton } from "./AddToCartButton";
import { avgRating, money } from "@/lib/format";
import { toggleWishlist } from "@/app/actions/shop";
import type { ProductWithMeta } from "@/lib/queries";

export function ProductCard({ product, wished = false }: { product: ProductWithMeta; wished?: boolean }) {
  const rating = avgRating(product.reviews);
  const off =
    product.compareAtCents && product.compareAtCents > product.priceCents
      ? Math.round((1 - product.priceCents / product.compareAtCents) * 100)
      : 0;

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-card transition duration-300 hover:-translate-y-1 hover:shadow-lift">
      <Link href={`/product/${product.slug}`} className="block">
        <div className="relative">
          <ProductImage imageUrl={product.imageUrl} categorySlug={product.category.slug} name={product.name} />
          <div className="absolute left-2.5 top-2.5 flex flex-col gap-1">
            {off > 0 && <span className="rounded-full bg-rose-500 px-2 py-0.5 text-[10px] font-bold text-white shadow">-{off}%</span>}
            {product.stock > 0 && product.stock <= 5 && <span className="rounded-full bg-amber-400 px-2 py-0.5 text-[10px] font-bold text-navy-900 shadow">Only {product.stock} left</span>}
            {product.stock === 0 && <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[10px] font-bold text-white shadow">Sold out</span>}
          </div>
        </div>
        <div className="p-3.5 pb-2">
          <p className="truncate text-[11px] font-medium uppercase tracking-wide text-slate-400">{product.merchant.name}</p>
          <h3 className="mt-0.5 line-clamp-1 text-sm font-semibold text-slate-800">{product.name}</h3>
          <div className="mt-1.5 flex items-baseline gap-2">
            <span className="text-base font-extrabold text-navy-900">{money(product.priceCents)}</span>
            {off > 0 && <span className="text-xs text-slate-400 line-through">{money(product.compareAtCents!)}</span>}
          </div>
        </div>
      </Link>
      <div className="flex items-center justify-between px-3.5 pb-3.5">
        <span className="flex items-center gap-1 text-xs font-medium text-slate-500">
          <Star size={12} className="fill-gold-500 text-gold-500" />
          {rating ? rating.toFixed(1) : "New"}
          {product.merchant.cashbackPct > 0 && (
            <span className="ml-1.5 rounded-md bg-emerald-50 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700">{product.merchant.cashbackPct}% back</span>
          )}
        </span>
        <AddToCartButton
          item={{
            productId: product.id,
            slug: product.slug,
            name: product.name,
            priceCents: product.priceCents,
            stock: product.stock,
            merchantId: product.merchant.id,
            merchantName: product.merchant.name,
            imageUrl: product.imageUrl,
            categorySlug: product.category.slug,
          }}
        />
      </div>
      <form action={toggleWishlist} className="absolute right-2.5 top-2.5">
        <input type="hidden" name="productId" value={product.id} />
        <button aria-label="Toggle wishlist" className="flex h-8 w-8 items-center justify-center rounded-full bg-white/90 shadow-md backdrop-blur transition hover:scale-110 hover:bg-white">
          <Heart size={15} className={wished ? "fill-rose-500 text-rose-500" : "text-slate-500"} />
        </button>
      </form>
    </div>
  );
}
