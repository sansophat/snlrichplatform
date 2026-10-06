import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Stat } from "@/components/Dashboard";
import { dateFmt, money } from "@/lib/format";
import { REWARDS } from "@/lib/config";

export const dynamic = "force-dynamic";
export const metadata = { title: "Points & cashback" };

const REASONS: Record<string, string> = {
  EARN: "Order reward",
  REDEEM: "Redeemed",
  CASHBACK: "Cashback",
  WALLET_PAY: "Wallet payment",
  REFERRAL: "Referral bonus",
  SIGNUP_BONUS: "Welcome bonus",
  REFERRED_BONUS: "Referred welcome bonus",
  REFUND: "Refund",
  ADJUST: "Adjustment",
};

export default async function RewardsPage() {
  const user = await requireUser();
  const tx = await prisma.transaction.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, take: 100 });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-navy-900">Points & cashback</h1>
      <div className="grid gap-4 sm:grid-cols-2">
        <Stat label="Points balance" value={user.points.toLocaleString()} sub={`Worth ${money(user.points * REWARDS.POINT_VALUE_CENTS)} at checkout`} tone="gold" />
        <Stat label="Cashback wallet" value={money(user.walletCents)} sub="Spend on any order" tone="green" />
      </div>
      <div className="card overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50"><tr><th className="th">Date</th><th className="th">Type</th><th className="th">Details</th><th className="th text-right">Amount</th></tr></thead>
          <tbody className="divide-y divide-slate-100">
            {tx.map((t) => (
              <tr key={t.id}>
                <td className="td text-slate-500">{dateFmt(t.createdAt)}</td>
                <td className="td">{REASONS[t.reason] ?? t.reason}</td>
                <td className="td text-slate-500">{t.note}</td>
                <td className={`td text-right font-semibold ${t.amount >= 0 ? "text-emerald-700" : "text-red-600"}`}>
                  {t.type === "POINTS" ? `${t.amount > 0 ? "+" : ""}${t.amount} pts` : `${t.amount > 0 ? "+" : ""}${money(t.amount)}`}
                </td>
              </tr>
            ))}
            {tx.length === 0 && <tr><td className="td text-slate-500" colSpan={4}>No activity yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
