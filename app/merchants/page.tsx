import Link from "next/link";
import { ArrowRight, Coins, Percent } from "lucide-react";
import { prisma } from "@/lib/db";
import { StoreAvatar } from "@/components/StoreAvatar";

export const dynamic = "force-dynamic";
export const metadata = { title: "Stores" };

export default async function MerchantsPage() {
  const merchants = await prisma.merchant.findMany({
    where: { status: "ACTIVE" },
    orderBy: { name: "asc" },
    include: { _count: { select: { products: { where: { active: true } } } } },
  });
  return (
    <div className="container-x py-10">
      <div className="max-w-2xl">
        <p className="eyebrow">Verified Merchants</p>
        <h1 className="section-title mt-1">Explore Stores</h1>
        <p className="mt-1 text-sm text-slate-500">Every store has its own rewards — earn points and cashback on every order.</p>
      </div>

      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {merchants.map((m) => (
          <Link key={m.id} href={`/store/${m.slug}`} className="card group flex flex-col justify-between p-6 transition duration-300 hover:-translate-y-1 hover:shadow-lift">
            <div>
              <div className="flex items-center gap-4">
                <StoreAvatar name={m.name} size={56} />
                <div className="min-w-0">
                  <h2 className="truncate text-lg font-bold text-navy-900 group-hover:text-navy-700">{m.name}</h2>
                  <p className="text-xs text-slate-400">{m._count.products} products available</p>
                </div>
              </div>
              <p className="mt-4 line-clamp-2 text-sm leading-relaxed text-slate-600">{m.description || "Trusted independent seller on SNLRICH."}</p>
            </div>

            <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4">
              <div className="flex flex-wrap gap-2 text-xs font-semibold">
                <span className="badge flex items-center gap-1 bg-emerald-50 text-emerald-700"><Percent size={12} /> {m.cashbackPct}% cashback</span>
                <span className="badge flex items-center gap-1 bg-amber-50 text-amber-800"><Coins size={12} className="text-gold-600" /> {m.pointsRate}× points</span>
              </div>
              <span className="flex items-center gap-1 text-xs font-bold text-navy-800 group-hover:translate-x-1 transition">
                Visit <ArrowRight size={14} />
              </span>
            </div>
          </Link>
        ))}
        {merchants.length === 0 && <p className="text-slate-500">No stores yet.</p>}
      </div>
    </div>
  );
}
