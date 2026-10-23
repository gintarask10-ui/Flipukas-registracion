import React, { useState } from 'react';
import {
  Cpu,
  Eye,
  Layers,
  Palette,
  Scale,
  Sparkles,
  ZoomIn,
  ArrowRight,
  ShieldCheck,
  Compass,
} from 'lucide-react';
import { FABRICS } from '../data/products';
import { FabricMaterial } from '../types/clothing';
import { MacroWeaveViewerModal } from './Fabric/MacroWeaveViewerModal';

interface TechFabricShowcaseProps {
  onSelectFabric?: (fabric: FabricMaterial) => void;
}

export const TechFabricShowcase: React.FC<TechFabricShowcaseProps> = ({ onSelectFabric }) => {
  const [inspectingFabric, setInspectingFabric] = useState<FabricMaterial | null>(null);

  const handleApplyFabric = (fabric: FabricMaterial) => {
    if (onSelectFabric) {
      onSelectFabric(fabric);
    } else {
      const el = document.getElementById('style-lab');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="technologijos" className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-stone-800/80">
      {/* Editorial Kicker & Title */}
      <div className="mb-14">
        <div className="text-[11px] font-mono uppercase tracking-[0.25em] text-[#d4af37] mb-2 font-semibold">
          03 // Haute Couture Inžinerija & Technologija
        </div>
        <h2 className="text-3xl sm:text-4xl font-serif-luxury font-bold tracking-tight text-white">
          Kaip veikia „Flipukas“ 3D Atelier Ekosistema
        </h2>
        <p className="text-sm text-stone-300 mt-2 max-w-2xl leading-relaxed">
          Tradicinėse internetinėse parduotuvėse pirkėjas mato tik statinį vaizdą. „Flipukas“ naudoja parametrinius WebGL skaičiavimus, audinio šviesos lūžio simuliaciją ir realaus laiko mikroskopinį pynimo atvaizdavimą.
        </p>
      </div>

      {/* 3 Core Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
        <div className="p-7 rounded-3xl luxury-card flex flex-col justify-between group hover:border-[#d4af37]/40 transition-all duration-300">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-[#d4af37]/15 border border-[#d4af37]/35 flex items-center justify-center text-[#d4af37] mb-6 shadow-inner group-hover:scale-105 transition-transform">
              <Eye className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-serif-luxury font-bold text-white tracking-tight mb-2">
              1. Interaktyvūs 3D Modeliai
            </h3>
            <p className="text-xs text-stone-300 leading-relaxed font-light">
              Apžiūrėk kiekvieną drabužį iš arti, pasuk bet kuriuo kampu ir įvertink audinio bei dizaino detales. Nuo gobtuvo fiksatorių iki ergonomiškų siūlių ir paslėptų kišenių.
            </p>
          </div>
          <div className="pt-6 mt-6 border-t border-stone-800/80 text-[11px] font-mono text-stone-400">
            Three.js WebGL · 60 FPS · 360° Dvigubas Orbit
          </div>
        </div>

        <div className="p-7 rounded-3xl luxury-card flex flex-col justify-between group hover:border-[#d4af37]/40 transition-all duration-300">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/35 flex items-center justify-center text-amber-300 mb-6 shadow-inner group-hover:scale-105 transition-transform">
              <Palette className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-serif-luxury font-bold text-white tracking-tight mb-2">
              2. Gyvas Personalizavimas & Siuvinėjimas
            </h3>
            <p className="text-xs text-stone-300 leading-relaxed font-light">
              Siūk dygsniais, piešk teptuku ar dėk lopų antspaudus tiesiai ant audinio. Kiekviena linija ar užrašas akimirksniu atsiranda ant 3D modelio krūtinės bei kišenių.
            </p>
          </div>
          <div className="pt-6 mt-6 border-t border-stone-800/80 text-[11px] font-mono text-stone-400">
            Realaus Laiko Siuvimo Studija · 0ms Vėlinimas
          </div>
        </div>

        <div className="p-7 rounded-3xl luxury-card flex flex-col justify-between group hover:border-[#d4af37]/40 transition-all duration-300">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/35 flex items-center justify-center text-emerald-400 mb-6 shadow-inner group-hover:scale-105 transition-transform">
              <Cpu className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-serif-luxury font-bold text-white tracking-tight mb-2">
              3. Prabangos & Ateities Patirtis
            </h3>
            <p className="text-xs text-stone-300 leading-relaxed font-light">
              Greita, minimalistinė ir intuityvi sąsaja, sukurta tam, kad apsipirkimas būtų ne tik patogus, bet ir įtraukiantis. Tai tavo asmeninė stiliaus laboratorija.
            </p>
          </div>
          <div className="pt-6 mt-6 border-t border-stone-800/80 text-[11px] font-mono text-stone-400">
            Sprogdinti Sluoksniai · 2D Makro Pynimas
          </div>
        </div>
      </div>

      {/* Materials Spec Grid & Micro-Interaction Section */}
      <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-br from-[#15151c] via-[#101015] to-[#0d0d12] border border-[#d4af37]/25 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#d4af37]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="text-[10px] font-mono tracking-widest uppercase text-[#d4af37] font-semibold mb-1">
              Atelier Audinių Laboratorija · Micro-Interaction
            </div>
            <h3 className="text-2xl font-serif-luxury font-bold text-white tracking-tight">
              Aukštosios Mados Audiniai su 2D Makro Pynimo Apžiūra
            </h3>
            <p className="text-xs text-stone-300 mt-1 max-w-xl">
              Spustelėkite bet kurį audinio pavyzdį (swatch), kad atvertumėte didelės raiškos 2D mikroskopinį pynimo vaizdą ir pamatytumėte siūlų geometriją prieš taikant 3D laboratorijoje.
            </p>
          </div>

          <div className="text-xs font-mono text-stone-400 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#d4af37]" />
            <span>Spustelėk kortelę arba pavyzdį</span>
          </div>
        </div>

        {/* Fabric Cards with Interactive Swatches */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {FABRICS.map((f) => {
            const fGsm = f.gsm || 350;
            const approxGarmentGrams = Math.round(fGsm * 1.8);

            return (
              <div
                key={f.id}
                onClick={() => setInspectingFabric(f)}
                className="group relative p-5 rounded-2xl bg-[#0e0e13]/85 hover:bg-[#14141c] border border-stone-800/90 hover:border-[#d4af37]/50 transition-all duration-300 cursor-pointer flex flex-col justify-between gap-4 shadow-lg hover:shadow-[#d4af37]/10 hover:-translate-y-1"
              >
                <div>
                  {/* Swatch Micro-interaction Visual Preview */}
                  <div className="relative h-28 rounded-xl overflow-hidden mb-3.5 border border-stone-800/80 bg-black/60 flex items-center justify-center group-hover:border-[#d4af37]/40 transition-colors">
                    {/* Simulated Weave Grid Pattern */}
                    <div
                      className="absolute inset-0 opacity-40 group-hover:opacity-70 transition-opacity"
                      style={{
                        backgroundImage: `radial-gradient(circle at 2px 2px, rgba(212, 175, 55, 0.25) 1px, transparent 0)`,
                        backgroundSize: '8px 8px',
                      }}
                    />

                    {/* Central Fabric Swatch Pill */}
                    <div className="relative z-10 flex flex-col items-center gap-1.5">
                      <div className="w-12 h-12 rounded-xl border border-white/20 shadow-lg flex items-center justify-center bg-stone-900 group-hover:scale-110 transition-transform">
                        <ZoomIn className="w-5 h-5 text-[#d4af37] group-hover:rotate-12 transition-transform" />
                      </div>
                      <span className="text-[10px] font-mono text-stone-300 group-hover:text-[#f5e6b8] transition-colors">
                        2D Makro Peržiūra
                      </span>
                    </div>

                    {/* Badge */}
                    <div className="absolute top-2 right-2">
                      <span className="text-[9px] font-mono px-2 py-0.5 rounded-md bg-black/80 text-[#f5e6b8] border border-[#d4af37]/30 backdrop-blur-md">
                        {f.badge}
                      </span>
                    </div>
                  </div>

                  {/* Title & Description */}
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-sm font-serif-luxury font-bold text-white group-hover:text-[#f5e6b8] transition-colors">
                      {f.nameLt}
                    </h4>
                  </div>
                  <p className="text-xs text-stone-300 leading-relaxed font-light line-clamp-2">
                    {f.description}
                  </p>
                </div>

                {/* Physical Weight Indicator (Dynamically changes with material selection) */}
                <div className="pt-3 border-t border-stone-800/80 space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-mono text-stone-300">
                    <span className="flex items-center gap-1 text-stone-400">
                      <Scale className="w-3.5 h-3.5 text-[#d4af37]" />
                      <span>Fizinis Svoris:</span>
                    </span>
                    <span className="text-[#f5e6b8] font-bold">{fGsm} GSM</span>
                  </div>

                  <div className="w-full h-1 bg-stone-900 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-amber-600 to-[#d4af37]"
                      style={{ width: `${Math.min(100, (fGsm / 450) * 100)}%` }}
                    />
                  </div>

                  <div className="flex justify-between items-center text-[10px] font-mono text-stone-400">
                    <span>Gaminys: ~{approxGarmentGrams} g</span>
                    <span className="text-[#d4af37] group-hover:underline flex items-center gap-1">
                      <span>Apžiūrėti</span>
                      <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* High-Resolution 2D Macro Weave Modal */}
      <MacroWeaveViewerModal
        fabric={inspectingFabric}
        isOpen={!!inspectingFabric}
        onClose={() => setInspectingFabric(null)}
        onApplyFabricToLab={handleApplyFabric}
      />
    </section>
  );
};
