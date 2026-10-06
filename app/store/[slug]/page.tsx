import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { productInclude } from "@/lib/queries";
import { ProductCard } from "@/components/ProductCard";
import { StoreAvatar } from "@/components/StoreAvatar";

export const dynamic = "force-dynamic";

export default async function StorePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const user = await getCurrentUser();
  const merchant = await prisma.merchant.findUnique({ where: { slug } });
  if (!merchant || merchant.status !== "ACTIVE") notFound();

  const [products, wished] = await Promise.all([
    prisma.product.findMany({ where: { merchantId: merchant.id, active: true }, include: productInclude, orderBy: { createdAt: "desc" } }),
    user ? prisma.wishlistItem.findMany({ where: { userId: user.id }, select: { productId: true } }) : Promise.resolve([]),
  ]);
  const wishSet = new Set(wished.map((w) => w.productId));

  return (
    <div>
      <div className="relative overflow-hidden bg-gradient-to-r from-navy-900 via-navy-800 to-navy-900 py-12 text-white">
        {merchant.bannerUrl && (
          <div className="absolute inset-0 z-0 opacity-25">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={merchant.bannerUrl} alt={merchant.name} className="h-full w-full object-cover" />
          </div>
        )}
        <div className="container-x relative z-10 flex flex-col items-start gap-6 md:flex-row md:items-center">
          <StoreAvatar name={merchant.name} logoUrl={merchant.logoUrl} size={84} className="shadow-lift ring-4 ring-white/10" />
          <div className="flex-1">
            <span className="eyebrow !text-gold-400">Verified Merchant Store</span>
            <h1 className="mt-1 text-3xl font-extrabold md:text-4xl">{merchant.name}</h1>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-300">{merchant.description || "Official storefront on SNLRICH."}</p>
            <div className="mt-4 flex flex-wrap gap-2.5 text-xs font-semibold">
              <span className="badge bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-3 py-1">{merchant.cashbackPct}% cashback on orders</span>
              <span className="badge bg-gold-400/20 text-gold-300 border border-gold-400/30 px-3 py-1">{merchant.pointsRate}× rewards points</span>
              {merchant.phone && <span className="badge bg-white/10 text-slate-200 border border-white/20 px-3 py-1">📞 {merchant.phone}</span>}
              {merchant.address && <span className="badge bg-white/10 text-slate-200 border border-white/20 px-3 py-1">📍 {merchant.address}</span>}
            </div>
          </div>
        </div>
      </div>
      <div className="container-x py-8">
        <h2 className="mb-4 text-lg font-bold text-navy-900">{products.length} products</h2>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-5">
          {products.map((p) => <ProductCard key={p.id} product={p} wished={wishSet.has(p.id)} />)}
        </div>
      </div>
    </div>
  );
}
