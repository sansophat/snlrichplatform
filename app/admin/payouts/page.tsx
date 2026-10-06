import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { dateFmt, money } from "@/lib/format";
import { reviewPayoutAction } from "@/app/actions/admin";
import { SubmitButton } from "@/components/SubmitButton";
import { CreditCard, Check, X, Clock, Wallet } from "lucide-react";

export const dynamic = "force-dynamic";
export const metadata = { title: "Merchant Payout Requests | Admin" };

export default async function AdminPayoutsPage() {
  await requireAdmin();

  const payouts = await prisma.payoutRequest.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      merchant: { select: { name: true, slug: true, walletCents: true, owner: { select: { email: true } } } },
    },
  });

  const pendingTotal = payouts
    .filter((p) => p.status === "PENDING")
    .reduce((acc, p) => acc + p.amountCents, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">Merchant Payout Requests</h1>
          <p className="text-xs text-slate-500">
            Review and disburse withdrawal requests from merchant store wallets.
          </p>
        </div>
      </div>

      <div className="card overflow-x-auto border border-slate-200/90 shadow-xs">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs font-bold text-slate-600">
            <tr>
              <th className="th">Merchant / Store</th>
              <th className="th">Amount</th>
              <th className="th">Method</th>
              <th className="th">Payout Destination</th>
              <th className="th">Status</th>
              <th className="th">Requested</th>
              <th className="th text-right">Actions</th>
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
                  : "bg-amber-100 text-amber-800 font-bold";

              return (
                <tr key={p.id} className="hover:bg-slate-50/60 transition">
                  <td className="td">
                    <div className="font-semibold text-navy-900">{p.merchant.name}</div>
                    <div className="text-xs text-slate-400">{p.merchant.owner.email}</div>
                  </td>
                  <td className="td font-extrabold text-navy-900">{money(p.amountCents)}</td>
                  <td className="td text-xs font-medium text-slate-700">{p.method}</td>
                  <td className="td text-xs font-mono text-slate-600 max-w-xs truncate">{p.details}</td>
                  <td className="td">
                    <span className={`badge ${statusTone}`}>{p.status}</span>
                  </td>
                  <td className="td text-xs text-slate-400">{dateFmt(p.createdAt)}</td>
                  <td className="td text-right">
                    {p.status === "PENDING" && (
                      <div className="flex justify-end gap-1.5">
                        <form action={reviewPayoutAction}>
                          <input type="hidden" name="id" value={p.id} />
                          <input type="hidden" name="status" value="PAID" />
                          <input type="hidden" name="notes" value="Disbursed by administrator" />
                          <SubmitButton className="btn btn-primary btn-sm !py-1 !px-2.5 text-xs !bg-emerald-600 hover:!bg-emerald-700" pendingText="…">
                            <Check size={12} className="mr-1" /> Mark Paid
                          </SubmitButton>
                        </form>
                        <form action={reviewPayoutAction}>
                          <input type="hidden" name="id" value={p.id} />
                          <input type="hidden" name="status" value="REJECTED" />
                          <input type="hidden" name="notes" value="Rejected by admin (funds refunded to merchant wallet)" />
                          <SubmitButton className="btn btn-danger btn-sm !py-1 !px-2 text-xs" pendingText="…">
                            Reject
                          </SubmitButton>
                        </form>
                      </div>
                    )}
                    {p.status !== "PENDING" && (
                      <span className="text-xs text-slate-400 italic">{p.notes || "Completed"}</span>
                    )}
                  </td>
                </tr>
              );
            })}
            {payouts.length === 0 && (
              <tr>
                <td colSpan={7} className="td text-center text-slate-400 py-10">
                  No payout requests submitted yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
