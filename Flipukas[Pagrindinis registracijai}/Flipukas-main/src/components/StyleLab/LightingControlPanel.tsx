import React from 'react';
import {
  Check,
  Moon,
  RotateCcw,
  Sliders,
  Sparkles,
  Sun,
  SunMedium,
  X,
  Zap,
} from 'lucide-react';
import { CustomizationState } from '../../types/clothing';

export interface LightingControlPanelProps {
  isOpen: boolean;
  onClose: () => void;
  customization: CustomizationState;
  onUpdateLighting: (preset: CustomizationState['lightingPreset'], brightness?: number) => void;
  onUpdateTheme?: (theme: 'bright' | 'dark') => void;
}

export interface LightingOption {
  id: CustomizationState['lightingPreset'];
  name: string;
  subtitle: string;
  description: string;
  icon: React.ReactNode;
  gradient: string;
  badge: string;
  highlights: string[];
}

export const LIGHTING_PRESETS: LightingOption[] = [
  {
    id: 'studio',
    name: 'Studio White',
    subtitle: 'High-Key Fotostudija',
    description: 'Neutrali, tolygi 5500K balta šviesa. Idealiai tinka tiksliam audinio spalvų ir siūlių vertinimui.',
    icon: <SunMedium className="w-4 h-4 text-amber-400" />,
    gradient: 'from-neutral-200 via-neutral-100 to-amber-100/80',
    badge: 'Neutrali 5500K',
    highlights: ['Subalansuoti šešėliai', 'Natūralus audinio reljefas', 'Aukščiausias spalvų tikslumas'],
  },
  {
    id: 'neon-night',
    name: 'Neon Night',
    subtitle: 'Kiberpank & Neoninė Naktis',
    description: 'Ryški elektrinė žydra (cyan) ir neoninė magenta/gintaro šviesa su tamsiais dramatiškais kontrastais.',
    icon: <Zap className="w-4 h-4 text-cyan-400" />,
    gradient: 'from-cyan-950 via-purple-950 to-pink-900',
    badge: 'Kiberpank Kontrastas',
    highlights: ['Elektrinis cyan kontūras', 'Neon magenta atspindžiai', 'Gilus naktinis kontrastas'],
  },
  {
    id: 'golden-hour',
    name: 'Golden Hour',
    subtitle: 'Auksinė Saulėlydžio Šviesa',
    description: 'Šilta 3000K vakaro saulėlydžio šviesa su minkštais dangaus atspindžiais ir giliais aksominiais šešėliais.',
    icon: <Sun className="w-4 h-4 text-amber-400" />,
    gradient: 'from-amber-900/60 via-orange-950/70 to-yellow-900/50',
    badge: 'Šilta 3000K',
    highlights: ['Auksinis kraštų spindesys', 'Aksominiai šešėliai', 'Prabangus audinio kritimas'],
  },
  {
    id: 'daylight',
    name: 'Natural Daylight',
    subtitle: 'Giedra Dienos Šviesa',
    description: 'Skaidri, atvira natūrali dienos šviesa su lengvu dangaus melsvumu ir skaidriais tonais.',
    icon: <Sparkles className="w-4 h-4 text-sky-400" />,
    gradient: 'from-sky-950/70 via-blue-950/60 to-slate-900',
    badge: 'Giedra Diena',
    highlights: ['Atvira saulė', 'Švelnus dangaus atspindys', 'Grynas šviesumas'],
  },
];

