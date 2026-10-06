import { prisma } from "@/lib/db";
import { dateFmt, money } from "@/lib/format";
import { adjustRewardsAction } from "@/app/actions/admin";
import { SubmitButton } from "@/components/SubmitButton";

export const dynamic = "force-dynamic";
export const metadata = { title: "Users" };

export default async function AdminUsers() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
    include: { _count: { select: { referrals: true, orders: true } } },
  });
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-navy-900">Users & rewards</h1>
      <div className="card overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50"><tr><th className="th">User</th><th className="th">Role</th><th className="th">Joined</th><th className="th">Points</th><th className="th">Wallet</th><th className="th">Refs / Orders</th><th className="th">Adjust (±pts, ±amount, note)</th></tr></thead>
          <tbody className="divide-y divide-slate-100">
            {users.map((u) => (
              <tr key={u.id}>
                <td className="td"><div className="font-medium">{u.name}</div><div className="text-xs text-slate-500">{u.email}</div></td>
                <td className="td"><span className="badge bg-slate-100 text-slate-700">{u.role}</span></td>
                <td className="td text-slate-500">{dateFmt(u.createdAt)}</td>
                <td className="td font-semibold text-gold-600">{u.points}</td>
                <td className="td font-semibold text-emerald-700">{money(u.walletCents)}</td>
                <td className="td">{u._count.referrals} / {u._count.orders}</td>
                <td className="td">
                  <form action={adjustRewardsAction} className="flex items-center gap-1">
                    <input type="hidden" name="userId" value={u.id} />
                    <input name="points" type="number" placeholder="pts" className="input w-20 py-1.5" />
                    <input name="cash" inputMode="decimal" placeholder="0.00" className="input w-20 py-1.5" />
                    <input name="note" placeholder="Note" className="input w-28 py-1.5" />
                    <SubmitButton className="btn btn-outline btn-sm" pendingText="…">Apply</SubmitButton>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
