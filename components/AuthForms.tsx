"use client";

import { useState, useEffect, useActionState } from "react";
import Link from "next/link";
import { loginAction, registerAction, type FormState } from "@/app/actions/auth";
import { SubmitButton } from "@/components/SubmitButton";
import { Lock } from "lucide-react";

export function LoginForm({ next }: { next?: string }) {
  const [state, action] = useActionState<FormState, FormData>(loginAction, undefined);
  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="next" value={next ?? ""} />
      <div><label className="label">Email</label><input name="email" type="email" required autoComplete="email" className="input" /></div>
      <div><label className="label">Password</label><input name="password" type="password" required autoComplete="current-password" className="input" /></div>
      {state?.error && <p className="rounded-lg bg-red-50 p-2 text-sm text-red-700">{state.error}</p>}
      <SubmitButton className="btn btn-primary w-full" pendingText="Signing in…">Sign in</SubmitButton>
      <p className="text-center text-sm text-slate-500">New here? <Link href="/register" className="font-semibold text-navy-700 underline">Create an account</Link></p>
    </form>
  );
}

export function RegisterForm({
  refCode,
  referrerName,
  isLocked = false,
}: {
  refCode?: string;
  referrerName?: string;
  isLocked?: boolean;
}) {
  const [state, action] = useActionState<FormState, FormData>(registerAction, undefined);
  const [activeRefCode, setActiveRefCode] = useState<string | undefined>(refCode);
  const [locked, setLocked] = useState<boolean>(isLocked);
  const [sponsorName, setSponsorName] = useState<string | undefined>(referrerName);

  useEffect(() => {
    if (refCode && isLocked) {
      setActiveRefCode(refCode);
      setLocked(true);
      setSponsorName(referrerName);
      try {
        sessionStorage.setItem("snl_ref_code", refCode);
        if (referrerName) sessionStorage.setItem("snl_ref_name", referrerName);
      } catch {}
    } else if (!refCode) {
      try {
        const storedCode = sessionStorage.getItem("snl_ref_code");
        const storedName = sessionStorage.getItem("snl_ref_name");
        if (storedCode) {
          setActiveRefCode(storedCode);
          setLocked(true);
          if (storedName) setSponsorName(storedName);
        }
      } catch {}
    }
  }, [refCode, isLocked, referrerName]);

  return (
    <form action={action} className="space-y-4">
      <div>
        <label className="label">Full name</label>
        <input name="name" required autoComplete="name" className="input" />
      </div>
      <div>
        <label className="label">Email</label>
        <input name="email" type="email" required autoComplete="email" className="input" />
      </div>
      <div>
        <label className="label">Password (min 8 characters)</label>
        <input name="password" type="password" minLength={8} required autoComplete="new-password" className="input" />
      </div>

      {locked && activeRefCode ? (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="label !mb-0">Referral code</label>
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-100/90 px-2.5 py-0.5 text-[11px] font-bold text-amber-800 border border-amber-200">
              <Lock size={11} className="text-amber-700" /> Locked by invitation
            </span>
          </div>
          <div className="relative">
            <input
              type="text"
              value={activeRefCode}
              readOnly
              tabIndex={-1}
              className="input font-mono font-bold tracking-widest bg-slate-100/90 text-navy-950 border-slate-300 cursor-not-allowed select-none pr-10"
              title="Locked to inviter to prevent cross-lining"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
              <Lock size={15} />
            </div>
          </div>
          <input type="hidden" name="ref" value={activeRefCode} />
          <p className="text-[11px] text-slate-500">
            🔒 Code is locked to {sponsorName ? <b className="text-slate-700">{sponsorName}</b> : "your inviter"} to prevent cross-line changes and guarantee your bonus points.
          </p>
        </div>
      ) : (
        <div>
          <label className="label">Referral code (optional)</label>
          <input
            name="ref"
            defaultValue={activeRefCode ?? ""}
            placeholder="e.g. SNL123456"
            className="input uppercase font-mono tracking-wider"
          />
          <p className="text-[11px] text-slate-400 mt-1">
            Have an invitation code? Enter it to receive 300 welcome points.
          </p>
        </div>
      )}

      {state?.error && <p className="rounded-lg bg-red-50 p-2.5 text-sm text-red-700 border border-red-200">{state.error}</p>}
      <SubmitButton className="btn btn-primary w-full" pendingText="Creating account…">Create account</SubmitButton>
      <p className="text-center text-sm text-slate-500">Already a member? <Link href="/login" className="font-semibold text-navy-700 underline">Sign in</Link></p>
    </form>
  );
}
