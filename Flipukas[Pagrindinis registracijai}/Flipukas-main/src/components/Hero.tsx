import React from 'react';
import { ArrowDown, Box, RotateCw, Sparkles } from 'lucide-react';
import { HERO_IMAGE } from '../data/products';

interface HeroProps {
  onOpenLab: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onOpenLab }) => {
  return (
    <section className="relative w-full border-b border-stone-800/80 overflow-hidden bg-gradient-to-b from-[#0c0c10] via-[#0f0f15] to-[#0c0c10]">
      {/* Subtle ambient luxury gold illumination in background */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#d4af37]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-[#c49d32]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-10 items-center">
          {/* Left Column: Editorial Proposition (7 cols) */}
          <div className="lg:col-span-7 flex flex-col justify-center">
            {/* Clean unboxed metadata kicker */}
            <div className="flex items-center gap-2 text-[11px] font-mono tracking-[0.2em] text-stone-400 mb-4 uppercase">
              <span className="text-[#d4af37] font-semibold">Flipukas Atelier 2026</span>
              <span aria-hidden="true" className="text-stone-600">·</span>
              <span>Skaitmeninė Mados Realija</span>
              <span aria-hidden="true" className="text-stone-600">·</span>
              <span>3D Geometrija</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-serif-luxury font-bold tracking-tight text-white text-balance leading-[1.08] mb-6">
              Aukštosios mados 3D laboratorija ir autorinis stilius.
            </h1>

            <p className="text-base sm:text-lg text-stone-300 leading-relaxed mb-8 max-w-2xl font-light">
              Ar kada nors svajojai drabužius rinktis ne iš plokščių nuotraukų, o pamatyti juos realiu laiku – iš visų pusių, su natūraliu audinių švytėjimu, mikroskopiniu pynimu ir asmenine monograma? <strong className="text-white font-medium">„Flipukas Atelier“</strong> keičia požiūrį į internetinę madą.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-4 mb-10">
              <button
                onClick={onOpenLab}
                className="px-7 py-3.5 luxury-button-gold text-stone-950 font-bold text-xs rounded-xl transition-all shadow-xl flex items-center gap-2.5 cursor-pointer"
              >
                <Box className="w-4 h-4" />
                <span>Atidaryti 3D Laboratoriją</span>
              </button>

              <a
                href="#kolekcija"
                className="px-6 py-3.5 bg-stone-900/80 hover:bg-stone-800 text-stone-200 hover:text-white font-medium text-xs rounded-xl border border-stone-800 transition-colors flex items-center gap-2"
              >
                <span className="font-serif-luxury text-sm font-semibold">Žiūrėti kolekciją</span>
                <ArrowDown className="w-3.5 h-3.5 text-stone-400" />
              </a>
            </div>

            {/* Quantitative Metrics Adjacency */}
            <div className="grid grid-cols-3 gap-6 pt-8 border-t border-stone-800/80 text-stone-400">
              <div>
                <div className="text-2xl font-serif-luxury font-bold text-white tabular-nums tracking-tight">
                  Nuo 22 €
                </div>
                <div className="text-[11px] text-stone-400 mt-1 font-mono uppercase tracking-wider">
                  Autorinės kainos
                </div>
              </div>
              <div>
                <div className="text-2xl font-serif-luxury font-bold text-white tabular-nums tracking-tight">
                  0 ms
                </div>
                <div className="text-[11px] text-stone-400 mt-1 font-mono uppercase tracking-wider">
                  Siuvimo & 3D delsa
                </div>
              </div>
              <div>
                <div className="text-2xl font-serif-luxury font-bold text-[#f5e6b8] tabular-nums tracking-tight">
                  360°
                </div>
                <div className="text-[11px] text-stone-400 mt-1 font-mono uppercase tracking-wider">
                  2D Makro Pynimas
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Visual Campaign Showcase (5 cols) */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-3xl overflow-hidden border border-[#d4af37]/25 bg-stone-900 shadow-2xl group">
              <img
                src={HERO_IMAGE}
                alt="Flipukas 3D drabužių studijos galerija"
                referrerPolicy="no-referrer"
                className="w-full h-[470px] sm:h-[530px] object-cover object-center group-hover:scale-105 transition-transform duration-700"
              />

              {/* Scrim Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#0c0c10]/95 via-[#0c0c10]/20 to-transparent" />

              {/* Floating interactive tag */}
              <div className="absolute bottom-6 left-6 right-6 p-4 rounded-2xl bg-black/80 backdrop-blur-md border border-stone-800 flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-mono tracking-widest text-[#d4af37] uppercase font-semibold">
                    Vilnius Runway // 2026
                  </div>
                  <div className="text-sm font-serif-luxury font-bold text-white mt-0.5">
                    „Aero-Shift“ & „Kinetix“ Atelier
                  </div>
                </div>
                <button
                  onClick={onOpenLab}
                  className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-mono transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <RotateCw className="w-3.5 h-3.5 text-[#d4af37]" />
                  <span>3D Apžiūra</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
