import Link from "next/link";
import { requireMerchant } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Stat } from "@/components/Dashboard";
import { dateFmt, money, STATUS_STYLES } from "@/lib/format";

export const dynamic = "force-dynamic";
export const metadata = { title: "Merchant dashboard" };

export default async function MerchantDashboard() {
  const { merchant } = await requireMerchant();
  const [sales, open, productCount, lowStock, recent, rewardsCost] = await Promise.all([
    prisma.order.aggregate({ where: { merchantId: merchant.id, status: { not: "CANCELLED" } }, _sum: { subtotalCents: true, discountCents: true, commissionCents: true }, _count: true }),
    prisma.order.count({ where: { merchantId: merchant.id, status: { in: ["PENDING", "PROCESSING", "SHIPPED"] } } }),
    prisma.product.count({ where: { merchantId: merchant.id, active: true } }),
    prisma.product.findMany({ where: { merchantId: merchant.id, active: true, stock: { lte: 5 } }, take: 5, orderBy: { stock: "asc" } }),
    prisma.order.findMany({ where: { merchantId: merchant.id }, orderBy: { createdAt: "desc" }, take: 6, include: { user: { select: { name: true } } } }),
    prisma.order.aggregate({ where: { merchantId: merchant.id, status: "DELIVERED" }, _sum: { cashbackCents: true, pointsEarned: true } }),
  ]);

  const gross = (sales._sum.subtotalCents ?? 0) - (sales._sum.discountCents ?? 0);
  const commission = sales._sum.commissionCents ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-2xl shadow-xs overflow-hidden border border-slate-200">
            {merchant.logoUrl ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src={merchant.logoUrl} alt={merchant.name} className="h-full w-full object-cover" />
            ) : (
              <span>{merchant.emoji}</span>
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-navy-900">{merchant.name}</h1>
              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-bold text-emerald-800">
                {merchant.status}
              </span>
            </div>
            <p className="text-xs text-slate-500">Merchant Store Management & Sales Analytics</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/store/${merchant.slug}`} target="_blank" className="btn btn-outline btn-sm">
            View Public Store ↗
          </Link>
          <Link href="/merchant-portal/products/new" className="btn btn-primary btn-sm">
            + Add product
          </Link>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Withdrawable Wallet" value={money(merchant.walletCents)} sub="Ready to withdraw" tone="green" />
        <Stat label="Gross sales" value={money(gross)} sub={`${sales._count} orders`} />
        <Stat label="Platform fee" value={money(commission)} sub={`${merchant.commissionPct}% commission`} tone="red" />
        <Stat label="Open orders" value={String(open)} sub={`${productCount} active products`} tone="gold" />
      </div>
      <div className="card p-4 text-sm text-slate-600">
        Your reward programme: <b>{merchant.pointsRate}× points</b> and <b>{merchant.cashbackPct}% cashback</b>. Delivered so far: {rewardsCost._sum.pointsEarned ?? 0} pts and {money(rewardsCost._sum.cashbackCents ?? 0)} cashback issued to customers.{" "}
        <Link href="/merchant-portal/settings" className="font-semibold text-navy-700 underline">Edit rates</Link>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card overflow-hidden">
          <h2 className="border-b border-slate-100 px-4 py-3 font-bold text-navy-900">Recent orders</h2>
          <table className="w-full"><tbody className="divide-y divide-slate-100">
            {recent.map((o) => (
              <tr key={o.id}><td className="td font-medium">{o.number}</td><td className="td text-slate-500">{o.user.name}</td><td className="td"><span className={`badge ${STATUS_STYLES[o.status]}`}>{o.status}</span></td><td className="td text-right">{money(o.totalCents)}</td></tr>
            ))}
            {recent.length === 0 && <tr><td className="td text-slate-500">No orders yet.</td></tr>}
          </tbody></table>
        </div>
        <div className="card overflow-hidden">
          <h2 className="border-b border-slate-100 px-4 py-3 font-bold text-navy-900">Low stock</h2>
          <table className="w-full"><tbody className="divide-y divide-slate-100">
            {lowStock.map((p) => (
              <tr key={p.id}><td className="td">{p.name}</td><td className="td text-right font-semibold text-red-600">{p.stock} left</td><td className="td text-right"><Link className="text-xs font-semibold text-navy-700 underline" href={`/merchant-portal/products/${p.id}`}>Restock</Link></td></tr>
            ))}
            {lowStock.length === 0 && <tr><td className="td text-slate-500">All products are well stocked. ({dateFmt(new Date())})</td></tr>}
          </tbody></table>
        </div>
      </div>
    </div>
  );
}
