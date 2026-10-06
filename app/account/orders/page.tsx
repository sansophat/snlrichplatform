import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { dateFmt, money, STATUS_STYLES } from "@/lib/format";
import { cancelMyOrder } from "@/app/actions/shop";
import { SubmitButton } from "@/components/SubmitButton";
import Link from "next/link";

export const dynamic = "force-dynamic";
export const metadata = { title: "My orders" };

export default async function OrdersPage({ searchParams }: { searchParams: Promise<{ placed?: string }> }) {
  const { placed } = await searchParams;
  const user = await requireUser();
  const orders = await prisma.order.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: { merchant: true, items: { include: { product: { select: { slug: true } } } } },
  });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-navy-900">My orders</h1>
      {placed && (
        <div className="rounded-xl bg-emerald-50 p-4 text-sm text-emerald-800">
          🎉 Order placed! Points and cashback will be credited when your order is delivered.
        </div>
      )}
      {orders.length === 0 && <p className="text-slate-500">You haven&apos;t placed any orders yet.</p>}
      {orders.map((o) => (
        <div key={o.id} className="card overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 bg-slate-50 px-4 py-3 text-sm">
            <div>
              <span className="font-bold text-navy-900">{o.number}</span>
              <span className="ml-3 text-slate-500">{dateFmt(o.createdAt)} · {o.merchant.name}</span>
            </div>
            <span className={`badge ${STATUS_STYLES[o.status]}`}>{o.status}</span>
          </div>
          <ul className="divide-y divide-slate-100 text-sm">
            {o.items.map((i) => (
              <li key={i.id} className="flex justify-between px-4 py-2">
                <Link href={`/product/${i.product.slug}`} className="hover:underline">{i.quantity}× {i.name}</Link>
                <span>{money(i.priceCents * i.quantity)}</span>
              </li>
            ))}
          </ul>
          <div className="space-y-1 border-t border-slate-100 px-4 py-3 text-sm">
            <div className="flex justify-between text-slate-500"><span>Subtotal</span><span>{money(o.subtotalCents)}</span></div>
            {o.discountCents > 0 && <div className="flex justify-between text-emerald-700"><span>Coupon {o.couponCode}</span><span>-{money(o.discountCents)}</span></div>}
            {o.pointsUsed > 0 && <div className="flex justify-between text-emerald-700"><span>{o.pointsUsed} points redeemed</span><span>-{money(o.pointsDiscountCents)}</span></div>}
            {o.walletUsedCents > 0 && <div className="flex justify-between text-emerald-700"><span>Wallet</span><span>-{money(o.walletUsedCents)}</span></div>}
            <div className="flex justify-between text-slate-500"><span>Shipping</span><span>{o.shippingCents ? money(o.shippingCents) : "Free"}</span></div>
            <div className="flex justify-between text-base font-bold text-navy-900">
              <span>
                Total (
                {o.paymentMethod === "WALLET"
                  ? "100% Wallet"
                  : o.paymentMethod === "POINTS"
                  ? "100% Points"
                  : o.paymentMethod}{" "}
                · {o.paymentStatus})
              </span>
              <span>{money(o.totalCents)}</span>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
              <p className="text-xs text-slate-500">
                {o.status === "DELIVERED" ? "Earned" : o.status === "CANCELLED" ? "No rewards" : "Will earn"}:{" "}
                <b>{o.pointsEarned} pts</b> + <b>{money(o.cashbackCents)}</b> cashback
              </p>
              {o.status === "PENDING" && (
                <form action={cancelMyOrder}>
                  <input type="hidden" name="orderId" value={o.id} />
                  <SubmitButton className="btn btn-danger btn-sm">Cancel order</SubmitButton>
                </form>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
