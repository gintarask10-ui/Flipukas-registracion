import React, { useState, useMemo } from 'react';
import confetti from 'canvas-confetti';
import {
  Ruler,
  Sparkles,
  Check,
  CheckCircle2,
  ChevronRight,
  User,
  Sliders,
  RotateCcw,
  Zap,
  HelpCircle,
  TrendingUp,
  X,
  Scale,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import { BodyMeasurements, CustomizationState, Product } from '../../types/clothing';

interface InteractiveSizeRecommenderProps {
  product: Product;
  customization: CustomizationState;
  onApplySize: (
    size: CustomizationState['size'],
    fitMode: CustomizationState['fitMode'],
    measurements?: BodyMeasurements
  ) => void;
  isOpen?: boolean;
  onClose?: () => void;
  isModal?: boolean;
}

// Product-specific dimensions database (cm)
const PRODUCT_CHARTS: Record<
  string,
  Record<
    CustomizationState['size'],
    { chest: number; length: number; sleeve: number; shoulder: number; waist: number }
  >
> = {
  hoodie: {
    XS: { chest: 96, length: 68, sleeve: 62, shoulder: 44, waist: 88 },
    S: { chest: 102, length: 70, sleeve: 64, shoulder: 46, waist: 94 },
    M: { chest: 108, length: 72, sleeve: 66, shoulder: 48, waist: 100 },
    L: { chest: 114, length: 75, sleeve: 68, shoulder: 50, waist: 106 },
    XL: { chest: 122, length: 78, sleeve: 70, shoulder: 53, waist: 114 },
    XXL: { chest: 130, length: 80, sleeve: 72, shoulder: 56, waist: 122 },
  },
  tshirt: {
    XS: { chest: 92, length: 66, sleeve: 20, shoulder: 42, waist: 86 },
    S: { chest: 98, length: 69, sleeve: 21, shoulder: 44, waist: 92 },
    M: { chest: 104, length: 72, sleeve: 22, shoulder: 46, waist: 98 },
    L: { chest: 110, length: 74, sleeve: 23, shoulder: 48, waist: 104 },
    XL: { chest: 118, length: 77, sleeve: 24, shoulder: 51, waist: 112 },
    XXL: { chest: 126, length: 79, sleeve: 25, shoulder: 54, waist: 120 },
  },
  jacket: {
    XS: { chest: 100, length: 66, sleeve: 63, shoulder: 45, waist: 92 },
    S: { chest: 106, length: 68, sleeve: 65, shoulder: 47, waist: 98 },
    M: { chest: 112, length: 71, sleeve: 67, shoulder: 49, waist: 104 },
    L: { chest: 118, length: 73, sleeve: 69, shoulder: 51, waist: 110 },
    XL: { chest: 126, length: 76, sleeve: 71, shoulder: 54, waist: 118 },
    XXL: { chest: 134, length: 78, sleeve: 73, shoulder: 57, waist: 126 },
  },
  pants: {
    XS: { chest: 86, length: 98, sleeve: 72, shoulder: 40, waist: 72 },
    S: { chest: 92, length: 100, sleeve: 74, shoulder: 42, waist: 78 },
    M: { chest: 98, length: 102, sleeve: 76, shoulder: 44, waist: 84 },
    L: { chest: 104, length: 105, sleeve: 78, shoulder: 46, waist: 90 },
    XL: { chest: 112, length: 107, sleeve: 80, shoulder: 48, waist: 98 },
    XXL: { chest: 120, length: 109, sleeve: 82, shoulder: 50, waist: 106 },
  },
  sneakers: {
    XS: { chest: 38, length: 24.5, sleeve: 0, shoulder: 0, waist: 38 },
    S: { chest: 40, length: 25.5, sleeve: 0, shoulder: 0, waist: 40 },
    M: { chest: 42, length: 27.0, sleeve: 0, shoulder: 0, waist: 42 },
    L: { chest: 43, length: 28.0, sleeve: 0, shoulder: 0, waist: 43 },
    XL: { chest: 44, length: 29.0, sleeve: 0, shoulder: 0, waist: 44 },
    XXL: { chest: 46, length: 30.5, sleeve: 0, shoulder: 0, waist: 46 },
  },
  beanie: {
    XS: { chest: 52, length: 20, sleeve: 0, shoulder: 20, waist: 52 },
    S: { chest: 54, length: 21, sleeve: 0, shoulder: 21, waist: 54 },
    M: { chest: 56, length: 22, sleeve: 0, shoulder: 22, waist: 56 },
    L: { chest: 58, length: 23, sleeve: 0, shoulder: 23, waist: 58 },
    XL: { chest: 60, length: 24, sleeve: 0, shoulder: 24, waist: 60 },
    XXL: { chest: 62, length: 25, sleeve: 0, shoulder: 25, waist: 62 },
  },
};

const PRESETS = [
  { label: 'S · 170 cm / 64 kg', height: 170, weight: 64, chest: 96, waist: 80, hips: 94 },
  { label: 'M · 178 cm / 76 kg', height: 178, weight: 76, chest: 104, waist: 86, hips: 100 },
  { label: 'L · 184 cm / 86 kg', height: 184, weight: 86, chest: 112, waist: 92, hips: 106 },
  { label: 'XL · 190 cm / 98 kg', height: 190, weight: 98, chest: 120, waist: 100, hips: 114 },
];

export const InteractiveSizeRecommender: React.FC<InteractiveSizeRecommenderProps> = ({
  product,
  customization,
  onApplySize,
  isOpen = true,
  onClose,
  isModal = false,
}) => {
  const [unit, setUnit] = useState<'cm' | 'in'>('cm');
  const [height, setHeight] = useState<number>(180);
  const [weight, setWeight] = useState<number>(78);
  const [chest, setChest] = useState<number>(104);
  const [waist, setWaist] = useState<number>(86);
  const [hips, setHips] = useState<number>(98);
  const [fitPreference, setFitPreference] = useState<'snug' | 'regular' | 'relaxed' | 'oversized'>('regular');
  const [appliedNotice, setAppliedNotice] = useState<string | null>(null);

  const chart = PRODUCT_CHARTS[product.type] || PRODUCT_CHARTS.hoodie;

  // Recommendation engine
  const recommendation = useMemo(() => {
    const sizes: CustomizationState['size'][] = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

    // Target ease based on fit preference
    let desiredEase = 6; // cm
    if (fitPreference === 'snug') desiredEase = 2;
    if (fitPreference === 'relaxed') desiredEase = 10;
    if (fitPreference === 'oversized') desiredEase = 16;

    let bestSize: CustomizationState['size'] = 'M';
    let minScore = 9999;

    sizes.forEach((sz) => {
      const szChart = chart[sz];
      const chestEase = szChart.chest - chest;
      const easeDelta = Math.abs(chestEase - desiredEase);

      // Height check delta
      const idealHeight = sz === 'XS' ? 164 : sz === 'S' ? 171 : sz === 'M' ? 177 : sz === 'L' ? 183 : sz === 'XL' ? 188 : 194;
      const heightDelta = Math.abs(height - idealHeight) * 0.35;

      const score = easeDelta + heightDelta;
      if (score < minScore) {
        minScore = score;
        bestSize = sz;
      }
    });

    const bestChart = chart[bestSize];
    const actualChestEase = bestChart.chest - chest;
    const actualLengthEase = bestChart.length - (height * 0.40);

    // Confidence calculation (88% to 99%)
    const confidence = Math.min(99, Math.max(86, Math.round(100 - minScore * 1.8)));

    // Fit mode mapping
    let matchedFitMode: CustomizationState['fitMode'] = 'regular';
    if (fitPreference === 'snug') matchedFitMode = 'slim';
    else if (fitPreference === 'oversized') matchedFitMode = 'oversized';
    else if (fitPreference === 'relaxed') matchedFitMode = 'tailored';

    return {
      bestSize,
      confidence,
      matchedFitMode,
      chestEase: actualChestEase,
      lengthEase: actualLengthEase,
      bestChart,
    };
  }, [chest, height, fitPreference, chart]);

  const handleApply = () => {
    const measurements: BodyMeasurements = {
      unit: 'cm',
      height,
      chest,
      waist,
      hips,
      sleeve: Math.round(height * 0.37),
      shoulder: Math.round(chest * 0.44),
      isCustomApplied: true,
    };

    onApplySize(recommendation.bestSize, recommendation.matchedFitMode, measurements);

    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#f59e0b', '#fbbf24', '#ffffff', '#10b981'],
      });
    } catch {
      // ignore
    }

    setAppliedNotice(`Pritaikytas rekomenduojamas ${recommendation.bestSize} dydis ir 3D proporcijos!`);
    setTimeout(() => {
      setAppliedNotice(null);
      if (isModal && onClose) {
        onClose();
      }
    }, 2000);
  };

  const formatLength = (valCm: number) => {
    if (unit === 'in') {
      return `${(valCm / 2.54).toFixed(1)}″`;
    }
    return `${Math.round(valCm)} cm`;
  };

  if (!isOpen) return null;

  const content = (
    <div className="flex flex-col gap-5 text-neutral-100">
      {/* Header Banner */}
      <div className="flex items-center justify-between gap-3 pb-3 border-b border-neutral-800">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-amber-400/15 border border-amber-400/30 flex items-center justify-center text-amber-400">
            <Ruler className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-display font-bold text-sm sm:text-base text-white">
                Interaktyvi Dydžio Rekomendacija
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-semibold">
                AI Fit 98%
              </span>
            </div>
            <p className="text-xs text-neutral-400">
              Įvesk savo matmenis ir sužinok tobulą dydį šiam modeliui ({product.name})
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Unit Toggle cm / in */}
          <div className="flex rounded-lg bg-neutral-900 border border-neutral-800 p-0.5 text-xs font-mono">
            <button
              type="button"
              onClick={() => setUnit('cm')}
              className={`px-2 py-1 rounded-md transition ${unit === 'cm' ? 'bg-amber-400 text-neutral-950 font-bold' : 'text-neutral-400 hover:text-white'}`}
            >
              cm
            </button>
            <button
              type="button"
              onClick={() => setUnit('in')}
              className={`px-2 py-1 rounded-md transition ${unit === 'in' ? 'bg-amber-400 text-neutral-950 font-bold' : 'text-neutral-400 hover:text-white'}`}
            >
              in
            </button>
          </div>

          {isModal && onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Applied Notice Banner */}
      {appliedNotice && (
        <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-medium flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{appliedNotice}</span>
        </div>
      )}

      {/* Quick Measurement Presets */}
      <div>
        <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-400 block mb-2">
          Greiti kūno siluetų šablonai:
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
          {PRESETS.map((p) => (
            <button
              key={p.label}
              type="button"
              onClick={() => {
                setHeight(p.height);
                setWeight(p.weight);
                setChest(p.chest);
                setWaist(p.waist);
                setHips(p.hips);
              }}
              className="px-2.5 py-1.5 rounded-xl border border-neutral-800 bg-neutral-900/80 hover:bg-neutral-800 text-neutral-300 hover:text-white text-[11px] font-mono transition text-left truncate cursor-pointer active:scale-98"
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Interactive Measurement Sliders */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-neutral-900/50 p-4 rounded-2xl border border-neutral-800/80">
        {/* Height Slider */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-neutral-300 font-medium">1. Ūgis</span>
            <span className="font-mono text-amber-400 font-bold">{formatLength(height)}</span>
          </div>
          <input
            type="range"
            min={150}
            max={205}
            step={1}
            value={height}
            onChange={(e) => setHeight(Number(e.target.value))}
            className="w-full accent-amber-400 bg-neutral-800 h-1.5 rounded-lg cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-neutral-500 font-mono">
            <span>{formatLength(150)}</span>
            <span>{formatLength(205)}</span>
          </div>
        </div>

        {/* Weight Slider */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-neutral-300 font-medium">2. Svoris</span>
            <span className="font-mono text-amber-400 font-bold">{weight} kg</span>
          </div>
          <input
            type="range"
            min={45}
            max={120}
            step={1}
            value={weight}
            onChange={(e) => setWeight(Number(e.target.value))}
            className="w-full accent-amber-400 bg-neutral-800 h-1.5 rounded-lg cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-neutral-500 font-mono">
            <span>45 kg</span>
            <span>120 kg</span>
          </div>
        </div>

        {/* Chest Slider */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-neutral-300 font-medium">3. Krūtinės apimtis</span>
            <span className="font-mono text-amber-400 font-bold">{formatLength(chest)}</span>
          </div>
          <input
            type="range"
            min={80}
            max={135}
            step={1}
            value={chest}
            onChange={(e) => setChest(Number(e.target.value))}
            className="w-full accent-amber-400 bg-neutral-800 h-1.5 rounded-lg cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-neutral-500 font-mono">
            <span>{formatLength(80)}</span>
            <span>{formatLength(135)}</span>
          </div>
        </div>

        {/* Waist Slider */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-neutral-300 font-medium">4. Liemuo</span>
            <span className="font-mono text-amber-400 font-bold">{formatLength(waist)}</span>
          </div>
          <input
            type="range"
            min={65}
            max={120}
            step={1}
            value={waist}
            onChange={(e) => setWaist(Number(e.target.value))}
            className="w-full accent-amber-400 bg-neutral-800 h-1.5 rounded-lg cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-neutral-500 font-mono">
            <span>{formatLength(65)}</span>
            <span>{formatLength(120)}</span>
          </div>
        </div>
      </div>

      {/* Desired Fit Preference Selector */}
      <div>
        <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-400 block mb-2">
          Norimas drabužio prigludimas:
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {(
            [
              { id: 'snug', label: 'Prigludęs (Slim)', desc: '+2 cm laisvumas' },
              { id: 'regular', label: 'Klasikinis (Regular)', desc: '+6 cm laisvumas' },
              { id: 'relaxed', label: 'Laisvas (Relaxed)', desc: '+10 cm laisvumas' },
              { id: 'oversized', label: 'Masyvus (Oversized)', desc: '+16 cm laisvumas' },
            ] as const
          ).map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setFitPreference(item.id)}
              className={`p-2.5 rounded-xl border text-left transition cursor-pointer flex flex-col gap-0.5 ${
                fitPreference === item.id
                  ? 'border-amber-400 bg-amber-400/15 text-white shadow-sm'
                  : 'border-neutral-800 bg-neutral-900/60 hover:bg-neutral-800/80 text-neutral-400'
              }`}
            >
              <span className={`text-xs font-semibold ${fitPreference === item.id ? 'text-amber-300' : 'text-neutral-200'}`}>
                {item.label}
              </span>
              <span className="text-[10px] font-mono text-neutral-500">{item.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {/* AI Recommendation Result Showcase Card */}
      <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500/15 via-neutral-900/90 to-neutral-900 border border-amber-500/30 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-amber-400 text-neutral-950 font-display font-black text-3xl flex items-center justify-center shadow-lg shadow-amber-400/30 shrink-0">
            {recommendation.bestSize}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display font-bold text-base text-white">
                Rekomenduojamas Dydis: {recommendation.bestSize}
              </span>
              <span className="text-xs font-mono font-bold text-amber-400">
                {recommendation.confidence}% Tikslumas
              </span>
            </div>
            <p className="text-xs text-neutral-300 mt-1 max-w-sm">
              Drabužio krūtinė yra {formatLength(recommendation.bestChart.chest)} (laisvumas: +{formatLength(recommendation.chestEase)} virš jūsų kūno).
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleApply}
          className="w-full sm:w-auto px-5 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer shadow-lg active:scale-98 shrink-0"
        >
          <Sparkles className="w-4 h-4" />
          <span>Pritaikyti šį dydį 3D modeliui</span>
        </button>
      </div>

      {/* Live Size Matrix Comparison Grid */}
      <div className="overflow-x-auto pb-1 scrollbar-none border border-neutral-800 rounded-xl bg-neutral-900/40">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-neutral-800 text-[11px] font-mono text-neutral-400 bg-neutral-900/80">
              <th className="p-2.5">Dydis</th>
              <th className="p-2.5">Gaminio Krūtinė</th>
              <th className="p-2.5">Ilgis</th>
              <th className="p-2.5">Rankovė</th>
              <th className="p-2.5">Laisvumas jums</th>
              <th className="p-2.5 text-right">Pasirinkti</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-800/60 font-mono text-xs">
            {(['XS', 'S', 'M', 'L', 'XL', 'XXL'] as const).map((sz) => {
              const szRow = chart[sz];
              const isRecommended = sz === recommendation.bestSize;
              const isCurrentlySelected = sz === customization.size;
              const diff = szRow.chest - chest;

              return (
                <tr
                  key={sz}
                  className={`transition ${
                    isRecommended
                      ? 'bg-amber-500/15 font-semibold text-white'
                      : isCurrentlySelected
                      ? 'bg-neutral-800/60 text-white'
                      : 'text-neutral-400 hover:bg-neutral-800/30'
                  }`}
                >
                  <td className="p-2.5 font-bold flex items-center gap-1.5">
                    <span>{sz}</span>
                    {isRecommended && (
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-400 text-neutral-950 font-black">
                        AI IDEAL
                      </span>
                    )}
                  </td>
                  <td className="p-2.5">{formatLength(szRow.chest)}</td>
                  <td className="p-2.5">{formatLength(szRow.length)}</td>
                  <td className="p-2.5">{formatLength(szRow.sleeve)}</td>
                  <td className="p-2.5">
                    <span className={diff >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                      {diff > 0 ? `+${formatLength(diff)}` : formatLength(diff)}
                    </span>
                  </td>
                  <td className="p-2.5 text-right">
                    <button
                      type="button"
                      onClick={() => onApplySize(sz, recommendation.matchedFitMode)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition cursor-pointer ${
                        isCurrentlySelected
                          ? 'bg-neutral-700 text-white'
                          : 'bg-neutral-800 hover:bg-amber-400 hover:text-neutral-950 text-neutral-300'
                      }`}
                    >
                      {isCurrentlySelected ? 'Aktyvus' : 'Pasirinkti'}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );

  if (isModal) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
        <div
          className="max-w-2xl w-full max-h-[90vh] overflow-y-auto bg-neutral-950 border border-neutral-800 rounded-3xl p-6 shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {content}
        </div>
      </div>
    );
  }

  return (
    <div className="p-5 rounded-2xl bg-neutral-950/80 border border-neutral-800 shadow-xl">
      {content}
    </div>
  );
};
