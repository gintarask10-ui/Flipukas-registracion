import React from 'react';
import { Grid, Layers, Palette, RefreshCw, RotateCw, Sliders } from 'lucide-react';
import { CustomPatternConfig, PatternType } from '../../types/clothing';

interface PatternToolProps {
  patternConfig: CustomPatternConfig;
  onChangePattern: (config: CustomPatternConfig) => void;
  baseColor: string;
}

export const PatternTool: React.FC<PatternToolProps> = ({
  patternConfig,
  onChangePattern,
  baseColor,
}) => {
  const PATTERNS: { id: PatternType; label: string; desc: string; icon: string }[] = [
    { id: 'none', label: 'Be rašto', desc: 'Vienspalvis audinys', icon: '◻️' },
    { id: 'houndstooth', label: 'Žąsies kojelė', desc: 'Klasikinė mados tekstūra', icon: '🏁' },
    { id: 'cybergrid', label: 'Kiber gardelė', desc: 'Techninis linijinis tinklelis', icon: '▦' },
    { id: 'tartan', label: 'Languotas pledas', desc: 'Šiuolaikinis languotas raštas', icon: '🪟' },
    { id: 'pinstripe', label: 'Smulkūs dryžiai', desc: 'Elegantiškas pinstripe', icon: '|||' },
    { id: 'dots', label: 'Polka Dots', desc: 'Ritmiški taškučiai', icon: '•••' },
    { id: 'waves', label: 'Organinės bangos', desc: 'Sklandžios bangų kreivės', icon: '〰️' },
    { id: 'camo', label: 'Miesto kamufliažas', desc: 'Modernus abstrakus kamufliažas', icon: '🪖' },
  ];

  const PRESET_COLORS = [
    { label: 'Gintaras', hex: '#d97706' },
    { label: 'Sniego Balta', hex: '#ffffff' },
    { label: 'Obsidianas', hex: '#18181b' },
    { label: 'Kiber Mėlyna', hex: '#38bdf8' },
    { label: 'Raudona', hex: '#ef4444' },
    { label: 'Alyvuogė', hex: '#4d5e46' },
  ];

  return (
    <div className="bg-neutral-900/70 p-5 rounded-2xl border border-neutral-800 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Grid className="w-4 h-4 text-amber-400" />
          <h4 className="text-xs font-semibold text-white uppercase tracking-wider font-mono">
            Raštų Generatorius (Custom Pattern Tool)
          </h4>
        </div>
        <span className="text-[11px] font-mono text-neutral-400">
          Realaus laiko audinio tekstūravimas
        </span>
      </div>

      <p className="text-xs text-neutral-400 leading-relaxed">
        Pasirink norimą raštą, kuris vientisai (tileable) padengs 3D drabužio medžiagą realiu laiku:
      </p>

      {/* Pattern Type Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {PATTERNS.map((p) => {
          const isSelected = patternConfig.type === p.id;
          return (
            <button
              key={p.id}
              onClick={() => onChangePattern({ ...patternConfig, type: p.id })}
              className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
                isSelected
                  ? 'border-amber-400 bg-amber-400/10 text-white ring-1 ring-amber-400/30'
                  : 'border-neutral-800 bg-neutral-950/80 text-neutral-400 hover:text-white hover:border-neutral-700'
              }`}
            >
              <div className="text-lg mb-1">{p.icon}</div>
              <div>
                <div className="text-xs font-semibold text-neutral-200">{p.label}</div>
                <div className="text-[10px] text-neutral-500 truncate">{p.desc}</div>
              </div>
            </button>
          );
        })}
      </div>

      {patternConfig.type !== 'none' && (
        <div className="flex flex-col gap-3 pt-3 border-t border-neutral-800">
          {/* Pattern Accent Color */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-neutral-300 font-medium">Rašto atspalvis:</span>
            <div className="flex items-center gap-1.5">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c.hex}
                  onClick={() => onChangePattern({ ...patternConfig, secondaryColor: c.hex })}
                  title={c.label}
                  className={`w-6 h-6 rounded-full border transition-transform ${
                    patternConfig.secondaryColor === c.hex
                      ? 'scale-110 border-amber-400 ring-2 ring-amber-400/30'
                      : 'border-neutral-700 hover:scale-105'
                  }`}
                  style={{ backgroundColor: c.hex }}
                />
              ))}
            </div>
          </div>

          {/* Scale Slider */}
          <div className="flex items-center justify-between gap-4">
            <span className="text-xs text-neutral-400">Rašto tankis (Mastelis):</span>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min={1}
                max={8}
                value={patternConfig.scale}
                onChange={(e) =>
                  onChangePattern({ ...patternConfig, scale: Number(e.target.value) })
                }
                className="w-28 accent-amber-400 cursor-pointer"
              />
              <span className="text-xs font-mono text-white w-6 text-right">
                {patternConfig.scale}x
              </span>
            </div>
          </div>

          {/* Opacity Slider */}
          <div className="flex items-center justify-between gap-4">
            <span className="text-xs text-neutral-400">Rašto ryškumas:</span>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min={0.15}
                max={1.0}
                step={0.05}
                value={patternConfig.opacity}
                onChange={(e) =>
                  onChangePattern({ ...patternConfig, opacity: Number(e.target.value) })
                }
                className="w-28 accent-amber-400 cursor-pointer"
              />
              <span className="text-xs font-mono text-white w-6 text-right">
                {Math.round(patternConfig.opacity * 100)}%
              </span>
            </div>
          </div>

          {/* Rotation Angle */}
          <div className="flex items-center justify-between gap-4">
            <span className="text-xs text-neutral-400">Pasukimo kampas:</span>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min={0}
                max={90}
                step={15}
                value={patternConfig.rotation}
                onChange={(e) =>
                  onChangePattern({ ...patternConfig, rotation: Number(e.target.value) })
                }
                className="w-28 accent-amber-400 cursor-pointer"
              />
              <span className="text-xs font-mono text-white w-6 text-right">
                {patternConfig.rotation}°
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
