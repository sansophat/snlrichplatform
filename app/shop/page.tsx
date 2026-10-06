import Link from "next/link";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { productInclude, visibleProduct } from "@/lib/queries";
import { ProductCard } from "@/components/ProductCard";
import { CategoryIcon } from "@/components/CategoryIcon";

export const dynamic = "force-dynamic";
export const metadata = { title: "Shop" };

const PAGE_SIZE = 12;

type SP = { q?: string; category?: string; sort?: string; page?: string; store?: string; min?: string; max?: string };

export default async function ShopPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const user = await getCurrentUser();
  const page = Math.max(1, parseInt(sp.page ?? "1") || 1);

  const where: Prisma.ProductWhereInput = { ...visibleProduct };
  if (sp.q) where.OR = [{ name: { contains: sp.q } }, { description: { contains: sp.q } }, { merchant: { name: { contains: sp.q } } }];
  if (sp.category) where.category = { slug: sp.category };
  if (sp.store) where.merchant = { status: "ACTIVE", slug: sp.store };
  const min = parseFloat(sp.min ?? "");
  const max = parseFloat(sp.max ?? "");
  if (Number.isFinite(min) || Number.isFinite(max)) {
    where.priceCents = {
      ...(Number.isFinite(min) ? { gte: Math.round(min * 100) } : {}),
      ...(Number.isFinite(max) ? { lte: Math.round(max * 100) } : {}),
    };
  }

  let orderBy: Prisma.ProductOrderByWithRelationInput = { createdAt: "desc" };
  if (sp.sort === "price_asc") orderBy = { priceCents: "asc" };
  if (sp.sort === "price_desc") orderBy = { priceCents: "desc" };

  let products;
  let total: number;
  if (sp.sort === "deals") {
    // "Deals" = products with a compare-at price; filter in memory by discount size.
    const all = await prisma.product.findMany({ where: { ...where, compareAtCents: { not: null } }, include: productInclude });
    const sorted = all
      .filter((p) => p.compareAtCents! > p.priceCents)
      .sort((a, b) => 1 - b.priceCents / b.compareAtCents! - (1 - a.priceCents / a.compareAtCents!));
    total = sorted.length;
    products = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  } else {
    [products, total] = await Promise.all([
      prisma.product.findMany({ where, include: productInclude, orderBy, skip: (page - 1) * PAGE_SIZE, take: PAGE_SIZE }),
      prisma.product.count({ where }),
    ]);
  }

  const [categories, wished] = await Promise.all([
    prisma.category.findMany({ orderBy: { name: "asc" }, include: { _count: { select: { products: { where: visibleProduct } } } } }),
    user ? prisma.wishlistItem.findMany({ where: { userId: user.id }, select: { productId: true } }) : Promise.resolve([]),
  ]);
  const wishSet = new Set(wished.map((w) => w.productId));
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const qs = (over: Record<string, string | undefined>) => {
    const p = new URLSearchParams();
    const merged = { ...sp, ...over };
    for (const [k, v] of Object.entries(merged)) if (v) p.set(k, v);
    return `/shop?${p.toString()}`;
  };

  const activeCat = categories.find((c) => c.slug === sp.category);

  return (
    <div className="container-x py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-navy-900">
          {sp.q ? `Results for “${sp.q}”` : activeCat ? activeCat.name : sp.sort === "deals" ? "Top Offers" : sp.sort === "new" ? "New Arrivals" : "All Products"}
        </h1>
        <p className="text-sm text-slate-500">{total} product{total === 1 ? "" : "s"}</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[220px_1fr]">
        <aside className="space-y-6">
          <div>
            <h3 className="mb-2 text-sm font-bold text-navy-900">Categories</h3>
            <ul className="space-y-1 text-sm">
              <li><Link href={qs({ category: undefined, page: undefined })} className={!sp.category ? "font-semibold text-navy-800" : "text-slate-600 hover:text-navy-800"}>All</Link></li>
              {categories.map((c) => {
                const active = sp.category === c.slug;
                return (
                  <li key={c.id}>
                    <Link
                      href={qs({ category: c.slug, page: undefined })}
                      className={`flex items-center justify-between rounded-lg px-2 py-1.5 transition ${
                        active ? "bg-navy-800 font-semibold text-white" : "text-slate-600 hover:bg-slate-100 hover:text-navy-900"
                      }`}
                    >
                      <span className="flex items-center gap-2 truncate">
                        <CategoryIcon slug={c.slug} size={15} className={active ? "text-gold-400" : "text-slate-400"} />
                        <span className="truncate">{c.name}</span>
                      </span>
                      <span className={`text-[11px] ${active ? "text-slate-300" : "text-slate-400"}`}>{c._count.products}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
          <form action="/shop" className="space-y-2">
            <h3 className="text-sm font-bold text-navy-900">Price</h3>
            {sp.q && <input type="hidden" name="q" value={sp.q} />}
            {sp.category && <input type="hidden" name="category" value={sp.category} />}
            {sp.sort && <input type="hidden" name="sort" value={sp.sort} />}
            <div className="flex gap-2">
              <input name="min" defaultValue={sp.min} placeholder="Min" className="input" inputMode="decimal" />
              <input name="max" defaultValue={sp.max} placeholder="Max" className="input" inputMode="decimal" />
            </div>
            <button className="btn btn-outline btn-sm w-full">Apply</button>
          </form>
        </aside>

        <section>
          <div className="mb-4 flex flex-wrap items-center gap-2 text-sm">
            <span className="text-slate-500">Sort:</span>
            {[
              ["new", "Newest"],
              ["price_asc", "Price ↑"],
              ["price_desc", "Price ↓"],
              ["deals", "Best deals"],
            ].map(([v, label]) => (
              <Link key={v} href={qs({ sort: v, page: undefined })} className={`badge ${sp.sort === v ? "bg-navy-800 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"}`}>
                {label}
              </Link>
            ))}
          </div>

          {products.length === 0 ? (
            <div className="card p-10 text-center text-slate-500">No products found. Try a different search or category.</div>
          ) : (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
              {products.map((p) => <ProductCard key={p.id} product={p} wished={wishSet.has(p.id)} />)}
            </div>
          )}

          {pages > 1 && (
            <div className="mt-8 flex justify-center gap-2">
              {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
                <Link key={n} href={qs({ page: String(n) })} className={`flex h-9 w-9 items-center justify-center rounded-lg text-sm ${n === page ? "bg-navy-800 text-white" : "border border-slate-200 hover:bg-slate-50"}`}>
                  {n}
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
