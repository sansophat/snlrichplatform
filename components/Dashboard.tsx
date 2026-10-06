"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export type NavItem = { href: string; label: string; exact?: boolean };

export function SideNav({ title, items }: { title: string; items: NavItem[] }) {
  const path = usePathname();
  return (
    <aside className="md:w-56 md:shrink-0">
      <h2 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-400">{title}</h2>
      <nav className="flex gap-1 overflow-x-auto md:flex-col">
        {items.map((i) => {
          const active = i.exact ? path === i.href : path === i.href || path.startsWith(i.href + "/");
          return (
            <Link
              key={i.href}
              href={i.href}
              className={`whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium ${active ? "bg-navy-800 text-white" : "text-slate-600 hover:bg-slate-100"}`}
            >
              {i.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

export function Stat({ label, value, sub, tone = "navy" }: { label: string; value: string; sub?: string; tone?: "navy" | "gold" | "green" | "red" }) {
  const tones = { navy: "text-navy-900", gold: "text-gold-600", green: "text-emerald-700", red: "text-red-600" };
  return (
    <div className="card p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <p className={`mt-1 text-2xl font-extrabold ${tones[tone]}`}>{value}</p>
      {sub && <p className="text-xs text-slate-400">{sub}</p>}
    </div>
  );
}
