import { requireUser } from "@/lib/auth";
import { ProfileForm } from "./ProfileForm";

export const dynamic = "force-dynamic";
export const metadata = { title: "Profile Settings | My Account" };

export default async function CustomerProfilePage() {
  const user = await requireUser();

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-100 pb-4">
        <h1 className="text-2xl font-bold text-navy-900">Profile & Account Settings</h1>
        <p className="text-xs text-slate-500">Manage your personal information, profile photo, default address and security.</p>
      </div>

      <ProfileForm user={user} />
    </div>
  );
}
