import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  Check,
  Minus,
  Plus,
  ShoppingBag,
  Trash2,
  X,
  Tag,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Gift,
  Scissors,
} from 'lucide-react';
import { CartItem } from '../types/clothing';
import { Order } from '../types/order';
import { saveOrder } from '../utils/orderStorage';
import { awardLoyaltyPoints } from '../utils/loyaltyStorage';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (cartItemId: string, newQuantity: number) => void;
  onRemoveItem: (cartItemId: string) => void;
  onClearCart: () => void;
  onOpenOrderTracking?: (orderId?: string) => void;
  initialPromoCode?: string | null;
}

const PROMO_CODES: Record<string, { percent: number; labelLt: string }> = {
  ATELIER5: { percent: 5, labelLt: 'Atelier Debiuto Pasiekimas (-5%)' },
  ARCHITECT10: { percent: 10, labelLt: 'Stiliaus Architekto Pasiekimas (-10%)' },
  COUTURE15: { percent: 15, labelLt: 'Haute Couture Meistro Pasiekimas (-15%)' },
  VIRTUOSO20: { percent: 20, labelLt: 'Grand Virtuoso Pasiekimas (-20%)' },
  MONOCHROME5: { percent: 5, labelLt: 'Monochrominės Elegancijos Iššūkis (-5%)' },
  SILK10: { percent: 10, labelLt: 'Šilko Connoisseur Iššūkis (-10%)' },
  ECO10: { percent: 10, labelLt: 'Eko Vizionieriaus Iššūkis (-10%)' },
  BRONZE5: { percent: 5, labelLt: 'Bronzinio Kūrėjo Lojalumas (-5%)' },
  SILVER10: { percent: 10, labelLt: 'Sidabrinio Kūrėjo Lojalumas (-10%)' },
  GOLD15: { percent: 15, labelLt: 'Auksinio Kūrėjo Lojalumas (-15%)' },
  DIAMOND20: { percent: 20, labelLt: 'Deimantinio VIP Atelier Nuolaida (-20%)' },
};

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onOpenOrderTracking,
  initialPromoCode,
}) => {
  const [step, setStep] = useState<'cart' | 'checkout' | 'confirmed'>('cart');
  const [promoInput, setPromoInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<{
    code: string;
    percent: number;
    labelLt: string;
  } | null>(null);
  const [promoError, setPromoError] = useState<string | null>(null);
  const [promoSuccess, setPromoSuccess] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    city: 'Vilnius',
    address: '',
    postalCode: '',
    paymentMethod: 'card',
  });
  const [orderNumber, setOrderNumber] = useState('');

  // Listen for initialPromoCode or custom window events
  useEffect(() => {
    if (initialPromoCode) {
      applyCode(initialPromoCode);
    }
  }, [initialPromoCode]);

  useEffect(() => {
    const handleApplyEvent = (e: Event) => {
      const custom = e as CustomEvent<string>;
      if (custom.detail) {
        applyCode(custom.detail);
      }
    };
    window.addEventListener('flipukas-apply-promo', handleApplyEvent);
    return () => window.removeEventListener('flipukas-apply-promo', handleApplyEvent);
  }, []);

  const applyCode = (rawCode: string) => {
    const code = rawCode.trim().toUpperCase();
    if (!code) return;

    if (PROMO_CODES[code]) {
      const rule = PROMO_CODES[code];
      setAppliedPromo({
        code,
        percent: rule.percent,
        labelLt: rule.labelLt,
      });
      setPromoSuccess(`Kuponas „${code}“ aktyvuotas: -${rule.percent}% nuolaida!`);
      setPromoError(null);
      try {
        confetti({
          particleCount: 40,
          spread: 50,
          origin: { y: 0.6 },
          colors: ['#d4af37', '#10b981'],
        });
      } catch {
        // ignore
      }
      setTimeout(() => setPromoSuccess(null), 3500);
    } else {
      setPromoError('Neteisingas arba nebegaliojantis nuolaidos kodas.');
      setTimeout(() => setPromoError(null), 3000);
    }
  };

  const handleApplyPromoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    applyCode(promoInput);
    setPromoInput('');
  };

  if (!isOpen) return null;

  const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const discountAmount = appliedPromo ? (subtotal * appliedPromo.percent) / 100 : 0;
  const subtotalAfterDiscount = Math.max(0, subtotal - discountAmount);
  const shipping = subtotalAfterDiscount > 100 || items.length === 0 ? 0 : 4.5;
  const total = Number((subtotalAfterDiscount + shipping).toFixed(2));

  const handleCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const generatedOrder = `FLP-${Math.floor(100000 + Math.random() * 900000)}`;
    setOrderNumber(generatedOrder);

    const newOrder: Order = {
      id: generatedOrder,
      trackingNumber: `OMN-LT-${Math.floor(1000000 + Math.random() * 9000000)}`,
      carrier: 'Omniva Lietuva',
      status: 'confirmed',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      estimatedDelivery: '1–2 d.d. per Omniva / DPD',
      customerName: formData.name || 'Pirkėjas',
      customerEmail: formData.email || 'klientas@flipukas.lt',
      customerPhone: formData.phone,
      address: formData.address || 'Gedimino pr. 10',
      city: formData.city,
      postalCode: formData.postalCode || 'LT-01103',
      total,
      items: items.map((it) => ({
        id: it.cartItemId,
        title: `${it.product.name} (${it.customization.size})`,
        productName: it.product.name,
        size: it.customization.size,
        fabricName: it.customization.fabricId,
        primaryColor: it.customization.primaryColor,
        price: it.unitPrice,
        quantity: it.quantity,
      })),
    };
    saveOrder(newOrder);

    // Award loyalty points & track spending
    const earnedPoints = Math.max(50, Math.round(total * 10));
    awardLoyaltyPoints(
      undefined,
      earnedPoints,
      'purchase',
      `Užsakymas #${generatedOrder} (${items.length} vnt., ${total.toFixed(2)} €)`,
      generatedOrder,
      total
    );

    setStep('confirmed');
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#d4af37', '#f5e6b8', '#10b981'],
      });
    } catch {
      // ignore
    }
  };

  const handleFinish = () => {
    onClearCart();
    setStep('cart');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-neutral-950/80 backdrop-blur-sm transition-opacity"
      />

      {/* Luxury Drawer Container */}
      <div className="relative w-full max-w-md bg-gradient-to-b from-[#13131a] to-[#0c0c10] border-l border-[#d4af37]/25 h-full flex flex-col z-10 shadow-2xl overflow-hidden">
        {/* Drawer Header */}
        <div className="px-6 py-5 border-b border-stone-800 flex items-center justify-between bg-black/40">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#d4af37]/15 border border-[#d4af37]/35 flex items-center justify-center text-[#d4af37]">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-mono tracking-widest uppercase text-[#d4af37] font-semibold block">
                Atelier Krepšelis
              </span>
              <h3 className="font-serif-luxury font-bold text-base text-white">
                {step === 'cart'
                  ? 'Tavo Pasirinkti 3D Modeliai'
                  : step === 'checkout'
                  ? 'Pristatymas ir Apmokėjimas'
                  : 'Užsakymas Patvirtintas'}
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Drawer Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {step === 'cart' && (
            <>
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center py-16">
                  <div className="w-16 h-16 rounded-2xl bg-stone-900 border border-stone-800 flex items-center justify-center text-stone-500 mb-4 shadow-inner">
                    <ShoppingBag className="w-7 h-7 text-[#d4af37]" />
                  </div>
                  <h4 className="text-lg font-serif-luxury font-bold text-white mb-1">
                    Krepšelis tuščias
                  </h4>
                  <p className="text-xs text-stone-400 max-w-xs mb-6 leading-relaxed">
                    Apsilankyk 3D Laboratorijoje, sukurk savo unikalų drabužio variantą ir įdėk į krepšelį!
                  </p>
                  <button
                    onClick={onClose}
                    className="px-5 py-2.5 luxury-button-gold text-stone-950 text-xs font-bold rounded-xl transition-all shadow-md"
                  >
                    Grįžti į parduotuvę
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {items.map((item) => (
                    <div
                      key={item.cartItemId}
                      className="p-4 rounded-2xl bg-[#0f0f14]/85 border border-stone-800/90 hover:border-[#d4af37]/35 transition-all flex gap-3.5 shadow-md"
                    >
                      {/* Product Thumbnail */}
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        referrerPolicy="no-referrer"
                        className="w-20 h-20 rounded-xl object-cover bg-stone-950 border border-stone-800 shrink-0"
                      />

                      {/* Info & Customization Details */}
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="text-sm font-serif-luxury font-bold text-white leading-tight">
                              {item.product.name}
                            </h4>
                            <button
                              onClick={() => onRemoveItem(item.cartItemId)}
                              className="text-stone-500 hover:text-rose-400 transition-colors p-0.5"
                              title="Pašalinti"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {/* 3D customization tags */}
                          <div className="flex flex-wrap items-center gap-1.5 mt-1.5 text-[11px] font-mono text-stone-400">
                            <span className="flex items-center gap-1">
                              <span
                                className="w-2.5 h-2.5 rounded-full border border-stone-600 inline-block"
                                style={{ backgroundColor: item.customization.primaryColor }}
                              />
                              <span>Spalva</span>
                            </span>
                            <span>·</span>
                            <span>Dydis: {item.customization.size}</span>
                          </div>

                          {item.customization.customText && item.customization.badgeType === 'custom' && (
                            <div className="text-[10px] font-mono text-[#f5e6b8] mt-1">
                              Monograma: „{item.customization.customText}“
                            </div>
                          )}

                          {(item.customization.seamstressNotes || item.customization.seamstressInstructions?.privateNote) && (
                            <div className="mt-2 p-2 rounded-xl bg-[#d4af37]/10 border border-[#d4af37]/25 text-[10px] text-[#f5e6b8] flex items-start gap-1.5 leading-relaxed">
                              <Scissors className="w-3.5 h-3.5 text-[#d4af37] shrink-0 mt-0.5" />
                              <div className="min-w-0">
                                <span className="font-bold text-white">Siuvėjos instrukcija:</span>{' '}
                                <span className="text-stone-300 italic">
                                  „{item.customization.seamstressNotes || item.customization.seamstressInstructions?.privateNote}“
                                </span>
                                {(item.customization.seamstressInstructions?.sleeveAdjustmentCm ?? 0) !== 0 && (
                                  <span className="block font-mono text-[9px] text-[#d4af37] mt-0.5">
                                    Rankovės: {item.customization.seamstressInstructions!.sleeveAdjustmentCm! > 0 ? `+${item.customization.seamstressInstructions!.sleeveAdjustmentCm}` : item.customization.seamstressInstructions!.sleeveAdjustmentCm} cm
                                  </span>
                                )}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Quantity & Price */}
                        <div className="flex items-center justify-between mt-3 pt-2 border-t border-stone-800/60">
                          <div className="flex items-center gap-1.5 bg-black/60 border border-stone-800 rounded-lg p-0.5">
                            <button
                              onClick={() => onUpdateQuantity(item.cartItemId, item.quantity - 1)}
                              className="w-6 h-6 flex items-center justify-center text-stone-400 hover:text-white"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="text-xs font-mono px-2 text-white tabular-nums">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => onUpdateQuantity(item.cartItemId, item.quantity + 1)}
                              className="w-6 h-6 flex items-center justify-center text-stone-400 hover:text-white"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>

                          <div className="text-sm font-mono font-bold text-[#f5e6b8] tabular-nums">
                            {(item.unitPrice * item.quantity).toFixed(2)} €
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Promo Code / Milestone Voucher Input Section */}
                  <div className="mt-2 p-4 rounded-2xl bg-black/40 border border-stone-800/80 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-stone-300 flex items-center gap-1.5">
                        <Tag className="w-3.5 h-3.5 text-[#d4af37]" />
                        <span>Pasiekimų / Lojalumo Nuolaidos Kodas</span>
                      </span>
                      {appliedPromo && (
                        <button
                          type="button"
                          onClick={() => setAppliedPromo(null)}
                          className="text-[10px] font-mono text-rose-400 hover:underline"
                        >
                          Pašalinti
                        </button>
                      )}
                    </div>

                    {appliedPromo ? (
                      <div className="p-3 rounded-xl bg-[#d4af37]/15 border border-[#d4af37]/40 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-[#d4af37]" />
                          <div>
                            <span className="font-mono font-bold text-[#f5e6b8] block">
                              {appliedPromo.code} (-{appliedPromo.percent}%)
                            </span>
                            <span className="text-[11px] text-stone-300">
                              {appliedPromo.labelLt}
                            </span>
                          </div>
                        </div>
                        <span className="font-mono font-bold text-emerald-400">
                          -{discountAmount.toFixed(2)} €
                        </span>
                      </div>
                    ) : (
                      <form onSubmit={handleApplyPromoSubmit} className="flex gap-2">
                        <input
                          type="text"
                          value={promoInput}
                          onChange={(e) => setPromoInput(e.target.value)}
                          placeholder="pvz. ATELIER5, COUTURE15"
                          className="flex-1 px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-xs font-mono uppercase text-white placeholder-stone-600 focus:outline-none focus:border-[#d4af37]"
                        />
                        <button
                          type="submit"
                          className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-bold transition cursor-pointer"
                        >
                          Taikyti
                        </button>
                      </form>
                    )}

                    {promoSuccess && (
                      <div className="text-[11px] text-emerald-400 font-mono flex items-center gap-1">
                        <Check className="w-3 h-3" />
                        <span>{promoSuccess}</span>
                      </div>
                    )}
                    {promoError && (
                      <div className="text-[11px] text-rose-400 font-mono">
                        {promoError}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}

          {step === 'checkout' && (
            <form onSubmit={handleCheckoutSubmit} className="flex flex-col gap-4">
              <div className="text-xs text-stone-400 mb-1 leading-relaxed">
                Įveskite duomenis individualios 3D konfigūracijos pagaminimui Vilniaus Atelier ceche:
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-300 mb-1">Vardas ir Pavardė</label>
                <input
                  required
                  type="text"
                  placeholder="Vardenis Pavardenis"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-black/60 border border-stone-800 rounded-xl text-xs text-white placeholder-stone-600 focus:outline-none focus:border-[#d4af37]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-stone-300 mb-1">El. paštas</label>
                  <input
                    required
                    type="email"
                    placeholder="vardas@pastas.lt"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 bg-black/60 border border-stone-800 rounded-xl text-xs text-white placeholder-stone-600 focus:outline-none focus:border-[#d4af37]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-stone-300 mb-1">Telefono nr.</label>
                  <input
                    required
                    type="tel"
                    placeholder="+370 600 00000"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-black/60 border border-stone-800 rounded-xl text-xs text-white placeholder-stone-600 focus:outline-none focus:border-[#d4af37]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-300 mb-1">Gatvė, namas, butas</label>
                <input
                  required
                  type="text"
                  placeholder="Gedimino pr. 10-4"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3 py-2 bg-black/60 border border-stone-800 rounded-xl text-xs text-white placeholder-stone-600 focus:outline-none focus:border-[#d4af37]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-stone-300 mb-1">Miestas</label>
                  <select
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-3 py-2 bg-black/60 border border-stone-800 rounded-xl text-xs text-white focus:outline-none focus:border-[#d4af37]"
                  >
                    <option value="Vilnius">Vilnius</option>
                    <option value="Kaunas">Kaunas</option>
                    <option value="Klaipėda">Klaipėda</option>
                    <option value="Šiauliai">Šiauliai</option>
                    <option value="Panevėžys">Panevėžys</option>
                    <option value="Kitas">Kitas (Lietuva / ES)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-stone-300 mb-1">Pašto kodas</label>
                  <input
                    required
                    type="text"
                    placeholder="LT-01103"
                    value={formData.postalCode}
                    onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                    className="w-full px-3 py-2 bg-black/60 border border-stone-800 rounded-xl text-xs text-white placeholder-stone-600 focus:outline-none focus:border-[#d4af37]"
                  />
                </div>
              </div>

              {/* Payment selector */}
              <div className="pt-2">
                <label className="block text-xs font-medium text-stone-300 mb-1.5">Apmokėjimo būdas</label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <label className="p-3 rounded-xl border border-stone-800 bg-stone-900/60 flex items-center gap-2 cursor-pointer hover:border-[#d4af37]/40">
                    <input
                      type="radio"
                      name="payment"
                      checked={formData.paymentMethod === 'card'}
                      onChange={() => setFormData({ ...formData, paymentMethod: 'card' })}
                      className="accent-[#d4af37]"
                    />
                    <span className="text-stone-200">Kortelė / Apple Pay</span>
                  </label>
                  <label className="p-3 rounded-xl border border-stone-800 bg-stone-900/60 flex items-center gap-2 cursor-pointer hover:border-[#d4af37]/40">
                    <input
                      type="radio"
                      name="payment"
                      checked={formData.paymentMethod === 'cod'}
                      onChange={() => setFormData({ ...formData, paymentMethod: 'cod' })}
                      className="accent-[#d4af37]"
                    />
                    <span className="text-stone-200">Mokėjimas kurjeriui</span>
                  </label>
                </div>
              </div>

              <div className="p-3.5 bg-black/50 rounded-xl border border-stone-800 text-[11px] text-stone-400 font-mono mt-2 space-y-1">
                <div className="flex justify-between">
                  <span>Mokėtina suma:</span>
                  <strong className="text-[#f5e6b8]">{total} €</strong>
                </div>
                <div>Pristatymo terminas: 1–2 d.d. per Omniva / DPD kurjerį.</div>
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setStep('cart')}
                  className="px-4 py-3 border border-stone-800 text-stone-300 rounded-xl text-xs font-medium hover:bg-stone-900"
                >
                  Atgal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 luxury-button-gold text-stone-950 font-bold rounded-xl text-xs transition-colors shadow-lg"
                >
                  Patvirtinti ir Užsakyti ({total} €)
                </button>
              </div>
            </form>
          )}

          {step === 'confirmed' && (
            <div className="py-8 flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/15 border border-emerald-500/35 flex items-center justify-center text-emerald-400 mb-4 shadow-inner">
                <Check className="w-8 h-8" />
              </div>

              <h4 className="text-xl font-serif-luxury font-bold text-white mb-1">
                Užsakymas sėkmingai priimtas!
              </h4>
              <p className="text-xs text-stone-400 max-w-xs mb-5 leading-relaxed">
                Tavo 3D modelio parametrai perduoti į Vilniaus Atelier cechą lazeriniam kirpimui.
              </p>

              <div className="w-full p-4 rounded-2xl bg-black/60 border border-stone-800 text-xs font-mono text-left mb-6 space-y-2">
                <div className="flex justify-between border-b border-stone-800/80 pb-2">
                  <span className="text-stone-500">Užsakymo Nr.:</span>
                  <span className="text-[#f5e6b8] font-bold">{orderNumber}</span>
                </div>
                <div className="flex justify-between border-b border-stone-800/80 pb-2">
                  <span className="text-stone-500">Gavėjas:</span>
                  <span className="text-stone-200">{formData.name || 'Pirkėjas'} · {formData.city}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Būsena:</span>
                  <span className="text-emerald-400 font-semibold">Ruošiama gamybai · Lazerinis kirpimas</span>
                </div>
              </div>

              <div className="w-full flex flex-col gap-2.5">
                {onOpenOrderTracking && (
                  <button
                    type="button"
                    onClick={() => {
                      onOpenOrderTracking(orderNumber);
                      onClearCart();
                      setStep('cart');
                      onClose();
                    }}
                    className="w-full py-3 luxury-button-gold text-stone-950 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg cursor-pointer"
                  >
                    <span>Sekti Užsakymo Būseną Realiu Laiku</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleFinish}
                  className="w-full py-2.5 bg-stone-900 border border-stone-800 text-stone-300 hover:text-white font-medium text-xs rounded-xl hover:bg-stone-800 transition-colors cursor-pointer"
                >
                  Grįžti į pagrindinį puslapį
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Drawer Footer (if still in cart step) */}
        {step === 'cart' && items.length > 0 && (
          <div className="p-6 border-t border-stone-800 bg-black/50 flex flex-col gap-3">
            <div className="flex justify-between text-xs text-stone-400">
              <span>Tarpinė suma</span>
              <span className="font-mono tabular-nums text-stone-200">{subtotal.toFixed(2)} €</span>
            </div>

            {appliedPromo && (
              <div className="flex justify-between text-xs text-emerald-400 font-mono">
                <span>Nuolaida ({appliedPromo.code})</span>
                <span>-{discountAmount.toFixed(2)} €</span>
              </div>
            )}

            <div className="flex justify-between text-xs text-stone-400">
              <span>Pristatymas (Lietuva)</span>
              <span className="font-mono tabular-nums text-stone-200">
                {shipping === 0 ? 'Nemokamas' : `${shipping.toFixed(2)} €`}
              </span>
            </div>

            <div className="flex justify-between text-sm font-semibold text-white pt-2 border-t border-stone-800">
              <span className="font-serif-luxury font-bold text-base">Iš viso</span>
              <span className="font-mono tabular-nums text-[#f5e6b8] text-lg font-bold">{total.toFixed(2)} €</span>
            </div>

            <button
              onClick={() => setStep('checkout')}
              className="w-full py-3.5 luxury-button-gold text-stone-950 font-bold text-xs rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 mt-1 cursor-pointer"
            >
              <span>Pereiti prie apmokėjimo</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
