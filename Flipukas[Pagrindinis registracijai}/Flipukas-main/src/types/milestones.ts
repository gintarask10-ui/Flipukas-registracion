export type MilestoneTier = 'bronze' | 'silver' | 'gold' | 'diamond';

export interface StyleMilestone {
  id: string;
  titleLt: string;
  subtitleLt: string;
  requiredDesignsCount: number;
  rewardPromoCode: string;
  rewardDiscountPercent: number;
  rewardPoints: number;
  tier: MilestoneTier;
  badgeNameLt: string;
  badgeDescriptionLt: string;
}

export interface StyleChallenge {
  id: string;
  titleLt: string;
  category: 'palette' | 'fabric' | 'signature' | 'tour' | 'sustainability';
  descriptionLt: string;
  hintLt: string;
  rewardPromoCode?: string;
  rewardDiscountPercent?: number;
  rewardPoints: number;
  badgeNameLt: string;
  iconType: 'sparkles' | 'feather' | 'eye' | 'palette' | 'leaf';
}

export interface UserMilestonesData {
  savedDesignsCount: number;
  completedChallengeIds: string[];
  claimedPromoCodes: string[];
  unlockedAt: Record<string, number>;
}
