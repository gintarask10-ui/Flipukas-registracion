import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import {
  Check,
  Compass,
  Grid,
  Layers,
  LayoutTemplate,
  Palette,
  Search,
  Sparkles,
  Sun,
  X,
  Zap,
} from 'lucide-react';
import {
  PRESET_DESIGN_TEMPLATES,
  PresetDesignTemplate,
} from '../../data/presetTemplates';
import { CustomizationState, FabricMaterial } from '../../types/clothing';

export interface PresetTemplatesLibraryProps {
  isOpen?: boolean;
  onClose?: () => void;
  isInlineTab?: boolean;
  activeTemplateId?: string | null;
  onApplyTemplate: (template: PresetDesignTemplate) => void;
}

export const PresetTemplatesLibrary: React.FC<PresetTemplatesLibraryProps> = ({
  isOpen = true,
  onClose,
  isInlineTab = false,
  activeTemplateId,
  onApplyTemplate,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [appliedId, setAppliedId] = useState<string | null>(null);

  if (!isOpen && !isInlineTab) return null;

  const categories = ['All', 'Aesthetic', 'Minimal', 'Nature', 'Streetwear', 'Vintage'];

  const filteredTemplates = PRESET_DESIGN_TEMPLATES.filter((tmpl) => {
    const matchesCategory = selectedCategory === 'All' || tmpl.category === selectedCategory;
    const matchesSearch =
      tmpl.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tmpl.tagline.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tmpl.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleApply = (template: PresetDesignTemplate) => {
    onApplyTemplate(template);
    setAppliedId(template.id);
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.7 },
      colors: [template.colors.accent, template.colors.primary, '#f59e0b'],
    });

    setTimeout(() => {
      setAppliedId(null);
    }, 2500);

    if (onClose && !isInlineTab) {
      setTimeout(() => {
        onClose();
      }, 800);
    }
  };

  const bodyContent = (
    <div className="flex flex-col gap-4">
      {/* Category Pills & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1 sm:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-amber-400 text-neutral-950 font-bold shadow'
                  : 'bg-neutral-800/80 text-neutral-400 hover:text-white hover:bg-neutral-700'
              }`}
            >
              {cat === 'All' ? 'Visi šablonai' : cat}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative min-w-[200px]">
          <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Ieškoti stiliaus..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-neutral-950/80 border border-neutral-800 text-xs text-neutral-200 placeholder:text-neutral-500 focus:outline-none focus:border-amber-400/50"
          />
        </div>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredTemplates.map((template) => {
          const isJustApplied = appliedId === template.id;
          const isActive = activeTemplateId === template.id;

          return (
            <div
              key={template.id}
              className={`rounded-2xl border transition-all duration-200 overflow-hidden flex flex-col justify-between ${
                isJustApplied || isActive
                  ? 'border-amber-400 bg-neutral-900/90 ring-1 ring-amber-400/30 shadow-xl'
                  : 'border-neutral-800 bg-neutral-900/50 hover:border-neutral-700 hover:bg-neutral-900/80'
              }`}
            >
              {/* Header Visual Banner */}
              <div
                className={`p-4 bg-gradient-to-r ${template.previewGradient} relative overflow-hidden flex items-center justify-between`}
              >
                <div className="relative z-10">
                  <span className="text-[10px] uppercase font-mono font-bold tracking-wider px-2 py-0.5 rounded bg-black/60 text-white backdrop-blur-sm">
                    {template.badge}
                  </span>
                  <h4 className="font-bold text-white text-base mt-1 drop-shadow-sm">
                    {template.name}
                  </h4>
                  <p className="text-xs text-white/80 line-clamp-1">{template.tagline}</p>
                </div>

                {/* Decorative Icon */}
                <div className="w-12 h-12 rounded-2xl bg-black/30 backdrop-blur-md border border-white/20 flex items-center justify-center text-white shrink-0">
                  <LayoutTemplate className="w-6 h-6" />
                </div>
              </div>

              {/* Body Details */}
              <div className="p-4 flex flex-col gap-3.5 flex-1 justify-between">
                <p className="text-xs text-neutral-300 leading-relaxed">
                  {template.description}
                </p>

                {/* Combined Elements Summary */}
                <div className="flex flex-col gap-2 pt-2 border-t border-neutral-800/80">
                  {/* Colors & Pattern */}
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-neutral-400 font-mono text-[11px] flex items-center gap-1.5">
                      <Palette className="w-3.5 h-3.5 text-amber-400" />
                      Spalvų paletė:
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span
                        className="w-4 h-4 rounded-full border border-neutral-600 shadow-sm"
                        style={{ backgroundColor: template.colors.primary }}
                        title="Pagrindinis audinys"
                      />
                      <span
                        className="w-4 h-4 rounded-full border border-neutral-600 shadow-sm"
                        style={{ backgroundColor: template.colors.secondary }}
                        title="Rankogaliai ir detalės"
                      />
                      <span
                        className="w-4 h-4 rounded-full border border-neutral-600 shadow-sm"
                        style={{ backgroundColor: template.colors.accent }}
                        title="Akcentai"
                      />
                    </div>
                  </div>

                  {/* Pattern & Layers */}
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-neutral-400 font-mono text-[11px] flex items-center gap-1.5">
                      <Grid className="w-3.5 h-3.5 text-amber-400" />
                      Raštas & Sluoksniai:
                    </span>
                    <div className="flex items-center gap-1 text-[11px] font-mono text-neutral-300">
                      <span className="capitalize">{template.pattern.type}</span>
                      <span>·</span>
                      <span className="text-amber-400 font-bold">
                        {template.layers.length} sluoksniai
                      </span>
                    </div>
                  </div>

                  {/* Lighting Preset */}
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-neutral-400 font-mono text-[11px] flex items-center gap-1.5">
                      <Sun className="w-3.5 h-3.5 text-amber-400" />
                      Rekomenduojama šviesa:
                    </span>
                    <span className="text-[11px] font-mono capitalize text-neutral-300">
                      {template.lightingPreset === 'neon-night'
                        ? 'Neon Night'
                        : template.lightingPreset === 'golden-hour'
                        ? 'Golden Hour'
                        : 'Studio White'}
                    </span>
                  </div>
                </div>

                {/* Apply Button */}
                <button
                  onClick={() => handleApply(template)}
                  className={`w-full py-2.5 px-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md ${
                    isJustApplied
                      ? 'bg-emerald-500 text-neutral-950 font-extrabold'
                      : 'bg-amber-400 hover:bg-amber-300 text-neutral-950 hover:scale-[1.01]'
                  }`}
                >
                  {isJustApplied ? (
                    <>
                      <Check className="w-4 h-4 stroke-[3]" />
                      <span>Šablonas pritaikytas 3D modeliui!</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Pritaikyti visą stiliaus šabloną</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  if (isInlineTab) {
    return (
      <div className="bg-neutral-900/60 p-4 sm:p-5 rounded-2xl border border-neutral-800 flex flex-col gap-4">
        <div className="flex items-center justify-between border-b border-neutral-800/80 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-amber-400">
              <LayoutTemplate className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-white text-sm">
                Preset Dizaino Šablonų Biblioteka
              </h3>
              <p className="text-[11px] text-neutral-400">
                1-paspaudimu pritaikyk suderintus raštus, emblemas, tipografiją ir spalvas
              </p>
            </div>
          </div>
        </div>
        {bodyContent}
      </div>
    );
  }

  // Modal Mode
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-4xl max-h-[88vh] bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-neutral-800 flex items-center justify-between bg-neutral-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-amber-400">
              <LayoutTemplate className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-white text-base flex items-center gap-2">
                Preset Dizaino Šablonų Biblioteka
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-400 text-neutral-950 font-bold uppercase">
                  Kuratorystė
                </span>
              </h3>
              <p className="text-xs text-neutral-400">
                Pasirink autentišką estetinę temą – automatiškai suderinsime raštus, grafiką, audinį ir apšvietimą
              </p>
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Scrollable content */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1">
          {bodyContent}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-neutral-800 bg-neutral-950/70 flex items-center justify-between text-xs text-neutral-400">
          <span className="flex items-center gap-1.5 font-mono text-[11px]">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Pritaikius šabloną visus sluoksnius gali redaguoti sluoksnių skydelyje
          </span>
          {onClose && (
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-medium text-xs transition cursor-pointer"
            >
              Uždaryti
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
