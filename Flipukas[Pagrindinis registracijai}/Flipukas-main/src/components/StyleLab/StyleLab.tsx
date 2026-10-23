import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  Camera,
  Check,
  ChevronRight,
  Compass,
  Eye,
  EyeOff,
  Feather,
  Glasses,
  Grid,
  Heart,
  History,
  Layers,
  LayoutTemplate,
  Lock,
  Maximize2,
  Moon,
  Redo2,
  RefreshCw,
  RotateCcw,
  Ruler,
  Scale,
  Share2,
  Sliders,
  Sparkles,
  Sun,
  Undo2,
  Unlock,
  X,
  ZoomIn,
  MessageSquare,
  QrCode,
  Smartphone,
  Link2,
  Fingerprint,
  Activity,
  Wind,
  Footprints,
  Wand2,
  Video,
  Scissors,
} from 'lucide-react';
import { COLOR_PALETTE, FABRICS, HARDWARE_COLORS, PRODUCTS } from '../../data/products';
import {
  CanvasDesignElement,
  CustomPatternConfig,
  CustomizationState,
  FabricMaterial,
  GarmentLayer,
  LayerType,
  MacroZone,
  Product,
  WishlistItem,
} from '../../types/clothing';
import { isItemInWishlist } from '../../utils/wishlistStorage';
import {
  createDefaultGarmentLayers,
  renderLayersToCanvas,
} from '../../utils/garmentCanvasRenderer';
import { StyleLabSkeleton } from './StyleLabSkeleton';
import { SizeGuideModal } from './SizeGuideModal';
import { CanvaDesignModal } from '../CanvaStudio/CanvaDesignModal';
import { DrawingStudio } from '../DrawingStudio/DrawingStudio';
import { ThreeGarmentViewer, calculateColorLuminance } from '../ThreeCanvas/ThreeGarmentViewer';
import { ARViewModal } from './ARViewModal';
import { FabricSwatchPanel } from './FabricSwatchPanel';
import { LayerManager } from './LayerManager';
import { LightingControlPanel } from './LightingControlPanel';
import { MacroViewControls } from './MacroViewControls';
import { PatternTool } from './PatternTool';
import { PresetTemplatesLibrary } from './PresetTemplatesLibrary';
import { ShareModal } from './ShareModal';
import { SizeFitGuide } from './SizeFitGuide';
import { VoiceControlPanel } from './VoiceControlPanel';
import { useStyleLabHistory } from './useStyleLabHistory';
import { PresetDesignTemplate } from '../../data/presetTemplates';
import { DesignCommentsSection } from './DesignCommentsSection';
import { UserProfileData } from '../../services/firebase';
import { InteractiveSizeRecommender } from './InteractiveSizeRecommender';
import { ARQuickQRModal } from './ARQuickQRModal';
import { copyShareableLinkToClipboard } from '../../utils/shareUtils';
import { AIStyleConsultantModal } from './AIStyleConsultantModal';
import { SocialShareReelModal } from './SocialShareReelModal';
import { GuidedTourOverlay, TourStepId } from './GuidedTourOverlay';
import { SustainabilityScoreIndicator } from './SustainabilityScoreIndicator';
import { SeamstressNotesModal } from './SeamstressNotesModal';

interface StyleLabProps {
  selectedProduct: Product;
  onSelectProduct: (product: Product) => void;
  onAddToCart: (product: Product, customization: CustomizationState, fabric: FabricMaterial, price: number) => void;
  wishlistItems?: WishlistItem[];
  onAddToWishlist?: (
    product: Product,
    customization: CustomizationState,
    fabric: FabricMaterial,
    price: number,
    snapshotUrl?: string
  ) => void;
  onOpenWishlist?: () => void;
  onOpenCompare?: (itemA?: WishlistItem, itemB?: WishlistItem) => void;
  customizationToLoad?: { product: Product; customization: CustomizationState; timestamp: number } | null;
  onCustomizationStateChange?: (customization: CustomizationState, fabric: FabricMaterial, price: number) => void;
  currentUser?: UserProfileData | null;
}

