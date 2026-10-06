import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Stat } from "@/components/Dashboard";
import { dateFmt, money, STATUS_STYLES } from "@/lib/format";
import { REWARDS } from "@/lib/config";

export const dynamic = "force-dynamic";
export const metadata = { title: "My account" };

export default async function AccountPage() {
  const user = await requireUser();
  const [orders, referralCount, pending] = await Promise.all([
    prisma.order.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, take: 5, include: { merchant: true } }),
    prisma.user.count({ where: { referredById: user.id } }),
    prisma.order.aggregate({ where: { userId: user.id, status: { notIn: ["DELIVERED", "CANCELLED"] } }, _sum: { pointsEarned: true, cashbackCents: true } }),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-5">
        <div className="flex items-center gap-3.5">
          <div className="relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-navy-100 text-navy-800 font-bold text-lg shadow-xs">
            {user.avatarUrl ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src={user.avatarUrl} alt={user.name} className="h-full w-full object-cover" />
            ) : (
              <span>{user.name.slice(0, 2).toUpperCase()}</span>
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-navy-900">Hi, {user.name.split(" ")[0]} 👋</h1>
              {user.kycStatus === "VERIFIED" || user.kycStatus === "BYPASSED" ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-bold text-emerald-800">
                  ✓ Verified
                </span>
              ) : user.kycStatus === "PENDING" ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 text-[11px] font-bold text-blue-800">
                  ⏳ KYC Pending
                </span>
              ) : (
                <Link
                  href="/account/kyc"
                  className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-[11px] font-bold text-amber-800 hover:bg-amber-200"
                >
                  Verify KYC →
                </Link>
              )}
            </div>
            <p className="text-xs text-slate-500">{user.email}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Link href="/account/wallet" className="btn btn-primary btn-sm font-semibold">Wallet & Points</Link>
          <Link href="/account/profile" className="btn btn-outline btn-sm">Edit Profile</Link>
          <Link href="/account/kyc" className="btn btn-secondary btn-sm">KYC Status</Link>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Points" value={user.points.toLocaleString()} sub={`Worth ${money(user.points * REWARDS.POINT_VALUE_CENTS)}`} tone="gold" />
        <Stat label="Cashback wallet" value={money(user.walletCents)} sub="Use at checkout" tone="green" />
        <Stat label="Pending rewards" value={`${pending._sum.pointsEarned ?? 0} pts`} sub={`+ ${money(pending._sum.cashbackCents ?? 0)} on delivery`} />
        <Stat label="Friends referred" value={String(referralCount)} sub={`Code: ${user.referralCode}`} />
      </div>

      <div className="card overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
          <h2 className="font-bold text-navy-900">Recent orders</h2>
          <Link href="/account/orders" className="text-xs font-semibold text-navy-700 hover:underline">View all</Link>
        </div>
        {orders.length === 0 ? (
          <p className="p-6 text-sm text-slate-500">No orders yet. <Link href="/shop" className="font-semibold underline">Start shopping</Link></p>
        ) : (
          <table className="w-full">
            <tbody className="divide-y divide-slate-100">
              {orders.map((o) => (
                <tr key={o.id}>
                  <td className="td font-medium">{o.number}</td>
                  <td className="td text-slate-500">{o.merchant.name}</td>
                  <td className="td text-slate-500">{dateFmt(o.createdAt)}</td>
                  <td className="td"><span className={`badge ${STATUS_STYLES[o.status]}`}>{o.status}</span></td>
                  <td className="td text-right font-semibold">{money(o.totalCents)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
