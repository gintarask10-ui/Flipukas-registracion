import React, { useState } from 'react';
import {
  Camera,
  Eye,
  Sparkles,
  Maximize2,
  Check,
  ShoppingBag,
  Sliders,
  ChevronRight,
  User,
  ShieldCheck,
  Layers,
  ZoomIn,
} from 'lucide-react';
import { CustomizationState, FabricMaterial, Product } from '../../types/clothing';

interface EditorialLookbookViewProps {
  product: Product;
  customization: CustomizationState;
  fabric: FabricMaterial;
  price: number;
  onAddToCart: () => void;
  onOpen3DLab: () => void;
}

// Curated high-fashion editorial photo angles and lifestyle outfits
interface LookbookShot {
  id: string;
  label: string;
  subtitle: string;
  aspect: string;
  fallbackImage: string;
  modelDetails: string;
}

const LOOKBOOK_SHOTS: LookbookShot[] = [
  {
    id: 'studio-front',
    label: '1. Studijos Portretas',
    subtitle: 'Modelis: 186 cm, dėvi L dydį',
    aspect: '4:5',
    fallbackImage: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=1000&q=80',
    modelDetails: 'Natūralus kritimas, pečių linija ir elastingi rankogaliai',
  },
  {
    id: 'street-lifestyle',
    label: '2. Gatvės Gyvenimo Būdas',
    subtitle: 'Vilnius Senamiestis • Vakaro šviesa',
    aspect: '4:5',
    fallbackImage: 'https://images.unsplash.com/photo-1509967419530-da38b4704bc6?auto=format&fit=crop&w=1000&q=80',
    modelDetails: 'Derinys su plačiomis cargo kelnėmis ir sportiniais batais',
  },
  {
    id: 'macro-detail',
    label: '3. Siūlių & Audinio Makro',
    subtitle: 'Dvigubos armuotos siūlės',
    aspect: '1:1',
    fallbackImage: 'https://images.unsplash.com/photo-1578587018452-892bacefd3f2?auto=format&fit=crop&w=1000&q=80',
    modelDetails: '380 GSM šukuotinės medvilnės pūkelis ir metalinė furnitūra',
  },
  {
    id: 'outfit-coordination',
    label: '4. Stiliaus Derinys (Outfit Inspo)',
    subtitle: 'Visas gatvės mados komplektas',
    aspect: '4:5',
    fallbackImage: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1000&q=80',
    modelDetails: 'Kartu su Flipukas kepure ir technine liemene',
  },
];

