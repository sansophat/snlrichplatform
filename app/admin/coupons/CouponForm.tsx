"use client";

import { useActionState } from "react";
import { createCouponAction } from "@/app/actions/admin";
import type { FormState } from "@/app/actions/auth";
import { SubmitButton } from "@/components/SubmitButton";

export function CouponForm() {
  const [state, action] = useActionState<FormState, FormData>(createCouponAction, undefined);
  return (
    <form action={action} className="card grid gap-3 p-5 sm:grid-cols-5">
      <div><label className="label">Code</label><input name="code" required className="input uppercase" placeholder="SUMMER15" /></div>
      <div><label className="label">% off</label><input name="percentOff" type="number" min={1} max={90} required className="input" /></div>
      <div><label className="label">Min subtotal</label><input name="minSubtotal" inputMode="decimal" className="input" placeholder="0.00" /></div>
      <div><label className="label">Max uses</label><input name="usesLeft" type="number" min={1} className="input" placeholder="∞" /></div>
      <div className="flex items-end"><SubmitButton className="btn btn-primary w-full" pendingText="…">Create</SubmitButton></div>
      {state?.error && <p className="rounded-lg bg-red-50 p-2 text-sm text-red-700 sm:col-span-5">{state.error}</p>}
      {state?.ok && <p className="rounded-lg bg-emerald-50 p-2 text-sm text-emerald-800 sm:col-span-5">{state.ok}</p>}
    </form>
  );
}
