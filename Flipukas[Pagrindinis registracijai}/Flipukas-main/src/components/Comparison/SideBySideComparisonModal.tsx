import React, { useState, useMemo } from 'react';
import {
  Scale,
  X,
  ArrowLeftRight,
  ShoppingBag,
  Eye,
  Check,
  Heart,
  Sliders,
  Sparkles,
  Info,
  Wind,
  Thermometer,
  Layers,
  Sun,
  Shield,
  Feather,
  ExternalLink,
} from 'lucide-react';
import { WishlistItem, Product, CustomizationState, FabricMaterial } from '../../types/clothing';
import { PRODUCTS, FABRICS } from '../../data/products';

export interface ComparisonCandidate {
  id: string;
  label: string;
  sourceType: 'active-lab' | 'wishlist' | 'preset';
  product: Product;
  customization: CustomizationState;
  fabric: FabricMaterial;
  price: number;
  snapshotUrl?: string;
}

interface SideBySideComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeCustomization: CustomizationState;
  activeProduct: Product;
  activeFabric: FabricMaterial;
  activePrice: number;
  wishlistItems: WishlistItem[];
  initialItemA?: WishlistItem | null;
  initialItemB?: WishlistItem | null;
  onLoadInLab: (product: Product, customization: CustomizationState) => void;
  onAddToCart: (
    product: Product,
    customization: CustomizationState,
    fabric: FabricMaterial,
    unitPrice: number
  ) => void;
  onSaveToWishlist: (
    product: Product,
    customization: CustomizationState,
    fabric: FabricMaterial,
    price: number
  ) => void;
}

