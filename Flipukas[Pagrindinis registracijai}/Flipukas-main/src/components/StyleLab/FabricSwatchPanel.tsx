import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  Sparkles,
  ZoomIn,
  ZoomOut,
  Sun,
  Layers,
  Info,
  Check,
  Maximize2,
  X,
  Scale,
  Thermometer,
  Wind,
  Droplets,
  Feather,
  Eye,
  Columns,
  RotateCcw,
} from 'lucide-react';
import { FabricMaterial, CustomizationState } from '../../types/clothing';
import { FABRICS } from '../../data/products';

interface FabricSwatchPanelProps {
  customization: CustomizationState;
  onChangeCustomization: (
    updater: (prev: CustomizationState) => CustomizationState,
    actionDesc?: string
  ) => void;
  isModal?: boolean;
  onClose?: () => void;
}

// Procedural high-resolution textile texture renderer for swatch canvas
function drawHighResFabricTexture({
  ctx,
  width,
  height,
  textureType,
  tintColor,
  useTint,
  zoomLevel,
  lightAngleDeg,
  panX = 0,
  panY = 0,
}: {
  ctx: CanvasRenderingContext2D;
  width: number;
  height: number;
  textureType: FabricMaterial['textureType'];
  tintColor: string;
  useTint: boolean;
  zoomLevel: number; // 1, 2, 4, 8
  lightAngleDeg: number;
  panX?: number;
  panY?: number;
}) {
  ctx.save();
  ctx.clearRect(0, 0, width, height);

  // Background tint
  ctx.fillStyle = useTint ? tintColor : '#3a3a3e';
  ctx.fillRect(0, 0, width, height);

  // Parse tint RGB to compute lighting highlights
  let r = 70,
    g = 70,
    b = 75;
  if (useTint && tintColor.startsWith('#')) {
    const hex = tintColor.replace('#', '');
    if (hex.length === 6) {
      r = parseInt(hex.substring(0, 2), 16);
      g = parseInt(hex.substring(2, 4), 16);
      b = parseInt(hex.substring(4, 6), 16);
    }
  }

  // Calculate light direction
  const rad = (lightAngleDeg * Math.PI) / 180;
  const lx = Math.cos(rad);
  const ly = Math.sin(rad);

  // Render specific textile structure
  if (textureType === 'silk') {
    // ----------------------------------------------------
    // 1. MULBERRY SILK: Ultra-smooth, anisotropic filaments, pearlescent highlights
    // ----------------------------------------------------
    const step = Math.max(1.5, 4 / zoomLevel);
    for (let y = -50; y < height + 50; y += step) {
      const worldY = y + panY;
      const wave = Math.sin(worldY * 0.05 * zoomLevel) * 12;
      const highlight = Math.sin((worldY * 0.02 + panX * 0.01) * zoomLevel);
      const lightFactor = (lx * 0.5 + ly * 0.5) * highlight * 0.35 + 0.5;

      const sr = Math.min(255, Math.floor(r * (0.8 + lightFactor * 0.5) + lightFactor * 60));
      const sg = Math.min(255, Math.floor(g * (0.8 + lightFactor * 0.5) + lightFactor * 60));
      const sb = Math.min(255, Math.floor(b * (0.8 + lightFactor * 0.5) + lightFactor * 70));

      ctx.fillStyle = `rgb(${sr}, ${sg}, ${sb})`;
      ctx.fillRect(0, y, width, step * 0.85);

      // Delicate micro-sheen filaments
      if (zoomLevel >= 2) {
        ctx.strokeStyle = `rgba(255, 255, 255, ${0.15 * (1 + lightFactor)})`;
        ctx.lineWidth = 0.75;
        ctx.beginPath();
        ctx.moveTo(0, y + wave * 0.1);
        ctx.lineTo(width, y - wave * 0.1);
        ctx.stroke();
      }
    }

    // Diagonal twill reflection bands (characteristic of silk satin/twill)
    const bandStep = 60 / zoomLevel;
    for (let d = -width; d < width * 2; d += bandStep) {
      const grad = ctx.createLinearGradient(d + panX, 0, d + panX + bandStep * 0.5, height);
      grad.addColorStop(0, 'rgba(255, 255, 255, 0)');
      grad.addColorStop(0.5, `rgba(255, 255, 255, ${0.18 + Math.abs(lx) * 0.15})`);
      grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);
    }
  } else if (textureType === 'denim') {
    // ----------------------------------------------------
    // 2. SELVEDGE DENIM: 3x1 Twill diagonal ridges, indigo warp & white weft slubs
    // ----------------------------------------------------
    const unitSize = 10 * zoomLevel;
    const cols = Math.ceil(width / unitSize) + 4;
    const rows = Math.ceil(height / unitSize) + 4;

    for (let ry = -2; ry < rows; ry++) {
      for (let rx = -2; rx < cols; rx++) {
        const px = rx * unitSize + (panX % unitSize);
        const py = ry * unitSize + (panY % unitSize);

        // Twill formula: (rx + ry) % 4
        const twillIndex = (rx + ry) % 4;

        if (twillIndex === 0) {
          // White/ecru weft thread poking through
          const weftBright = 210 + Math.sin(rx * 17) * 25;
          ctx.fillStyle = useTint
            ? `rgba(240, 235, 220, 0.75)`
            : `rgb(${weftBright}, ${weftBright - 8}, ${weftBright - 20})`;
          ctx.fillRect(px, py + unitSize * 0.15, unitSize * 0.85, unitSize * 0.7);

          // Slub fibers inside weft
          if (zoomLevel >= 2) {
            ctx.fillStyle = 'rgba(160, 150, 130, 0.4)';
            ctx.fillRect(px + 2, py + unitSize * 0.35, unitSize * 0.6, 1.5);
          }
        } else {
          // Dark indigo warp yarn (3 consecutive threads)
          const shadowFactor = 0.75 + (lx * 0.2 - ly * 0.1);
          const wr = Math.floor(r * shadowFactor * 0.7);
          const wg = Math.floor(g * shadowFactor * 0.75);
          const wb = Math.floor(Math.min(255, b * shadowFactor * 1.05 + 10));

          ctx.fillStyle = `rgb(${wr}, ${wg}, ${wb})`;
          ctx.fillRect(px, py, unitSize * 0.9, unitSize * 0.9);

          // Twill diagonal ridge highlight
          ctx.strokeStyle = `rgba(255, 255, 255, ${0.08 * (1 + ly)})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(px, py + unitSize);
          ctx.lineTo(px + unitSize, py);
          ctx.stroke();
        }
      }
    }

    // Slub yarn irregularities across denim surface
    ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
    for (let s = 0; s < 18; s++) {
      const sx = ((s * 73 + panX * 0.5) % width + width) % width;
      const sy = ((s * 41 + panY * 0.5) % height + height) % height;
      const slen = (16 + (s % 5) * 8) * zoomLevel;
      ctx.fillRect(sx, sy, slen, 2 * zoomLevel);
    }
  } else if (textureType === 'wool') {
    // ----------------------------------------------------
    // 3. MERINO WOOL: Curly crimped spun fibers, high loft, fuzzy loops & soft warmth
    // ----------------------------------------------------
    const baseR = Math.floor(r * 0.9);
    const baseG = Math.floor(g * 0.9);
    const baseB = Math.floor(b * 0.9);

    // Wool yarn spun knit loops
    const loopRadius = 8 * zoomLevel;
    const loopCols = Math.ceil(width / (loopRadius * 1.5)) + 2;
    const loopRows = Math.ceil(height / (loopRadius * 1.8)) + 2;

    for (let ry = -1; ry < loopRows; ry++) {
      for (let rx = -1; rx < loopCols; rx++) {
        const cx = rx * loopRadius * 1.5 + (ry % 2 === 0 ? 0 : loopRadius * 0.75) + (panX % (loopRadius * 1.5));
        const cy = ry * loopRadius * 1.6 + (panY % (loopRadius * 1.6));

        // Interlocking knitted wool loop
        const loopShade = 0.85 + Math.sin(rx * 3 + ry * 5) * 0.15 + (lx * 0.15 + ly * 0.15);
        const lr = Math.min(255, Math.floor(baseR * loopShade));
        const lg = Math.min(255, Math.floor(baseG * loopShade));
        const lb = Math.min(255, Math.floor(baseB * loopShade));

        ctx.strokeStyle = `rgb(${lr}, ${lg}, ${lb})`;
        ctx.lineWidth = Math.max(1.8, 3 * zoomLevel);
        ctx.beginPath();
        ctx.arc(cx, cy, loopRadius * 0.6, 0.2 * Math.PI, 1.8 * Math.PI);
        ctx.stroke();

        // Loop center shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
        ctx.beginPath();
        ctx.arc(cx, cy, loopRadius * 0.35, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Organic curled crimped micro-fibers (fuzz / halo of wool)
    const fiberCount = Math.floor(250 * zoomLevel);
    ctx.lineWidth = Math.max(0.6, 1 * (zoomLevel / 2));
    for (let f = 0; f < fiberCount; f++) {
      const fx = ((f * 37 + panX) % width + width) % width;
      const fy = ((f * 59 + panY) % height + height) % height;
      const fr = (3 + (f % 4) * 2) * zoomLevel;

      ctx.strokeStyle = f % 2 === 0 ? 'rgba(255, 255, 255, 0.18)' : 'rgba(0, 0, 0, 0.2)';
      ctx.beginPath();
      ctx.arc(fx, fy, fr, 0, Math.PI * 1.4);
      ctx.stroke();
    }
  } else if (textureType === 'cotton') {
    // ----------------------------------------------------
    // 4. COMBED COTTON 380GSM: Fine combed twill weave with micro fleece loops
    // ----------------------------------------------------
    const cw = 6 * zoomLevel;
    const ch = 6 * zoomLevel;
    for (let y = 0; y < height; y += ch) {
      for (let x = 0; x < width; x += cw) {
        const isWeave = ((Math.floor(x / cw) + Math.floor(y / ch)) % 2) === 0;
        const shade = isWeave ? 0.95 + lx * 0.1 : 0.82 - ly * 0.1;
        ctx.fillStyle = `rgb(${Math.floor(r * shade)}, ${Math.floor(g * shade)}, ${Math.floor(b * shade)})`;
        ctx.fillRect(x, y, cw, ch);

        if (zoomLevel >= 2 && Math.random() > 0.6) {
          ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
          ctx.fillRect(x + 1, y + 1, cw * 0.4, ch * 0.4);
        }
      }
    }
  } else if (textureType === 'ripstop') {
    // ----------------------------------------------------
    // 5. SOFTSHELL RIPSTOP: Technical grid box reinforcement
    // ----------------------------------------------------
    const gridSize = 24 * zoomLevel;
    ctx.fillStyle = `rgb(${Math.floor(r * 0.85)}, ${Math.floor(g * 0.85)}, ${Math.floor(b * 0.85)})`;
    ctx.fillRect(0, 0, width, height);

    ctx.strokeStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.lineWidth = Math.max(2, 3 * zoomLevel);
    for (let gx = panX % gridSize; gx < width; gx += gridSize) {
      ctx.beginPath();
      ctx.moveTo(gx, 0);
      ctx.lineTo(gx, height);
      ctx.stroke();
    }
    for (let gy = panY % gridSize; gy < height; gy += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, gy);
      ctx.lineTo(width, gy);
      ctx.stroke();
    }
    // High-tech sheen
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.18)';
    ctx.lineWidth = 1;
    for (let gx = (panX % gridSize) + 2; gx < width; gx += gridSize) {
      ctx.beginPath();
      ctx.moveTo(gx, 0);
      ctx.lineTo(gx, height);
      ctx.stroke();
    }
  } else if (textureType === 'neoprene') {
    // ----------------------------------------------------
    // 6. SCUBA NEOPRENE: Smooth, micro-cellular cushion
    // ----------------------------------------------------
    ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
    ctx.fillRect(0, 0, width, height);

    const cellStep = 8 * zoomLevel;
    for (let y = 0; y < height; y += cellStep) {
      for (let x = 0; x < width; x += cellStep) {
        ctx.fillStyle = (x + y) % (cellStep * 2) === 0 ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)';
        ctx.beginPath();
        ctx.arc(x + cellStep / 2, y + cellStep / 2, (cellStep * 0.35), 0, Math.PI * 2);
        ctx.fill();
      }
    }
  } else {
    // ----------------------------------------------------
    // 7. LEATHER / CHROME: Organic pebbled grain & pores
    // ----------------------------------------------------
    ctx.fillStyle = `rgb(${Math.floor(r * 0.8)}, ${Math.floor(g * 0.8)}, ${Math.floor(b * 0.8)})`;
    ctx.fillRect(0, 0, width, height);

    const pebbleCount = Math.floor(400 * zoomLevel);
    for (let p = 0; p < pebbleCount; p++) {
      const px = ((p * 43 + panX) % width + width) % width;
      const py = ((p * 71 + panY) % height + height) % height;
      const pr = (1.5 + (p % 3) * 1.5) * zoomLevel;

      ctx.fillStyle = p % 2 === 0 ? 'rgba(0, 0, 0, 0.28)' : 'rgba(255, 255, 255, 0.14)';
      ctx.beginPath();
      ctx.arc(px, py, pr, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Directional Light Highlight Overlay
  const gradLight = ctx.createRadialGradient(
    width / 2 + lx * (width * 0.4),
    height / 2 + ly * (height * 0.4),
    10,
    width / 2,
    height / 2,
    width * 0.75
  );
  gradLight.addColorStop(0, 'rgba(255, 255, 255, 0.15)');
  gradLight.addColorStop(1, 'rgba(0, 0, 0, 0.2)');
  ctx.fillStyle = gradLight;
  ctx.fillRect(0, 0, width, height);

  ctx.restore();
}

export const FabricSwatchPanel: React.FC<FabricSwatchPanelProps> = ({
  customization,
  onChangeCustomization,
  isModal = false,
  onClose,
}) => {
  // Currently inspected fabric (defaults to active fabric on model)
  const [inspectedFabricId, setInspectedFabricId] = useState<string>(
    customization.fabricId || FABRICS[0].id
  );

  // Loupe magnifier settings
  const [zoomLevel, setZoomLevel] = useState<number>(2); // 1x, 2x, 4x, 8x
  const [lightAngle, setLightAngle] = useState<number>(45); // 0° - 360°
  const [useGarmentColor, setUseGarmentColor] = useState<boolean>(true);
  const [isCompareMode, setIsCompareMode] = useState<boolean>(false);
  const [compareFabricId, setCompareFabricId] = useState<string>(
    FABRICS.find((f) => f.id !== inspectedFabricId)?.id || FABRICS[1].id
  );

  // Interactive Pan on Texture Viewport
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Canvas Refs
  const mainCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const compareCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const inspectedFabric = useMemo(() => {
    return FABRICS.find((f) => f.id === inspectedFabricId) || FABRICS[0];
  }, [inspectedFabricId]);

  const compareFabric = useMemo(() => {
    return FABRICS.find((f) => f.id === compareFabricId) || FABRICS[1];
  }, [compareFabricId]);

  const isActiveOnModel = customization.fabricId === inspectedFabric.id;

  // Render Main Texture Canvas
  useEffect(() => {
    const canvas = mainCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    drawHighResFabricTexture({
      ctx,
      width: canvas.width,
      height: canvas.height,
      textureType: inspectedFabric.textureType,
      tintColor: customization.primaryColor,
      useTint: useGarmentColor,
      zoomLevel,
      lightAngleDeg: lightAngle,
      panX: pan.x,
      panY: pan.y,
    });
  }, [inspectedFabric, customization.primaryColor, useGarmentColor, zoomLevel, lightAngle, pan]);

  // Render Compare Texture Canvas
  useEffect(() => {
    if (!isCompareMode) return;
    const canvas = compareCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    drawHighResFabricTexture({
      ctx,
      width: canvas.width,
      height: canvas.height,
      textureType: compareFabric.textureType,
      tintColor: customization.primaryColor,
      useTint: useGarmentColor,
      zoomLevel,
      lightAngleDeg: lightAngle,
      panX: pan.x,
      panY: pan.y,
    });
  }, [isCompareMode, compareFabric, customization.primaryColor, useGarmentColor, zoomLevel, lightAngle, pan]);

  // Handle Drag to Pan
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStartRef.current.x,
      y: e.clientY - dragStartRef.current.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Apply Inspected Fabric to 3D Garment
  const handleApplyToModel = (fabric: FabricMaterial) => {
    onChangeCustomization(
      (c) => ({
        ...c,
        fabricId: fabric.id,
      }),
      `Pritaikytas audinys: ${fabric.nameLt}`
    );
  };

  return (
    <div className={`flex flex-col gap-4 text-neutral-100 ${isModal ? 'p-6 max-h-[88vh] overflow-y-auto' : ''}`}>
      {/* Header (when modal) */}
      {isModal && (
        <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-bold text-lg text-white">
                Interaktyvi Audinių ir Pynimų Laboratorija
              </h3>
              <p className="text-xs text-neutral-400">
                Detali mikro-tekstūros apžiūra prieš pritaikant 3D modeliui (Šilkas, Džinsas, Vilna ir kt.)
              </p>
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      )}

      {/* 1. Fabric Swatches Selector Carousel / Grid */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-neutral-300 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-amber-400" />
            Pasirinkite Medžiagą Apžiūrai:
          </label>
          <span className="text-[11px] text-neutral-400">
            {FABRICS.length} aukštos kokybės tekstilės pavyzdžiai
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {FABRICS.map((fabric) => {
            const isInspected = inspectedFabric.id === fabric.id;
            const isModelActive = customization.fabricId === fabric.id;

            return (
              <button
                key={fabric.id}
                onClick={() => setInspectedFabricId(fabric.id)}
                className={`relative p-2.5 rounded-xl border text-left transition-all flex flex-col justify-between group ${
                  isInspected
                    ? 'border-amber-400 bg-amber-400/10 ring-1 ring-amber-400/40 shadow-md'
                    : 'border-neutral-800 bg-neutral-900/60 hover:border-neutral-700 hover:bg-neutral-800/50'
                }`}
              >
                {/* Active model badge */}
                {isModelActive && (
                  <span className="absolute -top-1.5 -right-1.5 bg-emerald-500 text-neutral-950 text-[9px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5 shadow">
                    <Check className="w-2.5 h-2.5" /> 3D Modelis
                  </span>
                )}

                <div>
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-neutral-800/80 text-amber-400 border border-neutral-700">
                      {fabric.textureType}
                    </span>
                    <span className="text-[11px] font-mono text-emerald-400 font-semibold">
                      {fabric.priceDelta > 0 ? `+${fabric.priceDelta} €` : 'Bazinė'}
                    </span>
                  </div>
                  <h4 className="font-semibold text-xs text-neutral-100 group-hover:text-amber-400 transition truncate">
                    {fabric.nameLt}
                  </h4>
                  <p className="text-[10px] text-neutral-400 line-clamp-1 mt-0.5">
                    {fabric.badge}
                  </p>
                </div>

                <div className="mt-2 pt-1.5 border-t border-neutral-800/80 flex items-center justify-between text-[10px] text-neutral-400">
                  <span>{fabric.gsm ? `${fabric.gsm} GSM` : 'Standartinis'}</span>
                  <span className={`text-[10px] font-medium ${isInspected ? 'text-amber-400' : 'text-neutral-500'}`}>
                    {isInspected ? 'Apžiūrima' : 'Peržiūrėti'}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Interactive Close-Up High-Res Texture Viewport & Loupe */}
      <div className="bg-neutral-900/90 rounded-2xl border border-neutral-800 p-4 shadow-xl flex flex-col gap-3">
        {/* Viewport Control Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-800/80 pb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-white flex items-center gap-1.5">
              <Eye className="w-4 h-4 text-amber-400" />
              Mikro-Pynimo Apžiūra:
            </span>
            <span className="text-xs font-medium text-amber-300 bg-amber-400/10 px-2 py-0.5 rounded-md border border-amber-400/20">
              {inspectedFabric.nameLt}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Compare Toggle */}
            <button
              onClick={() => setIsCompareMode(!isCompareMode)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5 transition ${
                isCompareMode
                  ? 'bg-amber-400 text-neutral-950 font-bold'
                  : 'bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-700'
              }`}
            >
              <Columns className="w-3.5 h-3.5" />
              <span>{isCompareMode ? 'Uždaryti palyginimą' : 'Palyginti 2 audinius'}</span>
            </button>

            {/* Tint Toggle */}
            <button
              onClick={() => setUseGarmentColor(!useGarmentColor)}
              title="Perjungti spalvinį atvaizdavimą"
              className={`px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5 transition ${
                useGarmentColor
                  ? 'bg-neutral-800 text-neutral-200 border border-neutral-700'
                  : 'bg-neutral-800/40 text-neutral-400 border border-neutral-800'
              }`}
            >
              <div
                className="w-3 h-3 rounded-full border border-white/40"
                style={{ backgroundColor: useGarmentColor ? customization.primaryColor : '#888' }}
              />
              <span>{useGarmentColor ? 'Drabužio spalva' : 'Neapdorotas'}</span>
            </button>
          </div>
        </div>

        {/* Canvases Viewport (Single or Compare Split) */}
        <div className="relative">
          <div
            className={`grid gap-3 ${isCompareMode ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`}
          >
            {/* Primary Inspected Canvas */}
            <div className="flex flex-col gap-1.5">
              <div className="relative rounded-xl overflow-hidden border border-neutral-700/80 bg-neutral-950 shadow-inner group">
                <canvas
                  ref={mainCanvasRef}
                  width={600}
                  height={320}
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                  className={`w-full h-56 sm:h-64 object-cover ${
                    isDragging ? 'cursor-grabbing' : 'cursor-grab'
                  }`}
                />

                {/* Loupe HUD Overlay Badges */}
                <div className="absolute top-2.5 left-2.5 bg-neutral-950/80 backdrop-blur-md px-2.5 py-1 rounded-lg border border-neutral-700 text-[11px] font-mono flex items-center gap-2">
                  <span className="text-amber-400 font-bold">{inspectedFabric.nameLt}</span>
                  <span className="text-neutral-400">|</span>
                  <span className="text-neutral-300">{zoomLevel}× Makro</span>
                </div>

                <div className="absolute top-2.5 right-2.5 bg-neutral-950/80 backdrop-blur-md px-2 py-1 rounded-lg border border-neutral-700 text-[10px] text-neutral-300">
                  Vilkite pynimui pasukti
                </div>

                {/* Reset Pan button */}
                {(pan.x !== 0 || pan.y !== 0) && (
                  <button
                    onClick={() => setPan({ x: 0, y: 0 })}
                    title="Atstatyti poziciją"
                    className="absolute bottom-2.5 right-2.5 bg-neutral-900/80 p-1.5 rounded-lg border border-neutral-700 text-neutral-300 hover:text-white"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Compare Canvas (when active) */}
            {isCompareMode && (
              <div className="flex flex-col gap-1.5">
                <div className="relative rounded-xl overflow-hidden border border-neutral-700/80 bg-neutral-950 shadow-inner">
                  <canvas
                    ref={compareCanvasRef}
                    width={600}
                    height={320}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                    className={`w-full h-56 sm:h-64 object-cover ${
                      isDragging ? 'cursor-grabbing' : 'cursor-grab'
                    }`}
                  />

                  <div className="absolute top-2.5 left-2.5 bg-neutral-950/80 backdrop-blur-md px-2.5 py-1 rounded-lg border border-neutral-700 text-[11px] font-mono flex items-center gap-2">
                    <span className="text-emerald-400 font-bold">{compareFabric.nameLt}</span>
                    <span className="text-neutral-400">|</span>
                    <span className="text-neutral-300">{zoomLevel}× Makro</span>
                  </div>

                  <div className="absolute top-2.5 right-2.5">
                    <select
                      value={compareFabricId}
                      onChange={(e) => setCompareFabricId(e.target.value)}
                      className="bg-neutral-900 text-neutral-200 text-xs px-2 py-1 rounded-lg border border-neutral-700 focus:outline-none focus:border-amber-400"
                    >
                      {FABRICS.map((f) => (
                        <option key={f.id} value={f.id}>
                          {f.nameLt}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Interactive Zoom & Lighting Sliders Bar */}
          <div className="mt-3 p-3 rounded-xl bg-neutral-950/60 border border-neutral-800 flex flex-wrap items-center justify-between gap-3">
            {/* Zoom Controls */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-neutral-400 flex items-center gap-1 mr-1">
                <ZoomIn className="w-3.5 h-3.5 text-amber-400" />
                Didinimas:
              </span>
              {[
                { level: 1, label: '1× Normalus' },
                { level: 2, label: '2× Makro' },
                { level: 4, label: '4× Pynimas' },
                { level: 8, label: '8× Pluoštas' },
              ].map((opt) => (
                <button
                  key={opt.level}
                  onClick={() => setZoomLevel(opt.level)}
                  className={`px-2 py-1 rounded-lg text-xs font-mono transition ${
                    zoomLevel === opt.level
                      ? 'bg-amber-400 text-neutral-950 font-bold'
                      : 'bg-neutral-800/80 text-neutral-300 hover:text-white hover:bg-neutral-700'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {/* Specular Light Angle Slider */}
            <div className="flex items-center gap-2 min-w-[200px]">
              <Sun className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="text-xs text-neutral-400 shrink-0">Šviesos kampas:</span>
              <input
                type="range"
                min="0"
                max="360"
                value={lightAngle}
                onChange={(e) => setLightAngle(Number(e.target.value))}
                className="w-full accent-amber-400 h-1.5 bg-neutral-800 rounded-lg cursor-pointer"
              />
              <span className="text-xs font-mono text-neutral-300 w-9 text-right">
                {lightAngle}°
              </span>
            </div>
          </div>
        </div>

        {/* 3. Technical Textile Specifications Sheet */}
        <div className="mt-2 p-3.5 rounded-xl bg-neutral-950/80 border border-neutral-800/90 flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-semibold text-neutral-200 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-amber-400" />
              Tekstilės Specifikacija & Savybės:
            </h4>
            <span className="text-xs font-mono text-neutral-400">
              {inspectedFabric.composition || '100% Sertifikuota tekstilė'}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
            {/* GSM Weight */}
            <div className="p-2 rounded-lg bg-neutral-900 border border-neutral-800/80">
              <span className="text-neutral-400 text-[10px] block flex items-center gap-1">
                <Scale className="w-3 h-3 text-amber-400" /> Tankis / Svoris:
              </span>
              <span className="font-bold text-neutral-100 text-xs mt-0.5 block">
                {inspectedFabric.gsm ? `${inspectedFabric.gsm} g/m²` : '380 g/m²'}
              </span>
            </div>

            {/* Breathability */}
            <div className="p-2 rounded-lg bg-neutral-900 border border-neutral-800/80">
              <span className="text-neutral-400 text-[10px] block flex items-center gap-1">
                <Wind className="w-3 h-3 text-cyan-400" /> Kvėpavimas:
              </span>
              <div className="flex items-center gap-1 mt-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <span
                    key={i}
                    className={`w-2 h-2 rounded-full ${
                      i < (inspectedFabric.breathability || 4)
                        ? 'bg-cyan-400'
                        : 'bg-neutral-800'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Warmth */}
            <div className="p-2 rounded-lg bg-neutral-900 border border-neutral-800/80">
              <span className="text-neutral-400 text-[10px] block flex items-center gap-1">
                <Thermometer className="w-3 h-3 text-rose-400" /> Šilumos izoliacija:
              </span>
              <div className="flex items-center gap-1 mt-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <span
                    key={i}
                    className={`w-2 h-2 rounded-full ${
                      i < (inspectedFabric.warmth || 4)
                        ? 'bg-rose-400'
                        : 'bg-neutral-800'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Drape */}
            <div className="p-2 rounded-lg bg-neutral-900 border border-neutral-800/80">
              <span className="text-neutral-400 text-[10px] block flex items-center gap-1">
                <Feather className="w-3 h-3 text-purple-400" /> Kritimas & Pojūtis:
              </span>
              <span className="font-semibold text-neutral-200 text-[11px] mt-0.5 block truncate">
                {inspectedFabric.drape || 'Minkštas'}
              </span>
            </div>
          </div>

          <p className="text-xs text-neutral-300 leading-relaxed bg-neutral-900/40 p-2.5 rounded-lg border border-neutral-800/50">
            {inspectedFabric.description}
          </p>
        </div>

        {/* 4. Action: Apply to 3D Model Button */}
        <div className="pt-2 flex items-center justify-between gap-3">
          <div className="text-xs">
            <span className="text-neutral-400 block">Kainos pokytis:</span>
            <span className="font-mono font-bold text-sm text-emerald-400">
              {inspectedFabric.priceDelta > 0 ? `+${inspectedFabric.priceDelta} €` : 'Bazinė kaina'}
            </span>
          </div>

          <button
            onClick={() => handleApplyToModel(inspectedFabric)}
            className={`flex-1 py-3 px-5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition shadow-lg ${
              isActiveOnModel
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 cursor-default'
                : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 font-bold active:scale-[0.99] cursor-pointer'
            }`}
          >
            {isActiveOnModel ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span>Audinys pritaikytas 3D modeliui</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Pritaikyti „{inspectedFabric.nameLt}“ 3D modeliui</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
