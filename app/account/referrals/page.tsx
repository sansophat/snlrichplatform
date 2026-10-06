import { headers } from "next/headers";
import { requireUser } from "@/lib/auth";
import { Stat } from "@/components/Dashboard";
import { CopyField } from "@/components/CopyField";
import { REWARDS } from "@/lib/config";
import { getReferralNetwork } from "@/lib/referral-network";
import { ReferralNetworkTree } from "@/components/ReferralNetworkTree";
import { Gift, Sparkles, Users, Award } from "lucide-react";

export const dynamic = "force-dynamic";
export const metadata = { title: "Refer & Earn · Network Tree" };

export default async function ReferralsPage() {
  const user = await requireUser();
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  const link = `${proto}://${host}/register?ref=${user.referralCode}`;

  const network = await getReferralNetwork(user.id);

  const totalNetwork = network?.totalNetworkSize ?? 0;
  const directFriends = network?.tier1Count ?? 0;
  const converted = network?.convertedCount ?? 0;
  const earned = network?.pointsEarned ?? 0;

  return (
    <div className="space-y-6">
      {/* Title & Introduction */}
      <div>
        <h1 className="text-2xl font-black text-navy-900 tracking-tight">Refer & Earn</h1>
        <p className="text-xs text-slate-500 mt-1">
          Build your personal downline network, invite friends, and earn continuous rewards as your community shops.
        </p>
      </div>

      {/* Rewards Explainer Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-navy-900 via-navy-800 to-navy-900 p-6 text-white shadow-sm border border-navy-800">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sand-300 text-xs font-bold uppercase tracking-wider">
              <Gift size={15} />
              <span>Two-Way Member Reward</span>
            </div>
            <h2 className="text-xl font-extrabold sm:text-2xl">
              Give {REWARDS.REFERRED_SIGNUP_BONUS} Points · Earn {REWARDS.REFERRER_BONUS} Points
            </h2>
            <p className="text-xs text-slate-300 max-w-xl">
              Your invited guests receive <b>{REWARDS.REFERRED_SIGNUP_BONUS} welcome points</b> automatically upon registration with your locked referral code. You receive <b>{REWARDS.REFERRER_BONUS} points</b> the moment their first order is delivered!
            </p>
          </div>
          <div className="shrink-0 flex items-center gap-2 bg-white/10 px-4 py-3 rounded-xl border border-white/10">
            <Sparkles size={20} className="text-amber-400" />
            <div>
              <div className="text-xs font-semibold text-slate-300">Reward Per Friend</div>
              <div className="text-lg font-black text-white">+{REWARDS.REFERRER_BONUS} PTS</div>
            </div>
          </div>
        </div>
      </div>

      {/* Invite Code & Link Card */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="card p-5 border border-slate-200 space-y-2">
          <label className="label text-navy-900 font-bold">Your Referral Code</label>
          <CopyField value={user.referralCode} />
          <p className="text-[11px] text-slate-400">
            Friends can enter this code during checkout or sign-up.
          </p>
        </div>
        <div className="card p-5 border border-slate-200 space-y-2">
          <label className="label text-navy-900 font-bold">Your Direct Invitation Link</label>
          <CopyField value={link} />
          <p className="text-[11px] text-slate-400">
            Locks the referral code automatically so guests cannot cross-line.
          </p>
        </div>
      </div>

      {/* High-Level Overview Stats */}
      <div className="grid gap-3 sm:grid-cols-4">
        <Stat label="Direct Invites (Tier 1)" value={String(directFriends)} sub="Personal recruits" />
        <Stat label="Total Network Size" value={String(totalNetwork)} sub="Across all downline tiers" tone="gold" />
        <Stat label="Converted Friends" value={String(converted)} sub="First order delivered" tone="green" />
        <Stat label="Points Earned" value={earned.toLocaleString()} tone="gold" sub="Credited to your balance" />
      </div>

      {/* Multi-Tier Network Tree Component */}
      {network && (
        <ReferralNetworkTree network={network} inviteLink={link} />
      )}
    </div>
  );
}
