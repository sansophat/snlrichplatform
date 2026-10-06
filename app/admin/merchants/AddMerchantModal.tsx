"use client";

import { useState, useActionState, useEffect } from "react";
import { createMerchantAction } from "@/app/actions/admin";
import type { FormState } from "@/app/actions/auth";
import { SubmitButton } from "@/components/SubmitButton";
import { Plus, X, Store, Check, AlertCircle } from "lucide-react";

export function AddMerchantModal() {
  const [open, setOpen] = useState(false);
  const [state, action] = useActionState<FormState, FormData>(createMerchantAction, undefined);

  useEffect(() => {
    if (state?.ok) {
      const timer = setTimeout(() => {
        setOpen(false);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [state?.ok]);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="btn btn-primary btn-sm flex items-center gap-1.5 font-semibold"
      >
        <Plus size={16} /> Add Merchant
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-in fade-in">
          <div className="card max-h-[90vh] w-full max-w-xl overflow-y-auto p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Store size={20} className="text-navy-700" />
                <h3 className="text-lg font-bold text-navy-900">Create New Merchant Store</h3>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={18} />
              </button>
            </div>

            <form action={action} className="mt-4 space-y-4">
              {state?.error && (
                <div className="flex items-center gap-2 rounded-xl bg-red-50 p-3 text-xs font-medium text-red-700 border border-red-200">
                  <AlertCircle size={15} className="shrink-0" />
                  <span>{state.error}</span>
                </div>
              )}
              {state?.ok && (
                <div className="flex items-center gap-2 rounded-xl bg-emerald-50 p-3 text-xs font-medium text-emerald-800 border border-emerald-200">
                  <Check size={15} className="shrink-0" />
                  <span>{state.ok}</span>
                </div>
              )}

              {/* Store Details */}
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="sm:col-span-2">
                  <label className="label">Store Brand Name *</label>
                  <input name="name" required placeholder="e.g. Aurora Audio" className="input text-sm" />
                </div>
                <div>
                  <label className="label">Emoji Icon</label>
                  <input name="emoji" defaultValue="🏪" maxLength={4} className="input text-center text-sm" />
                </div>
              </div>

              <div>
                <label className="label">Store Description</label>
                <textarea
                  name="description"
                  rows={2}
                  placeholder="Short summary of store and products..."
                  className="input text-sm"
                />
              </div>

              {/* Owner Account Details */}
              <div className="pt-2 border-t border-slate-100">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Owner Credentials</h4>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="label">Owner Full Name</label>
                    <input name="ownerName" placeholder="e.g. John Smith" className="input text-sm" />
                  </div>
                  <div>
                    <label className="label">Owner Email Address *</label>
                    <input name="email" type="email" required placeholder="merchant@brand.com" className="input text-sm" />
                  </div>
                </div>

                <div className="mt-3">
                  <label className="label">Initial Login Password * (min 8 chars)</label>
                  <input
                    name="password"
                    type="password"
                    required
                    minLength={8}
                    defaultValue="Merchant@12345"
                    className="input text-sm"
                  />
                  <p className="mt-1 text-[11px] text-slate-400">Default: Merchant@12345. Merchant can change it after login.</p>
                </div>
              </div>

              {/* Commission & Rewards Configuration */}
              <div className="pt-2 border-t border-slate-100">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Commercial Rates</h4>
                <div className="grid gap-3 sm:grid-cols-3">
                  <div>
                    <label className="label">Commission %</label>
                    <input name="commissionPct" type="number" step="0.5" min={0} max={50} defaultValue={10} className="input text-sm" />
                  </div>
                  <div>
                    <label className="label">Points Rate</label>
                    <input name="pointsRate" type="number" min={0} max={10} defaultValue={2} className="input text-sm" />
                  </div>
                  <div>
                    <label className="label">Cashback %</label>
                    <input name="cashbackPct" type="number" step="0.5" min={0} max={20} defaultValue={3} className="input text-sm" />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="btn btn-outline btn-sm"
                >
                  Cancel
                </button>
                <SubmitButton className="btn btn-primary btn-sm" pendingText="Creating Store…">
                  Create Merchant
                </SubmitButton>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
