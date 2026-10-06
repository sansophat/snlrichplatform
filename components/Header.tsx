import Image from "next/image";
import Link from "next/link";
import {
  ChevronDown, ChevronRight, Coins, Gift, Headphones, Heart, LayoutDashboard, LogOut, Menu, Package, Search, ShieldCheck,
  Sparkles, Store, Tag, UserRound, Wallet,
} from "lucide-react";
import { Logo } from "./Logo";
import { CartLink } from "./CartLink";
import { CategoryIcon, categoryTheme, getCategoryImage } from "./CategoryIcon";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { logoutAction } from "@/app/actions/auth";
import { money } from "@/lib/format";
import { getPlatformSettings } from "@/lib/settings";

const NAV = [
  { href: "/shop", label: "Shop" },
  { href: "/shop?sort=deals", label: "Deals" },
  { href: "/shop?sort=new", label: "New Arrivals" },
  { href: "/merchants", label: "Stores" },
  { href: "/rewards", label: "Rewards" },
];

export async function Header() {
  const [user, categories, settings] = await Promise.all([
    getCurrentUser(),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    getPlatformSettings(),
  ]);
  const wishCount = user ? await prisma.wishlistItem.count({ where: { userId: user.id } }) : 0;

  return (
    <header className="sticky top-0 z-40 bg-white/95 shadow-sm backdrop-blur">
      {/* Announcement bar */}
      <div className="hidden bg-navy-900 text-[11px] text-slate-200 sm:block">
        <div className="container-x flex items-center justify-between py-1.5">
          <span className="flex items-center gap-1.5"><Sparkles size={12} className="text-gold-400" /> Free shipping over {money(settings.freeShippingCents)} · Earn points & cashback on every order</span>
          <Link href="/account/referrals" className="flex items-center gap-1.5 hover:text-white"><Gift size={12} className="text-gold-400" /> Refer a friend, earn {settings.referrerBonusPoints} pts</Link>
        </div>
      </div>

      <div className="container-x flex items-center gap-4 py-3.5">
        <Logo src={settings.logoUrl} alt={settings.siteName} />
        <form action="/shop" className="relative mx-2 hidden flex-1 md:block">
          <Search size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            name="q"
            placeholder="Search for products, brands and more..."
            className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-28 text-sm outline-none transition focus:border-navy-400 focus:bg-white focus:ring-4 focus:ring-navy-100/70"
          />
          <button className="absolute right-1 top-1 flex h-9 items-center gap-1.5 rounded-lg bg-navy-800 px-4 text-xs font-semibold text-white hover:bg-navy-700">
            Search
          </button>
        </form>

        <div className="ml-auto flex items-center gap-4 md:ml-0 md:gap-5">
          {user && (
            <Link href="/account/rewards" className="hidden items-center gap-2 rounded-full border border-gold-400/40 bg-gradient-to-r from-sand-100 to-white px-3.5 py-1.5 text-xs font-bold text-navy-900 lg:flex">
              <Coins size={14} className="text-gold-600" /> {user.points.toLocaleString()} pts
              <span className="h-3 w-px bg-slate-300" />
              <span className="text-emerald-700">{money(user.walletCents)}</span>
            </Link>
          )}
          <IconLink href="/account/wishlist" label="Wishlist" badge={wishCount} badgeClass="bg-rose-500"><Heart size={20} /></IconLink>
          <CartLink />
          {user ? (
            <div className="group relative">
              <button className="flex flex-col items-center gap-0.5 text-[11px] font-medium text-slate-600 group-hover:text-navy-800">
                {user.avatarUrl ? (
                  <span className="relative flex h-5 w-5 items-center justify-center overflow-hidden rounded-full border border-slate-300">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={user.avatarUrl} alt={user.name} className="h-full w-full object-cover" />
                  </span>
                ) : (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-navy-800 text-[10px] font-bold text-white">{user.name[0]?.toUpperCase()}</span>
                )}
                <span className="flex max-w-20 items-center gap-0.5 truncate">{user.name.split(" ")[0]} <ChevronDown size={10} /></span>
              </button>
              <div className="invisible absolute right-0 top-full w-56 pt-3 opacity-0 transition duration-150 group-hover:visible group-hover:opacity-100">
                <div className="card overflow-hidden py-1.5 text-sm shadow-lift">
                  <div className="border-b border-slate-100 px-4 pb-2 pt-1"><p className="truncate font-semibold text-navy-900">{user.name}</p><p className="truncate text-xs text-slate-500">{user.email}</p></div>
                  <MenuLink href="/account" icon={UserRound}>My account</MenuLink>
                  <MenuLink href="/account/wallet" icon={Wallet}>Wallet & Points</MenuLink>
                  <MenuLink href="/account/profile" icon={UserRound}>Profile settings</MenuLink>
                  <MenuLink href="/account/kyc" icon={ShieldCheck}>KYC verification</MenuLink>
                  <MenuLink href="/account/orders" icon={Package}>Orders</MenuLink>
                  <MenuLink href="/account/referrals" icon={Gift}>Refer & earn</MenuLink>
                  {user.merchant?.status === "ACTIVE" ? (
                    <MenuLink href="/merchant-portal" icon={LayoutDashboard}>Merchant portal</MenuLink>
                  ) : (
                    <MenuLink href="/become-merchant" icon={Store}>Sell on SNLRICH</MenuLink>
                  )}
                  {user.role === "ADMIN" && <MenuLink href="/admin" icon={ShieldCheck}>Admin panel</MenuLink>}
                  <form action={logoutAction} className="border-t border-slate-100 pt-1">
                    <button className="flex w-full items-center gap-2.5 px-4 py-2 text-left text-red-600 hover:bg-red-50"><LogOut size={15} /> Sign out</button>
                  </form>
                </div>
              </div>
            </div>
          ) : (
            <Link href="/login" className="btn btn-primary btn-sm !px-4 !py-2">Sign in</Link>
          )}
        </div>
      </div>

      {/* Navy nav bar with category mega-menu */}
      <div className="hidden bg-gradient-to-r from-navy-900 via-navy-800 to-navy-900 text-sm text-white md:block">
        <div className="container-x flex items-center">
          <div className="group relative">
            <Link href="/shop" className="flex items-center gap-2.5 bg-navy-700/70 px-5 py-3 font-semibold hover:bg-navy-700">
              <Menu size={16} /> Shop by Categories <ChevronDown size={14} className="opacity-70" />
            </Link>
            <div className="invisible absolute left-0 top-full z-50 w-80 opacity-0 transition duration-150 group-hover:visible group-hover:opacity-100">
              <ul className="card rounded-t-none border border-slate-200/80 p-2 text-slate-700 shadow-lift">
                {categories.map((c) => {
                  const t = categoryTheme(c.slug);
                  const img = getCategoryImage(c.slug, c.imageUrl);
                  return (
                    <li key={c.id}>
                      <Link href={`/shop?category=${c.slug}`} className="group/i flex items-center justify-between rounded-lg px-2.5 py-1.5 text-[13px] hover:bg-slate-50 transition">
                        <span className="flex items-center gap-3">
                          <span className="relative flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-slate-200/70 bg-slate-100 shadow-xs">
                            {img ? (
                              <Image
                                src={img}
                                alt={c.name}
                                fill
                                sizes="32px"
                                className="object-cover transition-transform duration-200 group-hover/i:scale-110"
                              />
                            ) : (
                              <span className="flex h-full w-full items-center justify-center" style={{ background: t.from, color: t.fg }}>
                                <CategoryIcon slug={c.slug} size={15} />
                              </span>
                            )}
                          </span>
                          <span className="font-medium text-slate-800 group-hover/i:text-navy-950">{c.name}</span>
                        </span>
                        <ChevronRight size={14} className="text-slate-300 transition group-hover/i:translate-x-0.5 group-hover/i:text-navy-600" />
                      </Link>
                    </li>
                  );
                })}
                <li className="mt-1 border-t border-slate-100 pt-1.5">
                  <Link href="/shop?sort=deals" className="flex items-center gap-3 rounded-lg px-2.5 py-2 text-[13px] font-medium text-slate-700 hover:bg-slate-50">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-600"><Tag size={16} /></span>
                    <span>Top Offers & Deals</span>
                  </Link>
                  <Link href="/rewards" className="flex items-center gap-3 rounded-lg px-2.5 py-2 text-[13px] font-medium text-slate-700 hover:bg-slate-50">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-gold-600"><Gift size={16} /></span>
                    <span>Rewards & Referral Hub</span>
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <nav className="ml-3 flex">
            {NAV.map((n) => (
              <Link key={n.href} href={n.href} className="px-4 py-3 font-medium text-slate-100 transition hover:bg-white/10 hover:text-white">{n.label}</Link>
            ))}
          </nav>
          <span className="ml-auto flex items-center gap-2 text-xs text-slate-200">
            <Headphones size={14} className="text-gold-400" /> Support: {settings.supportPhone}
          </span>
        </div>
      </div>
    </header>
  );
}

function IconLink({ href, label, badge, badgeClass, children }: { href: string; label: string; badge?: number; badgeClass: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="relative flex flex-col items-center gap-0.5 text-[11px] font-medium text-slate-600 transition hover:text-navy-800">
      {children}
      <span className="hidden sm:inline">{label}</span>
      {!!badge && badge > 0 && (
        <span className={`absolute -right-2 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-bold text-white ${badgeClass}`}>{badge}</span>
      )}
    </Link>
  );
}

function MenuLink({ href, icon: Icon, children }: { href: string; icon: React.ComponentType<{ size?: number; className?: string }>; children: React.ReactNode }) {
  return (
    <Link href={href} className="flex items-center gap-2.5 px-4 py-2 text-slate-700 hover:bg-slate-50 hover:text-navy-900">
      <Icon size={15} className="text-slate-400" /> {children}
    </Link>
  );
}
