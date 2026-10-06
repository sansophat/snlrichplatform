import Link from "next/link";
import { Headphones, Lock, RotateCcw, Truck } from "lucide-react";
import { Logo } from "./Logo";
import { money } from "@/lib/format";
import { getPlatformSettings } from "@/lib/settings";

export async function Footer() {
  const settings = await getPlatformSettings();
  const perks = [
    { icon: Truck, title: "Free Shipping", text: `On orders over ${money(settings.freeShippingCents)}` },
    { icon: RotateCcw, title: "Easy Returns", text: "Within 30 days" },
    { icon: Lock, title: "Secure Payments", text: "100% protected" },
    { icon: Headphones, title: "24/7 Support", text: settings.supportPhone || "We're here to help" },
  ];
  return (
    <footer className="mt-16">
      <div className="bg-navy-900 text-white">
        <div className="container-x grid grid-cols-2 gap-6 py-5 md:grid-cols-4">
          {perks.map((p) => (
            <div key={p.title} className="flex items-center gap-3">
              <p.icon size={22} className="text-sand-200" />
              <div>
                <p className="text-sm font-semibold">{p.title}</p>
                <p className="text-xs text-slate-300">{p.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="bg-navy-800 text-slate-300">
        <div className="container-x grid gap-8 py-10 md:grid-cols-4">
          <div className="space-y-3">
            <Logo light src={settings.logoLightUrl} alt={settings.siteName} />
            <p className="text-sm">{settings.siteTagline || "Shop from trusted merchants, earn points, get cashback and reward your friends."}</p>
          </div>
          <div>
            <h4 className="mb-3 text-sm font-semibold text-white">Shop</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/shop" className="hover:text-white">All products</Link></li>
              <li><Link href="/merchants" className="hover:text-white">Stores</Link></li>
              <li><Link href="/shop?sort=deals" className="hover:text-white">Top offers</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="mb-3 text-sm font-semibold text-white">Rewards</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/rewards" className="hover:text-white">How it works</Link></li>
              <li><Link href="/account/referrals" className="hover:text-white">Refer a friend</Link></li>
              <li><Link href="/account/rewards" className="hover:text-white">My points & cashback</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="mb-3 text-sm font-semibold text-white">Sell</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/become-merchant" className="hover:text-white">Become a merchant</Link></li>
              <li><Link href="/merchant-portal" className="hover:text-white">Merchant portal</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-white/10 py-4 text-center text-xs">
          © {new Date().getFullYear()} {settings.siteName}. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
