import React, { useState, useEffect } from 'react';
import {
  Star,
  MessageSquare,
  ThumbsUp,
  CheckCircle2,
  Sparkles,
  ChevronRight,
  Filter,
  User,
  ShieldCheck,
  Send,
  AlertCircle,
  Clock,
  Layers,
} from 'lucide-react';
import { PRODUCTS, FABRICS } from '../../data/products';
import { Product } from '../../types/clothing';
import { ProductReview, NewReviewInput } from '../../types/review';
import {
  subscribeProductReviews,
  addProductReview,
  toggleHelpfulReview,
  isReviewMarkedHelpful,
} from '../../data/productReviews';
import { awardLoyaltyPoints } from '../../utils/loyaltyStorage';

interface ProductReviewsSectionProps {
  selectedProductForFilter?: string;
  onCustomizeProduct: (product: Product) => void;
  currentUser?: {
    uid: string;
    email?: string | null;
    displayName?: string | null;
    photoURL?: string | null;
  } | null;
  onOpenAuth?: () => void;
}

const RATING_LABELS: Record<number, string> = {
  1: 'Prastas pasirinkimas',
  2: 'Vidutiniška kokybė',
  3: 'Geras drabužis',
  4: 'Labai kokybiškas ir patogus',
  5: 'Tobulas meistriškumas ir 3D atitikimas',
};

