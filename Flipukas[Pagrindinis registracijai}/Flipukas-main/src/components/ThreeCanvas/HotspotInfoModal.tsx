import React from 'react';
import {
  Sparkles,
  Scissors,
  Layers,
  ShieldCheck,
  ZoomIn,
  ChevronLeft,
  ChevronRight,
  X,
  Compass,
  CheckCircle2,
  Info,
} from 'lucide-react';
import { GarmentHotspot } from '../../data/garmentHotspots';

interface HotspotInfoModalProps {
  hotspot: GarmentHotspot | null;
  onClose: () => void;
  onNext?: () => void;
  onPrev?: () => void;
  onFocusHotspot?: (hotspot: GarmentHotspot) => void;
}

export const HotspotInfoModal: React.FC<HotspotInfoModalProps> = ({
  hotspot,
  onClose,
  onNext,
  onPrev,
  onFocusHotspot,
}) => {
  if (!hotspot) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="max-w-xl w-full bg-neutral-950 border border-neutral-800 rounded-3xl p-6 sm:p-7 shadow-2xl flex flex-col gap-5 text-neutral-100 relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow Ambient */}
        <div className="absolute -top-24 right-0 w-60 h-32 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between gap-3 relative z-10 border-b border-neutral-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400/15 border border-amber-400/30 flex items-center justify-center text-amber-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-neutral-800 text-amber-400 border border-neutral-700 uppercase font-semibold">
                  3D Techninis Taškas
                </span>
                <span className="text-xs font-mono text-neutral-400">
                  {hotspot.category === 'fabric'
                    ? 'Audinio Savybė'
                    : hotspot.category === 'construction'
                    ? 'Konstrukcija'
                    : hotspot.category === 'seam'
                    ? 'Siūlės Mazgas'
                    : 'Ergonomika'}
                </span>
              </div>
              <h3 className="font-display font-bold text-lg text-white mt-0.5">
                {hotspot.title}
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-900 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Subtitle / Overview */}
        <p className="text-xs text-neutral-300 font-medium">
          {hotspot.subtitle}
        </p>

        {/* Two-Column Tech Breakdown: Fabric & Construction */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Section 1: Fabric Properties */}
          <div className="p-4 rounded-2xl bg-neutral-900/70 border border-neutral-800/80 flex flex-col gap-2.5">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
              <Layers className="w-4 h-4 text-amber-400" />
              <span>Audinio Savybės</span>
            </div>

            <div className="flex flex-col gap-2 text-xs font-mono">
              <div className="flex flex-col">
                <span className="text-[10px] text-neutral-500 uppercase">Svoris & Tankis:</span>
                <span className="text-neutral-200 font-semibold">{hotspot.fabricTech.gsm}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-neutral-500 uppercase">Sudėtis:</span>
                <span className="text-neutral-200">{hotspot.fabricTech.composition}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-neutral-500 uppercase">Pynimas:</span>
                <span className="text-neutral-200">{hotspot.fabricTech.weave}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-neutral-500 uppercase">Kvėpavimas / Garai:</span>
                <span className="text-neutral-200">{hotspot.fabricTech.breathability}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-neutral-500 uppercase">Atsparumas Trintuvui:</span>
                <span className="text-neutral-200">{hotspot.fabricTech.resistance}</span>
              </div>
              {hotspot.fabricTech.stretch && (
                <div className="flex flex-col">
                  <span className="text-[10px] text-neutral-500 uppercase">Tamprumas:</span>
                  <span className="text-neutral-200">{hotspot.fabricTech.stretch}</span>
                </div>
              )}
            </div>
          </div>

          {/* Section 2: Construction & Seam Techniques */}
          <div className="p-4 rounded-2xl bg-neutral-900/70 border border-neutral-800/80 flex flex-col gap-2.5">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
              <Scissors className="w-4 h-4 text-amber-400" />
              <span>Konstrukcijos Technika</span>
            </div>

            <div className="flex flex-col gap-2 text-xs font-mono">
              <div className="flex flex-col">
                <span className="text-[10px] text-neutral-500 uppercase">Dygsnio Tipas:</span>
                <span className="text-neutral-200 font-semibold">{hotspot.constructionTech.stitchType}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-neutral-500 uppercase">Sutvirtinimas:</span>
                <span className="text-neutral-200">{hotspot.constructionTech.reinforcement}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-neutral-500 uppercase">Patvarumo Standartas:</span>
                <span className="text-neutral-200">{hotspot.constructionTech.durabilityStandard}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-neutral-500 uppercase">Meistriškumo Pastaba:</span>
                <span className="text-neutral-300 text-[11px] leading-relaxed font-sans mt-0.5">
                  {hotspot.constructionTech.craftNote}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Quality Guarantee Seal */}
        <div className="flex items-center gap-3 p-3 rounded-xl bg-amber-400/10 border border-amber-400/20 text-xs text-amber-300">
          <ShieldCheck className="w-5 h-5 text-amber-400 shrink-0" />
          <span>
            Visi Flipukas gaminiai atitinka pramoninio siuvimo standartus ir yra tikrinami individualiai prieš išsiunčiant.
          </span>
        </div>

        {/* Footer Navigation & Zoom Action */}
        <div className="flex items-center justify-between gap-3 pt-2 border-t border-neutral-800">
          <div className="flex items-center gap-1.5">
            {onPrev && (
              <button
                type="button"
                onClick={onPrev}
                className="p-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white transition cursor-pointer"
                title="Ankstesnis taškas"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            )}
            {onNext && (
              <button
                type="button"
                onClick={onNext}
                className="p-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white transition cursor-pointer"
                title="Kitas taškas"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {onFocusHotspot && (
              <button
                type="button"
                onClick={() => {
                  onFocusHotspot(hotspot);
                  onClose();
                }}
                className="px-4 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 hover:text-white font-medium text-xs transition flex items-center gap-1.5 cursor-pointer"
              >
                <ZoomIn className="w-4 h-4 text-amber-400" />
                <span>Priartinti 3D zoną</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold text-xs transition cursor-pointer shadow-md"
            >
              Supratau
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
