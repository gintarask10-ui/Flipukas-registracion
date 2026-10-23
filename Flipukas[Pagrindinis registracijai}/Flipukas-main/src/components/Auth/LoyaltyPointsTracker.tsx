import React, { useState, useEffect } from 'react';
import {
  Award,
  Crown,
  Gem,
  Sparkles,
  ChevronRight,
  Copy,
  Check,
  TrendingUp,
  ShoppingBag,
  Star,
  Gift,
  Clock,
  ArrowUpRight,
  ShieldCheck,
  Percent,
  Wallet,
  Tag,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { UserLoyaltyState, LoyaltyTransaction, TierConfig } from '../../types/loyalty';
import {
  getLoyaltyState,
  awardLoyaltyPoints,
  recordUserPurchase,
  TIERS_CONFIG,
} from '../../utils/loyaltyStorage';

interface LoyaltyPointsTrackerProps {
  userId?: string;
  userName?: string;
  onNavigateToReviews?: () => void;
  onNavigateToShop?: () => void;
  onApplyPromoCodeToCart?: (code: string) => void;
}

export const LoyaltyPointsTracker: React.FC<LoyaltyPointsTrackerProps> = ({
  userId,
  userName = 'Kūrėjas',
  onNavigateToReviews,
  onNavigateToShop,
  onApplyPromoCodeToCart,
}) => {
  const [loyaltyState, setLoyaltyState] = useState<UserLoyaltyState>(() => getLoyaltyState(userId));
  const [copiedCode, setCopiedCode] = useState(false);
  const [appliedPromo, setAppliedPromo] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [rewardToast, setRewardToast] = useState<string | null>(null);

  // Sync state whenever spending or points update
  useEffect(() => {
    setLoyaltyState(getLoyaltyState(userId));

    const handleUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<UserLoyaltyState>;
      if (customEvent.detail) {
        setLoyaltyState(customEvent.detail);
      } else {
        setLoyaltyState(getLoyaltyState(userId));
      }
    };

    window.addEventListener('flipukas-loyalty-updated', handleUpdate);
    return () => window.removeEventListener('flipukas-loyalty-updated', handleUpdate);
  }, [userId]);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleApplyToCart = (code: string) => {
    if (onApplyPromoCodeToCart) {
      onApplyPromoCodeToCart(code);
      setAppliedPromo(true);
      setRewardToast(`Kuponas „${code}“ pritaikytas tavo krepšeliui!`);
      setTimeout(() => {
        setAppliedPromo(false);
        setRewardToast(null);
      }, 3500);
    } else {
      handleCopyCode(code);
    }
  };

  const handleSimulateSpending = (amountEur: number) => {
    const orderNo = `SIM-${Math.floor(100000 + Math.random() * 900000)}`;
    const updated = recordUserPurchase(
      userId,
      amountEur,
      orderNo,
      '3D Užsakymas (Modelio Simuliacija)'
    );
    setLoyaltyState(updated);
    setRewardToast(`+${amountEur.toFixed(2)} € pirkimas įskaitytas (+${Math.round(amountEur * 10)} tšk.)!`);
    setTimeout(() => setRewardToast(null), 3500);

    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#fbbf24', '#f59e0b', '#38bdf8', '#34d399'],
      });
    } catch {
      // ignore
    }
  };

  const {
    points,
    totalSpentEur,
    currentTier,
    nextTier,
    pointsToNextTier,
    spendingToNextTierEur,
    progressPercent,
    spendingProgressPercent,
    transactions,
  } = loyaltyState;

  const getTierIcon = (id: string) => {
    switch (id) {
      case 'diamond':
        return <Gem className="w-5 h-5 text-cyan-300" />;
      case 'gold':
        return <Crown className="w-5 h-5 text-amber-300" />;
      case 'silver':
        return <Award className="w-5 h-5 text-slate-200" />;
      default:
        return <ShieldCheck className="w-5 h-5 text-amber-400" />;
    }
  };

  return (
    <div className="relative rounded-3xl border border-neutral-800 bg-gradient-to-b from-neutral-900/90 to-neutral-950 p-5 sm:p-6 shadow-xl overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute -top-16 -right-16 w-52 h-52 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header Row */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-neutral-800/80">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-amber-400/10 text-amber-400 border border-amber-400/30">
              <Sparkles className="w-3 h-3 text-amber-400 animate-spin" style={{ animationDuration: '6s' }} />
              Flipukas Atelier Lojalumo Programa
            </span>
            <span className="text-neutral-500 text-xs">•</span>
            <span className="text-xs text-neutral-400 font-mono">Pirkimai & Išlaidos</span>
          </div>
          <h4 className="font-display font-bold text-lg text-white flex items-center gap-2">
            <span>Kliento Statusas & Išlaidų Sekimas</span>
            <span className="text-xs font-normal text-neutral-400 font-sans">
              ({userName})
            </span>
          </h4>
        </div>

        {/* Current Tier Badge */}
        <div
          className={`flex items-center gap-2.5 px-4 py-2 rounded-2xl border ${currentTier.borderColor} bg-neutral-950/80 shadow-md`}
        >
          <div className={`p-1.5 rounded-xl bg-gradient-to-tr ${currentTier.badgeColor} text-white shadow-inner`}>
            {getTierIcon(currentTier.id)}
          </div>
          <div className="text-right sm:text-left">
            <div className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider">
              Esamas Statusas
            </div>
            <div className={`text-xs font-bold font-display ${currentTier.textColor}`}>
              {currentTier.titleLt}
            </div>
          </div>
        </div>
      </div>

      {/* User Spending & Points Highlight Section */}
      <div className="py-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Total Spending Card */}
        <div className="p-4 rounded-2xl bg-neutral-950/70 border border-neutral-800 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-xs text-neutral-400 font-mono uppercase tracking-wider mb-1">
              <Wallet className="w-3.5 h-3.5 text-emerald-400" />
              <span>Iš Viso Išleista Užsakymams</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-mono font-extrabold text-white tracking-tight tabular-nums">
                {totalSpentEur.toFixed(2)} €
              </span>
            </div>
            <p className="text-[11px] text-neutral-400 mt-1">
              Kiekvienas 1 € suteikia 10 lojalumo taškų ir didina kliento rangą.
            </p>
          </div>
        </div>

        {/* Total Points Card */}
        <div className="p-4 rounded-2xl bg-neutral-950/70 border border-neutral-800 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-xs text-neutral-400 font-mono uppercase tracking-wider mb-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Sukaupti Lojalumo Taškai</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-mono font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-400 to-yellow-500 tabular-nums tracking-tight">
                {points.toLocaleString()}
              </span>
              <span className="text-xs font-mono text-amber-300 font-bold uppercase">
                tšk.
              </span>
            </div>
            <p className="text-[11px] text-neutral-400 mt-1">
              Automatiškai konvertuojami į nuolaidas ir prioritetinę gamybą.
            </p>
          </div>
        </div>
      </div>

      {/* Progress Towards Next Status */}
      <div className="pb-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-3 mb-2.5">
          <div>
            <span className="text-xs font-semibold text-neutral-300 flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
              <span>Pažanga link aukštesnio statuso</span>
            </span>
          </div>

          {nextTier ? (
            <div className="text-left sm:text-right">
              <span className="text-xs font-semibold text-neutral-300 flex items-center sm:justify-end gap-1.5">
                <span>Kitas statusas:</span>
                <span className="text-amber-400 font-bold">{nextTier.titleLt}</span>
                <span className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-amber-400/10 text-amber-300 border border-amber-400/20">
                  {nextTier.discountPercent}% NUOLAIDA
                </span>
              </span>
              <div className="text-[11px] font-mono text-neutral-400 mt-0.5">
                Trūksta <strong className="text-white font-bold">{spendingToNextTierEur.toFixed(2)} €</strong> pirkinių arba{' '}
                <strong className="text-white font-bold">{pointsToNextTier}</strong> taškų
              </div>
            </div>
          ) : (
            <div className="text-left sm:text-right">
              <span className="text-xs font-bold text-cyan-300 flex items-center gap-1">
                <Crown className="w-4 h-4 text-cyan-400" />
                <span>Maksimalus VIP Diamond Statusas!</span>
              </span>
              <div className="text-[11px] font-mono text-neutral-400 mt-0.5">
                20% VIP nuolaida, 24h ekspres gamyba ir asmeninis stilistas
              </div>
            </div>
          )}
        </div>

        {/* Animated Dual Progress Bar */}
        <div className="relative w-full h-3.5 rounded-full bg-neutral-950 border border-neutral-800 p-0.5 overflow-hidden shadow-inner">
          <div
            className="h-full rounded-full bg-gradient-to-r from-amber-600 via-amber-400 to-yellow-300 transition-all duration-700 ease-out relative shadow-sm"
            style={{ width: `${Math.max(5, Math.min(100, Math.max(progressPercent, spendingProgressPercent)))}%` }}
          >
            <div className="absolute inset-0 bg-white/20 animate-pulse" />
          </div>
        </div>

        {/* Milestone Steps Bar (Bronze, Silver, Gold, Diamond) */}
        <div className="grid grid-cols-4 gap-1.5 sm:gap-2 mt-3 pt-1">
          {TIERS_CONFIG.map((tier) => {
            const isUnlocked = points >= tier.minPoints || totalSpentEur >= tier.minSpendEur;
            const isCurrent = currentTier.id === tier.id;
            return (
              <div
                key={tier.id}
                className={`p-2.5 rounded-xl border text-center transition-all ${
                  isCurrent
                    ? 'border-amber-400/80 bg-amber-400/15 ring-1 ring-amber-400/40 shadow-sm'
                    : isUnlocked
                    ? 'border-neutral-700/80 bg-neutral-900/60'
                    : 'border-neutral-800/60 bg-neutral-950/40 opacity-60'
                }`}
              >
                <div className="flex items-center justify-center gap-1 text-[11px] font-bold text-white mb-0.5">
                  {tier.id === 'diamond' ? (
                    <Gem className="w-3.5 h-3.5 text-cyan-400" />
                  ) : tier.id === 'gold' ? (
                    <Crown className="w-3.5 h-3.5 text-amber-400" />
                  ) : (
                    <Award className="w-3.5 h-3.5 text-slate-300" />
                  )}
                  <span className="capitalize">{tier.id}</span>
                  <span className="text-amber-400 font-mono">({tier.discountPercent}%)</span>
                </div>
                <div className="text-[10px] text-neutral-400 font-mono truncate">
                  nuo {tier.minSpendEur} €
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Active Promo Code & 1-Click Apply */}
      <div className="p-4 rounded-2xl bg-neutral-950/80 border border-neutral-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 my-2 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-amber-400 shrink-0">
            <Percent className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white">Tavo Statuso Nuolaidos Kodas:</span>
              <span className="px-2 py-0.5 rounded-md font-mono font-extrabold text-xs bg-amber-400 text-neutral-950 tracking-wider">
                {currentTier.promoCode}
              </span>
            </div>
            <p className="text-[11px] text-neutral-400 mt-0.5">
              Suteikia <strong className="text-white font-bold">{currentTier.discountPercent}%</strong> nuolaidą visam krepšeliui.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {onApplyPromoCodeToCart && (
            <button
              type="button"
              onClick={() => handleApplyToCart(currentTier.promoCode)}
              className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
            >
              <Tag className="w-3.5 h-3.5" />
              <span>{appliedPromo ? 'Pritaikyta!' : 'Pritaikyti Krepšelyje'}</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => handleCopyCode(currentTier.promoCode)}
            className="px-3.5 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-medium text-xs transition flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 border border-neutral-700"
          >
            {copiedCode ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400 font-bold">Nukopijuota!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-neutral-400" />
                <span>Kopijuoti</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Unlocked Tier Perks Pill List */}
      <div className="pt-2 pb-3">
        <div className="text-[11px] font-mono text-neutral-400 uppercase tracking-wider mb-2">
          Aktyvios privilegijos ({currentTier.titleLt}):
        </div>
        <div className="flex flex-wrap gap-2">
          {currentTier.perksLt.map((perk, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-xl bg-neutral-800/80 text-neutral-200 border border-neutral-700/80"
            >
              <Check className="w-3 h-3 text-emerald-400 shrink-0" />
              <span>{perk}</span>
            </span>
          ))}
        </div>
      </div>

      {/* Quick Ways to Earn Points & Interactive Simulator */}
      <div className="pt-3 border-t border-neutral-800/80">
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <span className="text-xs font-bold text-white flex items-center gap-1.5">
            <Gift className="w-3.5 h-3.5 text-amber-400" />
            <span>Kaip didinti statusą ir kaupti taškus?</span>
          </span>
          <button
            type="button"
            onClick={() => setShowHistory(!showHistory)}
            className="text-[11px] text-amber-400 hover:text-amber-300 font-medium transition flex items-center gap-1 cursor-pointer"
          >
            <Clock className="w-3 h-3" />
            <span>{showHistory ? 'Slėpti istoriją' : `Pirkimų & Taškų Istorija (${transactions.length})`}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {/* Purchase simulation card */}
          <div className="p-2.5 rounded-xl bg-neutral-950 border border-neutral-800/90 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs font-bold text-white mb-0.5">
                <span className="flex items-center gap-1 text-emerald-400">
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>3D Užsakymas</span>
                </span>
                <span className="font-mono text-amber-400">+10 tšk./€</span>
              </div>
              <p className="text-[10px] text-neutral-400">
                1 € = 10 taškų. Didina bendrą išlaidų sumą ir atrakina Gold statusą.
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleSimulateSpending(50)}
              className="mt-2 text-[10px] font-bold text-neutral-300 hover:text-white px-2 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 transition flex items-center justify-center gap-1 cursor-pointer"
            >
              <span>+50.00 € (Testuoti pirkimą)</span>
            </button>
          </div>

          {/* Review card */}
          <div className="p-2.5 rounded-xl bg-neutral-950 border border-neutral-800/90 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs font-bold text-white mb-0.5">
                <span className="flex items-center gap-1 text-amber-400">
                  <Star className="w-3.5 h-3.5" />
                  <span>Atsiliepimas</span>
                </span>
                <span className="font-mono text-amber-400">+100 tšk.</span>
              </div>
              <p className="text-[10px] text-neutral-400">
                Palik atsiliepimą su nuotrauka apie savo gaminį.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                awardLoyaltyPoints(userId, 100, 'review', 'Atsiliepimas apie individualų drabužį');
                setRewardToast('+100 taškų už atsiliepimą pridėta!');
                setTimeout(() => setRewardToast(null), 3000);
              }}
              className="mt-2 text-[10px] font-bold text-neutral-300 hover:text-white px-2 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 transition flex items-center justify-center gap-1 cursor-pointer"
            >
              <span>+100 tšk. (Atsiliepimas)</span>
            </button>
          </div>

          {/* Community reward card */}
          <div className="p-2.5 rounded-xl bg-neutral-950 border border-neutral-800/90 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs font-bold text-white mb-0.5">
                <span className="flex items-center gap-1 text-cyan-400">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Kūrėjo Premija</span>
                </span>
                <span className="font-mono text-amber-400">+150 tšk.</span>
              </div>
              <p className="text-[10px] text-neutral-400">
                Pasidalink savo 3D modeliu socialiniuose tinkluose.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                awardLoyaltyPoints(userId, 150, 'bonus', 'Socialinio dalinimosi premija');
                setRewardToast('+150 taškų kūrėjo premija pridėta!');
                setTimeout(() => setRewardToast(null), 3000);
              }}
              className="mt-2 text-[10px] font-bold text-neutral-300 hover:text-white px-2 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 transition flex items-center justify-center gap-1 cursor-pointer"
            >
              <span>+150 tšk. (Dalinimosi premija)</span>
            </button>
          </div>
        </div>

        {/* Collapsible History Ledger */}
        {showHistory && (
          <div className="mt-3 p-3 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-2 max-h-48 overflow-y-auto">
            <div className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider pb-1 border-b border-neutral-850 flex items-center justify-between">
              <span>Paskutinės operacijos ({transactions.length})</span>
              <span>Išlaidos / Taškai</span>
            </div>
            {transactions.map((tx) => (
              <div
                key={tx.id}
                className="flex items-center justify-between gap-3 text-xs py-1 border-b border-neutral-900 last:border-0"
              >
                <div className="min-w-0">
                  <div className="text-white font-medium truncate text-[11px]">{tx.description}</div>
                  <div className="text-[9px] font-mono text-neutral-500">
                    {new Date(tx.timestamp).toLocaleDateString('lt-LT', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                </div>
                <div className="flex items-center gap-2 font-mono text-xs shrink-0 tabular-nums">
                  {tx.amountEur !== undefined && tx.amountEur > 0 && (
                    <span className="text-emerald-400 font-semibold">{tx.amountEur.toFixed(2)} €</span>
                  )}
                  <span className="text-amber-400 font-bold">+{tx.points} tšk.</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Floating reward toast */}
      {rewardToast && (
        <div className="absolute top-4 right-4 z-20 px-3.5 py-2 rounded-xl bg-amber-400 text-neutral-950 font-bold text-xs shadow-lg animate-bounce flex items-center gap-2">
          <Sparkles className="w-4 h-4" />
          <span>{rewardToast}</span>
        </div>
      )}
    </div>
  );
};
