import React, { useState, useEffect, useCallback } from 'react';
import {
  Sparkles,
  X,
  Check,
  ShoppingBag,
  ArrowRight,
  Palette,
  ShieldCheck,
  Layers,
  Wand2,
  Package,
  Droplets,
  RotateCw,
  Cpu,
  CheckCircle2,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { CustomizationState, FabricMaterial, Product } from '../../types/clothing';
import { FABRICS } from '../../data/products';

interface AIStyleConsultantModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product;
  customization: CustomizationState;
  activeFabric: FabricMaterial;
  onApplyStyle: (updatedCustomization: Partial<CustomizationState>, fabric?: FabricMaterial) => void;
  onAddToCartItem: (itemTitle: string, price: number, fabricName: string) => void;
}

interface ComplementaryItem {
  id: string;
  titleLt: string;
  categoryLt: string;
  price: number;
  colorHex: string;
  image: string;
  reasonLt: string;
  fabricNameLt: string;
}

interface GeminiConsultantResponse {
  success: boolean;
  provider: string;
  titleLt: string;
  descriptionLt: string;
  styleVibeLt: string;
  colorHarmonyAdviceLt: string;
  fabricSynergyLt: string;
  accessories: ComplementaryItem[];
  suggestedColorTweaks?: {
    recommendedAccent?: string;
    recommendedHardware?: string;
  } | null;
}

