export const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME || "SNLRICH";
export const SITE_TAGLINE = "SHOP · EARN · REPEAT";
export const CURRENCY = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || "$";

/** Rewards programme rules. Tune these to fit your business. */
export const REWARDS = {
  /** 1 point is worth this many cents when redeemed (100 pts = 1.00). */
  POINT_VALUE_CENTS: 1,
  /** Points everyone gets when they register. */
  SIGNUP_BONUS: 100,
  /** Points a new user gets when registering with a referral code (instead of SIGNUP_BONUS). */
  REFERRED_SIGNUP_BONUS: 300,
  /** Points the referrer gets when the friend's first order is delivered. */
  REFERRER_BONUS: 500,
  /** Merchant-configurable limits. */
  MAX_POINTS_RATE: 10,
  MAX_CASHBACK_PCT: 20,
};

export const SHIPPING = {
  FLAT_CENTS: 500,
  FREE_OVER_CENTS: 5000,
};

export const ORDER_STATUSES = ["PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

/** Allowed next statuses for each current status. */
export const NEXT_STATUS: Record<string, OrderStatus[]> = {
  PENDING: ["PROCESSING", "CANCELLED"],
  PROCESSING: ["SHIPPED", "CANCELLED"],
  SHIPPED: ["DELIVERED"],
  DELIVERED: [],
  CANCELLED: [],
};
