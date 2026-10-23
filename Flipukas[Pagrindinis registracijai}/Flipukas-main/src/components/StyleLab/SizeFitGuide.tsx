import React, { useMemo, useState } from 'react';
import confetti from 'canvas-confetti';
import {
  ArrowRight,
  Check,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  Info,
  Maximize2,
  Minimize2,
  RefreshCw,
  Ruler,
  Sliders,
  Sparkles,
  User,
  X,
  Zap,
} from 'lucide-react';
import { BodyMeasurements, CustomizationState, Product } from '../../types/clothing';

export interface SizeFitGuideProps {
  product: Product;
  customization: CustomizationState;
  onChangeCustomization: (updater: (prev: CustomizationState) => CustomizationState, desc?: string) => void;
  isModal?: boolean;
  isOpen?: boolean;
  onClose?: () => void;
}

// Product-specific standard measurements database (in cm)
const PRODUCT_SIZE_CHARTS: Record<
  string,
  Record<
    CustomizationState['size'],
    {
      chest: number; // Krūtinės apimtis / plotis
      length: number; // Gaminio ilgis
      sleeve: number; // Rankovės ilgis nuo apykaklės
      shoulder: number; // Pečių plotis
      waist: number; // Liemuo
      hips?: number; // Klubai
      recommendedHeight: string; // Rekomenduojamas ūgis
      recommendedWeight: string; // Rekomenduojamas svoris
    }
  >
> = {
  hoodie: {
    XS: { chest: 96, length: 68, sleeve: 62, shoulder: 44, waist: 88, recommendedHeight: '160-168 cm', recommendedWeight: '50-60 kg' },
    S: { chest: 102, length: 70, sleeve: 64, shoulder: 46, waist: 94, recommendedHeight: '168-174 cm', recommendedWeight: '60-70 kg' },
    M: { chest: 108, length: 72, sleeve: 66, shoulder: 48, waist: 100, recommendedHeight: '174-180 cm', recommendedWeight: '70-80 kg' },
    L: { chest: 114, length: 75, sleeve: 68, shoulder: 50, waist: 106, recommendedHeight: '180-186 cm', recommendedWeight: '80-90 kg' },
    XL: { chest: 122, length: 78, sleeve: 70, shoulder: 53, waist: 114, recommendedHeight: '185-192 cm', recommendedWeight: '90-102 kg' },
    XXL: { chest: 130, length: 80, sleeve: 72, shoulder: 56, waist: 122, recommendedHeight: '190-200 cm', recommendedWeight: '100-118 kg' },
  },
  tshirt: {
    XS: { chest: 92, length: 66, sleeve: 20, shoulder: 42, waist: 86, recommendedHeight: '160-168 cm', recommendedWeight: '50-60 kg' },
    S: { chest: 98, length: 69, sleeve: 21, shoulder: 44, waist: 92, recommendedHeight: '168-174 cm', recommendedWeight: '60-70 kg' },
    M: { chest: 104, length: 72, sleeve: 22, shoulder: 46, waist: 98, recommendedHeight: '174-180 cm', recommendedWeight: '70-80 kg' },
    L: { chest: 110, length: 74, sleeve: 23, shoulder: 48, waist: 104, recommendedHeight: '180-186 cm', recommendedWeight: '80-90 kg' },
    XL: { chest: 118, length: 77, sleeve: 24, shoulder: 51, waist: 112, recommendedHeight: '185-192 cm', recommendedWeight: '90-102 kg' },
    XXL: { chest: 126, length: 79, sleeve: 25, shoulder: 54, waist: 120, recommendedHeight: '190-200 cm', recommendedWeight: '100-118 kg' },
  },
  jacket: {
    XS: { chest: 100, length: 66, sleeve: 63, shoulder: 45, waist: 92, recommendedHeight: '160-168 cm', recommendedWeight: '50-60 kg' },
    S: { chest: 106, length: 68, sleeve: 65, shoulder: 47, waist: 98, recommendedHeight: '168-174 cm', recommendedWeight: '60-70 kg' },
    M: { chest: 112, length: 71, sleeve: 67, shoulder: 49, waist: 104, recommendedHeight: '174-180 cm', recommendedWeight: '70-80 kg' },
    L: { chest: 118, length: 73, sleeve: 69, shoulder: 51, waist: 110, recommendedHeight: '180-186 cm', recommendedWeight: '80-90 kg' },
    XL: { chest: 126, length: 76, sleeve: 71, shoulder: 54, waist: 118, recommendedHeight: '185-192 cm', recommendedWeight: '90-102 kg' },
    XXL: { chest: 134, length: 78, sleeve: 73, shoulder: 57, waist: 126, recommendedHeight: '190-200 cm', recommendedWeight: '100-118 kg' },
  },
  pants: {
    XS: { chest: 86, length: 98, sleeve: 72, shoulder: 40, waist: 72, hips: 92, recommendedHeight: '160-168 cm', recommendedWeight: '50-60 kg' },
    S: { chest: 92, length: 100, sleeve: 74, shoulder: 42, waist: 78, hips: 98, recommendedHeight: '168-174 cm', recommendedWeight: '60-70 kg' },
    M: { chest: 98, length: 102, sleeve: 76, shoulder: 44, waist: 84, hips: 104, recommendedHeight: '174-180 cm', recommendedWeight: '70-80 kg' },
    L: { chest: 104, length: 105, sleeve: 78, shoulder: 46, waist: 90, hips: 110, recommendedHeight: '180-186 cm', recommendedWeight: '80-90 kg' },
    XL: { chest: 112, length: 107, sleeve: 80, shoulder: 48, waist: 98, hips: 118, recommendedHeight: '185-192 cm', recommendedWeight: '90-102 kg' },
    XXL: { chest: 120, length: 109, sleeve: 82, shoulder: 50, waist: 106, hips: 126, recommendedHeight: '190-200 cm', recommendedWeight: '100-118 kg' },
  },
  beanie: {
    XS: { chest: 52, length: 20, sleeve: 0, shoulder: 20, waist: 52, recommendedHeight: 'Visi', recommendedWeight: 'Visi' },
    S: { chest: 54, length: 21, sleeve: 0, shoulder: 21, waist: 54, recommendedHeight: 'Visi', recommendedWeight: 'Visi' },
    M: { chest: 56, length: 22, sleeve: 0, shoulder: 22, waist: 56, recommendedHeight: 'Visi', recommendedWeight: 'Visi' },
    L: { chest: 58, length: 23, sleeve: 0, shoulder: 23, waist: 58, recommendedHeight: 'Visi', recommendedWeight: 'Visi' },
    XL: { chest: 60, length: 24, sleeve: 0, shoulder: 24, waist: 60, recommendedHeight: 'Visi', recommendedWeight: 'Visi' },
    XXL: { chest: 62, length: 25, sleeve: 0, shoulder: 25, waist: 62, recommendedHeight: 'Visi', recommendedWeight: 'Visi' },
  },
};

