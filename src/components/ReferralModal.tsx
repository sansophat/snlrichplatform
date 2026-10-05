import React, { useState, useMemo } from 'react';
import {
  X,
  Share2,
  Copy,
  Check,
  Users,
  Gift,
  Coins,
  Sparkles,
  Trophy,
  Lock,
  LogIn,
  Network,
  ChevronDown,
  ChevronRight,
  UserCheck,
  ArrowUpRight,
  TrendingUp,
  Search,
  Filter,
  DollarSign,
  Award,
  Send,
  MessageCircle,
  Clock,
  Layers,
  Info,
} from 'lucide-react';
import { UserWallet, ReferralFriend, RegisteredUser, DownlineNode } from '../types';
import { INITIAL_DOWNLINE_TREE } from '../data/mockData';

interface ReferralModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: RegisteredUser | null;
  wallet: UserWallet | null;
  referrals: ReferralFriend[];
  onOpenAuthModal: () => void;
}

export const ReferralModal: React.FC<ReferralModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  wallet,
  referrals,
  onOpenAuthModal,
}) => {
  const [activeTab, setActiveTab] = useState<'tree' | 'list' | 'analytics'>('tree');
  const [copied, setCopied] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [levelFilter, setLevelFilter] = useState<'all' | '1' | '2'>('all');
  const [tierFilter, setTierFilter] = useState<string>('all');
  const [selectedNode, setSelectedNode] = useState<DownlineNode | null>(null);
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({
    dl_1: true,
    dl_2: true,
    dl_3: true,
  });
  const [cheeredMemberId, setCheeredMemberId] = useState<string | null>(null);

  // Downline data
  const [downlineTree, setDownlineTree] = useState<DownlineNode[]>(INITIAL_DOWNLINE_TREE);

  // Flattened downline list for search/filtering (Hook called unconditionally)
  const allMembersList = useMemo(() => {
    const list: DownlineNode[] = [];
    downlineTree.forEach((node) => {
      list.push(node);
      if (node.children) {
        node.children.forEach((child) => list.push(child));
      }
    });
    return list;
  }, [downlineTree]);

  if (!isOpen) return null;

  const referralCode = currentUser?.referralCode || wallet?.referralCode || 'SNL-RICH-8899';
  const referralUrl = `https://snlrich.com/ref/${referralCode}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(referralUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const toggleExpand = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setExpandedNodes((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Filtered members for matrix list view
  const filteredMembers = allMembersList.filter((m) => {
    const matchesSearch =
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLevel = levelFilter === 'all' || m.level.toString() === levelFilter;
    const matchesTier = tierFilter === 'all' || m.tier === tierFilter;
    return matchesSearch && matchesLevel && matchesTier;
  });

  // Network summary calculations
  const totalNetworkMembers = allMembersList.length;
  const level1Count = downlineTree.length;
  const level2Count = allMembersList.filter((m) => m.level === 2).length;
  const activeMembersCount = allMembersList.filter((m) => m.status === 'active').length;
  const totalTeamVolume = allMembersList.reduce((acc, m) => acc + m.totalVolume, 0);
  const totalCommissionEarned = allMembersList.reduce((acc, m) => acc + m.bonusEarned, 0);
  const totalPointsEarned = allMembersList.reduce((acc, m) => acc + m.pointsEarned, 0);

  const handleCheer = (member: DownlineNode, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setCheeredMemberId(member.id);
    setTimeout(() => setCheeredMemberId(null), 3000);
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'Platinum':
        return 'border-purple-400 bg-purple-50 text-purple-900 ring-purple-400/30';
      case 'Gold':
        return 'border-amber-400 bg-amber-50 text-amber-900 ring-amber-400/30';
      case 'Silver':
        return 'border-slate-300 bg-slate-50 text-slate-800 ring-slate-300/30';
      default:
        return 'border-amber-700/40 bg-amber-50/40 text-amber-950 ring-amber-600/20';
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4">
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-200 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-[#0B1B3D] text-white p-5 sm:p-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500 text-white flex items-center justify-center font-bold shadow-sm shrink-0">
              <Network className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold font-display">
                  Referral Program & Downline Network
                </h2>
                <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30">
                  2-Tier Affiliate
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Earn <strong className="text-amber-400">$15 + 500 pts</strong> on direct referrals and <strong className="text-emerald-400">$5 + 150 pts</strong> on sub-downlines
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        {!currentUser ? (
          /* Locked State for Unregistered Guests */
          <div className="p-8 sm:p-12 text-center space-y-6">
            <div className="w-16 h-16 rounded-3xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
              <Lock className="w-8 h-8" />
            </div>

            <div className="max-w-md mx-auto space-y-2">
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-emerald-700 bg-emerald-100/60 px-3 py-1 rounded-full">
                Registered Members Exclusive
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 font-display">
                Sign In to View Your Referral Downline Tree
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Referral bonuses, tree views with member photos, and multi-tier commission tracking are exclusive to registered SNL RICH accounts. Register for free in 30 seconds to receive your unique link and start building your team.
              </p>
            </div>

            <button
              onClick={() => {
                onClose();
                onOpenAuthModal();
              }}
              className="px-6 py-3 rounded-2xl bg-[#0B1B3D] hover:bg-[#152a5a] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 mx-auto shadow-md transition-colors cursor-pointer"
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In or Register as Customer</span>
            </button>
          </div>
        ) : (
          /* Active Referral Hub with Downline Tree View */
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
            {/* Top Invite Banner */}
            <div className="rounded-3xl bg-gradient-to-br from-emerald-600 via-teal-700 to-slate-900 p-5 sm:p-6 text-white shadow-md relative overflow-hidden">
              <div className="relative z-10 max-w-xl">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-[10px] font-black uppercase tracking-widest text-emerald-200 bg-black/25 px-2.5 py-0.5 rounded-full backdrop-blur-xs">
                    OFFICIAL SPONSOR LINK
                  </span>
                  <span className="text-[10px] text-amber-300 font-bold flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    Give $10 · Get $15 + 500 Pts
                  </span>
                </div>
                <h3 className="text-lg sm:text-2xl font-black font-display leading-tight mb-2">
                  Share Your Link & Build Your Referral Downline
                </h3>
                <p className="text-xs text-emerald-100 leading-relaxed max-w-lg">
                  Every friend who registers with your code joins your Level 1 direct team. When they invite friends, those members become your Level 2 sub-affiliates, compounding your rewards!
                </p>
              </div>

              {/* Link Box */}
              <div className="mt-4 p-3 rounded-2xl bg-black/40 backdrop-blur-md border border-white/20 flex flex-col sm:flex-row items-center gap-3">
                <div className="flex-1 w-full text-left truncate min-w-0">
                  <span className="text-[10px] text-slate-300 uppercase tracking-wider block font-semibold">
                    Personal Referral Code & URL
                  </span>
                  <span className="text-xs font-mono font-bold text-white truncate block">
                    {referralUrl}
                  </span>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
                  <button
                    onClick={handleCopy}
                    className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-white text-slate-900 hover:bg-emerald-50 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Link</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Network Statistics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5">
                <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
                  <span>Total Downline</span>
                  <Users className="w-4 h-4 text-blue-500" />
                </div>
                <div className="text-xl font-black text-slate-900 font-display">
                  {totalNetworkMembers} <span className="text-xs font-normal text-slate-500">Members</span>
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">
                  {level1Count} Direct (L1) · {level2Count} Sub-Team (L2)
                </div>
              </div>

              <div className="bg-emerald-50 border border-emerald-200/80 rounded-2xl p-3.5">
                <div className="flex items-center justify-between text-emerald-700 text-xs mb-1">
                  <span>Downline Cash</span>
                  <DollarSign className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="text-xl font-black text-emerald-700 font-display tabular-nums">
                  ${totalCommissionEarned.toFixed(2)}
                </div>
                <div className="text-[10px] text-emerald-600 font-medium mt-0.5">
                  100% credited to SNL Wallet
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200/80 rounded-2xl p-3.5">
                <div className="flex items-center justify-between text-amber-700 text-xs mb-1">
                  <span>Team Points</span>
                  <Coins className="w-4 h-4 text-amber-600" />
                </div>
                <div className="text-xl font-black text-amber-700 font-display tabular-nums">
                  +{totalPointsEarned.toLocaleString()}
                </div>
                <div className="text-[10px] text-amber-600 font-medium mt-0.5">
                  Worth ${(totalPointsEarned / 100).toFixed(2)} in discounts
                </div>
              </div>

              <div className="bg-purple-50 border border-purple-200/80 rounded-2xl p-3.5">
                <div className="flex items-center justify-between text-purple-700 text-xs mb-1">
                  <span>Team Volume</span>
                  <TrendingUp className="w-4 h-4 text-purple-600" />
                </div>
                <div className="text-xl font-black text-purple-700 font-display tabular-nums">
                  ${totalTeamVolume.toFixed(2)}
                </div>
                <div className="text-[10px] text-purple-600 font-medium mt-0.5">
                  Across {activeMembersCount} active buyers
                </div>
              </div>
            </div>

            {/* Navigation Tabs between Tree View and List Matrix */}
            <div className="flex items-center justify-between border-b border-slate-200 pt-2">
              <div className="flex items-center gap-1 sm:gap-2">
                <button
                  onClick={() => setActiveTab('tree')}
                  className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all flex items-center gap-2 cursor-pointer border-b-2 ${
                    activeTab === 'tree'
                      ? 'border-[#0B1B3D] text-[#0B1B3D] bg-slate-50'
                      : 'border-transparent text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <Network className="w-4 h-4" />
                  <span>Downline Tree View</span>
                </button>

                <button
                  onClick={() => setActiveTab('list')}
                  className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all flex items-center gap-2 cursor-pointer border-b-2 ${
                    activeTab === 'list'
                      ? 'border-[#0B1B3D] text-[#0B1B3D] bg-slate-50'
                      : 'border-transparent text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <Layers className="w-4 h-4" />
                  <span>Network Matrix List ({filteredMembers.length})</span>
                </button>

                <button
                  onClick={() => setActiveTab('analytics')}
                  className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all flex items-center gap-2 cursor-pointer border-b-2 ${
                    activeTab === 'analytics'
                      ? 'border-[#0B1B3D] text-[#0B1B3D] bg-slate-50'
                      : 'border-transparent text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <Award className="w-4 h-4" />
                  <span>Compensation Plan</span>
                </button>
              </div>

              {cheeredMemberId && (
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-xl animate-in fade-in flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  Cheer Sent to Downline!
                </span>
              )}
            </div>

            {/* TAB 1: INTERACTIVE TREE VIEW WITH PHOTOS */}
            {activeTab === 'tree' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs text-slate-500 bg-slate-50 p-3 rounded-2xl border border-slate-200">
                  <div className="flex items-center gap-2">
                    <Info className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>
                      Visual downline hierarchy tree. Click nodes to view member performance or toggle sub-branches.
                    </span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() =>
                        setExpandedNodes({
                          dl_1: true,
                          dl_2: true,
                          dl_3: true,
                        })
                      }
                      className="text-[11px] font-bold text-blue-700 hover:underline cursor-pointer"
                    >
                      Expand All
                    </button>
                    <span>·</span>
                    <button
                      onClick={() => setExpandedNodes({})}
                      className="text-[11px] font-bold text-slate-600 hover:underline cursor-pointer"
                    >
                      Collapse
                    </button>
                  </div>
                </div>

                {/* Tree Canvas */}
                <div className="p-4 sm:p-6 bg-slate-900/5 rounded-3xl border border-slate-200 overflow-x-auto min-h-[380px] flex flex-col items-center">
                  {/* ROOT NODE: Current User */}
                  <div className="flex flex-col items-center relative">
                    <div className="bg-white border-2 border-[#0B1B3D] rounded-2xl p-3 shadow-lg flex items-center gap-3 w-72 hover:shadow-xl transition-shadow cursor-default z-10">
                      <div className="relative">
                        <img
                          src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=160&q=80"
                          alt={currentUser.name}
                          className="w-12 h-12 rounded-xl object-cover border-2 border-emerald-500"
                        />
                        <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center text-[9px] text-white font-bold">
                          ✓
                        </span>
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] uppercase tracking-wider font-extrabold text-blue-700 bg-blue-50 px-2 py-0.2 rounded">
                            YOU (SPONSOR)
                          </span>
                          <span className="text-[10px] font-bold text-amber-700">
                            {currentUser.tier}
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-slate-900 truncate mt-0.5">
                          {currentUser.name}
                        </h4>
                        <div className="text-[10px] text-slate-500 flex items-center justify-between mt-1">
                          <span>Team: {totalNetworkMembers} members</span>
                          <span className="text-emerald-700 font-bold tabular-nums">
                            +${totalCommissionEarned.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Vertical Stem from Root */}
                    <div className="w-0.5 h-8 bg-slate-300"></div>
                  </div>

                  {/* Horizontal Bar linking Level 1 Nodes */}
                  <div className="w-full max-w-3xl flex flex-col items-center">
                    <div className="w-[85%] h-0.5 bg-slate-300"></div>

                    {/* Level 1 Direct Referrals Grid */}
                    <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-0">
                      {downlineTree.map((l1) => {
                        const hasChildren = l1.children && l1.children.length > 0;
                        const isExpanded = !!expandedNodes[l1.id];

                        return (
                          <div key={l1.id} className="flex flex-col items-center">
                            {/* Vertical stem from horizontal connector */}
                            <div className="w-0.5 h-6 bg-slate-300"></div>

                            {/* Level 1 Node Card */}
                            <div
                              onClick={() => setSelectedNode(l1)}
                              className={`w-full bg-white rounded-2xl border-2 transition-all duration-200 p-3 shadow-xs hover:shadow-md cursor-pointer flex flex-col justify-between ${getTierColor(
                                l1.tier
                              )}`}
                            >
                              <div className="flex items-start gap-2.5">
                                <div className="relative shrink-0">
                                  <img
                                    src={l1.avatar}
                                    alt={l1.name}
                                    className="w-10 h-10 rounded-xl object-cover border border-slate-200 shadow-xs"
                                  />
                                  <span className="absolute -top-1 -left-1 px-1 rounded bg-[#0B1B3D] text-[8px] font-black text-white uppercase">
                                    L1
                                  </span>
                                </div>

                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center justify-between">
                                    <h5 className="text-xs font-bold text-slate-900 truncate">
                                      {l1.name}
                                    </h5>
                                    <span
                                      className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold ${
                                        l1.status === 'active'
                                          ? 'bg-emerald-100 text-emerald-800'
                                          : 'bg-amber-100 text-amber-800'
                                      }`}
                                    >
                                      {l1.status === 'active' ? 'Active' : 'Pending'}
                                    </span>
                                  </div>
                                  <span className="text-[10px] text-slate-500 font-mono block truncate">
                                    {l1.email}
                                  </span>
                                </div>
                              </div>

                              {/* Stats / Contribution */}
                              <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                                <div>
                                  <span className="text-slate-400 block text-[9px] uppercase">
                                    Your Bonus
                                  </span>
                                  <span className="font-extrabold text-emerald-700 tabular-nums">
                                    +${l1.bonusEarned.toFixed(2)}
                                  </span>
                                </div>

                                <div className="text-right">
                                  <span className="text-slate-400 block text-[9px] uppercase">
                                    Volume
                                  </span>
                                  <span className="font-bold text-slate-800 tabular-nums">
                                    ${l1.totalVolume.toFixed(2)}
                                  </span>
                                </div>

                                {/* Cheer Button */}
                                <button
                                  type="button"
                                  onClick={(e) => handleCheer(l1, e)}
                                  className="p-1 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-800 transition-colors"
                                  title="Cheer downline member"
                                >
                                  <Sparkles className="w-3.5 h-3.5" />
                                </button>
                              </div>

                              {/* Expand Sub-Team Toggle Button */}
                              {hasChildren && (
                                <button
                                  type="button"
                                  onClick={(e) => toggleExpand(l1.id, e)}
                                  className="mt-2 w-full py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-[10px] font-bold text-slate-700 flex items-center justify-center gap-1 transition-colors"
                                >
                                  {isExpanded ? (
                                    <>
                                      <ChevronDown className="w-3 h-3" />
                                      <span>Hide Sub-Team ({l1.children?.length})</span>
                                    </>
                                  ) : (
                                    <>
                                      <ChevronRight className="w-3 h-3" />
                                      <span>View Sub-Team ({l1.children?.length})</span>
                                    </>
                                  )}
                                </button>
                              )}
                            </div>

                            {/* LEVEL 2 CHILDREN SUB-TREE */}
                            {hasChildren && isExpanded && (
                              <div className="flex flex-col items-center w-full pt-2 animate-in fade-in duration-200">
                                <div className="w-0.5 h-4 bg-slate-300"></div>
                                <div className="w-full space-y-2 border-l-2 border-emerald-400 pl-3 ml-2">
                                  {l1.children?.map((l2) => (
                                    <div
                                      key={l2.id}
                                      onClick={() => setSelectedNode(l2)}
                                      className="bg-white rounded-xl border border-slate-200 p-2 shadow-xs hover:border-emerald-400 cursor-pointer flex items-center justify-between gap-2 text-xs"
                                    >
                                      <div className="flex items-center gap-2 min-w-0">
                                        <div className="relative shrink-0">
                                          <img
                                            src={l2.avatar}
                                            alt={l2.name}
                                            className="w-7 h-7 rounded-lg object-cover border border-slate-200"
                                          />
                                          <span className="absolute -bottom-1 -right-1 px-1 rounded bg-teal-600 text-[7px] font-black text-white uppercase">
                                            L2
                                          </span>
                                        </div>
                                        <div className="truncate min-w-0">
                                          <span className="font-bold text-slate-900 block truncate">
                                            {l2.name}
                                          </span>
                                          <span className="text-[9px] text-slate-400 truncate block">
                                            Via {l1.name}
                                          </span>
                                        </div>
                                      </div>

                                      <div className="text-right shrink-0">
                                        <span className="font-bold text-emerald-700 block text-[10px] tabular-nums">
                                          +${l2.bonusEarned.toFixed(2)}
                                        </span>
                                        <span className="text-[9px] text-amber-700 font-semibold tabular-nums">
                                          +{l2.pointsEarned} pts
                                        </span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Selected Node Details Drawer/Card */}
                {selectedNode && (
                  <div className="p-4 rounded-2xl bg-white border-2 border-blue-600 shadow-md flex flex-col sm:flex-row items-center justify-between gap-4 animate-in fade-in">
                    <div className="flex items-center gap-3.5">
                      <img
                        src={selectedNode.avatar}
                        alt={selectedNode.name}
                        className="w-12 h-12 rounded-2xl object-cover border border-slate-200"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-slate-900">
                            {selectedNode.name}
                          </h4>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-900">
                            Level {selectedNode.level} Affiliate
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-900">
                            {selectedNode.tier}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {selectedNode.email} · Joined {selectedNode.joinedDate} · {selectedNode.totalOrders} Completed Orders
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className="text-xs text-slate-400 block">Total You Earned</span>
                        <span className="text-sm font-black text-emerald-700 tabular-nums">
                          +${selectedNode.bonusEarned.toFixed(2)} & +{selectedNode.pointsEarned} pts
                        </span>
                      </div>

                      <button
                        onClick={() => setSelectedNode(null)}
                        className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-xs font-bold text-slate-600"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: NETWORK MATRIX LIST */}
            {activeTab === 'list' && (
              <div className="space-y-4">
                {/* Search & Filter Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-200 text-xs">
                  <div className="relative flex-1 max-w-sm">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      placeholder="Search downline by name or email..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 border border-slate-300 rounded-xl bg-white focus:outline-none focus:border-blue-600 text-xs"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <select
                      value={levelFilter}
                      onChange={(e) => setLevelFilter(e.target.value as any)}
                      className="px-3 py-1.5 border border-slate-300 rounded-xl bg-white text-slate-700 font-semibold focus:outline-none"
                    >
                      <option value="all">All Levels</option>
                      <option value="1">Level 1 (Direct)</option>
                      <option value="2">Level 2 (Indirect)</option>
                    </select>

                    <select
                      value={tierFilter}
                      onChange={(e) => setTierFilter(e.target.value)}
                      className="px-3 py-1.5 border border-slate-300 rounded-xl bg-white text-slate-700 font-semibold focus:outline-none"
                    >
                      <option value="all">All Tiers</option>
                      <option value="Platinum">Platinum</option>
                      <option value="Gold">Gold</option>
                      <option value="Silver">Silver</option>
                      <option value="Bronze">Bronze</option>
                    </select>
                  </div>
                </div>

                {/* Matrix Table */}
                <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white text-xs shadow-xs">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                      <tr>
                        <th className="p-3.5">Affiliate Member</th>
                        <th className="p-3.5">Level & Tier</th>
                        <th className="p-3.5">Joined</th>
                        <th className="p-3.5">Orders</th>
                        <th className="p-3.5">Purchases Volume</th>
                        <th className="p-3.5">Your Commission</th>
                        <th className="p-3.5 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredMembers.map((m) => (
                        <tr key={m.id} className="hover:bg-slate-50/70">
                          <td className="p-3.5">
                            <div className="flex items-center gap-2.5">
                              <img
                                src={m.avatar}
                                alt={m.name}
                                className="w-8 h-8 rounded-xl object-cover border border-slate-200"
                              />
                              <div>
                                <span className="font-bold text-slate-900 block">{m.name}</span>
                                <span className="text-[10px] text-slate-400">{m.email}</span>
                              </div>
                            </div>
                          </td>
                          <td className="p-3.5">
                            <div className="flex items-center gap-1.5">
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                  m.level === 1
                                    ? 'bg-blue-100 text-blue-900'
                                    : 'bg-teal-100 text-teal-900'
                                }`}
                              >
                                Level {m.level}
                              </span>
                              <span className="text-[10px] font-bold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded">
                                {m.tier}
                              </span>
                            </div>
                          </td>
                          <td className="p-3.5 text-slate-500">{m.joinedDate}</td>
                          <td className="p-3.5 font-bold text-slate-900">{m.totalOrders}</td>
                          <td className="p-3.5 font-bold text-slate-900 tabular-nums">
                            ${m.totalVolume.toFixed(2)}
                          </td>
                          <td className="p-3.5">
                            <span className="text-emerald-700 font-bold block tabular-nums">
                              +${m.bonusEarned.toFixed(2)}
                            </span>
                            <span className="text-[10px] text-amber-700 font-bold tabular-nums">
                              +{m.pointsEarned} pts
                            </span>
                          </td>
                          <td className="p-3.5 text-right">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                m.status === 'active'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {m.status === 'active' ? 'Active' : 'Pending 1st Order'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB 3: COMPENSATION PLAN & RULES */}
            {activeTab === 'analytics' && (
              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-5 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200">
                    <div className="flex items-center gap-2 text-blue-900 font-bold text-sm mb-2">
                      <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center text-xs font-black">
                        L1
                      </div>
                      <span>Level 1: Direct Referrals</span>
                    </div>
                    <p className="text-slate-600 leading-relaxed">
                      Every friend who registers using your direct referral link becomes part of your Level 1 downline.
                    </p>
                    <div className="mt-3 pt-3 border-t border-blue-200/80 space-y-1.5 font-bold text-slate-800">
                      <div className="flex justify-between">
                        <span>Cash Bonus per Qualifying Order:</span>
                        <span className="text-emerald-700 font-black">$15.00 USD</span>
                      </div>
                      <div className="flex justify-between">
                        <span>SNL Points Bonus:</span>
                        <span className="text-amber-700 font-black">+500 Points</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-5 rounded-2xl bg-gradient-to-br from-teal-50 to-emerald-50 border border-teal-200">
                    <div className="flex items-center gap-2 text-teal-900 font-bold text-sm mb-2">
                      <div className="w-7 h-7 rounded-lg bg-teal-600 text-white flex items-center justify-center text-xs font-black">
                        L2
                      </div>
                      <span>Level 2: Sub-Affiliates</span>
                    </div>
                    <p className="text-slate-600 leading-relaxed">
                      When your direct friends invite their own contacts, those members are placed in your Level 2 downline.
                    </p>
                    <div className="mt-3 pt-3 border-t border-teal-200/80 space-y-1.5 font-bold text-slate-800">
                      <div className="flex justify-between">
                        <span>Indirect Cash Reward:</span>
                        <span className="text-emerald-700 font-black">$5.00 USD</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Indirect Points Reward:</span>
                        <span className="text-amber-700 font-black">+150 Points</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Leaderboard Callout */}
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
                  <div className="flex items-center gap-1.5 font-bold text-slate-900 mb-2">
                    <Trophy className="w-4 h-4 text-amber-500" />
                    <span>Top SNL RICH Affiliates This Month</span>
                  </div>
                  <div className="space-y-2 text-slate-600">
                    <div className="flex justify-between items-center bg-white p-2 rounded-lg border border-slate-100">
                      <span className="font-medium text-slate-800">1. Alexander R.</span>
                      <span className="font-bold text-emerald-700 tabular-nums">142 referrals · $2,130 earned</span>
                    </div>
                    <div className="flex justify-between items-center bg-white p-2 rounded-lg border border-slate-100">
                      <span className="font-medium text-slate-800">2. Priya Sharma</span>
                      <span className="font-bold text-emerald-700 tabular-nums">98 referrals · $1,470 earned</span>
                    </div>
                    <div className="flex justify-between items-center bg-white p-2 rounded-lg border border-slate-100">
                      <span className="font-medium text-slate-800">3. Daniel Vance</span>
                      <span className="font-bold text-emerald-700 tabular-nums">74 referrals · $1,110 earned</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
