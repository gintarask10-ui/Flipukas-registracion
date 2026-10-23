import React, { useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { Product, CustomizationState } from '../../types/clothing';
import {
  X,
  Check,
  Ruler,
  User,
  Sparkles,
  ArrowRight,
  Info,
  Layers,
  Scale,
  Compass,
  CheckCircle2,
  HelpCircle,
  Scissors,
} from 'lucide-react';

interface SizeGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product;
  customization?: Partial<CustomizationState>;
  onApplySizeAndFit: (
    size: 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL',
    fit: 'slim' | 'regular' | 'oversized'
  ) => void;
}

type BodyBuild = 'slim' | 'athletic' | 'broad' | 'plus';
type FitType = 'slim' | 'regular' | 'oversized';
type UnitType = 'cm' | 'in';

interface SizeDimension {
  size: 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL';
  chest: number; // in cm
  length: number; // in cm
  shoulder: number; // in cm
  sleeve: number; // in cm
  waist: number; // in cm
  recommendedHeight: string;
}

const GARMENT_SIZE_DATA: Record<string, SizeDimension[]> = {
  hoodie: [
    { size: 'XS', chest: 104, length: 66, shoulder: 48, sleeve: 62, waist: 96, recommendedHeight: '160–168 cm' },
    { size: 'S', chest: 110, length: 68, shoulder: 51, sleeve: 63, waist: 102, recommendedHeight: '166–174 cm' },
    { size: 'M', chest: 116, length: 71, shoulder: 54, sleeve: 65, waist: 108, recommendedHeight: '172–180 cm' },
    { size: 'L', chest: 124, length: 74, shoulder: 58, sleeve: 66, waist: 116, recommendedHeight: '178–186 cm' },
    { size: 'XL', chest: 132, length: 76, shoulder: 62, sleeve: 67, waist: 124, recommendedHeight: '184–192 cm' },
    { size: 'XXL', chest: 140, length: 79, shoulder: 66, sleeve: 68, waist: 132, recommendedHeight: '190–200 cm' },
  ],
  tshirt: [
    { size: 'XS', chest: 96, length: 68, shoulder: 44, sleeve: 21, waist: 92, recommendedHeight: '160–168 cm' },
    { size: 'S', chest: 102, length: 70, shoulder: 47, sleeve: 22, waist: 98, recommendedHeight: '166–174 cm' },
    { size: 'M', chest: 108, length: 73, shoulder: 50, sleeve: 23, waist: 104, recommendedHeight: '172–180 cm' },
    { size: 'L', chest: 116, length: 75, shoulder: 53, sleeve: 24, waist: 112, recommendedHeight: '178–186 cm' },
    { size: 'XL', chest: 124, length: 77, shoulder: 56, sleeve: 25, waist: 120, recommendedHeight: '184–192 cm' },
    { size: 'XXL', chest: 132, length: 80, shoulder: 59, sleeve: 26, waist: 128, recommendedHeight: '190–200 cm' },
  ],
  jacket: [
    { size: 'XS', chest: 106, length: 65, shoulder: 46, sleeve: 63, waist: 98, recommendedHeight: '160–168 cm' },
    { size: 'S', chest: 112, length: 67, shoulder: 49, sleeve: 64, waist: 104, recommendedHeight: '166–174 cm' },
    { size: 'M', chest: 118, length: 70, shoulder: 52, sleeve: 66, waist: 110, recommendedHeight: '172–180 cm' },
    { size: 'L', chest: 126, length: 72, shoulder: 55, sleeve: 67, waist: 118, recommendedHeight: '178–186 cm' },
    { size: 'XL', chest: 134, length: 75, shoulder: 58, sleeve: 68, waist: 126, recommendedHeight: '184–192 cm' },
    { size: 'XXL', chest: 142, length: 77, shoulder: 61, sleeve: 69, waist: 134, recommendedHeight: '190–200 cm' },
  ],
  cargo: [
    { size: 'XS', chest: 74, length: 100, shoulder: 42, sleeve: 72, waist: 76, recommendedHeight: '160–168 cm' },
    { size: 'S', chest: 78, length: 102, shoulder: 44, sleeve: 74, waist: 80, recommendedHeight: '166–174 cm' },
    { size: 'M', chest: 84, length: 105, shoulder: 46, sleeve: 76, waist: 86, recommendedHeight: '172–180 cm' },
    { size: 'L', chest: 90, length: 107, shoulder: 48, sleeve: 78, waist: 92, recommendedHeight: '178–186 cm' },
    { size: 'XL', chest: 96, length: 109, shoulder: 50, sleeve: 80, waist: 98, recommendedHeight: '184–192 cm' },
    { size: 'XXL', chest: 102, length: 111, shoulder: 52, sleeve: 82, waist: 104, recommendedHeight: '190–200 cm' },
  ],
  sneakers: [
    { size: 'XS', chest: 25, length: 25.5, shoulder: 9, sleeve: 0, waist: 0, recommendedHeight: 'EU 39–40' },
    { size: 'S', chest: 26, length: 26.5, shoulder: 9.5, sleeve: 0, waist: 0, recommendedHeight: 'EU 41–42' },
    { size: 'M', chest: 27, length: 27.5, shoulder: 10, sleeve: 0, waist: 0, recommendedHeight: 'EU 42–43' },
    { size: 'L', chest: 28, length: 28.5, shoulder: 10.5, sleeve: 0, waist: 0, recommendedHeight: 'EU 43–44' },
    { size: 'XL', chest: 29, length: 29.5, shoulder: 11, sleeve: 0, waist: 0, recommendedHeight: 'EU 45–46' },
    { size: 'XXL', chest: 30, length: 30.5, shoulder: 11.5, sleeve: 0, waist: 0, recommendedHeight: 'EU 46–47' },
  ],
};

