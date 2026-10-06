import { requireMerchant } from "@/lib/auth";
import { SettingsForm } from "./SettingsForm";

export const dynamic = "force-dynamic";
export const metadata = { title: "Store settings" };

export default async function SettingsPage() {
  const { merchant } = await requireMerchant();
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-navy-900">Store & rewards</h1>
      <SettingsForm m={merchant} />
    </div>
  );
}
