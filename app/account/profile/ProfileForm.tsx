"use client";

import { useActionState } from "react";
import { updateCustomerProfileAction, changePasswordAction } from "@/app/actions/customer";
import type { FormState } from "@/app/actions/auth";
import { SubmitButton } from "@/components/SubmitButton";
import { ImageUploader } from "@/components/ImageUploader";
import { UserRound, Lock, Phone, MapPin, Check, AlertCircle } from "lucide-react";

export function ProfileForm({
  user,
}: {
  user: {
    id: string;
    name: string;
    email: string;
    phone?: string | null;
    address?: string | null;
    avatarUrl?: string | null;
  };
}) {
  const [profileState, profileAction] = useActionState<FormState, FormData>(
    updateCustomerProfileAction,
    undefined
  );
  const [pwState, pwAction] = useActionState<FormState, FormData>(
    changePasswordAction,
    undefined
  );

  return (
    <div className="space-y-8 max-w-2xl">
      {/* Profile Details Form */}
      <form action={profileAction} className="card p-6 shadow-xs border border-slate-200/90 space-y-6">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <UserRound size={18} className="text-navy-700" />
          <h3 className="text-base font-bold text-navy-900">Personal Profile & Contact</h3>
        </div>

        {profileState?.error && (
          <div className="flex items-center gap-2 rounded-xl bg-red-50 p-3 text-xs font-medium text-red-700 border border-red-200">
            <AlertCircle size={15} className="shrink-0" />
            <span>{profileState.error}</span>
          </div>
        )}
        {profileState?.ok && (
          <div className="flex items-center gap-2 rounded-xl bg-emerald-50 p-3 text-xs font-medium text-emerald-800 border border-emerald-200">
            <Check size={15} className="shrink-0" />
            <span>{profileState.ok}</span>
          </div>
        )}

        {/* Avatar Upload */}
        <div>
          <ImageUploader
            name="avatarUrl"
            label="Profile Picture / Avatar"
            defaultValue={user.avatarUrl}
            aspect="avatar"
            helpText="Upload a personal photo or avatar."
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Full Name</label>
            <input name="name" defaultValue={user.name} required className="input" />
          </div>
          <div>
            <label className="label">Email Address</label>
            <input value={user.email} disabled className="input bg-slate-50 text-slate-500 cursor-not-allowed" />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label flex items-center gap-1.5"><Phone size={13} className="text-slate-400" /> Contact Phone</label>
            <input name="phone" defaultValue={user.phone ?? ""} placeholder="+1 (555) 000-0000" className="input" />
          </div>
          <div>
            <label className="label flex items-center gap-1.5"><MapPin size={13} className="text-slate-400" /> Default Shipping Address</label>
            <input name="address" defaultValue={user.address ?? ""} placeholder="Street, Apt, City, Zip" className="input" />
          </div>
        </div>

        <div className="pt-1">
          <SubmitButton className="btn btn-primary" pendingText="Saving…">Save Profile</SubmitButton>
        </div>
      </form>

      {/* Password Change Form */}
      <form action={pwAction} className="card p-6 shadow-xs border border-slate-200/90 space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <Lock size={18} className="text-navy-700" />
          <h3 className="text-base font-bold text-navy-900">Security & Password</h3>
        </div>

        {pwState?.error && (
          <div className="flex items-center gap-2 rounded-xl bg-red-50 p-3 text-xs font-medium text-red-700 border border-red-200">
            <AlertCircle size={15} className="shrink-0" />
            <span>{pwState.error}</span>
          </div>
        )}
        {pwState?.ok && (
          <div className="flex items-center gap-2 rounded-xl bg-emerald-50 p-3 text-xs font-medium text-emerald-800 border border-emerald-200">
            <Check size={15} className="shrink-0" />
            <span>{pwState.ok}</span>
          </div>
        )}

        <div>
          <label className="label">Current Password</label>
          <input name="currentPassword" type="password" required className="input" />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">New Password (min 8 chars)</label>
            <input name="newPassword" type="password" minLength={8} required className="input" />
          </div>
          <div>
            <label className="label">Confirm New Password</label>
            <input name="confirmPassword" type="password" minLength={8} required className="input" />
          </div>
        </div>

        <div className="pt-1">
          <SubmitButton className="btn btn-outline" pendingText="Updating…">Update Password</SubmitButton>
        </div>
      </form>
    </div>
  );
}
