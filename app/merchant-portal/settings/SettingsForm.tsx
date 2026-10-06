"use client";

import { useActionState } from "react";
import { saveMerchantSettingsAction } from "@/app/actions/merchant";
import type { FormState } from "@/app/actions/auth";
import { SubmitButton } from "@/components/SubmitButton";
import { ImageUploader } from "@/components/ImageUploader";
import { REWARDS } from "@/lib/config";
import { Store, Image as ImageIcon, CreditCard, Sparkles, Phone, MapPin } from "lucide-react";

type MerchantData = {
  name: string;
  description: string;
  emoji: string;
  logoUrl?: string | null;
  bannerUrl?: string | null;
  phone?: string | null;
  address?: string | null;
  payoutMethod?: string | null;
  payoutDetails?: string | null;
  pointsRate: number;
  cashbackPct: number;
  commissionPct: number;
};

export function SettingsForm({ m }: { m: MerchantData }) {
  const [state, action] = useActionState<FormState, FormData>(saveMerchantSettingsAction, undefined);

  return (
    <form action={action} className="card max-w-3xl space-y-8 p-6 shadow-xs border border-slate-200/90">
      {/* Notifications */}
      {state?.error && <p className="rounded-xl bg-red-50 p-3 text-sm font-medium text-red-700 border border-red-200">{state.error}</p>}
      {state?.ok && <p className="rounded-xl bg-emerald-50 p-3 text-sm font-medium text-emerald-800 border border-emerald-200">{state.ok}</p>}

      {/* Basic Store Info */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5">
          <Store size={18} className="text-navy-700" />
          <h2 className="text-base font-bold text-navy-900">Store Profile & Branding</h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="sm:col-span-2">
            <label className="label">Store name</label>
            <input name="name" required defaultValue={m.name} className="input" />
          </div>
          <div>
            <label className="label">Icon (emoji)</label>
            <input name="emoji" defaultValue={m.emoji} maxLength={4} className="input text-center text-lg" />
          </div>
        </div>

        <div>
          <label className="label">Store bio / description</label>
          <textarea
            name="description"
            rows={3}
            defaultValue={m.description}
            className="input"
            placeholder="Tell shoppers about your store, products and values..."
          />
        </div>

        <div className="grid gap-6 sm:grid-cols-2 pt-2">
          <ImageUploader
            name="logoUrl"
            label="Store Logo / Brand Icon"
            defaultValue={m.logoUrl}
            aspect="avatar"
            helpText="Upload your store avatar or brand logo."
          />
          <ImageUploader
            name="bannerUrl"
            label="Storefront Header Banner"
            defaultValue={m.bannerUrl}
            aspect="banner"
            helpText="Displayed at the top of your public merchant profile."
          />
        </div>
      </div>

      {/* Contact & Location */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5">
          <Phone size={18} className="text-navy-700" />
          <h2 className="text-base font-bold text-navy-900">Business Contact & Location</h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label flex items-center gap-1.5"><Phone size={13} className="text-slate-400" /> Support phone</label>
            <input name="phone" defaultValue={m.phone ?? ""} className="input" placeholder="+1 (555) 000-0000" />
          </div>
          <div>
            <label className="label flex items-center gap-1.5"><MapPin size={13} className="text-slate-400" /> Store location / warehouse address</label>
            <input name="address" defaultValue={m.address ?? ""} className="input" placeholder="City, Country or full address" />
          </div>
        </div>
      </div>

      {/* Rewards Configuration */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5">
          <Sparkles size={18} className="text-gold-600" />
          <h2 className="text-base font-bold text-navy-900">Customer Rewards & Loyalty Programme</h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Points per 1.00 spent (0–{REWARDS.MAX_POINTS_RATE}×)</label>
            <input name="pointsRate" type="number" min={0} max={REWARDS.MAX_POINTS_RATE} defaultValue={m.pointsRate} className="input" />
            <p className="mt-1 text-xs text-slate-400">Higher points attract more buyers to your products.</p>
          </div>
          <div>
            <label className="label">Cashback % (0–{REWARDS.MAX_CASHBACK_PCT}%)</label>
            <input name="cashbackPct" type="number" step="0.5" min={0} max={REWARDS.MAX_CASHBACK_PCT} defaultValue={m.cashbackPct} className="input" />
            <p className="mt-1 text-xs text-slate-400">Cashback deposited into customer wallet upon order delivery.</p>
          </div>
        </div>
        <p className="rounded-lg bg-slate-50 p-3 text-xs text-slate-600">
          Platform commission fee: <b>{m.commissionPct}%</b> (managed by marketplace administration).
        </p>
      </div>

      {/* Payout & Banking Settings */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5">
          <CreditCard size={18} className="text-emerald-700" />
          <h2 className="text-base font-bold text-navy-900">Payout Preferences & Banking</h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Preferred payout method</label>
            <select name="payoutMethod" defaultValue={m.payoutMethod ?? "BANK_TRANSFER"} className="input">
              <option value="BANK_TRANSFER">Direct Bank Transfer</option>
              <option value="PAYPAL">PayPal</option>
              <option value="WISE">Wise (TransferWise)</option>
              <option value="CRYPTO">USDT (Crypto)</option>
            </select>
          </div>
          <div>
            <label className="label">Account details / payout destination</label>
            <input
              name="payoutDetails"
              defaultValue={m.payoutDetails ?? ""}
              className="input"
              placeholder="Bank account number / IBAN / PayPal email"
            />
          </div>
        </div>
      </div>

      <div className="pt-2">
        <SubmitButton className="btn btn-primary" pendingText="Saving…">Save store settings</SubmitButton>
      </div>
    </form>
  );
}
