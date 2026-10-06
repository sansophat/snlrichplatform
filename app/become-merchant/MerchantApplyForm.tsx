"use client";

import { useActionState } from "react";
import { applyMerchantAction } from "@/app/actions/merchant";
import type { FormState } from "@/app/actions/auth";
import { SubmitButton } from "@/components/SubmitButton";

export function MerchantApplyForm() {
  const [state, action] = useActionState<FormState, FormData>(applyMerchantAction, undefined);
  return (
    <form action={action} className="space-y-4">
      <div><label className="label">Store name</label><input name="name" required minLength={3} className="input" /></div>
      <div><label className="label">Store Tag / Symbol (optional)</label><input name="emoji" defaultValue="🏪" maxLength={4} className="input w-24" placeholder="🏪" /></div>
      <div><label className="label">About your store</label><textarea name="description" rows={3} className="input" /></div>
      {state?.error && <p className="rounded-lg bg-red-50 p-2 text-sm text-red-700">{state.error}</p>}
      {state?.ok && <p className="rounded-lg bg-emerald-50 p-2 text-sm text-emerald-800">{state.ok}</p>}
      <SubmitButton pendingText="Submitting…">Submit application</SubmitButton>
    </form>
  );
}
