import React, { useState } from 'react';
import { Box, ChevronRight, Ruler, Star, MessageSquare, Sparkles } from 'lucide-react';
import { PRODUCTS } from '../data/products';
import { Product } from '../types/clothing';
import { SizeGuideModal } from './StyleLab/SizeGuideModal';
import { ProductReviewsSection } from './Catalog/ProductReviewsSection';
import { getProductRatingStats } from '../data/productReviews';

interface ProductCatalogProps {
  onCustomizeProduct: (
    product: Product,
    initialSize?: 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL'
  ) => void;
  currentUser?: {
    uid: string;
    email?: string | null;
    displayName?: string | null;
    photoURL?: string | null;
  } | null;
  onOpenAuth?: () => void;
}

export const ProductCatalog: React.FC<ProductCatalogProps> = ({
  onCustomizeProduct,
  currentUser,
  onOpenAuth,
}) => {
  const [filter, setFilter] = useState<'all' | 'hoodie' | 'jacket' | 'sneakers' | 'pants'>('all');
  const [sizeGuideProduct, setSizeGuideProduct] = useState<Product | null>(null);
  const [reviewsFilterProduct, setReviewsFilterProduct] = useState<string>('all');

  const filteredProducts = PRODUCTS.filter((p) => {
    if (filter === 'all') return true;
    if (filter === 'hoodie') return p.type === 'hoodie' || p.type === 'tshirt';
    if (filter === 'jacket') return p.type === 'jacket' || p.type === 'trench';
    if (filter === 'sneakers') return p.type === 'sneakers';
    if (filter === 'pants') return p.type === 'cargo';
    return true;
  });

  const handleOpenReviews = (productId: string) => {
    setReviewsFilterProduct(productId);
    const el = document.getElementById('klientu-atsiliepimai');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="kolekcija" className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 pb-6 border-b border-stone-800/80">
        <div>
          <div className="text-[11px] font-mono uppercase tracking-[0.25em] text-[#d4af37] mb-2 font-semibold">
            01 // Pagrindinė Atelier Kolekcija
          </div>
          <h2 className="text-3xl sm:text-4xl font-serif-luxury font-bold tracking-tight text-white">
            Architektūriniai Drabužiai su 3D DNR
          </h2>
          <p className="text-xs sm:text-sm text-stone-300 mt-1 max-w-xl font-light leading-relaxed">
            Kiekvienas gaminys turi pilną 3D modelį. Spustelėk bet kurį modelį, kad atvertum interaktyvų 3D apžiūros ir modifikavimo kambarį.
          </p>
        </div>

        {/* Filter Segmented Controls */}
        <div className="flex items-center gap-1.5 p-1 bg-stone-900/80 rounded-xl border border-stone-800 shrink-0 overflow-x-auto max-w-full">
          <button
            onClick={() => setFilter('all')}
            className={`px-3.5 py-2 text-xs font-serif-luxury font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
              filter === 'all'
                ? 'bg-[#d4af37] text-stone-950 shadow-sm font-bold'
                : 'text-stone-300 hover:text-white'
            }`}
          >
            Visi modeliai
          </button>
          <button
            onClick={() => setFilter('hoodie')}
            className={`px-3.5 py-2 text-xs font-serif-luxury font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
              filter === 'hoodie'
                ? 'bg-[#d4af37] text-stone-950 shadow-sm font-bold'
                : 'text-stone-300 hover:text-white'
            }`}
          >
            Džemperiai & Marškinėliai
          </button>
          <button
            onClick={() => setFilter('jacket')}
            className={`px-3.5 py-2 text-xs font-serif-luxury font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
              filter === 'jacket'
                ? 'bg-[#d4af37] text-stone-950 shadow-sm font-bold'
                : 'text-stone-300 hover:text-white'
            }`}
          >
            Striukės & Paltai
          </button>
          <button
            onClick={() => setFilter('sneakers')}
            className={`px-3.5 py-2 text-xs font-serif-luxury font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
              filter === 'sneakers'
                ? 'bg-[#d4af37] text-stone-950 shadow-sm font-bold'
                : 'text-stone-300 hover:text-white'
            }`}
          >
            Bioniniai Kedai
          </button>
          <button
            onClick={() => setFilter('pants')}
            className={`px-3.5 py-2 text-xs font-serif-luxury font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
              filter === 'pants'
                ? 'bg-[#d4af37] text-stone-950 shadow-sm font-bold'
                : 'text-stone-300 hover:text-white'
            }`}
          >
            Kelnės
          </button>
        </div>
      </div>

      {/* 3-Column Uniform Product Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredProducts.map((product) => {
          const stats = getProductRatingStats(product.id);

          return (
            <div
              key={product.id}
              className="group flex flex-col bg-[#111116]/80 rounded-3xl border border-stone-800/90 overflow-hidden hover:border-[#d4af37]/45 transition-all duration-300 shadow-xl hover:shadow-2xl hover:-translate-y-1"
            >
              {/* Product Visual Frame */}
              <div className="relative aspect-[4/3] bg-stone-950 overflow-hidden">
                <img
                  src={product.image}
                  alt={product.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
                />

                {/* Subtle scrim */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0e0e13]/80 via-transparent to-transparent opacity-60 group-hover:opacity-30 transition-opacity" />

                {/* 3D Interactive Badge in Top Right */}
                <div className="absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1 rounded-xl bg-black/80 backdrop-blur-md border border-[#d4af37]/30 text-[11px] font-mono text-[#f5e6b8] shadow-md">
                  <Box className="w-3.5 h-3.5 text-[#d4af37]" />
                  <span>3D Apžiūra</span>
                </div>

                {/* Size Guide Quick Action in Top Left */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSizeGuideProduct(product);
                  }}
                  title="Atidaryti dydžių lentelę ir matavimo instrukciją"
                  className="absolute top-3 left-3 flex items-center gap-1 px-3 py-1 rounded-xl bg-black/80 hover:bg-stone-900 backdrop-blur-md border border-stone-800 text-[11px] font-mono text-stone-300 hover:text-white transition cursor-pointer active:scale-95 shadow-md"
                >
                  <Ruler className="w-3.5 h-3.5 text-[#d4af37]" />
                  <span>Dydžių gidas</span>
                </button>

                {/* Hover CTA Button */}
                <div className="absolute inset-0 flex items-center justify-center p-6 bg-black/40 opacity-0 group-hover:opacity-100 backdrop-blur-[2px] transition-all">
                  <button
                    onClick={() => {
                      onCustomizeProduct(product);
                      const el = document.getElementById('style-lab');
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="px-6 py-3 luxury-button-gold text-stone-950 font-bold text-xs rounded-xl shadow-2xl transition-transform transform translate-y-2 group-hover:translate-y-0 flex items-center gap-2 cursor-pointer"
                  >
                    <span>Pritaikyti 3D Laboratorijoje</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Product Info Module */}
              <div className="p-6 flex flex-col flex-1 justify-between">
                <div>
                  {/* Category and Rating Header */}
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="text-[11px] font-mono uppercase tracking-wider text-stone-400">
                      {product.categoryLt}
                    </div>

                    {/* Star Rating Badge */}
                    <button
                      type="button"
                      onClick={() => handleOpenReviews(product.id)}
                      className="flex items-center gap-1 text-[11px] font-mono text-[#d4af37] hover:text-[#f5e6b8] transition cursor-pointer"
                      title="Peržiūrėti pirkėjų atsiliepimus"
                    >
                      <Star className="w-3 h-3 fill-[#d4af37] text-[#d4af37]" />
                      <span className="font-bold">{stats.averageRating}</span>
                      <span className="text-stone-500">({stats.totalReviews})</span>
                    </button>
                  </div>

                  <h3 className="text-lg font-serif-luxury font-bold text-white tracking-tight">
                    {product.name}
                  </h3>

                  <p className="text-xs text-stone-300 line-clamp-2 mt-1.5 leading-relaxed font-light">
                    {product.tagline}
                  </p>
                </div>

                {/* Price & Action Row */}
                <div className="pt-4 mt-5 border-t border-stone-800/80 flex items-center justify-between">
                  <div>
                    <div className="text-[11px] text-stone-400 font-mono">Bazinė kaina</div>
                    <div className="text-xl font-serif-luxury font-bold text-[#f5e6b8] tabular-nums tracking-tight">
                      {product.basePrice} €
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      onCustomizeProduct(product);
                      const el = document.getElementById('style-lab');
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-stone-200 hover:text-white border border-stone-700/80 hover:border-[#d4af37]/40 text-xs font-medium rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <span>Keisti 3D</span>
                    <ChevronRight className="w-3.5 h-3.5 text-[#d4af37]" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Customer Reviews Section */}
      <ProductReviewsSection
        selectedProductForFilter={reviewsFilterProduct}
        onCustomizeProduct={(prod) => onCustomizeProduct(prod)}
        currentUser={currentUser}
        onOpenAuth={onOpenAuth}
      />

      {/* Size Guide Modal */}
      {sizeGuideProduct && (
        <SizeGuideModal
          isOpen={!!sizeGuideProduct}
          onClose={() => setSizeGuideProduct(null)}
          product={sizeGuideProduct}
          onApplySizeAndFit={(size) => {
            onCustomizeProduct(sizeGuideProduct, size);
            setSizeGuideProduct(null);
            const el = document.getElementById('style-lab');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
        />
      )}
    </section>
  );
};
