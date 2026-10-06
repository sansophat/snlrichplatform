"use client";

import { useActionState } from "react";
import { requestPayoutAction } from "@/app/actions/merchant";
import type { FormState } from "@/app/actions/auth";
import { SubmitButton } from "@/components/SubmitButton";
import { money } from "@/lib/format";
import { CreditCard, DollarSign, Check, AlertCircle } from "lucide-react";

export function PayoutForm({
  availableCents,
  defaultMethod,
  defaultDetails,
}: {
  availableCents: number;
  defaultMethod?: string | null;
  defaultDetails?: string | null;
}) {
  const [state, action] = useActionState<FormState, FormData>(requestPayoutAction, undefined);

  return (
    <form action={action} className="card p-6 border border-slate-200/90 shadow-xs space-y-4">
      <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
        <CreditCard size={18} className="text-emerald-700" />
        <h3 className="text-base font-bold text-navy-900">Request Wallet Withdrawal</h3>
      </div>

      {state?.error && (
        <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-xs font-medium text-red-700 border border-red-200">
          <AlertCircle size={15} className="shrink-0" />
          <span>{state.error}</span>
        </div>
      )}
      {state?.ok && (
        <div className="flex items-center gap-2 rounded-lg bg-emerald-50 p-3 text-xs font-medium text-emerald-800 border border-emerald-200">
          <Check size={15} className="shrink-0" />
          <span>{state.ok}</span>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label">Withdrawal Amount ($)</label>
          <div className="relative mt-1">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400 font-bold">$</span>
            <input
              name="amount"
              type="number"
              step="0.01"
              min="10.00"
              max={(availableCents / 100).toFixed(2)}
              defaultValue={(availableCents / 100).toFixed(2)}
              className="input pl-8 text-sm font-semibold"
              placeholder="0.00"
              required
            />
          </div>
          <p className="mt-1 text-[11px] text-slate-400">Available balance: {money(availableCents)} (min: $10.00)</p>
        </div>

        <div>
          <label className="label">Payout Method</label>
          <select name="method" defaultValue={defaultMethod ?? "BANK_TRANSFER"} className="input mt-1">
            <option value="BANK_TRANSFER">Direct Bank Transfer</option>
            <option value="PAYPAL">PayPal</option>
            <option value="WISE">Wise (TransferWise)</option>
            <option value="CRYPTO">USDT (Crypto)</option>
          </select>
        </div>
      </div>

      <div>
        <label className="label">Account Number / Receiving Details</label>
        <input
          name="details"
          defaultValue={defaultDetails ?? ""}
          placeholder="Bank Name, Routing Number, Account Number, or PayPal Email"
          className="input mt-1"
          required
        />
      </div>

      <div>
        <label className="label">Notes for Admin (Optional)</label>
        <input
          name="notes"
          placeholder="e.g. Please process via fast transfer"
          className="input mt-1 text-xs"
        />
      </div>

      <div className="pt-2">
        <SubmitButton
          disabled={availableCents < 1000}
          className="btn btn-primary"
          pendingText="Submitting Request…"
        >
          Submit Withdrawal Request
        </SubmitButton>
        {availableCents < 1000 && (
          <p className="mt-2 text-xs text-amber-700">Minimum balance required to request a payout is $10.00.</p>
        )}
      </div>
    </form>
  );
}
