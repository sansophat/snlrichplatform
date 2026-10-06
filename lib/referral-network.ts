import { prisma } from "@/lib/db";
import { REWARDS } from "@/lib/config";

export type NetworkMemberNode = {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  role: string;
  kycStatus: string;
  points: number;
  ordersCount: number;
  merchantName: string | null;
  merchantEmoji: string | null;
  referralCode: string;
  referralRewarded: boolean;
  createdAt: string; // ISO string for client serialization
  tier: number; // 0 = root, 1 = Tier 1 direct, 2 = Tier 2, etc.
  parentId: string | null;
  sponsorName: string | null;
  directCount: number;
  totalTeamCount: number;
  children: NetworkMemberNode[];
};

export type FlatNetworkMember = {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  role: string;
  kycStatus: string;
  points: number;
  ordersCount: number;
  merchantName: string | null;
  merchantEmoji: string | null;
  referralCode: string;
  referralRewarded: boolean;
  createdAt: string;
  tier: number;
  parentId: string | null;
  sponsorName: string | null;
  directCount: number;
  totalTeamCount: number;
};

export type ReferralNetworkData = {
  root: NetworkMemberNode;
  totalNetworkSize: number;
  tier1Count: number;
  tier2Count: number;
  tier3PlusCount: number;
  convertedCount: number;
  pointsEarned: number;
  maxDepth: number;
  flatList: FlatNetworkMember[];
};

/**
 * Fetches the downline referral network tree for a given user up to maxDepth levels.
 */
export async function getReferralNetwork(
  userId: string,
  maxDepth: number = 6
): Promise<ReferralNetworkData | null> {
  const root = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      avatarUrl: true,
      role: true,
      kycStatus: true,
      points: true,
      referralCode: true,
      referralRewarded: true,
      createdAt: true,
      _count: {
        select: { orders: true },
      },
      merchant: {
        select: { name: true, emoji: true },
      },
    },
  });

  if (!root) return null;

  // Breadth-first gathering of downline members by tier
  let currentParentIds = [userId];
  const allGathered: Array<{
    id: string;
    name: string;
    email: string;
    avatarUrl: string | null;
    role: string;
    kycStatus: string;
    points: number;
    ordersCount: number;
    merchantName: string | null;
    merchantEmoji: string | null;
    referralCode: string;
    referralRewarded: boolean;
    createdAt: Date;
    referredById: string | null;
    tier: number;
  }> = [];

  for (let depth = 1; depth <= maxDepth; depth++) {
    if (currentParentIds.length === 0) break;

    const tierMembers = await prisma.user.findMany({
      where: { referredById: { in: currentParentIds } },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        avatarUrl: true,
        role: true,
        kycStatus: true,
        points: true,
        referralCode: true,
        referralRewarded: true,
        createdAt: true,
        referredById: true,
        _count: {
          select: { orders: true },
        },
        merchant: {
          select: { name: true, emoji: true },
        },
      },
    });

    if (tierMembers.length === 0) break;

    for (const m of tierMembers) {
      allGathered.push({
        id: m.id,
        name: m.name,
        email: m.email,
        avatarUrl: m.avatarUrl,
        role: m.role,
        kycStatus: m.kycStatus,
        points: m.points,
        ordersCount: m._count.orders,
        merchantName: m.merchant?.name ?? null,
        merchantEmoji: m.merchant?.emoji ?? null,
        referralCode: m.referralCode,
        referralRewarded: m.referralRewarded,
        createdAt: m.createdAt,
        referredById: m.referredById,
        tier: depth,
      });
    }

    currentParentIds = tierMembers.map((m) => m.id);
  }

  // Create dictionary of all members for fast lookup
  const nodeMap = new Map<string, NetworkMemberNode>();

  const rootNode: NetworkMemberNode = {
    id: root.id,
    name: root.name,
    email: root.email,
    avatarUrl: root.avatarUrl,
    role: root.role,
    kycStatus: root.kycStatus,
    points: root.points,
    ordersCount: root._count.orders,
    merchantName: root.merchant?.name ?? null,
    merchantEmoji: root.merchant?.emoji ?? null,
    referralCode: root.referralCode,
    referralRewarded: root.referralRewarded,
    createdAt: root.createdAt.toISOString(),
    tier: 0,
    parentId: null,
    sponsorName: null,
    directCount: 0,
    totalTeamCount: 0,
    children: [],
  };
  nodeMap.set(root.id, rootNode);

  // Prepopulate member map
  for (const m of allGathered) {
    nodeMap.set(m.id, {
      id: m.id,
      name: m.name,
      email: m.email,
      avatarUrl: m.avatarUrl,
      role: m.role,
      kycStatus: m.kycStatus,
      points: m.points,
      ordersCount: m.ordersCount,
      merchantName: m.merchantName,
      merchantEmoji: m.merchantEmoji,
      referralCode: m.referralCode,
      referralRewarded: m.referralRewarded,
      createdAt: m.createdAt.toISOString(),
      tier: m.tier,
      parentId: m.referredById,
      sponsorName: null,
      directCount: 0,
      totalTeamCount: 0,
      children: [],
    });
  }

  // Link children to parents and assign sponsorName
  for (const m of allGathered) {
    if (m.referredById && nodeMap.has(m.referredById)) {
      const parent = nodeMap.get(m.referredById)!;
      const child = nodeMap.get(m.id)!;
      child.sponsorName = parent.name;
      parent.children.push(child);
      parent.directCount++;
    }
  }

  // Calculate total downline count recursively
  function calculateSubtreeSize(node: NetworkMemberNode): number {
    let sum = 0;
    for (const child of node.children) {
      sum += 1 + calculateSubtreeSize(child);
    }
    node.totalTeamCount = sum;
    return sum;
  }

  calculateSubtreeSize(rootNode);

  // Create flat list for table filtering
  const flatList: FlatNetworkMember[] = allGathered.map((m) => {
    const node = nodeMap.get(m.id)!;
    return {
      id: node.id,
      name: node.name,
      email: node.email,
      avatarUrl: node.avatarUrl,
      role: node.role,
      kycStatus: node.kycStatus,
      points: node.points,
      ordersCount: node.ordersCount,
      merchantName: node.merchantName,
      merchantEmoji: node.merchantEmoji,
      referralCode: node.referralCode,
      referralRewarded: node.referralRewarded,
      createdAt: node.createdAt,
      tier: node.tier,
      parentId: node.parentId,
      sponsorName: node.sponsorName,
      directCount: node.directCount,
      totalTeamCount: node.totalTeamCount,
    };
  });

  const tier1Count = allGathered.filter((m) => m.tier === 1).length;
  const tier2Count = allGathered.filter((m) => m.tier === 2).length;
  const tier3PlusCount = allGathered.filter((m) => m.tier >= 3).length;
  const convertedCount = allGathered.filter((m) => m.referralRewarded).length;
  const pointsEarned = convertedCount * REWARDS.REFERRER_BONUS;
  const maxDepthReached = allGathered.reduce((max, m) => Math.max(max, m.tier), 0);

  return {
    root: rootNode,
    totalNetworkSize: allGathered.length,
    tier1Count,
    tier2Count,
    tier3PlusCount,
    convertedCount,
    pointsEarned,
    maxDepth: maxDepthReached,
    flatList,
  };
}
