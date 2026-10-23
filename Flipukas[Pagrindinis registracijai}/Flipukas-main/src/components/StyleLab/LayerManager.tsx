import React, { useState } from 'react';
import {
  ArrowDown,
  ArrowUp,
  Check,
  ChevronDown,
  ChevronUp,
  Copy,
  Eye,
  EyeOff,
  Feather,
  Grid,
  Layers,
  Lock,
  Minus,
  MoveDown,
  MoveUp,
  Palette,
  Plus,
  RotateCw,
  Sliders,
  Sparkles,
  Square,
  Trash2,
  Type,
  Unlock,
} from 'lucide-react';
import { CanvasDesignElement, CustomPatternConfig, GarmentLayer, LayerType, PatternType } from '../../types/clothing';
import { reorderLayers } from '../../utils/garmentCanvasRenderer';

interface LayerManagerProps {
  layers: GarmentLayer[];
  patternConfig: CustomPatternConfig;
  primaryGarmentColor: string;
  accentGarmentColor: string;
  onChangeLayers: (newLayers: GarmentLayer[], actionLabel: string) => void;
  onChangePattern: (newPattern: CustomPatternConfig, actionLabel: string) => void;
  onOpenCanva?: () => void;
}

const PRESET_COLORS = [
  '#ffffff',
  '#18181b',
  '#f59e0b',
  '#d97706',
  '#ef4444',
  '#38bdf8',
  '#10b981',
  '#8b5cf6',
  '#ec4899',
  '#4d5e46',
];

const FONTS = [
  { id: 'Outfit', label: 'Modernus (Outfit)' },
  { id: 'Space Mono', label: 'Techninis (Space Mono)' },
  { id: 'Impact', label: 'Masyvus (Impact)' },
  { id: 'Georgia', label: 'Klasikinis (Georgia)' },
];

const PATTERN_OPTIONS: { id: PatternType; label: string; icon: string }[] = [
  { id: 'none', label: 'Vienspalvis (Be rašto)', icon: '◻️' },
  { id: 'houndstooth', label: 'Žąsies kojelė', icon: '🏁' },
  { id: 'cybergrid', label: 'Kiber gardelė', icon: '▦' },
  { id: 'tartan', label: 'Languotas pledas', icon: '🪟' },
  { id: 'pinstripe', label: 'Dryžiai (Pinstripe)', icon: '|||' },
  { id: 'dots', label: 'Polka Dots', icon: '•••' },
  { id: 'waves', label: 'Organinės bangos', icon: '〰️' },
  { id: 'camo', label: 'Miesto kamufliažas', icon: '🪖' },
];

