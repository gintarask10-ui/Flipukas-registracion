import React, { useState } from 'react';
import {
  QrCode,
  Smartphone,
  Copy,
  Check,
  ExternalLink,
  Camera,
  X,
  Sparkles,
  Layers,
  Compass,
  Maximize2,
} from 'lucide-react';
import { CustomizationState, FabricMaterial, Product } from '../../types/clothing';

interface ARQuickQRModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product;
  customization: CustomizationState;
  fabric: FabricMaterial;
  onLaunchWebcamAR?: () => void;
}

export const ARQuickQRModal: React.FC<ARQuickQRModalProps> = ({
  isOpen,
  onClose,
  product,
  customization,
  fabric,
  onLaunchWebcamAR,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  // Generate shareable URL with parameters
  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : 'https://flipukas.lt';
  const arUrl = `${currentOrigin}/?product=${product.id}&color=${encodeURIComponent(
    customization.primaryColor
  )}&fabric=${encodeURIComponent(fabric.id)}&size=${customization.size}&ar=mobile`;

  const handleCopy = () => {
    navigator.clipboard.writeText(arUrl).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="max-w-md w-full bg-neutral-950 border border-neutral-800 rounded-3xl p-6 sm:p-7 shadow-2xl flex flex-col gap-5 text-neutral-100 relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Ambient Top Glow */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-32 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between gap-3 relative z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-400/15 border border-amber-400/30 flex items-center justify-center text-amber-400 shadow-sm">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-bold text-base text-white">
                Mobilus AR Režimas
              </h3>
              <p className="text-xs text-neutral-400">
                Pamatyk {product.name} savo kambaryje 1:1 masteliu
              </p>
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

        {/* QR Code Card */}
        <div className="flex flex-col items-center justify-center p-6 rounded-2xl bg-neutral-900/80 border border-neutral-800/90 relative group">
          {/* Decorative Corner Reticles */}
          <div className="absolute top-3 left-3 w-3 h-3 border-t-2 border-l-2 border-amber-400/70" />
          <div className="absolute top-3 right-3 w-3 h-3 border-t-2 border-r-2 border-amber-400/70" />
          <div className="absolute bottom-3 left-3 w-3 h-3 border-b-2 border-l-2 border-amber-400/70" />
          <div className="absolute bottom-3 right-3 w-3 h-3 border-b-2 border-r-2 border-amber-400/70" />

          {/* QR Code SVG */}
          <div className="p-3.5 bg-white rounded-2xl shadow-xl flex items-center justify-center">
            <svg
              className="w-48 h-48 sm:w-52 sm:h-52"
              viewBox="0 0 100 100"
              shapeRendering="crispEdges"
            >
              {/* White Background */}
              <rect width="100" height="100" fill="#ffffff" rx="6" />

              {/* Corner Position Detection Squares (Top-Left, Top-Right, Bottom-Left) */}
              {/* Top-Left */}
              <rect x="8" y="8" width="24" height="24" fill="#000000" rx="4" />
              <rect x="12" y="12" width="16" height="16" fill="#ffffff" rx="2" />
              <rect x="16" y="16" width="8" height="8" fill="#000000" rx="1" />

              {/* Top-Right */}
              <rect x="68" y="8" width="24" height="24" fill="#000000" rx="4" />
              <rect x="72" y="12" width="16" height="16" fill="#ffffff" rx="2" />
              <rect x="76" y="16" width="8" height="8" fill="#000000" rx="1" />

              {/* Bottom-Left */}
              <rect x="8" y="68" width="24" height="24" fill="#000000" rx="4" />
              <rect x="12" y="72" width="16" height="16" fill="#ffffff" rx="2" />
              <rect x="16" y="76" width="8" height="8" fill="#000000" rx="1" />

              {/* Timing Patterns */}
              <rect x="36" y="18" width="28" height="3" fill="#000000" />
              <rect x="18" y="36" width="3" height="28" fill="#000000" />

              {/* Custom High-Density Matrix Blocks */}
              <rect x="38" y="8" width="6" height="6" fill="#000000" />
              <rect x="48" y="8" width="6" height="6" fill="#000000" />
              <rect x="58" y="8" width="6" height="6" fill="#000000" />

              <rect x="36" y="26" width="8" height="8" fill="#000000" />
              <rect x="50" y="26" width="10" height="8" fill="#000000" />
              <rect x="68" y="36" width="8" height="8" fill="#000000" />

              <rect x="10" y="38" width="8" height="8" fill="#000000" />
              <rect x="24" y="44" width="8" height="6" fill="#000000" />
              <rect x="60" y="42" width="8" height="8" fill="#000000" />
              <rect x="76" y="38" width="16" height="8" fill="#000000" />

              {/* Central Stylized Amber Flipukas Emblem */}
              <rect x="38" y="38" width="24" height="24" rx="5" fill="#f59e0b" />
              <path
                d="M44 48 L48 54 L56 42"
                stroke="#000000"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />

              <rect x="38" y="66" width="8" height="8" fill="#000000" />
              <rect x="50" y="66" width="10" height="10" fill="#000000" />
              <rect x="66" y="58" width="8" height="6" fill="#000000" />
              <rect x="78" y="58" width="10" height="10" fill="#000000" />

              <rect x="38" y="80" width="12" height="12" fill="#000000" />
              <rect x="56" y="78" width="8" height="8" fill="#000000" />
              <rect x="70" y="74" width="16" height="18" fill="#000000" />
            </svg>
          </div>

          {/* Compatibility Badge */}
          <div className="mt-4 flex items-center gap-2 text-xs font-mono text-neutral-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Suderinama su iOS Safari & Android Chrome</span>
          </div>
        </div>

        {/* 3 Step Guidance */}
        <div className="flex flex-col gap-2.5 text-xs text-neutral-300 bg-neutral-900/40 p-3.5 rounded-2xl border border-neutral-800/80">
          <div className="flex items-start gap-2.5">
            <span className="w-5 h-5 rounded-full bg-amber-400/20 text-amber-300 font-mono font-bold text-[11px] flex items-center justify-center shrink-0">
              1
            </span>
            <span>Nukreipk telefono kamerą (iPhone Camera arba Android Lens/Chrome).</span>
          </div>
          <div className="flex items-start gap-2.5">
            <span className="w-5 h-5 rounded-full bg-amber-400/20 text-amber-300 font-mono font-bold text-[11px] flex items-center justify-center shrink-0">
              2
            </span>
            <span>Paspausk atsiradusią nuorodą, kad atidarytum AR peržiūrą.</span>
          </div>
          <div className="flex items-start gap-2.5">
            <span className="w-5 h-5 rounded-full bg-amber-400/20 text-amber-300 font-mono font-bold text-[11px] flex items-center justify-center shrink-0">
              3
            </span>
            <span>Nukreipk telefoną į kambarį ir pamatyk drabužį realioje erdvėje 1:1 masteliu.</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={handleCopy}
            className="w-full py-3 px-4 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-medium text-xs transition flex items-center justify-center gap-2 cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span>Nuoroda sėkmingai nukopijuota!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-amber-400" />
                <span>Kopijuoti AR nuorodą į iškarpinę</span>
              </>
            )}
          </button>

          {onLaunchWebcamAR && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onLaunchWebcamAR();
              }}
              className="w-full py-3 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold text-xs transition flex items-center justify-center gap-2 cursor-pointer shadow-md active:scale-98"
            >
              <Camera className="w-4 h-4" />
              <span>Išbandyti dabar su kompiuterio kamera</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
