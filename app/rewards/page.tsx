import Link from "next/link";
import { ArrowRight, CheckCircle2, Coins, Gift, Percent, ShieldCheck, Sparkles, Users, Wallet } from "lucide-react";
import { REWARDS, SHIPPING } from "@/lib/config";
import { money } from "@/lib/format";

export const metadata = { title: "Rewards Programme" };

export default function RewardsInfoPage() {
  const steps = [
    {
      icon: Coins,
      title: "Earn Points Every Time",
      text: "Every delivered order awards loyalty points. Merchants set their own multiplier (up to 10× points). Points add up automatically to your balance.",
      color: "from-amber-400 to-amber-600",
      bg: "bg-amber-50",
      fg: "text-amber-700",
    },
    {
      icon: Wallet,
      title: "Cashback Straight to Wallet",
      text: "Get real monetary cashback deposited straight into your SNLRICH wallet upon delivery. Use it as cash against your next purchase.",
      color: "from-emerald-400 to-emerald-600",
      bg: "bg-emerald-50",
      fg: "text-emerald-700",
    },
    {
      icon: Gift,
      title: "Redeem Instantly at Checkout",
      text: `${REWARDS.POINT_VALUE_CENTS === 1 ? "100 points = " + money(100) : "Points are redeemable as cash"} discount at checkout. Combine points and cashback wallet seamlessly with any promo code.`,
      color: "from-blue-400 to-blue-600",
      bg: "bg-blue-50",
      fg: "text-blue-700",
    },
    {
      icon: Users,
      title: "Refer Friends & Both Earn",
      text: `Share your referral link. Your friend gets ${REWARDS.REFERRED_SIGNUP_BONUS} bonus points instantly. You earn ${REWARDS.REFERRER_BONUS} bonus points the moment their first order is delivered.`,
      color: "from-purple-400 to-purple-600",
      bg: "bg-purple-50",
      fg: "text-purple-700",
    },
  ];

  return (
    <div className="container-x py-14">
      <div className="mx-auto max-w-2xl text-center">
        <span className="eyebrow">Rewards & Benefits</span>
        <h1 className="section-title mt-2 text-3xl md:text-5xl">Shop. Earn. Repeat.</h1>
        <p className="mt-3 text-base text-slate-600">
          SNLRICH makes shopping rewarding. Combine points, cashback wallet, and referral perks on every single merchant order.
        </p>
      </div>

      <div className="mt-12 grid gap-6 md:grid-cols-2">
        {steps.map((s) => (
          <div key={s.title} className="card relative overflow-hidden p-7 transition duration-300 hover:-translate-y-1 hover:shadow-lift">
            <div className="flex items-start gap-5">
              <span className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${s.bg} ${s.fg} shadow-sm`}>
                <s.icon size={28} strokeWidth={1.8} />
              </span>
              <div>
                <h2 className="text-lg font-bold text-navy-900">{s.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{s.text}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-12 rounded-3xl border border-sand-200 bg-sand-50 p-8 md:p-10">
        <div className="grid gap-6 md:grid-cols-3">
          <div className="flex items-start gap-3">
            <CheckCircle2 size={20} className="mt-0.5 text-emerald-600 shrink-0" />
            <div>
              <h3 className="font-bold text-navy-900 text-sm">Signup Bonus</h3>
              <p className="text-xs text-slate-500 mt-1">{REWARDS.SIGNUP_BONUS} points given immediately on joining, or {REWARDS.REFERRED_SIGNUP_BONUS} with a referral link.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle2 size={20} className="mt-0.5 text-emerald-600 shrink-0" />
            <div>
              <h3 className="font-bold text-navy-900 text-sm">Free Delivery Threshold</h3>
              <p className="text-xs text-slate-500 mt-1">Enjoy free shipping on store subtotals over {money(SHIPPING.FREE_OVER_CENTS)}.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle2 size={20} className="mt-0.5 text-emerald-600 shrink-0" />
            <div>
              <h3 className="font-bold text-navy-900 text-sm">Zero Risk Guarantee</h3>
              <p className="text-xs text-slate-500 mt-1">Order cancellations automatically refund any redeemed points and wallet balance.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-10 text-center">
        <Link href="/register" className="btn btn-primary !px-8 !py-3.5 shadow-lg">
          Create Account & Claim {REWARDS.SIGNUP_BONUS} Points <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  );
}