export const LayerManager: React.FC<LayerManagerProps> = ({
  layers,
  patternConfig,
  primaryGarmentColor,
  accentGarmentColor,
  onChangeLayers,
  onChangePattern,
  onOpenCanva,
}) => {
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(layers[0]?.id || null);
  const [isAddMenuOpen, setIsAddMenuOpen] = useState(false);

  // Metadata calculations
  const totalLayers = layers.length;
  const visibleLayers = layers.filter((l) => l.visible).length;
  const lockedLayers = layers.filter((l) => l.locked).length;

  // Toggle Visibility
  const handleToggleVisibility = (layerId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const targetLayer = layers.find((l) => l.id === layerId);
    if (!targetLayer) return;

    const nextVisible = !targetLayer.visible;

    // If it's the pattern layer, keep patternConfig in sync
    if (targetLayer.type === 'pattern') {
      onChangePattern(
        {
          ...patternConfig,
          visible: nextVisible,
        },
        nextVisible ? 'Įjungtas rašto sluoksnis' : 'Paslėptas rašto sluoksnis'
      );
    }

    const updated = layers.map((layer) => {
      if (layer.id === layerId) {
        return {
          ...layer,
          visible: nextVisible,
          patternConfig: layer.patternConfig
            ? { ...layer.patternConfig, visible: nextVisible }
            : undefined,
          element: layer.element
            ? { ...layer.element, visible: nextVisible }
            : undefined,
        };
      }
      return layer;
    });

    onChangeLayers(
      updated,
      nextVisible
        ? `Rodyti sluoksnį: ${targetLayer.name}`
        : `Paslėpti sluoksnį: ${targetLayer.name}`
    );
  };

  // Toggle Lock
  const handleToggleLock = (layerId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const targetLayer = layers.find((l) => l.id === layerId);
    if (!targetLayer) return;

    const nextLocked = !targetLayer.locked;

    if (targetLayer.type === 'pattern') {
      onChangePattern(
        {
          ...patternConfig,
          locked: nextLocked,
        },
        nextLocked ? 'Užrakintas rašto sluoksnis' : 'Atrakintas rašto sluoksnis'
      );
    }

    const updated = layers.map((layer) => {
      if (layer.id === layerId) {
        return {
          ...layer,
          locked: nextLocked,
          patternConfig: layer.patternConfig
            ? { ...layer.patternConfig, locked: nextLocked }
            : undefined,
          element: layer.element
            ? { ...layer.element, locked: nextLocked }
            : undefined,
        };
      }
      return layer;
    });

    onChangeLayers(
      updated,
      nextLocked
        ? `Užrakintas sluoksnis: ${targetLayer.name}`
        : `Atrakintas sluoksnis: ${targetLayer.name}`
    );
  };

  // Move layer up (towards top of visual stack: index - 1)
  const handleMoveUp = (index: number, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (index <= 0) return;
    const targetLayer = layers[index];
    if (targetLayer.locked) return;

    const updated = reorderLayers(layers, index, index - 1);
    onChangeLayers(updated, `Perkeltas aukštyn: ${targetLayer.name}`);
  };

  // Move layer down (towards bottom of visual stack: index + 1)
  const handleMoveDown = (index: number, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (index >= layers.length - 1) return;
    const targetLayer = layers[index];
    if (targetLayer.locked) return;

    const updated = reorderLayers(layers, index, index + 1);
    onChangeLayers(updated, `Perkeltas žemyn: ${targetLayer.name}`);
  };

  // Move to absolute top (index 0)
  const handleMoveToTop = (index: number, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (index === 0) return;
    const targetLayer = layers[index];
    if (targetLayer.locked) return;

    const updated = reorderLayers(layers, index, 0);
    onChangeLayers(updated, `Iškeltas į patį viršų: ${targetLayer.name}`);
  };

  // Move to absolute bottom (index layers.length - 1)
  const handleMoveToBottom = (index: number, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (index === layers.length - 1) return;
    const targetLayer = layers[index];
    if (targetLayer.locked) return;

    const updated = reorderLayers(layers, index, layers.length - 1);
    onChangeLayers(updated, `Nuleistas į patį dugną: ${targetLayer.name}`);
  };

  // Delete layer
  const handleDeleteLayer = (layerId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const targetLayer = layers.find((l) => l.id === layerId);
    if (!targetLayer || targetLayer.locked) return;

    if (layers.length <= 1) return; // Keep at least 1 layer

    const updated = layers.filter((l) => l.id !== layerId);
    if (selectedLayerId === layerId) {
      setSelectedLayerId(updated[0]?.id || null);
    }
    onChangeLayers(updated, `Ištrintas sluoksnis: ${targetLayer.name}`);
  };

  // Duplicate layer
  const handleDuplicateLayer = (layerId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const targetLayer = layers.find((l) => l.id === layerId);
    if (!targetLayer) return;

    const newLayerId = `layer-${Date.now()}`;
    const duplicated: GarmentLayer = {
      ...targetLayer,
      id: newLayerId,
      name: `${targetLayer.name} (Kopija)`,
      locked: false,
      element: targetLayer.element
        ? {
            ...targetLayer.element,
            id: `el-${Date.now()}`,
            x: targetLayer.element.x + 20,
            y: targetLayer.element.y + 20,
          }
        : undefined,
    };

    const targetIdx = layers.findIndex((l) => l.id === layerId);
    const updated = [...layers];
    updated.splice(targetIdx + 1, 0, duplicated);

    setSelectedLayerId(newLayerId);
    onChangeLayers(updated, `Dubliuotas sluoksnis: ${targetLayer.name}`);
  };

  // Batch actions
  const handleToggleAllVisibility = (makeVisible: boolean) => {
    const updated = layers.map((l) => ({
      ...l,
      visible: makeVisible,
      element: l.element ? { ...l.element, visible: makeVisible } : undefined,
      patternConfig: l.patternConfig ? { ...l.patternConfig, visible: makeVisible } : undefined,
    }));
    onChangePattern(
      { ...patternConfig, visible: makeVisible },
      makeVisible ? 'Rodyti visus sluoksnius' : 'Paslėpti visus sluoksnius'
    );
    onChangeLayers(
      updated,
      makeVisible ? 'Rodyti visus sluoksnius' : 'Paslėpti visus sluoksnius'
    );
  };

  const handleToggleAllLock = (makeLocked: boolean) => {
    const updated = layers.map((l) => ({
      ...l,
      locked: makeLocked,
      element: l.element ? { ...l.element, locked: makeLocked } : undefined,
      patternConfig: l.patternConfig ? { ...l.patternConfig, locked: makeLocked } : undefined,
    }));
    onChangePattern(
      { ...patternConfig, locked: makeLocked },
      makeLocked ? 'Užrakinti visi sluoksniai' : 'Atrakinti visi sluoksniai'
    );
    onChangeLayers(
      updated,
      makeLocked ? 'Užrakinti visi sluoksniai' : 'Atrakinti visi sluoksniai'
    );
  };

  // Add new layer
  const handleAddNewLayer = (type: LayerType) => {
    const newId = `layer-${Date.now()}`;
    let newLayer: GarmentLayer;

    if (type === 'text') {
      newLayer = {
        id: newId,
        name: 'Naujas siuvinėtas tekstas',
        type: 'text',
        visible: true,
        locked: false,
        opacity: 1.0,
        element: {
          id: `el-${Date.now()}`,
          name: 'Tekstas',
          type: 'text',
          text: 'INDIVIDUALUS DIZAINAS',
          fontSize: 38,
          fontFamily: 'Outfit',
          fontWeight: 'bold',
          x: 512,
          y: 280,
          width: 320,
          height: 50,
          rotation: 0,
          fill: '#ffffff',
          stroke: 'transparent',
          strokeWidth: 0,
          letterSpacing: 3,
          textEffect: 'solid',
          opacity: 1,
          visible: true,
          locked: false,
        },
      };
    } else if (type === 'badge') {
      newLayer = {
        id: newId,
        name: 'Vytis herbinė emblema',
        type: 'badge',
        visible: true,
        locked: false,
        opacity: 1.0,
        element: {
          id: `el-${Date.now()}`,
          name: 'Emblema',
          type: 'badge',
          badgeType: 'vytis',
          x: 512,
          y: 240,
          width: 90,
          height: 90,
          rotation: 0,
          fill: accentGarmentColor || '#f59e0b',
          stroke: '#ffffff',
          strokeWidth: 2,
          opacity: 1,
          visible: true,
          locked: false,
        },
      };
    } else if (type === 'shape') {
      newLayer = {
        id: newId,
        name: 'Geometrinis skydas',
        type: 'shape',
        visible: true,
        locked: false,
        opacity: 0.9,
        element: {
          id: `el-${Date.now()}`,
          name: 'Skydas',
          type: 'shape',
          shapeType: 'shield',
          x: 512,
          y: 280,
          width: 140,
          height: 160,
          rotation: 0,
          fill: 'rgba(245, 158, 11, 0.15)',
          stroke: accentGarmentColor || '#f59e0b',
          strokeWidth: 3,
          opacity: 0.9,
          visible: true,
          locked: false,
        },
      };
    } else {
      // Pattern layer
      newLayer = {
        id: newId,
        name: 'Audinio rašto sluoksnis',
        type: 'pattern',
        visible: true,
        locked: false,
        opacity: 0.85,
        patternConfig: {
          type: 'houndstooth',
          scale: 3,
          primaryColor: primaryGarmentColor,
          secondaryColor: accentGarmentColor || '#f59e0b',
          opacity: 0.85,
          rotation: 0,
          visible: true,
          locked: false,
        },
      };
    }

    // Place new layer at top (index 0)
    const updated = [newLayer, ...layers];
    setSelectedLayerId(newId);
    setIsAddMenuOpen(false);
    onChangeLayers(updated, `Pridėtas naujas sluoksnis: ${newLayer.name}`);
  };

  // Modify Layer properties
  const updateActiveLayer = (
    updater: (layer: GarmentLayer) => GarmentLayer,
    actionLabel: string
  ) => {
    if (!selectedLayerId) return;
    const target = layers.find((l) => l.id === selectedLayerId);
    if (!target || target.locked) return;

    const updated = layers.map((layer) => {
      if (layer.id === selectedLayerId) {
        return updater(layer);
      }
      return layer;
    });

    onChangeLayers(updated, actionLabel);
  };

  const selectedLayer = layers.find((l) => l.id === selectedLayerId) || null;

  return (
    <div className="bg-neutral-900/90 rounded-2xl border border-neutral-800 p-4 sm:p-5 flex flex-col gap-4 shadow-xl">
      {/* Header & Metadata */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b border-neutral-800">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-amber-400" />
            <h3 className="text-xs font-semibold text-white uppercase tracking-wider font-mono">
              Sluoksnių Valdymas (Layer Management)
            </h3>
          </div>
          {/* Metadata Discipline: unboxed typographic stats */}
          <div className="flex items-center gap-2 text-xs text-neutral-400 mt-1 font-mono">
            <span>{totalLayers} sluoksniai</span>
            <span aria-hidden="true" className="text-neutral-600">·</span>
            <span className="text-amber-400">{visibleLayers} matomi</span>
            <span aria-hidden="true" className="text-neutral-600">·</span>
            <span className="text-neutral-500">{lockedLayers} užrakinti</span>
          </div>
        </div>

        {/* Global Layer Actions */}
        <div className="flex items-center gap-1.5 self-start sm:self-auto">
          <button
            onClick={() => handleToggleAllVisibility(visibleLayers < totalLayers)}
            title={visibleLayers < totalLayers ? 'Rodyti visus sluoksnius' : 'Paslėpti visus'}
            className="p-1.5 rounded-lg border border-neutral-800 bg-neutral-950/70 hover:bg-neutral-800 text-neutral-400 hover:text-white text-xs transition flex items-center gap-1"
          >
            {visibleLayers < totalLayers ? (
              <>
                <Eye className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-[11px] hidden sm:inline">Rodyti visus</span>
              </>
            ) : (
              <>
                <EyeOff className="w-3.5 h-3.5 text-neutral-500" />
                <span className="text-[11px] hidden sm:inline">Slėpti visus</span>
              </>
            )}
          </button>

          <button
            onClick={() => handleToggleAllLock(lockedLayers < totalLayers)}
            title={lockedLayers < totalLayers ? 'Užrakinti visus' : 'Atrakinti visus'}
            className="p-1.5 rounded-lg border border-neutral-800 bg-neutral-950/70 hover:bg-neutral-800 text-neutral-400 hover:text-white text-xs transition flex items-center gap-1"
          >
            {lockedLayers < totalLayers ? (
              <>
                <Lock className="w-3.5 h-3.5 text-neutral-400" />
                <span className="text-[11px] hidden sm:inline">Rakinti</span>
              </>
            ) : (
              <>
                <Unlock className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-[11px] hidden sm:inline">Atrakinti</span>
              </>
            )}
          </button>

          {/* Add Layer Menu */}
          <div className="relative">
            <button
              onClick={() => setIsAddMenuOpen(!isAddMenuOpen)}
              className="px-2.5 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-neutral-950 font-semibold text-xs transition flex items-center gap-1 shadow-sm"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
              <span className="text-[11px]">Naujas</span>
              <ChevronDown className="w-3 h-3 ml-0.5" />
            </button>

            {isAddMenuOpen && (
              <div className="absolute right-0 top-full mt-1.5 w-48 bg-neutral-950 border border-neutral-800 rounded-xl shadow-2xl p-1 z-30 flex flex-col gap-0.5">
                <button
                  onClick={() => handleAddNewLayer('text')}
                  className="px-3 py-2 rounded-lg text-left text-xs text-neutral-300 hover:text-white hover:bg-neutral-800 flex items-center gap-2 transition"
                >
                  <Type className="w-3.5 h-3.5 text-amber-400" />
                  <span>Teksto sluoksnis</span>
                </button>
                <button
                  onClick={() => handleAddNewLayer('badge')}
                  className="px-3 py-2 rounded-lg text-left text-xs text-neutral-300 hover:text-white hover:bg-neutral-800 flex items-center gap-2 transition"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Emblema / Lipdukas</span>
                </button>
                <button
                  onClick={() => handleAddNewLayer('shape')}
                  className="px-3 py-2 rounded-lg text-left text-xs text-neutral-300 hover:text-white hover:bg-neutral-800 flex items-center gap-2 transition"
                >
                  <Square className="w-3.5 h-3.5 text-amber-400" />
                  <span>Figūra / Skydas</span>
                </button>
                <button
                  onClick={() => handleAddNewLayer('pattern')}
                  className="px-3 py-2 rounded-lg text-left text-xs text-neutral-300 hover:text-white hover:bg-neutral-800 flex items-center gap-2 transition"
                >
                  <Grid className="w-3.5 h-3.5 text-amber-400" />
                  <span>Audinio raštas</span>
                </button>
                {onOpenCanva && (
                  <button
                    onClick={() => {
                      setIsAddMenuOpen(false);
                      onOpenCanva();
                    }}
                    className="px-3 py-2 rounded-lg text-left text-xs text-amber-400 hover:bg-amber-400/10 flex items-center gap-2 border-t border-neutral-800 mt-1 transition"
                  >
                    <Sliders className="w-3.5 h-3.5" />
                    <span>Atidaryti Canva Studiją</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Layer Stack Explanation */}
      <div className="flex items-center justify-between text-[11px] text-neutral-500 font-mono px-1">
        <span>VIRŠUTINIS SLUOKSNIS (PRIEKYJE)</span>
        <span>Z-INDEX EILĖ</span>
      </div>

      {/* Interactive Layer List */}
      <div className="flex flex-col gap-2">
        {layers.map((layer, index) => {
          const isSelected = selectedLayerId === layer.id;
          const isTop = index === 0;
          const isBottom = index === layers.length - 1;

          return (
            <div
              key={layer.id}
              onClick={() => setSelectedLayerId(layer.id)}
              className={`group rounded-xl border transition-all cursor-pointer ${
                isSelected
                  ? 'border-amber-400/80 bg-neutral-950 ring-1 ring-amber-400/20'
                  : 'border-neutral-800/80 bg-neutral-950/60 hover:border-neutral-700 hover:bg-neutral-950/90'
              } ${!layer.visible ? 'opacity-60 bg-neutral-950/30' : ''}`}
            >
              {/* Row Header */}
              <div className="p-3 flex items-center justify-between gap-2.5">
                {/* Left: Reorder controls & Layer Icon */}
                <div className="flex items-center gap-2 min-w-0">
                  {/* Reorder Buttons */}
                  <div className="flex flex-col gap-0.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={(e) => handleMoveUp(index, e)}
                      disabled={isTop || layer.locked}
                      title="Perkelti sluoksnį aukštyn (iškelti į viršų)"
                      className={`p-1 rounded text-neutral-400 hover:text-white transition ${
                        isTop || layer.locked
                          ? 'opacity-20 cursor-not-allowed'
                          : 'hover:bg-neutral-800 text-neutral-300'
                      }`}
                    >
                      <ChevronUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => handleMoveDown(index, e)}
                      disabled={isBottom || layer.locked}
                      title="Perkelti sluoksnį žemyn (nuleisti į apačią)"
                      className={`p-1 rounded text-neutral-400 hover:text-white transition ${
                        isBottom || layer.locked
                          ? 'opacity-20 cursor-not-allowed'
                          : 'hover:bg-neutral-800 text-neutral-300'
                      }`}
                    >
                      <ChevronDown className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Thumbnail / Visual Icon */}
                  <div
                    className={`w-9 h-9 rounded-lg border flex items-center justify-center shrink-0 ${
                      layer.type === 'pattern'
                        ? 'border-amber-400/40 bg-amber-400/10 text-amber-400'
                        : layer.type === 'text'
                        ? 'border-sky-400/40 bg-sky-400/10 text-sky-400'
                        : layer.type === 'badge'
                        ? 'border-emerald-400/40 bg-emerald-400/10 text-emerald-400'
                        : 'border-neutral-700 bg-neutral-900 text-neutral-300'
                    }`}
                  >
                    {layer.type === 'pattern' ? (
                      <Grid className="w-4 h-4" />
                    ) : layer.type === 'text' ? (
                      <Type className="w-4 h-4" />
                    ) : layer.type === 'badge' ? (
                      <Sparkles className="w-4 h-4" />
                    ) : (
                      <Square className="w-4 h-4" />
                    )}
                  </div>

                  {/* Title & Type Description */}
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`text-xs font-semibold truncate ${
                          layer.visible ? 'text-neutral-100' : 'text-neutral-500 line-through'
                        }`}
                      >
                        {layer.name}
                      </span>
                      {layer.locked && (
                        <Lock className="w-3 h-3 text-amber-400 shrink-0" />
                      )}
                    </div>
                    <div className="text-[10px] text-neutral-500 font-mono truncate">
                      {layer.type === 'pattern'
                        ? `Raštas: ${patternConfig.type !== 'none' ? patternConfig.type : 'Vienspalvis'}`
                        : layer.type === 'text'
                        ? `Tekstas: "${layer.element?.text || 'Tekstas'}"`
                        : layer.type === 'badge'
                        ? `Emblema: ${layer.element?.badgeType || 'Grafika'}`
                        : 'Dekoratyvinis elementas'}
                      {' · '}
                      {Math.round((layer.opacity ?? 1) * 100)}%
                    </div>
                  </div>
                </div>

                {/* Right: Visibility, Lock, Action Buttons */}
                <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                  {/* Visibility Toggle Button */}
                  <button
                    onClick={(e) => handleToggleVisibility(layer.id, e)}
                    title={layer.visible ? 'Paslėpti sluoksnį' : 'Rodyti sluoksnį'}
                    className={`p-1.5 rounded-lg border transition ${
                      layer.visible
                        ? 'border-neutral-700 bg-neutral-900 text-neutral-200 hover:text-white hover:bg-neutral-800'
                        : 'border-red-500/40 bg-red-500/10 text-red-400 hover:bg-red-500/20'
                    }`}
                  >
                    {layer.visible ? (
                      <Eye className="w-3.5 h-3.5" />
                    ) : (
                      <EyeOff className="w-3.5 h-3.5" />
                    )}
                  </button>

                  {/* Lock Toggle Button */}
                  <button
                    onClick={(e) => handleToggleLock(layer.id, e)}
                    title={layer.locked ? 'Atrakinti sluoksnį' : 'Užrakinti sluoksnį nuo redagavimo'}
                    className={`p-1.5 rounded-lg border transition ${
                      layer.locked
                        ? 'border-amber-400/50 bg-amber-400/10 text-amber-400 hover:bg-amber-400/20'
                        : 'border-neutral-800 bg-neutral-900/60 text-neutral-400 hover:text-white hover:bg-neutral-800'
                    }`}
                  >
                    {layer.locked ? (
                      <Lock className="w-3.5 h-3.5" />
                    ) : (
                      <Unlock className="w-3.5 h-3.5" />
                    )}
                  </button>

                  {/* Duplicate */}
                  <button
                    onClick={(e) => handleDuplicateLayer(layer.id, e)}
                    title="Dubliuoti sluoksnį"
                    className="p-1.5 rounded-lg border border-neutral-800 bg-neutral-900/60 text-neutral-400 hover:text-white hover:bg-neutral-800 transition"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>

                  {/* Delete */}
                  <button
                    onClick={(e) => handleDeleteLayer(layer.id, e)}
                    disabled={layer.locked || layers.length <= 1}
                    title={layer.locked ? 'Sluoksnis užrakintas' : 'Ištrinti sluoksnį'}
                    className={`p-1.5 rounded-lg border transition ${
                      layer.locked || layers.length <= 1
                        ? 'border-transparent text-neutral-600 opacity-40 cursor-not-allowed'
                        : 'border-neutral-800 bg-neutral-900/60 text-neutral-400 hover:text-red-400 hover:border-red-900/40 hover:bg-red-950/20'
                    }`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Inline Quick Editor Card for selected layer */}
              {isSelected && (
                <div
                  className="px-3 pb-3 pt-2 border-t border-neutral-800/80 bg-neutral-900/40 flex flex-col gap-3"
                  onClick={(e) => e.stopPropagation()}
                >
                  {layer.locked && (
                    <div className="p-2 rounded-lg bg-amber-400/10 border border-amber-400/20 text-amber-400 text-xs flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 shrink-0" />
                      <span>Šis sluoksnis yra užrakintas. Norėdami redaguoti, paspauskite spynelės piktogramą viršuje.</span>
                    </div>
                  )}

                  {/* Opacity slider */}
                  <div className="flex items-center justify-between gap-3 text-xs">
                    <span className="text-neutral-400">Nepermatomumas (Opacity):</span>
                    <div className="flex items-center gap-2">
                      <input
                        type="range"
                        min={0}
                        max={100}
                        value={Math.round((layer.opacity ?? 1) * 100)}
                        disabled={layer.locked}
                        onChange={(e) => {
                          const val = Number(e.target.value) / 100;
                          updateActiveLayer(
                            (l) => ({ ...l, opacity: val }),
                            `Pakeistas sluoksnio permatomumas: ${Math.round(val * 100)}%`
                          );
                        }}
                        className="w-24 sm:w-28 accent-amber-400 cursor-pointer disabled:opacity-40"
                      />
                      <span className="text-xs font-mono text-white w-9 text-right">
                        {Math.round((layer.opacity ?? 1) * 100)}%
                      </span>
                    </div>
                  </div>

                  {/* Text Layer specific controls */}
                  {layer.type === 'text' && layer.element && (
                    <div className="flex flex-col gap-2.5 pt-2 border-t border-neutral-800/60">
                      <div>
                        <label className="text-[11px] text-neutral-400 mb-1 block">Teksto reikšmė:</label>
                        <input
                          type="text"
                          value={layer.element.text || ''}
                          disabled={layer.locked}
                          onChange={(e) => {
                            const newText = e.target.value;
                            updateActiveLayer(
                              (l) => ({
                                ...l,
                                name: newText ? `"${newText}"` : l.name,
                                element: l.element ? { ...l.element, text: newText } : undefined,
                              }),
                              `Pakeistas tekstas į "${newText}"`
                            );
                          }}
                          className="w-full px-2.5 py-1.5 rounded-lg bg-neutral-950 border border-neutral-800 text-xs text-white focus:outline-none focus:border-amber-400 disabled:opacity-40"
                        />
                      </div>

                      {/* Font selector */}
                      <div className="flex items-center justify-between gap-3 text-xs">
                        <span className="text-neutral-400">Šriftas:</span>
                        <select
                          value={layer.element.fontFamily || 'Outfit'}
                          disabled={layer.locked}
                          onChange={(e) => {
                            const font = e.target.value;
                            updateActiveLayer(
                              (l) => ({
                                ...l,
                                element: l.element ? { ...l.element, fontFamily: font } : undefined,
                              }),
                              `Pakeistas šriftas į ${font}`
                            );
                          }}
                          className="px-2 py-1 rounded bg-neutral-950 border border-neutral-800 text-xs text-white focus:outline-none focus:border-amber-400 disabled:opacity-40"
                        >
                          {FONTS.map((f) => (
                            <option key={f.id} value={f.id}>
                              {f.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Text Color Swatches */}
                      <div className="flex items-center justify-between gap-3 text-xs">
                        <span className="text-neutral-400">Teksto spalva:</span>
                        <div className="flex items-center gap-1.5">
                          {PRESET_COLORS.slice(0, 6).map((c) => (
                            <button
                              key={c}
                              disabled={layer.locked}
                              onClick={() => {
                                updateActiveLayer(
                                  (l) => ({
                                    ...l,
                                    element: l.element ? { ...l.element, fill: c } : undefined,
                                  }),
                                  'Pakeista teksto spalva'
                                );
                              }}
                              className={`w-5 h-5 rounded-full border transition ${
                                layer.element?.fill === c
                                  ? 'scale-125 border-amber-400 ring-2 ring-amber-400/30'
                                  : 'border-neutral-700 hover:scale-110'
                              } disabled:opacity-40`}
                              style={{ backgroundColor: c }}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Badge or Shape Layer specific controls */}
                  {(layer.type === 'badge' || layer.type === 'shape') && layer.element && (
                    <div className="flex flex-col gap-2.5 pt-2 border-t border-neutral-800/60">
                      {/* Fill color swatches */}
                      <div className="flex items-center justify-between gap-3 text-xs">
                        <span className="text-neutral-400">Užpildo spalva:</span>
                        <div className="flex items-center gap-1.5">
                          {PRESET_COLORS.slice(0, 6).map((c) => (
                            <button
                              key={c}
                              disabled={layer.locked}
                              onClick={() => {
                                updateActiveLayer(
                                  (l) => ({
                                    ...l,
                                    element: l.element ? { ...l.element, fill: c } : undefined,
                                  }),
                                  'Pakeista elemento spalva'
                                );
                              }}
                              className={`w-5 h-5 rounded-full border transition ${
                                layer.element?.fill === c
                                  ? 'scale-125 border-amber-400 ring-2 ring-amber-400/30'
                                  : 'border-neutral-700 hover:scale-110'
                              } disabled:opacity-40`}
                              style={{ backgroundColor: c }}
                            />
                          ))}
                        </div>
                      </div>

                      {/* Scale / Width Slider */}
                      <div className="flex items-center justify-between gap-3 text-xs">
                        <span className="text-neutral-400">Dydis (Mastelis):</span>
                        <div className="flex items-center gap-2">
                          <input
                            type="range"
                            min={40}
                            max={320}
                            value={layer.element.width || 100}
                            disabled={layer.locked}
                            onChange={(e) => {
                              const s = Number(e.target.value);
                              updateActiveLayer(
                                (l) => ({
                                  ...l,
                                  element: l.element
                                    ? { ...l.element, width: s, height: l.element.type === 'shape' && l.element.shapeType === 'rect' ? s * 0.6 : s }
                                    : undefined,
                                }),
                                `Pakeistas elemento dydis`
                              );
                            }}
                            className="w-24 sm:w-28 accent-amber-400 cursor-pointer disabled:opacity-40"
                          />
                          <span className="text-xs font-mono text-white w-9 text-right">
                            {layer.element.width}px
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Pattern Layer specific controls */}
                  {layer.type === 'pattern' && (
                    <div className="flex flex-col gap-2.5 pt-2 border-t border-neutral-800/60">
                      <span className="text-[11px] text-neutral-400">Rašto tipas:</span>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                        {PATTERN_OPTIONS.map((p) => {
                          const isSel = patternConfig.type === p.id;
                          return (
                            <button
                              key={p.id}
                              disabled={layer.locked}
                              onClick={() => {
                                const newP = { ...patternConfig, type: p.id };
                                onChangePattern(newP, `Pasirinktas raštas: ${p.label}`);
                                updateActiveLayer(
                                  (l) => ({
                                    ...l,
                                    name: `Audinio raštas: ${p.label}`,
                                    patternConfig: newP,
                                  }),
                                  `Pasirinktas raštas: ${p.label}`
                                );
                              }}
                              className={`p-2 rounded-lg border text-left text-xs transition flex items-center gap-1.5 ${
                                isSel
                                  ? 'border-amber-400 bg-amber-400/10 text-white'
                                  : 'border-neutral-800 bg-neutral-950 text-neutral-400 hover:text-white'
                              } disabled:opacity-40`}
                            >
                              <span>{p.icon}</span>
                              <span className="truncate text-[11px]">{p.label}</span>
                            </button>
                          );
                        })}
                      </div>

                      {/* Pattern scale */}
                      <div className="flex items-center justify-between gap-3 text-xs pt-1">
                        <span className="text-neutral-400">Rašto tankis (Scale):</span>
                        <div className="flex items-center gap-2">
                          <input
                            type="range"
                            min={1}
                            max={8}
                            value={patternConfig.scale}
                            disabled={layer.locked}
                            onChange={(e) => {
                              const s = Number(e.target.value);
                              onChangePattern({ ...patternConfig, scale: s }, `Rašto tankis ${s}x`);
                            }}
                            className="w-24 sm:w-28 accent-amber-400 cursor-pointer disabled:opacity-40"
                          />
                          <span className="text-xs font-mono text-white w-9 text-right">
                            {patternConfig.scale}x
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Direct layer reorder shortcuts */}
                  <div className="flex items-center justify-between pt-2 border-t border-neutral-800/60 text-[11px] text-neutral-400">
                    <span>Greitas z-index perkėlimas:</span>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={(e) => handleMoveToTop(index, e)}
                        disabled={isTop || layer.locked}
                        className="px-2 py-0.5 rounded bg-neutral-950 border border-neutral-800 hover:bg-neutral-800 text-neutral-300 disabled:opacity-30 disabled:cursor-not-allowed text-[10px] font-mono"
                      >
                        Į patį viršų
                      </button>
                      <button
                        onClick={(e) => handleMoveToBottom(index, e)}
                        disabled={isBottom || layer.locked}
                        className="px-2 py-0.5 rounded bg-neutral-950 border border-neutral-800 hover:bg-neutral-800 text-neutral-300 disabled:opacity-30 disabled:cursor-not-allowed text-[10px] font-mono"
                      >
                        Į patį dugną
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer Info & Canva quick jump */}
      <div className="pt-2 border-t border-neutral-800 flex items-center justify-between text-xs text-neutral-500">
        <span className="text-[11px]">
          Sluoksniai atvaizduojami tiesiogiai ant 3D modelio tekstūros
        </span>
        {onOpenCanva && (
          <button
            onClick={onOpenCanva}
            className="text-amber-400 hover:underline text-[11px] font-medium"
          >
            Redaguoti Canva studijoje →
          </button>
        )}
      </div>
    </div>
  );
};