export const EditorialLookbookView: React.FC<EditorialLookbookViewProps> = ({
  product,
  customization,
  fabric,
  price,
  onAddToCart,
  onOpen3DLab,
}) => {
  const [activeShotIndex, setActiveShotIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);

  const currentShot = LOOKBOOK_SHOTS[activeShotIndex];

  return (
    <div className="w-full flex flex-col gap-4 bg-neutral-900/90 rounded-3xl border border-neutral-800 p-4 sm:p-6 shadow-2xl">
      {/* Top Header with Editorial Mode explanation */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-bold flex items-center gap-1">
              <Camera className="w-3 h-3" />
              Tikra Studijos Fotosesija (Ant žmogaus)
            </span>
            <span className="text-xs font-mono text-neutral-400">
              Modelis dėvi pasirinktą spalvą
            </span>
          </div>
          <h3 className="font-display font-bold text-lg text-white mt-1">
            {product.name} — Realus Drabužio Kritimas
          </h3>
          <p className="text-xs text-neutral-400">
            Nėra 3D kompiuterinės grafikos triukšmo – pamatyk, kaip drabužis atrodo ant tikro kūno natūralioje šviesoje.
          </p>
        </div>

        <button
          onClick={onOpen3DLab}
          className="px-3.5 py-2 rounded-xl border border-neutral-700 bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-semibold transition flex items-center gap-2 cursor-pointer shadow-sm"
        >
          <Eye className="w-4 h-4 text-cyan-400" />
          <span>Grįžti į 3D Interaktyvų Sukimą</span>
        </button>
      </div>

      {/* Main Photographic Stage */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Large Editorial Photo Viewport */}
        <div className="lg:col-span-8 flex flex-col gap-3">
          <div
            className={`relative rounded-2xl overflow-hidden border border-neutral-800 bg-neutral-950 flex items-center justify-center shadow-2xl transition-all ${
              isZoomed ? 'h-[550px]' : 'h-[440px] sm:h-[480px]'
            }`}
          >
            {/* Background Studio Photo */}
            <img
              src={currentShot.fallbackImage}
              alt={currentShot.label}
              className="w-full h-full object-cover transition-transform duration-500 hover:scale-102"
            />

            {/* Simulated Live Tint Layer matching the customized primary color */}
            <div
              className="absolute inset-0 pointer-events-none mix-blend-color opacity-35"
              style={{ backgroundColor: customization.primaryColor }}
            />

            {/* Gradient Dark Vignette */}
            <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/90 via-transparent to-neutral-950/40 pointer-events-none" />

            {/* Overlay Badges */}
            <div className="absolute top-4 left-4 flex flex-col gap-1.5">
              <span className="bg-neutral-950/80 backdrop-blur-md px-3 py-1 rounded-xl border border-neutral-700/80 text-xs font-mono font-bold text-white flex items-center gap-1.5 shadow">
                <span
                  className="w-3 h-3 rounded-full border border-white/40 shrink-0"
                  style={{ backgroundColor: customization.primaryColor }}
                />
                <span>Pritaikyta spalva: {customization.primaryColor}</span>
              </span>

              <span className="bg-neutral-950/80 backdrop-blur-md px-3 py-1 rounded-xl border border-neutral-700/80 text-xs font-mono text-amber-400 font-semibold shadow">
                {fabric.nameLt} ({fabric.gsm ? `${fabric.gsm} g/m²` : '380 g/m²'})
              </span>
            </div>

            {/* Bottom Photo Caption */}
            <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-4">
              <div className="bg-neutral-950/85 backdrop-blur-md p-3 rounded-2xl border border-neutral-800 max-w-md shadow-lg">
                <h4 className="font-bold text-sm text-white">{currentShot.label}</h4>
                <p className="text-xs text-neutral-300 mt-0.5">{currentShot.subtitle}</p>
                <p className="text-[11px] text-neutral-400 mt-1 font-mono">
                  ✓ {currentShot.modelDetails}
                </p>
              </div>

              <button
                onClick={() => setIsZoomed(!isZoomed)}
                title="Priartinti nuotrauką"
                className="p-2.5 rounded-xl bg-neutral-950/80 backdrop-blur-md border border-neutral-700 text-neutral-300 hover:text-white transition shadow cursor-pointer"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Shot Angle Selector Thumbnails */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {LOOKBOOK_SHOTS.map((shot, idx) => (
              <button
                key={shot.id}
                onClick={() => setActiveShotIndex(idx)}
                className={`p-2.5 rounded-xl border text-left transition flex items-center gap-2.5 cursor-pointer ${
                  activeShotIndex === idx
                    ? 'border-amber-400 bg-amber-400/10 ring-1 ring-amber-400/40'
                    : 'border-neutral-800 bg-neutral-950/60 hover:bg-neutral-800 hover:border-neutral-700 text-neutral-400'
                }`}
              >
                <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 border border-neutral-700">
                  <img
                    src={shot.fallbackImage}
                    alt={shot.label}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="min-w-0">
                  <span className="font-bold text-xs text-white block truncate">
                    {shot.label.replace(/^\d+\.\s*/, '')}
                  </span>
                  <span className="text-[10px] text-neutral-400 truncate block">
                    {idx === 0 ? 'Modelio portretas' : idx === 1 ? 'Gatvėje' : idx === 2 ? 'Siūlės' : 'Derinys'}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Right Editorial Info & Fast Purchase Panel */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          {/* Garment Fit & Body Fall Spec */}
          <div className="p-4 rounded-2xl bg-neutral-950/80 border border-neutral-800 flex flex-col gap-3">
            <h4 className="font-bold text-sm text-white flex items-center gap-2">
              <User className="w-4 h-4 text-amber-400" />
              <span>Kaip drabužis gula ant kūno?</span>
            </h4>

            <div className="space-y-2 text-xs text-neutral-300 leading-relaxed">
              <div className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold shrink-0">✓</span>
                <span>
                  <strong>Pečių linija:</strong> Nuleista „Drop-Shoulder“ konstrukcija sukuria šiuolaikinį, laisvą gatvės siluetą.
                </span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold shrink-0">✓</span>
                <span>
                  <strong>Audinio svoris:</strong> {fabric.nameLt} ({fabric.gsm || 380} g/m²) nesubliūkšta ir išlaiko aiškią formą.
                </span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold shrink-0">✓</span>
                <span>
                  <strong>Gobtuvai ir rankogaliai:</strong> Tankus 2×2 rib-knit tamprus mezgimas – rankovės nesmunka, gobtuvas stovi taisyklingai.
                </span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800 text-[11px] text-neutral-400">
              <span className="font-bold text-amber-400 block mb-0.5">Dydžių rekomendacija:</span>
              Jei nori labiau prigludusio stiliaus – rinkis savo įprastą dydį ({customization.size}). Jei nori laisvo „Oversized“ kritimo – rinkis 1 dydžiu didesnį.
            </div>
          </div>

          {/* Quick Buy Card (Fast CRO focus) */}
          <div className="p-4 rounded-2xl bg-neutral-950/80 border border-neutral-800 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs text-neutral-400 block">Kaina su pasirinktu audiniu:</span>
                <span className="text-2xl font-display font-bold text-white tabular-nums">
                  {price.toFixed(2)} €
                </span>
              </div>
              <span className="text-[10px] font-mono px-2 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                Pristatymas 1–2 d.d.
              </span>
            </div>

            <button
              onClick={onAddToCart}
              className="w-full py-3.5 px-4 rounded-xl font-bold text-sm bg-amber-400 hover:bg-amber-300 text-neutral-950 transition flex items-center justify-center gap-2 shadow-lg shadow-amber-400/20 active:scale-98 cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Įdėti į krepšelį ({price.toFixed(2)} €)</span>
            </button>

            <div className="flex items-center justify-center gap-3 text-[11px] text-neutral-400 font-mono text-center">
              <span>✓ 30 d. nemokamas grąžinimas</span>
              <span>•</span>
              <span>✓ 100% Natūrali medvilnė</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
