import React, { useState } from 'react';
import {
  Heart,
  X,
  ShoppingBag,
  Sliders,
  Scale,
  Trash2,
  Calendar,
  Sparkles,
  ArrowRight,
  Eye,
  Check,
  Search,
  ExternalLink,
} from 'lucide-react';
import { WishlistItem, Product, CustomizationState, FabricMaterial } from '../../types/clothing';

interface WishlistModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: WishlistItem[];
  onRemoveItem: (id: string) => void;
  onLoadInLab: (item: WishlistItem) => void;
  onAddToCart: (
    product: Product,
    customization: CustomizationState,
    fabric: FabricMaterial,
    unitPrice: number
  ) => void;
  onOpenCompare: (itemA: WishlistItem, itemB?: WishlistItem) => void;
}

export const WishlistModal: React.FC<WishlistModalProps> = ({
  isOpen,
  onClose,
  items,
  onRemoveItem,
  onLoadInLab,
  onAddToCart,
  onOpenCompare,
}) => {
  const [selectedForCompare, setSelectedForCompare] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedNotification, setCopiedNotification] = useState<string | null>(null);

  if (!isOpen) return null;

  const filteredItems = items.filter((item) => {
    const q = searchQuery.toLowerCase();
    return (
      item.title.toLowerCase().includes(q) ||
      item.product.name.toLowerCase().includes(q) ||
      item.fabric.nameLt.toLowerCase().includes(q) ||
      (item.note && item.note.toLowerCase().includes(q))
    );
  });

  const toggleSelectForCompare = (id: string) => {
    setSelectedForCompare((prev) => {
      if (prev.includes(id)) {
        return prev.filter((itemId) => itemId !== id);
      }
      if (prev.length >= 2) {
        // Keep max 2 items, replace the oldest selection
        return [prev[1], id];
      }
      return [...prev, id];
    });
  };

  const handleLaunchCompareSelected = () => {
    if (selectedForCompare.length === 2) {
      const itemA = items.find((i) => i.id === selectedForCompare[0]);
      const itemB = items.find((i) => i.id === selectedForCompare[1]);
      if (itemA && itemB) {
        onOpenCompare(itemA, itemB);
        onClose();
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-neutral-950/80 backdrop-blur-md transition-opacity"
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-4xl bg-neutral-900 border border-neutral-800 rounded-3xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-5 border-b border-neutral-800 flex items-center justify-between gap-4 bg-neutral-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
              <Heart className="w-5 h-5 fill-rose-500/30" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display font-bold text-lg text-white">
                  Išsaugoti 3D Rūbai & Wishlist
                </h3>
                <span className="font-mono text-xs px-2 py-0.5 rounded-full bg-neutral-800 text-rose-400 font-bold border border-neutral-700">
                  {items.length}
                </span>
              </div>
              <p className="text-xs text-neutral-400">
                Tavo individualios 3D drabužių konfigūracijos, paruoštos užsakymui arba lyginimui
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar: Search & Compare 2 selection bar */}
        <div className="px-6 py-3 border-b border-neutral-800/80 bg-neutral-950/40 flex flex-wrap items-center justify-between gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Ieškoti pagal modelį ar audinį..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-neutral-900 text-xs text-neutral-200 pl-9 pr-3 py-1.5 rounded-xl border border-neutral-800 focus:outline-none focus:border-amber-400"
            />
          </div>

          {/* Compare Selection CTA Bar */}
          <div className="flex items-center gap-2">
            {selectedForCompare.length > 0 && (
              <span className="text-xs text-neutral-400 font-mono">
                Pasirinkta lyginimui: <strong className="text-amber-400">{selectedForCompare.length}/2</strong>
              </span>
            )}
            <button
              onClick={handleLaunchCompareSelected}
              disabled={selectedForCompare.length !== 2}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
                selectedForCompare.length === 2
                  ? 'bg-amber-400 text-neutral-950 hover:bg-amber-300 shadow-md shadow-amber-400/20 cursor-pointer active:scale-95'
                  : 'bg-neutral-800/60 text-neutral-500 border border-neutral-800 cursor-not-allowed opacity-60'
              }`}
            >
              <Scale className="w-3.5 h-3.5" />
              <span>Palyginti 2 pasirinktus</span>
            </button>
          </div>
        </div>

        {/* Content Items List */}
        <div className="flex-1 overflow-y-auto p-6">
          {filteredItems.length === 0 ? (
            <div className="py-16 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 rounded-full bg-neutral-950 border border-neutral-800 flex items-center justify-center text-neutral-600 mb-4">
                <Heart className="w-8 h-8" />
              </div>
              <h4 className="font-display font-semibold text-base text-white mb-1">
                {searchQuery ? 'Nerasta atitinkančių rūbų' : 'Wishlist sąrašas tuščias'}
              </h4>
              <p className="text-xs text-neutral-400 max-w-sm mb-6">
                {searchQuery
                  ? 'Pabandyk pakeisti paieškos frazę.'
                  : '3D laboratorijoje sukurk norimą dizainą ir paspausk „Išsaugoti į Wishlist“, kad galėtum sugrįžti bet kada!'}
              </p>
              {!searchQuery && (
                <button
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-neutral-950 font-bold text-xs shadow-lg shadow-amber-400/20 transition active:scale-95"
                >
                  Kurti 3D Laboratorijoje
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredItems.map((item) => {
                const isSelected = selectedForCompare.includes(item.id);

                return (
                  <div
                    key={item.id}
                    className={`relative p-4 rounded-2xl border transition-all flex flex-col justify-between group ${
                      isSelected
                        ? 'border-amber-400/80 bg-neutral-950 ring-1 ring-amber-400/40 shadow-lg'
                        : 'border-neutral-800 bg-neutral-950/70 hover:border-neutral-700 hover:bg-neutral-950'
                    }`}
                  >
                    {/* Top Row: Select for compare checkbox + Delete */}
                    <div className="flex items-center justify-between mb-3">
                      <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelectForCompare(item.id)}
                          className="w-4 h-4 rounded accent-amber-400 cursor-pointer"
                        />
                        <span className="text-[11px] font-mono text-neutral-400 hover:text-amber-300">
                          {isSelected ? 'Pasirinktas lyginimui' : 'Pasirinkti lyginimui'}
                        </span>
                      </label>

                      <button
                        onClick={() => onRemoveItem(item.id)}
                        title="Ištrinti iš sąrašo"
                        className="p-1 rounded-lg text-neutral-500 hover:text-rose-400 hover:bg-neutral-900 transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Middle: Thumbnail + Specs */}
                    <div className="flex gap-3 mb-4">
                      {/* Image Thumbnail */}
                      <div className="w-24 h-24 rounded-xl overflow-hidden bg-neutral-900 border border-neutral-800 shrink-0 relative flex items-center justify-center">
                        {item.snapshotUrl ? (
                          <img
                            src={item.snapshotUrl}
                            alt={item.title}
                            className="w-full h-full object-contain p-1"
                          />
                        ) : (
                          <div
                            className="w-full h-full flex flex-col items-center justify-center p-2 text-center"
                            style={{ backgroundColor: `${item.customization.primaryColor}22` }}
                          >
                            <div
                              className="w-8 h-8 rounded-full border border-white/20 mb-1"
                              style={{ backgroundColor: item.customization.primaryColor }}
                            />
                            <span className="text-[9px] font-mono text-neutral-400">
                              {item.product.type}
                            </span>
                          </div>
                        )}

                        <span className="absolute bottom-1 right-1 font-mono text-[9px] font-bold px-1 py-0.5 rounded bg-neutral-950/80 text-amber-400 border border-neutral-800">
                          {item.customization.size}
                        </span>
                      </div>

                      {/* Info & Badges */}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-sm text-white truncate mb-0.5">
                          {item.title}
                        </h4>
                        <p className="text-xs text-neutral-400 truncate mb-2">
                          {item.product.name}
                        </p>

                        <div className="flex flex-wrap items-center gap-1.5 mb-2">
                          {/* Fabric */}
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-neutral-900 text-amber-300 border border-neutral-800">
                            {item.fabric.nameLt}
                          </span>

                          {/* Fit */}
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-neutral-900 text-neutral-300 border border-neutral-800 uppercase">
                            {item.customization.fitMode}
                          </span>

                          {/* Color Dot */}
                          <div
                            className="w-3.5 h-3.5 rounded-full border border-white/30 shrink-0"
                            style={{ backgroundColor: item.customization.primaryColor }}
                            title={`Pagrindinė spalva: ${item.customization.primaryColor}`}
                          />
                        </div>

                        {/* Price */}
                        <div className="flex items-baseline gap-2">
                          <span className="text-base font-display font-bold text-white tabular-nums">
                            {item.price.toFixed(2)} €
                          </span>
                          {item.fabric.priceDelta > 0 && (
                            <span className="text-[10px] text-emerald-400 font-mono">
                              +{item.fabric.priceDelta} € audinio priedas
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Bottom Actions Row */}
                    <div className="pt-3 border-t border-neutral-800/80 grid grid-cols-3 gap-2">
                      {/* Load in 3D Lab */}
                      <button
                        onClick={() => {
                          onLoadInLab(item);
                          onClose();
                        }}
                        title="Užkrauti šį dizainą 3D laboratorijoje redagavimui"
                        className="py-2 px-2 rounded-xl text-xs font-semibold bg-neutral-900 hover:bg-neutral-800 text-neutral-200 hover:text-white border border-neutral-700/80 transition flex items-center justify-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5 text-cyan-400" />
                        <span className="truncate">3D Lab</span>
                      </button>

                      {/* Launch Side-by-Side Compare */}
                      <button
                        onClick={() => {
                          onOpenCompare(item);
                          onClose();
                        }}
                        title="Palyginti šį rūbą su kitu"
                        className="py-2 px-2 rounded-xl text-xs font-semibold bg-neutral-900 hover:bg-neutral-800 text-neutral-200 hover:text-white border border-neutral-700/80 transition flex items-center justify-center gap-1"
                      >
                        <Scale className="w-3.5 h-3.5 text-amber-400" />
                        <span className="truncate">Palyginti</span>
                      </button>

                      {/* Add to Cart */}
                      <button
                        onClick={() => {
                          onAddToCart(item.product, item.customization, item.fabric, item.price);
                          onClose();
                        }}
                        title="Pirkti šią konfigūraciją"
                        className="py-2 px-2 rounded-xl text-xs font-bold bg-amber-400 hover:bg-amber-300 text-neutral-950 transition flex items-center justify-center gap-1 shadow-md shadow-amber-400/20 active:scale-95 cursor-pointer"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span className="truncate">Pirkti</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-neutral-800 bg-neutral-950 flex items-center justify-between text-xs text-neutral-400">
          <span>
            Išsaugota įrenginio naršyklėje • Prieinama bet kada vėliau
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-medium transition cursor-pointer"
          >
            Uždaryti
          </button>
        </div>
      </div>
    </div>
  );
};