export const StyleLab: React.FC<StyleLabProps> = ({
  selectedProduct,
  onSelectProduct,
  onAddToCart,
  wishlistItems = [],
  onAddToWishlist,
  onOpenWishlist,
  onOpenCompare,
  customizationToLoad,
  onCustomizationStateChange,
  currentUser,
}) => {
  // StyleLab Undo/Redo Customization History Stack
  const {
    customization,
    setCustomization,
    activeDrawingCanvas,
    setActiveDrawingCanvas,
    canUndo,
    canRedo,
    undo,
    redo,
    resetToInitial,
    currentIndex,
    historyLength,
    currentActionLabel,
    actionNotice,
  } = useStyleLabHistory({
    initialProduct: selectedProduct,
    initialCustomization: {
      primaryColor: selectedProduct.defaultColors.primary,
      secondaryColor: selectedProduct.defaultColors.secondary,
      accentColor: selectedProduct.defaultColors.accent,
      hardwareColor: HARDWARE_COLORS[1].hex,
      fabricId: FABRICS[0].id,
      badgeType: 'flipukas',
      customText: 'FLIPUKAS',
      pattern: {
        type: 'none',
        scale: 3,
        primaryColor: selectedProduct.defaultColors.primary,
        secondaryColor: '#f59e0b',
        opacity: 0.85,
        rotation: 0,
        visible: true,
        locked: false,
      },
      layers: createDefaultGarmentLayers(
        selectedProduct.defaultColors.primary,
        selectedProduct.defaultColors.accent
      ),
      macroZone: 'full',
      placement: 'chest',
      studioTheme: 'bright',
      studioBrightness: 1.25,
      size: 'L',
      fitMode: 'regular',
      wireframe: false,
      exploded: false,
      lightingPreset: 'studio',
      cameraPreset: 'front',
      autoRotate: false,
    },
  });

  const [activeTab, setActiveTab] = useState<'draw' | 'templates' | 'layers' | 'patterns' | 'macro' | 'colors' | 'fabrics' | 'fit' | 'comments'>('draw');
  const [isQuickLayersOpen, setIsQuickLayersOpen] = useState(false);
  const [isCanvaOpen, setIsCanvaOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isAROpen, setIsAROpen] = useState(false);
  const [isLightingPanelOpen, setIsLightingPanelOpen] = useState(false);
  const [isTemplatesModalOpen, setIsTemplatesModalOpen] = useState(false);
  const [isFabricModalOpen, setIsFabricModalOpen] = useState(false);
  const [activeTemplateId, setActiveTemplateId] = useState<string | null>(null);
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const [isSizeRecommenderOpen, setIsSizeRecommenderOpen] = useState(false);
  const [isQuickQROpen, setIsQuickQROpen] = useState(false);
  const [is3DLoading, setIs3DLoading] = useState(true);
  const [addedAnimation, setAddedAnimation] = useState(false);
  const [snapshotLoading, setSnapshotLoading] = useState(false);
  const [copiedShareLink, setCopiedShareLink] = useState(false);
  const [hapticFeedback, setHapticFeedback] = useState(false);
  const [clothPhysics, setClothPhysics] = useState(false);
  const [clothMotionMode, setClothMotionMode] = useState<'walk' | 'turn' | 'breeze' | 'idle'>('turn');
  const [isClothPhysicsMenuOpen, setIsClothPhysicsMenuOpen] = useState(false);
  const [isAIStyleConsultantOpen, setIsAIStyleConsultantOpen] = useState(false);
  const [isSocialReelOpen, setIsSocialReelOpen] = useState(false);
  const [isSeamstressModalOpen, setIsSeamstressModalOpen] = useState(false);
  const [manufacturingMethod, setManufacturingMethod] = useState<string>('on-demand-zerowaste');
  const [labExperienceMode, setLabExperienceMode] = useState<'wizard' | 'pro'>('pro');
  const [wizardStep, setWizardStep] = useState<1 | 2 | 3>(1);
  const [isTourActive, setIsTourActive] = useState(false);
  const [tourStep, setTourStep] = useState<TourStepId>('texture');

  // Copy shareable link with encoded customization, fabric, and product ID
  const handleCopyShareableLink = async () => {
    const success = await copyShareableLinkToClipboard(
      selectedProduct.id,
      customization,
      currentFabric.id
    );
    if (success) {
      setCopiedShareLink(true);
      setTimeout(() => setCopiedShareLink(false), 3500);
    }
  };

  // Trigger skeleton loader on garment type or product switch
  useEffect(() => {
    setIs3DLoading(true);
  }, [selectedProduct.id, selectedProduct.type]);

  // Active layers fallback
  const currentLayers =
    customization.layers ||
    createDefaultGarmentLayers(
      selectedProduct.defaultColors.primary,
      selectedProduct.defaultColors.accent
    );

  // Dynamic AI Contrast calculation based on garment color luminance
  const primaryLum = calculateColorLuminance(customization.primaryColor);
  const isAutoContrast = !customization.studioTheme || (customization.studioTheme as string) === 'auto';
  const effectiveStudioTheme = isAutoContrast
    ? (primaryLum > 0.42 ? 'dark' : 'bright')
    : customization.studioTheme;

  // Apply a Curated Preset Design Template (Cyberpunk, Minimalist, Floral, etc.)
  const handleApplyPresetTemplate = (template: PresetDesignTemplate) => {
    const compositeCanvas = renderLayersToCanvas(template.layers);
    setActiveDrawingCanvas(compositeCanvas, `Pritaikytas šablonas: ${template.name}`);
    setActiveTemplateId(template.id);

    setCustomization(
      (c) => ({
        ...c,
        primaryColor: template.colors.primary,
        secondaryColor: template.colors.secondary,
        accentColor: template.colors.accent,
        hardwareColor: template.colors.hardware,
        fabricId: template.fabricId,
        lightingPreset: template.lightingPreset,
        pattern: template.pattern,
        layers: template.layers,
      }),
      `Pritaikytas šablonas: ${template.name}`
    );
  };

  // Lighting environment update
  const handleUpdateLighting = (
    preset: CustomizationState['lightingPreset'],
    brightness?: number
  ) => {
    const label =
      preset === 'neon-night' || preset === 'cyber'
        ? 'Neon Night'
        : preset === 'golden-hour'
        ? 'Golden Hour'
        : preset === 'daylight'
        ? 'Natural Daylight'
        : 'Studio White';

    setCustomization(
      (c) => ({
        ...c,
        lightingPreset: preset,
        studioBrightness: brightness !== undefined ? brightness : c.studioBrightness,
      }),
      `Apšvietimas: ${label}`
    );
  };

  // 3D Studio Theme update
  const handleUpdateTheme = (theme: 'bright' | 'dark') => {
    setCustomization(
      (c) => ({
        ...c,
        studioTheme: theme,
      }),
      `Studijos tema: ${theme === 'bright' ? 'Šviesi' : 'Tamsi'}`
    );
  };

  // Update layers and re-render canvas
  const handleUpdateLayers = (newLayers: GarmentLayer[], actionLabel: string) => {
    const compositeCanvas = renderLayersToCanvas(newLayers);
    setActiveDrawingCanvas(compositeCanvas, actionLabel);

    const patternLayer = newLayers.find((l) => l.type === 'pattern');

    setCustomization(
      (c) => ({
        ...c,
        layers: newLayers,
        pattern: patternLayer
          ? {
              ...(patternLayer.patternConfig || c.pattern),
              visible: patternLayer.visible,
              locked: patternLayer.locked,
              opacity: patternLayer.opacity ?? c.pattern.opacity,
            }
          : c.pattern,
      }),
      actionLabel
    );
  };

  // Update pattern and keep pattern layer in sync
  const handleUpdatePattern = (newPattern: CustomPatternConfig, actionLabel: string) => {
    const updatedLayers = (customization.layers || currentLayers).map((l) => {
      if (l.type === 'pattern') {
        return {
          ...l,
          patternConfig: newPattern,
          visible: newPattern.visible !== false,
          locked: newPattern.locked === true,
          opacity: newPattern.opacity ?? l.opacity,
        };
      }
      return l;
    });

    setCustomization(
      (c) => ({
        ...c,
        pattern: newPattern,
        layers: updatedLayers,
      }),
      actionLabel
    );
  };

  // Active fabric object
  const currentFabric = FABRICS.find((f) => f.id === customization.fabricId) || FABRICS[0];

  // Dynamic price calculation (Normal, accessible price!)
  const calculatedPrice = selectedProduct.basePrice + currentFabric.priceDelta;

  const handleProductChange = (prod: Product) => {
    onSelectProduct(prod);
    setCustomization(
      (prev) => ({
        ...prev,
        primaryColor: prod.defaultColors.primary,
        secondaryColor: prod.defaultColors.secondary,
        accentColor: prod.defaultColors.accent,
      }),
      `Pasirinktas modelis: ${prod.name}`
    );
  };

  const handleAddToCartClick = () => {
    onAddToCart(selectedProduct, customization, currentFabric, calculatedPrice);
    setAddedAnimation(true);
    try {
      confetti({
        particleCount: 45,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#f59e0b', '#38bdf8', '#10b981'],
      });
    } catch {
      // ignore
    }
    setTimeout(() => setAddedAnimation(false), 2000);
  };

  const handleDownloadSnapshot = (highRes4K: boolean = true) => {
    setSnapshotLoading(true);
    const canvas = document.querySelector('canvas');
    if (canvas) {
      setTimeout(() => {
        try {
          if (highRes4K) {
            // Render 4K Ultra-HD clean snapshot (3840x2160) without UI
            const offscreen = document.createElement('canvas');
            offscreen.width = 3840;
            offscreen.height = 2160;
            const ctx = offscreen.getContext('2d');
            if (ctx) {
              ctx.imageSmoothingEnabled = true;
              ctx.imageSmoothingQuality = 'high';
              ctx.drawImage(canvas, 0, 0, 3840, 2160);
              const imageUri = offscreen.toDataURL('image/png', 1.0);
              const link = document.createElement('a');
              link.download = `flipukas_4K_${selectedProduct.slug}_${customization.size}.png`;
              link.href = imageUri;
              link.click();
              return;
            }
          }
          const imageUri = canvas.toDataURL('image/png');
          const link = document.createElement('a');
          link.download = `flipukas_${selectedProduct.slug}_${customization.size}.png`;
          link.href = imageUri;
          link.click();
        } catch (e) {
          console.error(e);
        } finally {
          setSnapshotLoading(false);
        }
      }, 100);
    } else {
      setSnapshotLoading(false);
    }
  };

  // Wishlist state and handlers
  const [wishlistToast, setWishlistToast] = useState<string | null>(null);

  const isWishlisted = isItemInWishlist(
    selectedProduct.id,
    customization,
    customization.fabricId,
    wishlistItems || []
  );

  const matchingWishlistItem =
    wishlistItems.find(
      (item) =>
        item.product.id === selectedProduct.id &&
        item.customization.primaryColor === customization.primaryColor &&
        item.customization.fabricId === customization.fabricId
    ) ||
    wishlistItems.find((item) => item.product.id === selectedProduct.id) ||
    null;

  const handleSaveToWishlist = () => {
    let snapshotUrl: string | undefined = undefined;
    try {
      const canvas = document.querySelector('canvas');
      if (canvas) {
        snapshotUrl = canvas.toDataURL('image/png');
      }
    } catch (e) {
      console.warn('Could not export canvas for wishlist thumbnail', e);
    }

    if (onAddToWishlist) {
      onAddToWishlist(
        selectedProduct,
        customization,
        currentFabric,
        calculatedPrice,
        snapshotUrl
      );
      setWishlistToast('Išsaugota į tavo Wishlist sąrašą! 💖');
      setTimeout(() => setWishlistToast(null), 3000);
    }
  };

  // Sync state up to parent for comparison candidate availability
  React.useEffect(() => {
    if (onCustomizationStateChange) {
      onCustomizationStateChange(customization, currentFabric, calculatedPrice);
    }
  }, [customization, currentFabric, calculatedPrice, onCustomizationStateChange]);

  // Handle external loading of a garment configuration (e.g. from Wishlist or Comparison)
  const lastLoadedTimestampRef = React.useRef<number>(0);
  React.useEffect(() => {
    if (customizationToLoad && customizationToLoad.timestamp !== lastLoadedTimestampRef.current) {
      lastLoadedTimestampRef.current = customizationToLoad.timestamp;
      setCustomization(
        () => customizationToLoad.customization,
        `Užkrautas modelis: ${customizationToLoad.product.name}`
      );
      if (customizationToLoad.customization.layers) {
        const composite = renderLayersToCanvas(customizationToLoad.customization.layers);
        setActiveDrawingCanvas(composite, `Užkrautas piešinys`);
      }
    }
  }, [customizationToLoad, setCustomization, setActiveDrawingCanvas]);

  return (
    <div id="style-lab" className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Editorial Header & Experience Mode Switch */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6 pb-6 border-b border-stone-800/80">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.2em] text-[#d4af37] mb-1.5 font-semibold">
            <span>02 // 3D Atelier Studija</span>
            <span>·</span>
            <span>Cloth Physics & AI</span>
          </div>
          <h2 className="text-3xl font-serif-luxury font-bold tracking-tight text-white">
            Tikri Drabužiai, Audinio Fizika ir Realaus Laiko 3D
          </h2>
          <p className="text-xs text-stone-300 mt-1 max-w-xl font-light">
            Tikroviški audinių kritimai, dinaminis drapiravimas einant ar sukantis bei autorinis AI stiliaus asistentas.
          </p>
        </div>

        {/* Experience Mode Toggle & Product Selector */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          {/* Mode Switch: 3-Step Wizard vs Atelier Pro */}
          <div className="flex items-center gap-1 p-1 bg-stone-900/90 rounded-xl border border-stone-800 text-xs font-mono">
            <button
              type="button"
              onClick={() => setLabExperienceMode('wizard')}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
                labExperienceMode === 'wizard'
                  ? 'bg-[#d4af37] text-stone-950 font-bold shadow-sm'
                  : 'text-stone-400 hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>3 Žingsnių Vedlys</span>
            </button>
            <button
              type="button"
              onClick={() => setLabExperienceMode('pro')}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
                labExperienceMode === 'pro'
                  ? 'bg-stone-800 text-white font-bold border border-stone-700 shadow-sm'
                  : 'text-stone-400 hover:text-white'
              }`}
            >
              <span>Atelier Pro</span>
            </button>
          </div>

          {/* Product selector buttons */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {PRODUCTS.map((prod) => {
              const isSelected = prod.id === selectedProduct.id;
              return (
                <button
                  key={prod.id}
                  onClick={() => handleProductChange(prod)}
                  className={`px-3 py-1.5 text-xs font-serif-luxury font-semibold rounded-xl whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-[#d4af37] text-stone-950 font-bold shadow-md'
                      : 'text-stone-300 hover:text-white bg-stone-900/80 hover:bg-stone-800 border border-stone-800'
                  }`}
                >
                  {prod.name.split(' ')[0]} ({prod.basePrice} €)
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Gamified 3-Step Wizard Bar (When Wizard Mode is active) */}
      {labExperienceMode === 'wizard' && (
        <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-[#181822] via-[#121218] to-[#0e0e13] border border-[#d4af37]/35 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#d4af37] font-semibold">
              Bandyk, kol patinka:
            </span>
            <div className="flex items-center gap-2 text-xs">
              <button
                type="button"
                onClick={() => setWizardStep(1)}
                className={`px-3 py-1.5 rounded-xl font-serif-luxury font-bold transition flex items-center gap-1.5 ${
                  wizardStep === 1
                    ? 'bg-[#d4af37] text-stone-950'
                    : 'bg-stone-900 text-stone-400 hover:text-white border border-stone-800'
                }`}
              >
                <span>1. Pasirink siluetą</span>
              </button>
              <span className="text-stone-600">→</span>
              <button
                type="button"
                onClick={() => {
                  setWizardStep(2);
                  setActiveTab('colors');
                }}
                className={`px-3 py-1.5 rounded-xl font-serif-luxury font-bold transition flex items-center gap-1.5 ${
                  wizardStep === 2
                    ? 'bg-[#d4af37] text-stone-950'
                    : 'bg-stone-900 text-stone-400 hover:text-white border border-stone-800'
                }`}
              >
                <span>2. Spalva & Audinys</span>
              </button>
              <span className="text-stone-600">→</span>
              <button
                type="button"
                onClick={() => setWizardStep(3)}
                className={`px-3 py-1.5 rounded-xl font-serif-luxury font-bold transition flex items-center gap-1.5 ${
                  wizardStep === 3
                    ? 'bg-[#d4af37] text-stone-950'
                    : 'bg-stone-900 text-stone-400 hover:text-white border border-stone-800'
                }`}
              >
                <span>3. Tavo 3D Rezultatas</span>
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsAIStyleConsultantOpen(true)}
            className="px-4 py-1.5 luxury-button-gold text-stone-950 font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer shadow-md shrink-0 self-start sm:self-auto"
          >
            <Wand2 className="w-3.5 h-3.5" />
            <span>AI Style Consultant</span>
          </button>
        </div>
      )}

      {/* Main Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left/Center: 3D Canvas Stage (7 cols) */}
        <div className={`lg:col-span-7 xl:col-span-7 flex flex-col rounded-2xl border overflow-hidden backdrop-blur-sm relative transition-colors ${
          customization.studioTheme === 'bright'
            ? 'bg-white/90 border-neutral-300 shadow-xl'
            : 'bg-neutral-900/60 border-neutral-800/80'
        }`}>
          {/* Top HUD Toolbar */}
          <div className={`flex flex-wrap items-center justify-between px-4 py-2.5 border-b gap-2 text-xs transition-colors ${
            customization.studioTheme === 'bright'
              ? 'bg-slate-50 border-neutral-200 text-neutral-800'
              : 'bg-neutral-950/60 border-neutral-800/60 text-neutral-300'
          }`}>
            <div className="flex items-center gap-3">
              <span className={`font-semibold ${customization.studioTheme === 'bright' ? 'text-neutral-900' : 'text-neutral-100'}`}>
                {selectedProduct.name}
              </span>
              <span className="text-neutral-400">·</span>
              <span className="text-emerald-500 font-mono font-bold tabular-nums text-sm">
                {calculatedPrice} €
              </span>

              {/* Sustainability Score Indicator */}
              <SustainabilityScoreIndicator
                fabric={currentFabric}
                manufacturingMethod={manufacturingMethod}
                onChangeManufacturingMethod={(m) => setManufacturingMethod(m)}
              />

              {/* ☀️ / 🌙 Studio Theme Toggle */}
              <button
                onClick={() =>
                  setCustomization((c) => ({
                    ...c,
                    studioTheme: c.studioTheme === 'bright' ? 'dark' : 'bright',
                  }))
                }
                title="Keisti studijos apšvietimo aplinką"
                className={`ml-2 px-2.5 py-1 rounded-lg border text-[11px] font-medium flex items-center gap-1.5 transition ${
                  customization.studioTheme === 'bright'
                    ? 'bg-amber-100/80 border-amber-300 text-amber-900 font-bold'
                    : 'bg-neutral-800 border-neutral-700 text-neutral-300 hover:text-white'
                }`}
              >
                {customization.studioTheme === 'bright' ? (
                  <>
                    <Sun className="w-3.5 h-3.5 text-amber-500" />
                    <span>Šviesi Studija</span>
                  </>
                ) : (
                  <>
                    <Sun className="w-3.5 h-3.5 text-neutral-400" />
                    <span>Tamsi Studija</span>
                  </>
                )}
              </button>

              {/* Brightness Booster (+ / -) */}
              <div className="hidden sm:flex items-center gap-1 bg-neutral-200/50 dark:bg-neutral-800/60 px-2 py-0.5 rounded-lg border border-neutral-300/60 dark:border-neutral-700">
                <button
                  onClick={() =>
                    setCustomization((c) => ({
                      ...c,
                      studioBrightness: Math.max(0.8, Number((c.studioBrightness - 0.15).toFixed(2))),
                    }))
                  }
                  className="px-1 text-neutral-500 hover:text-neutral-900 font-bold"
                  title="Sumažinti šviesumą"
                >
                  -
                </button>
                <span className="text-[11px] font-mono text-amber-600 font-bold">
                  ☀️ {Math.round(customization.studioBrightness * 100)}%
                </span>
                <button
                  onClick={() =>
                    setCustomization((c) => ({
                      ...c,
                      studioBrightness: Math.min(2.0, Number((c.studioBrightness + 0.15).toFixed(2))),
                    }))
                  }
                  className="px-1 text-neutral-500 hover:text-neutral-900 font-bold"
                  title="Padidinti šviesumą"
                >
                  +
                </button>
              </div>
            </div>

            {/* Undo / Redo Stack Controls */}
            <div className="flex items-center gap-1 bg-neutral-200/60 dark:bg-neutral-800/70 px-1.5 py-0.5 rounded-lg border border-neutral-300/80 dark:border-neutral-700">
              <button
                onClick={undo}
                disabled={!canUndo}
                title="Atšaukti pakeitimą (Ctrl + Z)"
                className={`px-2 py-1 rounded text-[11px] font-mono flex items-center gap-1 transition ${
                  canUndo
                    ? customization.studioTheme === 'bright'
                      ? 'bg-white text-neutral-900 hover:bg-neutral-100 shadow-sm font-semibold cursor-pointer'
                      : 'bg-neutral-700 text-neutral-100 hover:bg-neutral-600 cursor-pointer font-semibold'
                    : 'text-neutral-400 opacity-40 cursor-not-allowed'
                }`}
              >
                <Undo2 className="w-3.5 h-3.5 text-amber-500" />
                <span className="hidden md:inline">Atšaukti</span>
              </button>

              <button
                onClick={redo}
                disabled={!canRedo}
                title="Grąžinti pakeitimą (Ctrl + Y arba Ctrl + Shift + Z)"
                className={`px-2 py-1 rounded text-[11px] font-mono flex items-center gap-1 transition ${
                  canRedo
                    ? customization.studioTheme === 'bright'
                      ? 'bg-white text-neutral-900 hover:bg-neutral-100 shadow-sm font-semibold cursor-pointer'
                      : 'bg-neutral-700 text-neutral-100 hover:bg-neutral-600 cursor-pointer font-semibold'
                    : 'text-neutral-400 opacity-40 cursor-not-allowed'
                }`}
              >
                <Redo2 className="w-3.5 h-3.5 text-amber-500" />
                <span className="hidden md:inline">Grąžinti</span>
              </button>

              <button
                onClick={() => resetToInitial(selectedProduct)}
                title="Atkurti pradinius modelio nustatymus"
                className={`p-1 rounded text-[11px] transition ${
                  customization.studioTheme === 'bright'
                    ? 'text-neutral-600 hover:text-neutral-950 hover:bg-neutral-200'
                    : 'text-neutral-400 hover:text-white hover:bg-neutral-700'
                }`}
              >
                <RotateCcw className="w-3 h-3" />
              </button>
            </div>

            {/* Wishlist & Compare Quick Header Buttons */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={handleSaveToWishlist}
                title={isWishlisted ? "Modelis jau išsaugotas į Wishlist" : "Išsaugoti šią 3D konfigūraciją į Wishlist"}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-mono flex items-center gap-1.5 transition cursor-pointer ${
                  isWishlisted
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-sm'
                    : customization.studioTheme === 'bright'
                    ? 'bg-white text-neutral-800 hover:bg-neutral-100 border border-neutral-300'
                    : 'bg-neutral-800/80 hover:bg-neutral-700 text-neutral-300 hover:text-white border border-neutral-700'
                }`}
              >
                <Heart className={`w-3.5 h-3.5 ${isWishlisted ? 'text-rose-400 fill-rose-400' : 'text-rose-400'}`} />
                <span className="hidden sm:inline font-semibold">{isWishlisted ? 'Wishlist' : 'Į Wishlist'}</span>
              </button>

              <button
                onClick={() => onOpenCompare?.()}
                title="Palyginti 2 modelius vienas šalia kito (Side-by-Side)"
                className={`px-2.5 py-1 rounded-lg text-[11px] font-mono flex items-center gap-1.5 transition cursor-pointer ${
                  customization.studioTheme === 'bright'
                    ? 'bg-white text-neutral-800 hover:bg-neutral-100 border border-neutral-300'
                    : 'bg-neutral-800/80 hover:bg-neutral-700 text-neutral-300 hover:text-white border border-neutral-700'
                }`}
              >
                <Scale className="w-3.5 h-3.5 text-amber-500" />
                <span className="hidden sm:inline font-semibold">Palyginti</span>
              </button>
            </div>

            {/* Placement Switcher (Priekis / Nugara) */}
            <div className="flex items-center gap-1">
              <span className="text-[11px] text-neutral-400 mr-1 hidden md:inline">Vieta:</span>
              {(
                [
                  { id: 'chest', label: 'Priekis', preset: 'front' as const },
                  { id: 'back', label: 'Nugara', preset: 'back' as const },
                  { id: 'pocket', label: 'Kišenė', preset: 'front' as const },
                ]
              ).map((p) => (
                <button
                  key={p.id}
                  onClick={() =>
                    setCustomization((c) => ({
                      ...c,
                      placement: p.id as any,
                      cameraPreset: p.preset,
                    }), `Pakeista vieta: ${p.label}`)
                  }
                  className={`px-2 py-1 rounded text-[11px] font-mono transition-colors ${
                    customization.placement === p.id
                      ? 'bg-amber-400 text-neutral-950 font-bold shadow-sm'
                      : customization.studioTheme === 'bright'
                      ? 'text-neutral-600 hover:bg-neutral-200'
                      : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>

            {/* Camera & Macro-Zoom Presets */}
            <div className="flex items-center gap-1 ml-auto sm:ml-0 flex-wrap">
              {/* Dynamic Studio Theme / AI Contrast Toggle */}
              <button
                onClick={() => {
                  const nextTheme = isAutoContrast
                    ? 'dark'
                    : customization.studioTheme === 'dark'
                    ? 'bright'
                    : 'auto';
                  setCustomization((c) => ({ ...c, studioTheme: nextTheme as any }), `Studijos fonas: ${nextTheme}`);
                }}
                title={
                  isAutoContrast
                    ? `AI Kontrastas aktyvus (${primaryLum > 0.42 ? 'Šviesus modelis → Tamsi studija' : 'Tamsus modelis → Šviesi studija'})`
                    : customization.studioTheme === 'dark'
                    ? 'Tamsi studija (Spustelk perjungti į šviesią)'
                    : 'Šviesi studija (Spustelk perjungti į AI kontrastą)'
                }
                className={`px-2 py-1 rounded text-[11px] font-mono flex items-center gap-1.5 transition ${
                  isAutoContrast
                    ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40 font-bold'
                    : effectiveStudioTheme === 'bright'
                    ? 'bg-slate-200 text-neutral-800 border border-slate-300 font-medium'
                    : 'bg-neutral-800 text-neutral-200 border border-neutral-700 font-medium'
                }`}
              >
                {isAutoContrast ? (
                  <Sparkles className="w-3 h-3 text-amber-400" />
                ) : effectiveStudioTheme === 'bright' ? (
                  <Sun className="w-3 h-3 text-amber-500" />
                ) : (
                  <Moon className="w-3 h-3 text-sky-400" />
                )}
                <span className="hidden lg:inline">
                  {isAutoContrast ? 'AI Kontrastas' : effectiveStudioTheme === 'bright' ? 'Šviesi studija' : 'Tamsi studija'}
                </span>
              </button>

              {(
                [
                  { id: 'front', label: 'Priekis' },
                  { id: 'side', label: 'Šonas' },
                  { id: 'back', label: 'Nugara' },
                  { id: 'detail', label: '🔍 Makro' },
                  { id: 'iso', label: '3D' },
                ] as const
              ).map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => setCustomization((c) => ({ ...c, cameraPreset: preset.id }), `Kameros kampas: ${preset.label}`)}
                  className={`px-2 py-1 rounded text-[11px] font-mono transition-colors ${
                    customization.cameraPreset === preset.id
                      ? 'bg-neutral-900 text-white font-bold'
                      : effectiveStudioTheme === 'bright'
                      ? 'text-neutral-600 hover:bg-neutral-200'
                      : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* 3D WebGL Canvas with Real Clothing Mesh & Dynamic AI Contrast Background */}
          <div className={`relative w-full h-[520px] sm:h-[600px] flex items-center justify-center transition-colors duration-500 ${
            effectiveStudioTheme === 'bright'
              ? 'bg-gradient-to-b from-slate-200 via-stone-100 to-slate-300'
              : 'bg-gradient-to-b from-neutral-950 via-zinc-950 to-neutral-900'
          }`}>
            {/* Floating Action Notice Badge */}
            {actionNotice && (
              <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 px-3.5 py-1.5 rounded-full bg-neutral-950/90 text-amber-300 text-xs font-mono font-medium border border-amber-500/50 shadow-2xl backdrop-blur-md flex items-center gap-2 pointer-events-none">
                <History className="w-3.5 h-3.5 text-amber-400" />
                <span>{actionNotice}</span>
              </div>
            )}

            {/* Quick Floating Layer Management HUD on 3D stage */}
            <div className="absolute top-4 left-4 z-20 flex flex-col gap-1.5 max-w-[240px]">
              <div className="bg-neutral-950/85 backdrop-blur-md rounded-xl border border-neutral-800 shadow-xl p-2 flex flex-col gap-1.5">
                <div className="flex items-center justify-between px-1">
                  <div
                    onClick={() => setActiveTab('layers')}
                    className="flex items-center gap-1.5 text-[11px] font-mono text-neutral-300 font-semibold cursor-pointer hover:text-amber-400 transition"
                    title="Atidaryti pilną sluoksnių valdymo skydelį"
                  >
                    <Layers className="w-3.5 h-3.5 text-amber-400" />
                    <span>Sluoksniai ({currentLayers.length})</span>
                  </div>
                  <button
                    onClick={() => setIsQuickLayersOpen(!isQuickLayersOpen)}
                    className="text-neutral-400 hover:text-white px-1.5 py-0.5 rounded text-[10px] font-mono bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 transition"
                  >
                    {isQuickLayersOpen ? 'Slėpti' : 'Rodyti'}
                  </button>
                </div>

                {isQuickLayersOpen && (
                  <div className="flex flex-col gap-1 pt-1.5 border-t border-neutral-800/80 max-h-48 overflow-y-auto pr-0.5">
                    {currentLayers.map((l) => (
                      <div
                        key={l.id}
                        className={`flex items-center justify-between gap-1.5 px-2 py-1 rounded-lg text-[11px] transition ${
                          l.visible ? 'bg-neutral-900/90 text-neutral-200' : 'bg-neutral-950/50 text-neutral-500 line-through'
                        }`}
                      >
                        <span
                          onClick={() => setActiveTab('layers')}
                          className="truncate cursor-pointer hover:text-amber-400 flex-1 text-[11px]"
                          title={l.name}
                        >
                          {l.name}
                        </span>
                        <div className="flex items-center gap-1 shrink-0">
                          {/* Toggle visibility */}
                          <button
                            onClick={() => {
                              const nextVis = !l.visible;
                              const updated = currentLayers.map((item) =>
                                item.id === l.id ? { ...item, visible: nextVis } : item
                              );
                              handleUpdateLayers(
                                updated,
                                nextVis ? `Rodyti sluoksnį: ${l.name}` : `Paslėpti sluoksnį: ${l.name}`
                              );
                            }}
                            className={`p-1 rounded hover:bg-neutral-800 transition ${
                              l.visible ? 'text-neutral-300 hover:text-white' : 'text-red-400'
                            }`}
                            title={l.visible ? 'Paslėpti' : 'Rodyti'}
                          >
                            {l.visible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                          </button>
                          {/* Toggle lock */}
                          <button
                            onClick={() => {
                              const nextLock = !l.locked;
                              const updated = currentLayers.map((item) =>
                                item.id === l.id ? { ...item, locked: nextLock } : item
                              );
                              handleUpdateLayers(
                                updated,
                                nextLock ? `Užrakintas: ${l.name}` : `Atrakintas: ${l.name}`
                              );
                            }}
                            className={`p-1 rounded hover:bg-neutral-800 transition ${
                              l.locked ? 'text-amber-400' : 'text-neutral-500 hover:text-white'
                            }`}
                            title={l.locked ? 'Užrakinta' : 'Atrakinta'}
                          >
                            {l.locked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                          </button>
                        </div>
                      </div>
                    ))}
                    <button
                      onClick={() => setActiveTab('layers')}
                      className="mt-1 w-full py-1 rounded bg-amber-400/10 hover:bg-amber-400/20 text-amber-400 text-[10px] font-mono text-center transition font-semibold"
                    >
                      Pilnas sluoksnių redaktorius →
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* High-Fidelity Skeleton Screen for 3D StyleLab Container (Eliminates empty space frustration) */}
            <StyleLabSkeleton
              isLoading={is3DLoading}
              garmentType={selectedProduct.type}
              product={selectedProduct}
              fabric={currentFabric}
              primaryColor={customization.primaryColor}
            />

            <ThreeGarmentViewer
              garmentType={selectedProduct.type}
              customization={customization}
              activeFabric={currentFabric}
              drawingCanvas={activeDrawingCanvas}
              isBrightStudio={effectiveStudioTheme === 'bright'}
              onLoaded={() => setIs3DLoading(false)}
              onToggleAutoRotate={() => setCustomization((c) => ({ ...c, autoRotate: !c.autoRotate }))}
              hapticFeedback={hapticFeedback}
              onToggleHaptic={() => {
                const next = !hapticFeedback;
                setHapticFeedback(next);
                setWishlistToast(
                  next
                    ? 'Haptinis režimas ĮJUNGTAS: audinio reljefas & mikro-roughness aktyvuoti'
                    : 'Haptinis režimas išjungtas'
                );
                setTimeout(() => setWishlistToast(null), 3000);
              }}
              clothPhysics={clothPhysics}
              clothMotionMode={clothMotionMode}
              tourStep={isTourActive ? tourStep : null}
            />

            {/* Guided Tour Overlay Component */}
            <GuidedTourOverlay
              isActive={isTourActive}
              onClose={() => setIsTourActive(false)}
              product={selectedProduct}
              customization={customization}
              activeFabric={currentFabric}
              currentStepId={tourStep}
              onStepChange={setTourStep}
              onAddToCart={() => {
                onAddToCart(selectedProduct, customization, currentFabric, calculatedPrice);
                setIsTourActive(false);
                setWishlistToast(`„${selectedProduct.name}“ įdėtas į krepšelį!`);
                setTimeout(() => setWishlistToast(null), 3000);
              }}
            />

            {/* Quick floating action toggles on 3D stage */}
            <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
              {/* Guided Tour Camera Sequences Overlay Button */}
              <button
                type="button"
                onClick={() => {
                  const next = !isTourActive;
                  setIsTourActive(next);
                  if (next) {
                    setTourStep('texture');
                    setWishlistToast('Guided Tour paleistas: apžiūrima audinio tekstūra, furnitūra ir monograma');
                  } else {
                    setWishlistToast('Guided Tour sustabdytas');
                  }
                  setTimeout(() => setWishlistToast(null), 3000);
                }}
                title="Guided Tour: automatinė kameros ekskursija per 3D funkcijas (tekstūra, furnitūra, monograma, 360°)"
                className={`p-2.5 rounded-xl border text-xs font-mono transition-all flex items-center gap-1.5 backdrop-blur-md cursor-pointer shadow-lg active:scale-95 ${
                  isTourActive
                    ? 'bg-[#d4af37] text-stone-950 font-bold border-[#d4af37] shadow-[0_0_20px_rgba(212,175,55,0.4)]'
                    : 'bg-gradient-to-r from-stone-900/90 to-[#1c1917]/90 hover:from-stone-800 hover:to-stone-900 border-[#d4af37]/60 text-[#f5e6b8] hover:border-[#d4af37]'
                }`}
              >
                <Compass className={`w-3.5 h-3.5 ${isTourActive ? 'animate-spin' : 'text-[#d4af37]'}`} />
                <span className="text-[11px] font-serif-luxury font-bold tracking-wide">
                  {isTourActive ? 'Turas Vyksta...' : 'Guided Tour'}
                </span>
              </button>

              {/* WebXR & Mobile Camera AR View Button */}
              <button
                type="button"
                onClick={() => setIsAROpen(true)}
                title="WebXR & Mobile AR: projektuokite sukonfigūruotą 3D drabužį į savo kambarį per kamerą"
                className="p-2.5 rounded-xl border border-amber-400/70 bg-gradient-to-r from-amber-400/20 via-neutral-900/90 to-neutral-950/90 hover:from-amber-400/35 hover:to-neutral-800 text-amber-300 hover:text-white text-xs font-mono font-bold transition-all flex items-center gap-1.5 backdrop-blur-md cursor-pointer shadow-lg active:scale-95 ring-1 ring-amber-400/30"
              >
                <Camera className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                <span className="text-[11px] font-bold">WebXR AR Kamera</span>
              </button>

              {/* Cloth Physics Simulation Toggle */}
              <div className="flex flex-col items-end gap-1">
                <button
                  type="button"
                  onClick={() => {
                    const next = !clothPhysics;
                    setClothPhysics(next);
                    if (next && clothMotionMode !== 'turn') {
                      setClothMotionMode('turn');
                    }
                    setWishlistToast(
                      next
                        ? `Cloth Physics ĮJUNGTA: 360° Runway Sukimasis ir realaus laiko drapiravimas (${currentFabric.nameLt})`
                        : 'Audinio fizika išjungta'
                    );
                    setTimeout(() => setWishlistToast(null), 3000);
                  }}
                  title="Cloth Physics Simulation: realaus laiko audinio drapiravimas ir judėjimas modeliui sukantis ar einant"
                  className={`p-2.5 rounded-xl border text-xs font-mono transition-all flex items-center gap-1.5 backdrop-blur-md cursor-pointer shadow-md active:scale-95 ${
                    clothPhysics
                      ? 'bg-[#d4af37]/25 border-[#d4af37] text-[#f5e6b8] font-bold shadow-[0_0_15px_rgba(212,175,55,0.3)]'
                      : 'bg-neutral-900/90 border-neutral-700/80 hover:bg-neutral-800 text-neutral-300 hover:text-white'
                  }`}
                >
                  <Activity
                    className={`w-3.5 h-3.5 ${
                      clothPhysics ? 'text-[#d4af37] animate-pulse' : 'text-stone-400'
                    }`}
                  />
                  <span className="text-[11px] font-semibold">
                    {clothPhysics ? 'Cloth Physics (ON)' : 'Cloth Physics'}
                  </span>
                </button>

                {/* Cloth Motion Mode Selector Pills */}
                {clothPhysics && (
                  <div className="flex items-center gap-1 p-1 bg-black/85 backdrop-blur-md rounded-xl border border-[#d4af37]/40 shadow-xl animate-fadeIn">
                    <button
                      type="button"
                      onClick={() => setClothMotionMode('turn')}
                      title="Runway 360° sukimasis (Centrifugal turn & drape)"
                      className={`px-2 py-1 rounded-lg text-[10px] font-mono transition flex items-center gap-1 cursor-pointer ${
                        clothMotionMode === 'turn'
                          ? 'bg-[#d4af37] text-stone-950 font-bold'
                          : 'text-stone-300 hover:text-white'
                      }`}
                    >
                      <RotateCcw className="w-2.5 h-2.5" />
                      <span>Sukimasis</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setClothMotionMode('walk')}
                      title="Modelio žingsnis (Walking motion)"
                      className={`px-2 py-1 rounded-lg text-[10px] font-mono transition flex items-center gap-1 cursor-pointer ${
                        clothMotionMode === 'walk'
                          ? 'bg-[#d4af37] text-stone-950 font-bold'
                          : 'text-stone-300 hover:text-white'
                      }`}
                    >
                      <Footprints className="w-2.5 h-2.5" />
                      <span>Žingsnis</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setClothMotionMode('breeze')}
                      title="Vėjo gūsis (Aerodynamic breeze)"
                      className={`px-2 py-1 rounded-lg text-[10px] font-mono transition flex items-center gap-1 cursor-pointer ${
                        clothMotionMode === 'breeze'
                          ? 'bg-[#d4af37] text-stone-950 font-bold'
                          : 'text-stone-300 hover:text-white'
                      }`}
                    >
                      <Wind className="w-2.5 h-2.5" />
                      <span>Vėjas</span>
                    </button>
                  </div>
                )}
              </div>

              {/* AI Style Consultant Quick Stage Toggle */}
              <button
                type="button"
                onClick={() => setIsAIStyleConsultantOpen(true)}
                title="AI Style Consultant: Aprangos analizė su Gemini API ir derantys katalogo aksesuarai"
                className="p-2.5 rounded-xl border border-[#d4af37]/60 bg-gradient-to-r from-[#d4af37]/20 to-amber-700/20 hover:from-[#d4af37]/35 hover:to-amber-600/30 text-[#f5e6b8] text-xs font-mono font-bold transition-all flex items-center gap-1.5 backdrop-blur-md cursor-pointer shadow-lg active:scale-95 ring-1 ring-[#d4af37]/25"
              >
                <Wand2 className="w-3.5 h-3.5 text-[#d4af37] animate-pulse" />
                <span className="text-[11px] font-bold">AI Style Consultant</span>
              </button>

              {/* Visual Haptic Feedback Toggle Button */}
              <button
                type="button"
                onClick={() => {
                  const next = !hapticFeedback;
                  setHapticFeedback(next);
                  setWishlistToast(
                    next
                      ? 'Haptinis režimas ĮJUNGTAS: audinio reljefas & mikro-roughness aktyvuoti'
                      : 'Haptinis režimas išjungtas'
                  );
                  setTimeout(() => setWishlistToast(null), 3000);
                }}
                title="Vizualus Haptinis grįžtamasis ryšys (simuliuoja audinio mikrotekstūrą, reljefą ir lietimo šiurkštumą per displacement & shader variacijas)"
                className={`p-2.5 rounded-lg border text-xs font-mono transition-all flex items-center gap-1.5 backdrop-blur-md cursor-pointer shadow-md active:scale-95 ${
                  hapticFeedback
                    ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 font-bold shadow-emerald-500/20'
                    : 'bg-neutral-900/90 border-neutral-700/80 hover:bg-neutral-800 text-neutral-300 hover:text-white'
                }`}
              >
                <Fingerprint
                  className={`w-3.5 h-3.5 ${
                    hapticFeedback ? 'text-emerald-400 animate-pulse' : 'text-neutral-400'
                  }`}
                />
                <span className="hidden sm:inline text-[11px] font-semibold">
                  {hapticFeedback ? 'Haptika (ON)' : 'Haptika'}
                </span>
              </button>

              {/* Copy Shareable Link Quick Toggle */}
              <button
                type="button"
                onClick={handleCopyShareableLink}
                title="Kopijuoti bendrinimo nuorodą su audinio ir 3D nustatymais"
                className={`p-2.5 rounded-lg border text-xs font-mono transition-all flex items-center gap-1.5 backdrop-blur-md cursor-pointer shadow-md active:scale-95 ${
                  copiedShareLink
                    ? 'bg-emerald-500 text-black border-emerald-400 font-bold'
                    : 'bg-neutral-900/90 border-amber-400/50 hover:bg-neutral-800 text-amber-300 hover:text-white'
                }`}
              >
                {copiedShareLink ? (
                  <Check className="w-3.5 h-3.5 text-black" />
                ) : (
                  <Link2 className="w-3.5 h-3.5 text-amber-400" />
                )}
                <span className="hidden sm:inline text-[11px] font-semibold">
                  {copiedShareLink ? 'Nuoroda nukopijuota!' : 'Kopijuoti nuorodą'}
                </span>
              </button>

              {/* QR Code AR Mobile Experience Shortcut */}
              <button
                type="button"
                onClick={() => setIsQuickQROpen(true)}
                title="Paleisti mobilųjį AR režimą per QR kodą (Nuskenuoti telefonu)"
                className="p-2.5 rounded-lg border border-amber-400/50 bg-neutral-900/90 hover:bg-neutral-800 text-amber-300 hover:text-white text-xs font-mono transition-all flex items-center gap-1.5 backdrop-blur-md cursor-pointer shadow-md active:scale-95"
              >
                <QrCode className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline text-[11px] font-semibold">AR Mobilus (QR)</span>
              </button>

              {/* Interactive Size Recommendation Tool Shortcut */}
              <button
                type="button"
                onClick={() => setIsSizeRecommenderOpen(true)}
                title="Rasti tobulą dydį pagal kūno matmenis (Interactive Size Finder)"
                className="p-2.5 rounded-lg border border-neutral-700/80 bg-neutral-900/90 hover:bg-neutral-800 text-neutral-300 hover:text-white text-xs font-mono transition-all flex items-center gap-1.5 backdrop-blur-md cursor-pointer active:scale-95"
              >
                <Ruler className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline text-[11px]">Dydžio Rekomendacija</span>
              </button>

              {/* Notes & Comments Quick Toggle */}
              <button
                onClick={() => setActiveTab('comments')}
                title="Dizaino pastabos ir komentarai (Firestore)"
                className={`p-2.5 rounded-lg border text-xs font-mono transition-all flex items-center gap-1.5 backdrop-blur-md ${
                  activeTab === 'comments'
                    ? 'bg-amber-400 text-neutral-950 font-bold border-amber-300 shadow-md'
                    : 'bg-neutral-900/80 border-neutral-700/80 text-neutral-300 hover:text-white hover:bg-neutral-800'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline text-[11px]">Pastabos</span>
              </button>

              {/* Graphic & Pattern Layers Quick Toggle */}
              <button
                onClick={() => setActiveTab('layers')}
                title="Atidaryti grafikos ir raštų sluoksnių valdymą"
                className={`p-2.5 rounded-lg border text-xs font-mono transition-all flex items-center gap-1.5 backdrop-blur-md ${
                  activeTab === 'layers'
                    ? 'bg-amber-400 text-neutral-950 font-bold border-amber-300 shadow-md'
                    : 'bg-neutral-900/80 border-neutral-700/80 text-neutral-300 hover:text-white hover:bg-neutral-800'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span className="hidden sm:inline text-[11px]">Sluoksniai</span>
              </button>

              {/* Macro Zoom Close-up Shortcut */}
              <button
                onClick={() =>
                  setCustomization((c) => ({
                    ...c,
                    cameraPreset: c.cameraPreset === 'detail' ? 'front' : 'detail',
                  }))
                }
                title="Priartinti iki mažiausių siūlių ir audinio"
                className={`p-2.5 rounded-lg border text-xs font-mono transition-all flex items-center gap-1.5 backdrop-blur-md ${
                  customization.cameraPreset === 'detail'
                    ? 'bg-amber-500/20 border-amber-500/60 text-amber-300'
                    : 'bg-neutral-900/80 border-neutral-700/80 text-neutral-300 hover:text-white hover:bg-neutral-800'
                }`}
              >
                <ZoomIn className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline text-[11px]">Mikro detalė</span>
              </button>

              {/* Turntable Auto-Rotate */}
              <button
                onClick={() => setCustomization((c) => ({ ...c, autoRotate: !c.autoRotate }))}
                title="Sukti drabužį"
                className={`p-2.5 rounded-lg border text-xs font-mono transition-all flex items-center gap-1.5 backdrop-blur-md ${
                  customization.autoRotate
                    ? 'bg-amber-500/20 border-amber-500/60 text-amber-300'
                    : 'bg-neutral-900/80 border-neutral-700/80 text-neutral-300 hover:text-white hover:bg-neutral-800'
                }`}
              >
                <RefreshCw className={`w-3.5 h-3.5 ${customization.autoRotate ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline text-[11px]">Rotacija</span>
              </button>

              {/* Exploded Construction View */}
              <button
                onClick={() => setCustomization((c) => ({ ...c, exploded: !c.exploded }))}
                title="Atskirti rankoves ir pamušalą (Išskleistas vaizdas)"
                className={`p-2.5 rounded-lg border text-xs font-mono transition-all flex items-center gap-1.5 backdrop-blur-md ${
                  customization.exploded
                    ? 'bg-sky-500/20 border-sky-500/60 text-sky-300'
                    : 'bg-neutral-900/80 border-neutral-700/80 text-neutral-300 hover:text-white hover:bg-neutral-800'
                }`}
              >
                <Maximize2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline text-[11px]">Konstrukcija</span>
              </button>

              {/* Wireframe Topology */}
              <button
                onClick={() => setCustomization((c) => ({ ...c, wireframe: !c.wireframe }))}
                title="Vielinis 3D karkasas"
                className={`p-2.5 rounded-lg border text-xs font-mono transition-all flex items-center gap-1.5 backdrop-blur-md ${
                  customization.wireframe
                    ? 'bg-emerald-500/20 border-emerald-500/60 text-emerald-300'
                    : 'bg-neutral-900/80 border-neutral-700/80 text-neutral-300 hover:text-white hover:bg-neutral-800'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span className="hidden sm:inline text-[11px]">Karkasas</span>
              </button>

              {/* Preset Design Templates quick open */}
              <button
                onClick={() => setIsTemplatesModalOpen(true)}
                title="Atidaryti Preset Dizaino Šablonų Biblioteką (Cyberpunk, Minimalist, Floral...)"
                className="p-2.5 rounded-lg border border-amber-500/60 bg-neutral-900/90 text-amber-300 hover:text-white hover:bg-neutral-800 text-xs font-mono transition-all flex items-center gap-1.5 backdrop-blur-md shadow-sm"
              >
                <LayoutTemplate className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline text-[11px]">Šablonai</span>
              </button>

              {/* Lighting Control Panel Trigger */}
              <button
                onClick={() => setIsLightingPanelOpen(true)}
                title="Valdyti 3D apšvietimą (Studio White, Neon Night, Golden Hour ir ryškumą)"
                className="p-2.5 rounded-lg border border-neutral-700/80 bg-neutral-900/80 text-neutral-300 hover:text-white hover:bg-neutral-800 text-xs font-mono transition-all flex items-center gap-1.5 backdrop-blur-md"
              >
                <Sun className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline text-[11px]">
                  {customization.lightingPreset === 'neon-night' || customization.lightingPreset === 'cyber'
                    ? 'Neon Night'
                    : customization.lightingPreset === 'golden-hour'
                    ? 'Golden Hour'
                    : customization.lightingPreset === 'daylight'
                    ? 'Diena'
                    : 'Studio White'}
                </span>
              </button>

              {/* Dynamic Size & Fit Guide Shortcut */}
              <button
                onClick={() => setShowSizeGuide(true)}
                title="Atidaryti Dydžio & Kūno Išmatavimų Gidą (Standartiniai ir Individualūs 3D matmenys)"
                className="p-2.5 rounded-lg border border-neutral-700/80 bg-neutral-900/80 text-neutral-300 hover:text-white hover:bg-neutral-800 text-xs font-mono transition-all flex items-center gap-1.5 backdrop-blur-md"
              >
                <Ruler className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline text-[11px]">
                  {customization.size}
                  {customization.customMeasurements?.isCustomApplied ? ' (3D Fit)' : ''}
                </span>
              </button>

              {/* Hands-Free Voice Commands Integration */}
              <VoiceControlPanel
                customization={customization}
                onChangeCustomization={(updater, desc) => setCustomization(updater, desc)}
                onApplyPresetTemplate={handleApplyPresetTemplate}
                onOpenShareModal={() => setIsShareOpen(true)}
                onOpenARModal={() => setIsAROpen(true)}
                onOpenSizeGuideModal={() => setShowSizeGuide(true)}
                onOpenLightingModal={() => setIsLightingPanelOpen(true)}
                onOpenTemplatesModal={() => setIsTemplatesModalOpen(true)}
                onTriggerSnapshot={handleDownloadSnapshot}
                onUndo={undo}
                onRedo={redo}
                onSaveToWishlist={handleSaveToWishlist}
                onOpenWishlist={onOpenWishlist}
                onOpenCompare={() => onOpenCompare?.()}
              />

              {/* Wishlist Button */}
              <button
                onClick={handleSaveToWishlist}
                title={isWishlisted ? "Modelis išsaugotas į Wishlist" : "Išsaugoti šį 3D drabužį į Wishlist"}
                className={`p-2.5 rounded-lg border text-xs font-mono font-medium transition-all flex items-center gap-1.5 shadow-lg active:scale-95 cursor-pointer backdrop-blur-md ${
                  isWishlisted
                    ? 'border-rose-500/80 bg-rose-500/20 text-rose-300 ring-1 ring-rose-500/40'
                    : 'border-neutral-700/80 bg-neutral-900/85 hover:bg-neutral-800 text-neutral-300 hover:text-white'
                }`}
              >
                <Heart className={`w-3.5 h-3.5 ${isWishlisted ? 'text-rose-400 fill-rose-400' : 'text-rose-400'}`} />
                <span className="text-[11px] font-bold">Wishlist</span>
              </button>

              {/* Side-by-Side Compare Button */}
              <button
                onClick={() => onOpenCompare?.()}
                title="Palyginti 2 modelius vienas šalia kito (Side-by-Side)"
                className="p-2.5 rounded-lg border border-amber-500/80 bg-neutral-900/85 hover:bg-neutral-800 text-amber-300 hover:text-white text-xs font-mono font-medium transition-all flex items-center gap-1.5 shadow-lg active:scale-95 cursor-pointer backdrop-blur-md"
              >
                <Scale className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-[11px] font-bold">Palyginti</span>
              </button>

              {/* Interactive Fabric Swatches Loupe Button */}
              <button
                onClick={() => setIsFabricModalOpen(true)}
                title="Detali audinių mikro-tekstūros ir pynimo apžiūra (Šilkas, Džinsas, Vilna)"
                className="p-2.5 rounded-lg border border-purple-500/80 bg-neutral-900/85 hover:bg-neutral-800 text-purple-300 hover:text-white text-xs font-mono font-medium transition-all flex items-center gap-1.5 shadow-lg active:scale-95 cursor-pointer backdrop-blur-md"
              >
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                <span className="text-[11px] font-bold">Audiniai</span>
              </button>

              {/* AI Style Consultant Button */}
              <button
                type="button"
                onClick={() => setIsAIStyleConsultantOpen(true)}
                title="AI Style Consultant: Aprangos analizė su Gemini API ir derantys katalogo aksesuarai"
                className="p-2.5 rounded-xl border border-[#d4af37]/70 bg-gradient-to-r from-[#d4af37]/25 via-amber-600/20 to-[#d4af37]/15 hover:from-[#d4af37]/40 hover:to-amber-500/30 text-[#f5e6b8] text-xs font-mono font-bold transition-all flex items-center gap-1.5 shadow-lg shadow-[#d4af37]/15 active:scale-95 cursor-pointer backdrop-blur-md ring-1 ring-[#d4af37]/30"
              >
                <Wand2 className="w-3.5 h-3.5 text-[#d4af37] animate-pulse" />
                <span className="text-[11px] font-extrabold tracking-wide">AI Style Consultant</span>
              </button>

              {/* 3D Share Reel / Video for TikTok & Instagram */}
              <button
                type="button"
                onClick={() => setIsSocialReelOpen(true)}
                title="Sukurti 9:16 vertikalų video ar istorijos kortelę socialiniams tinklams (TikTok, Instagram Reels)"
                className="p-2.5 rounded-xl border border-pink-500/70 bg-pink-500/15 hover:bg-pink-500/25 text-pink-300 text-xs font-mono font-bold transition-all flex items-center gap-1.5 shadow-lg active:scale-95 cursor-pointer backdrop-blur-md"
              >
                <Video className="w-3.5 h-3.5 text-pink-400" />
                <span className="text-[11px]">Reels / Video</span>
              </button>

              {/* Mobile-Friendly AR View Button */}
              <button
                onClick={() => setIsAROpen(true)}
                title="Pamatyti drabužį savo kambaryje (Papildyta realybė & Kamera)"
                className="p-2.5 rounded-lg border border-cyan-400/90 bg-gradient-to-r from-cyan-500/25 via-blue-500/20 to-cyan-400/20 hover:from-cyan-500/40 hover:to-blue-500/30 text-cyan-300 hover:text-white text-xs font-mono font-bold transition-all flex items-center gap-1.5 shadow-lg shadow-cyan-400/20 active:scale-95 cursor-pointer ring-1 ring-cyan-400/40 backdrop-blur-md"
              >
                <Glasses className="w-3.5 h-3.5 text-cyan-300" />
                <span className="text-[11px] font-extrabold tracking-wide">AR View</span>
              </button>

              {/* Social Share & 2D Snapshot Modal (Instagram, Pinterest, X) */}
              <button
                onClick={() => setIsShareOpen(true)}
                title="Eksportuoti ir dalintis 2D nuotrauka tiesiogiai į Instagram ar Pinterest"
                className="p-2.5 rounded-lg border border-amber-500/80 bg-gradient-to-r from-amber-400 to-yellow-400 text-neutral-950 hover:from-amber-300 hover:to-yellow-300 text-xs font-mono font-bold transition-all flex items-center gap-1.5 shadow-lg shadow-amber-400/25 active:scale-95 cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span className="text-[11px]">Dalintis</span>
              </button>

              {/* Direct 4K Clean Snapshot Download */}
              <button
                onClick={() => handleDownloadSnapshot(true)}
                disabled={snapshotLoading}
                title="Išsaugoti 4K Ultra-HD 3D kadrą be jokių UI elementų"
                className="p-2.5 rounded-lg border border-neutral-700/80 bg-neutral-900/80 text-neutral-300 hover:text-white hover:bg-neutral-800 text-xs font-mono transition-all flex items-center gap-1.5 backdrop-blur-md cursor-pointer"
              >
                <Camera className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline text-[11px] font-bold">4K Foto</span>
              </button>
            </div>
          </div>

          {/* Bottom Info Strip */}
          <div className="px-4 py-3 bg-neutral-950/70 border-t border-neutral-800/60 flex flex-wrap items-center justify-between gap-3 text-xs text-neutral-400">
            <div className="flex items-center gap-2">
              <span className="text-white font-medium">{selectedProduct.name}</span>
              <span>·</span>
              <span>Audinys: {currentFabric.nameLt}</span>
              <span>·</span>
              <span>Dydis: {customization.size}</span>
            </div>
            <div className="flex items-center gap-2 text-neutral-400 font-mono text-[11px]">
              <Compass className="w-3 h-3 text-amber-400" />
              <span>Realistinis audinio kritimas & 360° apžiūra</span>
            </div>
          </div>
        </div>

        {/* Right: Customization Controls Panel (5 cols) */}
        <div className="lg:col-span-5 xl:col-span-5 flex flex-col gap-4">
          {/* Action History / Undo-Redo Toolbar */}
          <div className="flex items-center justify-between px-3.5 py-2.5 bg-neutral-900/90 rounded-xl border border-neutral-800 text-xs shadow-sm">
            <div className="flex items-center gap-2 min-w-0">
              <History className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <div className="flex items-baseline gap-1.5 min-w-0">
                <span className="text-neutral-300 font-medium text-[11px] truncate">
                  {currentActionLabel || 'Dizaino veiksmai'}
                </span>
                <span className="text-[10px] font-mono text-neutral-500 shrink-0">
                  ({currentIndex + 1} / {historyLength})
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={undo}
                disabled={!canUndo}
                title="Atšaukti paskutinį veiksmą (Ctrl + Z)"
                className={`px-2.5 py-1 rounded-lg text-xs font-mono flex items-center gap-1 transition ${
                  canUndo
                    ? 'bg-neutral-800 border border-neutral-700 text-neutral-200 hover:text-white hover:bg-neutral-700 cursor-pointer shadow-sm'
                    : 'bg-neutral-900/40 text-neutral-600 border border-transparent cursor-not-allowed opacity-50'
                }`}
              >
                <Undo2 className="w-3 h-3 text-amber-400" />
                <span>Atšaukti</span>
              </button>
              <button
                onClick={redo}
                disabled={!canRedo}
                title="Grąžinti atšauktą veiksmą (Ctrl + Y arba Ctrl + Shift + Z)"
                className={`px-2.5 py-1 rounded-lg text-xs font-mono flex items-center gap-1 transition ${
                  canRedo
                    ? 'bg-neutral-800 border border-neutral-700 text-neutral-200 hover:text-white hover:bg-neutral-700 cursor-pointer shadow-sm'
                    : 'bg-neutral-900/40 text-neutral-600 border border-transparent cursor-not-allowed opacity-50'
                }`}
              >
                <Redo2 className="w-3 h-3 text-amber-400" />
                <span>Grąžinti</span>
              </button>
              <button
                onClick={() => resetToInitial(selectedProduct)}
                title="Atstatyti viską į pradinę gaminio būseną"
                className="p-1.5 rounded-lg border border-neutral-800 bg-neutral-950 text-neutral-400 hover:text-amber-400 hover:border-neutral-700 transition"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Customizer Tabs */}
          <div className="flex items-center gap-1 p-1 bg-neutral-900 rounded-xl border border-neutral-800 overflow-x-auto scrollbar-none">
            <button
              onClick={() => setActiveTab('draw')}
              className={`px-3 py-2 text-xs font-medium rounded-lg transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap shrink-0 ${
                activeTab === 'draw'
                  ? 'bg-amber-400 text-neutral-950 font-semibold shadow'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Feather className="w-3.5 h-3.5" />
              <span>Siuvimas & Canva</span>
            </button>
            <button
              onClick={() => setActiveTab('templates')}
              className={`px-3 py-2 text-xs font-medium rounded-lg transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap shrink-0 ${
                activeTab === 'templates'
                  ? 'bg-amber-400 text-neutral-950 font-semibold shadow'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <LayoutTemplate className="w-3.5 h-3.5" />
              <span>Šablonai</span>
              <span
                className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full ${
                  activeTab === 'templates'
                    ? 'bg-neutral-950 text-amber-400 font-bold'
                    : 'bg-amber-400/20 text-amber-400 font-bold'
                }`}
              >
                6
              </span>
            </button>
            <button
              onClick={() => setActiveTab('layers')}
              className={`px-3 py-2 text-xs font-medium rounded-lg transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap shrink-0 ${
                activeTab === 'layers'
                  ? 'bg-amber-400 text-neutral-950 font-semibold shadow'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Sluoksniai</span>
              <span
                className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full ${
                  activeTab === 'layers'
                    ? 'bg-neutral-950 text-amber-400 font-bold'
                    : 'bg-neutral-800 text-neutral-400'
                }`}
              >
                {currentLayers.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('patterns')}
              className={`px-3 py-2 text-xs font-medium rounded-lg transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap shrink-0 ${
                activeTab === 'patterns'
                  ? 'bg-amber-400 text-neutral-950 font-semibold shadow'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
              <span>Raštai (Patterns)</span>
            </button>
            <button
              onClick={() => setActiveTab('macro')}
              className={`px-3 py-2 text-xs font-medium rounded-lg transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap shrink-0 ${
                activeTab === 'macro'
                  ? 'bg-amber-400 text-neutral-950 font-semibold shadow'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <ZoomIn className="w-3.5 h-3.5" />
              <span>Makro Žvilgsnis</span>
            </button>
            <button
              onClick={() => setActiveTab('colors')}
              className={`px-3 py-2 text-xs font-medium rounded-lg transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap shrink-0 ${
                activeTab === 'colors' ? 'bg-neutral-800 text-white shadow-sm' : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Spalvos</span>
            </button>
            <button
              onClick={() => setActiveTab('fabrics')}
              className={`px-3 py-2 text-xs font-medium rounded-lg transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap shrink-0 ${
                activeTab === 'fabrics' ? 'bg-neutral-800 text-white shadow-sm' : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Audiniai</span>
            </button>
            <button
              onClick={() => setActiveTab('fit')}
              className={`px-3 py-2 text-xs font-medium rounded-lg transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap shrink-0 ${
                activeTab === 'fit'
                  ? 'bg-amber-400 text-neutral-950 font-bold shadow'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Ruler className="w-3.5 h-3.5" />
              <span>Dydis & Fit</span>
              {customization.customMeasurements?.isCustomApplied && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('comments')}
              className={`px-3 py-2 text-xs font-medium rounded-lg transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap shrink-0 ${
                activeTab === 'comments'
                  ? 'bg-amber-400 text-neutral-950 font-bold shadow'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Pastabos</span>
              {matchingWishlistItem && (
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              )}
            </button>
          </div>

          {/* Tab: Preset Design Templates Library */}
          {activeTab === 'templates' && (
            <PresetTemplatesLibrary
              isInlineTab={true}
              activeTemplateId={activeTemplateId}
              onApplyTemplate={handleApplyPresetTemplate}
            />
          )}

          {/* Tab: Layer Management System */}
          {activeTab === 'layers' && (
            <LayerManager
              layers={customization.layers || currentLayers}
              patternConfig={customization.pattern}
              primaryGarmentColor={customization.primaryColor}
              accentGarmentColor={customization.accentColor}
              onChangeLayers={handleUpdateLayers}
              onChangePattern={handleUpdatePattern}
              onOpenCanva={() => setIsCanvaOpen(true)}
            />
          )}

          {/* Tab 1: Interactive Drawing & Sewing Studio with Canva Launcher */}
          {activeTab === 'draw' && (
            <div className="flex flex-col gap-3">
              {/* Canva Graphic Studio Launcher Banner */}
              <button
                onClick={() => setIsCanvaOpen(true)}
                className="w-full py-4 px-4 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-300 hover:from-amber-500 hover:to-yellow-500 text-neutral-950 font-bold text-xs flex items-center justify-between shadow-xl shadow-amber-400/20 hover:scale-[1.01] transition-all cursor-pointer border border-amber-300"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-neutral-950 text-amber-400 flex items-center justify-center font-bold">
                    <LayoutTemplate className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <div className="font-extrabold text-sm leading-tight text-neutral-950">
                      Atidaryti Canva Drabužių Studiją
                    </div>
                    <div className="text-[11px] text-neutral-800 font-normal">
                      Figūros, Lipdukai, Lenktas tekstas, Laisvas piešimas & Šablonai
                    </div>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-lg bg-neutral-950 text-amber-400 text-[10px] font-mono font-bold tracking-wider uppercase">
                  HD Canva
                </span>
              </button>

              {/* Preset Design Templates Quick Banner */}
              <button
                onClick={() => setIsTemplatesModalOpen(true)}
                className="w-full py-2.5 px-3.5 rounded-xl bg-neutral-900/90 border border-neutral-800 hover:border-amber-400/60 hover:bg-neutral-850 text-neutral-200 text-xs flex items-center justify-between transition cursor-pointer group"
              >
                <div className="flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400 group-hover:rotate-12 transition-transform" />
                  <span className="font-semibold text-white">Preset Dizaino Šablonų Biblioteka</span>
                  <span className="text-[11px] text-neutral-400 hidden sm:inline">
                    (Cyberpunk, Minimalist, Floral, Streetwear)
                  </span>
                </div>
                <span className="text-[10px] font-mono text-amber-400 font-bold group-hover:translate-x-0.5 transition-transform">
                  Atverti 6 šablonus →
                </span>
              </button>

              <DrawingStudio
                onTextureUpdate={(canvas) => setActiveDrawingCanvas(canvas, 'Nupieštas siuvinėjimas')}
                primaryGarmentColor={customization.primaryColor}
              />
            </div>
          )}

          {/* Tab 2: Custom Pattern Tool */}
          {activeTab === 'patterns' && (
            <PatternTool
              patternConfig={customization.pattern}
              onChangePattern={(pat) => handleUpdatePattern(pat, 'Pakeistas audinio raštas')}
              baseColor={customization.primaryColor}
            />
          )}

          {/* Tab 3: Macro View Feature */}
          {activeTab === 'macro' && (
            <MacroViewControls
              activeZone={customization.macroZone}
              onSelectZone={(zone) => setCustomization((c) => ({ ...c, macroZone: zone }), 'Makro detalė')}
              fabricName={currentFabric.nameLt}
            />
          )}

          {/* Tab 2: Colors & Parts */}
          {activeTab === 'colors' && (
            <div className="bg-neutral-900/60 p-5 rounded-2xl border border-neutral-800 flex flex-col gap-5">
              {/* Primary Color */}
              <div>
                <div className="flex items-center justify-between text-xs mb-2.5">
                  <span className="font-semibold text-neutral-200">1. Pagrindinis audinys</span>
                  <span className="text-neutral-400 font-mono">
                    {COLOR_PALETTE.find((c) => c.hex.toLowerCase() === customization.primaryColor.toLowerCase())?.nameLt ||
                      customization.primaryColor}
                  </span>
                </div>
                <div className="grid grid-cols-6 gap-2">
                  {COLOR_PALETTE.map((color) => {
                    const isSelected = customization.primaryColor.toLowerCase() === color.hex.toLowerCase();
                    return (
                      <button
                        key={color.hex}
                        onClick={() => setCustomization((c) => ({ ...c, primaryColor: color.hex }), `Audinio spalva: ${color.nameLt}`)}
                        title={color.nameLt}
                        className={`h-8 rounded-lg border transition-transform flex items-center justify-center ${
                          isSelected ? 'scale-110 border-white ring-2 ring-white/20' : 'border-neutral-700 hover:scale-105'
                        }`}
                        style={{ backgroundColor: color.hex }}
                      >
                        {isSelected && <Check className={`w-3.5 h-3.5 ${color.hex === '#e2dfd8' ? 'text-black' : 'text-white'}`} />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Secondary Color (Ribbing, Sleeves) */}
              <div className="pt-3 border-t border-neutral-800">
                <div className="flex items-center justify-between text-xs mb-2.5">
                  <span className="font-semibold text-neutral-200">2. Rankogaliai, gobtuvas ir apačia</span>
                  <span className="text-neutral-400 font-mono">
                    {COLOR_PALETTE.find((c) => c.hex.toLowerCase() === customization.secondaryColor.toLowerCase())?.nameLt ||
                      customization.secondaryColor}
                  </span>
                </div>
                <div className="grid grid-cols-6 gap-2">
                  {COLOR_PALETTE.map((color) => {
                    const isSelected = customization.secondaryColor.toLowerCase() === color.hex.toLowerCase();
                    return (
                      <button
                        key={color.hex}
                        onClick={() => setCustomization((c) => ({ ...c, secondaryColor: color.hex }), `Detalių spalva: ${color.nameLt}`)}
                        title={color.nameLt}
                        className={`h-8 rounded-lg border transition-transform flex items-center justify-center ${
                          isSelected ? 'scale-110 border-white ring-2 ring-white/20' : 'border-neutral-700 hover:scale-105'
                        }`}
                        style={{ backgroundColor: color.hex }}
                      >
                        {isSelected && <Check className={`w-3.5 h-3.5 ${color.hex === '#e2dfd8' ? 'text-black' : 'text-white'}`} />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Accent Color (Strings, Pocket Trim) */}
              <div className="pt-3 border-t border-neutral-800">
                <div className="flex items-center justify-between text-xs mb-2.5">
                  <span className="font-semibold text-neutral-200">3. Virvelės ir kišenės siūlės</span>
                  <span className="text-neutral-400 font-mono">
                    {COLOR_PALETTE.find((c) => c.hex.toLowerCase() === customization.accentColor.toLowerCase())?.nameLt ||
                      customization.accentColor}
                  </span>
                </div>
                <div className="grid grid-cols-6 gap-2">
                  {COLOR_PALETTE.map((color) => {
                    const isSelected = customization.accentColor.toLowerCase() === color.hex.toLowerCase();
                    return (
                      <button
                        key={color.hex}
                        onClick={() => setCustomization((c) => ({ ...c, accentColor: color.hex }), `Virvelių spalva: ${color.nameLt}`)}
                        title={color.nameLt}
                        className={`h-8 rounded-lg border transition-transform flex items-center justify-center ${
                          isSelected ? 'scale-110 border-white ring-2 ring-white/20' : 'border-neutral-700 hover:scale-105'
                        }`}
                        style={{ backgroundColor: color.hex }}
                      >
                        {isSelected && <Check className={`w-3.5 h-3.5 ${color.hex === '#e2dfd8' ? 'text-black' : 'text-white'}`} />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Hardware Finish */}
              <div className="pt-3 border-t border-neutral-800">
                <div className="flex items-center justify-between text-xs mb-2.5">
                  <span className="font-semibold text-neutral-200">4. Užtrauktukų ir antgalių metalas</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {HARDWARE_COLORS.map((hw) => {
                    const isSelected = customization.hardwareColor === hw.hex;
                    return (
                      <button
                        key={hw.hex}
                        onClick={() => setCustomization((c) => ({ ...c, hardwareColor: hw.hex }), `Metalas: ${hw.nameLt}`)}
                        className={`p-2.5 rounded-lg border text-left text-xs transition-colors flex items-center gap-2 ${
                          isSelected ? 'border-amber-500 bg-amber-500/10 text-white' : 'border-neutral-800 bg-neutral-950 text-neutral-400 hover:text-white'
                        }`}
                      >
                        <span className="w-3.5 h-3.5 rounded-full border border-neutral-600" style={{ backgroundColor: hw.hex }} />
                        <span className="truncate">{hw.nameLt}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: Interactive Fabric Swatch Panel (Silk, Denim, Wool, Cotton, etc.) */}
          {activeTab === 'fabrics' && (
            <div className="bg-neutral-900/60 p-4 sm:p-5 rounded-2xl border border-neutral-800">
              <FabricSwatchPanel
                customization={customization}
                onChangeCustomization={(updater, desc) => setCustomization(updater, desc)}
              />
            </div>
          )}

          {/* Tab 4: Dynamic Size & Fit Guide */}
          {activeTab === 'fit' && (
            <div className="bg-neutral-900/70 p-5 rounded-2xl border border-neutral-800 shadow-lg flex flex-col gap-4">
              <button
                type="button"
                onClick={() => setIsSizeRecommenderOpen(true)}
                className="w-full py-3.5 px-4 rounded-xl border border-amber-400/50 bg-amber-400/20 hover:bg-amber-400/30 text-amber-300 hover:text-white font-bold text-xs transition flex items-center justify-center gap-2 cursor-pointer shadow-lg active:scale-98"
              >
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Paleisti Interaktyvią Dydžio Rekomendaciją (AI Fit Finder)</span>
              </button>
              <button
                onClick={() => setShowSizeGuide(true)}
                className="w-full py-2.5 px-4 rounded-xl border border-neutral-700 bg-neutral-800/80 hover:bg-neutral-700 text-neutral-200 font-semibold text-xs transition flex items-center justify-center gap-2 cursor-pointer shadow-sm active:scale-98"
              >
                <Ruler className="w-4 h-4 text-amber-400" />
                <span>Atidaryti D3 Kūno Silueto & Dydžių Vizualizaciją (Oversized vs Slim)</span>
              </button>
              <SizeFitGuide
                product={selectedProduct}
                customization={customization}
                onChangeCustomization={(updater, desc) => setCustomization(updater, desc)}
                isModal={false}
              />
            </div>
          )}

          {/* Tab 5: Design Comments & Notes (Firestore Cloud Synchronized) */}
          {activeTab === 'comments' && (
            <DesignCommentsSection
              currentWishlistItem={matchingWishlistItem}
              currentUser={currentUser || null}
              onSaveCurrentDesignToWishlist={handleSaveToWishlist}
            />
          )}

          {/* Pricing & Add to Cart Block */}
          <div className="p-5 bg-neutral-900 rounded-2xl border border-neutral-800 shadow-xl flex flex-col gap-4">
            <SustainabilityScoreIndicator
              fabric={currentFabric}
              manufacturingMethod={manufacturingMethod}
              onChangeManufacturingMethod={(m) => setManufacturingMethod(m)}
              className="w-full justify-between"
            />

            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs text-neutral-400 block">Galutinė kaina:</span>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight tabular-nums">
                    {calculatedPrice} €
                  </span>
                  <span className="text-xs text-emerald-400 font-mono">Normali, prieinama kaina</span>
                </div>
              </div>

              <div className="text-right text-xs text-neutral-400">
                <span>Pristatymas: </span>
                <span className="text-neutral-200 font-mono font-medium">1–2 d.d. (Lietuva)</span>
              </div>
            </div>

            <button
              onClick={handleAddToCartClick}
              className={`w-full py-3.5 px-4 rounded-xl font-medium text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg ${
                addedAnimation
                  ? 'bg-emerald-500 text-black font-semibold'
                  : 'bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold hover:scale-[1.01]'
              }`}
            >
              {addedAnimation ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Įdėta į krepšelį!</span>
                </>
              ) : (
                <>
                  <span>Užsakyti šį drabužį ({calculatedPrice} €)</span>
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </button>

            {/* Wishlist & Compare Action Row */}
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={handleSaveToWishlist}
                className={`py-2.5 px-3 rounded-xl border text-xs font-semibold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                  isWishlisted
                    ? 'border-rose-500/80 bg-rose-500/20 text-rose-300'
                    : 'border-neutral-700 bg-neutral-950/80 hover:bg-neutral-800 text-neutral-200'
                }`}
              >
                <Heart className={`w-3.5 h-3.5 ${isWishlisted ? 'text-rose-400 fill-rose-400' : 'text-rose-400'}`} />
                <span className="truncate">{isWishlisted ? 'Wishlist' : 'Į Wishlist'}</span>
              </button>

              <button
                onClick={() => onOpenCompare?.()}
                className="py-2.5 px-3 rounded-xl border border-neutral-700 bg-neutral-950/80 hover:bg-neutral-800 text-neutral-200 hover:text-white text-xs font-semibold transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Scale className="w-3.5 h-3.5 text-amber-400" />
                <span className="truncate">Palyginti</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('comments')}
                className={`py-2.5 px-3 rounded-xl border text-xs font-semibold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeTab === 'comments'
                    ? 'border-amber-400/80 bg-amber-400/20 text-amber-300'
                    : 'border-neutral-700 bg-neutral-950/80 hover:bg-neutral-800 text-neutral-200 hover:text-white'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
                <span className="truncate">Pastabos</span>
              </button>
            </div>

            {/* Seamstress Instructions & Private Notes CTA Button */}
            <button
              type="button"
              onClick={() => setIsSeamstressModalOpen(true)}
              className={`w-full py-2.5 px-3.5 rounded-xl border text-xs font-semibold transition flex items-center justify-between gap-2 cursor-pointer shadow-sm ${
                customization.seamstressNotes ||
                customization.seamstressInstructions?.privateNote ||
                (customization.seamstressInstructions?.sleeveAdjustmentCm ?? 0) !== 0 ||
                (customization.seamstressInstructions?.torsoLengthAdjustmentCm ?? 0) !== 0
                  ? 'border-[#d4af37] bg-[#d4af37]/15 text-[#f5e6b8] ring-1 ring-[#d4af37]/35 shadow-[0_0_15px_rgba(212,175,55,0.15)]'
                  : 'border-neutral-700 bg-neutral-950/80 hover:bg-neutral-800 text-stone-300 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2 truncate">
                <Scissors className="w-4 h-4 text-[#d4af37] shrink-0" />
                <span className="truncate">
                  {customization.seamstressNotes || customization.seamstressInstructions?.privateNote
                    ? `Siuvėjos instrukcija: „${customization.seamstressNotes || customization.seamstressInstructions?.privateNote}“`
                    : 'Pridėti privačią pastabą / instrukciją siuvėjai (Nemokamai)'}
                </span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-stone-900 border border-stone-800 text-[#d4af37] shrink-0">
                {customization.seamstressNotes || customization.seamstressInstructions?.privateNote
                  ? 'Pakeisti ✍️'
                  : '+ Instrukcija'}
              </span>
            </button>

            {/* AR Mobile QR Code Launch CTA Button */}
            <button
              type="button"
              onClick={() => setIsQuickQROpen(true)}
              className="w-full py-2.5 px-4 rounded-xl border border-amber-400/50 bg-gradient-to-r from-amber-950/70 via-neutral-900 to-amber-950/70 hover:from-amber-900/70 hover:to-amber-900/70 text-amber-300 hover:text-white font-semibold text-xs transition flex items-center justify-center gap-2 cursor-pointer shadow-md group"
            >
              <QrCode className="w-3.5 h-3.5 text-amber-400 group-hover:scale-110 transition-transform" />
              <span>Nuskenuoti QR Kodą — Matuotis Telefonu (AR Reali Aplinka)</span>
            </button>

            {/* AR View CTA Button */}
            <button
              onClick={() => setIsAROpen(true)}
              className="w-full py-2.5 px-4 rounded-xl border border-cyan-500/50 bg-gradient-to-r from-cyan-950/60 to-blue-950/60 hover:from-cyan-900/60 hover:to-blue-900/60 text-cyan-300 hover:text-white font-medium text-xs transition flex items-center justify-center gap-2 cursor-pointer shadow-sm group"
            >
              <Glasses className="w-3.5 h-3.5 text-cyan-400 group-hover:scale-110 transition-transform" />
              <span>AR View — Išbandyti drabužį savo kambaryje (Kamera & 1:1 Dydis)</span>
            </button>

            {/* Copy Shareable Link CTA Button */}
            <button
              type="button"
              onClick={handleCopyShareableLink}
              className={`w-full py-2.5 px-4 rounded-xl border text-xs font-semibold transition flex items-center justify-center gap-2 cursor-pointer shadow-md ${
                copiedShareLink
                  ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold'
                  : 'border-amber-400/50 bg-neutral-950/80 hover:bg-neutral-800 text-amber-300 hover:text-white'
              }`}
            >
              {copiedShareLink ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Nuoroda nukopijuota į iškarpinę! (Paruošta dalintis)</span>
                </>
              ) : (
                <>
                  <Link2 className="w-4 h-4 text-amber-400" />
                  <span>Kopijuoti bendrinimo nuorodą (URL su audiniu & 3D nustatymais)</span>
                </>
              )}
            </button>

            {/* Share Design CTA Button */}
            <button
              onClick={() => setIsShareOpen(true)}
              className="w-full py-2.5 px-4 rounded-xl border border-neutral-700 bg-neutral-950/80 hover:bg-neutral-800 text-neutral-200 hover:text-white font-medium text-xs transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5 text-amber-400" />
              <span>Eksportuoti 2D nuotrauką ir dalintis į Instagram / Pinterest</span>
            </button>

            <div className="flex items-center justify-center gap-4 text-xs text-neutral-500 font-mono">
              <span>✓ Natūralus audinys</span>
              <span>·</span>
              <span>✓ Tavo individualus siuvinėjimas</span>
              <span>·</span>
              <span>✓ 30 d. grąžinimas</span>
            </div>
          </div>
        </div>
      </div>

      {/* Canva Graphic Studio Modal */}
      <CanvaDesignModal
        isOpen={isCanvaOpen}
        onClose={() => setIsCanvaOpen(false)}
        onApplyToGarment={(canvas, newPlacement, newElements) => {
          setActiveDrawingCanvas(canvas, 'Pritaikyta Canva grafika');

          let nextLayers = customization.layers || currentLayers;
          if (newElements && newElements.length > 0) {
            const existingPatternLayer = nextLayers.find((l) => l.type === 'pattern');
            const graphicLayers: GarmentLayer[] = newElements.map((el) => ({
              id: `layer-${el.id}`,
              name:
                el.name ||
                (el.type === 'text'
                  ? `Tekstas: "${el.text}"`
                  : el.type === 'shape'
                  ? `Figūra: ${el.shapeType}`
                  : `Emblema: ${el.badgeType || el.type}`),
              type: (el.type === 'text'
                ? 'text'
                : el.type === 'badge'
                ? 'badge'
                : el.type === 'shape'
                ? 'shape'
                : 'image') as LayerType,
              visible: el.visible !== false,
              locked: el.locked === true,
              opacity: el.opacity ?? 1.0,
              element: el,
            }));

            nextLayers = existingPatternLayer ? [...graphicLayers, existingPatternLayer] : graphicLayers;
          }

          if (newPlacement) {
            setCustomization(
              (c) => ({
                ...c,
                layers: nextLayers,
                placement: newPlacement,
                cameraPreset: newPlacement === 'back' ? 'back' : 'front',
              }),
              `Canva grafika (${newPlacement === 'chest' ? 'Priekis' : newPlacement === 'back' ? 'Nugara' : 'Kišenė'})`
            );
          } else {
            setCustomization(
              (c) => ({
                ...c,
                layers: nextLayers,
              }),
              'Pritaikyta Canva grafika'
            );
          }
        }}
        initialElements={
          (customization.layers || currentLayers)
            .filter((l) => l.type !== 'pattern' && l.element)
            .map((l) => l.element!)
        }
        garmentColor={customization.primaryColor}
        initialPlacement={customization.placement}
      />

      {/* 2D Snapshot & Social Media Share Modal */}
      <ShareModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        product={selectedProduct}
        customization={customization}
        fabric={currentFabric}
        price={calculatedPrice}
      />

      {/* Dynamic Size & Fit Guide Modal with D3 Body Mannequin & Sizing Chart */}
      <SizeGuideModal
        isOpen={showSizeGuide}
        onClose={() => setShowSizeGuide(false)}
        product={selectedProduct}
        customization={customization}
        onApplySizeAndFit={(newSize, newFit) => {
          setCustomization(
            (prev) => ({
              ...prev,
              size: newSize,
              fitMode: newFit,
            }),
            `Pritaikytas dydis ${newSize} (${newFit.toUpperCase()})`
          );
        }}
      />

      {/* Preset Design Templates Modal */}
      <PresetTemplatesLibrary
        isOpen={isTemplatesModalOpen}
        onClose={() => setIsTemplatesModalOpen(false)}
        activeTemplateId={activeTemplateId}
        onApplyTemplate={handleApplyPresetTemplate}
      />

      {/* 3D Lighting Control Panel Modal */}
      <LightingControlPanel
        isOpen={isLightingPanelOpen}
        onClose={() => setIsLightingPanelOpen(false)}
        customization={customization}
        onUpdateLighting={handleUpdateLighting}
        onUpdateTheme={handleUpdateTheme}
      />

      {/* Mobile-Friendly Augmented Reality (AR) Overlay Modal */}
      <ARViewModal
        isOpen={isAROpen}
        onClose={() => setIsAROpen(false)}
        product={selectedProduct}
        customization={customization}
        fabric={currentFabric}
        drawingCanvas={activeDrawingCanvas}
        onUpdateLighting={(preset) => handleUpdateLighting(preset)}
      />

      {/* QR Code AR Mobile Launch Modal */}
      <ARQuickQRModal
        isOpen={isQuickQROpen}
        onClose={() => setIsQuickQROpen(false)}
        product={selectedProduct}
        customization={customization}
        fabric={currentFabric}
        onLaunchWebcamAR={() => setIsAROpen(true)}
      />

      {/* Interactive Size Recommendation Tool Modal */}
      <InteractiveSizeRecommender
        isOpen={isSizeRecommenderOpen}
        onClose={() => setIsSizeRecommenderOpen(false)}
        isModal={true}
        product={selectedProduct}
        customization={customization}
        onApplySize={(sz, fit, measurements) => {
          setCustomization(
            (c) => ({
              ...c,
              size: sz,
              fitMode: fit,
              customMeasurements: measurements || c.customMeasurements,
            }),
            `Rekomenduotas dydis: ${sz} (${fit})`
          );
        }}
      />

      {/* Interactive Fabric Swatches & Loupe Modal */}
      {isFabricModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden relative">
            <FabricSwatchPanel
              customization={customization}
              onChangeCustomization={(updater, desc) => setCustomization(updater, desc)}
              isModal={true}
              onClose={() => setIsFabricModalOpen(false)}
            />
          </div>
        </div>
      )}

      {/* AI Style Consultant Modal */}
      <AIStyleConsultantModal
        isOpen={isAIStyleConsultantOpen}
        onClose={() => setIsAIStyleConsultantOpen(false)}
        product={selectedProduct}
        customization={customization}
        activeFabric={currentFabric}
        onApplyStyle={(updated) => {
          setCustomization(
            (c) => ({
              ...c,
              ...updated,
            }),
            'Pritaikytas AI Stiliaus Konsultanto derinys'
          );
        }}
        onAddToCartItem={(itemTitle, price) => {
          onAddToCart(
            selectedProduct,
            customization,
            currentFabric,
            price
          );
          setWishlistToast(`„${itemTitle}“ įdėtas į krepšelį!`);
          setTimeout(() => setWishlistToast(null), 3000);
        }}
      />

      {/* Social Video & 3D Share Reel Modal */}
      <SocialShareReelModal
        isOpen={isSocialReelOpen}
        onClose={() => setIsSocialReelOpen(false)}
        product={selectedProduct}
        customization={customization}
        activeFabric={currentFabric}
        snapshotUrl={(() => {
          try {
            return document.querySelector('canvas')?.toDataURL('image/png') || null;
          } catch {
            return null;
          }
        })()}
      />

      {/* Seamstress Instructions & Tailoring Private Notes Modal */}
      <SeamstressNotesModal
        isOpen={isSeamstressModalOpen}
        onClose={() => setIsSeamstressModalOpen(false)}
        product={selectedProduct}
        fabric={currentFabric}
        customization={customization}
        onSaveInstructions={(instructions, notesText) => {
          setCustomization(
            (c) => ({
              ...c,
              seamstressNotes: notesText,
              seamstressInstructions: instructions,
            }),
            'Išsaugotos siuvėjos instrukcijos'
          );
        }}
      />

      {/* Wishlist Toast Notification */}
      {wishlistToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-neutral-900 border border-rose-500/60 text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-bottom duration-200">
          <div className="w-8 h-8 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 shrink-0">
            <Heart className="w-4 h-4 fill-rose-500" />
          </div>
          <div>
            <div className="text-xs font-bold text-white">{wishlistToast}</div>
            <button
              onClick={() => {
                setWishlistToast(null);
                onOpenWishlist?.();
              }}
              className="text-[11px] text-amber-400 hover:underline font-mono"
            >
              Atidaryti Wishlist sąrašą →
            </button>
          </div>
          <button
            onClick={() => setWishlistToast(null)}
            className="p-1 rounded-lg text-neutral-400 hover:text-white ml-2 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};
