import { Order, OrderStatus } from '../types/order';

const ORDERS_STORAGE_KEY = 'flipukas_customer_orders_v1';

export const ORDER_STATUS_ORDER: OrderStatus[] = [
  'confirmed',
  'cutting_sewing',
  'quality_check',
  'courier_pickup',
  'in_transit',
  'out_for_delivery',
  'delivered',
];

export const STATUS_META: Record<
  OrderStatus,
  { titleLt: string; descLt: string; locationLt: string; percent: number }
> = {
  confirmed: {
    titleLt: 'Užsakymas patvirtintas',
    descLt: 'Mokėjimas priimtas, 3D modelio duomenys perduoti gamybos komandai.',
    locationLt: 'Vilniaus Flipukas Atelier, Savanorių pr. 178',
    percent: 15,
  },
  cutting_sewing: {
    titleLt: 'Lazerinis pjovimas & Siuvimas',
    descLt: 'Tikslus audinio kirpimas pagal individualius išmatavimus ir rankinis siuvimas.',
    locationLt: 'Vilniaus Atelier • 3D Gamybos cechas',
    percent: 32,
  },
  quality_check: {
    titleLt: 'Kokybės kontrolė & Pakavimas',
    descLt: 'Siūlių tvirtumo testas, ekologiškas apsauginis pakavimas į firminę dėžutę.',
    locationLt: 'Kokybės laboratorija, Vilnius',
    percent: 50,
  },
  courier_pickup: {
    titleLt: 'Perduota siuntų tarnybai',
    descLt: 'Siunta atiduota kurjeriui ir užregistruota logistikos sistemoje.',
    locationLt: 'Vilniaus siuntų rūšiavimo terminalas',
    percent: 68,
  },
  in_transit: {
    titleLt: 'Gabenama į paskirties miestą',
    descLt: 'Siunta pakeliui tarp pagrindinio logistikos centro ir vietinio terminalo.',
    locationLt: 'Kauno magistralinis logistikos mazgas',
    percent: 82,
  },
  out_for_delivery: {
    titleLt: 'Gabenama gavėjui / Į paštomatą',
    descLt: 'Kurjeris vyksta nurodytu adresu arba siunta pildoma į pasirinktą paštomatą.',
    locationLt: 'Vietinis kurjerio mikroautobusas / Paskirties taškas',
    percent: 94,
  },
  delivered: {
    titleLt: 'Sėkmingai pristatyta!',
    descLt: 'Siunta sėkmingai atsiimta. Tikimės, kad naujas 3D kūrinys džiugins!',
    locationLt: 'Pristatymo adresas',
    percent: 100,
  },
};

const SAMPLE_INITIAL_ORDER: Order = {
  id: 'FLP-849201',
  trackingNumber: 'OMN-LT-9482910',
  carrier: 'Omniva Lietuva',
  carrierTrackingUrl: 'https://www.omniva.lt',
  status: 'cutting_sewing',
  createdAt: Date.now() - 3600000 * 5,
  updatedAt: Date.now() - 3600000 * 2,
  estimatedDelivery: 'Rytoj iki 16:30',
  customerName: 'Gintaras K.',
  customerEmail: 'gintaras@flipukas.lt',
  customerPhone: '+370 600 12345',
  address: 'Gedimino pr. 24-12',
  city: 'Vilnius',
  postalCode: 'LT-01103',
  total: 134.5,
  items: [
    {
      id: 'item-1',
      title: 'Cyberpunk Aero-Shift Džemperis',
      productName: 'Aero-Shift Hoodie',
      size: 'L',
      fabricName: 'GORE-TEX Aero',
      primaryColor: '#161618',
      price: 130.0,
      quantity: 1,
    },
  ],
};

export function getStoredOrders(): Order[] {
  if (typeof window === 'undefined') return [SAMPLE_INITIAL_ORDER];
  try {
    const raw = localStorage.getItem(ORDERS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify([SAMPLE_INITIAL_ORDER]));
      return [SAMPLE_INITIAL_ORDER];
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : [SAMPLE_INITIAL_ORDER];
  } catch {
    return [SAMPLE_INITIAL_ORDER];
  }
}

export function saveOrder(order: Order): void {
  try {
    const current = getStoredOrders();
    const updated = [order, ...current.filter((o) => o.id !== order.id)];
    localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to save order to localStorage:', err);
  }
}

export function updateOrderStatus(orderId: string, nextStatus: OrderStatus): Order | null {
  try {
    const orders = getStoredOrders();
    const orderIndex = orders.findIndex((o) => o.id === orderId);
    if (orderIndex === -1) return null;

    const updatedOrder: Order = {
      ...orders[orderIndex],
      status: nextStatus,
      updatedAt: Date.now(),
    };

    orders[orderIndex] = updatedOrder;
    localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
    return updatedOrder;
  } catch {
    return null;
  }
}

export function getNextStatus(current: OrderStatus): OrderStatus {
  const currentIndex = ORDER_STATUS_ORDER.indexOf(current);
  if (currentIndex === -1 || currentIndex >= ORDER_STATUS_ORDER.length - 1) {
    return 'delivered';
  }
  return ORDER_STATUS_ORDER[currentIndex + 1];
}

export function getPrevStatus(current: OrderStatus): OrderStatus {
  const currentIndex = ORDER_STATUS_ORDER.indexOf(current);
  if (currentIndex <= 0) {
    return 'confirmed';
  }
  return ORDER_STATUS_ORDER[currentIndex - 1];
}
