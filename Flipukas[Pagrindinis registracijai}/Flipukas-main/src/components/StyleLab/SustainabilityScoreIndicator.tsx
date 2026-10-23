import React, { useState } from 'react';
import {
  Leaf,
  Droplets,
  Wind,
  Trash2,
  ShieldCheck,
  Sparkles,
  Info,
  CheckCircle2,
  ChevronRight,
  X,
  Award,
  Factory,
  RefreshCw,
} from 'lucide-react';
import { FabricMaterial } from '../../types/clothing';

export interface ManufacturingMethod {
  id: string;
  nameLt: string;
  badgeLt: string;
  scoreBonus: number;
  waterFactor: number; // multiplier against baseline
  carbonKg: number;
  wasteKg: number;
  descriptionLt: string;
}

export const MANUFACTURING_METHODS: ManufacturingMethod[] = [
  {
    id: 'on-demand-zerowaste',
    nameLt: 'On-Demand Zero-Waste (Vilniaus Atelier)',
    badgeLt: 'Nulinis Likutis · 100% Individualu',
    scoreBonus: 38,
    waterFactor: 0.35,
    carbonKg: 2.1,
    wasteKg: 0.0,
    descriptionLt: 'Gaminama tik po patvirtinimo. Kompiuterizuotas lazerinis audinio kirpimas užtikrina 0% audinio atraižų, o siuvama naudojant 100% žaliąją saulės elektrą.',
  },
  {
    id: 'eco-loop',
    nameLt: 'Eco-Loop Žiedinis Ciklas (Closed-Loop)',
    badgeLt: 'Uždaras Vandens Ciklas · Eko Dažai',
    scoreBonus: 40,
    waterFactor: 0.28,
    carbonKg: 1.8,
    wasteKg: 0.0,
    descriptionLt: 'Vandens valymo ir pakartotinio panaudojimo sistema, netoksiški augaliniai bei mineraliniai pigmentai ir biologiškai suyranti pakuotė.',
  },
  {
    id: 'small-batch',
    nameLt: 'Atsakinga Mažų Partijų Gamyba',
    badgeLt: 'Ribotas Tiražas',
    scoreBonus: 28,
    waterFactor: 0.55,
    carbonKg: 3.4,
    wasteKg: 0.15,
    descriptionLt: 'Rankinis meistrų kirpimas mažomis partijomis iki 20 vnt. Tradicinė kokybė su minimaliais audinio likučiais, kurie vėliau perdirbami į pakabukus.',
  },
];

export interface SustainabilityCalculation {
  score: number; // 0 - 100
  grade: 'A+' | 'A' | 'B+' | 'B';
  gradeTitleLt: string;
  gradeColor: string;
  waterSavedLiters: number;
  carbonKg: number;
  wasteKg: number;
  biodegradablePercent: number;
  fabricPoints: number;
  methodPoints: number;
  localCraftBonus: number;
}