// Quick body measurement presets
const BODY_PRESETS = [
  {
    id: 'slim',
    label: 'Lieknas / Slim',
    description: '175 cm • 92 cm krūtinė • 78 cm liemuo',
    measurements: { height: 175, chest: 92, waist: 78, hips: 90, sleeve: 63, shoulder: 43 },
  },
  {
    id: 'athletic',
    label: 'Vidutinis / Athletic',
    description: '180 cm • 104 cm krūtinė • 86 cm liemuo',
    measurements: { height: 180, chest: 104, waist: 86, hips: 98, sleeve: 66, shoulder: 47 },
  },
  {
    id: 'broad',
    label: 'Stambus / Broad',
    description: '185 cm • 116 cm krūtinė • 98 cm liemuo',
    measurements: { height: 185, chest: 116, waist: 98, hips: 108, sleeve: 69, shoulder: 51 },
  },
];

export const SizeFitGuide: React.FC<SizeFitGuideProps> = ({
  product,
  customization,
  onChangeCustomization,
  isModal = false,
  isOpen = true,
  onClose,
}) => {
  // Mode: standard size table vs custom body measurements
  const [guideMode, setGuideMode] = useState<'standard' | 'custom'>('standard');
  const [unit, setUnit] = useState<'cm' | 'in'>('cm');
  const [showHowToMeasure, setShowHowToMeasure] = useState(false);

  // Custom measurements local state with fallback
  const [measurements, setMeasurements] = useState<BodyMeasurements>({
    unit: 'cm',
    height: customization.customMeasurements?.height || 180,
    chest: customization.customMeasurements?.chest || 104,
    waist: customization.customMeasurements?.waist || 86,
    hips: customization.customMeasurements?.hips || 98,
    sleeve: customization.customMeasurements?.sleeve || 65,
    shoulder: customization.customMeasurements?.shoulder || 46,
    isCustomApplied: customization.customMeasurements?.isCustomApplied || false,
  });

  const productChart = PRODUCT_SIZE_CHARTS[product.type] || PRODUCT_SIZE_CHARTS.hoodie;
  const currentSizeMeasurements = productChart[customization.size];

  // Unit conversion helper
  const formatVal = (valInCm: number) => {
    if (unit === 'in') {
      return `${(valInCm / 2.54).toFixed(1)}″`;
    }
    return `${Math.round(valInCm)} cm`;
  };

  // Convert input value based on current unit
  const displayInputVal = (valInCm: number) => {
    if (unit === 'in') {
      return Number((valInCm / 2.54).toFixed(1));
    }
    return Math.round(valInCm);
  };

  const handleUpdateMeasurement = (key: keyof BodyMeasurements, rawValue: number) => {
    // If unit is inches, convert to cm before saving
    const cmValue = unit === 'in' ? Math.round(rawValue * 2.54) : Math.round(rawValue);

    setMeasurements((prev) => {
      const updated = {
        ...prev,
        [key]: cmValue,
      };

      // If custom scaling is already active on 3D model, update customization directly
      if (updated.isCustomApplied) {
        onChangeCustomization((c) => ({
          ...c,
          customMeasurements: updated,
        }));
      }

      return updated;
    });
  };

  // Smart size recommendation algorithm
  const recommendation = useMemo(() => {
    const userChest = measurements.chest;
    const userHeight = measurements.height;
    const sizes: CustomizationState['size'][] = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

    let bestSize: CustomizationState['size'] = 'M';
    let minDifference = 9999;

    sizes.forEach((sz) => {
      const chart = productChart[sz];
      // Target chest ease is roughly +4cm to +8cm for standard fit
      const idealGarmentChest = userChest + 6;
      const diff = Math.abs(chart.chest - idealGarmentChest);

      if (diff < minDifference) {
        minDifference = diff;
        bestSize = sz;
      }
    });

    const targetChart = productChart[bestSize];
    const chestEase = targetChart.chest - userChest;
    const matchAccuracy = Math.max(82, Math.min(99, 100 - minDifference * 2));

    let fitNote = 'Subalansuotas, patogus kasdienis kirpimas.';
    if (chestEase > 8) {
      fitNote = 'Laisvas gatvės siluetas su maloniu komfortu.';
    } else if (chestEase < 3) {
      fitNote = 'Glaudžiau priglundantis atletiškas kirpimas.';
    }

    return {
      bestSize,
      matchAccuracy,
      chestEase,
      fitNote,
    };
  }, [measurements, productChart]);

  // Apply or toggle custom 3D model scaling
  const handleToggleApplyCustomScaling = (apply: boolean) => {
    const updated: BodyMeasurements = {
      ...measurements,
      isCustomApplied: apply,
    };
    setMeasurements(updated);

    onChangeCustomization((c) => ({
      ...c,
      customMeasurements: updated,
    }), apply ? 'Pritaikytas 3D modelio mastelis pagal kūno išmatavimus' : 'Atstatytas standartinis 3D mastelis');

    if (apply) {
      confetti({
        particleCount: 28,
        spread: 60,
        origin: { y: 0.7 },
      });
    }
  };

  // Quick preset loader
  const handleApplyPreset = (preset: typeof BODY_PRESETS[0]) => {
    const nextMeasurements: BodyMeasurements = {
      unit: 'cm',
      ...preset.measurements,
      isCustomApplied: measurements.isCustomApplied,
    };
    setMeasurements(nextMeasurements);

    if (measurements.isCustomApplied) {
      onChangeCustomization((c) => ({
        ...c,
        customMeasurements: nextMeasurements,
      }), `Pritaikytas kūno profilis: ${preset.label}`);
    }
  };

  if (isModal && !isOpen) return null;

  const content = (
    <div className="flex flex-col gap-4 text-neutral-200">
      {/* Top Header / Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-amber-400/20 text-amber-400 border border-amber-400/30">
              <Ruler className="w-4 h-4" />
            </span>
            <h3 className="font-display font-bold text-base text-white tracking-wide">
              Dydžio & Kūno Išmatavimų Gidas
            </h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-neutral-800 text-neutral-300 border border-neutral-700">
              {product.name}
            </span>
          </div>
          <p className="text-xs text-neutral-400 mt-1">
            Pasirinkite standartinį dydį arba įveskite tikslius kūno išmatavimus automatiniam 3D masteliui.
          </p>
        </div>

        {/* Unit Selector: CM / IN */}
        <div className="flex items-center gap-1.5 self-start sm:self-auto bg-neutral-950 p-1 rounded-xl border border-neutral-800">
          <button
            onClick={() => setUnit('cm')}
            className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition ${
              unit === 'cm'
                ? 'bg-amber-400 text-neutral-950 shadow-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            CM
          </button>
          <button
            onClick={() => setUnit('in')}
            className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition ${
              unit === 'in'
                ? 'bg-amber-400 text-neutral-950 shadow-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            INCH
          </button>
        </div>
      </div>

      {/* Guide Navigation Mode Toggle */}
      <div className="grid grid-cols-2 gap-2 p-1 bg-neutral-950 rounded-xl border border-neutral-800">
        <button
          onClick={() => setGuideMode('standard')}
          className={`py-2 px-3 rounded-lg text-xs font-mono font-medium transition flex items-center justify-center gap-2 cursor-pointer ${
            guideMode === 'standard'
              ? 'bg-neutral-800 text-white font-bold shadow-md border border-neutral-700'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          <Ruler className="w-3.5 h-3.5 text-amber-400" />
          <span>Standartiniai Dydžiai</span>
        </button>

        <button
          onClick={() => setGuideMode('custom')}
          className={`py-2 px-3 rounded-lg text-xs font-mono font-medium transition flex items-center justify-center gap-2 cursor-pointer ${
            guideMode === 'custom'
              ? 'bg-amber-400 text-neutral-950 font-bold shadow-md'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          <User className="w-3.5 h-3.5" />
          <span>Mano Išmatavimai & 3D Fit</span>
          {measurements.isCustomApplied && (
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          )}
        </button>
      </div>

      {/* 1. STANDARTINIAI DYDŽIAI TAB */}
      {guideMode === 'standard' && (
        <div className="flex flex-col gap-4 animate-in fade-in duration-150">
          {/* Quick Size Selector Buttons */}
          <div>
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="font-semibold text-neutral-300">Pasirinkite dydį:</span>
              <span className="font-mono text-amber-400 text-[11px]">
                Aktyvus: <strong className="text-white text-xs">{customization.size}</strong>
              </span>
            </div>
            <div className="grid grid-cols-6 gap-2">
              {(['XS', 'S', 'M', 'L', 'XL', 'XXL'] as const).map((sz) => {
                const isSelected = customization.size === sz;
                return (
                  <button
                    key={sz}
                    onClick={() => {
                      onChangeCustomization((c) => ({ ...c, size: sz }), `Dydis: ${sz}`);
                    }}
                    className={`h-11 rounded-xl text-xs font-mono font-bold border transition-all cursor-pointer flex flex-col items-center justify-center ${
                      isSelected
                        ? 'bg-amber-400 text-neutral-950 border-amber-300 shadow-md shadow-amber-400/20 scale-[1.03]'
                        : 'border-neutral-800 bg-neutral-950/80 text-neutral-300 hover:text-white hover:border-neutral-700'
                    }`}
                  >
                    <span>{sz}</span>
                    <span className="text-[9px] opacity-75 font-normal">
                      {formatVal(productChart[sz].chest)}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Silhouette / Fit Ease Mode Selector */}
          <div className="pt-2 border-t border-neutral-800/80">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="font-semibold text-neutral-300">Kirpimo Siluetas (3D tūris):</span>
              <span className="text-neutral-400 text-[11px]">
                {customization.fitMode === 'oversized'
                  ? '+10% laisvumas'
                  : customization.fitMode === 'tailored'
                  ? '-8% prigludimas'
                  : 'Standartinis kirpimas'}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {(
                [
                  { id: 'tailored', label: 'Prigludęs', sub: 'Tailored' },
                  { id: 'regular', label: 'Klasikinis', sub: 'Regular' },
                  { id: 'oversized', label: 'Didintas', sub: 'Oversized' },
                ] as const
              ).map((fit) => {
                const isSelected = customization.fitMode === fit.id;
                return (
                  <button
                    key={fit.id}
                    onClick={() =>
                      onChangeCustomization(
                        (c) => ({ ...c, fitMode: fit.id }),
                        `Siluetas: ${fit.label}`
                      )
                    }
                    className={`p-2.5 rounded-xl border text-xs text-center transition-all cursor-pointer flex flex-col items-center ${
                      isSelected
                        ? 'border-amber-400 bg-amber-400/15 text-white font-semibold shadow-sm'
                        : 'border-neutral-800 bg-neutral-950/80 text-neutral-400 hover:text-white hover:border-neutral-700'
                    }`}
                  >
                    <span className="font-bold text-neutral-200">{fit.label}</span>
                    <span className="text-[10px] text-neutral-400 font-mono">{fit.sub}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Garment Dimensions Table */}
          <div className="bg-neutral-950 rounded-xl border border-neutral-800 p-3.5">
            <div className="flex items-center justify-between mb-2.5 pb-2 border-b border-neutral-800/80">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-neutral-200">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Tikslūs gaminio matmenys ({customization.size} dydis):</span>
              </div>
              <span className="text-[10px] font-mono text-neutral-400">
                Rekomenduojamas ūgis: <strong className="text-amber-400">{currentSizeMeasurements.recommendedHeight}</strong>
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs font-mono">
              <div className="p-2 rounded-lg bg-neutral-900/60 border border-neutral-800/60 flex items-center justify-between">
                <span className="text-neutral-400">Krūtinės apimtis:</span>
                <span className="font-bold text-white">{formatVal(currentSizeMeasurements.chest)}</span>
              </div>
              <div className="p-2 rounded-lg bg-neutral-900/60 border border-neutral-800/60 flex items-center justify-between">
                <span className="text-neutral-400">Gaminio ilgis:</span>
                <span className="font-bold text-white">{formatVal(currentSizeMeasurements.length)}</span>
              </div>
              <div className="p-2 rounded-lg bg-neutral-900/60 border border-neutral-800/60 flex items-center justify-between">
                <span className="text-neutral-400">Rankovės ilgis:</span>
                <span className="font-bold text-white">{formatVal(currentSizeMeasurements.sleeve)}</span>
              </div>
              <div className="p-2 rounded-lg bg-neutral-900/60 border border-neutral-800/60 flex items-center justify-between">
                <span className="text-neutral-400">Pečių plotis:</span>
                <span className="font-bold text-white">{formatVal(currentSizeMeasurements.shoulder)}</span>
              </div>
              <div className="p-2 rounded-lg bg-neutral-900/60 border border-neutral-800/60 flex items-center justify-between">
                <span className="text-neutral-400">Liemens apimtis:</span>
                <span className="font-bold text-white">{formatVal(currentSizeMeasurements.waist)}</span>
              </div>
              {currentSizeMeasurements.hips && (
                <div className="p-2 rounded-lg bg-neutral-900/60 border border-neutral-800/60 flex items-center justify-between">
                  <span className="text-neutral-400">Klubų apimtis:</span>
                  <span className="font-bold text-white">{formatVal(currentSizeMeasurements.hips)}</span>
                </div>
              )}
            </div>
          </div>

          {/* How to Measure Accordion */}
          <div className="rounded-xl border border-neutral-800 bg-neutral-950/60 overflow-hidden">
            <button
              onClick={() => setShowHowToMeasure(!showHowToMeasure)}
              className="w-full px-3.5 py-2.5 flex items-center justify-between text-xs text-neutral-300 hover:text-white transition"
            >
              <div className="flex items-center gap-2">
                <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
                <span className="font-medium">Kaip teisingai išsimatuoti su centimetrine juostele?</span>
              </div>
              {showHowToMeasure ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {showHowToMeasure && (
              <div className="p-3.5 border-t border-neutral-800/80 text-xs text-neutral-400 flex flex-col gap-2 font-mono">
                <div className="flex items-start gap-2">
                  <span className="w-4 h-4 rounded-full bg-amber-400/20 text-amber-400 text-[10px] flex items-center justify-center shrink-0 font-bold">1</span>
                  <p><strong className="text-neutral-200">Krūtinė:</strong> Matuokite horizontaliai per plačiausią krūtinės vietą, atpalaidavę pečius.</p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="w-4 h-4 rounded-full bg-amber-400/20 text-amber-400 text-[10px] flex items-center justify-center shrink-0 font-bold">2</span>
                  <p><strong className="text-neutral-200">Liemuo:</strong> Matuokite siauriausią liemens vietą, maždaug 2-3 cm virš bambos.</p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="w-4 h-4 rounded-full bg-amber-400/20 text-amber-400 text-[10px] flex items-center justify-center shrink-0 font-bold">3</span>
                  <p><strong className="text-neutral-200">Rankovė:</strong> Matuokite nuo kaklo šoninio taško per petį iki riešo kauliuko.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. MANO KŪNO IŠMATAVIMAI (CUSTOM FIT) TAB */}
      {guideMode === 'custom' && (
        <div className="flex flex-col gap-4 animate-in fade-in duration-150">
          {/* Quick Preset Profiles */}
          <div>
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="font-semibold text-neutral-300">Greiti kūno sudėjimo profiliai:</span>
              <span className="text-[10px] text-neutral-400">1 paspaudimu</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {BODY_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => handleApplyPreset(preset)}
                  className="p-2.5 rounded-xl border border-neutral-800 bg-neutral-950 hover:bg-neutral-900 hover:border-amber-400/50 text-left transition-all cursor-pointer group"
                >
                  <div className="text-xs font-bold text-neutral-200 group-hover:text-amber-400 flex items-center justify-between">
                    <span>{preset.label}</span>
                    <Sparkles className="w-3 h-3 text-neutral-500 group-hover:text-amber-400" />
                  </div>
                  <div className="text-[10px] text-neutral-400 font-mono mt-1">
                    {preset.description}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Interactive Measurement Sliders & Number Inputs */}
          <div className="bg-neutral-950 p-4 rounded-xl border border-neutral-800 flex flex-col gap-3.5">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
              <span className="text-xs font-bold text-neutral-200">Tikslios asmeninės apimtys:</span>
              <span className="text-[10px] font-mono text-neutral-400">Vienetai: {unit.toUpperCase()}</span>
            </div>

            {/* 1. Ūgis */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-neutral-300">Ūgis (Height):</span>
                <span className="font-bold text-amber-400">{formatVal(measurements.height)}</span>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min={unit === 'in' ? 59 : 150}
                  max={unit === 'in' ? 83 : 210}
                  step={unit === 'in' ? 0.5 : 1}
                  value={displayInputVal(measurements.height)}
                  onChange={(e) => handleUpdateMeasurement('height', parseFloat(e.target.value))}
                  className="w-full accent-amber-400 h-1.5 bg-neutral-800 rounded-lg cursor-pointer"
                />
                <input
                  type="number"
                  value={displayInputVal(measurements.height)}
                  onChange={(e) => handleUpdateMeasurement('height', parseFloat(e.target.value) || 150)}
                  className="w-16 px-2 py-1 bg-neutral-900 border border-neutral-700 rounded text-right text-xs font-mono font-bold text-white"
                />
              </div>
            </div>

            {/* 2. Krūtinė */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-neutral-300">Krūtinės apimtis (Chest):</span>
                <span className="font-bold text-amber-400">{formatVal(measurements.chest)}</span>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min={unit === 'in' ? 30 : 76}
                  max={unit === 'in' ? 55 : 140}
                  step={unit === 'in' ? 0.5 : 1}
                  value={displayInputVal(measurements.chest)}
                  onChange={(e) => handleUpdateMeasurement('chest', parseFloat(e.target.value))}
                  className="w-full accent-amber-400 h-1.5 bg-neutral-800 rounded-lg cursor-pointer"
                />
                <input
                  type="number"
                  value={displayInputVal(measurements.chest)}
                  onChange={(e) => handleUpdateMeasurement('chest', parseFloat(e.target.value) || 76)}
                  className="w-16 px-2 py-1 bg-neutral-900 border border-neutral-700 rounded text-right text-xs font-mono font-bold text-white"
                />
              </div>
            </div>

            {/* 3. Liemuo */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-neutral-300">Liemens apimtis (Waist):</span>
                <span className="font-bold text-amber-400">{formatVal(measurements.waist)}</span>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min={unit === 'in' ? 24 : 60}
                  max={unit === 'in' ? 50 : 130}
                  step={unit === 'in' ? 0.5 : 1}
                  value={displayInputVal(measurements.waist)}
                  onChange={(e) => handleUpdateMeasurement('waist', parseFloat(e.target.value))}
                  className="w-full accent-amber-400 h-1.5 bg-neutral-800 rounded-lg cursor-pointer"
                />
                <input
                  type="number"
                  value={displayInputVal(measurements.waist)}
                  onChange={(e) => handleUpdateMeasurement('waist', parseFloat(e.target.value) || 60)}
                  className="w-16 px-2 py-1 bg-neutral-900 border border-neutral-700 rounded text-right text-xs font-mono font-bold text-white"
                />
              </div>
            </div>

            {/* 4. Rankovė & Pečiai */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-neutral-800/80">
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-neutral-300">Rankovė:</span>
                  <span className="font-bold text-amber-400">{formatVal(measurements.sleeve)}</span>
                </div>
                <input
                  type="range"
                  min={unit === 'in' ? 20 : 50}
                  max={unit === 'in' ? 32 : 80}
                  step={unit === 'in' ? 0.5 : 1}
                  value={displayInputVal(measurements.sleeve)}
                  onChange={(e) => handleUpdateMeasurement('sleeve', parseFloat(e.target.value))}
                  className="w-full accent-amber-400 h-1.5 bg-neutral-800 rounded-lg cursor-pointer"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-neutral-300">Pečių plotis:</span>
                  <span className="font-bold text-amber-400">{formatVal(measurements.shoulder || 46)}</span>
                </div>
                <input
                  type="range"
                  min={unit === 'in' ? 15 : 38}
                  max={unit === 'in' ? 24 : 60}
                  step={unit === 'in' ? 0.5 : 1}
                  value={displayInputVal(measurements.shoulder || 46)}
                  onChange={(e) => handleUpdateMeasurement('shoulder', parseFloat(e.target.value))}
                  className="w-full accent-amber-400 h-1.5 bg-neutral-800 rounded-lg cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Smart Fit Recommendation Badge */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-amber-500/10 via-yellow-500/10 to-amber-500/5 border border-amber-500/30 flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                  Smart Fit Rekomendacija:
                </span>
              </div>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                {recommendation.matchAccuracy}% Suderinamumas
              </span>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono text-amber-400">
                {recommendation.bestSize} Dydis
              </span>
              <span className="text-xs text-neutral-300">
                — {recommendation.fitNote}
              </span>
            </div>

            <div className="flex items-center justify-between text-[11px] font-mono text-neutral-400 pt-1 border-t border-amber-500/20">
              <span>Krūtinės laisvumas: +{formatVal(recommendation.chestEase)}</span>
              <button
                onClick={() => {
                  onChangeCustomization((c) => ({ ...c, size: recommendation.bestSize }), `Pritaikytas rekomenduojamas dydis: ${recommendation.bestSize}`);
                }}
                className="text-amber-400 hover:text-white underline font-semibold flex items-center gap-1 cursor-pointer"
              >
                <span>Nustatyti šį dydį ({recommendation.bestSize})</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* 3D Garment Scaling Switcher */}
          <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white">Taikyti proporcijas 3D modeliui</span>
                {measurements.isCustomApplied && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">
                    Aktyvus 3D mastelis
                  </span>
                )}
              </div>
              <p className="text-[11px] text-neutral-400 mt-0.5">
                Dinamiškai praplečia arba susiaurina 3D drabužį ekrane pagal jūsų kūno proporcijas.
              </p>
            </div>

            <button
              onClick={() => handleToggleApplyCustomScaling(!measurements.isCustomApplied)}
              className={`py-2 px-4 rounded-xl text-xs font-mono font-bold transition flex items-center justify-center gap-2 cursor-pointer shrink-0 ${
                measurements.isCustomApplied
                  ? 'bg-emerald-500 text-neutral-950 shadow-md shadow-emerald-500/20'
                  : 'bg-amber-400 text-neutral-950 hover:bg-amber-300 shadow-md'
              }`}
            >
              {measurements.isCustomApplied ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>3D Mastelis Įjungtas</span>
                </>
              ) : (
                <>
                  <Zap className="w-3.5 h-3.5" />
                  <span>Taikyti 3D Modeliui</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );

  if (isModal) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
        <div className="relative w-full max-w-2xl bg-neutral-900 border border-neutral-800 rounded-2xl p-5 sm:p-7 shadow-2xl my-auto">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
          {content}
        </div>
      </div>
    );
  }

  return content;
};