export const LightingControlPanel: React.FC<LightingControlPanelProps> = ({
  isOpen,
  onClose,
  customization,
  onUpdateLighting,
  onUpdateTheme,
}) => {
  if (!isOpen) return null;

  const currentPreset = customization.lightingPreset;
  const currentBrightness = customization.studioBrightness || 1.25;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-xl bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-neutral-800 flex items-center justify-between bg-neutral-950/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-amber-400">
              <Sun className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-white text-base flex items-center gap-2">
                3D Apšvietimo & Studijos Valdymas
              </h3>
              <p className="text-xs text-neutral-400">
                Pasirink aplinkos apšvietimo profilį drabužio audinio ir grafikos vizualizacijai
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto max-h-[75vh] flex flex-col gap-6">
          {/* Lighting Presets Grid */}
          <div>
            <label className="text-xs font-mono font-medium text-neutral-400 uppercase tracking-wider block mb-3">
              Apšvietimo Aplinkos Presetas
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {LIGHTING_PRESETS.map((item) => {
                const isSelected =
                  currentPreset === item.id ||
                  (item.id === 'neon-night' && currentPreset === 'cyber');

                return (
                  <button
                    key={item.id}
                    onClick={() => onUpdateLighting(item.id, currentBrightness)}
                    className={`relative p-3.5 rounded-xl border text-left transition-all duration-200 cursor-pointer overflow-hidden ${
                      isSelected
                        ? 'border-amber-400 bg-neutral-800/90 shadow-lg shadow-amber-400/10 ring-1 ring-amber-400/30'
                        : 'border-neutral-800 bg-neutral-950/60 hover:border-neutral-700 hover:bg-neutral-800/40'
                    }`}
                  >
                    {/* Atmospheric background preview accent */}
                    <div
                      className={`absolute top-0 right-0 w-24 h-24 rounded-full blur-2xl opacity-20 pointer-events-none bg-gradient-to-br ${item.gradient}`}
                    />

                    <div className="flex items-start justify-between relative z-10 mb-2">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                            isSelected
                              ? 'bg-amber-400 text-neutral-950 font-bold'
                              : 'bg-neutral-800 text-neutral-300'
                          }`}
                        >
                          {item.icon}
                        </div>
                        <div>
                          <div className="font-semibold text-sm text-white">{item.name}</div>
                          <div className="text-[11px] text-neutral-400">{item.subtitle}</div>
                        </div>
                      </div>

                      {isSelected ? (
                        <span className="w-5 h-5 rounded-full bg-amber-400 text-neutral-950 flex items-center justify-center">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-neutral-800 text-neutral-400">
                          {item.badge}
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-neutral-400 mb-2.5 relative z-10 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>

                    <div className="flex flex-wrap gap-1 relative z-10">
                      {item.highlights.map((h, i) => (
                        <span
                          key={i}
                          className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-neutral-900/80 text-neutral-400 border border-neutral-800"
                        >
                          {h}
                        </span>
                      ))}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Intensity / Brightness Multiplier */}
          <div className="p-4 rounded-xl bg-neutral-950/60 border border-neutral-800 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-semibold text-neutral-200">
                  Šviesos Ryškumas & Ekspozicija
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-amber-400 font-bold">
                  {Math.round(currentBrightness * 100)}%
                </span>
                <button
                  onClick={() => onUpdateLighting(currentPreset, 1.25)}
                  title="Atstatyti standartinį ryškumą (125%)"
                  className="p-1 rounded text-neutral-500 hover:text-neutral-300 hover:bg-neutral-800 transition"
                >
                  <RotateCcw className="w-3 h-3" />
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <SunMedium className="w-4 h-4 text-neutral-500" />
              <input
                type="range"
                min="0.7"
                max="2.0"
                step="0.05"
                value={currentBrightness}
                onChange={(e) => onUpdateLighting(currentPreset, parseFloat(e.target.value))}
                className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
              />
              <Sun className="w-4 h-4 text-amber-400" />
            </div>

            <div className="flex justify-between text-[10px] font-mono text-neutral-500">
              <span>0.7x (Subtili)</span>
              <span>1.25x (Standartinė studija)</span>
              <span>2.0x (Maksimali)</span>
            </div>
          </div>

          {/* Studio Backdrop Environment */}
          {onUpdateTheme && (
            <div className="p-4 rounded-xl bg-neutral-950/60 border border-neutral-800 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-neutral-200 block">
                  3D Pasaulio Fono Tema
                </span>
                <span className="text-[11px] text-neutral-400">
                  Pasirink tarp švarios baltos fotostudijos arba tamsaus kiber podijumo fono
                </span>
              </div>

              <div className="flex items-center gap-1.5 p-1 bg-neutral-900 rounded-lg border border-neutral-800">
                <button
                  onClick={() => onUpdateTheme('bright')}
                  className={`px-3 py-1.5 rounded-md text-xs font-mono font-medium flex items-center gap-1.5 transition ${
                    customization.studioTheme === 'bright'
                      ? 'bg-amber-400 text-neutral-950 font-bold shadow'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  <Sun className="w-3.5 h-3.5" />
                  <span>Šviesi</span>
                </button>
                <button
                  onClick={() => onUpdateTheme('dark')}
                  className={`px-3 py-1.5 rounded-md text-xs font-mono font-medium flex items-center gap-1.5 transition ${
                    customization.studioTheme === 'dark'
                      ? 'bg-amber-400 text-neutral-950 font-bold shadow'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  <Moon className="w-3.5 h-3.5" />
                  <span>Tamsi</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-neutral-800 bg-neutral-950/70 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold text-xs transition cursor-pointer"
          >
            Taikyti ir Uždaryti
          </button>
        </div>
      </div>
    </div>
  );
};
