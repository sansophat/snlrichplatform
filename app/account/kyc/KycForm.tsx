"use client";

import { useActionState } from "react";
import { submitKycAction } from "@/app/actions/customer";
import type { FormState } from "@/app/actions/auth";
import { SubmitButton } from "@/components/SubmitButton";
import { ImageUploader } from "@/components/ImageUploader";
import { dateFmt } from "@/lib/format";
import { ShieldCheck, ShieldAlert, Clock, CheckCircle2, FileText, AlertCircle } from "lucide-react";

type UserKyc = {
  kycStatus: string;
  kycDocumentType?: string | null;
  kycFullName?: string | null;
  kycIdNumber?: string | null;
  kycDocumentUrl?: string | null;
  kycDocumentBackUrl?: string | null;
  kycNotes?: string | null;
  kycSubmittedAt?: Date | null;
};

export function KycForm({ user }: { user: UserKyc }) {
  const [state, action] = useActionState<FormState, FormData>(submitKycAction, undefined);
  const status = user.kycStatus || "NOT_SUBMITTED";

  const isVerified = status === "VERIFIED" || status === "BYPASSED";
  const isPending = status === "PENDING";
  const isRejected = status === "REJECTED";

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Status Hero Card */}
      {isVerified && (
        <div className="card p-6 border-emerald-200 bg-emerald-50/60 shadow-xs space-y-2">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-xs">
              <ShieldCheck size={24} />
            </div>
            <div>
              <h3 className="font-extrabold text-emerald-950 text-base">
                {status === "BYPASSED" ? "Verified (Admin Approved)" : "Identity Verified"}
              </h3>
              <p className="text-xs text-emerald-800">
                {status === "BYPASSED"
                  ? "Your account verification has been authorized and approved by marketplace administration."
                  : "Your identity verification is active. Full marketplace and withdrawal privileges are unlocked."}
              </p>
            </div>
          </div>
          {user.kycFullName && (
            <div className="mt-4 pt-3 border-t border-emerald-200/80 text-xs text-emerald-900 grid grid-cols-2 gap-2">
              <div>Verified Name: <b>{user.kycFullName}</b></div>
              <div>Document #: <b>{user.kycIdNumber ? `••••${user.kycIdNumber.slice(-4)}` : "Verified"}</b></div>
            </div>
          )}
        </div>
      )}

      {isPending && (
        <div className="card p-6 border-blue-200 bg-blue-50/60 shadow-xs space-y-2">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-xs">
              <Clock size={22} />
            </div>
            <div>
              <h3 className="font-extrabold text-blue-950 text-base">Documents Under Review</h3>
              <p className="text-xs text-blue-800">
                Your KYC submission is currently being reviewed by our compliance team. Typically approved within 24 hours.
              </p>
            </div>
          </div>
          {user.kycSubmittedAt && (
            <p className="text-[11px] text-blue-700 pt-2 border-t border-blue-200">
              Submitted: {dateFmt(user.kycSubmittedAt)}
            </p>
          )}
        </div>
      )}

      {isRejected && (
        <div className="card p-6 border-red-200 bg-red-50/60 shadow-xs space-y-2">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-600 text-white shadow-xs">
              <ShieldAlert size={22} />
            </div>
            <div>
              <h3 className="font-extrabold text-red-950 text-base">Verification Needs Attention</h3>
              <p className="text-xs text-red-800">
                Your submission could not be verified. Please review the reason below and re-submit clearer documents.
              </p>
            </div>
          </div>
          {user.kycNotes && (
            <div className="mt-2 rounded-lg bg-white/80 p-3 text-xs text-red-900 border border-red-200 font-medium">
              Admin note: {user.kycNotes}
            </div>
          )}
        </div>
      )}

      {/* KYC Submission Form (shown if NOT_SUBMITTED or REJECTED) */}
      {(!isVerified && !isPending) && (
        <form action={action} className="card p-6 border border-slate-200/90 shadow-xs space-y-6">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <FileText size={18} className="text-navy-700" />
            <h3 className="text-base font-bold text-navy-900">Submit Identification Documents</h3>
          </div>

          {state?.error && (
            <div className="flex items-center gap-2 rounded-xl bg-red-50 p-3 text-xs font-medium text-red-700 border border-red-200">
              <AlertCircle size={15} className="shrink-0" />
              <span>{state.error}</span>
            </div>
          )}
          {state?.ok && (
            <div className="flex items-center gap-2 rounded-xl bg-emerald-50 p-3 text-xs font-medium text-emerald-800 border border-emerald-200">
              <CheckCircle2 size={15} className="shrink-0" />
              <span>{state.ok}</span>
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label">Full Legal Name (as on ID)</label>
              <input
                name="kycFullName"
                defaultValue={user.kycFullName ?? ""}
                required
                placeholder="e.g. John Doe"
                className="input"
              />
            </div>
            <div>
              <label className="label">Document / ID Number</label>
              <input
                name="kycIdNumber"
                defaultValue={user.kycIdNumber ?? ""}
                required
                placeholder="e.g. 1234567890"
                className="input"
              />
            </div>
          </div>

          <div>
            <label className="label">Document Type</label>
            <select name="kycDocumentType" defaultValue={user.kycDocumentType ?? "NATIONAL_ID"} className="input">
              <option value="NATIONAL_ID">National Identity Card (ID Card)</option>
              <option value="PASSPORT">Passport</option>
              <option value="DRIVERS_LICENSE">Driver&apos;s License</option>
              <option value="RESIDENCE_PERMIT">Residence Permit</option>
            </select>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 pt-2">
            <ImageUploader
              name="kycDocumentUrl"
              label="Document Front Photo *"
              defaultValue={user.kycDocumentUrl}
              aspect="banner"
              helpText="Upload a clear, readable photo of the front of your document."
            />
            <ImageUploader
              name="kycDocumentBackUrl"
              label="Document Back Photo (Optional)"
              defaultValue={user.kycDocumentBackUrl}
              aspect="banner"
              helpText="Upload back of ID card or additional document page."
            />
          </div>

          <div className="rounded-xl bg-slate-50 p-3.5 text-xs text-slate-500 border border-slate-200">
            🔒 <b>Privacy Protected:</b> Your identity documents are encrypted and only accessible by authorized compliance administrators for identity validation.
          </div>

          <div className="pt-2">
            <SubmitButton className="btn btn-primary" pendingText="Uploading & Submitting…">
              Submit KYC Documents
            </SubmitButton>
          </div>
        </form>
      )}

      {/* If pending review, show uploaded documents summary */}
      {isPending && (
        <div className="card p-6 border border-slate-200/90 shadow-xs space-y-4">
          <h4 className="text-sm font-bold text-navy-900">Submitted Information</h4>
          <div className="grid grid-cols-2 gap-4 text-xs text-slate-700">
            <div>Legal Name: <b>{user.kycFullName}</b></div>
            <div>Document Type: <b>{user.kycDocumentType}</b></div>
            <div>ID Number: <b>{user.kycIdNumber}</b></div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 pt-2">
            {user.kycDocumentUrl && (
              <div>
                <p className="text-xs font-semibold text-slate-500 mb-1">Front Document</p>
                <div className="h-32 w-full overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={user.kycDocumentUrl} alt="Front ID" className="h-full w-full object-cover" />
                </div>
              </div>
            )}
            {user.kycDocumentBackUrl && (
              <div>
                <p className="text-xs font-semibold text-slate-500 mb-1">Back Document</p>
                <div className="h-32 w-full overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={user.kycDocumentBackUrl} alt="Back ID" className="h-full w-full object-cover" />
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
