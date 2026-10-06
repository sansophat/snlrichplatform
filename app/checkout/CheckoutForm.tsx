"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Coins, Wallet, CreditCard, Banknote, Building2, ShieldCheck, AlertCircle, Lock, QrCode, Copy, Check, Smartphone } from "lucide-react";
import Image from "next/image";
import { useCart } from "@/components/CartProvider";
import { placeOrderAction } from "@/app/actions/shop";
import { money } from "@/lib/format";
import { REWARDS, SHIPPING } from "@/lib/config";

type PlatformBank = {
  id: string;
  bankName: string;
  bankCode: string | null;
  accountName: string;
  accountNumber: string;
  currency: string;
  qrImageUrl: string | null;
  logoUrl: string | null;
  instructions: string | null;
};

export function CheckoutForm({
  userName,
  points,
  walletCents,
  kycStatus,
  isVerified,
  banks = [],
}: {
  userName: string;
  points: number;
  walletCents: number;
  kycStatus: string;
  isVerified: boolean;
  banks?: PlatformBank[];
}) {
  const { items, subtotalCents, clear, ready } = useCart();
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState("");
  const [usePoints, setUsePoints] = useState(false);
  const [useWallet, setUseWallet] = useState(false);
  const [payment, setPayment] = useState<"WALLET" | "POINTS" | "COD" | "CARD" | "BANK">("COD");
  const [coupon, setCoupon] = useState("");
  const [selectedBankId, setSelectedBankId] = useState<string>(banks.length > 0 ? banks[0].id : "");
  const [copiedAccount, setCopiedAccount] = useState(false);

  if (!ready) return <p className="text-slate-500">Loading…</p>;
  if (items.length === 0) {
    return (
      <div className="card p-10 text-center">
        <p className="text-slate-600">Your cart is empty.</p>
        <Link href="/shop" className="btn btn-primary mt-4">Continue shopping</Link>
      </div>
    );
  }

  // Client-side estimate. The server recalculates everything authoritatively.
  const bySeller = new Map<string, number>();
  for (const i of items) bySeller.set(i.merchantId, (bySeller.get(i.merchantId) ?? 0) + i.priceCents * i.quantity);
  const shipping = [...bySeller.values()].reduce((s, v) => s + (v >= SHIPPING.FREE_OVER_CENTS ? 0 : SHIPPING.FLAT_CENTS), 0);
  const orderTotalBeforeCredits = subtotalCents + shipping;

  const pointsValueMax = points * REWARDS.POINT_VALUE_CENTS;
  const canPayWithWallet = isVerified && walletCents >= orderTotalBeforeCredits;
  const canPayWithPoints = isVerified && pointsValueMax >= orderTotalBeforeCredits;

  let pointsDiscount = 0;
  let walletDiscount = 0;
  let finalEstTotal = orderTotalBeforeCredits;

  if (payment === "WALLET") {
    walletDiscount = orderTotalBeforeCredits;
    finalEstTotal = 0;
  } else if (payment === "POINTS") {
    pointsDiscount = orderTotalBeforeCredits;
    finalEstTotal = 0;
  } else {
    pointsDiscount = usePoints && isVerified ? Math.min(subtotalCents, pointsValueMax) : 0;
    walletDiscount = useWallet && isVerified ? Math.min(subtotalCents - pointsDiscount, walletCents) : 0;
    finalEstTotal = subtotalCents - pointsDiscount - walletDiscount + shipping;
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const fd = new FormData(e.currentTarget);
    start(async () => {
      const res = await placeOrderAction({
        items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
        shippingName: String(fd.get("name")),
        shippingPhone: String(fd.get("phone")),
        shippingAddress: String(fd.get("address")),
        paymentMethod: payment,
        usePoints: payment === "POINTS" ? false : usePoints,
        useWallet: payment === "WALLET" ? false : useWallet,
        couponCode: coupon || undefined,
      });
      if (res.error) return setError(res.error);
      clear();
      router.push(`/account/orders?placed=${res.groupId}`);
    });
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-8 lg:grid-cols-[1fr_380px]">
      <div className="space-y-6">
        {/* Verification Status Trust Banner */}
        {isVerified ? (
          <div className="flex items-center gap-2.5 rounded-2xl bg-emerald-50/80 p-4 border border-emerald-200/80 text-xs text-emerald-800">
            <ShieldCheck size={18} className="text-emerald-600 shrink-0" />
            <div>
              <span className="font-bold">Verified Account:</span> You can use your SNLRICH Wallet balance and loyalty points to buy directly from any merchant store.
            </div>
          </div>
        ) : (
          <div className="flex items-start gap-2.5 rounded-2xl bg-amber-50 p-4 border border-amber-200 text-xs text-amber-900">
            <AlertCircle size={18} className="text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold">Identity Verification Notice:</span>
              <p className="text-amber-800">
                KYC verification is required to spend wallet funds or redeem points at checkout.
                You can still complete your order with Card or Cash on Delivery, or{" "}
                <Link href="/account/kyc" className="font-bold underline text-amber-900 hover:text-black">
                  complete your verification now →
                </Link>
              </p>
            </div>
          </div>
        )}

        {/* Delivery Details */}
        <section className="card p-5 border border-slate-200">
          <h2 className="mb-3 font-bold text-navy-900 text-base">Delivery details</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="label">Full name</label>
              <input name="name" required defaultValue={userName} className="input text-sm" />
            </div>
            <div>
              <label className="label">Phone</label>
              <input name="phone" required className="input text-sm" inputMode="tel" placeholder="+1..." />
            </div>
            <div className="sm:col-span-2">
              <label className="label">Address</label>
              <textarea name="address" required rows={3} className="input text-sm" placeholder="Street, city, postcode" />
            </div>
          </div>
        </section>

        {/* Payment Methods (Wallet, Points, Card, COD, Bank) */}
        <section className="card p-5 border border-slate-200 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-navy-900 text-base">Choose payment method</h2>
            <span className="text-xs text-slate-400">Accepted across all stores</span>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {/* 1. SNLRICH Wallet Balance */}
            <label
              className={`relative flex flex-col justify-between rounded-xl border p-4 transition cursor-pointer ${
                payment === "WALLET"
                  ? "border-emerald-600 bg-emerald-50/70 shadow-xs ring-1 ring-emerald-500"
                  : isVerified && walletCents >= orderTotalBeforeCredits
                  ? "border-slate-200 hover:border-slate-300 hover:bg-slate-50/60"
                  : "border-slate-200 bg-slate-50/60 opacity-60 cursor-not-allowed"
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-800">
                    <Wallet size={16} />
                  </div>
                  <div>
                    <div className="font-bold text-navy-900 text-xs">SNLRICH Wallet</div>
                    <div className="text-[11px] font-semibold text-emerald-700">{money(walletCents)} available</div>
                  </div>
                </div>
                <input
                  type="radio"
                  name="pay"
                  disabled={!isVerified || walletCents < orderTotalBeforeCredits}
                  checked={payment === "WALLET"}
                  onChange={() => {
                    setPayment("WALLET");
                    setUsePoints(false);
                    setUseWallet(false);
                  }}
                  className="mt-1"
                />
              </div>
              <div className="mt-2 text-[10px] text-slate-500">
                {!isVerified ? (
                  <span className="text-amber-700 flex items-center gap-1 font-semibold">
                    <Lock size={10} /> Requires KYC
                  </span>
                ) : walletCents < orderTotalBeforeCredits ? (
                  <span>Insufficient balance for full order</span>
                ) : (
                  <span className="text-emerald-700 font-bold">100% Instant Wallet Payment</span>
                )}
              </div>
            </label>

            {/* 2. Direct Points Payment */}
            <label
              className={`relative flex flex-col justify-between rounded-xl border p-4 transition cursor-pointer ${
                payment === "POINTS"
                  ? "border-amber-500 bg-amber-50/70 shadow-xs ring-1 ring-amber-500"
                  : isVerified && pointsValueMax >= orderTotalBeforeCredits
                  ? "border-slate-200 hover:border-slate-300 hover:bg-slate-50/60"
                  : "border-slate-200 bg-slate-50/60 opacity-60 cursor-not-allowed"
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 text-amber-800">
                    <Coins size={16} />
                  </div>
                  <div>
                    <div className="font-bold text-navy-900 text-xs">Pay with Points</div>
                    <div className="text-[11px] font-semibold text-amber-700">
                      {points.toLocaleString()} pts ({money(pointsValueMax)})
                    </div>
                  </div>
                </div>
                <input
                  type="radio"
                  name="pay"
                  disabled={!isVerified || pointsValueMax < orderTotalBeforeCredits}
                  checked={payment === "POINTS"}
                  onChange={() => {
                    setPayment("POINTS");
                    setUsePoints(false);
                    setUseWallet(false);
                  }}
                  className="mt-1"
                />
              </div>
              <div className="mt-2 text-[10px] text-slate-500">
                {!isVerified ? (
                  <span className="text-amber-700 flex items-center gap-1 font-semibold">
                    <Lock size={10} /> Requires KYC
                  </span>
                ) : pointsValueMax < orderTotalBeforeCredits ? (
                  <span>Insufficient points for full order</span>
                ) : (
                  <span className="text-amber-800 font-bold">100% Direct Points Purchase</span>
                )}
              </div>
            </label>

            {/* 3. Card */}
            <label
              className={`relative flex items-center justify-between rounded-xl border p-4 transition cursor-pointer ${
                payment === "CARD" ? "border-navy-700 bg-navy-50/70 shadow-xs ring-1 ring-navy-700" : "border-slate-200 hover:bg-slate-50"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-blue-800">
                  <CreditCard size={16} />
                </div>
                <div>
                  <div className="font-bold text-navy-900 text-xs">Credit / Debit Card</div>
                  <div className="text-[11px] text-slate-500">Instant online payment</div>
                </div>
              </div>
              <input type="radio" name="pay" checked={payment === "CARD"} onChange={() => setPayment("CARD")} />
            </label>

            {/* 4. Cash On Delivery */}
            <label
              className={`relative flex items-center justify-between rounded-xl border p-4 transition cursor-pointer ${
                payment === "COD" ? "border-navy-700 bg-navy-50/70 shadow-xs ring-1 ring-navy-700" : "border-slate-200 hover:bg-slate-50"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
                  <Banknote size={16} />
                </div>
                <div>
                  <div className="font-bold text-navy-900 text-xs">Cash on Delivery</div>
                  <div className="text-[11px] text-slate-500">Pay cash upon parcel arrival</div>
                </div>
              </div>
              <input type="radio" name="pay" checked={payment === "COD"} onChange={() => setPayment("COD")} />
            </label>

            {/* 5. Bank Transfer */}
            <div className="sm:col-span-2 space-y-3">
              <label
                className={`relative flex items-center justify-between rounded-xl border p-4 transition cursor-pointer ${
                  payment === "BANK" ? "border-navy-700 bg-navy-50/70 shadow-xs ring-1 ring-navy-700" : "border-slate-200 hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-100 text-red-700">
                    <QrCode size={16} />
                  </div>
                  <div>
                    <div className="font-bold text-navy-900 text-xs">Cambodia Banks / KHQR Pay</div>
                    <div className="text-[11px] text-slate-500">Scan KHQR with ABA, Wing, ACLEDA, or Bakong</div>
                  </div>
                </div>
                <input type="radio" name="pay" checked={payment === "BANK"} onChange={() => setPayment("BANK")} />
              </label>

              {payment === "BANK" && banks.length > 0 && (
                <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 space-y-3.5 animate-in fade-in duration-150">
                  <div className="text-xs font-bold text-navy-900">
                    Select Bank / KHQR to scan:
                  </div>

                  {/* Bank options */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {banks.map((b) => (
                      <button
                        key={b.id}
                        type="button"
                        onClick={() => setSelectedBankId(b.id)}
                        className={`rounded-xl border p-2 text-left transition-all ${
                          (selectedBankId || banks[0].id) === b.id
                            ? "border-navy-900 bg-white ring-2 ring-navy-900 shadow-2xs font-bold"
                            : "border-slate-200 bg-white hover:bg-slate-50"
                        }`}
                      >
                        <div className="text-[11px] font-bold text-navy-900 truncate">{b.bankName}</div>
                        <div className="text-[10px] text-slate-500">{b.currency}</div>
                      </button>
                    ))}
                  </div>

                  {/* Selected Bank Preview */}
                  {(() => {
                    const currentBank = banks.find((b) => b.id === (selectedBankId || banks[0]?.id)) || banks[0];
                    if (!currentBank) return null;
                    return (
                      <div className="rounded-xl bg-white p-3.5 border border-slate-200/80 shadow-2xs space-y-3">
                        <div className="flex flex-col sm:flex-row items-center gap-4">
                          {currentBank.qrImageUrl && (
                            <div className="relative h-32 w-32 shrink-0 overflow-hidden rounded-xl border border-red-500/30 p-1.5 bg-white">
                              <Image
                                src={currentBank.qrImageUrl}
                                alt="KHQR"
                                width={120}
                                height={120}
                                className="h-full w-full object-contain"
                              />
                              <div className="pointer-events-none absolute left-0 right-0 h-0.5 bg-red-500 shadow-[0_0_6px_#d80027] animate-scan" />
                            </div>
                          )}
                          <div className="min-w-0 flex-1 space-y-1.5 text-xs w-full">
                            <div className="flex items-center justify-between">
                              <span className="text-slate-500">Bank:</span>
                              <span className="font-bold text-navy-900">{currentBank.bankName}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-slate-500">Name:</span>
                              <span className="font-semibold text-navy-900">{currentBank.accountName}</span>
                            </div>
                            <div className="flex items-center justify-between border-t border-slate-100 pt-1.5">
                              <span className="text-slate-500">Account:</span>
                              <div className="flex items-center gap-1.5">
                                <span className="font-mono font-black text-navy-900">{currentBank.accountNumber}</span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    navigator.clipboard.writeText(currentBank.accountNumber);
                                    setCopiedAccount(true);
                                    setTimeout(() => setCopiedAccount(false), 2000);
                                  }}
                                  className="rounded bg-slate-100 p-1 text-slate-600 hover:bg-slate-200"
                                >
                                  {copiedAccount ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                                </button>
                              </div>
                            </div>
                            {currentBank.instructions && (
                              <p className="text-[10px] text-slate-500 italic pt-1 border-t border-slate-100">
                                {currentBank.instructions}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Partial Points & Wallet Discounts (Only when paying with Card, COD or Bank) */}
        {payment !== "WALLET" && payment !== "POINTS" && (
          <section className="card space-y-3.5 p-5 border border-slate-200">
            <h2 className="font-bold text-navy-900 text-base">Redeem rewards & discounts</h2>

            <label
              className={`flex items-center gap-3 rounded-xl border p-3 text-xs transition ${
                !isVerified
                  ? "border-slate-200 bg-slate-50/70 opacity-60 cursor-not-allowed"
                  : points > 0
                  ? "cursor-pointer border-slate-200 hover:bg-slate-50"
                  : "opacity-50 cursor-not-allowed border-slate-200"
              }`}
            >
              <input
                type="checkbox"
                disabled={!isVerified || !points}
                checked={usePoints}
                onChange={(e) => setUsePoints(e.target.checked)}
              />
              <Coins size={18} className="text-gold-600 shrink-0" />
              <div className="min-w-0 flex-1">
                <span className="font-bold text-navy-900">Redeem points as cash discount</span>
                <span className="block text-slate-500">
                  Available: <b>{points.toLocaleString()} pts</b> = {money(pointsValueMax)}
                  {!isVerified && <span className="ml-1 text-amber-700 font-semibold">(Requires KYC)</span>}
                </span>
              </div>
            </label>

            <label
              className={`flex items-center gap-3 rounded-xl border p-3 text-xs transition ${
                !isVerified
                  ? "border-slate-200 bg-slate-50/70 opacity-60 cursor-not-allowed"
                  : walletCents > 0
                  ? "cursor-pointer border-slate-200 hover:bg-slate-50"
                  : "opacity-50 cursor-not-allowed border-slate-200"
              }`}
            >
              <input
                type="checkbox"
                disabled={!isVerified || !walletCents}
                checked={useWallet}
                onChange={(e) => setUseWallet(e.target.checked)}
              />
              <Wallet size={18} className="text-emerald-600 shrink-0" />
              <div className="min-w-0 flex-1">
                <span className="font-bold text-navy-900">Apply wallet cash towards order</span>
                <span className="block text-slate-500">
                  Available: <b>{money(walletCents)}</b>
                  {!isVerified && <span className="ml-1 text-amber-700 font-semibold">(Requires KYC)</span>}
                </span>
              </div>
            </label>

            <div>
              <label className="label text-xs">Promo / Coupon code</label>
              <input
                value={coupon}
                onChange={(e) => setCoupon(e.target.value.toUpperCase())}
                placeholder="e.g. WELCOME10"
                className="input text-xs uppercase"
              />
            </div>
          </section>
        )}
      </div>

      {/* Order Summary Sidebar */}
      <aside className="card h-fit space-y-3 p-6 border border-slate-200 text-xs shadow-sm">
        <h2 className="font-bold text-navy-900 text-sm">Order summary</h2>
        <ul className="max-h-48 space-y-1.5 overflow-auto text-slate-600 pr-1 divide-y divide-slate-100">
          {items.map((i) => (
            <li key={i.productId} className="flex justify-between gap-2 pt-1.5 first:pt-0">
              <span className="truncate">
                {i.quantity}× {i.name}
              </span>
              <span className="font-medium text-navy-900">{money(i.priceCents * i.quantity)}</span>
            </li>
          ))}
        </ul>

        <hr className="border-slate-100" />
        <Row label="Subtotal" value={money(subtotalCents)} />
        <Row label="Estimated Shipping" value={shipping ? money(shipping) : "Free"} />

        {pointsDiscount > 0 && (
          <Row
            label={payment === "POINTS" ? "Direct Points Payment" : "Points Discount"}
            value={`-${money(pointsDiscount)}`}
            green
          />
        )}

        {walletDiscount > 0 && (
          <Row
            label={payment === "WALLET" ? "100% Wallet Payment" : "Wallet Discount"}
            value={`-${money(walletDiscount)}`}
            green
          />
        )}

        <p className="text-[11px] text-slate-400">Coupon discounts and merchant points multipliers applied on server.</p>

        <hr className="border-slate-100" />
        <div className="flex justify-between text-base font-black text-navy-900 pt-1">
          <span>Amount to Pay</span>
          <span className={finalEstTotal === 0 ? "text-emerald-700" : ""}>{money(finalEstTotal)}</span>
        </div>

        {error && (
          <div className="rounded-xl bg-red-50 p-2.5 text-xs text-red-700 border border-red-200 flex items-start gap-1.5">
            <AlertCircle size={15} className="shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <button
          disabled={pending}
          className="btn btn-primary mt-3 w-full font-bold shadow-md text-sm py-2.5"
        >
          {pending
            ? "Processing Order…"
            : payment === "WALLET"
            ? "Pay With Wallet Now"
            : payment === "POINTS"
            ? "Pay With Points Now"
            : "Place Order"}
        </button>
      </aside>
    </form>
  );
}

function Row({ label, value, green }: { label: string; value: string; green?: boolean }) {
  return (
    <div className={`flex justify-between font-medium ${green ? "text-emerald-700 font-bold" : "text-slate-600"}`}>
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}
