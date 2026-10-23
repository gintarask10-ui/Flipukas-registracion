import { WishlistItem, Product, CustomizationState, FabricMaterial } from '../types/clothing';
import { PRODUCTS, FABRICS } from '../data/products';

const WISHLIST_STORAGE_KEY = 'flipukas_wishlist_v1';

// Initial starter sample items if wishlist is completely empty
const DEFAULT_SAMPLE_WISHLIST: WishlistItem[] = [
  {
    id: 'sample-cyberpunk-hoodie',
    title: 'Cyberpunk 2099 Aero-Shift',
    product: PRODUCTS[0],
    customization: {
      primaryColor: '#161618',
      secondaryColor: '#374151',
      accentColor: '#06b6d4',
      hardwareColor: '#cbd5e1',
      fabricId: 'gore-aero',
      badgeType: 'cybergrid',
      customText: 'CYBER-2099',
      pattern: {
        type: 'cybergrid',
        scale: 4,
        primaryColor: '#161618',
        secondaryColor: '#06b6d4',
        opacity: 0.85,
        rotation: 0,
        visible: true,
        locked: false,
      },
      macroZone: 'full',
      placement: 'chest',
      studioTheme: 'dark',
      studioBrightness: 1.4,
      size: 'XL',
      fitMode: 'oversized',
      wireframe: false,
      exploded: false,
      lightingPreset: 'neon-night',
      cameraPreset: 'front',
      autoRotate: false,
    },
    fabric: FABRICS.find((f) => f.id === 'gore-aero') || FABRICS[1],
    price: PRODUCTS[0].basePrice + 6,
    createdAt: Date.now() - 86400000,
    note: 'Su neperpučiamu softshell audiniu ir neoniniu apšvietimu',
  },
  {
    id: 'sample-silk-trench',
    title: 'Prabangus Šilko Trenchcoat',
    product: PRODUCTS.find((p) => p.type === 'trench') || PRODUCTS[1],
    customization: {
      primaryColor: '#715842',
      secondaryColor: '#e2dfd8',
      accentColor: '#d97706',
      hardwareColor: '#b48a3c',
      fabricId: 'mulberry-silk',
      badgeType: 'minimal',
      customText: 'ATELIER',
      pattern: {
        type: 'pinstripe',
        scale: 2,
        primaryColor: '#715842',
        secondaryColor: '#e2dfd8',
        opacity: 0.6,
        rotation: 45,
        visible: true,
        locked: false,
      },
      macroZone: 'full',
      placement: 'chest',
      studioTheme: 'bright',
      studioBrightness: 1.25,
      size: 'M',
      fitMode: 'tailored',
      wireframe: false,
      exploded: false,
      lightingPreset: 'golden-hour',
      cameraPreset: 'front',
      autoRotate: false,
    },
    fabric: FABRICS.find((f) => f.id === 'mulberry-silk') || FABRICS[0],
    price: (PRODUCTS.find((p) => p.type === 'trench') || PRODUCTS[1]).basePrice + 16,
    createdAt: Date.now() - 3600000,
    note: 'Elegantiškas Mulberry šilkas su auksine furnitūra',
  },
];

export function getStoredWishlist(): WishlistItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(WISHLIST_STORAGE_KEY);
    if (!raw) {
      // Seed with initial curated designs
      localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(DEFAULT_SAMPLE_WISHLIST));
      return DEFAULT_SAMPLE_WISHLIST;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error('Error reading wishlist from localStorage:', e);
    return [];
  }
}

export function saveWishlistToStorage(items: WishlistItem[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(items));
  } catch (e) {
    console.error('Error saving wishlist to localStorage:', e);
  }
}

export function addWishlistItem(
  product: Product,
  customization: CustomizationState,
  fabric: FabricMaterial,
  price: number,
  snapshotUrl?: string,
  title?: string,
  note?: string
): WishlistItem[] {
  const current = getStoredWishlist();
  const newItem: WishlistItem = {
    id: `wish-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    title: title || `${product.name} (${customization.size} / ${fabric.nameLt})`,
    product,
    customization: JSON.parse(JSON.stringify(customization)),
    fabric,
    price,
    snapshotUrl,
    createdAt: Date.now(),
    note,
  };

  const updated = [newItem, ...current];
  saveWishlistToStorage(updated);
  return updated;
}

export function removeWishlistItem(id: string): WishlistItem[] {
  const current = getStoredWishlist();
  const updated = current.filter((item) => item.id !== id);
  saveWishlistToStorage(updated);
  return updated;
}

export function isItemInWishlist(
  productId: string,
  customization: CustomizationState,
  fabricId: string,
  items: WishlistItem[]
): boolean {
  return items.some(
    (item) =>
      item.product.id === productId &&
      item.customization.fabricId === fabricId &&
      item.customization.primaryColor === customization.primaryColor &&
      item.customization.size === customization.size &&
      item.customization.fitMode === customization.fitMode
  );
}
