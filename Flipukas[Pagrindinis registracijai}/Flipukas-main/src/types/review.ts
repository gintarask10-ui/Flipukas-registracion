export interface CustomizedVariantSummary {
  garmentType?: string;
  garmentName?: string;
  fabricName?: string;
  size?: string;
  primaryColorHex?: string;
  primaryColorName?: string;
}

export interface ProductReview {
  id: string;
  productId: string;
  productName: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number; // 1 to 5
  title?: string;
  comment: string;
  customizedDetails?: CustomizedVariantSummary;
  helpfulCount: number;
  verifiedBuyer: boolean;
  createdAt: number;
}

export interface NewReviewInput {
  productId: string;
  productName: string;
  rating: number;
  title?: string;
  comment: string;
  customizedDetails?: CustomizedVariantSummary;
}
