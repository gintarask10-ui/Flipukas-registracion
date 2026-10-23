import React, { useState, useEffect } from 'react';
import { GarmentType, FabricMaterial, Product } from '../../types/clothing';
import { Sparkles, Layers, Sun, CheckCircle2, ShieldCheck } from 'lucide-react';

interface StyleLabSkeletonProps {
  isLoading: boolean;
  garmentType: GarmentType;
  product: Product;
  fabric: FabricMaterial;
  primaryColor: string;
}

export const StyleLabSkeleton: React.FC<StyleLabSkeletonProps> = ({
  isLoading,
  garmentType,
  product,
  fabric,
  primaryColor,
}) => {
  const [loadingStep, setLoadingStep] = useState(0);
  const [progress, setProgress] = useState(15);

  useEffect(() => {
    if (!isLoading) {
      setProgress(100);
      setLoadingStep(3);
      return;
    }

    setLoadingStep(0);
    setProgress(15);

    const t1 = setTimeout(() => {
      setLoadingStep(1);
      setProgress(48);
    }, 180);

    const t2 = setTimeout(() => {
      setLoadingStep(2);
      setProgress(78);
    }, 380);

    const t3 = setTimeout(() => {
      setLoadingStep(3);
      setProgress(95);
    }, 600);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [isLoading]);

  if (!isLoading && progress >= 100) {
    return null;
  }

  // Garment SVG Wireframe Silhouette by Type
  const renderGarmentWireframe = () => {
    switch (garmentType) {
      case 'hoodie':
        return (
          <svg viewBox="0 0 400 480" className="w-full h-full max-h-[380px] stroke-amber-400/50 fill-none">
            {/* Hood outline */}
            <path
              d="M140 110 C140 40, 260 40, 260 110 C250 145, 150 145, 140 110 Z"
              strokeWidth="2.5"
              className="animate-pulse"
            />
            {/* Hood inner fold */}
            <path d="M165 95 C165 65, 235 65, 235 95 C230 120, 170 120, 165 95" strokeWidth="1.5" strokeDasharray="4 3" opacity="0.6" />
            {/* Drawstrings */}
            <path d="M185 135 L180 195" strokeWidth="2" strokeLinecap="round" />
            <path d="M215 135 L220 195" strokeWidth="2" strokeLinecap="round" />
            {/* Aglets */}
            <rect x="178" y="195" width="4" height="10" rx="1" fill="#fbbf24" stroke="none" />
            <rect x="218" y="195" width="4" height="10" rx="1" fill="#fbbf24" stroke="none" />
            {/* Shoulders & Sleeves */}
            <path
              d="M140 110 L60 170 L80 340 L120 330 L115 220 L130 390 L270 390 L285 220 L280 330 L320 340 L340 170 L260 110"
              strokeWidth="2.5"
            />
            {/* Sleeve Creases / Wrinkles */}
            <path d="M75 220 C90 230, 95 240, 115 235" strokeWidth="1.5" opacity="0.5" />
            <path d="M78 250 C95 260, 100 270, 118 265" strokeWidth="1.5" opacity="0.5" />
            <path d="M325 220 C310 230, 305 240, 285 235" strokeWidth="1.5" opacity="0.5" />
            <path d="M322 250 C305 260, 300 270, 282 265" strokeWidth="1.5" opacity="0.5" />
            {/* Kangaroo pocket */}
            <path
              d="M145 285 L165 245 L235 245 L255 285 L250 375 L150 375 Z"
              strokeWidth="2"
              strokeDasharray="6 4"
            />
            {/* Pocket seam stitch lines */}
            <path d="M165 245 L235 245" strokeWidth="1.5" stroke="#fbbf24" opacity="0.8" />
            {/* Ribbed Hem & Cuffs */}
            <rect x="130" y="390" width="140" height="25" rx="3" strokeWidth="2" />
            <rect x="75" y="335" width="45" height="18" rx="2" strokeWidth="2" transform="rotate(-15 75 335)" />
            <rect x="280" y="335" width="45" height="18" rx="2" strokeWidth="2" transform="rotate(15 280 335)" />
            {/* Body drape center flow lines */}
            <path d="M190 145 C185 210, 185 300, 190 380" strokeWidth="1.5" strokeDasharray="8 6" opacity="0.3" />
            <path d="M210 145 C215 210, 215 300, 210 380" strokeWidth="1.5" strokeDasharray="8 6" opacity="0.3" />
          </svg>
        );

      case 'cargo':
        return (
          <svg viewBox="0 0 400 480" className="w-full h-full max-h-[380px] stroke-amber-400/50 fill-none">
            {/* Waistband */}
            <rect x="130" y="50" width="140" height="30" rx="4" strokeWidth="2.5" />
            <rect x="190" y="55" width="20" height="20" rx="3" strokeWidth="2" fill="#fbbf24" opacity="0.6" />
            {/* Legs with articulated knee bends */}
            <path
              d="M130 80 L115 230 L105 320 L120 440 L165 440 L185 260 L200 120 L215 260 L235 440 L280 440 L295 320 L285 230 L270 80 Z"
              strokeWidth="2.5"
            />
            {/* Cargo Side Pockets */}
            <rect x="90" y="190" width="35" height="60" rx="4" strokeWidth="2" strokeDasharray="4 3" />
            <rect x="275" y="190" width="35" height="60" rx="4" strokeWidth="2" strokeDasharray="4 3" />
            {/* Knee articulation creases */}
            <path d="M110 260 C125 255, 145 255, 160 260" strokeWidth="1.5" opacity="0.6" />
            <path d="M112 275 C125 270, 145 270, 158 275" strokeWidth="1.5" opacity="0.6" />
            <path d="M240 260 C255 255, 275 255, 290 260" strokeWidth="1.5" opacity="0.6" />
            <path d="M242 275 C255 270, 275 270, 288 275" strokeWidth="1.5" opacity="0.6" />
            {/* Ankle Cuffs */}
            <rect x="118" y="435" width="50" height="18" rx="3" strokeWidth="2" />
            <rect x="232" y="435" width="50" height="18" rx="3" strokeWidth="2" />
          </svg>
        );

      case 'sneakers':
        return (
          <svg viewBox="0 0 400 480" className="w-full h-full max-h-[380px] stroke-amber-400/50 fill-none">
            {/* Outsole Cushioning Base */}
            <path
              d="M60 340 C110 330, 290 330, 340 310 C345 330, 335 365, 310 375 C200 380, 100 380, 60 365 Z"
              strokeWidth="3"
            />
            {/* Tread grooving */}
            <path d="M80 370 L300 370" strokeWidth="1.5" strokeDasharray="6 4" opacity="0.7" />
            {/* Sneaker Upper Silhouette */}
            <path
              d="M75 340 C85 280, 120 220, 160 210 C180 205, 200 160, 230 150 C250 145, 270 170, 270 210 C290 230, 330 270, 340 310"
              strokeWidth="2.5"
            />
            {/* Padded Ankle Collar */}
            <path d="M200 180 C230 160, 260 170, 270 210" strokeWidth="2" strokeDasharray="4 3" />
            {/* Laces Criss-Cross */}
            <path d="M170 220 L210 210" strokeWidth="2" />
            <path d="M180 235 L220 225" strokeWidth="2" />
            <path d="M190 250 L230 240" strokeWidth="2" />
            <path d="M200 265 L240 255" strokeWidth="2" />
          </svg>
        );

      default:
        // T-Shirt / Jacket / Trench
        return (
          <svg viewBox="0 0 400 480" className="w-full h-full max-h-[380px] stroke-amber-400/50 fill-none">
            {/* Collar */}
            <path d="M160 90 C180 120, 220 120, 240 90" strokeWidth="2.5" />
            {/* Outer torso & sleeves */}
            <path
              d="M160 90 L80 140 L110 240 L140 230 L135 410 L265 410 L260 230 L290 240 L320 140 L240 90"
              strokeWidth="2.5"
            />
            {/* Seams & hem */}
            <line x1="135" y1="400" x2="265" y2="400" strokeWidth="2" strokeDasharray="6 4" />
            <line x1="140" y1="230" x2="260" y2="230" strokeWidth="1.5" opacity="0.4" />
          </svg>
        );
    }
  };

  const steps = [
    { title: 'Inicijuojamas WebGL 2.0 PBR variklis', detail: 'Three.js scenos ir kameros paruošimas' },
    { title: 'Generuojami normal & roughness žemėlapiai', detail: `${fabric.nameLt} mikro-pynimo tekstūros` },
    { title: 'Taikomi MeshPhysicalMaterial pūkelio sluoksniai', detail: 'Sheen mikrofibros šviesos sklaida' },
    { title: 'Kalibruojamas daugiataškis HDR studijos apšvietimas', detail: 'Minkšti šešėliai ir realistiški kontūrai' },
  ];

  return (
    <div
      className={`absolute inset-0 z-20 flex flex-col items-center justify-between p-6 bg-neutral-950/90 backdrop-blur-md transition-opacity duration-500 pointer-events-none select-none ${
        isLoading ? 'opacity-100' : 'opacity-0'
      }`}
    >
      {/* Top Telemetry Header */}
      <div className="w-full max-w-lg flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs font-mono text-amber-400">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
          <span className="font-semibold uppercase tracking-wider">3D PBR Kraunama</span>
        </div>
        <div className="flex items-center gap-3 text-xs font-mono text-neutral-400">
          <span>{product.name}</span>
          <span>·</span>
          <span className="text-amber-400/90">{progress}%</span>
        </div>
      </div>

      {/* Centerpiece Garment Wireframe Silhouette with Shimmer Light Beam */}
      <div className="relative w-full max-w-sm flex-1 flex items-center justify-center my-2 overflow-hidden">
        {/* Shimmer sweep gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-400/10 to-transparent -translate-x-full animate-[shimmer_2s_infinite] pointer-events-none" />

        {/* Ambient Color Glow behind the garment */}
        <div
          className="absolute w-48 h-48 rounded-full blur-3xl opacity-20 pointer-events-none"
          style={{ backgroundColor: primaryColor || '#f59e0b' }}
        />

        {/* Dynamic Wireframe SVG */}
        <div className="relative w-full flex items-center justify-center filter drop-shadow-[0_0_15px_rgba(251,191,36,0.15)]">
          {renderGarmentWireframe()}
        </div>

        {/* Floating Textile Specification Badge */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-neutral-900/90 border border-neutral-800 backdrop-blur-md shadow-lg text-[11px] font-mono text-neutral-300">
          <span
            className="w-2.5 h-2.5 rounded-full border border-white/20"
            style={{ backgroundColor: primaryColor }}
          />
          <span className="text-white font-medium">{fabric.nameLt}</span>
          {fabric.gsm && (
            <>
              <span className="text-neutral-600">|</span>
              <span className="text-amber-400">{fabric.gsm} GSM</span>
            </>
          )}
        </div>
      </div>

      {/* Bottom PBR Loading Checklist & Progress Bar */}
      <div className="w-full max-w-md bg-neutral-900/80 border border-neutral-800 rounded-2xl p-4 shadow-xl backdrop-blur-md flex flex-col gap-3">
        {/* Progress Bar */}
        <div className="w-full h-1.5 bg-neutral-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-amber-500 to-amber-300 rounded-full transition-all duration-300 ease-out shadow-[0_0_10px_rgba(251,191,36,0.5)]"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Active Stage Indicator */}
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-amber-400 animate-pulse" />
            <span className="text-neutral-200 font-medium">
              {steps[loadingStep]?.title || 'Ruošiamas 3D modelis...'}
            </span>
          </div>
          <span className="font-mono text-[10px] text-neutral-500">
            {loadingStep + 1} / {steps.length}
          </span>
        </div>

        <p className="text-[11px] text-neutral-400 font-mono truncate">
          {steps[loadingStep]?.detail}
        </p>
      </div>
    </div>
  );
};
