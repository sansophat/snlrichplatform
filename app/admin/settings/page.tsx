import { requireAdmin } from "@/lib/auth";
import { getPlatformSettings } from "@/lib/settings";
import { SettingsForm } from "./SettingsForm";
import { Sliders, ShieldCheck } from "lucide-react";

export const metadata = {
  title: "Platform Settings & Branding | SNLRICH Admin",
};

export default async function AdminSettingsPage() {
  await requireAdmin();
  const settings = await getPlatformSettings();

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-navy-900">Platform Settings & Branding</h1>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800">
              <ShieldCheck size={12} /> Global Config
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-500">
            Manage your store branding, primary and light logos, loyalty points, referral bonuses, and shipping policies.
          </p>
        </div>
      </div>

      {/* Main Form */}
      <SettingsForm initial={settings} />
    </div>
  );
}
