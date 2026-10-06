import { requireMerchant } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { dateFmt, money, STATUS_STYLES } from "@/lib/format";
import { NEXT_STATUS } from "@/lib/config";
import { merchantOrderStatusAction, updateOrderTrackingAction } from "@/app/actions/merchant";
import { SubmitButton } from "@/components/SubmitButton";
import { Truck, PackageCheck, AlertCircle, Clock, CheckCircle } from "lucide-react";

export const dynamic = "force-dynamic";
export const metadata = { title: "Order Management | Merchant Portal" };

export default async function MerchantOrders() {
  const { merchant } = await requireMerchant();
  const orders = await prisma.order.findMany({
    where: { merchantId: merchant.id },
    orderBy: { createdAt: "desc" },
    include: { items: true, user: { select: { name: true, email: true } } },
  });

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-100 pb-4">
        <h1 className="text-2xl font-bold text-navy-900">Orders & Fulfillment</h1>
        <p className="text-xs text-slate-500">Track incoming customer orders, assign shipping tracking numbers, and fulfill packages.</p>
      </div>

      {orders.length === 0 && (
        <div className="card p-12 text-center text-slate-500">
          <Truck size={36} className="mx-auto mb-2 opacity-40 text-slate-400" />
          <p className="font-semibold text-slate-700">No orders received yet.</p>
          <p className="text-xs text-slate-400 mt-1">Orders placed by customers for your store will appear here in real time.</p>
        </div>
      )}

      {orders.map((o) => {
        const netEarnings = Math.max(0, o.totalCents - o.commissionCents);
        return (
          <div key={o.id} className="card overflow-hidden border border-slate-200/90 shadow-xs">
            {/* Order Header */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 bg-slate-50/70 px-5 py-3 text-sm">
              <div className="flex items-center gap-3">
                <span className="font-black text-navy-900 text-base">{o.number}</span>
                <span className="text-xs text-slate-400">{dateFmt(o.createdAt)}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500">Payment: <b className="text-slate-800">{o.paymentMethod}</b> ({o.paymentStatus})</span>
                <span className={`badge ${STATUS_STYLES[o.status] ?? "bg-slate-100 text-slate-700"}`}>{o.status}</span>
              </div>
            </div>

            {/* Order Details Body */}
            <div className="grid gap-6 p-5 text-sm md:grid-cols-2">
              {/* Shipping info */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Customer Delivery Info</h4>
                <div className="rounded-lg bg-slate-50/70 p-3 border border-slate-100">
                  <p className="font-semibold text-slate-800">{o.shippingName}</p>
                  <p className="text-xs text-slate-600 mt-0.5">Phone: {o.shippingPhone}</p>
                  <p className="text-xs text-slate-600 mt-0.5">Email: {o.user.email}</p>
                  <p className="whitespace-pre-line text-xs text-slate-600 mt-1.5 pt-1.5 border-t border-slate-200/60 font-medium">
                    {o.shippingAddress}
                  </p>
                </div>

                {/* Fulfillment / Shipping Carrier & Tracking Form */}
                <form action={updateOrderTrackingAction} className="rounded-lg border border-slate-200 bg-white p-3.5 space-y-2.5">
                  <input type="hidden" name="orderId" value={o.id} />
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-navy-900 flex items-center gap-1.5">
                      <Truck size={14} className="text-navy-600" /> Carrier & Tracking Info
                    </span>
                    <SubmitButton className="btn btn-outline btn-sm !py-1 !px-2.5 text-xs" pendingText="Saving…">
                      Save Tracking
                    </SubmitButton>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      name="carrier"
                      defaultValue={o.carrier ?? ""}
                      placeholder="Carrier (e.g. FedEx, DHL)"
                      className="input text-xs !py-1.5"
                    />
                    <input
                      name="trackingNumber"
                      defaultValue={o.trackingNumber ?? ""}
                      placeholder="Tracking Number #"
                      className="input text-xs !py-1.5 font-mono"
                    />
                  </div>
                  <input
                    name="merchantNotes"
                    defaultValue={o.merchantNotes ?? ""}
                    placeholder="Merchant internal fulfillment note..."
                    className="input text-xs !py-1.5"
                  />
                </form>
              </div>

              {/* Items & Financials */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Ordered Items</h4>
                <ul className="divide-y divide-slate-100 rounded-lg border border-slate-100 p-2">
                  {o.items.map((i) => (
                    <li key={i.id} className="flex justify-between py-1.5 text-xs">
                      <span className="font-medium text-slate-800">{i.quantity}× {i.name}</span>
                      <span className="font-semibold text-slate-900">{money(i.priceCents * i.quantity)}</span>
                    </li>
                  ))}
                </ul>

                {/* Financial Summary */}
                <div className="rounded-xl border border-slate-200/80 bg-slate-50/50 p-3.5 space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal</span>
                    <span>{money(o.subtotalCents)}</span>
                  </div>
                  {o.discountCents > 0 && (
                    <div className="flex justify-between text-emerald-700 font-medium">
                      <span>Discount / Coupon</span>
                      <span>-{money(o.discountCents)}</span>
                    </div>
                  )}
                  {o.shippingCents > 0 && (
                    <div className="flex justify-between text-slate-600">
                      <span>Shipping Fee</span>
                      <span>+{money(o.shippingCents)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-red-600 pt-1 border-t border-slate-200">
                    <span>Platform Commission ({merchant.commissionPct}%)</span>
                    <span>-{money(o.commissionCents)}</span>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-slate-300 font-extrabold text-sm text-navy-900">
                    <span>Your Net Payout</span>
                    <span className="text-emerald-700">{money(netEarnings)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Status transitions footer */}
            {NEXT_STATUS[o.status].length > 0 && (
              <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 bg-slate-50/40 px-5 py-3">
                <span className="text-xs text-slate-500">Update order status:</span>
                <div className="flex flex-wrap gap-2">
                  {NEXT_STATUS[o.status].map((s) => (
                    <form key={s} action={merchantOrderStatusAction}>
                      <input type="hidden" name="orderId" value={o.id} />
                      <input type="hidden" name="status" value={s} />
                      <SubmitButton
                        className={`btn btn-sm ${
                          s === "CANCELLED"
                            ? "btn-danger"
                            : s === "DELIVERED"
                            ? "btn-primary !bg-emerald-600 hover:!bg-emerald-700"
                            : "btn-primary"
                        }`}
                        pendingText="Updating…"
                      >
                        {s === "CANCELLED" ? "Cancel Order" : `Mark ${s.toLowerCase()}`}
                      </SubmitButton>
                    </form>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
