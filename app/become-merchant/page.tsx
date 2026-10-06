import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { MerchantApplyForm } from "./MerchantApplyForm";

export const dynamic = "force-dynamic";
export const metadata = { title: "Become a merchant" };

export default async function BecomeMerchantPage() {
  const user = await requireUser();
  const m = user.merchant;
  return (
    <div className="container-x flex justify-center py-12">
      <div className="card w-full max-w-lg p-8">
        <h1 className="text-2xl font-bold text-navy-900">Sell on SNLRICH</h1>
        {!m && (
          <>
            <p className="mb-6 text-sm text-slate-500">Open your store, list products and reward your customers with points and cashback.</p>
            <MerchantApplyForm />
          </>
        )}
        {m?.status === "PENDING" && (
          <p className="mt-4 rounded-lg bg-amber-50 p-4 text-sm text-amber-800">
            Your application for <b>{m.name}</b> is under review. We&apos;ll activate it soon.
          </p>
        )}
        {m?.status === "SUSPENDED" && (
          <p className="mt-4 rounded-lg bg-red-50 p-4 text-sm text-red-700">Your store <b>{m.name}</b> is suspended. Please contact support.</p>
        )}
        {m?.status === "ACTIVE" && (
          <div className="mt-4 space-y-3">
            <p className="rounded-lg bg-emerald-50 p-4 text-sm text-emerald-800">Your store <b>{m.name}</b> is live!</p>
            <Link href="/merchant-portal" className="btn btn-primary">Open merchant portal</Link>
          </div>
        )}
      </div>
    </div>
  );
}
