import React, { useState } from 'react';
import {
  User as UserIcon,
  X,
  Mail,
  Lock,
  LogOut,
  Sparkles,
  Heart,
  Eye,
  ShoppingBag,
  Trash2,
  Calendar,
  CloudCheck,
  ShieldCheck,
  ArrowRight,
  Layers,
  Truck,
  FileDown,
  Award,
  Crown,
  Tag,
} from 'lucide-react';
import { WishlistItem, Product, CustomizationState, FabricMaterial } from '../../types/clothing';
import {
  UserProfileData,
  setPersistedUser,
  signInWithGoogle,
  logOutUser,
  syncWishlistItemToCloud,
} from '../../services/firebase';
import { LoyaltyPointsTracker } from './LoyaltyPointsTracker';
import { StyleMilestones } from './StyleMilestones';
import { exportWishlistToPdf } from '../../utils/wishlistPdfExport';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfileData | null;
  onUserChange: (user: UserProfileData | null) => void;
  wishlistItems: WishlistItem[];
  onRemoveWishlistItem: (id: string) => void;
  onLoadInLab: (item: WishlistItem) => void;
  onAddToCart: (
    product: Product,
    customization: CustomizationState,
    fabric: FabricMaterial,
    price: number
  ) => void;
  onOpenOrderTracking?: () => void;
  onApplyPromoCodeToCart?: (code: string) => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onUserChange,
  wishlistItems,
  onRemoveWishlistItem,
  onLoadInLab,
  onAddToCart,
  onOpenOrderTracking,
  onApplyPromoCodeToCart,
}) => {
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [pdfSuccessMessage, setPdfSuccessMessage] = useState<string | null>(null);

  // Unified luxury tab navigation
  const [activeTab, setActiveTab] = useState<'milestones' | 'wishlist' | 'loyalty' | 'auth'>(
    currentUser ? 'milestones' : wishlistItems.length > 0 ? 'wishlist' : 'auth'
  );

  const handleExportPdf = async () => {
    if (wishlistItems.length === 0) return;
    setIsExportingPdf(true);
    setPdfSuccessMessage(null);
    try {
      await exportWishlistToPdf(
        wishlistItems,
        currentUser?.displayName || currentUser?.email?.split('@')[0] || 'Flipukas Kūrėjas'
      );
      setPdfSuccessMessage('PDF kolekcija sėkmingai paruošta ir atsiųsta!');
      setTimeout(() => setPdfSuccessMessage(null), 4000);
    } catch (err) {
      console.error('PDF export error:', err);
    } finally {
      setIsExportingPdf(false);
    }
  };

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const user = await signInWithGoogle();
      onUserChange(user);
      if (wishlistItems.length > 0) {
        wishlistItems.forEach((item) => {
          syncWishlistItemToCloud(user.uid, item).catch((err) => {
            console.warn('Initial wishlist sync failed:', err);
          });
        });
      }
      setActiveTab('milestones');
    } catch (err: unknown) {
      console.error('Google sign-in error:', err);
      setError(err instanceof Error ? err.message : 'Nepavyko prisijungti su Google');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    setTimeout(() => {
      const user: UserProfileData = {
        uid: `usr-${Date.now()}`,
        email: email || 'pirkejas@flipukas.lt',
        displayName: name || email.split('@')[0] || 'Mados Kūrėjas',
        photoURL: null,
        createdAt: Date.now(),
      };
      setPersistedUser(user);
      onUserChange(user);
      setIsLoading(false);
      setActiveTab('milestones');
    }, 400);
  };

  const handleDemoSignIn = () => {
    setIsLoading(true);
    setTimeout(() => {
      const user: UserProfileData = {
        uid: `demo-usr-999`,
        email: 'gintaras@flipukas.lt',
        displayName: 'Gintaras K.',
        photoURL: null,
        createdAt: Date.now(),
      };
      setPersistedUser(user);
      onUserChange(user);
      setIsLoading(false);
      setActiveTab('milestones');
    }, 300);
  };

  const handleLogout = async () => {
    try {
      await logOutUser();
    } catch {
      // ignore
    }
    setPersistedUser(null);
    onUserChange(null);
    setActiveTab('auth');
  };

  const renderGallerySection = () => (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-stone-800">
        <div>
          <div className="flex items-center gap-2">
            <h4 className="font-serif-luxury font-bold text-lg text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#d4af37]" />
              <span>Mano 3D Drabužių Galerija</span>
            </h4>
            <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-stone-900 text-[#f5e6b8] border border-stone-800">
              {wishlistItems.length} modeliai
            </span>
          </div>
          <p className="text-xs text-stone-300 mt-0.5">
            Tavo sukurtos ir išsaugotos 3D konfigūracijos su aukštos raiškos peržiūros kadrais
          </p>
        </div>

        {/* PDF Export Button */}
        {wishlistItems.length > 0 && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExportPdf}
              disabled={isExportingPdf}
              className="px-4 py-2 rounded-xl border border-[#d4af37]/50 bg-[#d4af37]/10 hover:bg-[#d4af37]/20 text-[#f5e6b8] text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-sm active:scale-95 disabled:opacity-50"
              title="Atsisiųsti PDF suvestinę dalinimuisi su stilistu ar draugais"
            >
              <FileDown className="w-4 h-4 text-[#d4af37]" />
              <span>{isExportingPdf ? 'Generuojama...' : 'Eksportuoti į PDF'}</span>
            </button>
          </div>
        )}
      </div>

      {/* PDF Export success alert */}
      {pdfSuccessMessage && (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 animate-fadeIn">
          <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{pdfSuccessMessage}</span>
        </div>
      )}

      {wishlistItems.length === 0 ? (
        <div className="py-14 rounded-3xl border border-stone-800 bg-[#0e0e13]/80 text-center flex flex-col items-center justify-center p-6">
          <div className="w-14 h-14 rounded-2xl bg-stone-900 border border-stone-800 flex items-center justify-center text-stone-500 mb-3 shadow-inner">
            <Layers className="w-6 h-6 text-[#d4af37]" />
          </div>
          <h5 className="font-serif-luxury font-bold text-base text-white mb-1">
            Galerijoje dar nėra išsaugotų modelių
          </h5>
          <p className="text-xs text-stone-400 max-w-sm mb-5 leading-relaxed">
            Sukurk savo drabužį 3D laboratorijoje ir spustelk „Į Wishlist“ – jis automatiškai atsiras čia bei padidins tavo Stiliaus Pasiekimų lygį!
          </p>
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl luxury-button-gold text-stone-950 font-bold text-xs transition cursor-pointer shadow-lg"
          >
            Grįžti į 3D Laboratoriją
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {wishlistItems.map((item) => (
            <div
              key={item.id}
              className="rounded-2xl border border-stone-800/90 bg-[#121217]/90 hover:border-[#d4af37]/40 overflow-hidden flex flex-col justify-between group transition-all duration-300 shadow-md hover:shadow-xl"
            >
              {/* 3D Garment Thumbnail Snapshot */}
              <div
                className="relative h-44 overflow-hidden flex items-center justify-center p-3 border-b border-stone-800/80 bg-stone-950/60"
                style={{ backgroundColor: `${item.customization.primaryColor}18` }}
              >
                {item.snapshotUrl ? (
                  <img
                    src={item.snapshotUrl}
                    alt={item.title}
                    className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-center">
                    <div
                      className="w-12 h-12 rounded-2xl border border-white/20 shadow-lg mb-2"
                      style={{ backgroundColor: item.customization.primaryColor }}
                    />
                    <span className="text-xs font-serif-luxury font-bold text-white">
                      {item.product.name}
                    </span>
                  </div>
                )}

                {/* Badge tags */}
                <div className="absolute top-2 left-2">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-black/85 text-[#f5e6b8] border border-[#d4af37]/30 backdrop-blur-md">
                    {item.fabric.nameLt}
                  </span>
                </div>

                <div className="absolute top-2 right-2">
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-black/85 text-white border border-stone-700">
                    {item.customization.size}
                  </span>
                </div>
              </div>

              {/* Card Details */}
              <div className="p-4 flex flex-col gap-2">
                <div>
                  <h5 className="font-serif-luxury font-bold text-sm text-white truncate">
                    {item.title}
                  </h5>
                  <div className="flex items-center justify-between text-xs text-stone-300 mt-0.5">
                    <span>{item.product.name}</span>
                    <span className="font-mono font-bold text-[#f5e6b8] tabular-nums">
                      {item.price.toFixed(2)} €
                    </span>
                  </div>
                </div>

                {/* Quick Actions Row */}
                <div className="grid grid-cols-3 gap-1.5 pt-2.5 border-t border-stone-800/80">
                  <button
                    onClick={() => {
                      onLoadInLab(item);
                      onClose();
                    }}
                    title="Užkrauti į 3D laboratoriją"
                    className="py-1.5 px-2 rounded-lg bg-stone-900 hover:bg-stone-800 text-stone-200 hover:text-white border border-stone-700/80 text-[11px] font-medium transition flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Eye className="w-3 h-3 text-[#d4af37]" />
                    <span>3D Lab</span>
                  </button>

                  <button
                    onClick={() => {
                      onAddToCart(item.product, item.customization, item.fabric, item.price);
                      onClose();
                    }}
                    title="Pirkti"
                    className="py-1.5 px-2 rounded-lg bg-[#d4af37] hover:bg-[#e6ca85] text-stone-950 text-[11px] font-bold transition flex items-center justify-center gap-1 cursor-pointer shadow-sm"
                  >
                    <ShoppingBag className="w-3 h-3" />
                    <span>Pirkti</span>
                  </button>

                  <button
                    onClick={() => onRemoveWishlistItem(item.id)}
                    title="Ištrinti iš galerijos"
                    className="py-1.5 px-2 rounded-lg bg-stone-900 hover:bg-stone-800 text-stone-400 hover:text-rose-400 border border-stone-800 text-[11px] transition flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-neutral-950/85 backdrop-blur-md transition-opacity"
      />

      {/* Luxury Modal Container */}
      <div className="relative w-full max-w-4xl bg-gradient-to-br from-[#15151c] via-[#101015] to-[#0b0b0f] border border-[#d4af37]/30 rounded-3xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-5 border-b border-stone-800 flex items-center justify-between gap-4 bg-black/40">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#d4af37]/20 to-amber-700/20 border border-[#d4af37]/40 flex items-center justify-center text-[#d4af37] shadow-inner">
              <Crown className="w-5 h-5 text-[#d4af37]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono tracking-widest uppercase text-[#d4af37] font-semibold">
                  Atelier Profilis & Mados Rezidencija
                </span>
                {currentUser && (
                  <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Sinchronizuota
                  </span>
                )}
              </div>
              <h3 className="font-serif-luxury font-bold text-xl text-white">
                {currentUser ? `${currentUser.displayName || currentUser.email}` : 'Flipukas Atelier Paskyra'}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {currentUser && (
              <button
                onClick={handleLogout}
                className="px-3 py-1.5 rounded-xl border border-stone-800 bg-stone-900 hover:bg-stone-800 text-stone-300 hover:text-white text-xs font-medium transition flex items-center gap-1.5 cursor-pointer"
                title="Atsijungti"
              >
                <LogOut className="w-3.5 h-3.5 text-stone-400" />
                <span className="hidden sm:inline">Atsijungti</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-stone-400 hover:text-white hover:bg-stone-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Luxury Tab Navigation Strip */}
        <div className="flex border-b border-stone-800 bg-black/50 px-6 gap-2 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('milestones')}
            className={`py-3.5 px-3.5 text-xs font-semibold border-b-2 transition flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              activeTab === 'milestones'
                ? 'border-[#d4af37] text-[#f5e6b8]'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <Award className="w-4 h-4 text-[#d4af37]" />
            <span>Stiliaus Pasiekimai & Badges</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('wishlist')}
            className={`py-3.5 px-3.5 text-xs font-semibold border-b-2 transition flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              activeTab === 'wishlist'
                ? 'border-[#d4af37] text-[#f5e6b8]'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <Heart className="w-4 h-4 text-rose-400" />
            <span>3D Spinta & PDF ({wishlistItems.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('loyalty')}
            className={`py-3.5 px-3.5 text-xs font-semibold border-b-2 transition flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              activeTab === 'loyalty'
                ? 'border-[#d4af37] text-[#f5e6b8]'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <Sparkles className="w-4 h-4 text-[#d4af37]" />
            <span>Lojalumas & Išlaidos (Statusas)</span>
          </button>

          {!currentUser && (
            <button
              type="button"
              onClick={() => setActiveTab('auth')}
              className={`py-3.5 px-3.5 text-xs font-semibold border-b-2 transition flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                activeTab === 'auth'
                  ? 'border-[#d4af37] text-[#f5e6b8]'
                  : 'border-transparent text-stone-400 hover:text-stone-200'
              }`}
            >
              <UserIcon className="w-4 h-4" />
              <span>Prisijungimas</span>
            </button>
          )}
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
          {activeTab === 'milestones' ? (
            <StyleMilestones
              userId={currentUser?.uid || 'guest'}
              savedDesignsCount={wishlistItems.length}
              onOpenStyleLab={onClose}
              onApplyPromoCodeToCart={(code) => {
                if (onApplyPromoCodeToCart) {
                  onApplyPromoCodeToCart(code);
                  onClose();
                }
              }}
            />
          ) : activeTab === 'wishlist' ? (
            <div className="flex flex-col gap-5">
              {!currentUser && (
                <div className="p-3.5 rounded-2xl bg-black/40 border border-stone-800 text-xs text-stone-300 flex items-center justify-between">
                  <span>Svečio režimas: išsaugoti modeliai pasiekiami šiame įrenginyje.</span>
                  <button
                    type="button"
                    onClick={() => setActiveTab('auth')}
                    className="px-3.5 py-1.5 luxury-button-gold text-stone-950 font-bold rounded-lg text-xs cursor-pointer"
                  >
                    Sinchronizuoti į Debesį
                  </button>
                </div>
              )}
              {renderGallerySection()}
            </div>
          ) : activeTab === 'loyalty' ? (
            <div className="flex flex-col gap-5">
              {!currentUser && (
                <div className="p-3.5 rounded-2xl bg-[#d4af37]/10 border border-[#d4af37]/25 text-xs text-[#f5e6b8] flex items-center justify-between">
                  <span>Prisijunkite prie paskyros, kad lojalumo taškai ir išlaidų statusas būtų sinchronizuojami visuose įrenginiuose!</span>
                  <button
                    type="button"
                    onClick={() => setActiveTab('auth')}
                    className="px-3.5 py-1.5 luxury-button-gold text-stone-950 font-bold rounded-lg text-xs cursor-pointer"
                  >
                    Prisijungti
                  </button>
                </div>
              )}
              <LoyaltyPointsTracker
                userId={currentUser?.uid || 'guest'}
                userName={currentUser?.displayName || 'Kūrėjas'}
                onApplyPromoCodeToCart={(code) => {
                  if (onApplyPromoCodeToCart) {
                    onApplyPromoCodeToCart(code);
                    onClose();
                  }
                }}
              />
            </div>
          ) : (
            /* Auth Login / Register Form */
            <div className="max-w-md mx-auto w-full py-4 flex flex-col gap-5">
              <div className="text-center">
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#d4af37] font-semibold block mb-1">
                  Atelier Cloud Sync
                </span>
                <h4 className="text-2xl font-serif-luxury font-bold text-white">
                  {authMode === 'login' ? 'Prisijungti prie Flipukas Atelier' : 'Sukurti naują paskyrą'}
                </h4>
                <p className="text-xs text-stone-300 mt-1">
                  Išsaugok savo individualius 3D kirpimus, pelnyk virtualius ženklelius ir nuolaidas.
                </p>
              </div>

              {/* Google Sign-In */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                className="w-full py-3 px-4 rounded-xl border border-stone-700 bg-stone-900 hover:bg-stone-800 text-white font-medium text-xs transition flex items-center justify-center gap-2.5 cursor-pointer shadow-sm active:scale-98"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.16 0 9.94 0 12s.45 3.84 1.25 5.42l4.03-3.15z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                  />
                </svg>
                <span>Prisijungti su Google paskyra</span>
              </button>

              {/* Demo 1-Click Fast Sign-In */}
              <button
                type="button"
                onClick={handleDemoSignIn}
                disabled={isLoading}
                className="w-full py-2.5 px-4 rounded-xl border border-[#d4af37]/40 bg-[#d4af37]/10 hover:bg-[#d4af37]/20 text-[#f5e6b8] font-bold text-xs transition flex items-center justify-center gap-2 cursor-pointer shadow-sm active:scale-98"
              >
                <Sparkles className="w-4 h-4 text-[#d4af37]" />
                <span>Greitas demonstracinis prisijungimas (1 paspaudimu)</span>
              </button>

              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-stone-800" />
                <span className="text-[11px] font-mono text-stone-500 uppercase">arba el. paštu</span>
                <div className="flex-1 h-px bg-stone-800" />
              </div>

              <form onSubmit={handleLoginSubmit} className="flex flex-col gap-3.5">
                {authMode === 'register' && (
                  <div>
                    <label className="text-xs text-stone-300 block mb-1">Vardas:</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="pvz. Jonas Kazlauskas"
                      className="w-full bg-black/60 text-xs text-stone-100 px-3.5 py-2.5 rounded-xl border border-stone-800 focus:outline-none focus:border-[#d4af37]"
                    />
                  </div>
                )}

                <div>
                  <label className="text-xs text-stone-300 block mb-1">El. paštas:</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-stone-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="tavo.pastas@pavyzdys.lt"
                      className="w-full bg-black/60 text-xs text-stone-100 pl-10 pr-3.5 py-2.5 rounded-xl border border-stone-800 focus:outline-none focus:border-[#d4af37]"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs text-stone-300 block mb-1">Slaptažodis:</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-stone-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-black/60 text-xs text-stone-100 pl-10 pr-3.5 py-2.5 rounded-xl border border-stone-800 focus:outline-none focus:border-[#d4af37]"
                    />
                  </div>
                </div>

                {error && (
                  <div className="text-xs text-rose-400 bg-rose-500/10 p-2.5 rounded-xl border border-rose-500/30">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 px-4 rounded-xl font-bold text-xs luxury-button-gold text-stone-950 transition flex items-center justify-center gap-2 cursor-pointer shadow-lg active:scale-98 mt-2"
                >
                  <span>{authMode === 'login' ? 'Prisijungti' : 'Sukurti paskyrą'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
                    className="text-xs text-stone-400 hover:text-[#d4af37] transition"
                  >
                    {authMode === 'login'
                      ? 'Neturi paskyros? Užsiregistruok čia'
                      : 'Jau turi paskyrą? Prisijunk čia'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-stone-800 bg-black/40 flex items-center justify-between text-xs text-stone-400">
          <span>
            {currentUser
              ? 'Prisijungta prie Flipukas Atelier • Multi-Device Debesis'
              : 'Saugu & Greita • Nereikalaujama kreditinės kortelės'}
          </span>
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
