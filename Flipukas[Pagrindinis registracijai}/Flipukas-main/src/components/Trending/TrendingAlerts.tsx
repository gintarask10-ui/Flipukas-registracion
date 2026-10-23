import React, { useState, useEffect } from 'react';
import {
  Flame,
  X,
  Sparkles,
  TrendingUp,
  Users,
  Eye,
  ShoppingBag,
  ArrowRight,
  Layers,
  ChevronRight,
} from 'lucide-react';
import { CustomizationState, FabricMaterial, Product } from '../../types/clothing';
import { PRODUCTS, FABRICS } from '../../data/products';

export interface TrendingStyleItem {
  id: string;
  title: string;
  tagline: string;
  category: string;
  author: string;
  product: Product;
  customization: CustomizationState;
  fabric: FabricMaterial;
  price: number;
  activeViewers: number;
  savesCount: number;
  ordersToday: number;
  popularityScore: number; // 1-100
  trendingTag: string;
}

// Live Community Trending Styles Data
export const TRENDING_COMMUNITY_STYLES: TrendingStyleItem[] = [
  {
    id: 'trend-cyber-hoodie',
    title: 'Cyber-Obsidian Acid Hoodie',
    tagline: 'Madingiausias šios savaitės gatvės stiliaus derinys',
    category: 'Gatvės Mada',
    author: 'Atelier Vilnius',
    product: PRODUCTS[0],
    customization: {
      primaryColor: '#161618',
      secondaryColor: '#374151',
      accentColor: '#06b6d4',
      hardwareColor: '#cbd5e1',
      fabricId: 'gore-aero',
      badgeType: 'cybergrid',
      customText: 'CYBERPUNK',
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
    activeViewers: 46,
    savesCount: 182,
    ordersToday: 24,
    popularityScore: 98,
    trendingTag: 'Nr. 1 Šią savaitę',
  },
  {
    id: 'trend-silk-amber',
    title: 'Gintarinis Mulberry Šilko Trenchcoat',
    tagline: 'Prabangus šilko kritimas su auksine žalvario furnitūra',
    category: 'Haute Couture',
    author: 'Klaipėda Design',
    product: PRODUCTS.find((p) => p.type === 'trench') || PRODUCTS[1],
    customization: {
      primaryColor: '#715842',
      secondaryColor: '#e2dfd8',
      accentColor: '#d97706',
      hardwareColor: '#b48a3c',
      fabricId: 'mulberry-silk',
      badgeType: 'minimal',
      customText: 'FLIPUKAS',
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
      studioBrightness: 1.3,
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
    activeViewers: 32,
    savesCount: 145,
    ordersToday: 17,
    popularityScore: 94,
    trendingTag: 'Prabangus pasirinkimas',
  },
  {
    id: 'trend-denim-tactical',
    title: 'Selvedge Twill Striukė su Odos Akcentais',
    tagline: 'Tvirtas 14.5oz japonų džinsas su matinės juodos detalėmis',
    category: 'Raw Streetwear',
    author: 'Kaunas Apparel',
    product: PRODUCTS.find((p) => p.type === 'jacket') || PRODUCTS[0],
    customization: {
      primaryColor: '#1e3a8a',
      secondaryColor: '#161618',
      accentColor: '#f59e0b',
      hardwareColor: '#1c1917',
      fabricId: 'selvedge-denim',
      badgeType: 'aeroshift',
      customText: 'RAW-TWILL',
      pattern: {
        type: 'houndstooth',
        scale: 3,
        primaryColor: '#1e3a8a',
        secondaryColor: '#161618',
        opacity: 0.7,
        rotation: 0,
        visible: true,
        locked: false,
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
    fabric: FABRICS.find((f) => f.id === 'selvedge-denim') || FABRICS[2],
    price: (PRODUCTS.find((p) => p.type === 'jacket') || PRODUCTS[0]).basePrice + 12,
    activeViewers: 29,
    savesCount: 119,
    ordersToday: 13,
    popularityScore: 89,
    trendingTag: 'Populiarėja dabar',
  },
];

interface TrendingAlertsProps {
  onApplyTrendingStyle: (item: TrendingStyleItem) => void;
  isOpenModal: boolean;
  onCloseModal: () => void;
}

export const TrendingAlerts: React.FC<TrendingAlertsProps> = ({
  onApplyTrendingStyle,
  isOpenModal,
  onCloseModal,
}) => {
  const [currentAlertIndex, setCurrentAlertIndex] = useState(0);
  const [isAlertVisible, setIsAlertVisible] = useState(true);
  const [isDismissedByUser, setIsDismissedByUser] = useState(false);

  const currentTrend = TRENDING_COMMUNITY_STYLES[currentAlertIndex];

  // Rotate alert notification every 28 seconds if not dismissed
  useEffect(() => {
    if (isDismissedByUser) return;

    const timer = setInterval(() => {
      setIsAlertVisible(false);
      setTimeout(() => {
        setCurrentAlertIndex((prev) => (prev + 1) % TRENDING_COMMUNITY_STYLES.length);
        setIsAlertVisible(true);
      }, 600);
    }, 28000);

    return () => clearInterval(timer);
  }, [isDismissedByUser]);

  return (
    <>
      {/* 1. Real-Time Floating Community Alert Pill (Non-intrusive bottom-left) */}
      {!isDismissedByUser && isAlertVisible && (
        <div className="fixed bottom-6 left-6 z-40 max-w-sm sm:max-w-md bg-neutral-900/95 backdrop-blur-md border border-amber-400/50 rounded-2xl p-3.5 shadow-2xl shadow-amber-500/10 flex items-start gap-3 animate-in slide-in-from-bottom duration-300">
          <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0 mt-0.5">
            <Flame className="w-5 h-5 animate-pulse" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2 mb-0.5">
              <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-bold flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                Populiarėja Bendruomenėje
              </span>
              <button
                onClick={() => setIsDismissedByUser(true)}
                className="text-neutral-500 hover:text-white p-0.5 rounded"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <h5 className="font-bold text-xs text-white truncate">
              {currentTrend.title}
            </h5>
            <p className="text-[11px] text-neutral-400 mt-0.5 line-clamp-1">
              🔥 <strong className="text-white">{currentTrend.activeViewers} pirkėjai</strong> šiuo metu apžiūri šį modelį ({currentTrend.ordersToday} užsakymai šiandien).
            </p>

            <div className="flex items-center gap-2 mt-2">
              <button
                onClick={() => {
                  onApplyTrendingStyle(currentTrend);
                  setIsDismissedByUser(true);
                }}
                className="py-1 px-2.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold text-[11px] transition flex items-center gap-1 shadow-sm active:scale-95 cursor-pointer"
              >
                <Sparkles className="w-3 h-3" />
                <span>Pritaikyti šį stilių 3D modeliui</span>
              </button>

              <button
                onClick={() => setIsAlertVisible(false)}
                className="text-[11px] text-neutral-400 hover:text-neutral-200 transition"
              >
                Praleisti
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Full Trending Styles Community Modal */}
      {isOpenModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          {/* Backdrop */}
          <div
            onClick={onCloseModal}
            className="fixed inset-0 bg-neutral-950/85 backdrop-blur-md transition-opacity"
          />

          <div className="relative w-full max-w-4xl bg-neutral-900 border border-neutral-800 rounded-3xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-neutral-800 flex items-center justify-between gap-4 bg-neutral-950/80">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <Flame className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-lg text-white">
                    Bendruomenės Mados Tendencijos (Trending Styles)
                  </h3>
                  <p className="text-xs text-neutral-400">
                    Realaus laiko duomenimis paremtos populiariausios drabužių konfigūracijos
                  </p>
                </div>
              </div>

              <button
                onClick={onCloseModal}
                className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {TRENDING_COMMUNITY_STYLES.map((trend) => (
                  <div
                    key={trend.id}
                    className="p-4 rounded-2xl border border-neutral-800 bg-neutral-950/80 hover:border-amber-400/50 transition-all flex flex-col justify-between group shadow-md"
                  >
                    <div>
                      {/* Top Badges */}
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-amber-400/10 text-amber-400 border border-amber-400/30 font-bold flex items-center gap-1">
                          <Flame className="w-3 h-3" />
                          {trend.trendingTag}
                        </span>
                        <span className="text-xs font-mono font-bold text-white">
                          {trend.price.toFixed(2)} €
                        </span>
                      </div>

                      {/* Visual Swatch Color Card */}
                      <div
                        className="h-32 rounded-xl border border-neutral-800 mb-3 flex flex-col items-center justify-center relative overflow-hidden p-3"
                        style={{ backgroundColor: `${trend.customization.primaryColor}22` }}
                      >
                        <div
                          className="w-14 h-14 rounded-2xl border-2 border-white/40 shadow-xl mb-1 flex items-center justify-center"
                          style={{ backgroundColor: trend.customization.primaryColor }}
                        >
                          <span className="font-mono text-xs font-bold text-white">
                            {trend.customization.size}
                          </span>
                        </div>
                        <span className="text-xs font-bold text-white tracking-wide">
                          {trend.fabric.nameLt}
                        </span>
                        <span className="text-[10px] font-mono text-neutral-400 uppercase">
                          {trend.customization.fitMode} kirpimas
                        </span>
                      </div>

                      <h4 className="font-display font-bold text-sm text-white group-hover:text-amber-400 transition">
                        {trend.title}
                      </h4>
                      <p className="text-xs text-neutral-400 mt-0.5 line-clamp-2">
                        {trend.tagline}
                      </p>

                      {/* Community Stats */}
                      <div className="mt-3 pt-2 border-t border-neutral-800/80 flex items-center justify-between text-[11px] font-mono text-neutral-400">
                        <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                          <Users className="w-3 h-3" /> {trend.activeViewers} dabar apžiūri
                        </span>
                        <span>{trend.ordersToday} užsakymai</span>
                      </div>
                    </div>

                    {/* Apply Button */}
                    <button
                      onClick={() => {
                        onApplyTrendingStyle(trend);
                        onCloseModal();
                      }}
                      className="mt-4 w-full py-2.5 px-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold text-xs transition flex items-center justify-center gap-1.5 shadow-md shadow-amber-400/20 active:scale-95 cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Pritaikyti šį stilių 3D modelyje</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-neutral-800 bg-neutral-950 flex items-center justify-between text-xs text-neutral-400">
              <span>Duomenys atnaujinami realiu laiku iš bendruomenės užsakymų</span>
              <button
                onClick={onCloseModal}
                className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-medium transition cursor-pointer"
              >
                Uždaryti
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
