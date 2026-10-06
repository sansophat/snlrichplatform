import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BadgePercent, Coins, Gift, ShieldCheck, Sparkles, Truck, Users, Wallet } from "lucide-react";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { productInclude, visibleProduct } from "@/lib/queries";
import { ProductCard } from "@/components/ProductCard";
import { CategoryIcon, categoryTheme, getCategoryImage } from "@/components/CategoryIcon";
import { StoreAvatar } from "@/components/StoreAvatar";
import { REWARDS } from "@/lib/config";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const user = await getCurrentUser();
  const [categories, trending, merchants, wished] = await Promise.all([
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.product.findMany({
      where: { ...visibleProduct, featured: true, stock: { gt: 0 } },
      include: productInclude,
      orderBy: [{ imageUrl: "desc" }, { createdAt: "desc" }],
      take: 6,
    }),
    prisma.merchant.findMany({ where: { status: "ACTIVE" }, take: 4, orderBy: { createdAt: "asc" } }),
    user ? prisma.wishlistItem.findMany({ where: { userId: user.id }, select: { productId: true } }) : Promise.resolve([]),
  ]);
  const wishSet = new Set(wished.map((w) => w.productId));

  const collections = [
    { title: "Elegant Outfits", sub: "Step into style", href: "/shop?category=fashion", img: "/images/col-fashion.jpg" },
    { title: "Skincare Essentials", sub: "Glow every day", href: "/shop?category=beauty-personal-care", img: "/images/col-beauty.jpg" },
    { title: "Tech & Audio", sub: "Level up your sound", href: "/shop?category=electronics", img: "/images/col-electronics.jpg" },
    { title: "Modern Living", sub: "Make your space beautiful", href: "/shop?category=home-living", img: "/images/col-home.jpg" },
  ];

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-navy-900 text-white">
        <Image src="/images/hero.jpg" alt="" fill priority sizes="100vw" className="object-cover object-[70%_center] opacity-90" />
        <div className="absolute inset-0 bg-gradient-to-r from-navy-900 via-navy-900/85 to-transparent" />
        <div className="container-x relative grid min-h-[440px] items-center py-14 md:min-h-[520px]">
          <div className="max-w-xl animate-fadeup">
            <span className="inline-flex items-center gap-2 rounded-full border border-gold-400/40 bg-gold-400/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-gold-400">
              <Sparkles size={12} /> New collection
            </span>
            <h1 className="mt-5 text-4xl font-extrabold leading-[1.08] md:text-6xl">
              Upgrade Your <span className="bg-gradient-to-r from-sand-200 to-gold-400 bg-clip-text text-transparent">Lifestyle</span> Today
            </h1>
            <p className="mt-5 max-w-md text-base text-slate-300">
              Find the latest trends, top brands and exclusive deals all in one place — and earn points and cashback on every order.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/shop" className="btn btn-sand !px-7 !py-3.5">Shop Now <ArrowRight size={16} /></Link>
              {!user && (
                <Link href="/register" className="btn glass !px-7 !py-3.5 text-white hover:bg-white/20">
                  <Gift size={16} /> Join & get {REWARDS.SIGNUP_BONUS} pts
                </Link>
              )}
            </div>
            <div className="mt-10 flex flex-wrap gap-6 text-xs text-slate-300">
              <span className="flex items-center gap-2"><ShieldCheck size={16} className="text-gold-400" /> Verified merchants</span>
              <span className="flex items-center gap-2"><Truck size={16} className="text-gold-400" /> Fast delivery</span>
              <span className="flex items-center gap-2"><Coins size={16} className="text-gold-400" /> Rewards on every order</span>
            </div>
          </div>
          {/* floating reward cards */}
          <div className="pointer-events-none absolute right-10 top-16 hidden animate-floaty lg:block">
            <div className="glass flex items-center gap-3 rounded-2xl px-4 py-3 shadow-lift">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold-400 text-navy-900"><Coins size={20} /></span>
              <div><p className="text-xs text-slate-300">Earn up to</p><p className="text-sm font-bold">3× points</p></div>
            </div>
          </div>
          <div className="pointer-events-none absolute bottom-14 right-[38%] hidden animate-floaty [animation-delay:1.5s] lg:block">
            <div className="glass flex items-center gap-3 rounded-2xl px-4 py-3 shadow-lift">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-400 text-navy-900"><Wallet size={20} /></span>
              <div><p className="text-xs text-slate-300">Cashback up to</p><p className="text-sm font-bold">5% wallet</p></div>
            </div>
          </div>
        </div>
      </section>

      {/* Rewards strip */}
      <section className="border-b border-sand-200 bg-sand-100">
        <div className="container-x grid grid-cols-2 gap-4 py-4 text-sm text-navy-900 md:grid-cols-4">
          <div className="flex items-center gap-2.5 font-medium"><Coins size={18} className="text-gold-600" /> Earn points on every order</div>
          <div className="flex items-center gap-2.5 font-medium"><BadgePercent size={18} className="text-emerald-600" /> Cashback to your wallet</div>
          <div className="flex items-center gap-2.5 font-medium"><Users size={18} className="text-navy-600" /> Refer friends, get {REWARDS.REFERRER_BONUS} pts</div>
          <Link href="/rewards" className="flex items-center gap-2.5 font-bold underline-offset-4 hover:underline"><Gift size={18} /> How rewards work <ArrowRight size={14} /></Link>
        </div>
      </section>

      {/* Categories */}
      <section className="container-x pt-14">
        <div className="text-center">
          <p className="eyebrow">Categories</p>
          <h2 className="section-title mt-1">Browse By Categories</h2>
          <p className="mt-1 text-sm text-slate-500">Explore handpicked collections for every part of your life.</p>
        </div>
        <div className="mt-8 flex gap-6 overflow-x-auto pb-4 md:justify-center">
          {categories.map((c) => {
            const img = getCategoryImage(c.slug, c.imageUrl);
            const t = categoryTheme(c.slug);
            return (
              <Link key={c.id} href={`/shop?category=${c.slug}`} className="group flex w-24 shrink-0 flex-col items-center gap-3">
                <div className="relative flex h-[92px] w-[92px] items-center justify-center overflow-hidden rounded-full bg-sand-100 shadow-card ring-4 ring-white transition duration-300 group-hover:-translate-y-1.5 group-hover:shadow-lift">
                  {img ? (
                    <Image
                      src={img}
                      alt={c.name}
                      fill
                      sizes="92px"
                      className="object-cover p-1.5 transition duration-500 group-hover:scale-110"
                    />
                  ) : (
                    <span
                      className="flex h-full w-full items-center justify-center rounded-full"
                      style={{ background: `linear-gradient(135deg, ${t.from}, ${t.to})`, color: t.fg }}
                    >
                      <CategoryIcon slug={c.slug} size={36} />
                    </span>
                  )}
                </div>
                <span className="text-center text-xs font-semibold text-slate-700 transition group-hover:text-navy-900">
                  {c.name.split(" & ")[0]}
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Trending */}
      <section className="container-x pt-14">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <p className="eyebrow">Hot picks</p>
            <h2 className="section-title">Trending Right Now</h2>
            <p className="text-sm text-slate-500">Top picks that everyone is loving this week.</p>
          </div>
          <Link href="/shop" className="flex items-center gap-1 text-sm font-semibold text-navy-700 hover:underline">View All <ArrowRight size={14} /></Link>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {trending.map((p) => <ProductCard key={p.id} product={p} wished={wishSet.has(p.id)} />)}
        </div>
      </section>

      {/* Promo banners */}
      <section className="container-x grid gap-5 pt-14 md:grid-cols-2">
        <Link href="/shop?sort=deals" className="group relative flex min-h-[220px] items-center overflow-hidden rounded-3xl bg-sky-100 p-8 shadow-card">
          <Image src="/images/banner-sale.jpg" alt="" fill sizes="(max-width:768px) 100vw, 50vw" className="object-cover object-right transition duration-700 group-hover:scale-105" />
          <div className="relative max-w-[55%]">
            <p className="eyebrow !text-navy-600">Summer sale</p>
            <h3 className="mt-2 text-3xl font-extrabold leading-tight text-navy-900">Up To 50% Off On Bestsellers</h3>
            <span className="btn btn-primary btn-sm mt-5 !px-5 !py-2.5">Shop Sale <ArrowRight size={14} /></span>
          </div>
        </Link>
        <Link href="/shop?sort=new" className="group relative flex min-h-[220px] items-center overflow-hidden rounded-3xl bg-sand-200 p-8 shadow-card">
          <Image src="/images/banner-new.jpg" alt="" fill sizes="(max-width:768px) 100vw, 50vw" className="object-cover object-right transition duration-700 group-hover:scale-105" />
          <div className="relative max-w-[55%]">
            <p className="eyebrow !text-navy-600">New arrivals</p>
            <h3 className="mt-2 text-3xl font-extrabold leading-tight text-navy-900">Fresh Finds You&apos;ll Love</h3>
            <span className="btn btn-outline btn-sm mt-5 !border-navy-800/20 !bg-white/80 !px-5 !py-2.5 backdrop-blur">Explore Now <ArrowRight size={14} /></span>
          </div>
        </Link>
      </section>

      {/* Featured collections */}
      <section className="container-x pt-14">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <p className="eyebrow">Curated</p>
            <h2 className="section-title">Featured Collections</h2>
            <p className="text-sm text-slate-500">Carefully curated collections just for you.</p>
          </div>
          <Link href="/shop" className="flex items-center gap-1 text-sm font-semibold text-navy-700 hover:underline">View All <ArrowRight size={14} /></Link>
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {collections.map((c) => (
            <Link key={c.title} href={c.href} className="group relative h-52 overflow-hidden rounded-2xl shadow-card md:h-64">
              <Image src={c.img} alt={c.title} fill sizes="(max-width:768px) 50vw, 25vw" className="object-cover transition duration-700 group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-navy-900/80 via-navy-900/10 to-transparent" />
              <div className="absolute bottom-0 p-4 text-white">
                <h3 className="text-base font-bold">{c.title}</h3>
                <p className="flex items-center gap-1 text-xs text-slate-200">{c.sub} <ArrowRight size={12} className="transition group-hover:translate-x-1" /></p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Stores */}
      <section className="container-x pt-14">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <p className="eyebrow">Marketplace</p>
            <h2 className="section-title">Shop From Our Merchants</h2>
          </div>
          <Link href="/merchants" className="flex items-center gap-1 text-sm font-semibold text-navy-700 hover:underline">All stores <ArrowRight size={14} /></Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {merchants.map((m) => (
            <Link key={m.id} href={`/store/${m.slug}`} className="card group flex items-center gap-4 p-4 transition duration-300 hover:-translate-y-1 hover:shadow-lift">
              <StoreAvatar name={m.name} size={52} />
              <div className="min-w-0">
                <p className="truncate font-bold text-navy-900">{m.name}</p>
                <p className="mt-0.5 text-xs font-medium text-emerald-700">{m.cashbackPct}% cashback · {m.pointsRate}× pts</p>
              </div>
              <ArrowRight size={16} className="ml-auto text-slate-300 transition group-hover:translate-x-1 group-hover:text-navy-700" />
            </Link>
          ))}
        </div>
      </section>

      {/* Join CTA */}
      {!user && (
        <section className="container-x pt-14">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-navy-800 to-navy-900 px-8 py-12 text-center text-white md:px-16">
            <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-gold-400/10" />
            <div className="absolute -bottom-20 -left-10 h-64 w-64 rounded-full bg-sand-200/10" />
            <div className="relative">
              <p className="eyebrow !text-gold-400">Members only</p>
              <h2 className="mt-2 text-3xl font-extrabold">Join today — get {REWARDS.SIGNUP_BONUS} bonus points</h2>
              <p className="mx-auto mt-3 max-w-lg text-sm text-slate-300">Earn points, collect cashback and invite friends. {REWARDS.REFERRED_SIGNUP_BONUS} points if a friend referred you.</p>
              <Link href="/register" className="btn btn-gold mt-6 !px-8 !py-3.5">Create free account <ArrowRight size={16} /></Link>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
