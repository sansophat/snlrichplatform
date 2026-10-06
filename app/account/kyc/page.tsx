import { requireUser } from "@/lib/auth";
import { KycForm } from "./KycForm";

export const dynamic = "force-dynamic";
export const metadata = { title: "KYC Verification | My Account" };

export default async function KycPage() {
  const user = await requireUser();

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-100 pb-4">
        <h1 className="text-2xl font-bold text-navy-900">Identity & KYC Verification</h1>
        <p className="text-xs text-slate-500">
          Complete KYC compliance to protect your account, increase transaction security and verify store ownership.
        </p>
      </div>

      <KycForm user={user} />
    </div>
  );
}
