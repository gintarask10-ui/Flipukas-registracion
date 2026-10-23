export type GarmentType = 'hoodie' | 'jacket' | 'trench' | 'cargo' | 'tshirt' | 'sneakers';

export interface FabricMaterial {
  id: string;
  name: string;
  nameLt: string;
  description: string;
  roughness: number;
  metalness: number;
  bumpScale: number;
  textureType: 'cotton' | 'ripstop' | 'neoprene' | 'chrome' | 'leather' | 'silk' | 'denim' | 'wool';
  priceDelta: number;
  badge: string;
  gsm?: number;
  composition?: string;
  stretch?: string;
  breathability?: number; // 1 to 5
  warmth?: number; // 1 to 5
  drape?: string;
  luster?: string;
  waterResistance?: string;
}

export interface ColorOption {
  name: string;
  nameLt: string;
  hex: string;
  category: 'core' | 'electric' | 'earth';
}

export type PatternType =
  | 'none'
  | 'houndstooth'
  | 'cybergrid'
  | 'pinstripe'
  | 'dots'
  | 'camo'
  | 'tartan'
  | 'waves'
  | 'customDraw';

export interface CustomPatternConfig {
  type: PatternType;
  scale: number;
  primaryColor: string;
  secondaryColor: string;
  opacity: number;
  rotation: number;
  visible?: boolean;
  locked?: boolean;
}

export type MacroZone =
  | 'full'
  | 'fabric-weave'
  | 'chest-design'
  | 'hood-drawstrings'
  | 'pocket-seams'
  | 'cuff-elastic';

export type DesignPlacement = 'chest' | 'back' | 'pocket';

export interface CanvasDesignElement {
  id: string;
  name?: string;
  visible?: boolean;
  locked?: boolean;
  type: 'shape' | 'text' | 'badge' | 'stitch' | 'image' | 'drawPath';
  shapeType?: 'rect' | 'circle' | 'triangle' | 'star' | 'heart' | 'lightning' | 'hexagon' | 'diamond' | 'shield' | 'star8' | 'octagon' | 'cross';
  badgeType?: 'vytis' | 'cyber-skull' | 'wave' | 'sun' | 'smile' | 'flame' | 'barcode' | 'qr' | 'crown' | 'cross' | 'badge-frame' | 'butterfly' | 'compass';
  text?: string;
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: string;
  isCurved?: boolean;
  curveRadius?: number;
  letterSpacing?: number;
  textEffect?: 'solid' | 'stitch' | 'glow' | 'outline';
  shadow?: boolean;
  opacity?: number;
  flipX?: boolean;
  flipY?: boolean;
  imageSrc?: string;
  imageEl?: HTMLImageElement;
  points?: { x: number; y: number }[]; // for freehand drawing paths
  toolType?: 'brush' | 'stitch' | 'spray' | 'highlighter';
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  fill: string;
  stroke: string;
  strokeWidth: number;
  stitchMode?: boolean;
}

export type LayerType = 'pattern' | 'text' | 'badge' | 'shape' | 'stitch' | 'image' | 'base';

export interface GarmentLayer {
  id: string;
  name: string;
  type: LayerType;
  visible: boolean;
  locked: boolean;
  opacity: number;
  element?: CanvasDesignElement;
  patternConfig?: CustomPatternConfig;
  icon?: string;
  createdAt?: number;
}

export interface BodyMeasurements {
  unit: 'cm' | 'in';
  height: number;
  chest: number;
  waist: number;
  hips: number;
  sleeve: number;
  shoulder?: number;
  isCustomApplied: boolean;
}

export interface SeamstressInstructions {
  privateNote?: string;
  sleeveAdjustmentCm?: number;
  torsoLengthAdjustmentCm?: number;
  liningPreference?: 'standard' | 'silk-touch' | 'breathable-mesh' | 'unlined';
  threadColor?: string;
  specialHem?: boolean;
  reinforcedPockets?: boolean;
  updatedAt?: number;
}

export interface CustomizationState {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  hardwareColor: string;
  fabricId: string;
  badgeType: 'flipukas' | 'aeroshift' | 'cybergrid' | 'custom' | 'minimal';
  customText: string;
  pattern: CustomPatternConfig;
  macroZone: MacroZone;
  placement: DesignPlacement;
  studioTheme: 'auto' | 'bright' | 'dark';
  studioBrightness: number;
  size: 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL';
  fitMode: 'regular' | 'oversized' | 'tailored' | 'slim';
  wireframe: boolean;
  exploded: boolean;
  lightingPreset: 'studio' | 'neon-night' | 'golden-hour' | 'cyber' | 'daylight';
  cameraPreset: 'front' | 'side' | 'back' | 'detail' | 'iso';
  autoRotate: boolean;
  layers?: GarmentLayer[];
  customMeasurements?: BodyMeasurements;
  seamstressNotes?: string;
  seamstressInstructions?: SeamstressInstructions;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  categoryLt: string;
  type: GarmentType;
  basePrice: number;
  tagline: string;
  description: string;
  features: string[];
  specs: { label: string; value: string }[];
  image: string;
  fallbackGradient: string;
  defaultColors: {
    primary: string;
    secondary: string;
    accent: string;
  };
}

export interface CartItem {
  cartItemId: string;
  product: Product;
  customization: CustomizationState;
  quantity: number;
  unitPrice: number;
}

export interface WishlistItem {
  id: string;
  title: string;
  product: Product;
  customization: CustomizationState;
  fabric: FabricMaterial;
  price: number;
  snapshotUrl?: string;
  createdAt: number;
  note?: string;
}
