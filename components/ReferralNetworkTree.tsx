"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import type { ReferralNetworkData, NetworkMemberNode, FlatNetworkMember } from "@/lib/referral-network";
import { dateFmt } from "@/lib/format";
import {
  GitFork,
  Users,
  ChevronDown,
  ChevronRight,
  Search,
  CheckCircle2,
  Clock,
  Sparkles,
  Layers,
  Copy,
  Check,
  ShieldCheck,
  Crown,
  Share2,
  Package,
  Coins,
  BadgeAlert,
  Eye,
  X,
  ExternalLink,
  Store,
  UserCheck,
  ArrowRight,
  Info,
} from "lucide-react";

const TIER_CONFIG: Record<
  number,
  {
    bg: string;
    text: string;
    border: string;
    ring: string;
    glow: string;
    label: string;
    avatarRing: string;
    avatarBg: string;
  }
> = {
  0: {
    bg: "bg-navy-900",
    text: "text-white",
    border: "border-navy-950",
    ring: "ring-amber-400/50",
    glow: "shadow-amber-500/10",
    label: "You (Leader)",
    avatarRing: "ring-amber-400",
    avatarBg: "bg-gradient-to-tr from-amber-600 to-amber-400 text-white",
  },
  1: {
    bg: "bg-indigo-50",
    text: "text-indigo-700",
    border: "border-indigo-200",
    ring: "ring-indigo-400/50",
    glow: "hover:shadow-indigo-100",
    label: "Tier 1 · Direct",
    avatarRing: "ring-indigo-500",
    avatarBg: "bg-gradient-to-tr from-indigo-700 to-indigo-500 text-white",
  },
  2: {
    bg: "bg-purple-50",
    text: "text-purple-700",
    border: "border-purple-200",
    ring: "ring-purple-400/50",
    glow: "hover:shadow-purple-100",
    label: "Tier 2 · Sub-referral",
    avatarRing: "ring-purple-500",
    avatarBg: "bg-gradient-to-tr from-purple-700 to-purple-500 text-white",
  },
  3: {
    bg: "bg-amber-50",
    text: "text-amber-800",
    border: "border-amber-200",
    ring: "ring-amber-400/50",
    glow: "hover:shadow-amber-100",
    label: "Tier 3 · Network",
    avatarRing: "ring-amber-500",
    avatarBg: "bg-gradient-to-tr from-amber-600 to-amber-500 text-white",
  },
  4: {
    bg: "bg-emerald-50",
    text: "text-emerald-800",
    border: "border-emerald-200",
    ring: "ring-emerald-400/50",
    glow: "hover:shadow-emerald-100",
    label: "Tier 4 · Extended",
    avatarRing: "ring-emerald-500",
    avatarBg: "bg-gradient-to-tr from-emerald-700 to-emerald-500 text-white",
  },
  5: {
    bg: "bg-rose-50",
    text: "text-rose-800",
    border: "border-rose-200",
    ring: "ring-rose-400/50",
    glow: "hover:shadow-rose-100",
    label: "Tier 5 · Deep",
    avatarRing: "ring-rose-500",
    avatarBg: "bg-gradient-to-tr from-rose-700 to-rose-500 text-white",
  },
};

function getTierConfig(tier: number) {
  return (
    TIER_CONFIG[tier] || {
      bg: "bg-slate-50",
      text: "text-slate-700",
      border: "border-slate-200",
      ring: "ring-slate-400/50",
      glow: "hover:shadow-slate-100",
      label: `Tier ${tier}`,
      avatarRing: "ring-slate-500",
      avatarBg: "bg-slate-700 text-white",
    }
  );
}

function maskEmail(email: string) {
  if (!email || !email.includes("@")) return email;
  const [user, domain] = email.split("@");
  if (user.length <= 2) return `${user}***@${domain}`;
  return `${user.slice(0, 2)}***${user.slice(-1)}@${domain}`;
}

