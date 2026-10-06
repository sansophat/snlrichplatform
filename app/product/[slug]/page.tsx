import Link from "next/link";
import { notFound } from "next/navigation";
import { Coins, Percent, Star, Store, Truck } from "lucide-react";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { productInclude, visibleProduct } from "@/lib/queries";
import { avgRating, dateFmt, money } from "@/lib/format";
import { ProductImage } from "@/components/ProductImage";
import { AddToCartButton } from "@/components/AddToCartButton";
import { ProductCard } from "@/components/ProductCard";
import { SubmitButton } from "@/components/SubmitButton";
import { submitReview, toggleWishlist } from "@/app/actions/shop";
import { SHIPPING } from "@/lib/config";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = await prisma.product.findUnique({ where: { slug }, select: { name: true } });
  return { title: p?.name ?? "Product" };
}

export default async function ProductPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ review?: string }>;
}) {
  const { slug } = await params;
  const { review } = await searchParams;
  const user = await getCurrentUser();

  const product = await prisma.product.findUnique({
    where: { slug },
    include: { ...productInclude, reviews: { include: { user: { select: { name: true } } }, orderBy: { createdAt: "desc" } } },
  });
  if (!product || !product.active || product.merchant.id === undefined) notFound();
  const merchantFull = await prisma.merchant.findUnique({ where: { id: product.merchantId } });
  if (!merchantFull || merchantFull.status !== "ACTIVE") notFound();

  const [related, wished, canReview] = await Promise.all([
    prisma.product.findMany({
      where: { ...visibleProduct, categoryId: product.categoryId, id: { not: product.id } },
      include: productInclude,
      take: 4,
    }),
    user ? prisma.wishlistItem.findUnique({ where: { userId_productId: { userId: user.id, productId: product.id } } }) : null,
    user ? prisma.orderItem.findFirst({ where: { productId: product.id, order: { userId: user.id, status: "DELIVERED" } } }) : null,
  ]);

  const rating = avgRating(product.reviews);
  const off = product.compareAtCents && product.compareAtCents > product.priceCents
    ? Math.round((1 - product.priceCents / product.compareAtCents) * 100) : 0;
  const earnPts = Math.floor((product.priceCents / 100) * merchantFull.pointsRate);
  const cashback = Math.floor((product.priceCents * merchantFull.cashbackPct) / 100);

  return (
    <div className="container-x py-8">
      <nav className="mb-4 text-xs text-slate-500">
        <Link href="/shop" className="hover:underline">Shop</Link> /{" "}
        <Link href={`/shop?category=${product.category.slug}`} className="hover:underline">{product.category.name}</Link> / {product.name}
      </nav>

      <div className="grid gap-8 md:grid-cols-2">
        <div className="card overflow-hidden">
          <ProductImage imageUrl={product.imageUrl} categorySlug={product.category.slug} name={product.name} iconSize={96} priority />
        </div>

        <div>
          <Link href={`/store/${merchantFull.slug}`} className="inline-flex items-center gap-1.5 text-sm font-semibold text-navy-700 hover:underline">
            <Store size={15} /> {merchantFull.name}
          </Link>
          <h1 className="mt-1 text-3xl font-extrabold text-navy-900 md:text-4xl">{product.name}</h1>
          <div className="mt-2 flex items-center gap-2 text-sm text-slate-500">
            <Star size={16} className="fill-gold-500 text-gold-500" />
            {rating ? `${rating.toFixed(1)} (${product.reviews.length} review${product.reviews.length === 1 ? "" : "s"})` : "No reviews yet"}
          </div>

          <div className="mt-4 flex items-baseline gap-3">
            <span className="text-3xl font-black text-navy-900">{money(product.priceCents)}</span>
            {off > 0 && (
              <>
                <span className="text-lg text-slate-400 line-through">{money(product.compareAtCents!)}</span>
                <span className="badge bg-rose-100 text-rose-700">Save {off}%</span>
              </>
            )}
          </div>

          <p className="mt-4 text-sm leading-relaxed text-slate-600">{product.description || "No description provided."}</p>

          <div className="mt-6 grid gap-2.5 rounded-2xl border border-sand-200 bg-sand-50 p-4 text-sm text-navy-900">
            <p className="flex items-center gap-2.5"><Coins size={16} className="text-gold-600" /> Earn <b>{earnPts} points</b> when delivered ({merchantFull.pointsRate}× per {money(100)})</p>
            <p className="flex items-center gap-2.5"><Percent size={16} className="text-emerald-600" /> <b>{merchantFull.cashbackPct}% cashback</b> ({money(cashback)}) to your wallet</p>
            <p className="flex items-center gap-2.5"><Truck size={16} className="text-navy-600" /> Free shipping over {money(SHIPPING.FREE_OVER_CENTS)} per store</p>
          </div>

          <p className={`mt-5 text-sm font-semibold ${product.stock > 0 ? "text-emerald-700" : "text-rose-600"}`}>
            {product.stock > 10 ? "● In stock" : product.stock > 0 ? `● Only ${product.stock} left in stock` : "● Out of stock"}
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <AddToCartButton
              variant="full"
              item={{
                productId: product.id, slug: product.slug, name: product.name, priceCents: product.priceCents, stock: product.stock,
                merchantId: merchantFull.id, merchantName: merchantFull.name, imageUrl: product.imageUrl, categorySlug: product.category.slug,
              }}
            />
            <form action={toggleWishlist}>
              <input type="hidden" name="productId" value={product.id} />
              <button className="btn btn-outline">{wished ? "♥ In wishlist" : "♡ Add to wishlist"}</button>
            </form>
          </div>
        </div>
      </div>

      <section id="reviews" className="mt-12">
        <h2 className="mb-4 text-xl font-bold text-navy-900">Reviews</h2>
        <div className="grid gap-8 md:grid-cols-[1fr_360px]">
          <div className="space-y-3">
            {product.reviews.length === 0 && <p className="text-sm text-slate-500">Be the first to review this product.</p>}
            {product.reviews.map((r) => (
              <div key={r.id} className="card p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold">{r.user.name}</span>
                  <span className="text-xs text-slate-400">{dateFmt(r.createdAt)}</span>
                </div>
                <div className="my-1 text-gold-500">{"★".repeat(r.rating)}<span className="text-slate-300">{"★".repeat(5 - r.rating)}</span></div>
                {r.body && <p className="text-sm text-slate-600">{r.body}</p>}
              </div>
            ))}
          </div>
          <div className="card h-fit p-4">
            <h3 className="mb-2 text-sm font-bold">Write a review</h3>
            {review === "denied" && <p className="mb-2 rounded bg-amber-50 p-2 text-xs text-amber-800">You can review a product after your order is delivered.</p>}
            {!user ? (
              <p className="text-sm text-slate-500"><Link href="/login" className="font-semibold text-navy-700 underline">Sign in</Link> to review.</p>
            ) : !canReview ? (
              <p className="text-sm text-slate-500">Only customers with a delivered order can review.</p>
            ) : (
              <form action={submitReview} className="space-y-3">
                <input type="hidden" name="productId" value={product.id} />
                <input type="hidden" name="slug" value={product.slug} />
                <select name="rating" className="input" defaultValue="5">
                  {[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{"★".repeat(n)} ({n})</option>)}
                </select>
                <textarea name="body" rows={3} className="input" placeholder="Share your experience" />
                <SubmitButton>Submit review</SubmitButton>
              </form>
            )}
          </div>
        </div>
      </section>

      {related.length > 0 && (
        <section className="mt-12">
          <h2 className="mb-4 text-xl font-bold text-navy-900">You may also like</h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {related.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}
    </div>
  );
}
