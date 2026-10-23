import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  ZoomIn,
  ZoomOut,
  Sun,
  Layers,
  Scale,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Check,
  Info,
} from 'lucide-react';
import { FabricMaterial } from '../../types/clothing';

interface MacroWeaveViewerModalProps {
  fabric: FabricMaterial | null;
  isOpen: boolean;
  onClose: () => void;
  onApplyFabricToLab: (fabric: FabricMaterial) => void;
}

export const MacroWeaveViewerModal: React.FC<MacroWeaveViewerModalProps> = ({
  fabric,
  isOpen,
  onClose,
  onApplyFabricToLab,
}) => {
  const [zoomLevel, setZoomLevel] = useState<number>(3.5);
  const [lightAngle, setLightAngle] = useState<number>(45);
  const [showGridOverlay, setShowGridOverlay] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'weave' | 'specs'>('weave');
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Re-draw high-resolution 2D macro weave simulation on canvas
  useEffect(() => {
    if (!isOpen || !fabric || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    // Calculate light vector
    const rad = (lightAngle * Math.PI) / 180;
    const lightX = Math.cos(rad);
    const lightY = Math.sin(rad);

    // Determine thread spacing and style based on fabric texture
    const basePitch = Math.max(8, 26 / zoomLevel);
    const fiberCols = Math.ceil(width / basePitch) + 4;
    const fiberRows = Math.ceil(height / basePitch) + 4;

    // Background base shade
    let baseColor = '#1e1c18';
    let threadPrimary = '#4a4439';
    let threadSecondary = '#36322b';
    let specularIntensity = 0.3;

    if (fabric.textureType === 'silk') {
      baseColor = '#1c1b18';
      threadPrimary = '#e4d3a8';
      threadSecondary = '#cbb88a';
      specularIntensity = 0.85;
    } else if (fabric.textureType === 'denim') {
      baseColor = '#101622';
      threadPrimary = '#25446c';
      threadSecondary = '#c8c2b7'; // ecru weft
      specularIntensity = 0.2;
    } else if (fabric.textureType === 'wool') {
      baseColor = '#22201d';
      threadPrimary = '#6a6052';
      threadSecondary = '#4f473c';
      specularIntensity = 0.15;
    } else if (fabric.textureType === 'ripstop') {
      baseColor = '#151718';
      threadPrimary = '#3c444a';
      threadSecondary = '#2a3035';
      specularIntensity = 0.45;
    } else if (fabric.textureType === 'chrome') {
      baseColor = '#161413';
      threadPrimary = '#3b3530';
      threadSecondary = '#23201d';
      specularIntensity = 0.7;
    } else if (fabric.textureType === 'neoprene') {
      baseColor = '#131416';
      threadPrimary = '#2c2e35';
      threadSecondary = '#1f2024';
      specularIntensity = 0.35;
    }

    // Fill background
    ctx.fillStyle = baseColor;
    ctx.fillRect(0, 0, width, height);

    // Render Microscopic 2D Yarn / Weave Architecture
    for (let y = 0; y < fiberRows; y++) {
      for (let x = 0; x < fiberCols; x++) {
        const posX = x * basePitch;
        const posY = y * basePitch;

        // Twill / Satin / Plain / Ripstop Weave pattern calculation
        let isWarpOver = (x + y) % 2 === 0;

        if (fabric.textureType === 'denim') {
          // 3x1 Twill diagonal step
          isWarpOver = (x + y * 3) % 4 !== 0;
        } else if (fabric.textureType === 'silk') {
          // Satin weave floating warp
          isWarpOver = (x * 3 + y * 2) % 5 === 0;
        } else if (fabric.textureType === 'ripstop') {
          // Ripstop reinforced box grid every 8 threads
          const isRipstopLine = x % 8 === 0 || y % 8 === 0;
          if (isRipstopLine) {
            ctx.fillStyle = 'rgba(212, 175, 55, 0.45)';
            ctx.fillRect(posX - 1, posY - 1, basePitch + 2, basePitch + 2);
          }
        }

        const currentThreadColor = isWarpOver ? threadPrimary : threadSecondary;

        // Directional shading from the lightAngle
        const shade = 0.7 + (lightX * 0.3 * (isWarpOver ? 1 : -0.5)) + (lightY * 0.2);
        ctx.save();
        ctx.beginPath();

        if (isWarpOver) {
          // Vertical warp thread segment
          ctx.roundRect(posX + 1, posY, basePitch - 2, basePitch, basePitch / 3);
          ctx.fillStyle = currentThreadColor;
          ctx.globalAlpha = Math.min(1, Math.max(0.4, shade));
          ctx.fill();

          // Highlight filament reflection
          if (specularIntensity > 0.4) {
            ctx.fillStyle = `rgba(255, 255, 255, ${specularIntensity * 0.4})`;
            ctx.fillRect(posX + basePitch * 0.35, posY, basePitch * 0.3, basePitch);
          }
        } else {
          // Horizontal weft thread segment
          ctx.roundRect(posX, posY + 1, basePitch, basePitch - 2, basePitch / 3);
          ctx.fillStyle = currentThreadColor;
          ctx.globalAlpha = Math.min(1, Math.max(0.35, 1.1 - shade * 0.3));
          ctx.fill();

          if (specularIntensity > 0.4) {
            ctx.fillStyle = `rgba(255, 255, 255, ${specularIntensity * 0.3})`;
            ctx.fillRect(posX, posY + basePitch * 0.35, basePitch, basePitch * 0.3);
          }
        }
        ctx.restore();

        // Draw micro-fiber fuzz for cotton & wool at high zoom
        if (zoomLevel >= 3 && (fabric.textureType === 'cotton' || fabric.textureType === 'wool')) {
          ctx.strokeStyle = 'rgba(230, 220, 200, 0.15)';
          ctx.lineWidth = 0.75;
          ctx.beginPath();
          ctx.moveTo(posX + basePitch * 0.5, posY + basePitch * 0.5);
          ctx.lineTo(posX + basePitch * 0.5 + (Math.sin(x * y) * 8), posY + basePitch * 0.5 + (Math.cos(x + y) * 8));
          ctx.stroke();
        }
      }
    }

    // Grid Overlay for Technical Inspection
    if (showGridOverlay) {
      ctx.strokeStyle = 'rgba(212, 175, 55, 0.12)';
      ctx.lineWidth = 1;
      for (let x = 0; x < width; x += basePitch * 2) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += basePitch * 2) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }
    }

    // Micro-scale ruler overlay in bottom left corner
    ctx.fillStyle = 'rgba(10, 10, 14, 0.85)';
    ctx.fillRect(16, height - 42, 130, 26);
    ctx.strokeStyle = 'rgba(212, 175, 55, 0.5)';
    ctx.strokeRect(16, height - 42, 130, 26);

    ctx.fillStyle = '#f5e6b8';
    ctx.font = '10px "Space Mono", monospace';
    ctx.fillText(`Scale: ${(500 / zoomLevel).toFixed(0)} µm`, 24, height - 25);
  }, [isOpen, fabric, zoomLevel, lightAngle, showGridOverlay]);

  if (!isOpen || !fabric) return null;

  // Physical weight calculations
  const fabricGsm = fabric.gsm || 350;
  const garmentApproxWeightGrams = Math.round(fabricGsm * 1.8);

  const handleApply = () => {
    onApplyFabricToLab(fabric);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-neutral-950/85 backdrop-blur-md transition-opacity"
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-4xl bg-gradient-to-br from-[#15151c] via-[#101015] to-[#0c0c10] border border-[#d4af37]/30 rounded-3xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-5 border-b border-stone-800 flex items-center justify-between gap-4 bg-black/40">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-[#d4af37]/15 border border-[#d4af37]/40 flex items-center justify-center text-[#d4af37] shadow-inner">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono tracking-widest uppercase text-[#d4af37] font-semibold">
                  2D Makro Pynimo Inspektorius
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-stone-900 text-stone-300 border border-stone-800">
                  {fabric.gsm} GSM
                </span>
              </div>
              <h3 className="font-serif-luxury font-bold text-xl text-white">
                {fabric.nameLt} ({fabric.name})
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-stone-400 hover:text-white hover:bg-stone-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col lg:flex-row gap-6">
          {/* Left Column: Interactive 2D Canvas Macro Viewport */}
          <div className="flex-1 flex flex-col gap-4">
            <div className="relative rounded-2xl overflow-hidden border border-stone-800 bg-black/60 shadow-inner group">
              <canvas
                ref={canvasRef}
                width={560}
                height={380}
                className="w-full h-[320px] sm:h-[380px] object-cover block cursor-crosshair"
              />

              {/* Floating zoom indicator tag */}
              <div className="absolute top-4 left-4 px-3 py-1.5 rounded-xl bg-black/75 backdrop-blur-md border border-stone-800 text-[11px] font-mono text-[#f5e6b8] flex items-center gap-1.5 shadow-md">
                <ZoomIn className="w-3.5 h-3.5 text-[#d4af37]" />
                <span>{zoomLevel.toFixed(1)}x Makro Didinimas</span>
              </div>

              {/* Light angle tag */}
              <div className="absolute top-4 right-4 px-3 py-1.5 rounded-xl bg-black/75 backdrop-blur-md border border-stone-800 text-[11px] font-mono text-stone-300 flex items-center gap-1.5 shadow-md">
                <Sun className="w-3.5 h-3.5 text-amber-400" />
                <span>Šviesos Kampas: {lightAngle}°</span>
              </div>
            </div>

            {/* Microscopic Interactive Inspection Controls */}
            <div className="p-4 rounded-2xl bg-black/40 border border-stone-800/80 flex flex-col sm:flex-row items-center justify-between gap-4">
              {/* Zoom Slider */}
              <div className="w-full sm:w-1/2 flex items-center gap-2.5">
                <ZoomOut className="w-4 h-4 text-stone-400 shrink-0" />
                <input
                  type="range"
                  min="1"
                  max="8"
                  step="0.5"
                  value={zoomLevel}
                  onChange={(e) => setZoomLevel(parseFloat(e.target.value))}
                  className="w-full accent-[#d4af37] cursor-pointer"
                />
                <ZoomIn className="w-4 h-4 text-[#d4af37] shrink-0" />
              </div>

              {/* Light Angle Slider */}
              <div className="w-full sm:w-1/2 flex items-center gap-2.5">
                <Sun className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="text-[11px] font-mono text-stone-400 whitespace-nowrap">Šviesa:</span>
                <input
                  type="range"
                  min="0"
                  max="360"
                  step="15"
                  value={lightAngle}
                  onChange={(e) => setLightAngle(parseInt(e.target.value, 10))}
                  className="w-full accent-amber-500 cursor-pointer"
                />
              </div>

              {/* Grid Toggle */}
              <button
                type="button"
                onClick={() => setShowGridOverlay(!showGridOverlay)}
                className={`px-3 py-1.5 rounded-xl border text-xs font-mono transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                  showGridOverlay
                    ? 'bg-[#d4af37]/20 border-[#d4af37]/40 text-[#f5e6b8]'
                    : 'bg-stone-900 border-stone-800 text-stone-400 hover:text-white'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Tinklelis</span>
              </button>
            </div>
          </div>

          {/* Right Column: Physical Specs & Physical Weight Indicator */}
          <div className="w-full lg:w-80 flex flex-col justify-between gap-5 bg-black/30 p-5 rounded-2xl border border-stone-800/80">
            <div className="space-y-4">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#d4af37] font-semibold">
                  Fizikinė Tekstūros DNR
                </span>
                <h4 className="font-serif-luxury font-bold text-lg text-white mt-0.5">
                  Audinio Savybių Suvestinė
                </h4>
                <p className="text-xs text-stone-300 mt-1 leading-relaxed">
                  {fabric.description}
                </p>
              </div>

              {/* Physical Weight Indicator */}
              <div className="p-3.5 rounded-xl bg-gradient-to-br from-stone-900 to-black border border-[#d4af37]/30 shadow-sm">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-stone-300 flex items-center gap-1.5 font-medium">
                    <Scale className="w-4 h-4 text-[#d4af37]" />
                    <span>Fizinis Svoris (Physical Weight)</span>
                  </span>
                  <span className="font-mono font-bold text-[#f5e6b8] tabular-nums">
                    {fabricGsm} g/m²
                  </span>
                </div>
                <div className="w-full h-1.5 bg-stone-950 rounded-full overflow-hidden border border-stone-800">
                  <div
                    className="h-full bg-gradient-to-r from-amber-600 via-[#d4af37] to-amber-300"
                    style={{ width: `${Math.min(100, (fabricGsm / 500) * 100)}%` }}
                  />
                </div>
                <div className="flex justify-between items-center text-[10px] font-mono text-stone-400 mt-1.5">
                  <span>Numatomas drabužio svoris:</span>
                  <span className="text-white font-bold">~{garmentApproxWeightGrams} g</span>
                </div>
              </div>

              {/* Quantitative Material Properties */}
              <div className="space-y-2 text-xs">
                <div className="flex justify-between p-2 rounded-lg bg-stone-900/50 border border-stone-800/60">
                  <span className="text-stone-400">Sudėtis:</span>
                  <span className="text-stone-200 font-medium text-right text-[11px] max-w-[170px] truncate">
                    {fabric.composition || '100% Natūralus pluoštas'}
                  </span>
                </div>
                <div className="flex justify-between p-2 rounded-lg bg-stone-900/50 border border-stone-800/60">
                  <span className="text-stone-400">Pynimo tipas:</span>
                  <span className="text-[#f5e6b8] font-mono uppercase text-[11px]">
                    {fabric.textureType} weave
                  </span>
                </div>
                <div className="flex justify-between p-2 rounded-lg bg-stone-900/50 border border-stone-800/60">
                  <span className="text-stone-400">Paviršiaus šiurkštumas:</span>
                  <span className="text-stone-200 font-mono">
                    {Math.round(fabric.roughness * 100)}%
                  </span>
                </div>
                <div className="flex justify-between p-2 rounded-lg bg-stone-900/50 border border-stone-800/60">
                  <span className="text-stone-400">Kvėpavimas & Šiluma:</span>
                  <span className="text-stone-200 font-mono">
                    {fabric.breathability || 4}/5 · {fabric.warmth || 4}/5
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-4 border-t border-stone-800 flex flex-col gap-2.5">
              <button
                type="button"
                onClick={handleApply}
                className="w-full py-3 px-4 rounded-xl luxury-button-gold text-stone-950 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-lg active:scale-98"
              >
                <span>Taikyti šį audinį 3D Laboratorijoje</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={onClose}
                className="w-full py-2 px-4 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-300 text-xs font-medium border border-stone-800 transition cursor-pointer"
              >
                Uždaryti peržiūrą
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