export const AIStyleConsultantModal: React.FC<AIStyleConsultantModalProps> = ({
  isOpen,
  onClose,
  product,
  customization,
  activeFabric,
  onApplyStyle,
  onAddToCartItem,
}) => {
  const [promptInput, setPromptInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<GeminiConsultantResponse | null>(null);
  const [addedItemIds, setAddedItemIds] = useState<string[]>([]);
  const [appliedNotice, setAppliedNotice] = useState<string | null>(null);

  // Quick prompt chips
  const quickPrompts = [
    'Tamsus lietaus nebijantis stilius vakarėliui mieste iki 60€',
    'Prabangus šampaninis Mulberry šilko vakaras',
    'Minimalistinė Vilniaus pavasario elegancija',
    'Cyberpunk neoninis naktinis kontrastas',
  ];

  const fetchAIRecommendations = useCallback(
    async (userCustomPrompt?: string) => {
      setIsLoading(true);
      setAppliedNotice(null);

      try {
        const response = await fetch('/api/gemini/style-consultant', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            productName: product.name,
            productType: product.type,
            fabric: activeFabric,
            colors: {
              primary: customization.primaryColor,
              secondary: customization.secondaryColor,
              accent: customization.accentColor,
              hardware: customization.hardwareColor,
            },
            fitMode: customization.fitMode,
            customText: customization.customText,
            userPrompt: userCustomPrompt || '',
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: GeminiConsultantResponse = await response.json();
        setAnalysisResult(data);
      } catch (err) {
        console.warn('Could not reach Gemini endpoint, using local smart recommendations:', err);
        // Fallback curated
        setAnalysisResult({
          success: true,
          provider: 'local-curated',
          titleLt: `${activeFabric.nameLt} Atelier Derinys`,
          descriptionLt: `Optimizuotas derinys, išryškinantis ${activeFabric.nameLt} tekstūrą ir subtilius akcentus.`,
          styleVibeLt: 'Moderni Prabanga',
          colorHarmonyAdviceLt: `Akcento spalva ${customization.accentColor} puikiai kontrastuoja su pagrindiniu tonu ${customization.primaryColor}.`,
          fabricSynergyLt: `${activeFabric.nameLt} (${activeFabric.textureType}) suteikia tolygų judėjimo kritimą 3D scenoje.`,
          accessories: [
            {
              id: 'comp-sneakers-kinetix',
              titleLt: 'Kinetix-01 Bioniniai Kedai',
              categoryLt: 'Avalynė',
              price: 64,
              colorHex: customization.accentColor || '#d4af37',
              image:
                'https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=600&q=80',
              reasonLt: `Tobulai atkartoja ${customization.primaryColor} ir ${customization.accentColor} linijas bei papildo ${product.name} siluetą.`,
              fabricNameLt: 'Bioninis TPU & Aerotrikotažas',
            },
            {
              id: 'comp-pants-cargo',
              titleLt: 'Modulinės Krovinių Kelnės (Cargo Tech)',
              categoryLt: 'Kelnės',
              price: 49,
              colorHex: '#141419',
              image:
                'https://images.unsplash.com/photo-1517445312882-bc9910d016b7?auto=format&fit=crop&w=600&q=80',
              reasonLt:
                'Struktūruotas kirpimas subalansuoja viršutinės dalies proporcijas ir užtikrina ergonomišką judėjimo laisvę.',
              fabricNameLt: 'Atsparus Ripstop Softshell',
            },
            {
              id: 'comp-scarf-silk',
              titleLt: 'Atelier Šilko Skarelė / Monogramos Juosta',
              categoryLt: 'Aksesuaras',
              price: 24,
              colorHex: '#d4af37',
              image:
                'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?auto=format&fit=crop&w=600&q=80',
              reasonLt:
                'Prideda prabangų auksinį akcentą ties apykakle ir paryškina audinio švytėjimą.',
              fabricNameLt: '100% Mulberry Šilkas 22 Momme',
            },
          ],
        });
      } finally {
        setIsLoading(false);
      }
    },
    [product, activeFabric, customization]
  );

  useEffect(() => {
    if (isOpen && !analysisResult) {
      fetchAIRecommendations();
    }
  }, [isOpen, analysisResult, fetchAIRecommendations]);

  if (!isOpen) return null;

  const handleApplyRecommendedTweaks = () => {
    if (!analysisResult) return;

    if (analysisResult.suggestedColorTweaks) {
      onApplyStyle({
        accentColor:
          analysisResult.suggestedColorTweaks.recommendedAccent || customization.accentColor,
        hardwareColor:
          analysisResult.suggestedColorTweaks.recommendedHardware || customization.hardwareColor,
      });
    }

    setAppliedNotice(`AI Stiliaus patobulinimai sėkmingai pritaikyti 3D modeliui!`);
    try {
      confetti({
        particleCount: 40,
        spread: 55,
        origin: { y: 0.6 },
        colors: ['#d4af37', '#f5e6b8', '#10b981'],
      });
    } catch {
      // ignore
    }

    setTimeout(() => {
      setAppliedNotice(null);
    }, 3500);
  };

  const handleAddAccessory = (comp: ComplementaryItem) => {
    onAddToCartItem(comp.titleLt, comp.price, comp.fabricNameLt);
    setAddedItemIds((prev) => [...prev, comp.id]);
    setAppliedNotice(`Aksesuaras „${comp.titleLt}“ įdėtas į krepšelį!`);
    setTimeout(() => setAppliedNotice(null), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-neutral-950/85 backdrop-blur-md transition-opacity"
      />

      {/* Luxury Modal Container */}
      <div className="relative w-full max-w-4xl bg-gradient-to-br from-[#15151c] via-[#101015] to-[#0b0b0f] border border-[#d4af37]/40 rounded-3xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-5 border-b border-stone-800 flex items-center justify-between gap-4 bg-black/40">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#d4af37]/25 via-amber-600/20 to-yellow-500/10 border border-[#d4af37]/45 flex items-center justify-center text-[#d4af37] shadow-[0_0_20px_rgba(212,175,55,0.2)]">
              <Sparkles className="w-5 h-5 text-[#f5e6b8]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono tracking-widest uppercase text-[#d4af37] font-semibold">
                  Atelier AI Stiliaus Konsultantas
                </span>
                <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                  <Cpu className="w-2.5 h-2.5" />
                  <span>
                    {analysisResult?.provider === 'gemini-3.8-flash'
                      ? 'Gemini 3.8 Flash API'
                      : 'Atelier AI Engine'}
                  </span>
                </span>
              </div>
              <h3 className="font-serif-luxury font-bold text-xl text-white">
                Aprangos Analizė & Priderinti Katalogo Aksesuarai
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-stone-400 hover:text-white hover:bg-stone-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
          {/* Success / Alert Banner */}
          {appliedNotice && (
            <div className="p-3.5 rounded-2xl bg-[#d4af37]/20 border border-[#d4af37]/50 text-[#f5e6b8] text-xs flex items-center gap-2.5 animate-fadeIn">
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="font-medium">{appliedNotice}</span>
            </div>
          )}

          {/* Section 1: Current Garment Analysis Card */}
          <div className="p-5 rounded-3xl bg-stone-950/70 border border-stone-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div
                className="w-14 h-14 rounded-2xl border border-stone-700 shadow-md flex items-center justify-center shrink-0 relative overflow-hidden"
                style={{ backgroundColor: customization.primaryColor }}
              >
                <div
                  className="absolute bottom-0 right-0 w-6 h-6 rounded-tl-xl border-t border-l border-white/20"
                  style={{ backgroundColor: customization.accentColor }}
                />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-serif-luxury font-bold text-base text-white">
                    {product.name}
                  </h4>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-stone-800 text-[#d4af37] border border-stone-700">
                    {activeFabric.nameLt}
                  </span>
                </div>
                <div className="text-xs text-stone-400 mt-1 flex flex-wrap items-center gap-2 font-mono">
                  <span>Kirpimas: {customization.fitMode}</span>
                  <span>·</span>
                  <span className="flex items-center gap-1">
                    <span>Bazė:</span>
                    <span
                      className="inline-block w-2.5 h-2.5 rounded-full border border-white/30"
                      style={{ backgroundColor: customization.primaryColor }}
                    />
                  </span>
                  <span>·</span>
                  <span className="flex items-center gap-1">
                    <span>Akcentas:</span>
                    <span
                      className="inline-block w-2.5 h-2.5 rounded-full border border-white/30"
                      style={{ backgroundColor: customization.accentColor }}
                    />
                  </span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => fetchAIRecommendations(promptInput)}
              disabled={isLoading}
              className="px-4 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-300 hover:text-white border border-stone-700 text-xs font-mono flex items-center gap-2 cursor-pointer transition disabled:opacity-50"
            >
              <RotateCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>{isLoading ? 'Analizuojama...' : 'Atnaujinti Analizę'}</span>
            </button>
          </div>

          {/* Section 2: Gemini AI Critique & Harmony Insights */}
          {isLoading ? (
            <div className="p-8 rounded-3xl bg-stone-900/40 border border-stone-800 flex flex-col items-center justify-center gap-3 text-center">
              <div className="w-10 h-10 rounded-full border-2 border-[#d4af37] border-t-transparent animate-spin" />
              <p className="text-sm font-serif-luxury font-semibold text-white">
                Gemini API analizuoja jūsų audinio drapiravimą ir spalvų paletę...
              </p>
              <p className="text-xs text-stone-400 font-mono">
                Tikrinama harmonija su {activeFabric.nameLt} ir katalogo aksesuarais
              </p>
            </div>
          ) : analysisResult ? (
            <div className="p-6 rounded-3xl bg-gradient-to-br from-[#181822] via-[#121218] to-[#0e0e13] border border-[#d4af37]/35 shadow-xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-800 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-[#d4af37] font-semibold">
                      AI Konsultanto Išvada
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-[#f5e6b8] border border-amber-500/30">
                      {analysisResult.styleVibeLt}
                    </span>
                  </div>
                  <h4 className="font-serif-luxury font-bold text-lg text-white mt-0.5">
                    {analysisResult.titleLt}
                  </h4>
                </div>

                {analysisResult.suggestedColorTweaks && (
                  <button
                    type="button"
                    onClick={handleApplyRecommendedTweaks}
                    className="px-4 py-2 luxury-button-gold text-stone-950 font-bold text-xs rounded-xl flex items-center gap-2 cursor-pointer shadow-md self-start sm:self-auto shrink-0"
                  >
                    <Palette className="w-3.5 h-3.5" />
                    <span>Pritaikyti AI Spalvų Balansą</span>
                  </button>
                )}
              </div>

              <p className="text-xs text-stone-300 leading-relaxed font-light">
                {analysisResult.descriptionLt}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="p-3.5 rounded-2xl bg-black/40 border border-stone-800">
                  <div className="text-[10px] font-mono uppercase tracking-wider text-stone-400 flex items-center gap-1.5 mb-1">
                    <Palette className="w-3.5 h-3.5 text-[#d4af37]" />
                    <span>Spalvų Paletės Harmonija</span>
                  </div>
                  <p className="text-xs text-stone-300 font-light leading-relaxed">
                    {analysisResult.colorHarmonyAdviceLt}
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-black/40 border border-stone-800">
                  <div className="text-[10px] font-mono uppercase tracking-wider text-stone-400 flex items-center gap-1.5 mb-1">
                    <Layers className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Audinio Tekstūros Sinergija</span>
                  </div>
                  <p className="text-xs text-stone-300 font-light leading-relaxed">
                    {analysisResult.fabricSynergyLt}
                  </p>
                </div>
              </div>
            </div>
          ) : null}

          {/* Section 3: Natural Language Prompt Tuning */}
          <div className="p-5 rounded-3xl bg-black/40 border border-stone-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#d4af37] font-semibold">
                Patikslinkite Užklausą AI Stilistui
              </span>
              <span className="text-[11px] font-mono text-stone-400">
                Laisvas tekstas lietuviškai
              </span>
            </div>

            <div className="flex flex-wrap gap-2">
              {quickPrompts.map((chip, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setPromptInput(chip);
                    fetchAIRecommendations(chip);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-stone-900/80 hover:bg-stone-800 text-stone-300 hover:text-[#f5e6b8] border border-stone-800 hover:border-[#d4af37]/40 text-xs font-mono transition cursor-pointer"
                >
                  {chip}
                </button>
              ))}
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (promptInput.trim()) {
                  fetchAIRecommendations(promptInput);
                }
              }}
              className="flex gap-2.5 pt-1"
            >
              <input
                type="text"
                value={promptInput}
                onChange={(e) => setPromptInput(e.target.value)}
                placeholder="pvz. Noriu tamsaus, lietaus nebijančio stiliaus vakarėliui mieste iki 60 eurų..."
                className="flex-1 px-4 py-2.5 bg-stone-900/90 border border-stone-800 rounded-2xl text-xs text-white placeholder-stone-500 focus:outline-none focus:border-[#d4af37]"
              />
              <button
                type="submit"
                disabled={isLoading || !promptInput.trim()}
                className="px-5 py-2.5 luxury-button-gold text-stone-950 font-bold text-xs rounded-2xl flex items-center gap-2 cursor-pointer shadow-lg disabled:opacity-50"
              >
                <Wand2 className="w-4 h-4" />
                <span>Analizuoti</span>
              </button>
            </form>
          </div>

          {/* Section 4: Recommended Complementary Items & Accessories */}
          {analysisResult && analysisResult.accessories && analysisResult.accessories.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-[#d4af37] font-semibold">
                    Aksesuarų & Aprangos Harmonija
                  </span>
                  <h4 className="font-serif-luxury font-bold text-lg text-white">
                    Priderinti Katalogo Gaminiai
                  </h4>
                </div>
                <span className="text-xs font-mono text-stone-400">
                  Parinkta prie {activeFabric.nameLt} ir paletės
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {analysisResult.accessories.map((comp) => {
                  const isAdded = addedItemIds.includes(comp.id);

                  return (
                    <div
                      key={comp.id}
                      className="p-4 rounded-2xl bg-[#111116]/80 border border-stone-800 hover:border-[#d4af37]/40 transition-all flex flex-col justify-between gap-3 shadow-md"
                    >
                      <div>
                        <div className="relative aspect-video rounded-xl overflow-hidden mb-3 border border-stone-800 bg-black">
                          <img
                            src={comp.image}
                            alt={comp.titleLt}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-black/80 backdrop-blur-md text-[10px] font-mono text-[#f5e6b8] border border-[#d4af37]/30">
                            {comp.categoryLt}
                          </div>
                        </div>

                        <h5 className="font-serif-luxury font-bold text-sm text-white">
                          {comp.titleLt}
                        </h5>
                        <div className="text-[11px] font-mono text-stone-400 mt-0.5">
                          {comp.fabricNameLt}
                        </div>

                        <p className="text-xs text-stone-300 mt-2 leading-relaxed font-light">
                          {comp.reasonLt}
                        </p>
                      </div>

                      <div className="pt-3 border-t border-stone-800/80 flex items-center justify-between gap-2">
                        <span className="text-base font-serif-luxury font-bold text-[#f5e6b8] tabular-nums">
                          {comp.price} €
                        </span>

                        <button
                          type="button"
                          onClick={() => handleAddAccessory(comp)}
                          disabled={isAdded}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-sm ${
                            isAdded
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : 'luxury-button-gold text-stone-950'
                          }`}
                        >
                          {isAdded ? (
                            <>
                              <Check className="w-3.5 h-3.5" />
                              <span>Krepšelyje</span>
                            </>
                          ) : (
                            <>
                              <ShoppingBag className="w-3.5 h-3.5" />
                              <span>Į krepšelį</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Section 5: Phygital Experience & Zero-Waste Sustainability Guarantee */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
            <div className="p-4 rounded-2xl bg-black/40 border border-stone-800 flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-[#d4af37]/15 border border-[#d4af37]/35 flex items-center justify-center text-[#d4af37] shrink-0">
                <Package className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-serif-luxury font-bold text-white text-sm">
                    Fizinis Audinių Rinkinys (Phygital Box)
                  </span>
                  <span className="text-[10px] font-mono text-[#d4af37]">4.90 €</span>
                </div>
                <p className="text-xs text-stone-300 font-light leading-relaxed">
                  Bijote apsirikti? Užsisakykite visų 6 audinių fizinius pavyzdžius tiesiai į namus.
                  100% sumos grąžinama kaip nuolaida pirmu pirkimu.
                </p>
                <button
                  type="button"
                  onClick={() =>
                    onAddToCartItem(
                      'Fizinis Audinių Pavyzdžių Rinkinys (Phygital Sample Box)',
                      4.9,
                      'Visi 6 Atelier Audiniai'
                    )
                  }
                  className="text-xs text-[#d4af37] hover:underline font-mono font-medium pt-1 block cursor-pointer"
                >
                  Pridėti pavyzdžių dėžutę į krepšelį →
                </button>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-black/40 border border-stone-800 flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/35 flex items-center justify-center text-emerald-400 shrink-0">
                <Droplets className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-serif-luxury font-bold text-white text-sm">
                    Nulinių Atliekų Gamyba (Zero-Waste On-Demand)
                  </span>
                </div>
                <p className="text-xs text-stone-300 font-light leading-relaxed">
                  Kadangi gaminame tik pagal individualų 3D patvirtinimą, nelieka jokių neparduotų
                  drabužių likučių. Sutaupoma vidutiniškai 2 400 l vandens ir 0 kg tekstilės šiukšlių.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-stone-800 bg-black/40 flex items-center justify-between text-xs text-stone-400">
          <div className="flex items-center gap-2 text-[11px] font-mono">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Mados analizė pagal pasirinktą audinį ir paletę</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-200 font-medium transition cursor-pointer border border-stone-800"
          >
            Uždaryti
          </button>
        </div>
      </div>
    </div>
  );
};
