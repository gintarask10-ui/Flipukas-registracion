import React, { useState, useEffect } from 'react';
import {
  Scissors,
  X,
  Check,
  Sparkles,
  Info,
  ShieldCheck,
  Ruler,
  Layers,
  FileText,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { CustomizationState, FabricMaterial, Product, SeamstressInstructions } from '../../types/clothing';

interface SeamstressNotesModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product;
  fabric: FabricMaterial;
  customization: CustomizationState;
  onSaveInstructions: (instructions: SeamstressInstructions, notesText: string) => void;
}

export const QUICK_SEAMSTRESS_PRESETS = [
  'Prašau prailginti nugaros apačią +2 cm geresniam kritimui',
  'Prailgintos rankovės (+2 cm) patogesniam dėvėjimui',
  'Alergiškas šiurkščiai vilnai – prašau minkštos medvilnės juostelės ties apykakle',
  'Dvigubai sustiprintos kišenių siūlės intensyviam nešiojimui',
  'Monogramos siuvinėjimui naudoti matinio šampano aukso siūlą',
  'Laisvesnė apykaklė ir minkštesnis elastingas juosmens kraštas',
];

export const SeamstressNotesModal: React.FC<SeamstressNotesModalProps> = ({
  isOpen,
  onClose,
  product,
  fabric,
  customization,
  onSaveInstructions,
}) => {
  const existing = customization.seamstressInstructions;
  const [privateNote, setPrivateNote] = useState<string>(
    existing?.privateNote || customization.seamstressNotes || ''
  );
  const [sleeveAdjustmentCm, setSleeveAdjustmentCm] = useState<number>(
    existing?.sleeveAdjustmentCm || 0
  );
  const [torsoLengthAdjustmentCm, setTorsoLengthAdjustmentCm] = useState<number>(
    existing?.torsoLengthAdjustmentCm || 0
  );
  const [liningPreference, setLiningPreference] = useState<
    'standard' | 'silk-touch' | 'breathable-mesh' | 'unlined'
  >(existing?.liningPreference || 'standard');
  const [specialHem, setSpecialHem] = useState<boolean>(existing?.specialHem || false);
  const [reinforcedPockets, setReinforcedPockets] = useState<boolean>(
    existing?.reinforcedPockets || false
  );
  const [threadColor, setThreadColor] = useState<string>(existing?.threadColor || 'match-fabric');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setPrivateNote(customization.seamstressInstructions?.privateNote || customization.seamstressNotes || '');
      setSleeveAdjustmentCm(customization.seamstressInstructions?.sleeveAdjustmentCm || 0);
      setTorsoLengthAdjustmentCm(customization.seamstressInstructions?.torsoLengthAdjustmentCm || 0);
      setLiningPreference(customization.seamstressInstructions?.liningPreference || 'standard');
      setSpecialHem(customization.seamstressInstructions?.specialHem || false);
      setReinforcedPockets(customization.seamstressInstructions?.reinforcedPockets || false);
      setThreadColor(customization.seamstressInstructions?.threadColor || 'match-fabric');
    }
  }, [isOpen, customization]);

  if (!isOpen) return null;

  const handleApplyPreset = (presetText: string) => {
    if (privateNote.includes(presetText)) return;
    setPrivateNote((prev) => (prev ? `${prev}\n• ${presetText}` : `• ${presetText}`));
  };

  const handleSave = () => {
    const instructions: SeamstressInstructions = {
      privateNote: privateNote.trim(),
      sleeveAdjustmentCm,
      torsoLengthAdjustmentCm,
      liningPreference,
      specialHem,
      reinforcedPockets,
      threadColor,
      updatedAt: Date.now(),
    };

    onSaveInstructions(instructions, privateNote.trim());
    setToastMessage('Siuvėjos instrukcijos sėkmingai išsaugotos gamybos lape!');

    try {
      confetti({
        particleCount: 35,
        spread: 50,
        origin: { y: 0.6 },
        colors: ['#d4af37', '#f5e6b8', '#10b981'],
      });
    } catch {
      // ignore
    }

    setTimeout(() => {
      setToastMessage(null);
      onClose();
    }, 1200);
  };

  const handleClear = () => {
    setPrivateNote('');
    setSleeveAdjustmentCm(0);
    setTorsoLengthAdjustmentCm(0);
    setLiningPreference('standard');
    setSpecialHem(false);
    setReinforcedPockets(false);
    setThreadColor('match-fabric');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-neutral-950/85 backdrop-blur-md transition-opacity"
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-2xl bg-gradient-to-br from-[#16161c] via-[#111116] to-[#0d0d12] border border-[#d4af37]/45 rounded-3xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-5 border-b border-stone-800 flex items-center justify-between gap-4 bg-black/40">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#d4af37]/25 via-amber-600/20 to-yellow-500/10 border border-[#d4af37]/45 flex items-center justify-center text-[#d4af37] shadow-[0_0_20px_rgba(212,175,55,0.2)]">
              <Scissors className="w-5 h-5 text-[#f5e6b8]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono tracking-widest uppercase text-[#d4af37] font-semibold">
                  Atelier Individualus Siuvimas
                </span>
                <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  Tiesioginis Ryšys su Meistru
                </span>
              </div>
              <h3 className="font-serif-luxury font-bold text-xl text-white">
                Siuvėjos Instrukcijos & Asmeninės Pastabos
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

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-5 text-xs text-stone-300">
          {toastMessage && (
            <div className="p-3.5 rounded-2xl bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 text-xs flex items-center gap-2.5 animate-fadeIn">
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="font-medium">{toastMessage}</span>
            </div>
          )}

          {/* Intro Box */}
          <div className="p-4 rounded-2xl bg-black/40 border border-stone-800 flex items-start gap-3">
            <Info className="w-4 h-4 text-[#d4af37] shrink-0 mt-0.5" />
            <div className="space-y-1">
              <div className="text-white font-medium">
                Gaminys: <strong className="text-[#f5e6b8]">{product.name}</strong> · Audinys:{' '}
                <strong className="text-[#f5e6b8]">{fabric.nameLt}</strong>
              </div>
              <p className="text-stone-400 leading-relaxed font-light">
                Šios instrukcijos bus tiesiogiai atspausdintos ant Vilniaus Atelier gamybinio lekalo.
                Mūsų meistrai atsižvelgs į kiekvieną jūsų pageidavimą prieš pradedant rankinį kirpimą.
              </p>
            </div>
          </div>

          {/* Quick Presets Chips */}
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#d4af37] font-semibold block mb-2">
              Dažniausiai naudojami pageidavimai (spustelėkite pridėti):
            </span>
            <div className="flex flex-wrap gap-1.5">
              {QUICK_SEAMSTRESS_PRESETS.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleApplyPreset(preset)}
                  className="px-2.5 py-1 rounded-xl bg-stone-900/80 hover:bg-stone-800 text-stone-300 hover:text-[#f5e6b8] border border-stone-800 hover:border-[#d4af37]/40 text-[11px] transition cursor-pointer"
                >
                  + {preset}
                </button>
              ))}
            </div>
          </div>

          {/* Private Textarea */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-white flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-amber-400" />
                <span>Asmeninė Siuvėjos Pastaba (Laisvas Tekstas):</span>
              </label>
              <span className="text-[10px] font-mono text-stone-500">
                {privateNote.length}/500 simbolių
              </span>
            </div>
            <textarea
              rows={4}
              maxLength={500}
              value={privateNote}
              onChange={(e) => setPrivateNote(e.target.value)}
              placeholder="Įrašykite individualius pageidavimus siuvėjai (pvz., rankovių prigludimas, nestandartinis ilgis, jautrumas siūlėms, ypatingas siuvinėjimo išdėstymas)..."
              className="w-full px-4 py-3 bg-stone-950 border border-stone-800 focus:border-[#d4af37] rounded-2xl text-xs text-white placeholder-stone-500 focus:outline-none transition leading-relaxed"
            />
          </div>

          {/* Micro-Tailoring Sliders (Sleeve & Torso) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-black/40 border border-stone-800">
            {/* Sleeve length */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-white flex items-center gap-1.5">
                  <Ruler className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Rankovių Ilgis:</span>
                </span>
                <span className="text-xs font-mono font-bold text-[#d4af37]">
                  {sleeveAdjustmentCm > 0 ? `+${sleeveAdjustmentCm}` : sleeveAdjustmentCm} cm
                </span>
              </div>
              <input
                type="range"
                min={-5}
                max={5}
                step={1}
                value={sleeveAdjustmentCm}
                onChange={(e) => setSleeveAdjustmentCm(Number(e.target.value))}
                className="w-full accent-[#d4af37] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] font-mono text-stone-500">
                <span>-5 cm (Trumpiau)</span>
                <span>0 cm (Standartas)</span>
                <span>+5 cm (Ilgiau)</span>
              </div>
            </div>

            {/* Torso length */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-white flex items-center gap-1.5">
                  <Ruler className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Nugaros / Liemens Ilgis:</span>
                </span>
                <span className="text-xs font-mono font-bold text-[#d4af37]">
                  {torsoLengthAdjustmentCm > 0
                    ? `+${torsoLengthAdjustmentCm}`
                    : torsoLengthAdjustmentCm}{' '}
                  cm
                </span>
              </div>
              <input
                type="range"
                min={-5}
                max={8}
                step={1}
                value={torsoLengthAdjustmentCm}
                onChange={(e) => setTorsoLengthAdjustmentCm(Number(e.target.value))}
                className="w-full accent-[#d4af37] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] font-mono text-stone-500">
                <span>-5 cm (Crop)</span>
                <span>0 cm (Standartas)</span>
                <span>+8 cm (Pailgintas)</span>
              </div>
            </div>
          </div>

          {/* Lining & Stitching Options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Lining Preference */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-white flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-purple-400" />
                <span>Vidinio Pamušalo Tipas:</span>
              </label>
              <select
                value={liningPreference}
                onChange={(e) => setLiningPreference(e.target.value as any)}
                className="w-full px-3.5 py-2.5 bg-stone-950 border border-stone-800 rounded-xl text-xs text-white focus:outline-none focus:border-[#d4af37] cursor-pointer"
              >
                <option value="standard">Standartinis (to paties audinio vidinis pūkelis)</option>
                <option value="silk-touch">Silk-Touch (šilko apvadas ties kaklu ir apykakle)</option>
                <option value="breathable-mesh">Kvėpuojantis mikro-tinklelis (sportiškas)</option>
                <option value="unlined">Viengubas lengvas kirpimas (be papildomo pamušalo)</option>
              </select>
            </div>

            {/* Thread finish */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-white flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Siūlų Spalvos Harmonija:</span>
              </label>
              <select
                value={threadColor}
                onChange={(e) => setThreadColor(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-stone-950 border border-stone-800 rounded-xl text-xs text-white focus:outline-none focus:border-[#d4af37] cursor-pointer"
              >
                <option value="match-fabric">Tonuotas prie pagrindinio audinio (nematomos siūlės)</option>
                <option value="gold-accent">Matinis šampano auksas (Atelier parašas)</option>
                <option value="stealth-black">Gilus grafito juodumas (kontrastingas)</option>
                <option value="chalk-white">Pieno balta (grafinis vintažinis dygsnis)</option>
              </select>
            </div>
          </div>

          {/* Reinforcement Toggles */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
            <label className="flex items-center gap-2.5 p-3 rounded-xl bg-stone-950 border border-stone-800 hover:border-stone-700 transition cursor-pointer">
              <input
                type="checkbox"
                checked={reinforcedPockets}
                onChange={(e) => setReinforcedPockets(e.target.checked)}
                className="rounded accent-[#d4af37] w-4 h-4 cursor-pointer"
              />
              <span className="text-xs text-stone-200">
                Sustiprintos kišenių apsiuvimo siūlės (Heavy-Duty)
              </span>
            </label>

            <label className="flex items-center gap-2.5 p-3 rounded-xl bg-stone-950 border border-stone-800 hover:border-stone-700 transition cursor-pointer">
              <input
                type="checkbox"
                checked={specialHem}
                onChange={(e) => setSpecialHem(e.target.checked)}
                className="rounded accent-[#d4af37] w-4 h-4 cursor-pointer"
              />
              <span className="text-xs text-stone-200">
                Dvigubas apačios apsiuvimas (Prancūziškas kraštas)
              </span>
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-stone-800 bg-black/40 flex items-center justify-between text-xs">
          <button
            type="button"
            onClick={handleClear}
            className="text-stone-400 hover:text-rose-400 transition cursor-pointer font-mono text-[11px]"
          >
            Išvalyti viską
          </button>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-300 font-medium transition cursor-pointer border border-stone-800"
            >
              Atšaukti
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2 rounded-xl luxury-button-gold text-stone-950 font-bold transition cursor-pointer shadow-md flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Išsaugoti Instrukcijas</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
