export type LoyaltyTier = 'bronze' | 'silver' | 'gold' | 'diamond';

export interface TierConfig {
  id: LoyaltyTier;
  titleLt: string;
  minPoints: number;
  minSpendEur: number;
  discountPercent: number;
  promoCode: string;
  perksLt: string[];
  badgeColor: string;
  borderColor: string;
  textColor: string;
  bgGlow: string;
}

export interface LoyaltyTransaction {
  id: string;
  userId?: string;
  points: number;
  amountEur?: number;
  type: 'purchase' | 'review' | 'signup' | 'bonus';
  description: string;
  timestamp: number;
  referenceId?: string;
}

export interface UserLoyaltyState {
  points: number;
  totalSpentEur: number;
  currentTier: TierConfig;
  nextTier: TierConfig | null;
  pointsToNextTier: number;
  spendingToNextTierEur: number;
  progressPercent: number; // 0 to 100 based on points/spending
  spendingProgressPercent: number; // 0 to 100 based on spend EUR
  transactions: LoyaltyTransaction[];
}
