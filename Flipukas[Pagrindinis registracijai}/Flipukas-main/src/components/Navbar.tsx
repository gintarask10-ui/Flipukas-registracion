import React from 'react';
import { ShoppingBag, Heart, Scale, User, Sparkles, Bot } from 'lucide-react';
import { UserProfileData } from '../services/firebase';

interface NavbarProps {
  cartCount: number;
  wishlistCount: number;
  currentUser?: UserProfileData | null;
  onOpenCart: () => void;
  onOpenWishlist: () => void;
  onOpenCompare: () => void;
  onNavigateLab: () => void;
  onOpenProfile?: () => void;
  onOpenAIReview?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  cartCount,
  wishlistCount,
  currentUser,
  onOpenCart,
  onOpenWishlist,
  onOpenCompare,
  onNavigateLab,
  onOpenProfile,
  onOpenAIReview,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full bg-[#0c0c10]/90 backdrop-blur-xl border-b border-[#d4af37]/20 shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 sm:gap-8 px-4 sm:px-6 lg:px-8 h-18">
        {/* Zone 1: Luxury wordmark */}
        <a
          href="#"
          className="flex items-center gap-2 group whitespace-nowrap shrink-0"
        >
          <span className="text-2xl sm:text-3xl font-serif-luxury font-bold tracking-tight text-white group-hover:text-[#f5e6b8] transition-colors">
            Flipukas
          </span>
          <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#d4af37] px-1.5 py-0.5 rounded border border-[#d4af37]/30 bg-[#d4af37]/10">
            Atelier
          </span>
        </a>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden lg:flex items-center gap-7 text-[11px] uppercase tracking-[0.2em] font-mono font-medium text-stone-300">
          <a href="#kolekcija" className="hover:text-[#f5e6b8] transition-colors whitespace-nowrap shrink-0">
            Kolekcija
          </a>
          <button
            onClick={onNavigateLab}
            className="hover:text-[#f5e6b8] transition-colors whitespace-nowrap shrink-0 text-left cursor-pointer"
          >
            3D Laboratorija
          </button>
          <button
            onClick={onOpenCompare}
            className="hover:text-[#f5e6b8] transition-colors whitespace-nowrap shrink-0 text-left flex items-center gap-1.5 text-stone-200 cursor-pointer"
          >
            <Scale className="w-3.5 h-3.5 text-[#d4af37]" />
            <span>Palyginimas</span>
          </button>
          <a href="#technologijos" className="hover:text-[#f5e6b8] transition-colors whitespace-nowrap shrink-0">
            2D Makro Pynimas
          </a>
          <a href="#apie-mus" className="hover:text-[#f5e6b8] transition-colors whitespace-nowrap shrink-0">
            Apie Mus
          </a>
        </nav>

        {/* Zone 3: Actions (AI Review, Compare, Profile, Wishlist, Cart) */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* AI Project Dossier for other AI */}
          {onOpenAIReview && (
            <button
              onClick={onOpenAIReview}
              title="Peržiūrėti ir nukopijuoti išsamų projekto dosjė kitam AI (ChatGPT, Claude, Gemini)"
              className="px-2.5 sm:px-3 py-2 text-xs font-medium text-[#d4af37] bg-[#d4af37]/10 border border-[#d4af37]/40 rounded-xl hover:bg-[#d4af37]/20 hover:border-[#d4af37] transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <Bot className="w-3.5 h-3.5" />
              <span className="hidden sm:inline font-mono font-bold tracking-wider">AI Dosjė</span>
            </button>
          )}

          {/* Side-by-Side Compare */}
          <button
            onClick={onOpenCompare}
            title="Palyginti 2 drabužių modelius vienas šalia kito"
            className="px-2.5 sm:px-3 py-2 text-xs font-medium text-stone-300 bg-stone-900/80 border border-stone-800 rounded-xl hover:bg-stone-800 hover:text-white hover:border-[#d4af37]/40 transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <Scale className="w-3.5 h-3.5 text-[#d4af37]" />
            <span className="hidden sm:inline font-serif-luxury font-semibold">Palyginti</span>
          </button>

          {/* User Profile CTA */}
          <button
            onClick={onOpenProfile}
            aria-label="Atidaryti vartotojo profilį"
            title={
              currentUser
                ? `Prisijungta: ${currentUser.displayName || currentUser.email}`
                : 'Prisijungti prie asmeninės 3D paskyros'
            }
            className="relative px-2.5 sm:px-3.5 py-2 text-xs font-medium text-stone-200 bg-stone-900/80 border border-stone-800 rounded-xl hover:bg-stone-800 hover:border-[#d4af37]/50 transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            {currentUser?.photoURL ? (
              <img
                src={currentUser.photoURL}
                alt="Avatar"
                className="w-3.5 h-3.5 rounded-full object-cover"
              />
            ) : (
              <User className={`w-3.5 h-3.5 ${currentUser ? 'text-[#d4af37]' : 'text-stone-400'}`} />
            )}
            <span className="hidden sm:inline truncate max-w-[85px] font-serif-luxury font-semibold">
              {currentUser ? currentUser.displayName?.split(' ')[0] || 'Atelier' : 'Paskyra'}
            </span>
            {currentUser && (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" title="Debesis aktyvus" />
            )}
          </button>

          {/* Wishlist CTA */}
          <button
            onClick={onOpenWishlist}
            aria-label="Atidaryti Wishlist"
            title="Išsaugoti 3D drabužių modeliai (Wishlist)"
            className="relative px-2.5 sm:px-3.5 py-2 text-xs font-medium text-stone-200 bg-stone-900/80 border border-stone-800 rounded-xl hover:bg-stone-800 hover:border-[#d4af37]/50 transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-500/20" />
            <span className="hidden sm:inline font-serif-luxury font-semibold">Wishlist</span>
            {wishlistCount > 0 && (
              <span className="font-mono text-[10px] bg-rose-500/90 text-white font-bold px-1.5 py-0.2 rounded-full">
                {wishlistCount}
              </span>
            )}
          </button>

          {/* Cart CTA */}
          <button
            onClick={onOpenCart}
            aria-label="Atidaryti krepšelį"
            className="relative px-3 sm:px-3.5 py-2 text-xs font-medium text-stone-950 luxury-button-gold rounded-xl transition-all flex items-center gap-2 whitespace-nowrap shrink-0 cursor-pointer shadow-md"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span className="hidden sm:inline font-bold">Krepšelis</span>
            {cartCount > 0 && (
              <span className="font-mono text-[10px] bg-black text-[#f5e6b8] font-bold px-1.5 py-0.2 rounded-full">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
