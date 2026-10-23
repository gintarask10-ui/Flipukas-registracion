import React, { useState, useEffect, useRef } from 'react';
import {
  Compass,
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
  X,
  Sparkles,
  Layers,
  Wand2,
  Check,
  ShoppingBag,
  RotateCw,
  Eye,
} from 'lucide-react';
import { CustomizationState, FabricMaterial, Product } from '../../types/clothing';

export type TourStepId = 'texture' | 'hardware' | 'custom-text' | 'full';

export interface TourStepConfig {
  id: TourStepId;
  stepNumber: number;
  titleLt: string;
  subtitleLt: string;
  tagLt: string;
  descriptionLt: string;
  featureKey: string;
  focusPoint: { xPercent: number; yPercent: number };
}

interface GuidedTourOverlayProps {
  isActive: boolean;
  onClose: () => void;
  product: Product;
  customization: CustomizationState;
  activeFabric: FabricMaterial;
  currentStepId: TourStepId;
  onStepChange: (stepId: TourStepId) => void;
  onAddToCart?: () => void;
}

export const GuidedTourOverlay: React.FC<GuidedTourOverlayProps> = ({
  isActive,
  onClose,
  product,
  customization,
  activeFabric,
  currentStepId,
  onStepChange,
  onAddToCart,
}) => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0); // 0 to 100
  const STEP_DURATION_MS = 6000; // 6 seconds per highlight
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(Date.now());

  const steps: TourStepConfig[] = [
    {
      id: 'texture',
      stepNumber: 1,
      titleLt: 'Audinio Tekstūra & Pynimo Kokybė',
      subtitleLt: 'Tactile Fabric Quality & Micro Weave',
      tagLt: '3D TEKSTŪRA',
      descriptionLt: `${activeFabric.nameLt} (${activeFabric.gsm || 380} g/m²) – natūralus pluošto pynimas su mikroskopiniu reljefu, sugeriantis ir atspindintis šviesą pagal fizikos dėsnius.`,
      featureKey: `${activeFabric.nameLt} • ${activeFabric.gsm || 380} GSM`,
      focusPoint: { xPercent: 50, yPercent: 42 },
    },
    {
      id: 'hardware',
      stepNumber: 2,
      titleLt: 'Furnitūros Detalės & Siūlės',
      subtitleLt: 'Hardware Precision & Seam Craft',
      tagLt: 'FURNITŪRA',
      descriptionLt: `Preciziškai integruotos detalės: lazeriu poliruoti metaliniai antgaliai, sustiprinti rankogalių apsiuvai ir patikimos siūlės, atlaikančios kasdienį dėvėjimą.`,
      featureKey: `Metalo apdaila: ${customization.hardwareColor === '#1c1917' ? 'Gunmetal juoda' : customization.hardwareColor}`,
      focusPoint: { xPercent: 38, yPercent: 54 },
    },
    {
      id: 'custom-text',
      stepNumber: 3,
      titleLt: 'Autorinis Tekstas & Monograma',
      subtitleLt: 'Custom Typography & Emblem Placement',
      tagLt: 'MONOGRAMA',
      descriptionLt: customization.customText
        ? `Tavo autorinis tekstas „${customization.customText}“ pozicijoje: ${customization.placement === 'chest' ? 'Priekis' : customization.placement === 'back' ? 'Nugara' : 'Kišenė'} su didelės raiškos siuvinėjimo efektu.`
        : `Autorinė monograma arba pasirinkta emblema („${customization.badgeType || 'Flipukas Atelier'}“), sukurta išskirtinai šiam modeliui.`,
      featureKey: customization.customText ? `„${customization.customText}“` : 'Autorinė emblema',
      focusPoint: { xPercent: 50, yPercent: 38 },
    },
    {
      id: 'full',
      stepNumber: 4,
      titleLt: 'Pilnas 3D Siluetas & Dinaminis Kritimas',
      subtitleLt: 'Hero Runway 360° & Dynamic Drape',
      tagLt: '360° RUNWAY',
      descriptionLt: `Dydis ${customization.size} (${customization.fitMode || 'regular'} siluetas). Audinys natūraliai krenta ir banguoja realiu laiku, atkartodamas judėjimą ant podiumo.`,
      featureKey: `${product.name} • ${product.basePrice} €`,
      focusPoint: { xPercent: 50, yPercent: 50 },
    },
  ];

  const currentStepIndex = Math.max(
    0,
    steps.findIndex((s) => s.id === currentStepId)
  );
  const currentStep = steps[currentStepIndex] || steps[0];

  // Auto-advance timer logic
  useEffect(() => {
    if (!isActive || !isPlaying) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    startTimeRef.current = Date.now();
    setProgress(0);

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      const pct = Math.min(100, (elapsed / STEP_DURATION_MS) * 100);
      setProgress(pct);

      if (elapsed >= STEP_DURATION_MS) {
        // Go to next step
        const nextIndex = (currentStepIndex + 1) % steps.length;
        onStepChange(steps[nextIndex].id);
        startTimeRef.current = Date.now();
        setProgress(0);
      }
    }, 50);

    timerRef.current = interval;

    return () => clearInterval(interval);
  }, [isActive, isPlaying, currentStepIndex, onStepChange, steps.length]);

  if (!isActive) return null;

  const handlePrev = () => {
    const prevIndex = (currentStepIndex - 1 + steps.length) % steps.length;
    onStepChange(steps[prevIndex].id);
    startTimeRef.current = Date.now();
    setProgress(0);
  };

  const handleNext = () => {
    const nextIndex = (currentStepIndex + 1) % steps.length;
    onStepChange(steps[nextIndex].id);
    startTimeRef.current = Date.now();
    setProgress(0);
  };

  return (
    <div className="absolute inset-0 z-30 pointer-events-none flex flex-col justify-between p-4 sm:p-6 animate-in fade-in duration-300">
      {/* Top HUD: Step Indicators & Exit Button */}
      <div className="flex items-center justify-between gap-3 pointer-events-auto">
        {/* Tour Status Pill */}
        <div className="bg-[#0e0e13]/90 backdrop-blur-xl border border-[#d4af37]/40 px-3.5 py-1.5 rounded-full flex items-center gap-2.5 shadow-2xl">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#d4af37] opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#d4af37]" />
          </span>
          <span className="text-[11px] font-mono uppercase tracking-[0.15em] text-[#f5e6b8] font-bold">
            Guided Tour • {currentStep.stepNumber} iš {steps.length}
          </span>
          <span className="text-stone-500">|</span>
          <span className="text-[10px] font-mono text-stone-300 hidden sm:inline">
            {currentStep.tagLt}
          </span>
        </div>

        {/* Step dots */}
        <div className="hidden md:flex items-center gap-1.5 bg-[#0e0e13]/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-stone-800">
          {steps.map((st, idx) => (
            <button
              key={st.id}
              onClick={() => {
                onStepChange(st.id);
                startTimeRef.current = Date.now();
                setProgress(0);
              }}
              title={st.titleLt}
              className={`h-2 rounded-full transition-all cursor-pointer ${
                idx === currentStepIndex
                  ? 'w-6 bg-[#d4af37]'
                  : 'w-2 bg-stone-700 hover:bg-stone-500'
              }`}
            />
          ))}
        </div>

        {/* Action Controls: Pause, Close */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            title={isPlaying ? 'Pristabdyti turą' : 'Tęsti turą'}
            className="p-2 rounded-xl bg-[#0e0e13]/90 hover:bg-stone-900 border border-stone-800 text-stone-300 hover:text-white transition cursor-pointer shadow-lg"
          >
            {isPlaying ? <Pause className="w-4 h-4 text-[#d4af37]" /> : <Play className="w-4 h-4 text-emerald-400" />}
          </button>
          <button
            onClick={onClose}
            title="Uždaryti turą"
            className="p-2 rounded-xl bg-[#0e0e13]/90 hover:bg-stone-900 border border-stone-800 text-stone-400 hover:text-white transition cursor-pointer shadow-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Center 3D Focus Holographic Ring */}
      <div
        className="absolute pointer-events-none transition-all duration-700 ease-out transform -translate-x-1/2 -translate-y-1/2"
        style={{
          left: `${currentStep.focusPoint.xPercent}%`,
          top: `${currentStep.focusPoint.yPercent}%`,
        }}
      >
        <div className="relative flex items-center justify-center">
          <div className="w-20 h-20 rounded-full border border-[#d4af37]/60 animate-ping opacity-35" />
          <div className="absolute w-12 h-12 rounded-full border-2 border-dashed border-[#d4af37] animate-spin opacity-80" />
          <div className="absolute w-3 h-3 rounded-full bg-[#d4af37] shadow-[0_0_12px_#d4af37]" />
          <div className="absolute -bottom-7 whitespace-nowrap bg-black/80 backdrop-blur-md px-2 py-0.5 rounded text-[10px] font-mono text-[#f5e6b8] border border-[#d4af37]/40 shadow-xl">
            {currentStep.tagLt}
          </div>
        </div>
      </div>

      {/* Bottom Floating Feature Card & Controls */}
      <div className="pointer-events-auto max-w-xl w-full mx-auto">
        <div className="bg-[#0e0e13]/95 backdrop-blur-2xl border border-[#d4af37]/40 rounded-3xl p-5 shadow-[0_15px_50px_rgba(0,0,0,0.85)] relative overflow-hidden">
          {/* Animated Progress Line */}
          <div className="absolute top-0 inset-x-0 h-1 bg-stone-800">
            <div
              className="h-full bg-gradient-to-r from-[#d4af37] to-[#f3e5ab] transition-all duration-75"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1.5 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#d4af37] px-2 py-0.5 rounded bg-[#d4af37]/15 border border-[#d4af37]/30">
                  {currentStep.tagLt}
                </span>
                <span className="text-xs font-mono text-stone-400">
                  {currentStep.featureKey}
                </span>
              </div>
              <h4 className="text-base sm:text-lg font-serif-luxury font-bold text-white tracking-tight">
                {currentStep.titleLt}
              </h4>
              <p className="text-xs text-stone-300 leading-relaxed font-light">
                {currentStep.descriptionLt}
              </p>
            </div>

            {/* Step Actions */}
            <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
              <button
                onClick={handlePrev}
                title="Ankstesnis žingsnis"
                className="p-2 rounded-xl bg-stone-900 border border-stone-800 text-stone-300 hover:text-white hover:border-[#d4af37]/40 transition cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={handleNext}
                title="Kitas žingsnis"
                className="px-3 py-2 rounded-xl bg-[#d4af37] hover:bg-[#e6c258] text-stone-950 font-bold text-xs font-serif-luxury transition flex items-center gap-1.5 cursor-pointer shadow-md"
              >
                <span>{currentStepIndex === steps.length - 1 ? 'Kartoti' : 'Kitas'}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Quick CTA on Final Step */}
          {currentStep.id === 'full' && onAddToCart && (
            <div className="mt-4 pt-3 border-t border-stone-800/80 flex items-center justify-between gap-3 animate-in fade-in">
              <div className="text-xs text-stone-300 font-mono">
                Modelis paruoštas: <strong className="text-white">{product.name} ({customization.size})</strong>
              </div>
              <button
                onClick={onAddToCart}
                className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-stone-950 font-bold text-xs font-serif-luxury transition flex items-center gap-1.5 cursor-pointer shadow-lg"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Įdėti į krepšelį</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
