import Link from "next/link";
import { prisma } from "@/lib/db";
import { Stat } from "@/components/Dashboard";
import { money } from "@/lib/format";

export const dynamic = "force-dynamic";
export const metadata = { title: "Admin" };

export default async function AdminHome() {
  const [users, merchants, pendingMerchants, pendingProducts, products, orders, sales, liabilities] = await Promise.all([
    prisma.user.count(),
    prisma.merchant.count({ where: { status: "ACTIVE" } }),
    prisma.merchant.count({ where: { status: "PENDING" } }),
    prisma.product.count({ where: { approvalStatus: "PENDING" } }),
    prisma.product.count({ where: { active: true } }),
    prisma.order.count(),
    prisma.order.aggregate({ where: { status: { not: "CANCELLED" } }, _sum: { subtotalCents: true, discountCents: true, commissionCents: true } }),
    prisma.user.aggregate({ _sum: { points: true, walletCents: true } }),
  ]);
  const gmv = (sales._sum.subtotalCents ?? 0) - (sales._sum.discountCents ?? 0);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-navy-900">Platform overview</h1>
      <div className="flex flex-col gap-2">
        {pendingMerchants > 0 && (
          <Link href="/admin/merchants" className="block rounded-xl bg-amber-50 p-4 text-sm font-semibold text-amber-800 border border-amber-200">
            {pendingMerchants} merchant application{pendingMerchants > 1 ? "s" : ""} waiting for review →
          </Link>
        )}
        {pendingProducts > 0 && (
          <Link href="/admin/products" className="block rounded-xl bg-blue-50 p-4 text-sm font-semibold text-blue-800 border border-blue-200">
            {pendingProducts} product{pendingProducts > 1 ? "s" : ""} waiting for review & approval →
          </Link>
        )}
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="GMV" value={money(gmv)} sub={`${orders} orders`} />
        <Stat label="Commission" value={money(sales._sum.commissionCents ?? 0)} tone="green" />
        <Stat label="Users" value={String(users)} />
        <Stat label="Active merchants" value={String(merchants)} sub={`${products} products`} />
        <Stat label="Points outstanding" value={(liabilities._sum.points ?? 0).toLocaleString()} tone="gold" sub="Liability to customers" />
        <Stat label="Wallet outstanding" value={money(liabilities._sum.walletCents ?? 0)} tone="gold" sub="Cashback liability" />
      </div>
    </div>
  );
}