export const SizeGuideModal: React.FC<SizeGuideModalProps> = ({
  isOpen,
  onClose,
  product,
  customization,
  onApplySizeAndFit,
}) => {
  const [activeTab, setActiveTab] = useState<'chart' | 'how-to' | 'simulator'>('chart');
  const [unit, setUnit] = useState<UnitType>('cm');
  const [height, setHeight] = useState<number>(182);
  const [build, setBuild] = useState<BodyBuild>('athletic');
  const [selectedFit, setSelectedFit] = useState<FitType>(
    customization?.fitMode === 'oversized'
      ? 'oversized'
      : customization?.fitMode === 'slim'
      ? 'slim'
      : 'regular'
  );
  const [selectedSize, setSelectedSize] = useState<'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL'>(
    customization?.size || 'L'
  );

  const d3MannequinRef = useRef<SVGSVGElement>(null);
  const d3ChartRef = useRef<SVGSVGElement>(null);

  // Conversion helper
  const formatVal = (valCm: number) => {
    if (unit === 'in') {
      return (valCm / 2.54).toFixed(1) + '″';
    }
    return `${valCm} cm`;
  };

  // Garment size dimension data
  const sizeTable =
    GARMENT_SIZE_DATA[product.type] ||
    GARMENT_SIZE_DATA.hoodie;
  const currentDimension =
    sizeTable.find((s) => s.size === selectedSize) || sizeTable[2];

  // Ease allowance in cm based on fit
  const easeAllowance = selectedFit === 'oversized' ? 16 : selectedFit === 'slim' ? 3 : 8;
  const shoulderDrop = selectedFit === 'oversized' ? 6 : selectedFit === 'slim' ? 0 : 2;

  // D3 Mannequin & Garment Silhouette Renderer
  useEffect(() => {
    if (!isOpen || activeTab !== 'simulator' || !d3MannequinRef.current) return;

    const svg = d3.select(d3MannequinRef.current);
    svg.selectAll('*').remove();

    const width = 360;
    const heightSvg = 480;

    const buildMultipliers: Record<BodyBuild, { chest: number; shoulder: number; waist: number }> = {
      slim: { chest: 0.50, shoulder: 0.24, waist: 0.42 },
      athletic: { chest: 0.55, shoulder: 0.27, waist: 0.44 },
      broad: { chest: 0.60, shoulder: 0.28, waist: 0.50 },
      plus: { chest: 0.66, shoulder: 0.29, waist: 0.58 },
    };

    const g = svg.append('g').attr('transform', `translate(0, 20)`);
    const cx = width / 2;

    // Body reference markers
    const shoulderY = 100;
    const chestY = 160;
    const waistY = 240;
    const hemY = 320;

    const shoulderMultiplier = buildMultipliers[build].shoulder;
    const chestMultiplier = buildMultipliers[build].chest;
    const waistMultiplier = buildMultipliers[build].waist;

    const bodyShoulderW = (height * shoulderMultiplier) / 2;
    const bodyChestW = (height * chestMultiplier) / 4;
    const bodyWaistW = (height * waistMultiplier) / 4;

    // Head
    g.append('ellipse')
      .attr('cx', cx)
      .attr('cy', 50)
      .attr('rx', 24)
      .attr('ry', 32)
      .attr('fill', '#27272a')
      .attr('stroke', '#3f3f46')
      .attr('stroke-width', 1.5);

    // Neck
    g.append('rect')
      .attr('x', cx - 12)
      .attr('y', 78)
      .attr('width', 24)
      .attr('height', 24)
      .attr('fill', '#27272a');

    // Body silhouette outline (neutral dashed)
    const bodyPath = `
      M ${cx - bodyShoulderW} ${shoulderY}
      L ${cx + bodyShoulderW} ${shoulderY}
      L ${cx + bodyChestW} ${chestY}
      L ${cx + bodyWaistW} ${waistY}
      L ${cx + bodyWaistW * 1.05} ${hemY}
      L ${cx - bodyWaistW * 1.05} ${hemY}
      L ${cx - bodyWaistW} ${waistY}
      L ${cx - bodyChestW} ${chestY}
      Z
    `;
    g.append('path')
      .attr('d', bodyPath)
      .attr('fill', '#18181b')
      .attr('stroke', '#52525b')
      .attr('stroke-width', 1.5)
      .attr('stroke-dasharray', '4 4');

    // Garment silhouette outline (colored based on fit style)
    const fitExtraW = selectedFit === 'oversized' ? 22 : selectedFit === 'slim' ? 6 : 14;
    const fitDropY = selectedFit === 'oversized' ? 14 : selectedFit === 'slim' ? 0 : 6;
    const garmentColor =
      selectedFit === 'oversized' ? '#f59e0b' : selectedFit === 'slim' ? '#38bdf8' : '#e4e4e7';

    const gShoulderW = bodyShoulderW + fitExtraW * 0.7;
    const gChestW = (currentDimension.chest / 4) + fitExtraW * 0.5;
    const gWaistW = (currentDimension.waist / 4) + fitExtraW * 0.6;
    const gHemY = hemY + fitDropY;

    const garmentPath = `
      M ${cx - gShoulderW} ${shoulderY + fitDropY}
      Q ${cx} ${shoulderY + fitDropY - 10} ${cx + gShoulderW} ${shoulderY + fitDropY}
      L ${cx + gChestW} ${chestY}
      L ${cx + gWaistW} ${waistY}
      L ${cx + gWaistW} ${gHemY}
      L ${cx - gWaistW} ${gHemY}
      L ${cx - gWaistW} ${waistY}
      L ${cx - gChestW} ${chestY}
      Z
    `;

    g.append('path')
      .attr('d', garmentPath)
      .attr('fill', garmentColor)
      .attr('fill-opacity', 0.15)
      .attr('stroke', garmentColor)
      .attr('stroke-width', 2);

    // Callout labels
    g.append('text')
      .attr('x', cx)
      .attr('y', chestY + 6)
      .attr('text-anchor', 'middle')
      .attr('fill', '#ffffff')
      .attr('font-size', '11px')
      .attr('font-family', 'monospace')
      .attr('font-weight', 'bold')
      .text(`Krūtinė: ${formatVal(currentDimension.chest)} (+${easeAllowance}cm laisvumas)`);
  }, [isOpen, activeTab, height, build, selectedFit, selectedSize, currentDimension, unit]);

  // Handle Apply
  const handleApply = () => {
    onApplySizeAndFit(selectedSize, selectedFit);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-neutral-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col bg-neutral-900 border border-neutral-800 rounded-3xl shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-neutral-800 flex items-center justify-between bg-neutral-950/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400">
              <Ruler className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-display font-semibold text-white">
                  Dydžių Gidas & Matavimo Instrukcija
                </h2>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-neutral-800 text-amber-400 border border-neutral-700">
                  {product.name}
                </span>
              </div>
              <p className="text-xs text-neutral-400 mt-0.5">
                Tikslios gaminio apimtys (cm / coliais) ir vizualūs patarimai tobulam kritimui
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Metric / Imperial Unit Switch */}
            <div className="flex items-center bg-neutral-950 p-1 rounded-xl border border-neutral-800 font-mono text-xs">
              <button
                type="button"
                onClick={() => setUnit('cm')}
                className={`px-3 py-1 rounded-lg transition cursor-pointer font-semibold ${
                  unit === 'cm'
                    ? 'bg-amber-400 text-neutral-950 shadow-sm'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                cm
              </button>
              <button
                type="button"
                onClick={() => setUnit('in')}
                className={`px-3 py-1 rounded-lg transition cursor-pointer font-semibold ${
                  unit === 'in'
                    ? 'bg-amber-400 text-neutral-950 shadow-sm'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                coliai (in)
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="px-6 border-b border-neutral-800 bg-neutral-950/20 flex gap-2 pt-2">
          <button
            onClick={() => setActiveTab('chart')}
            className={`pb-3 px-3 text-xs font-semibold font-mono border-b-2 transition cursor-pointer flex items-center gap-2 ${
              activeTab === 'chart'
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-neutral-400 hover:text-white'
            }`}
          >
            <Scale className="w-4 h-4" />
            <span>Dydžių Lentelė ({unit.toUpperCase()})</span>
          </button>
          <button
            onClick={() => setActiveTab('how-to')}
            className={`pb-3 px-3 text-xs font-semibold font-mono border-b-2 transition cursor-pointer flex items-center gap-2 ${
              activeTab === 'how-to'
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-neutral-400 hover:text-white'
            }`}
          >
            <Scissors className="w-4 h-4" />
            <span>Kaip Taisyklingai Matuoti?</span>
          </button>
          <button
            onClick={() => setActiveTab('simulator')}
            className={`pb-3 px-3 text-xs font-semibold font-mono border-b-2 transition cursor-pointer flex items-center gap-2 ${
              activeTab === 'simulator'
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-neutral-400 hover:text-white'
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>Kūno Siluetas & Fit Simuliatorius</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 max-h-[calc(90vh-170px)]">
          {/* TAB 1: Measurement Table */}
          {activeTab === 'chart' && (
            <div className="flex flex-col gap-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-neutral-950/60 p-4 rounded-2xl border border-neutral-800/80">
                <div className="text-xs text-neutral-300 leading-relaxed">
                  Pasirinkite dydį žemiau esančioje lentelėje. Visi matmenys nurodyti{' '}
                  <strong className="text-amber-400">
                    {unit === 'cm' ? 'centimetrais (cm)' : 'coliais (inches)'}
                  </strong>
                  . Drabužio matmenys matuojami ištiesto drabužio ant plokščio paviršiaus.
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs font-mono text-neutral-400">Pasirinktas dydis:</span>
                  <span className="px-3 py-1 rounded-xl bg-amber-400 text-neutral-950 font-mono font-bold text-sm">
                    {selectedSize}
                  </span>
                </div>
              </div>

              {/* Responsive Table */}
              <div className="overflow-x-auto rounded-2xl border border-neutral-800">
                <table className="w-full text-left text-xs font-mono">
                  <thead>
                    <tr className="bg-neutral-950/80 text-neutral-400 border-b border-neutral-800">
                      <th className="py-3 px-4 font-semibold text-white">Dydis</th>
                      <th className="py-3 px-4 font-semibold">Krūtinė (Chest)</th>
                      <th className="py-3 px-4 font-semibold">Ilgis (Length)</th>
                      <th className="py-3 px-4 font-semibold">Pečiai (Shoulder)</th>
                      <th className="py-3 px-4 font-semibold">Rankovė (Sleeve)</th>
                      <th className="py-3 px-4 font-semibold">Liemuo (Waist)</th>
                      <th className="py-3 px-4 font-semibold text-amber-400">Rekomenduojamas ūgis</th>
                      <th className="py-3 px-4 text-right font-semibold">Veiksmas</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-800/60">
                    {sizeTable.map((row) => {
                      const isSelected = row.size === selectedSize;
                      return (
                        <tr
                          key={row.size}
                          onClick={() => setSelectedSize(row.size)}
                          className={`transition cursor-pointer ${
                            isSelected
                              ? 'bg-amber-400/15 text-white font-semibold'
                              : 'hover:bg-neutral-800/40 text-neutral-300'
                          }`}
                        >
                          <td className="py-3 px-4">
                            <span
                              className={`px-2.5 py-1 rounded-lg text-xs font-bold inline-block ${
                                isSelected
                                  ? 'bg-amber-400 text-neutral-950'
                                  : 'bg-neutral-800 text-neutral-200'
                              }`}
                            >
                              {row.size}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-medium">{formatVal(row.chest)}</td>
                          <td className="py-3 px-4 font-medium">{formatVal(row.length)}</td>
                          <td className="py-3 px-4 font-medium">{formatVal(row.shoulder)}</td>
                          <td className="py-3 px-4 font-medium">{formatVal(row.sleeve)}</td>
                          <td className="py-3 px-4 font-medium">{formatVal(row.waist)}</td>
                          <td className="py-3 px-4 text-amber-300/90">{row.recommendedHeight}</td>
                          <td className="py-3 px-4 text-right">
                            {isSelected ? (
                              <span className="inline-flex items-center gap-1 text-[11px] text-amber-400 font-bold">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Pasirinkta</span>
                              </span>
                            ) : (
                              <span className="text-[11px] text-neutral-500 hover:text-neutral-300">
                                Pasirinkti
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Fit Style Toggle */}
              <div className="bg-neutral-950/60 p-5 rounded-2xl border border-neutral-800/80 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-neutral-200">
                    Pageidaujamas drabužio kritimas (Fit Mode):
                  </label>
                  <span className="text-[11px] font-mono text-amber-400 uppercase font-bold">
                    {selectedFit}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    {
                      id: 'slim',
                      name: 'Slim Fit',
                      desc: 'Prigludęs prie kūno, tiksli pečių siūlė (+3 cm laisvumas)',
                    },
                    {
                      id: 'regular',
                      name: 'Classic Regular',
                      desc: 'Universalus, patogus kasdienis kritimas (+8 cm laisvumas)',
                    },
                    {
                      id: 'oversized',
                      name: 'Streetwear Oversized',
                      desc: 'Nukritę pečiai, platus boxy siluetas (+16 cm laisvumas)',
                    },
                  ].map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setSelectedFit(f.id as FitType)}
                      className={`p-3.5 rounded-xl border text-left transition flex flex-col gap-1 cursor-pointer ${
                        selectedFit === f.id
                          ? 'bg-amber-400 text-neutral-950 font-bold border-amber-300 shadow-md'
                          : 'bg-neutral-900 border-neutral-800 text-neutral-300 hover:border-neutral-700'
                      }`}
                    >
                      <span className="text-xs">{f.name}</span>
                      <span
                        className={`text-[10px] leading-relaxed ${
                          selectedFit === f.id ? 'text-neutral-900 font-medium' : 'text-neutral-500'
                        }`}
                      >
                        {f.desc}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: How to Measure Visual Guide */}
          {activeTab === 'how-to' && (
            <div className="flex flex-col gap-6">
              {/* Infographic Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  {
                    step: '01',
                    title: 'Krūtinės Apimtis (Chest)',
                    desc: 'Apsijuoskite matavimo juostele plačiausioje krūtinės vietoje, tiesiai po pažastimis. Laikykite juostelę lygiagrečiai grindims, neištempkite ir per daug neįtempkite.',
                    icon: '📐',
                    tip: 'Rekomenduojama matuotis vilkint tik plonus marškinėlius.',
                  },
                  {
                    step: '02',
                    title: 'Pečių Plotis (Shoulders)',
                    desc: 'Matuokite nuo kairiojo peties kauliuko (kur prasideda rankovė) per nugaros viršų iki dešiniojo peties kauliuko.',
                    icon: '📏',
                    tip: 'Oversized modeliams ši linija specialiai projektuojama +6 cm žemiau.',
                  },
                  {
                    step: '03',
                    title: 'Drabužio Ilgis (Body Length)',
                    desc: 'Matuokite nuo aukščiausio peties taško (kur apykaklė jungiasi su pečiu) tiesiai žemyn iki norimo apatinio krašto.',
                    icon: '🧥',
                    tip: 'Standartinis ilgis baigiasi ties klubų viduriu.',
                  },
                  {
                    step: '04',
                    title: 'Rankovės Ilgis (Sleeve Length)',
                    desc: 'Šiek tiek sulenkite ranką ties alkūne. Matuokite nuo peties kauliuko per alkūnės išorinę pusę iki pat riešo kauliuko.',
                    icon: '🖐️',
                    tip: 'Mūsų džemperiai turi tamprius 8 cm rankogalius patogiam fiksavimui.',
                  },
                ].map((item) => (
                  <div
                    key={item.step}
                    className="p-5 rounded-2xl border border-neutral-800 bg-neutral-950/60 flex flex-col justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-2xl">{item.icon}</span>
                        <span className="text-xs font-mono text-amber-400 font-bold px-2 py-0.5 rounded bg-amber-400/10 border border-amber-400/20">
                          ŽINGSNIS {item.step}
                        </span>
                      </div>
                      <h3 className="text-sm font-semibold text-white tracking-tight">
                        {item.title}
                      </h3>
                      <p className="text-xs text-neutral-300 mt-1.5 leading-relaxed">
                        {item.desc}
                      </p>
                    </div>

                    <div className="p-2.5 rounded-xl bg-neutral-900 border border-neutral-800/80 text-[11px] text-amber-300/90 font-mono flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 shrink-0 text-amber-400" />
                      <span>{item.tip}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Sizing Pro Tips Card */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-neutral-950 via-amber-950/10 to-neutral-950 border border-amber-400/30 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>Dvejojate tarp dviejų dydžių?</span>
                  </h4>
                  <p className="text-xs text-neutral-300 mt-1 leading-relaxed max-w-xl">
                    Jei jūsų matmenys yra ties riba tarp M ir L: pasirinkite <strong>L</strong> dydį,
                    jei norite laisvesnio šiuolaikinio streetwear kritimo, arba <strong>M</strong> dydį,
                    jei mėgstate tradicinį tvarkingą prigludimą.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('simulator')}
                  className="px-4 py-2.5 rounded-xl bg-amber-400 text-neutral-950 font-bold text-xs hover:bg-amber-300 transition shrink-0 cursor-pointer"
                >
                  Išbandyti 3D silueto simuliatorių →
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: D3 Silhouette & Fit Simulator */}
          {activeTab === 'simulator' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Controls */}
              <div className="lg:col-span-5 flex flex-col gap-4">
                <div className="bg-neutral-950/60 p-4 rounded-2xl border border-neutral-800/80 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-neutral-200">Kūno ūgis:</label>
                    <span className="font-mono text-amber-400 font-bold text-sm">{height} cm</span>
                  </div>
                  <input
                    type="range"
                    min="155"
                    max="205"
                    value={height}
                    onChange={(e) => setHeight(Number(e.target.value))}
                    className="w-full accent-amber-400 cursor-pointer"
                  />
                </div>

                <div className="bg-neutral-950/60 p-4 rounded-2xl border border-neutral-800/80 flex flex-col gap-2">
                  <label className="text-xs font-semibold text-neutral-200">Kūno sudėjimas:</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'slim', label: 'Lieknas' },
                      { id: 'athletic', label: 'Atletiškas' },
                      { id: 'broad', label: 'Tvirtas' },
                      { id: 'plus', label: 'Plius Dydis' },
                    ].map((b) => (
                      <button
                        key={b.id}
                        type="button"
                        onClick={() => setBuild(b.id as BodyBuild)}
                        className={`p-2 rounded-xl border text-xs font-semibold transition cursor-pointer ${
                          build === b.id
                            ? 'bg-amber-400/10 border-amber-400 text-amber-300 font-bold'
                            : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white'
                        }`}
                      >
                        {b.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-neutral-950/60 p-4 rounded-2xl border border-neutral-800/80 flex flex-col gap-2">
                  <label className="text-xs font-semibold text-neutral-200">Pasirinkite dydį:</label>
                  <div className="grid grid-cols-6 gap-1.5 font-mono">
                    {(['XS', 'S', 'M', 'L', 'XL', 'XXL'] as const).map((sz) => (
                      <button
                        key={sz}
                        type="button"
                        onClick={() => setSelectedSize(sz)}
                        className={`py-2 rounded-xl text-xs font-bold transition text-center cursor-pointer ${
                          selectedSize === sz
                            ? 'bg-amber-400 text-neutral-950 shadow-md'
                            : 'bg-neutral-900 border border-neutral-800 text-neutral-300 hover:border-neutral-700'
                        }`}
                      >
                        {sz}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* D3 Canvas Card */}
              <div className="lg:col-span-7 bg-neutral-950 rounded-2xl border border-neutral-800 p-4 flex flex-col items-center justify-center">
                <div className="w-full flex items-center justify-between text-xs font-mono text-neutral-400 mb-2">
                  <span className="text-white font-semibold">
                    {product.name} ({selectedSize} · {selectedFit.toUpperCase()})
                  </span>
                  <span>Ūgis: {height} cm</span>
                </div>

                <svg
                  ref={d3MannequinRef}
                  viewBox="0 0 360 480"
                  className="w-full max-w-[340px] h-[320px] select-none"
                />

                <div className="w-full flex items-center justify-center gap-4 text-[10px] font-mono text-neutral-500 pt-1">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-neutral-600" />
                    <span>Kūno siluetas</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{
                        backgroundColor:
                          selectedFit === 'oversized'
                            ? '#f59e0b'
                            : selectedFit === 'slim'
                            ? '#38bdf8'
                            : '#e4e4e7',
                      }}
                    />
                    <span>Audinio kritimas ({selectedFit})</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer / Action CTA */}
        <div className="px-6 py-4 bg-neutral-950/70 border-t border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-xs text-neutral-400 font-mono">
            <span>Parinktas dydis:</span>
            <span className="px-2.5 py-1 rounded-lg bg-neutral-800 text-white font-bold border border-neutral-700">
              {selectedSize} ({selectedFit.toUpperCase()})
            </span>
            <span className="text-emerald-400">✓ Atitinka Europinius standartus</span>
          </div>

          <button
            onClick={handleApply}
            className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold text-xs transition flex items-center justify-center gap-2 cursor-pointer shadow-lg active:scale-98"
          >
            <Check className="w-4 h-4" />
            <span>Pritaikyti {selectedSize} dydį 3D Laboratorijoje</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
