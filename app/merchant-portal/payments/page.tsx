import { requireMerchant } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { dateFmt, money, STATUS_STYLES } from "@/lib/format";
import { PayoutForm } from "./PayoutForm";
import { Wallet, ArrowDownRight, TrendingUp, Clock, CheckCircle, AlertCircle } from "lucide-react";

export const dynamic = "force-dynamic";
export const metadata = { title: "Wallet & Payments | Merchant Portal" };

export default async function MerchantPaymentsPage() {
  const { merchant } = await requireMerchant();

  const [payouts, deliveredOrders] = await Promise.all([
    prisma.payoutRequest.findMany({
      where: { merchantId: merchant.id },
      orderBy: { createdAt: "desc" },
    }),
    prisma.order.findMany({
      where: { merchantId: merchant.id, status: "DELIVERED" },
      select: { totalCents: true, commissionCents: true },
    }),
  ]);

  const lifetimeGross = deliveredOrders.reduce((acc, o) => acc + o.totalCents, 0);
  const lifetimeFees = deliveredOrders.reduce((acc, o) => acc + o.commissionCents, 0);
  const lifetimeNet = lifetimeGross - lifetimeFees;
  const totalPaidOut = payouts
    .filter((p) => p.status === "PAID")
    .reduce((acc, p) => acc + p.amountCents, 0);
  const pendingPayouts = payouts
    .filter((p) => p.status === "PENDING" || p.status === "APPROVED")
    .reduce((acc, p) => acc + p.amountCents, 0);

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-100 pb-4">
        <h1 className="text-2xl font-bold text-navy-900">Wallet, Earnings & Payouts</h1>
        <p className="text-xs text-slate-500">Monitor order proceeds, request balance withdrawals, and track payout statuses.</p>
      </div>

      {/* Financial Overview Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">Available Wallet</span>
            <Wallet size={20} className="text-emerald-700" />
          </div>
          <p className="mt-2 text-3xl font-black text-emerald-950">{money(merchant.walletCents)}</p>
          <p className="mt-1 text-[11px] text-emerald-700">Ready to withdraw</p>
        </div>

        <div className="rounded-2xl border border-blue-200 bg-blue-50/60 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-800">Pending Payouts</span>
            <Clock size={20} className="text-blue-700" />
          </div>
          <p className="mt-2 text-3xl font-black text-blue-950">{money(pendingPayouts)}</p>
          <p className="mt-1 text-[11px] text-blue-700">Processing by admin</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Paid Out</span>
            <CheckCircle size={20} className="text-slate-400" />
          </div>
          <p className="mt-2 text-3xl font-black text-navy-900">{money(totalPaidOut)}</p>
          <p className="mt-1 text-[11px] text-slate-400">Transferred to your bank</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Lifetime Earnings</span>
            <TrendingUp size={20} className="text-slate-400" />
          </div>
          <p className="mt-2 text-3xl font-black text-navy-900">{money(lifetimeNet)}</p>
          <p className="mt-1 text-[11px] text-slate-400">Net of {money(lifetimeFees)} platform fees</p>
        </div>
      </div>

      {/* Payout Request Form */}
      <PayoutForm
        availableCents={merchant.walletCents}
        defaultMethod={merchant.payoutMethod}
        defaultDetails={merchant.payoutDetails}
      />

      {/* Payout History Table */}
      <div className="card overflow-hidden border border-slate-200/90 shadow-xs">
        <div className="border-b border-slate-100 bg-slate-50/70 px-5 py-3.5 flex items-center justify-between">
          <h3 className="font-bold text-navy-900 text-sm">Payout History</h3>
          <span className="text-xs text-slate-500">{payouts.length} requests</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50/50 text-xs font-semibold text-slate-500">
              <tr>
                <th className="th">Date</th>
                <th className="th">Amount</th>
                <th className="th">Method</th>
                <th className="th">Destination Details</th>
                <th className="th">Status</th>
                <th className="th">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {payouts.map((p) => {
                const statusTone =
                  p.status === "PAID"
                    ? "bg-emerald-100 text-emerald-800"
                    : p.status === "APPROVED"
                    ? "bg-blue-100 text-blue-800"
                    : p.status === "REJECTED"
                    ? "bg-red-100 text-red-800"
                    : "bg-amber-100 text-amber-800";
                return (
                  <tr key={p.id} className="hover:bg-slate-50/60 transition">
                    <td className="td text-slate-500 text-xs">{dateFmt(p.createdAt)}</td>
                    <td className="td font-bold text-navy-900">{money(p.amountCents)}</td>
                    <td className="td text-xs font-semibold text-slate-700">{p.method}</td>
                    <td className="td text-xs text-slate-600 max-w-xs truncate">{p.details}</td>
                    <td className="td">
                      <span className={`badge ${statusTone}`}>{p.status}</span>
                    </td>
                    <td className="td text-xs text-slate-400">{p.notes || "—"}</td>
                  </tr>
                );
              })}
              {payouts.length === 0 && (
                <tr>
                  <td colSpan={6} className="td text-center text-slate-400 py-8">
                    No withdrawal requests submitted yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
