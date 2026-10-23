import React from 'react';
import { Check, Compass, Eye, Info, Sparkles, ZoomIn } from 'lucide-react';
import { MacroZone } from '../../types/clothing';

interface MacroViewControlsProps {
  activeZone: MacroZone;
  onSelectZone: (zone: MacroZone) => void;
  fabricName: string;
}

export const MacroViewControls: React.FC<MacroViewControlsProps> = ({
  activeZone,
  onSelectZone,
  fabricName,
}) => {
  const ZONES: { id: MacroZone; label: string; desc: string; zoomFactor: string }[] = [
    {
      id: 'full',
      label: 'Visas Drabužis',
      desc: 'Bendra proporcija ir siluetas (1x)',
      zoomFactor: '1x',
    },
    {
      id: 'fabric-weave',
      label: '🔬 Audinio Siūlai & Pynimas',
      desc: 'Makro žvilgsnis į verpalų pynimą ir pluošto tankį',
      zoomFactor: '30x',
    },
    {
      id: 'chest-design',
      label: '🪡 Tavo Dizainas & Siuviniai',
      desc: 'Krūtinės grafika, siuvinėjimo dygsniai ir reljefas',
      zoomFactor: '15x',
    },
    {
      id: 'hood-drawstrings',
      label: '🧶 Gobtuvas & Virvelės',
      desc: 'Pintas virvelių audinys ir metaliniai antgaliai',
      zoomFactor: '10x',
    },
    {
      id: 'pocket-seams',
      label: '🧵 Kišenės Dvigubos Siūlės',
      desc: 'Dviejų adatų sutvirtintas apsiuvas ir kraštas',
      zoomFactor: '12x',
    },
    {
      id: 'cuff-elastic',
      label: '⏱️ Rankogalių Trikotažas',
      desc: 'Elastingas vertikalaus rašto mezgimas',
      zoomFactor: '10x',
    },
  ];

  return (
    <div className="bg-neutral-900/70 p-5 rounded-2xl border border-neutral-800 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ZoomIn className="w-4 h-4 text-amber-400" />
          <h4 className="text-xs font-semibold text-white uppercase tracking-wider font-mono">
            Mikroskopinė Audinio Inspekcija (Macro View)
          </h4>
        </div>
        <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
          Ultra-HD PBR
        </span>
      </div>

      <p className="text-xs text-neutral-400 leading-relaxed">
        Pasirink norimą drabužio zoną, kad kamera akimirksniu prisiartintų iki audinio pluošto lygio:
      </p>

      {/* Target Zone Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {ZONES.map((z) => {
          const isSelected = activeZone === z.id;
          return (
            <button
              key={z.id}
              onClick={() => onSelectZone(z.id)}
              className={`p-3 rounded-xl border text-left transition-all flex items-start justify-between gap-2 ${
                isSelected
                  ? 'border-amber-400 bg-amber-400/10 text-white ring-1 ring-amber-400/30'
                  : 'border-neutral-800 bg-neutral-950/80 text-neutral-400 hover:text-white hover:border-neutral-700'
              }`}
            >
              <div>
                <div className="text-xs font-semibold text-neutral-200">{z.label}</div>
                <div className="text-[11px] text-neutral-500 mt-0.5 leading-tight">{z.desc}</div>
              </div>
              <span className="text-[10px] font-mono font-bold text-amber-400 px-1.5 py-0.5 rounded bg-neutral-900 border border-neutral-800 shrink-0">
                {z.zoomFactor}
              </span>
            </button>
          );
        })}
      </div>

      {/* Fabric Macro Technical Card */}
      <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 text-xs font-mono flex flex-col gap-2">
        <div className="flex items-center justify-between text-neutral-300 font-semibold">
          <span>Audinio specifikacija:</span>
          <span className="text-amber-400">{fabricName}</span>
        </div>
        <div className="grid grid-cols-2 gap-2 text-[11px] text-neutral-400 pt-1 border-t border-neutral-900">
          <div>Tankis: 380 GSM natūrali medvilnė</div>
          <div>Siūlas: 28/2 Ne šukuotinis verpalas</div>
          <div>Siūlė: Dviejų adatų grandininis apsiuvas</div>
          <div>Dygsnių dažnis: 4.8 dygsniai / cm</div>
        </div>
      </div>
    </div>
  );
};