export function calculateGarmentSustainability(
  fabric: FabricMaterial,
  methodId: string = 'on-demand-zerowaste'
): SustainabilityCalculation {
  const method =
    MANUFACTURING_METHODS.find((m) => m.id === methodId) || MANUFACTURING_METHODS[0];

  // 1. Fabric points out of 50
  let fabricPoints = 44;
  let biodegradable = 85;
  let baseWaterSaved = 2100;

  switch (fabric.textureType) {
    case 'cotton':
      fabricPoints = 46;
      biodegradable = 98;
      baseWaterSaved = 2400; // Organic cotton saves huge water vs conventional pesticides
      break;
    case 'silk':
      fabricPoints = 48;
      biodegradable = 100;
      baseWaterSaved = 2700;
      break;
    case 'wool':
      fabricPoints = 47;
      biodegradable = 100;
      baseWaterSaved = 2200;
      break;
    case 'denim':
      fabricPoints = 44; // Raw selvedge avoids toxic stonewash chemicals
      biodegradable = 92;
      baseWaterSaved = 2500;
      break;
    case 'ripstop':
      fabricPoints = 40; // Durable recycled polyester matrix, long lifecycle
      biodegradable = 45;
      baseWaterSaved = 1850;
      break;
    case 'neoprene':
      fabricPoints = 39; // Solvent-free scuba knit
      biodegradable = 40;
      baseWaterSaved = 1750;
      break;
    case 'chrome':
    case 'leather':
      fabricPoints = 43; // 100% Vegan waterborne Eco-PU, 0 animal cruelty
      biodegradable = 50;
      baseWaterSaved = 2300;
      break;
    default:
      fabricPoints = 42;
      biodegradable = 75;
      baseWaterSaved = 2000;
  }

  // 2. Manufacturing method points (out of 40)
  const methodPoints = method.scoreBonus;

  // 3. Local craftsmanship & Zero-inventory pledge bonus (10 points)
  const localCraftBonus = 10;

  // Total score clamped to 100
  const score = Math.min(100, Math.max(30, fabricPoints + methodPoints + localCraftBonus));

  let grade: 'A+' | 'A' | 'B+' | 'B' = 'A';
  let gradeTitleLt = 'Aukštas Tvarumo Indeksas';
  let gradeColor = 'text-emerald-400 border-emerald-400/40 bg-emerald-500/15';

  if (score >= 92) {
    grade = 'A+';
    gradeTitleLt = 'Atelier Zero-Waste Prabanga';
    gradeColor = 'text-[#d4af37] border-[#d4af37]/60 bg-[#d4af37]/20 shadow-[0_0_15px_rgba(212,175,55,0.25)]';
  } else if (score >= 82) {
    grade = 'A';
    gradeTitleLt = 'Sąmoninga Žiedinė Mada';
    gradeColor = 'text-emerald-400 border-emerald-500/40 bg-emerald-500/15';
  } else if (score >= 72) {
    grade = 'B+';
    gradeTitleLt = 'Atsakingas Pasirinkimas';
    gradeColor = 'text-cyan-400 border-cyan-500/40 bg-cyan-500/15';
  } else {
    grade = 'B';
    gradeTitleLt = 'Standartinis Tvarumas';
    gradeColor = 'text-amber-400 border-amber-500/40 bg-amber-500/15';
  }

  const waterSavedLiters = Math.round(baseWaterSaved * (1 + (1 - method.waterFactor) * 0.4));
  const carbonKg = parseFloat(method.carbonKg.toFixed(1));
  const wasteKg = parseFloat(method.wasteKg.toFixed(2));

  return {
    score,
    grade,
    gradeTitleLt,
    gradeColor,
    waterSavedLiters,
    carbonKg,
    wasteKg,
    biodegradablePercent: biodegradable,
    fabricPoints,
    methodPoints,
    localCraftBonus,
  };
}

interface SustainabilityScoreIndicatorProps {
  fabric: FabricMaterial;
  manufacturingMethod?: string;
  onChangeManufacturingMethod?: (methodId: string) => void;
  className?: string;
}

