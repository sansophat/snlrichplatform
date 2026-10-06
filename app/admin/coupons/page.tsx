import { prisma } from "@/lib/db";
import { money } from "@/lib/format";
import { toggleCouponAction } from "@/app/actions/admin";
import { SubmitButton } from "@/components/SubmitButton";
import { CouponForm } from "./CouponForm";

export const dynamic = "force-dynamic";
export const metadata = { title: "Coupons" };

export default async function AdminCoupons() {
  const coupons = await prisma.coupon.findMany({ orderBy: { createdAt: "desc" } });
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-navy-900">Coupons</h1>
      <CouponForm />
      <div className="card overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50"><tr><th className="th">Code</th><th className="th">Discount</th><th className="th">Min subtotal</th><th className="th">Uses left</th><th className="th">Status</th><th className="th" /></tr></thead>
          <tbody className="divide-y divide-slate-100">
            {coupons.map((c) => (
              <tr key={c.id}>
                <td className="td font-mono font-semibold">{c.code}</td>
                <td className="td">{c.percentOff}%</td>
                <td className="td">{money(c.minSubtotalCents)}</td>
                <td className="td">{c.usesLeft ?? "∞"}</td>
                <td className="td"><span className={`badge ${c.active ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-600"}`}>{c.active ? "Active" : "Disabled"}</span></td>
                <td className="td text-right">
                  <form action={toggleCouponAction}><input type="hidden" name="id" value={c.id} /><SubmitButton className="btn btn-outline btn-sm" pendingText="…">{c.active ? "Disable" : "Enable"}</SubmitButton></form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
