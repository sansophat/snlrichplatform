import { prisma } from "@/lib/db";
import { dateFmt, money, STATUS_STYLES } from "@/lib/format";
import { NEXT_STATUS } from "@/lib/config";
import { adminOrderStatusAction } from "@/app/actions/admin";
import { SubmitButton } from "@/components/SubmitButton";

export const dynamic = "force-dynamic";
export const metadata = { title: "All orders" };

export default async function AdminOrders() {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
    include: { merchant: { select: { name: true } }, user: { select: { name: true } } },
  });
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-navy-900">All orders</h1>
      <div className="card overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50"><tr><th className="th">Order</th><th className="th">Customer</th><th className="th">Store</th><th className="th">Date</th><th className="th">Total</th><th className="th">Status</th><th className="th">Action</th></tr></thead>
          <tbody className="divide-y divide-slate-100">
            {orders.map((o) => (
              <tr key={o.id}>
                <td className="td font-medium">{o.number}</td>
                <td className="td">{o.user.name}</td>
                <td className="td text-slate-500">{o.merchant.name}</td>
                <td className="td text-slate-500">{dateFmt(o.createdAt)}</td>
                <td className="td">{money(o.totalCents)}</td>
                <td className="td"><span className={`badge ${STATUS_STYLES[o.status]}`}>{o.status}</span></td>
                <td className="td">
                  <div className="flex gap-1">
                    {NEXT_STATUS[o.status].map((s) => (
                      <form key={s} action={adminOrderStatusAction}>
                        <input type="hidden" name="orderId" value={o.id} /><input type="hidden" name="status" value={s} />
                        <SubmitButton className={`btn btn-sm ${s === "CANCELLED" ? "btn-danger" : "btn-outline"}`} pendingText="…">{s.toLowerCase()}</SubmitButton>
                      </form>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
            {orders.length === 0 && <tr><td className="td text-slate-500" colSpan={7}>No orders yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
