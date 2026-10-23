import React, { useEffect, useRef, useState } from 'react';
import {
  Eraser,
  Feather,
  Flame,
  Heart,
  Paintbrush,
  RotateCcw,
  Sparkles,
  Type,
  Zap,
} from 'lucide-react';

interface DrawingStudioProps {
  onTextureUpdate: (canvas: HTMLCanvasElement) => void;
  primaryGarmentColor: string;
}

export type DrawTool = 'stitch' | 'brush' | 'text' | 'stamp';

export const DrawingStudio: React.FC<DrawingStudioProps> = ({
  onTextureUpdate,
  primaryGarmentColor,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [currentTool, setCurrentTool] = useState<DrawTool>('stitch');
  const [threadColor, setThreadColor] = useState('#f59e0b'); // Gold / Amber thread default
  const [brushSize, setBrushSize] = useState(4);
  const [customText, setCustomText] = useState('FLIPUKAS');
  const [selectedStamp, setSelectedStamp] = useState<'star' | 'heart' | 'lightning' | 'badge'>('badge');
  const isDrawingRef = useRef(false);
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);

  // Initialize canvas with transparent background and sample decorative seam
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Initial embroidered logo & twin needle border
    renderInitialEmbroidery(ctx, canvas.width, canvas.height);
    onTextureUpdate(canvas);
  }, []);

  const renderInitialEmbroidery = (ctx: CanvasRenderingContext2D, w: number, h: number) => {
    // Twin needle boundary stitching
    ctx.strokeStyle = 'rgba(217, 119, 6, 0.85)'; // Amber gold stitch
    ctx.lineWidth = 2.5;
    ctx.setLineDash([8, 5]);

    ctx.strokeRect(16, 16, w - 32, h - 32);

    // Initial embroidery text
    ctx.setLineDash([]);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 36px Outfit, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('FLIPUKAS', w / 2, h / 2 - 12);

    // Subtitle stitch
    ctx.fillStyle = '#d97706';
    ctx.font = 'bold 15px Space Mono, monospace';
    ctx.fillText('EST. 2026 // VILNIUS', w / 2, h / 2 + 25);
  };

  const getCanvasCoords = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();

    let clientX = 0;
    let clientY = 0;
    if ('touches' in e) {
      if (e.touches.length > 0) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      }
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  };

  const handlePointerDown = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    isDrawingRef.current = true;
    const coords = getCanvasCoords(e);
    lastPointRef.current = coords;

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx || !canvas) return;

    if (currentTool === 'text') {
      // Place embroidered text
      ctx.fillStyle = threadColor;
      ctx.font = `bold ${Math.max(20, brushSize * 5)}px Outfit, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(customText || 'MANO STILIUS', coords.x, coords.y);
      onTextureUpdate(canvas);
      isDrawingRef.current = false;
    } else if (currentTool === 'stamp') {
      // Stamp graphic patch
      drawStampPatch(ctx, coords.x, coords.y, selectedStamp, threadColor, brushSize * 6);
      onTextureUpdate(canvas);
      isDrawingRef.current = false;
    }
  };

  const handlePointerMove = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current || currentTool === 'text' || currentTool === 'stamp') return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx || !canvas || !lastPointRef.current) return;

    const coords = getCanvasCoords(e);

    ctx.save();
    if (currentTool === 'stitch') {
      // Embroidery thread stitch mode
      ctx.strokeStyle = threadColor;
      ctx.lineWidth = brushSize;
      ctx.lineCap = 'square';
      ctx.setLineDash([7, 4]); // Dashed embroidery thread

      ctx.beginPath();
      ctx.moveTo(lastPointRef.current.x, lastPointRef.current.y);
      ctx.lineTo(coords.x, coords.y);
      ctx.stroke();

      // Subtle drop shadow for 3D raised embroidery thread effect
      ctx.strokeStyle = 'rgba(0,0,0,0.35)';
      ctx.lineWidth = brushSize * 0.7;
      ctx.beginPath();
      ctx.moveTo(lastPointRef.current.x + 1, lastPointRef.current.y + 1);
      ctx.lineTo(coords.x + 1, coords.y + 1);
      ctx.stroke();
    } else {
      // Brush dye mode
      ctx.strokeStyle = threadColor;
      ctx.lineWidth = brushSize * 1.5;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.setLineDash([]);

      ctx.beginPath();
      ctx.moveTo(lastPointRef.current.x, lastPointRef.current.y);
      ctx.lineTo(coords.x, coords.y);
      ctx.stroke();
    }
    ctx.restore();

    lastPointRef.current = coords;
    onTextureUpdate(canvas);
  };

  const handlePointerUp = () => {
    isDrawingRef.current = false;
    lastPointRef.current = null;
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx || !canvas) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    onTextureUpdate(canvas);
  };

  const drawStampPatch = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    stamp: string,
    color: string,
    size: number
  ) => {
    ctx.save();
    ctx.translate(x, y);

    if (stamp === 'star') {
      ctx.fillStyle = color;
      ctx.beginPath();
      for (let i = 0; i < 5; i++) {
        ctx.lineTo(
          Math.cos(((18 + i * 72) * Math.PI) / 180) * size,
          -Math.sin(((18 + i * 72) * Math.PI) / 180) * size
        );
        ctx.lineTo(
          Math.cos(((54 + i * 72) * Math.PI) / 180) * (size * 0.45),
          -Math.sin(((54 + i * 72) * Math.PI) / 180) * (size * 0.45)
        );
      }
      ctx.closePath();
      ctx.fill();
    } else if (stamp === 'heart') {
      ctx.fillStyle = color;
      ctx.beginPath();
      const r = size * 0.8;
      ctx.moveTo(0, r * 0.4);
      ctx.bezierCurveTo(-r, -r * 0.6, -r * 1.2, r * 0.4, 0, r * 1.2);
      ctx.bezierCurveTo(r * 1.2, r * 0.4, r, -r * 0.6, 0, r * 0.4);
      ctx.fill();
    } else if (stamp === 'lightning') {
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(-size * 0.3, -size);
      ctx.lineTo(size * 0.4, -size * 0.2);
      ctx.lineTo(0, 0);
      ctx.lineTo(size * 0.5, size);
      ctx.lineTo(-size * 0.4, size * 0.1);
      ctx.lineTo(0, -size * 0.1);
      ctx.closePath();
      ctx.fill();
    } else {
      // High-end tactical patch badge
      ctx.strokeStyle = color;
      ctx.lineWidth = 3;
      ctx.strokeRect(-size, -size * 0.5, size * 2, size);
      ctx.fillStyle = '#ffffff';
      ctx.font = `bold ${Math.max(12, size * 0.4)}px Space Mono, monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('01 // VILNIUS', 0, 0);
    }

    ctx.restore();
  };

  const THREAD_COLORS = [
    { label: 'Auksinis Siūlas', hex: '#f59e0b' },
    { label: 'Sniego Balta', hex: '#ffffff' },
    { label: 'Gili Juoda', hex: '#111111' },
    { label: 'Kiber Mėlyna', hex: '#38bdf8' },
    { label: 'Raudonas Siūlas', hex: '#ef4444' },
    { label: 'Neoninė Žalia', hex: '#84cc16' },
  ];

  return (
    <div className="bg-neutral-900/80 p-5 rounded-2xl border border-neutral-800 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-semibold text-white flex items-center gap-1.5">
            <Feather className="w-3.5 h-3.5 text-amber-400" />
            <span>Siuvinėjimo & Piešimo Studija</span>
          </span>
          <p className="text-[11px] text-neutral-400 mt-0.5">
            Piešk arba siūk dygsniais – pakeitimai realiu laiku atsiranda tiesiai ant 3D drabužio!
          </p>
        </div>
        <button
          onClick={handleClear}
          className="px-2.5 py-1 text-[11px] font-mono text-neutral-400 hover:text-red-400 bg-neutral-950 hover:bg-neutral-800 rounded-md border border-neutral-800 flex items-center gap-1 transition-colors"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Išvalyti</span>
        </button>
      </div>

      {/* Tool selector buttons */}
      <div className="grid grid-cols-4 gap-1.5 p-1 bg-neutral-950 rounded-xl border border-neutral-800">
        <button
          onClick={() => setCurrentTool('stitch')}
          className={`py-1.5 text-xs font-medium rounded-lg flex items-center justify-center gap-1.5 transition-colors ${
            currentTool === 'stitch'
              ? 'bg-amber-400 text-neutral-950 font-semibold shadow'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          <Sparkles className="w-3 h-3" />
          <span>Siūti Dygsniais</span>
        </button>
        <button
          onClick={() => setCurrentTool('brush')}
          className={`py-1.5 text-xs font-medium rounded-lg flex items-center justify-center gap-1.5 transition-colors ${
            currentTool === 'brush'
              ? 'bg-amber-400 text-neutral-950 font-semibold shadow'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          <Paintbrush className="w-3 h-3" />
          <span>Dažai</span>
        </button>
        <button
          onClick={() => setCurrentTool('text')}
          className={`py-1.5 text-xs font-medium rounded-lg flex items-center justify-center gap-1.5 transition-colors ${
            currentTool === 'text'
              ? 'bg-amber-400 text-neutral-950 font-semibold shadow'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          <Type className="w-3 h-3" />
          <span>Tekstas</span>
        </button>
        <button
          onClick={() => setCurrentTool('stamp')}
          className={`py-1.5 text-xs font-medium rounded-lg flex items-center justify-center gap-1.5 transition-colors ${
            currentTool === 'stamp'
              ? 'bg-amber-400 text-neutral-950 font-semibold shadow'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          <Zap className="w-3 h-3" />
          <span>Lopai</span>
        </button>
      </div>

      {/* Drawing Pad Canvas Container */}
      <div className="relative w-full aspect-[2/1] rounded-xl bg-neutral-950 border border-neutral-800 overflow-hidden shadow-inner flex items-center justify-center">
        {/* Subtle fabric background pattern simulating actual cloth under the drawing */}
        <div
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            backgroundImage:
              'radial-gradient(circle, #555 1px, transparent 1px), radial-gradient(circle, #333 1px, transparent 1px)',
            backgroundSize: '8px 8px',
            backgroundColor: primaryGarmentColor,
          }}
        />

        <canvas
          ref={canvasRef}
          width={512}
          height={256}
          onMouseDown={handlePointerDown}
          onMouseMove={handlePointerMove}
          onMouseUp={handlePointerUp}
          onMouseLeave={handlePointerUp}
          onTouchStart={handlePointerDown}
          onTouchMove={handlePointerMove}
          onTouchEnd={handlePointerUp}
          className="w-full h-full cursor-crosshair touch-none relative z-10"
        />

        {/* Helper overlay hint */}
        <div className="absolute bottom-2 right-2 text-[10px] font-mono text-neutral-500 bg-neutral-900/80 px-2 py-0.5 rounded border border-neutral-800 pointer-events-none z-20">
          {currentTool === 'text' || currentTool === 'stamp' ? 'Spustelėk norimoje vietoje' : 'Spausk ir vilk piešimui'}
        </div>
      </div>

      {/* Thread Colors & Controls */}
      <div className="flex flex-col gap-3 pt-1">
        <div className="flex items-center justify-between">
          <span className="text-xs text-neutral-300 font-medium">Siūlų / Dažų atspalvis:</span>
          <span className="text-xs font-mono text-neutral-400">
            {THREAD_COLORS.find((c) => c.hex === threadColor)?.label}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {THREAD_COLORS.map((c) => (
            <button
              key={c.hex}
              onClick={() => setThreadColor(c.hex)}
              title={c.label}
              className={`w-7 h-7 rounded-full border-2 transition-transform ${
                threadColor === c.hex ? 'scale-110 border-amber-400 ring-2 ring-amber-400/30' : 'border-neutral-700 hover:scale-105'
              }`}
              style={{ backgroundColor: c.hex }}
            />
          ))}
        </div>

        {/* Text Input when text tool is active */}
        {currentTool === 'text' && (
          <div className="pt-2">
            <label className="block text-xs text-neutral-400 mb-1">Įvesk norimą išsiuvinėti tekstą:</label>
            <input
              type="text"
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              placeholder="PVZ: VILNIUS TECH"
              className="w-full px-3 py-1.5 bg-neutral-950 border border-neutral-700 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-amber-400"
            />
          </div>
        )}

        {/* Stamp selector when stamp tool is active */}
        {currentTool === 'stamp' && (
          <div className="pt-2 flex items-center gap-2">
            <span className="text-xs text-neutral-400">Lopas:</span>
            {(
              [
                { id: 'badge', label: 'Emblema' },
                { id: 'star', label: 'Žvaigždė' },
                { id: 'heart', label: 'Širdelė' },
                { id: 'lightning', label: 'Žaibas' },
              ] as const
            ).map((s) => (
              <button
                key={s.id}
                onClick={() => setSelectedStamp(s.id)}
                className={`px-2.5 py-1 rounded text-xs font-mono border ${
                  selectedStamp === s.id
                    ? 'border-amber-400 bg-amber-400/10 text-white'
                    : 'border-neutral-800 bg-neutral-950 text-neutral-400 hover:text-white'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        )}

        {/* Brush / Stitch Thickness */}
        <div className="flex items-center justify-between gap-4 pt-1">
          <span className="text-xs text-neutral-400">Dygsnio / Teptuko storis:</span>
          <input
            type="range"
            min={2}
            max={12}
            value={brushSize}
            onChange={(e) => setBrushSize(Number(e.target.value))}
            className="w-32 accent-amber-400 cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
};