export const SustainabilityScoreIndicator: React.FC<SustainabilityScoreIndicatorProps> = ({
  fabric,
  manufacturingMethod = 'on-demand-zerowaste',
  onChangeManufacturingMethod,
  className = '',
}) => {
  const [selectedMethodId, setSelectedMethodId] = useState<string>(manufacturingMethod);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const activeMethodId = selectedMethodId || manufacturingMethod;
  const metrics = calculateGarmentSustainability(fabric, activeMethodId);
  const currentMethod =
    MANUFACTURING_METHODS.find((m) => m.id === activeMethodId) || MANUFACTURING_METHODS[0];

  const handleSelectMethod = (id: string) => {
    setSelectedMethodId(id);
    if (onChangeManufacturingMethod) {
      onChangeManufacturingMethod(id);
    }
  };

  return (
    <>
      {/* Compact Interactive HUD Badge in StyleLab */}
      <div
        className={`inline-flex items-center gap-2 p-1.5 sm:px-3 sm:py-2 rounded-xl border border-stone-800 bg-stone-900/85 backdrop-blur-md shadow-lg transition-all hover:border-[#d4af37]/60 group cursor-pointer ${className}`}
        onClick={() => setIsModalOpen(true)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            setIsModalOpen(true);
          }
        }}
        title="Spustelėkite peržiūrėti išsamų skaidrumo ir poveikio aplinkai auditą"
      >
        <div className="flex items-center gap-1.5">
          <div className="w-6 h-6 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center shrink-0">
            <Leaf className="w-3.5 h-3.5 text-emerald-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="flex flex-col text-left">
            <span className="text-[10px] uppercase font-mono tracking-wider text-stone-400 leading-none">
              Tvarumo Balas
            </span>
            <div className="flex items-center gap-1 mt-0.5">
              <span className="text-xs font-mono font-bold text-white">
                {metrics.score}
                <span className="text-stone-400 text-[10px]">/100</span>
              </span>
              <span
                className={`text-[9px] font-mono font-extrabold px-1.5 py-0.2 rounded border ${metrics.gradeColor}`}
              >
                {metrics.grade}
              </span>
            </div>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-stone-800 text-[11px] font-mono text-emerald-400">
          <span className="flex items-center gap-1">
            <Droplets className="w-3 h-3 text-cyan-400" />
            <span>-{metrics.waterSavedLiters} L</span>
          </span>
          <span className="text-stone-600">·</span>
          <span className="text-stone-300">0 kg atliekų</span>
        </div>

        <ChevronRight className="w-3.5 h-3.5 text-stone-300 group-hover:text-white transition-colors ml-0.5" />
      </div>

      {/* Full Transparency & Environmental Impact Audit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
          <div className="bg-[#121217] border border-stone-700 rounded-3xl max-w-2xl w-full max-h-[92vh] overflow-y-auto shadow-2xl p-6 sm:p-8 flex flex-col gap-6 text-stone-200 relative">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-stone-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500/25 to-teal-500/10 border border-emerald-500/40 flex items-center justify-center shadow-inner">
                  <Leaf className="w-6 h-6 text-emerald-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-serif-luxury font-bold text-white tracking-wide">
                      Tvarumo & Poveikio Aplinkai Skaidrumas
                    </h3>
                  </div>
                  <p className="text-xs text-stone-400 mt-0.5">
                    Tikslūs duomenys apie pasirinkto audinio ir gamybos būdo ekologinį pėdsaką.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-xl bg-stone-900 border border-stone-800 hover:bg-stone-800 text-stone-400 hover:text-white transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Score Highlight Box */}
            <div className="p-5 rounded-2xl bg-gradient-to-r from-stone-900 via-stone-900/90 to-stone-950 border border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg">
              <div className="flex items-center gap-4">
                <div className="relative flex items-center justify-center">
                  <div className="w-20 h-20 rounded-full border-4 border-emerald-500/25 flex items-center justify-center bg-stone-950 shadow-inner">
                    <span className="text-2xl font-mono font-black text-white">{metrics.score}</span>
                  </div>
                  <span
                    className={`absolute -bottom-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-black border ${metrics.gradeColor}`}
                  >
                    {metrics.grade}
                  </span>
                </div>

                <div>
                  <div className="text-sm font-serif-luxury font-bold text-white flex items-center gap-2">
                    <span>{metrics.gradeTitleLt}</span>
                    <Sparkles className="w-4 h-4 text-[#d4af37]" />
                  </div>
                  <p className="text-xs text-stone-400 mt-1">
                    Audinys: <strong className="text-stone-200">{fabric.nameLt}</strong> ({fabric.textureType})
                  </p>
                  <p className="text-xs text-stone-400">
                    Gamybos metodas:{' '}
                    <strong className="text-stone-200">{currentMethod.nameLt}</strong>
                  </p>
                </div>
              </div>

              {/* Progress Bar of calculation */}
              <div className="w-full sm:w-44 flex flex-col gap-1.5 font-mono text-[11px]">
                <div className="flex justify-between text-stone-400">
                  <span>Audinio kilmė:</span>
                  <span className="text-white font-bold">{metrics.fabricPoints}/50</span>
                </div>
                <div className="flex justify-between text-stone-400">
                  <span>Gamybos būdas:</span>
                  <span className="text-white font-bold">{metrics.methodPoints}/40</span>
                </div>
                <div className="flex justify-between text-stone-400">
                  <span>Vietinis atelier:</span>
                  <span className="text-white font-bold">+{metrics.localCraftBonus}</span>
                </div>
              </div>
            </div>

            {/* Environmental Impact Metrics Grid */}
            <div>
              <h4 className="text-xs uppercase font-mono font-semibold tracking-wider text-[#d4af37] mb-3 flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5" />
                <span>Realaus Laiko Poveikio Metrikos (palyginus su greitąja mada)</span>
              </h4>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-xl bg-stone-900/80 border border-stone-800 flex flex-col">
                  <div className="flex items-center gap-1 text-cyan-400 text-xs font-mono mb-1">
                    <Droplets className="w-3.5 h-3.5" />
                    <span>Vanduo</span>
                  </div>
                  <span className="text-lg font-mono font-bold text-white">
                    -{metrics.waterSavedLiters} L
                  </span>
                  <span className="text-[10px] text-stone-400 mt-0.5">
                    Sutaupyta švaraus geriamo vandens
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-stone-900/80 border border-stone-800 flex flex-col">
                  <div className="flex items-center gap-1 text-emerald-400 text-xs font-mono mb-1">
                    <Wind className="w-3.5 h-3.5" />
                    <span>CO₂ Emisija</span>
                  </div>
                  <span className="text-lg font-mono font-bold text-white">
                    {metrics.carbonKg} kg
                  </span>
                  <span className="text-[10px] text-stone-400 mt-0.5">
                    84% mažiau nei industrijos 14.5 kg
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-stone-900/80 border border-stone-800 flex flex-col">
                  <div className="flex items-center gap-1 text-amber-400 text-xs font-mono mb-1">
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Atliekos</span>
                  </div>
                  <span className="text-lg font-mono font-bold text-white">
                    {metrics.wasteKg} kg
                  </span>
                  <span className="text-[10px] text-stone-400 mt-0.5">
                    0% sandėlio broko ir likučių
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-stone-900/80 border border-stone-800 flex flex-col">
                  <div className="flex items-center gap-1 text-purple-400 text-xs font-mono mb-1">
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Skaidumas</span>
                  </div>
                  <span className="text-lg font-mono font-bold text-white">
                    {metrics.biodegradablePercent}%
                  </span>
                  <span className="text-[10px] text-stone-400 mt-0.5">
                    Biologiškai skaidi arba perdirbama
                  </span>
                </div>
              </div>
            </div>

            {/* Interactive Manufacturing Method Selector */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs uppercase font-mono font-semibold tracking-wider text-stone-300 flex items-center gap-1.5">
                  <Factory className="w-3.5 h-3.5 text-stone-400" />
                  <span>Pasirinkite Gamybos Metodą (Realaus Laiko Skaičiavimas)</span>
                </h4>
                <span className="text-[11px] text-emerald-400 font-mono">Keičia tvarumo balą</span>
              </div>

              <div className="space-y-2">
                {MANUFACTURING_METHODS.map((method) => {
                  const isSelected = method.id === activeMethodId;
                  return (
                    <button
                      key={method.id}
                      type="button"
                      onClick={() => handleSelectMethod(method.id)}
                      className={`w-full p-3.5 rounded-xl border text-left transition flex items-start justify-between gap-3 cursor-pointer ${
                        isSelected
                          ? 'border-[#d4af37] bg-[#d4af37]/10 ring-1 ring-[#d4af37]/40 shadow-sm'
                          : 'border-stone-800 bg-stone-900/60 hover:bg-stone-900 text-stone-300'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`mt-0.5 w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                            isSelected
                              ? 'border-[#d4af37] bg-[#d4af37]'
                              : 'border-stone-600'
                          }`}
                        >
                          {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-stone-950" />}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-serif-luxury font-bold text-sm text-white">
                              {method.nameLt}
                            </span>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-stone-800 text-stone-300 border border-stone-700">
                              {method.badgeLt}
                            </span>
                          </div>
                          <p className="text-xs text-stone-400 mt-1 leading-relaxed">
                            {method.descriptionLt}
                          </p>
                        </div>
                      </div>

                      <span className="text-xs font-mono font-bold text-emerald-400 shrink-0">
                        +{method.scoreBonus} tšk.
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Fast Fashion vs Flipukas Atelier Comparison Card */}
            <div className="p-4 rounded-2xl bg-stone-950 border border-stone-800 text-xs">
              <h5 className="font-serif-luxury font-bold text-white mb-2 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Kodėl On-Demand gamyba yra mados ateitis?</span>
              </h5>
              <p className="text-stone-300 leading-relaxed font-light">
                Tradicinė greitoji mada pagamina 30% daugiau drabužių nei kada nors parduoda – perteklius keliauja į sąvartynus. „Flipukas Atelier“ naudoja griežtą <em>Zero-Overproduction</em> modelį: kiekvienas gaminys pradedamas siūti tik tada, kai paspaudžiate „Užsakyti“. Nulinis sandėlio švaistymas, 100% skaidrumas.
              </p>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between pt-2 border-t border-stone-800 text-xs">
              <div className="flex items-center gap-3 text-stone-400 font-mono text-[11px]">
                <span className="flex items-center gap-1 text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5" /> GOTS Sertifikuota
                </span>
                <span className="flex items-center gap-1 text-cyan-400">
                  <CheckCircle2 className="w-3.5 h-3.5" /> OEKO-TEX 100
                </span>
              </div>

              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-5 py-2 rounded-xl bg-[#d4af37] text-stone-950 font-serif-luxury font-bold hover:bg-[#e6ca85] transition cursor-pointer shadow-md"
              >
                Supratau
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
