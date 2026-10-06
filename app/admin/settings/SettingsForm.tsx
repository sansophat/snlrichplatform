"use client";

import { useActionState, useState, useRef } from "react";
import Image from "next/image";
import {
  Upload, Check, AlertCircle, Sparkles, Building2, Shield,
  Gift, Truck, DollarSign, Phone, Image as ImageIcon, RefreshCw, Eye
} from "lucide-react";
import { updatePlatformSettingsAction } from "@/app/actions/admin";
import type { FormState } from "@/app/actions/auth";
import type { PlatformSettingsData } from "@/lib/settings";

export function SettingsForm({ initial }: { initial: PlatformSettingsData }) {
  const [state, formAction, isPending] = useActionState<FormState, FormData>(
    updatePlatformSettingsAction,
    {}
  );

  // Logo URLs
  const [logoUrl, setLogoUrl] = useState(initial.logoUrl || "/logo.svg");
  const [logoLightUrl, setLogoLightUrl] = useState(initial.logoLightUrl || "/logo-light.svg");

  // Uploading state
  const [uploadingPrimary, setUploadingPrimary] = useState(false);
  const [uploadingLight, setUploadingLight] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const primaryFileInputRef = useRef<HTMLInputElement>(null);
  const lightFileInputRef = useRef<HTMLInputElement>(null);

  async function handleFileUpload(file: File, type: "primary" | "light") {
    setUploadError(null);
    const isPrimary = type === "primary";
    if (isPrimary) setUploadingPrimary(true);
    else setUploadingLight(true);

    try {
      const fd = new FormData();
      fd.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: fd,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to upload file");
      }

      if (isPrimary) {
        setLogoUrl(data.url);
      } else {
        setLogoLightUrl(data.url);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Upload error";
      setUploadError(message);
    } finally {
      if (isPrimary) setUploadingPrimary(false);
      else setUploadingLight(false);
    }
  }

  return (
    <form action={formAction} className="space-y-8">
      {/* Notifications */}
      {state?.ok && (
        <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800 animate-in fade-in">
          <Check size={18} className="text-emerald-600 shrink-0" />
          <span>{state.ok}</span>
        </div>
      )}
      {(state?.error || uploadError) && (
        <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-800 animate-in fade-in">
          <AlertCircle size={18} className="text-red-600 shrink-0" />
          <span>{state?.error || uploadError}</span>
        </div>
      )}

      {/* Live Brand Identity Preview Pod */}
      <div className="card overflow-hidden border border-slate-200/90 shadow-xs">
        <div className="border-b border-slate-100 bg-slate-50/70 px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Eye size={16} className="text-navy-600" />
            <h3 className="text-sm font-semibold text-slate-800">Live Brand Identity Preview</h3>
          </div>
          <span className="text-xs text-slate-500">How your branding renders across header & footer</span>
        </div>
        <div className="grid gap-4 p-6 sm:grid-cols-2">
          {/* Light Header Preview */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Light Background (Header / Invoices)</span>
              <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[10px] text-slate-600">Active</span>
            </div>
            <div className="flex h-16 items-center justify-center rounded-lg border border-dashed border-slate-200 bg-slate-50/50 p-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={logoUrl || "/logo.svg"}
                alt="Primary Logo Preview"
                className="max-h-12 w-auto object-contain"
              />
            </div>
          </div>

          {/* Dark Footer Preview */}
          <div className="rounded-xl border border-navy-800 bg-navy-900 p-5 shadow-xs">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300">Dark Background (Footer / Navigation)</span>
              <span className="inline-flex items-center rounded-full bg-navy-800 px-2 py-0.5 text-[10px] text-slate-300">Active</span>
            </div>
            <div className="flex h-16 items-center justify-center rounded-lg border border-dashed border-navy-700 bg-navy-950/60 p-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={logoLightUrl || "/logo-light.svg"}
                alt="Light Logo Preview"
                className="max-h-12 w-auto object-contain"
              />
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 1: Brand & Logo Management */}
      <div className="card p-6 shadow-xs border border-slate-200/90 space-y-6">
        <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-navy-100 text-navy-800">
            <ImageIcon size={18} />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">Brand Logos & Visual Assets</h2>
            <p className="text-xs text-slate-500">Upload high-resolution logos (PNG, SVG, JPG, WEBP). Recommended height: 40px - 80px.</p>
          </div>
        </div>

        {/* Hidden inputs to pass logo URLs to server action */}
        <input type="hidden" name="logoUrl" value={logoUrl} />
        <input type="hidden" name="logoLightUrl" value={logoLightUrl} />

        <div className="grid gap-6 md:grid-cols-2">
          {/* Primary Logo Upload */}
          <div className="space-y-3 rounded-xl border border-slate-200/80 p-4 bg-slate-50/40">
            <div>
              <label className="text-sm font-semibold text-slate-800">Primary Logo (Default / Dark Text)</label>
              <p className="text-xs text-slate-500">Used on light navbar, shopping bag, receipts, and order confirmations.</p>
            </div>

            <div className="flex items-center gap-3">
              <input
                ref={primaryFileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileUpload(file, "primary");
                }}
              />
              <button
                type="button"
                disabled={uploadingPrimary}
                onClick={() => primaryFileInputRef.current?.click()}
                className="btn btn-secondary text-xs flex items-center gap-2 !py-2 !px-3 font-semibold hover:border-navy-400"
              >
                {uploadingPrimary ? (
                  <>
                    <RefreshCw size={14} className="animate-spin text-navy-600" />
                    <span>Uploading...</span>
                  </>
                ) : (
                  <>
                    <Upload size={14} />
                    <span>Upload New Logo</span>
                  </>
                )}
              </button>
              <span className="text-xs text-slate-400 truncate max-w-[150px]">{logoUrl}</span>
            </div>

            <div className="pt-1">
              <label className="text-[11px] font-medium text-slate-500">Or direct image URL / path:</label>
              <input
                type="text"
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
                className="input text-xs !py-1.5 mt-0.5"
                placeholder="/logo.svg or https://..."
              />
            </div>
          </div>

          {/* Light Logo Upload */}
          <div className="space-y-3 rounded-xl border border-slate-200/80 p-4 bg-slate-50/40">
            <div>
              <label className="text-sm font-semibold text-slate-800">Light / Inverted Logo (White Text)</label>
              <p className="text-xs text-slate-500">Used on deep navy footer, mobile drawer, and high-contrast dark sections.</p>
            </div>

            <div className="flex items-center gap-3">
              <input
                ref={lightFileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileUpload(file, "light");
                }}
              />
              <button
                type="button"
                disabled={uploadingLight}
                onClick={() => lightFileInputRef.current?.click()}
                className="btn btn-secondary text-xs flex items-center gap-2 !py-2 !px-3 font-semibold hover:border-navy-400"
              >
                {uploadingLight ? (
                  <>
                    <RefreshCw size={14} className="animate-spin text-navy-600" />
                    <span>Uploading...</span>
                  </>
                ) : (
                  <>
                    <Upload size={14} />
                    <span>Upload Light Logo</span>
                  </>
                )}
              </button>
              <span className="text-xs text-slate-400 truncate max-w-[150px]">{logoLightUrl}</span>
            </div>

            <div className="pt-1">
              <label className="text-[11px] font-medium text-slate-500">Or direct image URL / path:</label>
              <input
                type="text"
                value={logoLightUrl}
                onChange={(e) => setLogoLightUrl(e.target.value)}
                className="input text-xs !py-1.5 mt-0.5"
                placeholder="/logo-light.svg or https://..."
              />
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: General Platform Information */}
      <div className="card p-6 shadow-xs border border-slate-200/90 space-y-6">
        <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-navy-100 text-navy-800">
            <Building2 size={18} />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">General Information & Branding</h2>
            <p className="text-xs text-slate-500">Configure marketplace title, taglines, customer service hotline and currency.</p>
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label className="text-xs font-semibold text-slate-700">Platform Brand Name</label>
            <input
              name="siteName"
              defaultValue={initial.siteName}
              required
              className="input mt-1.5 text-sm"
              placeholder="SNLRICH"
            />
            <p className="mt-1 text-[11px] text-slate-400">Displayed in titles, meta tags, and invoice headers.</p>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700">Platform Tagline / Slogan</label>
            <input
              name="siteTagline"
              defaultValue={initial.siteTagline}
              className="input mt-1.5 text-sm"
              placeholder="SHOP · EARN · REPEAT"
            />
            <p className="mt-1 text-[11px] text-slate-400">Displayed in footers, hero highlights, and metadata.</p>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <Phone size={13} className="text-navy-600" /> Customer Support Phone
            </label>
            <input
              name="supportPhone"
              defaultValue={initial.supportPhone}
              className="input mt-1.5 text-sm"
              placeholder="(123) 456-7890"
            />
            <p className="mt-1 text-[11px] text-slate-400">Displayed in top navigation bar and customer footer.</p>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <DollarSign size={13} className="text-navy-600" /> Currency Symbol
            </label>
            <input
              name="currencySymbol"
              defaultValue={initial.currencySymbol}
              maxLength={5}
              className="input mt-1.5 text-sm max-w-[120px]"
              placeholder="$"
            />
            <p className="mt-1 text-[11px] text-slate-400">Symbol for pricing and monetary displays (e.g. $, ៛, €).</p>
          </div>
        </div>
      </div>

      {/* SECTION 3: Rewards, Loyalty & Referral Configuration */}
      <div className="card p-6 shadow-xs border border-slate-200/90 space-y-6">
        <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 text-gold-700">
            <Gift size={18} />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">Loyalty Rewards & Referral System</h2>
            <p className="text-xs text-slate-500">Manage incentive rules, signup credits, and reward point conversion rates.</p>
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label className="text-xs font-semibold text-slate-700">Welcome Signup Bonus (Points)</label>
            <input
              name="signupBonusPoints"
              type="number"
              min={0}
              step={10}
              defaultValue={initial.signupBonusPoints}
              className="input mt-1.5 text-sm"
            />
            <p className="mt-1 text-[11px] text-slate-400">Bonus points awarded immediately when an account is registered.</p>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700">Referred User Bonus (Points)</label>
            <input
              name="referredBonusPoints"
              type="number"
              min={0}
              step={10}
              defaultValue={initial.referredBonusPoints}
              className="input mt-1.5 text-sm"
            />
            <p className="mt-1 text-[11px] text-slate-400">Bonus awarded to a new user when signing up with an invitation code.</p>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700">Referrer Reward (Points)</label>
            <input
              name="referrerBonusPoints"
              type="number"
              min={0}
              step={10}
              defaultValue={initial.referrerBonusPoints}
              className="input mt-1.5 text-sm"
            />
            <p className="mt-1 text-[11px] text-slate-400">Bonus awarded to the existing user whose referral code was used.</p>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700">Point Redemption Value (Cents / Point)</label>
            <input
              name="pointValueCents"
              type="number"
              min={1}
              step={1}
              defaultValue={initial.pointValueCents}
              className="input mt-1.5 text-sm"
            />
            <p className="mt-1 text-[11px] text-slate-400">Value of 1 reward point in cents (1 cent = $0.01 redemption value).</p>
          </div>
        </div>
      </div>

      {/* SECTION 4: Shipping Controls */}
      <div className="card p-6 shadow-xs border border-slate-200/90 space-y-6">
        <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-blue-700">
            <Truck size={18} />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">Shipping & Delivery Rates</h2>
            <p className="text-xs text-slate-500">Configure standard shipping costs and free delivery cart thresholds.</p>
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label className="text-xs font-semibold text-slate-700">Free Shipping Threshold ($)</label>
            <div className="relative mt-1.5">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">$</span>
              <input
                name="freeShipping"
                type="number"
                min={0}
                step="0.01"
                defaultValue={(initial.freeShippingCents / 100).toFixed(2)}
                className="input pl-8 text-sm"
                placeholder="50.00"
              />
            </div>
            <p className="mt-1 text-[11px] text-slate-400">Orders equal to or above this subtotal qualify for free shipping.</p>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700">Standard Flat Shipping Rate ($)</label>
            <div className="relative mt-1.5">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">$</span>
              <input
                name="flatShipping"
                type="number"
                min={0}
                step="0.01"
                defaultValue={(initial.flatShippingCents / 100).toFixed(2)}
                className="input pl-8 text-sm"
                placeholder="5.00"
              />
            </div>
            <p className="mt-1 text-[11px] text-slate-400">Flat delivery fee applied to orders below free shipping threshold.</p>
          </div>
        </div>
      </div>

      {/* Submit footer bar */}
      <div className="sticky bottom-4 z-20 flex items-center justify-between rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-lift backdrop-blur">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Shield size={15} className="text-emerald-600" />
          <span>Changes take effect immediately across all client sessions and pages.</span>
        </div>
        <button
          type="submit"
          disabled={isPending || uploadingPrimary || uploadingLight}
          className="btn btn-primary min-w-[160px] !py-2.5 !px-5 text-sm font-semibold shadow-md flex items-center justify-center gap-2"
        >
          {isPending ? (
            <>
              <RefreshCw size={16} className="animate-spin" />
              <span>Saving Changes...</span>
            </>
          ) : (
            <>
              <Check size={16} />
              <span>Save Settings</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
