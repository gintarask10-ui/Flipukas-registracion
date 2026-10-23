export type OrderStatus =
  | 'confirmed'
  | 'cutting_sewing'
  | 'quality_check'
  | 'courier_pickup'
  | 'in_transit'
  | 'out_for_delivery'
  | 'delivered';

export interface OrderTimelineStep {
  status: OrderStatus;
  title: string;
  description: string;
  location: string;
  timestamp: number;
  completed: boolean;
  current: boolean;
}

export interface OrderItemSummary {
  id: string;
  title: string;
  productName: string;
  size: string;
  fabricName: string;
  primaryColor?: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: string;
  trackingNumber: string;
  carrier: 'Omniva Lietuva' | 'DPD Kurjeris' | 'LP Express';
  carrierTrackingUrl?: string;
  status: OrderStatus;
  createdAt: number;
  estimatedDelivery: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  address: string;
  city: string;
  postalCode: string;
  total: number;
  items: OrderItemSummary[];
  updatedAt: number;
}
