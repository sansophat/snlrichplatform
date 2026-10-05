export interface Merchant {
  id: string;
  name: string;
  slug: string;
  logo: string;
  coverImage: string;
  category: string;
  rating: number;
  reviewCount: number;
  verified: boolean;
  cashbackRate: number; // e.g., 10 for 10%
  pointsMultiplier: number; // e.g., 1.5x
  location: string;
  description: string;
  totalSales: number;
  joinedDate: string;
  status: 'active' | 'suspended';
  ownerEmail?: string;
}

export interface RegisteredUser {
  id: string;
  name: string;
  email: string;
  role: 'customer' | 'merchant' | 'admin';
  joinedDate: string;
  pointsBalance: number;
  cashbackBalance: number;
  referralCode: string;
  referredBy?: string;
  status: 'active' | 'suspended';
  tier: 'Bronze' | 'Silver' | 'Gold' | 'Platinum';
  merchantId?: string; // if role === 'merchant'
}

export interface WithdrawalRequest {
  id: string;
  userId: string;
  userName: string;
  amount: number;
  date: string;
  paymentMethod: string;
  accountDetails: string;
  status: 'pending' | 'approved' | 'rejected';
}

export interface PlatformConfig {
  brandName: string;
  brandTagline: string;
  supportPhone: string;
  supportEmail: string;
  announcementText: string;
  heroHeadline: string;
  heroSubhead: string;
  platformCommissionRate: number; // e.g. 8 for 8%
  referralCashReward: number; // e.g. $15
  referralPointsReward: number; // e.g. 500
  welcomeBonusPoints: number; // e.g. 200
  pointsToDollarRate: number; // e.g. 100 points = $1
  minimumWithdrawalAmount: number; // e.g. 10
  allowCustomerRegistrations: boolean;
  maintenanceMode: boolean;
  enableWalletPayment: boolean;
  enableCodPayment: boolean;
  autoApproveProducts: boolean;
}

export interface Product {
  id: string;
  title: string;
  category: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviewsCount: number;
  merchantId: string;
  merchantName: string;
  merchantSlug?: string;
  image: string;
  gallery?: string[];
  description: string;
  pointsEarned: number;
  cashbackAmount: number;
  badge?: string;
  stock: number;
  inStock: boolean;
  tags: string[];
  specs?: Record<string, string>;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedColor?: string;
  selectedSize?: string;
}

export interface UserWallet {
  userId: string;
  userName: string;
  userEmail: string;
  userRole: 'customer' | 'merchant' | 'admin';
  pointsBalance: number; // e.g. 2450 pts
  pointsValueRate: number; // 100 pts = $1.00
  tier: 'Bronze' | 'Silver' | 'Gold' | 'Platinum';
  tierMultiplier: number;
  cashbackBalance: number; // available $38.50
  pendingCashback: number; // $14.20
  lifetimeCashback: number; // $342.00
  referralCode: string;
  referralCount: number;
  referralEarnings: number;
  claimedDailyRewardToday: boolean;
}

export interface CashbackTransaction {
  id: string;
  date: string;
  merchantName: string;
  orderId: string;
  purchaseAmount: number;
  cashbackAmount: number;
  pointsAwarded: number;
  status: 'available' | 'pending' | 'redeemed';
}

export interface ReferralFriend {
  id: string;
  name: string;
  date: string;
  status: 'completed' | 'pending_first_order';
  bonusEarned: number;
  pointsEarned: number;
}

export interface DownlineNode {
  id: string;
  name: string;
  email: string;
  avatar: string;
  level: 1 | 2;
  tier: 'Bronze' | 'Silver' | 'Gold' | 'Platinum';
  status: 'active' | 'pending_first_order';
  joinedDate: string;
  totalOrders: number;
  totalVolume: number; // $ purchases made
  bonusEarned: number; // $ referral reward earned by sponsor
  pointsEarned: number; // pts earned by sponsor
  parentId?: string;
  children?: DownlineNode[];
}

export interface Order {
  id: string;
  date: string;
  items: CartItem[];
  subtotal: number;
  pointsDiscount: number;
  pointsRedeemed: number;
  shippingFee: number;
  total: number;
  cashbackEarned: number;
  pointsEarned: number;
  status: 'Processing' | 'Shipped' | 'Delivered';
  shippingAddress: {
    fullName: string;
    phone: string;
    street: string;
    city: string;
    country: string;
    postalCode: string;
  };
  paymentMethod: string;
}
