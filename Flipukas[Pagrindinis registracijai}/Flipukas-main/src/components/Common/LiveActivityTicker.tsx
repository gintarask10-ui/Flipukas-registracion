import React, { useState, useEffect } from 'react';
import { Sparkles, ShoppingBag, Heart, Flame, X, CheckCircle2 } from 'lucide-react';

interface ActivityItem {
  id: string;
  name: string;
  city: string;
  actionLt: string;
  timeAgoLt: string;
  iconType: 'purchase' | 'wishlist' | 'fomo';
}

const SAMPLE_ACTIVITIES: ActivityItem[] = [
  {
    id: 'act-1',
    name: 'Tomas',
    city: 'Vilnius',
    actionLt: 'ką tik užsakė „Aero-Shift“ su autorine aukso monograma',
    timeAgoLt: 'prieš 2 min.',
    iconType: 'purchase',
  },
  {
    id: 'act-2',
    name: 'Lina',
    city: 'Kaunas',
    actionLt: 'ką tik išsaugojo Mulberry Šilko 22 Momme modelį į Wishlist',
    timeAgoLt: 'prieš 5 min.',
    iconType: 'wishlist',
  },
  {
    id: 'act-3',
    name: 'Atelier Sandėlis',
    city: 'Vilnius',
    actionLt: 'Liko tik 3 vnt. Selvedge Twill Džinso partijoje!',
    timeAgoLt: 'Ką tik',
    iconType: 'fomo',
  },
  {
    id: 'act-4',
    name: 'Mantas',
    city: 'Klaipėda',
    actionLt: 'pritaikė Kinetix-01 Bioninius Kedus su sidabro apkaustais',
    timeAgoLt: 'prieš 8 min.',
    iconType: 'purchase',
  },
  {
    id: 'act-5',
    name: 'Eglė',
    city: 'Vilnius',
    actionLt: 'atrakino „Stiliaus Architekto“ pasiekimą ir 10% nuolaidos kodą',
    timeAgoLt: 'prieš 12 min.',
    iconType: 'wishlist',
  },
];

export const LiveActivityTicker: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    if (isDismissed) return;

    const interval = setInterval(() => {
      setIsVisible(false);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % SAMPLE_ACTIVITIES.length);
        setIsVisible(true);
      }, 500);
    }, 7000);

    return () => clearInterval(interval);
  }, [isDismissed]);

  if (isDismissed) return null;

  const current = SAMPLE_ACTIVITIES[currentIndex];

  const getIcon = () => {
    switch (current.iconType) {
      case 'purchase':
        return <ShoppingBag className="w-3.5 h-3.5 text-emerald-400" />;
      case 'wishlist':
        return <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-500/30" />;
      case 'fomo':
        return <Flame className="w-3.5 h-3.5 text-amber-400 animate-pulse" />;
      default:
        return <Sparkles className="w-3.5 h-3.5 text-[#d4af37]" />;
    }
  };

  return (
    <div
      className={`fixed bottom-6 left-6 z-40 max-w-sm transition-all duration-500 transform ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0 pointer-events-none'
      }`}
    >
      <div className="p-3.5 rounded-2xl bg-gradient-to-r from-[#14141c]/95 to-[#0e0e13]/95 border border-[#d4af37]/30 shadow-2xl backdrop-blur-xl flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-black/60 border border-stone-800 flex items-center justify-center shrink-0 shadow-inner">
            {getIcon()}
          </div>
          <div>
            <div className="text-[11px] text-stone-200 leading-tight">
              <strong className="text-white font-medium">{current.name}</strong>{' '}
              <span className="text-stone-400 font-mono text-[10px]">({current.city})</span>{' '}
              {current.actionLt}
            </div>
            <div className="text-[9px] font-mono text-[#d4af37] mt-0.5">
              {current.timeAgoLt} · Realaus laiko aktyvumas
            </div>
          </div>
        </div>

        <button
          onClick={() => setIsDismissed(true)}
          className="text-stone-500 hover:text-stone-300 p-1 rounded-lg transition shrink-0"
          title="Paslėpti pranešimus"
        >
          <X className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};