export const ProductReviewsSection: React.FC<ProductReviewsSectionProps> = ({
  selectedProductForFilter,
  onCustomizeProduct,
  currentUser,
  onOpenAuth,
}) => {
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [activeProductFilter, setActiveProductFilter] = useState<string>(
    selectedProductForFilter || 'all'
  );
  const [activeStarFilter, setActiveStarFilter] = useState<number | 'all'>('all');
  const [helpfulMap, setHelpfulMap] = useState<Record<string, boolean>>({});

  // Review Form State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formRating, setFormRating] = useState<number>(5);
  const [formHoverRating, setFormHoverRating] = useState<number>(0);
  const [formProductId, setFormProductId] = useState<string>(
    selectedProductForFilter || PRODUCTS[0]?.id || 'hoodie-aero-shift'
  );
  const [formSize, setFormSize] = useState<'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL'>('L');
  const [formFabric, setFormFabric] = useState<string>(FABRICS[0]?.nameLt || 'Šukuotinė Medvilnė');
  const [formTitle, setFormTitle] = useState('');
  const [formComment, setFormComment] = useState('');
  const [formSuccessMessage, setFormSuccessMessage] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  // Subscribe to reviews updates
  useEffect(() => {
    const unsub = subscribeProductReviews((updated) => {
      setReviews(updated);
    });
    return () => unsub();
  }, []);

  // Update product filter if prop changes
  useEffect(() => {
    if (selectedProductForFilter) {
      setActiveProductFilter(selectedProductForFilter);
      setFormProductId(selectedProductForFilter);
    }
  }, [selectedProductForFilter]);

  // Compute filtered reviews
  const filteredReviews = reviews.filter((r) => {
    const matchProduct = activeProductFilter === 'all' || r.productId === activeProductFilter;
    const matchStar = activeStarFilter === 'all' || Math.round(r.rating) === activeStarFilter;
    return matchProduct && matchStar;
  });

  // Calculate overall rating stats
  const currentProductReviews = reviews.filter((r) =>
    activeProductFilter === 'all' ? true : r.productId === activeProductFilter
  );
  const totalReviewsCount = currentProductReviews.length;
  const averageRating =
    totalReviewsCount > 0
      ? (
          currentProductReviews.reduce((sum, r) => sum + r.rating, 0) /
          totalReviewsCount
        ).toFixed(1)
      : '5.0';

  const starBreakdown: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  currentProductReviews.forEach((r) => {
    const rounded = Math.min(5, Math.max(1, Math.round(r.rating)));
    starBreakdown[rounded] = (starBreakdown[rounded] || 0) + 1;
  });

  // Handle helpful vote
  const handleToggleHelpful = (reviewId: string) => {
    const nextCount = toggleHelpfulReview(reviewId);
    setHelpfulMap((prev) => ({
      ...prev,
      [reviewId]: isReviewMarkedHelpful(reviewId),
    }));
    setReviews((prev) =>
      prev.map((r) => (r.id === reviewId ? { ...r, helpfulCount: nextCount } : r))
    );
  };

  // Submit review handler
  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      onOpenAuth?.();
      return;
    }

    if (!formComment.trim()) {
      setFormError('Prašome įrašyti savo atsiliepimo komentarą.');
      return;
    }

    if (formComment.trim().length < 15) {
      setFormError('Atsiliepimas turėtų būti bent 15 simbolių ilgio.');
      return;
    }

    setFormError(null);
    setIsSubmitting(true);

    const productObj = PRODUCTS.find((p) => p.id === formProductId) || PRODUCTS[0];

    const input: NewReviewInput = {
      productId: formProductId,
      productName: productObj.name,
      rating: formRating,
      title: formTitle.trim() || undefined,
      comment: formComment.trim(),
      customizedDetails: {
        garmentType: productObj.type,
        garmentName: productObj.name,
        fabricName: formFabric,
        size: formSize,
        primaryColorName: 'Kliento parinkta spalva',
      },
    };

    try {
      await addProductReview(input, {
        uid: currentUser.uid,
        displayName: currentUser.displayName,
        photoURL: currentUser.photoURL,
      });

      // Award +100 loyalty points for submitting a review
      awardLoyaltyPoints(
        currentUser.uid,
        100,
        'review',
        `Taškai už atsiliepimą apie ${productObj.name}`,
        formProductId
      );

      setFormSuccessMessage('Ačiū! Tavo atsiliepimas sėkmingai paskelbtas bendruomenėje (+100 lojalumo taškų įskaityta!).');
      setFormComment('');
      setFormTitle('');
      setTimeout(() => setFormSuccessMessage(null), 5000);
    } catch (err) {
      console.error('Failed to submit review:', err);
      setFormError('Nepavyko išsaugoti atsiliepimo. Bandykite dar kartą.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div id="klientu-atsiliepimai" className="mt-16 pt-12 border-t border-neutral-800">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div>
          <div className="text-xs font-mono uppercase tracking-widest text-amber-500 mb-1 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>02 // Tikri Klientų Įvertinimai</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-display font-semibold tracking-tight text-white">
            Pritaikytų Drabužių Atsiliepimai & Įvertinimai
          </h2>
          <p className="text-sm text-neutral-400 mt-1 max-w-2xl leading-relaxed">
            Tikri pirkėjų atsiliepimai apie audinių pojūtį, 3D laboratorijos tikslumą,
            siuvinėjimo kokybę ir realų drabužių kritimą.
          </p>
        </div>

        {/* Product Filter Selector */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
          <button
            onClick={() => setActiveProductFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition cursor-pointer whitespace-nowrap ${
              activeProductFilter === 'all'
                ? 'bg-amber-400 text-neutral-950 font-bold shadow'
                : 'bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white'
            }`}
          >
            Visi modeliai ({reviews.length})
          </button>
          {PRODUCTS.map((prod) => {
            const count = reviews.filter((r) => r.productId === prod.id).length;
            return (
              <button
                key={prod.id}
                onClick={() => setActiveProductFilter(prod.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition cursor-pointer whitespace-nowrap ${
                  activeProductFilter === prod.id
                    ? 'bg-amber-400 text-neutral-950 font-bold shadow'
                    : 'bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white'
                }`}
              >
                {prod.name.replace(/„|“/g, '')} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Rating Summary & Breakdown Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-neutral-900/60 rounded-3xl border border-neutral-800/80 p-6 sm:p-8 mb-10 backdrop-blur-sm">
        {/* Left: Score Box */}
        <div className="lg:col-span-4 flex flex-col justify-center items-center sm:items-start border-b lg:border-b-0 lg:border-r border-neutral-800/80 pb-6 lg:pb-0 lg:pr-8">
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-display font-extrabold text-white tracking-tight">
              {averageRating}
            </span>
            <span className="text-xl text-neutral-500 font-mono">/ 5.0</span>
          </div>

          <div className="flex items-center gap-1 my-3">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-5 h-5 ${
                  star <= Math.round(Number(averageRating))
                    ? 'text-amber-400 fill-amber-400'
                    : 'text-neutral-700'
                }`}
              />
            ))}
          </div>

          <p className="text-xs text-neutral-400 font-mono">
            Paremta <strong className="text-white">{totalReviewsCount}</strong> patvirtintų pirkėjų atsiliepimais
          </p>

          <div className="mt-4 flex items-center gap-2 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-full">
            <ShieldCheck className="w-4 h-4" />
            <span>100% tikri, 3D studijoje sukurti užsakymai</span>
          </div>
        </div>

        {/* Center: Rating Distribution Bars */}
        <div className="lg:col-span-5 flex flex-col justify-center gap-2">
          {[5, 4, 3, 2, 1].map((stars) => {
            const count = starBreakdown[stars] || 0;
            const pct = totalReviewsCount > 0 ? Math.round((count / totalReviewsCount) * 100) : 0;
            const isSelected = activeStarFilter === stars;

            return (
              <button
                key={stars}
                onClick={() => setActiveStarFilter(isSelected ? 'all' : stars)}
                className={`flex items-center gap-3 text-xs text-left group transition cursor-pointer p-1 rounded-lg ${
                  isSelected ? 'bg-amber-400/10 text-amber-300 font-bold' : 'hover:bg-neutral-800/50'
                }`}
              >
                <div className="flex items-center gap-1 w-12 font-mono text-neutral-300">
                  <span>{stars}</span>
                  <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                </div>

                <div className="flex-1 h-2 rounded-full bg-neutral-800 overflow-hidden relative">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isSelected ? 'bg-amber-400' : 'bg-amber-400/80 group-hover:bg-amber-400'
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>

                <span className="w-12 text-right font-mono text-neutral-400 text-[11px]">
                  {count} ({pct}%)
                </span>
              </button>
            );
          })}
        </div>

        {/* Right: Quick Action / Authenticated Status */}
        <div className="lg:col-span-3 flex flex-col justify-center items-stretch border-t lg:border-t-0 lg:border-l border-neutral-800/80 pt-6 lg:pt-0 lg:pl-8">
          <div className="text-xs text-neutral-400 mb-3">
            {currentUser ? (
              <div className="flex items-center gap-2 text-white">
                <div className="w-6 h-6 rounded-full bg-amber-400 text-neutral-950 font-bold flex items-center justify-center text-xs">
                  {currentUser.displayName ? currentUser.displayName[0].toUpperCase() : 'U'}
                </div>
                <span className="font-medium truncate">{currentUser.displayName || 'Paskyra'}</span>
              </div>
            ) : (
              <span>Prisijunkite norėdami palikti atsiliepimą</span>
            )}
          </div>

          <a
            href="#rasyti-atsiliepima"
            className="w-full py-2.5 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold text-xs transition text-center flex items-center justify-center gap-2 shadow-md cursor-pointer"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Rašyti atsiliepimą</span>
          </a>

          {activeStarFilter !== 'all' && (
            <button
              onClick={() => setActiveStarFilter('all')}
              className="mt-2 text-[11px] text-amber-400 hover:underline font-mono text-center"
            >
              Išvalyti žvaigždučių filtrą ({activeStarFilter} ★)
            </button>
          )}
        </div>
      </div>

      {/* Main Reviews Grid & Submission Form */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Reviews List */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <div className="flex items-center justify-between text-xs text-neutral-400 font-mono pb-2">
            <span>Rodomi atsiliepimai: {filteredReviews.length}</span>
            {activeStarFilter !== 'all' && (
              <span className="text-amber-400 font-semibold">
                Filtruojama pagal {activeStarFilter} žvaigždutes
              </span>
            )}
          </div>

          {filteredReviews.length === 0 ? (
            <div className="p-12 text-center rounded-2xl border border-neutral-800 bg-neutral-900/40 text-neutral-400">
              <MessageSquare className="w-8 h-8 text-neutral-600 mx-auto mb-3" />
              <p className="text-sm font-semibold text-neutral-300">Šiai kategorijai atsiliepimų kol kas nėra.</p>
              <p className="text-xs text-neutral-500 mt-1">Būk pirmas ir įvertink šį unikalų 3D drabužį!</p>
            </div>
          ) : (
            filteredReviews.map((rev) => {
              const isHelpful = helpfulMap[rev.id] ?? isReviewMarkedHelpful(rev.id);
              const relatedProduct = PRODUCTS.find((p) => p.id === rev.productId);

              return (
                <div
                  key={rev.id}
                  className="p-5 sm:p-6 rounded-2xl border border-neutral-800 bg-neutral-900/40 hover:border-neutral-700 transition-all flex flex-col gap-3 group"
                >
                  {/* Top user row */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-neutral-800 to-neutral-700 border border-neutral-700 flex items-center justify-center text-sm font-bold text-amber-400">
                        {rev.userName ? rev.userName[0].toUpperCase() : 'K'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-white">{rev.userName}</span>
                          {rev.verifiedBuyer && (
                            <span className="flex items-center gap-1 text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                              <CheckCircle2 className="w-2.5 h-2.5" />
                              <span>Patvirtintas pirkėjas</span>
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-neutral-500 font-mono mt-0.5">
                          <Clock className="w-3 h-3 text-neutral-600" />
                          <span>{new Date(rev.createdAt).toLocaleDateString('lt-LT')}</span>
                        </div>
                      </div>
                    </div>

                    {/* Star Rating Badge */}
                    <div className="flex items-center gap-1 bg-neutral-950/80 px-2.5 py-1 rounded-lg border border-neutral-800">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className={`w-3.5 h-3.5 ${
                            s <= rev.rating ? 'text-amber-400 fill-amber-400' : 'text-neutral-700'
                          }`}
                        />
                      ))}
                      <span className="text-xs font-mono font-bold text-amber-400 ml-1">
                        {rev.rating}.0
                      </span>
                    </div>
                  </div>

                  {/* Customized Variant Pill */}
                  {rev.customizedDetails && (
                    <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono text-neutral-400 bg-neutral-950/60 p-2 rounded-xl border border-neutral-800/80">
                      <span className="text-amber-400 font-semibold">Pritaikytas modelis:</span>
                      <span className="text-neutral-200">{rev.productName}</span>
                      {rev.customizedDetails.size && (
                        <span className="px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-300">
                          Dydis: {rev.customizedDetails.size}
                        </span>
                      )}
                      {rev.customizedDetails.fabricName && (
                        <span className="px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-300">
                          {rev.customizedDetails.fabricName}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Review Title & Body */}
                  {rev.title && (
                    <h4 className="text-sm font-semibold text-white tracking-tight">
                      {rev.title}
                    </h4>
                  )}
                  <p className="text-xs text-neutral-300 leading-relaxed whitespace-pre-line">
                    {rev.comment}
                  </p>

                  {/* Actions Row */}
                  <div className="flex items-center justify-between pt-3 border-t border-neutral-800/60 text-xs">
                    <button
                      onClick={() => handleToggleHelpful(rev.id)}
                      className={`flex items-center gap-1.5 font-mono px-2.5 py-1 rounded-lg border transition cursor-pointer ${
                        isHelpful
                          ? 'bg-amber-400/10 border-amber-400/40 text-amber-300 font-bold'
                          : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white hover:border-neutral-700'
                      }`}
                    >
                      <ThumbsUp className={`w-3.5 h-3.5 ${isHelpful ? 'text-amber-400 fill-amber-400' : ''}`} />
                      <span>Naudinga ({rev.helpfulCount})</span>
                    </button>

                    {relatedProduct && (
                      <button
                        onClick={() => {
                          onCustomizeProduct(relatedProduct);
                          const el = document.getElementById('style-lab');
                          if (el) el.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className="text-[11px] text-amber-400 hover:text-amber-300 flex items-center gap-1 font-mono transition"
                      >
                        <span>Pritaikyti šį modelį 3D laboratorijoje</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right Column: Review Submission Form */}
        <div className="lg:col-span-5">
          <div
            id="rasyti-atsiliepima"
            className="sticky top-24 bg-neutral-900/90 rounded-3xl border border-neutral-800 p-6 sm:p-7 backdrop-blur-md shadow-xl"
          >
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-neutral-800">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-amber-400" />
                <h3 className="text-base font-semibold text-white">Palikti Atsiliepimą</h3>
              </div>
              <span className="text-[11px] font-mono text-neutral-500">Tikriems klientams</span>
            </div>

            {formSuccessMessage && (
              <div className="mb-4 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>{formSuccessMessage}</span>
              </div>
            )}

            {formError && (
              <div className="mb-4 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{formError}</span>
              </div>
            )}

            {!currentUser ? (
              <div className="p-6 rounded-2xl bg-neutral-950/80 border border-neutral-800 text-center flex flex-col items-center gap-3">
                <User className="w-10 h-10 text-neutral-500" />
                <h4 className="text-sm font-semibold text-white">
                  Prisijunkite prie paskyros
                </h4>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  Atsiliepimus gali palikti tik autentifikuoti Flipukas vartotojai, kad
                  užtikrintume atsiliepimų autentiškumą ir apsisaugotume nuo šlamšto.
                </p>
                <button
                  type="button"
                  onClick={() => onOpenAuth?.()}
                  className="mt-2 w-full py-2.5 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold text-xs transition cursor-pointer shadow-md"
                >
                  Prisijungti / Registruotis
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmitReview} className="flex flex-col gap-4">
                {/* Product Choice */}
                <div>
                  <label className="text-xs font-semibold text-neutral-300 block mb-1.5">
                    Kurį drabužį vertinate?
                  </label>
                  <select
                    value={formProductId}
                    onChange={(e) => setFormProductId(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400 transition"
                  >
                    {PRODUCTS.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Rating Stars Selector */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-neutral-300">
                      Jūsų įvertinimas:
                    </label>
                    <span className="text-[11px] font-mono text-amber-400 font-bold">
                      {RATING_LABELS[formHoverRating || formRating]}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 p-2 bg-neutral-950 rounded-xl border border-neutral-800">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onMouseEnter={() => setFormHoverRating(star)}
                        onMouseLeave={() => setFormHoverRating(0)}
                        onClick={() => setFormRating(star)}
                        className="p-1 text-neutral-600 hover:scale-110 transition cursor-pointer"
                      >
                        <Star
                          className={`w-6 h-6 ${
                            star <= (formHoverRating || formRating)
                              ? 'text-amber-400 fill-amber-400'
                              : 'text-neutral-700'
                          }`}
                        />
                      </button>
                    ))}
                    <span className="text-xs font-mono font-bold text-neutral-300 ml-auto mr-1">
                      {formRating} iš 5
                    </span>
                  </div>
                </div>

                {/* Customization Details (Fabric & Size) */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-neutral-300 block mb-1">
                      Pasirinktas dydis:
                    </label>
                    <select
                      value={formSize}
                      onChange={(e) =>
                        setFormSize(e.target.value as 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL')
                      }
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-400 font-mono"
                    >
                      {(['XS', 'S', 'M', 'L', 'XL', 'XXL'] as const).map((sz) => (
                        <option key={sz} value={sz}>
                          {sz}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-neutral-300 block mb-1">
                      Audinys:
                    </label>
                    <select
                      value={formFabric}
                      onChange={(e) => setFormFabric(e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-400 font-mono truncate"
                    >
                      {FABRICS.map((f) => (
                        <option key={f.id} value={f.nameLt}>
                          {f.nameLt}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Review Title */}
                <div>
                  <label className="text-xs font-semibold text-neutral-300 block mb-1">
                    Atsiliepimo antraštė (neprivaloma):
                  </label>
                  <input
                    type="text"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="Pvz.: Nuostabus audinys ir tobulas kritimas"
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-amber-400"
                  />
                </div>

                {/* Review Comment */}
                <div>
                  <label className="text-xs font-semibold text-neutral-300 block mb-1">
                    Jūsų komentaras:
                  </label>
                  <textarea
                    rows={4}
                    value={formComment}
                    onChange={(e) => setFormComment(e.target.value)}
                    placeholder="Aprašykite drabužio kokybę, kritimą, audinio pojūtį ar 3D siuvinėjimą..."
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-amber-400 leading-relaxed resize-none"
                  />
                  <div className="text-[10px] text-neutral-500 font-mono text-right mt-1">
                    {formComment.length} simbolių (rekomenduojama 30+)
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold text-xs transition flex items-center justify-center gap-2 cursor-pointer shadow-lg disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? 'Pateikiama...' : 'Paskelbti atsiliepimą'}</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
