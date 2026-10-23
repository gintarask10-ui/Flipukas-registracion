import React, { useState, useEffect } from 'react';
import {
  Award,
  Check,
  Copy,
  Crown,
  Eye,
  Feather,
  Flame,
  Gift,
  Leaf,
  Lock,
  Palette,
  ShieldCheck,
  Sparkles,
  Star,
  Tag,
  Zap,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { StyleChallenge, StyleMilestone, UserMilestonesData } from '../../types/milestones';
import {
  STYLE_CHALLENGES,
  STYLE_MILESTONES,
  checkAndUpdateMilestones,
  completeChallenge,
  getMilestonesData,
} from '../../utils/milestonesStorage';

interface StyleMilestonesProps {
  userId?: string;
  savedDesignsCount: number;
  onOpenStyleLab?: () => void;
  onApplyPromoCodeToCart?: (code: string) => void;
}

export const StyleMilestones: React.FC<StyleMilestonesProps> = ({
  userId,
  savedDesignsCount,
  onOpenStyleLab,
  onApplyPromoCodeToCart,
}) => {
  const [data, setData] = useState<UserMilestonesData>(() =>
    checkAndUpdateMilestones(savedDesignsCount, userId).data
  );
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'milestones' | 'challenges' | 'vouchers'>('milestones');
  const [celebrationToast, setCelebrationToast] = useState<string | null>(null);

  // Sync when wishlist count or user changes
  useEffect(() => {
    const res = checkAndUpdateMilestones(savedDesignsCount, userId);
    setData(res.data);
    if (res.newUnlockedMilestones.length > 0) {
      const topMilestone = res.newUnlockedMilestones[0];
      setCelebrationToast(`Atrakintas naujas pasiekimas: ${topMilestone.titleLt}!`);
      try {
        confetti({
          particleCount: 70,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#d4af37', '#f3e5ab', '#c5a059', '#38bdf8'],
        });
      } catch {
        // ignore
      }
      setTimeout(() => setCelebrationToast(null), 4000);
    }
  }, [savedDesignsCount, userId]);

  useEffect(() => {
    const handleUpdate = (e: Event) => {
      const custom = e as CustomEvent<UserMilestonesData>;
      if (custom.detail) {
        setData(custom.detail);
      } else {
        setData(getMilestonesData(userId));
      }
    };
    window.addEventListener('flipukas-milestones-updated', handleUpdate);
    return () => window.removeEventListener('flipukas-milestones-updated', handleUpdate);
  }, [userId]);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  const handleManualCompleteChallenge = (challengeId: string) => {
    const res = completeChallenge(challengeId, userId);
    if (res.success && res.challenge) {
      setData(res.data);
      setCelebrationToast(`Iššūkis įvykdytas: ${res.challenge.titleLt} (+${res.challenge.rewardPoints} tšk.)!`);
      try {
        confetti({
          particleCount: 60,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#d4af37', '#fbbf24', '#10b981'],
        });
      } catch {
        // ignore
      }
      setTimeout(() => setCelebrationToast(null), 3500);
    }
  };

  const unlockedMilestonesCount = STYLE_MILESTONES.filter((m) => !!data.unlockedAt[m.id]).length;
  const completedChallengesCount = data.completedChallengeIds.length;

  // Collect all available unlocked promo codes
  const availableVouchers: { code: string; percent: number; source: string }[] = [];
  STYLE_MILESTONES.forEach((m) => {
    if (data.unlockedAt[m.id]) {
      availableVouchers.push({
        code: m.rewardPromoCode,
        percent: m.rewardDiscountPercent,
        source: m.titleLt,
      });
    }
  });
  STYLE_CHALLENGES.forEach((c) => {
    if (c.rewardPromoCode && data.completedChallengeIds.includes(c.id)) {
      availableVouchers.push({
        code: c.rewardPromoCode,
        percent: c.rewardDiscountPercent || 10,
        source: c.titleLt,
      });
    }
  });

  const getTierCrest = (tier: string, isUnlocked: boolean) => {
    if (!isUnlocked) {
      return (
        <div className="w-12 h-12 rounded-2xl bg-stone-900/80 border border-stone-800 flex items-center justify-center text-stone-500 shadow-inner">
          <Lock className="w-5 h-5" />
        </div>
      );
    }

    switch (tier) {
      case 'diamond':
        return (
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-900/60 via-sky-600/30 to-indigo-500/40 border border-cyan-400/50 flex items-center justify-center text-cyan-300 shadow-[0_0_20px_rgba(56,189,248,0.25)]">
            <Crown className="w-6 h-6 text-cyan-200" />
          </div>
        );
      case 'gold':
        return (
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-900/80 via-yellow-600/40 to-amber-400/50 border border-amber-400/60 flex items-center justify-center text-amber-300 shadow-[0_0_20px_rgba(212,175,55,0.3)]">
            <Award className="w-6 h-6 text-amber-200" />
          </div>
        );
      case 'silver':
        return (
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-stone-800 via-slate-600/40 to-stone-400/50 border border-slate-300/50 flex items-center justify-center text-slate-100 shadow-[0_0_15px_rgba(226,232,240,0.2)]">
            <ShieldCheck className="w-6 h-6 text-slate-200" />
          </div>
        );
      default:
        return (
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-950 via-amber-800/40 to-amber-600/40 border border-amber-700/50 flex items-center justify-center text-amber-400 shadow-[0_0_15px_rgba(180,83,9,0.2)]">
            <Star className="w-6 h-6 text-amber-400" />
          </div>
        );
    }
  };

  const getChallengeIcon = (type: string) => {
    switch (type) {
      case 'palette':
        return <Palette className="w-4 h-4 text-amber-400" />;
      case 'sparkles':
        return <Sparkles className="w-4 h-4 text-yellow-300" />;
      case 'feather':
        return <Feather className="w-4 h-4 text-sky-400" />;
      case 'eye':
        return <Eye className="w-4 h-4 text-emerald-400" />;
      case 'leaf':
        return <Leaf className="w-4 h-4 text-emerald-300" />;
      default:
        return <Zap className="w-4 h-4 text-amber-400" />;
    }
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Editorial Luxury Header Banner */}
      <div className="relative p-6 rounded-3xl bg-gradient-to-br from-[#16161e] via-[#111116] to-[#0d0d11] border border-[#d4af37]/30 shadow-xl overflow-hidden">
        <div className="absolute top-0 right-0 w-72 h-72 bg-[#d4af37]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-60 h-60 bg-amber-600/5 rounded-full blur-2xl pointer-events-none" />

        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div>
            <div className="flex items-center gap-2 text-[11px] font-mono tracking-widest uppercase text-[#d4af37] mb-1.5 font-semibold">
              <span>Atelier Privilèges</span>
              <span>·</span>
              <span>Stiliaus Pasiekimų Sistema</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-serif-luxury font-bold text-white tracking-tight flex items-center gap-2.5">
              <span>Atelier Ženkleliai ir Apdovanojimai</span>
              <span className="text-xs font-mono font-normal px-2.5 py-0.5 rounded-full bg-[#d4af37]/15 text-[#f5e6b8] border border-[#d4af37]/40">
                {unlockedMilestonesCount}/{STYLE_MILESTONES.length} pasiekta
              </span>
            </h3>
            <p className="text-xs text-stone-300 mt-1 max-w-xl leading-relaxed">
              Kurdami ir saugodami savo 3D konfigūracijas bei atlikdami stiliaus iššūkius, pelnote virtualius mados namų ženklelius bei asmeninius nuolaidų kodus.
            </p>
          </div>

          {/* Quick Metrics Cluster */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="px-4 py-3 rounded-2xl bg-black/40 border border-stone-800/80 text-center">
              <div className="text-lg font-mono font-bold text-[#f5e6b8] tabular-nums">
                {savedDesignsCount}
              </div>
              <div className="text-[10px] uppercase font-mono text-stone-400 tracking-wider">
                3D Modeliai
              </div>
            </div>
            <div className="px-4 py-3 rounded-2xl bg-black/40 border border-stone-800/80 text-center">
              <div className="text-lg font-mono font-bold text-emerald-400 tabular-nums">
                {completedChallengesCount}/{STYLE_CHALLENGES.length}
              </div>
              <div className="text-[10px] uppercase font-mono text-stone-400 tracking-wider">
                Iššūkiai
              </div>
            </div>
            <div className="px-4 py-3 rounded-2xl bg-black/40 border border-[#d4af37]/30 text-center">
              <div className="text-lg font-mono font-bold text-[#d4af37] tabular-nums">
                {availableVouchers.length}
              </div>
              <div className="text-[10px] uppercase font-mono text-stone-400 tracking-wider">
                Kuponai
              </div>
            </div>
          </div>
        </div>

        {/* Toast alert */}
        {celebrationToast && (
          <div className="mt-4 p-3 rounded-xl bg-[#d4af37]/20 border border-[#d4af37]/50 text-[#f5e6b8] text-xs flex items-center justify-between gap-2 shadow-lg animate-fadeIn">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#d4af37] shrink-0" />
              <span className="font-medium">{celebrationToast}</span>
            </div>
            <button
              onClick={() => setCelebrationToast(null)}
              className="text-stone-400 hover:text-white text-xs"
            >
              Uždaryti
            </button>
          </div>
        )}
      </div>

      {/* Luxury Segmented Tabs */}
      <div className="flex items-center gap-2 border-b border-stone-800 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('milestones')}
          className={`py-2 px-4 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-2 ${
            activeTab === 'milestones'
              ? 'bg-[#d4af37]/20 text-[#f5e6b8] border border-[#d4af37]/40 shadow-sm'
              : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900/60'
          }`}
        >
          <Award className="w-3.5 h-3.5 text-[#d4af37]" />
          <span>Išsaugotų Modelių Pakopos ({unlockedMilestonesCount}/{STYLE_MILESTONES.length})</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('challenges')}
          className={`py-2 px-4 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-2 ${
            activeTab === 'challenges'
              ? 'bg-[#d4af37]/20 text-[#f5e6b8] border border-[#d4af37]/40 shadow-sm'
              : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900/60'
          }`}
        >
          <Flame className="w-3.5 h-3.5 text-amber-500" />
          <span>Stiliaus Iššūkiai ({completedChallengesCount}/{STYLE_CHALLENGES.length})</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('vouchers')}
          className={`py-2 px-4 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-2 ${
            activeTab === 'vouchers'
              ? 'bg-[#d4af37]/20 text-[#f5e6b8] border border-[#d4af37]/40 shadow-sm'
              : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900/60'
          }`}
        >
          <Tag className="w-3.5 h-3.5 text-emerald-400" />
          <span>Uždirbti Kuponai ({availableVouchers.length})</span>
        </button>
      </div>

      {/* Tab 1: Saved Model Milestones */}
      {activeTab === 'milestones' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {STYLE_MILESTONES.map((milestone) => {
            const isUnlocked = !!data.unlockedAt[milestone.id];
            const currentCount = Math.min(savedDesignsCount, milestone.requiredDesignsCount);
            const progress = Math.round((currentCount / milestone.requiredDesignsCount) * 100);

            return (
              <div
                key={milestone.id}
                className={`p-5 rounded-2xl border transition-all flex flex-col justify-between gap-4 ${
                  isUnlocked
                    ? 'bg-gradient-to-br from-[#16161d] to-[#101015] border-[#d4af37]/40 shadow-md shadow-[#d4af37]/5'
                    : 'bg-[#101014]/60 border-stone-800/80 opacity-80'
                }`}
              >
                <div className="flex items-start gap-4">
                  {getTierCrest(milestone.tier, isUnlocked)}

                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-[#d4af37]">
                        {milestone.badgeNameLt}
                      </span>
                      {isUnlocked ? (
                        <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1 font-semibold">
                          <Check className="w-3 h-3" />
                          <span>Pasiekta</span>
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono text-stone-400">
                          {currentCount}/{milestone.requiredDesignsCount} modeliai
                        </span>
                      )}
                    </div>

                    <h4 className="text-base font-serif-luxury font-bold text-white mt-0.5">
                      {milestone.titleLt}
                    </h4>
                    <p className="text-xs text-stone-300 mt-0.5 leading-relaxed">
                      {milestone.subtitleLt}
                    </p>
                  </div>
                </div>

                {/* Progress bar if locked */}
                {!isUnlocked && (
                  <div className="space-y-1.5">
                    <div className="w-full h-1.5 bg-stone-900 rounded-full overflow-hidden border border-stone-800">
                      <div
                        className="h-full bg-gradient-to-r from-amber-600 to-[#d4af37] transition-all duration-500 rounded-full"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] font-mono text-stone-400">
                      <span>Trūksta: {milestone.requiredDesignsCount - currentCount} modelio(-ių)</span>
                      <span>{progress}%</span>
                    </div>
                  </div>
                )}

                {/* Reward Strip */}
                <div className="pt-3 border-t border-stone-800/80 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    <Gift className="w-3.5 h-3.5 text-[#d4af37]" />
                    <span className="text-stone-300 text-[11px]">
                      Apdovanojimas: <strong className="text-white">-{milestone.rewardDiscountPercent}% nuolaida</strong> + {milestone.rewardPoints} tšk.
                    </span>
                  </div>

                  {isUnlocked && (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleCopyCode(milestone.rewardPromoCode)}
                        className="px-2.5 py-1 rounded-lg bg-[#d4af37]/15 hover:bg-[#d4af37]/25 text-[#f5e6b8] border border-[#d4af37]/30 text-[11px] font-mono font-bold transition flex items-center gap-1.5 cursor-pointer"
                        title="Kopijuoti nuolaidos kodą"
                      >
                        {copiedCode === milestone.rewardPromoCode ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-400" />
                            <span>Nukopijuota!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3 text-[#d4af37]" />
                            <span>{milestone.rewardPromoCode}</span>
                          </>
                        )}
                      </button>

                      {onApplyPromoCodeToCart && (
                        <button
                          type="button"
                          onClick={() => onApplyPromoCodeToCart(milestone.rewardPromoCode)}
                          className="px-2.5 py-1 rounded-lg bg-[#d4af37] hover:bg-[#e6ca85] text-stone-950 text-[11px] font-bold transition cursor-pointer"
                          title="Taikyti šį kodą krepšelyje dabar"
                        >
                          Taikyti
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Tab 2: Design Challenges */}
      {activeTab === 'challenges' && (
        <div className="flex flex-col gap-3.5">
          {STYLE_CHALLENGES.map((challenge) => {
            const isDone = data.completedChallengeIds.includes(challenge.id);

            return (
              <div
                key={challenge.id}
                className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  isDone
                    ? 'bg-[#15151c]/90 border-emerald-500/30'
                    : 'bg-[#121217]/70 border-stone-800 hover:border-stone-700'
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                      isDone
                        ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                        : 'bg-stone-900 border-stone-800 text-stone-400'
                    }`}
                  >
                    {isDone ? <Check className="w-5 h-5 text-emerald-400" /> : getChallengeIcon(challenge.iconType)}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-serif-luxury font-bold text-white">
                        {challenge.titleLt}
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-stone-900 text-[#d4af37] border border-stone-800">
                        {challenge.badgeNameLt}
                      </span>
                    </div>
                    <p className="text-xs text-stone-300 mt-0.5 leading-relaxed">
                      {challenge.descriptionLt}
                    </p>
                    <p className="text-[11px] text-stone-400 font-mono mt-1">
                      Patarimas: {challenge.hintLt}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 sm:self-center">
                  <div className="text-right mr-2 hidden sm:block">
                    <span className="text-[11px] font-mono text-emerald-400 block font-bold">
                      +{challenge.rewardPoints} tšk.
                    </span>
                    {challenge.rewardPromoCode && (
                      <span className="text-[10px] font-mono text-[#d4af37]">
                        Kodas: {challenge.rewardPromoCode}
                      </span>
                    )}
                  </div>

                  {isDone ? (
                    <div className="px-3 py-1.5 rounded-xl bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-xs font-semibold flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5" />
                      <span>Įvykdyta</span>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleManualCompleteChallenge(challenge.id)}
                      className="px-3.5 py-1.5 rounded-xl bg-[#d4af37] hover:bg-[#e6ca85] text-stone-950 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Pažymėti atlikus</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Tab 3: Unlocked Vouchers */}
      {activeTab === 'vouchers' && (
        <div className="space-y-4">
          {availableVouchers.length === 0 ? (
            <div className="py-12 text-center rounded-2xl bg-[#111116] border border-stone-800 p-6 flex flex-col items-center">
              <Tag className="w-10 h-10 text-stone-600 mb-3" />
              <h5 className="font-serif-luxury font-bold text-white text-base">
                Kuponų dar neturite
              </h5>
              <p className="text-xs text-stone-400 max-w-sm mt-1 mb-4">
                Išsaugokite savo pirmąjį 3D modelį arba įvykdykite bent vieną stiliaus iššūkį, kad atrakintumėte iki 20% nuolaidos kodus!
              </p>
              {onOpenStyleLab && (
                <button
                  type="button"
                  onClick={onOpenStyleLab}
                  className="px-4 py-2 rounded-xl bg-[#d4af37] text-stone-950 font-bold text-xs hover:bg-[#e6ca85] transition cursor-pointer"
                >
                  Eiti į 3D Laboratoriją
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {availableVouchers.map((voucher, idx) => (
                <div
                  key={`${voucher.code}-${idx}`}
                  className="p-4 rounded-2xl bg-gradient-to-br from-[#16161f] to-[#101015] border border-[#d4af37]/35 flex items-center justify-between gap-3 shadow-md"
                >
                  <div>
                    <div className="flex items-center gap-1.5 text-xs text-stone-400">
                      <span>Šaltinis:</span>
                      <span className="text-white font-medium">{voucher.source}</span>
                    </div>
                    <div className="text-xl font-mono font-bold text-[#f5e6b8] tracking-wider mt-1">
                      {voucher.code}
                    </div>
                    <div className="text-xs font-mono text-emerald-400 mt-0.5">
                      -{voucher.percent}% nuolaida visam krepšeliui
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleCopyCode(voucher.code)}
                      className="px-3 py-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-200 border border-stone-700 text-xs font-mono transition flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      {copiedCode === voucher.code ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span>Kopijuota!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3 text-[#d4af37]" />
                          <span>Kopijuoti</span>
                        </>
                      )}
                    </button>

                    {onApplyPromoCodeToCart && (
                      <button
                        type="button"
                        onClick={() => onApplyPromoCodeToCart(voucher.code)}
                        className="px-3 py-1.5 rounded-xl bg-[#d4af37] hover:bg-[#e6ca85] text-stone-950 font-bold text-xs transition cursor-pointer shadow-sm"
                      >
                        Taikyti krepšelyje
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