export function ReferralNetworkTree({
  network,
  inviteLink,
}: {
  network: ReferralNetworkData;
  inviteLink: string;
}) {
  const [viewMode, setViewMode] = useState<"tree" | "table" | "tiers">("tree");
  const [search, setSearch] = useState("");
  const [tierFilter, setTierFilter] = useState<string>("ALL");
  const [collapsedMap, setCollapsedMap] = useState<Record<string, boolean>>({});
  const [copied, setCopied] = useState(false);
  const [selectedNode, setSelectedNode] = useState<NetworkMemberNode | null>(null);

  const toggleCollapse = (id: string) => {
    setCollapsedMap((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const expandAll = () => setCollapsedMap({});

  const collapseAll = () => {
    const allIds: Record<string, boolean> = {};
    const collect = (node: NetworkMemberNode) => {
      if (node.children.length > 0) allIds[node.id] = true;
      node.children.forEach(collect);
    };
    collect(network.root);
    setCollapsedMap(allIds);
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  // Filter flat list for table view
  const filteredFlatList = useMemo(() => {
    return network.flatList.filter((m) => {
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        m.name.toLowerCase().includes(q) ||
        m.email.toLowerCase().includes(q) ||
        m.referralCode.toLowerCase().includes(q) ||
        (m.sponsorName && m.sponsorName.toLowerCase().includes(q));

      const matchTier =
        tierFilter === "ALL"
          ? true
          : tierFilter === "1"
          ? m.tier === 1
          : tierFilter === "2"
          ? m.tier === 2
          : tierFilter === "3"
          ? m.tier >= 3
          : true;

      return matchSearch && matchTier;
    });
  }, [network.flatList, search, tierFilter]);

  // Check if any child matches search to auto-expand branch
  const isMatch = (node: NetworkMemberNode): boolean => {
    if (!search) return false;
    const q = search.toLowerCase();
    return (
      node.name.toLowerCase().includes(q) ||
      node.email.toLowerCase().includes(q) ||
      node.referralCode.toLowerCase().includes(q)
    );
  };

  const hasMatchingDescendant = (node: NetworkMemberNode): boolean => {
    if (!search) return false;
    if (isMatch(node)) return true;
    return node.children.some(hasMatchingDescendant);
  };

  return (
    <div className="space-y-6">
      {/* Network Overview Summary Banner with subtle shimmer & glowing stats */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-navy-950 via-navy-900 to-navy-950 p-6 sm:p-8 text-white shadow-2xl border border-navy-800">
        <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-amber-500/10 blur-3xl" />
        <div className="pointer-events-none absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-indigo-500/10 blur-3xl" />

        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2.5">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1 text-xs font-semibold text-sand-300 backdrop-blur-md border border-white/10 shadow-xs">
              <Crown size={14} className="text-amber-400 animate-bounce" />
              <span>Multi-Tier Network Genealogy</span>
            </div>
            <h2 className="text-2xl font-black tracking-tight sm:text-3xl lg:text-4xl">
              Your Referral Network Tree
            </h2>
            <p className="max-w-xl text-xs sm:text-sm text-slate-300 leading-relaxed">
              Explore your complete downline community with profile photos, real-time activity metrics,
              and multi-tier reward conversions.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <button
              onClick={copyLink}
              className="group inline-flex items-center gap-2 rounded-xl bg-amber-500 px-5 py-3 text-xs font-bold text-navy-950 shadow-lg shadow-amber-500/20 transition-all duration-200 hover:bg-amber-400 hover:scale-105 active:scale-95"
            >
              {copied ? <Check size={16} /> : <Share2 size={16} className="transition-transform group-hover:rotate-12" />}
              <span>{copied ? "Invite Link Copied!" : "Share Invite Link"}</span>
            </button>
          </div>
        </div>

        {/* Metric Badges with modern glassmorphism */}
        <div className="relative z-10 mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-5 border-t border-white/10 pt-6">
          <div className="rounded-2xl bg-white/5 p-4 backdrop-blur-md border border-white/10 transition-all hover:bg-white/10 hover:-translate-y-0.5">
            <div className="text-xs font-medium text-slate-400">Total Network</div>
            <div className="mt-1 text-2xl sm:text-3xl font-black text-white">
              {network.totalNetworkSize}
            </div>
            <div className="text-[11px] text-sand-300 font-medium">all downline tiers</div>
          </div>

          <div className="rounded-2xl bg-white/5 p-4 backdrop-blur-md border border-white/10 transition-all hover:bg-white/10 hover:-translate-y-0.5">
            <div className="text-xs font-medium text-slate-400">Tier 1 (Direct)</div>
            <div className="mt-1 text-2xl sm:text-3xl font-black text-indigo-300">
              {network.tier1Count}
            </div>
            <div className="text-[11px] text-slate-400">personal invites</div>
          </div>

          <div className="rounded-2xl bg-white/5 p-4 backdrop-blur-md border border-white/10 transition-all hover:bg-white/10 hover:-translate-y-0.5">
            <div className="text-xs font-medium text-slate-400">Tier 2 (Indirect)</div>
            <div className="mt-1 text-2xl sm:text-3xl font-black text-purple-300">
              {network.tier2Count}
            </div>
            <div className="text-[11px] text-slate-400">sub-referrals</div>
          </div>

          <div className="rounded-2xl bg-white/5 p-4 backdrop-blur-md border border-white/10 transition-all hover:bg-white/10 hover:-translate-y-0.5">
            <div className="text-xs font-medium text-slate-400">Tier 3+ Deep</div>
            <div className="mt-1 text-2xl sm:text-3xl font-black text-amber-300">
              {network.tier3PlusCount}
            </div>
            <div className="text-[11px] text-slate-400">extended network</div>
          </div>

          <div className="col-span-2 sm:col-span-1 rounded-2xl bg-white/5 p-4 backdrop-blur-md border border-white/10 transition-all hover:bg-white/10 hover:-translate-y-0.5">
            <div className="text-xs font-medium text-slate-400">Rewards Converted</div>
            <div className="mt-1 text-2xl sm:text-3xl font-black text-emerald-400">
              {network.convertedCount}
            </div>
            <div className="text-[11px] text-emerald-300 font-medium">orders delivered</div>
          </div>
        </div>
      </div>

      {/* Control Bar: View Modes & Filters */}
      <div className="card p-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border border-slate-200/90 shadow-sm">
        <div className="flex items-center gap-1.5 rounded-xl bg-slate-100 p-1 text-xs font-semibold">
          <button
            onClick={() => setViewMode("tree")}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 transition-all duration-200 ${
              viewMode === "tree"
                ? "bg-white text-navy-900 shadow-sm font-bold scale-[1.02]"
                : "text-slate-600 hover:text-navy-900"
            }`}
          >
            <GitFork size={14} /> Tree View
          </button>
          <button
            onClick={() => setViewMode("table")}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 transition-all duration-200 ${
              viewMode === "table"
                ? "bg-white text-navy-900 shadow-sm font-bold scale-[1.02]"
                : "text-slate-600 hover:text-navy-900"
            }`}
          >
            <Users size={14} /> Directory List ({network.totalNetworkSize})
          </button>
          <button
            onClick={() => setViewMode("tiers")}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 transition-all duration-200 ${
              viewMode === "tiers"
                ? "bg-white text-navy-900 shadow-sm font-bold scale-[1.02]"
                : "text-slate-600 hover:text-navy-900"
            }`}
          >
            <Layers size={14} /> Tier Breakdown
          </button>
        </div>

        {/* Search & Collapse Controls */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-64">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search member, email, code…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input !py-1.5 !pl-8 text-xs transition focus:ring-2 focus:ring-navy-600/20"
            />
          </div>

          {viewMode === "tree" && (
            <div className="flex items-center gap-1 text-xs">
              <button
                onClick={expandAll}
                className="btn btn-outline btn-sm !py-1 !px-2.5 text-[11px] font-semibold hover:bg-slate-100"
                title="Expand all branches"
              >
                Expand All
              </button>
              <button
                onClick={collapseAll}
                className="btn btn-outline btn-sm !py-1 !px-2.5 text-[11px] font-semibold hover:bg-slate-100"
                title="Collapse all branches"
              >
                Collapse All
              </button>
            </div>
          )}
        </div>
      </div>

      {/* VIEW 1: Visual Network Tree */}
      {viewMode === "tree" && (
        <div className="card p-6 sm:p-8 border border-slate-200/90 shadow-sm overflow-x-auto">
          {network.totalNetworkSize === 0 ? (
            <div className="py-16 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 mb-3 shadow-sm">
                <GitFork size={30} />
              </div>
              <h3 className="text-base font-bold text-navy-900">Your Network Tree is Ready</h3>
              <p className="mx-auto mt-1 max-w-sm text-xs text-slate-500">
                You haven&apos;t invited any friends yet. Share your personal invite link to start building your multi-tier genealogy tree!
              </p>
              <div className="mt-5 flex justify-center">
                <button
                  onClick={copyLink}
                  className="btn btn-primary btn-sm inline-flex items-center gap-2 font-bold shadow-md"
                >
                  <Copy size={14} /> {copied ? "Copied!" : "Copy Your Referral Link"}
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Legend & Summary Info */}
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between text-xs text-slate-500 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                  <span className="font-bold text-navy-900">Genealogy Tiers:</span>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-2.5 py-0.5 text-[11px] font-bold text-indigo-700 border border-indigo-200 shadow-xs">
                    <span className="h-2 w-2 rounded-full bg-indigo-500" /> Tier 1: Direct
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-50 px-2.5 py-0.5 text-[11px] font-bold text-purple-700 border border-purple-200 shadow-xs">
                    <span className="h-2 w-2 rounded-full bg-purple-500" /> Tier 2: Sub-referral
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-0.5 text-[11px] font-bold text-amber-800 border border-amber-200 shadow-xs">
                    <span className="h-2 w-2 rounded-full bg-amber-500" /> Tier 3+: Extended
                  </span>
                </div>
                <div className="text-[11px] font-medium text-slate-500">
                  Network Reach: <b className="text-navy-900">{network.maxDepth} Levels Deep</b>
                </div>
              </div>

              {/* Recursive Tree Renderer */}
              <div className="pt-2">
                <TreeNodeComponent
                  node={network.root}
                  isRoot={true}
                  collapsedMap={collapsedMap}
                  toggleCollapse={toggleCollapse}
                  search={search}
                  isMatch={isMatch}
                  hasMatchingDescendant={hasMatchingDescendant}
                  onSelectNode={setSelectedNode}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* VIEW 2: Member Directory Table */}
      {viewMode === "table" && (
        <div className="card overflow-hidden p-0 border border-slate-200/90 shadow-sm">
          {/* Tier Filter Pills */}
          <div className="flex items-center gap-2 border-b border-slate-100 bg-slate-50/70 p-3 text-xs">
            <span className="font-semibold text-slate-500">Filter Tier:</span>
            {[
              { id: "ALL", label: `All (${network.totalNetworkSize})` },
              { id: "1", label: `Tier 1 Direct (${network.tier1Count})` },
              { id: "2", label: `Tier 2 Sub (${network.tier2Count})` },
              { id: "3", label: `Tier 3+ Deep (${network.tier3PlusCount})` },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setTierFilter(t.id)}
                className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                  tierFilter === t.id
                    ? "bg-navy-900 text-white shadow-xs"
                    : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Member</th>
                  <th className="py-3 px-4">Tier Level</th>
                  <th className="py-3 px-4">Referral Code</th>
                  <th className="py-3 px-4">Sponsor (Inviter)</th>
                  <th className="py-3 px-4 text-center">KYC & Activity</th>
                  <th className="py-3 px-4 text-center">Downline</th>
                  <th className="py-3 px-4 text-right">Reward Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredFlatList.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      No network members found matching your search.
                    </td>
                  </tr>
                ) : (
                  filteredFlatList.map((m) => {
                    const cfg = getTierConfig(m.tier);
                    return (
                      <tr key={m.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full border-2 border-white shadow-xs">
                              {m.avatarUrl ? (
                                <Image
                                  src={m.avatarUrl}
                                  alt={m.name}
                                  fill
                                  sizes="36px"
                                  className="object-cover"
                                />
                              ) : (
                                <div className={`flex h-full w-full items-center justify-center font-black text-xs ${cfg.avatarBg}`}>
                                  {m.name.slice(0, 2).toUpperCase()}
                                </div>
                              )}
                            </div>
                            <div>
                              <div className="font-bold text-navy-900 text-sm flex items-center gap-1.5">
                                <span>{m.name}</span>
                                {m.role === "MERCHANT" && (
                                  <span className="rounded bg-amber-100 px-1 py-0.2 text-[9px] font-bold text-amber-800">
                                    Merchant
                                  </span>
                                )}
                              </div>
                              <div className="text-[11px] text-slate-400">{maskEmail(m.email)}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-bold border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
                            {cfg.label}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-navy-900">
                          {m.referralCode}
                        </td>
                        <td className="py-3 px-4 font-medium text-slate-700">
                          {m.sponsorName || "You"}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="inline-flex flex-col items-center gap-0.5">
                            {m.kycStatus === "VERIFIED" ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                                <ShieldCheck size={11} /> KYC Verified
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[10px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                                KYC Pending
                              </span>
                            )}
                            <span className="text-[10px] text-slate-400">
                              {m.ordersCount} orders · {m.points} pts
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="inline-flex items-center gap-1 font-semibold text-slate-700 bg-slate-100 rounded-lg px-2.5 py-1 text-[11px] border border-slate-200/80">
                            👥 {m.directCount} direct · {m.totalTeamCount} team
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          {m.referralRewarded ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-bold text-emerald-800 border border-emerald-200">
                              <CheckCircle2 size={12} /> Reward Paid
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-[11px] font-bold text-amber-800 border border-amber-200">
                              <Clock size={12} /> Waiting 1st order
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW 3: Tier Breakdown Analytics */}
      {viewMode === "tiers" && (
        <div className="grid gap-4 sm:grid-cols-3">
          {/* Tier 1 Card */}
          <div className="card p-6 border border-indigo-200 bg-gradient-to-br from-indigo-50/60 via-white to-white shadow-sm space-y-3 transition-all hover:-translate-y-1 hover:shadow-md">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1 rounded-full bg-indigo-100 px-3 py-1 text-xs font-bold text-indigo-800">
                Tier 1
              </span>
              <span className="text-xs font-semibold text-slate-400">Direct Recruits</span>
            </div>
            <div>
              <div className="text-3xl font-black text-indigo-900">{network.tier1Count}</div>
              <div className="text-xs text-slate-500 mt-1">Friends joined directly using your code</div>
            </div>
            <div className="pt-3 border-t border-indigo-100 text-xs flex justify-between text-slate-600 font-medium">
              <span>Share of Network:</span>
              <span className="font-bold text-indigo-900">
                {network.totalNetworkSize > 0
                  ? Math.round((network.tier1Count / network.totalNetworkSize) * 100)
                  : 0}
                %
              </span>
            </div>
          </div>

          {/* Tier 2 Card */}
          <div className="card p-6 border border-purple-200 bg-gradient-to-br from-purple-50/60 via-white to-white shadow-sm space-y-3 transition-all hover:-translate-y-1 hover:shadow-md">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1 rounded-full bg-purple-100 px-3 py-1 text-xs font-bold text-purple-800">
                Tier 2
              </span>
              <span className="text-xs font-semibold text-slate-400">Sub-Referrals</span>
            </div>
            <div>
              <div className="text-3xl font-black text-purple-900">{network.tier2Count}</div>
              <div className="text-xs text-slate-500 mt-1">Friends invited by your Tier 1 members</div>
            </div>
            <div className="pt-3 border-t border-purple-100 text-xs flex justify-between text-slate-600 font-medium">
              <span>Share of Network:</span>
              <span className="font-bold text-purple-900">
                {network.totalNetworkSize > 0
                  ? Math.round((network.tier2Count / network.totalNetworkSize) * 100)
                  : 0}
                %
              </span>
            </div>
          </div>

          {/* Tier 3+ Card */}
          <div className="card p-6 border border-amber-200 bg-gradient-to-br from-amber-50/60 via-white to-white shadow-sm space-y-3 transition-all hover:-translate-y-1 hover:shadow-md">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800">
                Tier 3+
              </span>
              <span className="text-xs font-semibold text-slate-400">Deep Network</span>
            </div>
            <div>
              <div className="text-3xl font-black text-amber-900">{network.tier3PlusCount}</div>
              <div className="text-xs text-slate-500 mt-1">Downline referrals across deeper tiers</div>
            </div>
            <div className="pt-3 border-t border-amber-100 text-xs flex justify-between text-slate-600 font-medium">
              <span>Max Depth Reached:</span>
              <span className="font-bold text-amber-900">{network.maxDepth} Levels</span>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Member Detail Modal */}
      {selectedNode && (
        <MemberDetailModal
          node={selectedNode}
          onClose={() => setSelectedNode(null)}
        />
      )}
    </div>
  );
}

/**
 * Recursive tree node component with animated expand/collapse, profile photos, and hover elevation
 */
function TreeNodeComponent({
  node,
  isRoot,
  collapsedMap,
  toggleCollapse,
  search,
  isMatch,
  hasMatchingDescendant,
  onSelectNode,
}: {
  node: NetworkMemberNode;
  isRoot: boolean;
  collapsedMap: Record<string, boolean>;
  toggleCollapse: (id: string) => void;
  search: string;
  isMatch: (node: NetworkMemberNode) => boolean;
  hasMatchingDescendant: (node: NetworkMemberNode) => boolean;
  onSelectNode: (node: NetworkMemberNode) => void;
}) {
  const isCollapsed = !isRoot && Boolean(collapsedMap[node.id]) && !hasMatchingDescendant(node);
  const matched = isMatch(node);
  const cfg = getTierConfig(node.tier);
  const hasChildren = node.children.length > 0;

  return (
    <div className="relative">
      {/* Node Card */}
      <div
        className={`group relative flex items-start gap-3.5 rounded-2xl border p-4 transition-all duration-300 ease-out ${
          isRoot
            ? "bg-gradient-to-r from-navy-950 via-navy-900 to-navy-950 text-white border-navy-800 shadow-xl max-w-xl ring-1 ring-amber-400/30"
            : matched
            ? "bg-amber-50/95 border-amber-400 ring-2 ring-amber-400 shadow-lg scale-[1.01] max-w-xl"
            : `bg-white hover:bg-slate-50/95 border-slate-200/90 hover:border-slate-300 hover:-translate-y-0.5 hover:shadow-md ${cfg.glow} max-w-xl`
        }`}
      >
        {/* Expand / Collapse Button */}
        {hasChildren ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              toggleCollapse(node.id);
            }}
            className={`mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border text-xs font-bold transition-all duration-200 active:scale-95 ${
              isRoot
                ? "bg-white/10 text-white border-white/20 hover:bg-white/20"
                : "bg-slate-100 text-slate-700 border-slate-300 hover:bg-navy-900 hover:text-white hover:border-navy-900"
            }`}
            title={isCollapsed ? `Expand branch (${node.children.length} recruits)` : "Collapse branch"}
          >
            {isCollapsed ? <ChevronRight size={15} /> : <ChevronDown size={15} />}
          </button>
        ) : (
          <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-slate-300">
            •
          </div>
        )}

        {/* Profile Image with Tier Frame & Active Badge */}
        <div className="relative shrink-0">
          <div
            className={`relative h-12 w-12 overflow-hidden rounded-2xl border-2 transition-transform duration-300 group-hover:scale-105 shadow-sm ${
              isRoot
                ? "border-amber-400 ring-2 ring-amber-400/40"
                : `${cfg.border} ring-2 ${cfg.ring}`
            }`}
          >
            {node.avatarUrl ? (
              <Image
                src={node.avatarUrl}
                alt={node.name}
                fill
                sizes="48px"
                className="object-cover"
              />
            ) : (
              <div
                className={`flex h-full w-full items-center justify-center font-black text-sm ${cfg.avatarBg}`}
              >
                {node.name.slice(0, 2).toUpperCase()}
              </div>
            )}
          </div>

          {/* Active status indicator dot */}
          <span
            className={`absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full border-2 border-white shadow-xs ${
              isRoot
                ? "bg-amber-400 text-navy-950"
                : node.referralRewarded
                ? "bg-emerald-500"
                : "bg-amber-400"
            }`}
            title={isRoot ? "Leader" : node.referralRewarded ? "Active & Rewarded" : "Pending Order"}
          >
            {isRoot && <Crown size={9} />}
          </span>
        </div>

        {/* Node Content */}
        <div className="min-w-0 flex-1 space-y-1.5">
          {/* Row 1: Name, Role & Tier Badge */}
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`font-black text-sm truncate tracking-tight ${
                isRoot ? "text-white" : "text-navy-900"
              }`}
            >
              {isRoot ? `${node.name} (You)` : node.name}
            </span>

            {/* Tier Badge */}
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold border transition-colors ${
                isRoot
                  ? "bg-amber-400 text-navy-950 border-amber-300 font-extrabold shadow-xs"
                  : `${cfg.bg} ${cfg.text} ${cfg.border}`
              }`}
            >
              {cfg.label}
            </span>

            {/* Merchant badge if applicable */}
            {node.role === "MERCHANT" && (
              <span className="inline-flex items-center gap-1 rounded bg-amber-100/90 px-1.5 py-0.5 text-[10px] font-bold text-amber-900 border border-amber-200">
                <Store size={10} /> {node.merchantName || "Merchant"}
              </span>
            )}

            {/* KYC status pill */}
            {node.kycStatus === "VERIFIED" ? (
              <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-100/80 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                <ShieldCheck size={11} /> Verified
              </span>
            ) : (
              <span className="inline-flex items-center rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-500">
                KYC Pending
              </span>
            )}

            {/* Reward Conversion Badge */}
            {!isRoot && (
              node.referralRewarded ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800 border border-emerald-200">
                  <CheckCircle2 size={10} /> Converted (+500 pts)
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800 border border-amber-200">
                  <Clock size={10} /> Awaiting order
                </span>
              )
            )}
          </div>

          {/* Row 2: Referral Code, Email, Sponsor & Joined Date */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-slate-400">
            <span>
              Code:{" "}
              <code
                className={`rounded px-1 py-0.5 font-mono font-bold ${
                  isRoot
                    ? "bg-white/10 text-amber-300"
                    : "bg-slate-100 text-navy-900 border border-slate-200"
                }`}
              >
                {node.referralCode}
              </code>
            </span>
            <span>{maskEmail(node.email)}</span>
            <span>Joined: {dateFmt(node.createdAt)}</span>
            {node.sponsorName && (
              <span>
                Invited by: <b className="text-slate-700">{node.sponsorName}</b>
              </span>
            )}
          </div>

          {/* Row 3: Downline Activity Metrics Bar & Detail Trigger */}
          <div className="pt-1.5 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100/60 dark:border-white/10 text-[11px]">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 font-semibold ${
                  isRoot
                    ? "bg-white/10 text-white"
                    : "bg-slate-100 text-slate-700 border border-slate-200"
                }`}
              >
                👥 <b>{node.directCount}</b> direct recruits
              </span>

              {node.totalTeamCount > node.directCount && (
                <span
                  className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 font-semibold ${
                    isRoot
                      ? "bg-white/10 text-sand-300"
                      : "bg-purple-50 text-purple-700 border border-purple-200"
                  }`}
                >
                  🌐 <b>{node.totalTeamCount}</b> total team
                </span>
              )}

              <span
                className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 font-semibold ${
                  isRoot
                    ? "bg-white/10 text-amber-300"
                    : "bg-amber-50 text-amber-800 border border-amber-200"
                }`}
              >
                <Coins size={11} /> {node.points.toLocaleString()} pts
              </span>

              {node.ordersCount > 0 && (
                <span
                  className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 font-semibold ${
                    isRoot
                      ? "bg-white/10 text-emerald-300"
                      : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  }`}
                >
                  <Package size={11} /> {node.ordersCount} orders
                </span>
              )}
            </div>

            {/* View Full Card Button */}
            <button
              type="button"
              onClick={() => onSelectNode(node)}
              className={`inline-flex items-center gap-1 font-semibold transition hover:underline ${
                isRoot
                  ? "text-sand-300 hover:text-white"
                  : "text-navy-700 hover:text-navy-950"
              }`}
            >
              <Eye size={12} /> View Profile
            </button>
          </div>
        </div>
      </div>

      {/* Children Branches with animated slide-down */}
      {hasChildren && !isCollapsed && (
        <div className="relative pl-6 sm:pl-8 mt-3 space-y-3 border-l-2 border-slate-200 ml-5 sm:ml-6 animate-in fade-in-50 slide-in-from-top-2 duration-200">
          {node.children.map((child) => (
            <div key={child.id} className="relative">
              {/* Horizontal line connector */}
              <div className="absolute -left-6 sm:-left-8 top-6 w-6 sm:w-8 h-0.5 bg-slate-200" />
              <TreeNodeComponent
                node={child}
                isRoot={false}
                collapsedMap={collapsedMap}
                toggleCollapse={toggleCollapse}
                search={search}
                isMatch={isMatch}
                hasMatchingDescendant={hasMatchingDescendant}
                onSelectNode={onSelectNode}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Interactive Profile Detail Modal for inspecting individual downline members
 */
function MemberDetailModal({
  node,
  onClose,
}: {
  node: NetworkMemberNode;
  onClose: () => void;
}) {
  const cfg = getTierConfig(node.tier);
  const [copiedCode, setCopiedCode] = useState(false);

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(node.referralCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    } catch {}
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="card w-full max-w-md overflow-hidden p-0 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-200">
        {/* Modal Header Banner */}
        <div className="relative bg-gradient-to-r from-navy-900 via-navy-800 to-navy-950 p-6 text-white">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 rounded-full bg-white/10 p-1.5 text-slate-300 hover:bg-white/20 hover:text-white transition"
          >
            <X size={16} />
          </button>

          <div className="flex items-center gap-4">
            <div className="relative h-16 w-16 overflow-hidden rounded-2xl border-2 border-white/80 shadow-md">
              {node.avatarUrl ? (
                <Image
                  src={node.avatarUrl}
                  alt={node.name}
                  fill
                  sizes="64px"
                  className="object-cover"
                />
              ) : (
                <div className={`flex h-full w-full items-center justify-center font-black text-lg ${cfg.avatarBg}`}>
                  {node.name.slice(0, 2).toUpperCase()}
                </div>
              )}
            </div>

            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-0.5 text-[11px] font-bold text-sand-300 border border-white/10">
                {cfg.label}
              </div>
              <h3 className="text-xl font-black text-white mt-1">{node.name}</h3>
              <p className="text-xs text-slate-300">{maskEmail(node.email)}</p>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4 text-xs text-slate-700">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
            <div className="rounded-xl bg-slate-50 p-3 border border-slate-200/80">
              <div className="text-[11px] text-slate-500 font-medium">Points Balance</div>
              <div className="text-base font-black text-navy-900 mt-0.5">
                {node.points.toLocaleString()}
              </div>
            </div>
            <div className="rounded-xl bg-slate-50 p-3 border border-slate-200/80">
              <div className="text-[11px] text-slate-500 font-medium">Orders Placed</div>
              <div className="text-base font-black text-navy-900 mt-0.5">
                {node.ordersCount}
              </div>
            </div>
            <div className="rounded-xl bg-slate-50 p-3 border border-slate-200/80">
              <div className="text-[11px] text-slate-500 font-medium">Direct Recruits</div>
              <div className="text-base font-black text-indigo-700 mt-0.5">
                {node.directCount}
              </div>
            </div>
            <div className="rounded-xl bg-slate-50 p-3 border border-slate-200/80">
              <div className="text-[11px] text-slate-500 font-medium">Total Downline</div>
              <div className="text-base font-black text-purple-700 mt-0.5">
                {node.totalTeamCount}
              </div>
            </div>
          </div>

          {/* Details List */}
          <div className="rounded-xl border border-slate-200 divide-y divide-slate-100 overflow-hidden">
            <div className="flex items-center justify-between p-3 bg-white">
              <span className="font-medium text-slate-500">Referral Code</span>
              <div className="flex items-center gap-2">
                <code className="font-mono font-bold text-navy-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                  {node.referralCode}
                </code>
                <button
                  onClick={copyCode}
                  className="rounded p-1 text-slate-500 hover:bg-slate-100 hover:text-navy-900"
                  title="Copy code"
                >
                  {copiedCode ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-white">
              <span className="font-medium text-slate-500">KYC Status</span>
              {node.kycStatus === "VERIFIED" ? (
                <span className="inline-flex items-center gap-1 font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  <ShieldCheck size={13} /> Verified
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 font-medium text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-full">
                  Pending Verification
                </span>
              )}
            </div>

            <div className="flex items-center justify-between p-3 bg-white">
              <span className="font-medium text-slate-500">Reward Status</span>
              {node.referralRewarded ? (
                <span className="inline-flex items-center gap-1 font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  <CheckCircle2 size={13} /> Reward Credited (+500 pts)
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 font-bold text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                  <Clock size={13} /> Awaiting First Order
                </span>
              )}
            </div>

            <div className="flex items-center justify-between p-3 bg-white">
              <span className="font-medium text-slate-500">Joined Date</span>
              <span className="font-semibold text-slate-800">{dateFmt(node.createdAt)}</span>
            </div>

            {node.sponsorName && (
              <div className="flex items-center justify-between p-3 bg-white">
                <span className="font-medium text-slate-500">Direct Sponsor</span>
                <span className="font-semibold text-navy-900">{node.sponsorName}</span>
              </div>
            )}
          </div>

          {/* Children / Recruits List preview if any */}
          {node.children.length > 0 && (
            <div className="space-y-2">
              <div className="font-bold text-navy-900 flex items-center justify-between">
                <span>Direct Team Members ({node.children.length})</span>
                <span className="text-[11px] text-slate-400 font-normal">Next Tier</span>
              </div>
              <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                {node.children.map((child) => (
                  <div
                    key={child.id}
                    className="flex items-center justify-between rounded-lg bg-slate-50 p-2 border border-slate-200/70"
                  >
                    <div className="flex items-center gap-2">
                      <div className="relative h-6 w-6 overflow-hidden rounded-full">
                        {child.avatarUrl ? (
                          <Image src={child.avatarUrl} alt={child.name} fill sizes="24px" className="object-cover" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-slate-200 text-[10px] font-bold text-slate-700">
                            {child.name.slice(0, 2).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <span className="font-semibold text-slate-800">{child.name}</span>
                    </div>
                    <span className="font-mono text-[10px] text-slate-500">{child.referralCode}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="pt-2 flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-primary btn-sm font-semibold w-full"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
