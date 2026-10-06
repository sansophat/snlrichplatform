import { prisma } from "@/lib/db";
import { dateFmt, STATUS_STYLES } from "@/lib/format";
import { setCommissionAction, setMerchantStatusAction } from "@/app/actions/admin";
import { SubmitButton } from "@/components/SubmitButton";
import { AddMerchantModal } from "./AddMerchantModal";

export const dynamic = "force-dynamic";
export const metadata = { title: "Merchants" };

export default async function AdminMerchants() {
  const merchants = await prisma.merchant.findMany({
    orderBy: { createdAt: "desc" },
    include: { owner: { select: { email: true } }, _count: { select: { products: true, orders: true } } },
  });
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-navy-900">Merchants</h1>
        <AddMerchantModal />
      </div>
      <div className="card overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50"><tr><th className="th">Store</th><th className="th">Owner</th><th className="th">Applied</th><th className="th">Products / Orders</th><th className="th">Commission</th><th className="th">Status</th><th className="th" /></tr></thead>
          <tbody className="divide-y divide-slate-100">
            {merchants.map((m) => (
              <tr key={m.id}>
                <td className="td font-medium">{m.emoji} {m.name}</td>
                <td className="td text-slate-500">{m.owner.email}</td>
                <td className="td text-slate-500">{dateFmt(m.createdAt)}</td>
                <td className="td">{m._count.products} / {m._count.orders}</td>
                <td className="td">
                  <form action={setCommissionAction} className="flex items-center gap-1">
                    <input type="hidden" name="id" value={m.id} />
                    <input name="commission" type="number" step="0.5" min={0} max={50} defaultValue={m.commissionPct} className="input w-20 py-1.5" />
                    <span className="text-xs">%</span>
                    <SubmitButton className="btn btn-outline btn-sm" pendingText="…">Set</SubmitButton>
                  </form>
                </td>
                <td className="td"><span className={`badge ${STATUS_STYLES[m.status] ?? "bg-amber-100 text-amber-800"}`}>{m.status}</span></td>
                <td className="td">
                  <div className="flex gap-2">
                    {m.status !== "ACTIVE" && (
                      <form action={setMerchantStatusAction}><input type="hidden" name="id" value={m.id} /><input type="hidden" name="status" value="ACTIVE" /><SubmitButton className="btn btn-primary btn-sm" pendingText="…">Approve</SubmitButton></form>
                    )}
                    {m.status === "ACTIVE" && (
                      <form action={setMerchantStatusAction}><input type="hidden" name="id" value={m.id} /><input type="hidden" name="status" value="SUSPENDED" /><SubmitButton className="btn btn-danger btn-sm" pendingText="…">Suspend</SubmitButton></form>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {merchants.length === 0 && <tr><td className="td text-slate-500" colSpan={7}>No merchants yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
