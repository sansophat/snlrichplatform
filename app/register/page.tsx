import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { RegisterForm } from "@/components/AuthForms";
import { REWARDS } from "@/lib/config";
import { prisma } from "@/lib/db";
import { Sparkles, ShieldCheck, AlertCircle } from "lucide-react";

export const metadata = { title: "Create account · SNLRICH" };

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ ref?: string }>;
}) {
  const { ref } = await searchParams;
  if (await getCurrentUser()) redirect("/account");

  const cleanRef = ref?.trim().toUpperCase();
  const referrer = cleanRef
    ? await prisma.user.findUnique({
        where: { referralCode: cleanRef },
        select: { id: true, name: true, referralCode: true },
      })
    : null;

  const isInviteLink = Boolean(cleanRef);
  const isReferrerValid = Boolean(referrer);

  return (
    <div className="container-x flex justify-center py-12">
      <div className="card w-full max-w-md p-8 shadow-xl border border-slate-200">
        <div className="mb-6">
          <h1 className="text-2xl font-black text-navy-900 tracking-tight">Join SNLRICH</h1>
          <p className="text-xs text-slate-500 mt-1">
            Create your account to unlock rewards, cashback, and multi-merchant benefits.
          </p>
        </div>

        {/* Invited banner when guest uses an invitation link with valid referrer */}
        {isInviteLink && isReferrerValid && (
          <div className="mb-6 rounded-2xl bg-gradient-to-br from-amber-50 to-amber-100/60 p-4 border border-amber-200/80 shadow-xs">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-500 text-white font-bold shadow-xs">
                <Sparkles size={18} />
              </div>
              <div className="min-w-0">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-amber-700">Official Invitation</div>
                <div className="font-extrabold text-navy-900 truncate text-sm">Invited by {referrer?.name}</div>
              </div>
            </div>
            <div className="mt-3 flex items-center gap-2 text-xs text-amber-900 bg-white/80 rounded-lg p-2.5 border border-amber-200/60">
              <ShieldCheck size={16} className="text-emerald-600 shrink-0" />
              <span>
                Referral code is locked to guarantee your <b>{REWARDS.REFERRED_SIGNUP_BONUS} welcome bonus points</b>!
              </span>
            </div>
          </div>
        )}

        {/* If ref code was provided but invalid in system */}
        {isInviteLink && !isReferrerValid && (
          <div className="mb-6 flex items-start gap-2.5 rounded-xl bg-red-50 p-3.5 text-xs text-red-700 border border-red-200">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold">Notice:</span> Invitation code &quot;{cleanRef}&quot; was not found in our system. You can enter a valid referral code below or continue with standard registration.
            </div>
          </div>
        )}

        {/* Standard sign-up bonus explanation if visiting without invite */}
        {!isInviteLink && (
          <div className="mb-6 rounded-xl bg-slate-50 p-3.5 text-xs text-slate-600 border border-slate-200/70">
            Get <b>{REWARDS.SIGNUP_BONUS} points</b> free — or <b>{REWARDS.REFERRED_SIGNUP_BONUS} points</b> if you join using an invitation link.
          </div>
        )}

        <RegisterForm
          refCode={referrer ? referrer.referralCode : cleanRef}
          referrerName={referrer?.name}
          isLocked={isInviteLink && isReferrerValid}
        />
      </div>
    </div>
  );
}