export const SideBySideComparisonModal: React.FC<SideBySideComparisonModalProps> = ({
  isOpen,
  onClose,
  activeCustomization,
  activeProduct,
  activeFabric,
  activePrice,
  wishlistItems,
  initialItemA,
  initialItemB,
  onLoadInLab,
  onAddToCart,
  onSaveToWishlist,
}) => {
  // Build candidate options list
  const candidates: ComparisonCandidate[] = useMemo(() => {
    const list: ComparisonCandidate[] = [
      {
        id: 'current-active-lab',
        label: `🌟 Dabartinis 3D modelis (${activeProduct.name})`,
        sourceType: 'active-lab',
        product: activeProduct,
        customization: activeCustomization,
        fabric: activeFabric,
        price: activePrice,
      },
    ];

    // Add wishlist items
    wishlistItems.forEach((w) => {
      list.push({
        id: `wish-${w.id}`,
        label: `💖 Wishlist: ${w.title}`,
        sourceType: 'wishlist',
        product: w.product,
        customization: w.customization,
        fabric: w.fabric,
        price: w.price,
        snapshotUrl: w.snapshotUrl,
      });
    });

    // Add default catalog models
    PRODUCTS.forEach((p) => {
      const defaultFab = FABRICS.find((f) => f.id === 'tech-cotton') || FABRICS[0];
      list.push({
        id: `catalog-${p.id}`,
        label: `📦 Katalogo modelis: ${p.name}`,
        sourceType: 'preset',
        product: p,
        customization: {
          primaryColor: p.defaultColors.primary,
          secondaryColor: p.defaultColors.secondary,
          accentColor: p.defaultColors.accent,
          hardwareColor: '#cbd5e1',
          fabricId: defaultFab.id,
          badgeType: 'flipukas',
          customText: 'FLIPUKAS',
          pattern: {
            type: 'none',
            scale: 3,
            primaryColor: p.defaultColors.primary,
            secondaryColor: '#f59e0b',
            opacity: 0.85,
            rotation: 0,
          },
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
        fabric: defaultFab,
        price: p.basePrice,
      });
    });

    return list;
  }, [activeProduct, activeCustomization, activeFabric, activePrice, wishlistItems]);

  // Selected candidates state
  const [candidateAId, setCandidateAId] = useState<string>(() => {
    if (initialItemA) return `wish-${initialItemA.id}`;
    return 'current-active-lab';
  });

  const [candidateBId, setCandidateBId] = useState<string>(() => {
    if (initialItemB) return `wish-${initialItemB.id}`;
    if (wishlistItems.length > 0 && initialItemA?.id !== wishlistItems[0].id) {
      return `wish-${wishlistItems[0].id}`;
    }
    const otherProduct = PRODUCTS.find((p) => p.id !== activeProduct.id) || PRODUCTS[1];
    return `catalog-${otherProduct.id}`;
  });

  // Filter: show only differences toggle
  const [onlyDifferences, setOnlyDifferences] = useState(false);

  if (!isOpen) return null;

  const itemA = candidates.find((c) => c.id === candidateAId) || candidates[0];
  const itemB =
    candidates.find((c) => c.id === candidateBId) ||
    candidates.find((c) => c.id !== candidateAId) ||
    candidates[1];

  const handleSwap = () => {
    const temp = candidateAId;
    setCandidateAId(candidateBId);
    setCandidateBId(temp);
  };

  const priceDiff = itemA.price - itemB.price;

  // Render Visual Spec Card for an item
  const renderVisualCard = (item: ComparisonCandidate, isLeft: boolean) => {
    return (
      <div className="flex flex-col gap-3 p-4 rounded-2xl bg-neutral-950/80 border border-neutral-800">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[11px] font-mono uppercase px-2 py-0.5 rounded-full bg-neutral-800 text-neutral-300 border border-neutral-700">
            {isLeft ? 'Modelis A' : 'Modelis B'}
          </span>
          <span className="text-xs font-mono font-bold text-amber-400">
            {item.price.toFixed(2)} €
          </span>
        </div>

        {/* Thumbnail or Color/Style graphic */}
        <div
          className="relative h-44 rounded-xl overflow-hidden border border-neutral-800 flex items-center justify-center shadow-inner"
          style={{ backgroundColor: `${item.customization.primaryColor}25` }}
        >
          {item.snapshotUrl ? (
            <img
              src={item.snapshotUrl}
              alt={item.product.name}
              className="w-full h-full object-contain p-2"
            />
          ) : (
            <div className="flex flex-col items-center justify-center p-4 text-center">
              <div
                className="w-16 h-16 rounded-2xl border-2 border-white/40 shadow-xl mb-2 flex items-center justify-center"
                style={{ backgroundColor: item.customization.primaryColor }}
              >
                <span className="font-mono text-xs font-bold text-white drop-shadow">
                  {item.customization.size}
                </span>
              </div>
              <span className="text-xs font-bold text-white tracking-wide">
                {item.product.name}
              </span>
              <span className="text-[10px] text-neutral-400 font-mono mt-0.5">
                {item.fabric.nameLt}
              </span>
            </div>
          )}

          {/* Floating Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-neutral-950/80 text-amber-400 border border-neutral-700/80 backdrop-blur-md">
              {item.fabric.badge}
            </span>
          </div>

          <div className="absolute bottom-2 right-2">
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-neutral-950/90 text-white border border-neutral-700 uppercase">
              {item.customization.size} • {item.customization.fitMode}
            </span>
          </div>
        </div>

        <div>
          <h4 className="font-display font-bold text-sm text-white truncate">
            {item.product.name}
          </h4>
          <p className="text-xs text-neutral-400 truncate">
            {item.product.categoryLt}
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="grid grid-cols-2 gap-2 pt-1 border-t border-neutral-800/80">
          <button
            onClick={() => {
              onLoadInLab(item.product, item.customization);
              onClose();
            }}
            className="py-2 px-2.5 rounded-xl text-xs font-semibold bg-neutral-900 hover:bg-neutral-800 text-neutral-200 hover:text-white border border-neutral-700 transition flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5 text-cyan-400" />
            <span className="truncate">Atidaryti 3D Lab</span>
          </button>

          <button
            onClick={() => {
              onAddToCart(item.product, item.customization, item.fabric, item.price);
              onClose();
            }}
            className="py-2 px-2.5 rounded-xl text-xs font-bold bg-amber-400 hover:bg-amber-300 text-neutral-950 transition flex items-center justify-center gap-1.5 shadow-md shadow-amber-400/20 active:scale-95 cursor-pointer"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span className="truncate">Į krepšelį</span>
          </button>
        </div>
      </div>
    );
  };

  // Helper row renderer with difference checking
  const renderComparisonRow = (
    label: string,
    valA: React.ReactNode,
    valB: React.ReactNode,
    rawValA: any,
    rawValB: any,
    icon?: React.ReactNode
  ) => {
    const isDifferent = String(rawValA) !== String(rawValB);

    if (onlyDifferences && !isDifferent) return null;

    return (
      <tr
        className={`border-b border-neutral-800/60 transition ${
          isDifferent ? 'bg-amber-400/[0.03]' : 'bg-transparent'
        }`}
      >
        <td className="py-3 px-4 text-xs font-medium text-neutral-400 w-1/3">
          <div className="flex items-center gap-1.5">
            {icon}
            <span>{label}</span>
            {isDifferent && (
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" title="Skiriasi" />
            )}
          </div>
        </td>
        <td
          className={`py-3 px-4 text-xs font-mono w-1/3 ${
            isDifferent ? 'text-amber-200 font-semibold' : 'text-neutral-300'
          }`}
        >
          {valA}
        </td>
        <td
          className={`py-3 px-4 text-xs font-mono w-1/3 ${
            isDifferent ? 'text-amber-200 font-semibold' : 'text-neutral-300'
          }`}
        >
          {valB}
        </td>
      </tr>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-neutral-950/85 backdrop-blur-md transition-opacity"
      />

      {/* Main Container */}
      <div className="relative w-full max-w-5xl bg-neutral-900 border border-neutral-800 rounded-3xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-5 border-b border-neutral-800 flex items-center justify-between gap-4 bg-neutral-950/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-bold text-lg text-white">
                Side-by-Side 3D Drabužių Lyginimas
              </h3>
              <p className="text-xs text-neutral-400">
                Tiesioginis dviejų konfigūracijų palyginimas: kaina, audiniai, spalvos ir kirpimas
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Differences toggle */}
            <button
              onClick={() => setOnlyDifferences(!onlyDifferences)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition flex items-center gap-1.5 ${
                onlyDifferences
                  ? 'bg-amber-400 text-neutral-950 font-bold'
                  : 'bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-700'
              }`}
            >
              <span>{onlyDifferences ? 'Rodyti visus parametrus' : 'Rodyti tik skirtumus'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Candidate Selectors Bar */}
        <div className="px-6 py-3 bg-neutral-950/60 border-b border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Select A */}
          <div className="w-full sm:flex-1">
            <label className="text-[10px] font-mono uppercase text-neutral-400 block mb-1">
              Pasirinkite Modelį A:
            </label>
            <select
              value={candidateAId}
              onChange={(e) => setCandidateAId(e.target.value)}
              className="w-full bg-neutral-900 text-xs text-neutral-200 px-3 py-2 rounded-xl border border-neutral-700 focus:outline-none focus:border-amber-400"
            >
              {candidates.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label} ({c.price.toFixed(2)} €)
                </option>
              ))}
            </select>
          </div>

          {/* Swap Button */}
          <button
            onClick={handleSwap}
            title="Sukeisti modelius vietomis"
            className="p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white border border-neutral-700 transition shrink-0 active:scale-95 cursor-pointer"
          >
            <ArrowLeftRight className="w-4 h-4 text-amber-400" />
          </button>

          {/* Select B */}
          <div className="w-full sm:flex-1">
            <label className="text-[10px] font-mono uppercase text-neutral-400 block mb-1">
              Pasirinkite Modelį B:
            </label>
            <select
              value={candidateBId}
              onChange={(e) => setCandidateBId(e.target.value)}
              className="w-full bg-neutral-900 text-xs text-neutral-200 px-3 py-2 rounded-xl border border-neutral-700 focus:outline-none focus:border-amber-400"
            >
              {candidates.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label} ({c.price.toFixed(2)} €)
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
          {/* Top Visual Cards Side-by-Side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {renderVisualCard(itemA, true)}
            {renderVisualCard(itemB, false)}
          </div>

          {/* Price Difference Highlight Banner */}
          <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold font-mono text-xs">
                Δ €
              </div>
              <div>
                <span className="text-xs text-neutral-400 block">Kainų palyginimas:</span>
                <span className="text-sm font-bold text-white">
                  {priceDiff === 0 ? (
                    'Abu modeliai kainuoja vienodai'
                  ) : priceDiff > 0 ? (
                    <>
                      Modelis A yra <strong className="text-amber-400 font-mono">+{priceDiff.toFixed(2)} €</strong> brangesnis už Modelį B
                    </>
                  ) : (
                    <>
                      Modelis A yra <strong className="text-emerald-400 font-mono">{Math.abs(priceDiff).toFixed(2)} €</strong> pigesnis už Modelį B
                    </>
                  )}
                </span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-xs text-neutral-400 block">Kainų skirtumas:</span>
              <span className="text-base font-mono font-bold text-amber-400">
                {Math.abs(priceDiff).toFixed(2)} €
              </span>
            </div>
          </div>

          {/* Detailed Specification Comparison Table */}
          <div className="rounded-2xl border border-neutral-800 overflow-hidden bg-neutral-950/60 shadow-lg">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-neutral-900/80 border-b border-neutral-800 text-neutral-400 text-[11px] font-mono uppercase tracking-wider">
                  <th className="py-3 px-4 w-1/3">Parametras</th>
                  <th className="py-3 px-4 w-1/3 text-white font-bold">{itemA.product.name}</th>
                  <th className="py-3 px-4 w-1/3 text-white font-bold">{itemB.product.name}</th>
                </tr>
              </thead>
              <tbody>
                {/* 1. PRICE SECTION */}
                <tr className="bg-neutral-900/40 border-b border-neutral-800">
                  <td colSpan={3} className="py-2 px-4 text-[10px] font-mono uppercase tracking-widest text-amber-400 font-bold">
                    1. Kainodara & Vertė
                  </td>
                </tr>
                {renderComparisonRow(
                  'Galutinė Kaina',
                  `${itemA.price.toFixed(2)} €`,
                  `${itemB.price.toFixed(2)} €`,
                  itemA.price,
                  itemB.price
                )}
                {renderComparisonRow(
                  'Bazinė gaminio kaina',
                  `${itemA.product.basePrice.toFixed(2)} €`,
                  `${itemB.product.basePrice.toFixed(2)} €`,
                  itemA.product.basePrice,
                  itemB.product.basePrice
                )}
                {renderComparisonRow(
                  'Audinio priedas',
                  itemA.fabric.priceDelta > 0 ? `+${itemA.fabric.priceDelta} €` : 'Bazinė (0 €)',
                  itemB.fabric.priceDelta > 0 ? `+${itemB.fabric.priceDelta} €` : 'Bazinė (0 €)',
                  itemA.fabric.priceDelta,
                  itemB.fabric.priceDelta
                )}

                {/* 2. FABRIC & TEXTILE SECTION */}
                <tr className="bg-neutral-900/40 border-b border-neutral-800">
                  <td colSpan={3} className="py-2 px-4 text-[10px] font-mono uppercase tracking-widest text-amber-400 font-bold">
                    2. Audinys & Tekstilės Technologija
                  </td>
                </tr>
                {renderComparisonRow(
                  'Audinio Pavadinimas',
                  itemA.fabric.nameLt,
                  itemB.fabric.nameLt,
                  itemA.fabric.id,
                  itemB.fabric.id,
                  <Layers className="w-3.5 h-3.5 text-amber-400" />
                )}
                {renderComparisonRow(
                  'Pynimo / Tekstūros Tipas',
                  itemA.fabric.textureType,
                  itemB.fabric.textureType,
                  itemA.fabric.textureType,
                  itemB.fabric.textureType
                )}
                {renderComparisonRow(
                  'Svoris / Tankis (GSM)',
                  itemA.fabric.gsm ? `${itemA.fabric.gsm} g/m²` : '380 g/m²',
                  itemB.fabric.gsm ? `${itemB.fabric.gsm} g/m²` : '380 g/m²',
                  itemA.fabric.gsm,
                  itemB.fabric.gsm
                )}
                {renderComparisonRow(
                  'Kvėpavimas',
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <span
                        key={i}
                        className={`w-2 h-2 rounded-full ${
                          i < (itemA.fabric.breathability || 4) ? 'bg-cyan-400' : 'bg-neutral-800'
                        }`}
                      />
                    ))}
                  </div>,
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <span
                        key={i}
                        className={`w-2 h-2 rounded-full ${
                          i < (itemB.fabric.breathability || 4) ? 'bg-cyan-400' : 'bg-neutral-800'
                        }`}
                      />
                    ))}
                  </div>,
                  itemA.fabric.breathability,
                  itemB.fabric.breathability,
                  <Wind className="w-3.5 h-3.5 text-cyan-400" />
                )}
                {renderComparisonRow(
                  'Šilumos Izoliacija',
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <span
                        key={i}
                        className={`w-2 h-2 rounded-full ${
                          i < (itemA.fabric.warmth || 4) ? 'bg-rose-400' : 'bg-neutral-800'
                        }`}
                      />
                    ))}
                  </div>,
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <span
                        key={i}
                        className={`w-2 h-2 rounded-full ${
                          i < (itemB.fabric.warmth || 4) ? 'bg-rose-400' : 'bg-neutral-800'
                        }`}
                      />
                    ))}
                  </div>,
                  itemA.fabric.warmth,
                  itemB.fabric.warmth,
                  <Thermometer className="w-3.5 h-3.5 text-rose-400" />
                )}
                {renderComparisonRow(
                  'Kritimas & Pojūtis',
                  itemA.fabric.drape || 'Minkštas',
                  itemB.fabric.drape || 'Minkštas',
                  itemA.fabric.drape,
                  itemB.fabric.drape,
                  <Feather className="w-3.5 h-3.5 text-purple-400" />
                )}
                {renderComparisonRow(
                  'Atsparumas orui / vandeniui',
                  itemA.fabric.waterResistance || 'Standartinis',
                  itemB.fabric.waterResistance || 'Standartinis',
                  itemA.fabric.waterResistance,
                  itemB.fabric.waterResistance
                )}

                {/* 3. STYLE & COLORS SECTION */}
                <tr className="bg-neutral-900/40 border-b border-neutral-800">
                  <td colSpan={3} className="py-2 px-4 text-[10px] font-mono uppercase tracking-widest text-amber-400 font-bold">
                    3. Stilius & Spalvų Gama
                  </td>
                </tr>
                {renderComparisonRow(
                  'Pagrindinė Spalva',
                  <div className="flex items-center gap-2">
                    <span
                      className="w-4 h-4 rounded-full border border-white/30 shrink-0"
                      style={{ backgroundColor: itemA.customization.primaryColor }}
                    />
                    <span>{itemA.customization.primaryColor}</span>
                  </div>,
                  <div className="flex items-center gap-2">
                    <span
                      className="w-4 h-4 rounded-full border border-white/30 shrink-0"
                      style={{ backgroundColor: itemB.customization.primaryColor }}
                    />
                    <span>{itemB.customization.primaryColor}</span>
                  </div>,
                  itemA.customization.primaryColor,
                  itemB.customization.primaryColor
                )}
                {renderComparisonRow(
                  'Akcentinė Spalva',
                  <div className="flex items-center gap-2">
                    <span
                      className="w-4 h-4 rounded-full border border-white/30 shrink-0"
                      style={{ backgroundColor: itemA.customization.accentColor }}
                    />
                    <span>{itemA.customization.accentColor}</span>
                  </div>,
                  <div className="flex items-center gap-2">
                    <span
                      className="w-4 h-4 rounded-full border border-white/30 shrink-0"
                      style={{ backgroundColor: itemB.customization.accentColor }}
                    />
                    <span>{itemB.customization.accentColor}</span>
                  </div>,
                  itemA.customization.accentColor,
                  itemB.customization.accentColor
                )}
                {renderComparisonRow(
                  'Furnitūros Danga',
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3.5 h-3.5 rounded-full border border-white/40 shrink-0"
                      style={{ backgroundColor: itemA.customization.hardwareColor }}
                    />
                    <span>{itemA.customization.hardwareColor}</span>
                  </div>,
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3.5 h-3.5 rounded-full border border-white/40 shrink-0"
                      style={{ backgroundColor: itemB.customization.hardwareColor }}
                    />
                    <span>{itemB.customization.hardwareColor}</span>
                  </div>,
                  itemA.customization.hardwareColor,
                  itemB.customization.hardwareColor
                )}
                {renderComparisonRow(
                  'Rašto Tipas',
                  itemA.customization.pattern?.type || 'none',
                  itemB.customization.pattern?.type || 'none',
                  itemA.customization.pattern?.type,
                  itemB.customization.pattern?.type
                )}
                {renderComparisonRow(
                  'Tekstas / Emblema',
                  itemA.customization.customText || '—',
                  itemB.customization.customText || '—',
                  itemA.customization.customText,
                  itemB.customization.customText
                )}

                {/* 4. SIZE & FIT SECTION */}
                <tr className="bg-neutral-900/40 border-b border-neutral-800">
                  <td colSpan={3} className="py-2 px-4 text-[10px] font-mono uppercase tracking-widest text-amber-400 font-bold">
                    4. Dydis & Kirpimo Siluetas
                  </td>
                </tr>
                {renderComparisonRow(
                  'Drabužio Dydis',
                  itemA.customization.size,
                  itemB.customization.size,
                  itemA.customization.size,
                  itemB.customization.size
                )}
                {renderComparisonRow(
                  'Kirpimo Siluetas',
                  itemA.customization.fitMode.toUpperCase(),
                  itemB.customization.fitMode.toUpperCase(),
                  itemA.customization.fitMode,
                  itemB.customization.fitMode
                )}
                {renderComparisonRow(
                  'Individualūs Išmatavimai',
                  itemA.customization.customMeasurements?.isCustomApplied ? 'Pritaikyti pagal kūną' : 'Standartinis dydis',
                  itemB.customization.customMeasurements?.isCustomApplied ? 'Pritaikyti pagal kūną' : 'Standartinis dydis',
                  itemA.customization.customMeasurements?.isCustomApplied,
                  itemB.customization.customMeasurements?.isCustomApplied
                )}

                {/* 5. 3D LIGHTING & ENVIRONMENT */}
                <tr className="bg-neutral-900/40 border-b border-neutral-800">
                  <td colSpan={3} className="py-2 px-4 text-[10px] font-mono uppercase tracking-widest text-amber-400 font-bold">
                    5. 3D Studijos Aplinka
                  </td>
                </tr>
                {renderComparisonRow(
                  'Apšvietimo Režimas',
                  itemA.customization.lightingPreset,
                  itemB.customization.lightingPreset,
                  itemA.customization.lightingPreset,
                  itemB.customization.lightingPreset,
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                )}
                {renderComparisonRow(
                  'Studijos Tema',
                  itemA.customization.studioTheme === 'bright' ? 'Šviesi' : 'Tamsi',
                  itemB.customization.studioTheme === 'bright' ? 'Šviesi' : 'Tamsi',
                  itemA.customization.studioTheme,
                  itemB.customization.studioTheme
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-neutral-800 bg-neutral-950 flex items-center justify-between text-xs text-neutral-400">
          <span>
            Palyginote 2 skirtingus modelius • Galite bet kurį akimirksniu užkrauti 3D laboratorijoje
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-medium transition cursor-pointer"
          >
            Uždaryti
          </button>
        </div>
      </div>
    </div>
  );
};
