import { LoyaltyTier, TierConfig, LoyaltyTransaction, UserLoyaltyState } from '../types/loyalty';

const LOYALTY_STORAGE_PREFIX = 'flipukas_loyalty_data_';

export const TIERS_CONFIG: TierConfig[] = [
  {
    id: 'bronze',
    titleLt: 'Bronzinis Kūrėjas (Bronze)',
    minPoints: 0,
    minSpendEur: 0,
    discountPercent: 5,
    promoCode: 'BRONZE5',
    perksLt: [
      '5% nuolaida visiems 3D užsakymams',
      'Nemokamas audinių skaitmeninis testas',
      'Prieiga prie StyleLab bazinių funkcijų',
    ],
    badgeColor: 'from-amber-700 to-amber-900',
    borderColor: 'border-amber-700/60',
    textColor: 'text-amber-400',
    bgGlow: 'bg-amber-700/10',
  },
  {
    id: 'silver',
    titleLt: 'Sidabrinis Kūrėjas (Silver)',
    minPoints: 500,
    minSpendEur: 150,
    discountPercent: 10,
    promoCode: 'SILVER10',
    perksLt: [
      '10% nuolaida visiems 3D užsakymams',
      'Prioritetinė gamyba Atelier ceche (per 24–48 val.)',
      'Nemokama skaitmeninė siuvėjos konsultacija',
      'Ankstyva prieiga prie naujų riboto tiražo audinių',
    ],
    badgeColor: 'from-slate-400 to-slate-600',
    borderColor: 'border-slate-400/60',
    textColor: 'text-slate-200',
    bgGlow: 'bg-slate-400/10',
  },
  {
    id: 'gold',
    titleLt: 'Auksinis Kūrėjas (Gold)',
    minPoints: 1500,
    minSpendEur: 450,
    discountPercent: 15,
    promoCode: 'GOLD15',
    perksLt: [
      '15% nuolaida visam krepšeliui',
      'Nemokamas kurjerio pristatymas (Omniva / DPD / Kurjeris)',
      'Nemokamas 1 vnt. rankinis siuvinėjimas / monograma per mėnesį',
      'Asmeninis Atelier mados asistentas ir audinių pavyzdžiai į namus',
    ],
    badgeColor: 'from-amber-400 to-yellow-600',
    borderColor: 'border-amber-400/60',
    textColor: 'text-amber-300',
    bgGlow: 'bg-amber-400/15',
  },
  {
    id: 'diamond',
    titleLt: 'Deimantinis VIP Atelier (Diamond)',
    minPoints: 3000,
    minSpendEur: 1000,
    discountPercent: 20,
    promoCode: 'DIAMOND20',
    perksLt: [
      '20% VIP nuolaida visiems gaminiams',
      'Nemokamas individualus 3D modeliavimas su vyriausiuoju stilistu',
      'Ekspresinė 24h gamyba ir pristatymas',
      'Nemokamos firminės medinės Atelier dovanų dėžutės',
      'Privatus kvietimas į Vilniaus Atelier demonstracinę erdvę',
    ],
    badgeColor: 'from-cyan-400 via-sky-300 to-indigo-500',
    borderColor: 'border-cyan-400/60',
    textColor: 'text-cyan-300',
    bgGlow: 'bg-cyan-500/15',
  },
];

function getStorageKey(userId?: string): string {
  return `${LOYALTY_STORAGE_PREFIX}${userId || 'guest'}`;
}

export function computeLoyaltyState(
  points: number,
  transactions: LoyaltyTransaction[],
  totalSpentParam?: number
): UserLoyaltyState {
  // Calculate total spent in EUR from purchase transactions if not explicitly passed
  const calculatedSpent =
    totalSpentParam !== undefined
      ? totalSpentParam
      : transactions.reduce((sum, tx) => (tx.amountEur ? sum + tx.amountEur : sum), 0);

  // A user can achieve tier by points OR by accumulated spending
  let currentTier = TIERS_CONFIG[0];
  let nextTier: TierConfig | null = TIERS_CONFIG[1];

  for (let i = TIERS_CONFIG.length - 1; i >= 0; i--) {
    const tier = TIERS_CONFIG[i];
    if (points >= tier.minPoints || calculatedSpent >= tier.minSpendEur) {
      currentTier = tier;
      nextTier = i < TIERS_CONFIG.length - 1 ? TIERS_CONFIG[i + 1] : null;
      break;
    }
  }

  let pointsToNextTier = 0;
  let spendingToNextTierEur = 0;
  let progressPercent = 100;
  let spendingProgressPercent = 100;

  if (nextTier) {
    // Points progress
    const ptsRange = nextTier.minPoints - currentTier.minPoints;
    const ptsIntoCurrent = Math.max(0, points - currentTier.minPoints);
    pointsToNextTier = Math.max(0, nextTier.minPoints - points);
    progressPercent = Math.min(100, Math.max(0, Math.round((ptsIntoCurrent / ptsRange) * 100)));

    // Spending progress
    const spendRange = nextTier.minSpendEur - currentTier.minSpendEur;
    const spendIntoCurrent = Math.max(0, calculatedSpent - currentTier.minSpendEur);
    spendingToNextTierEur = Math.max(0, Number((nextTier.minSpendEur - calculatedSpent).toFixed(2)));
    spendingProgressPercent = Math.min(
      100,
      Math.max(0, Math.round((spendIntoCurrent / spendRange) * 100))
    );
  }

  return {
    points,
    totalSpentEur: Number(calculatedSpent.toFixed(2)),
    currentTier,
    nextTier,
    pointsToNextTier,
    spendingToNextTierEur,
    progressPercent,
    spendingProgressPercent,
    transactions,
  };
}

export function getLoyaltyState(userId?: string): UserLoyaltyState {
  try {
    const key = getStorageKey(userId);
    const saved = localStorage.getItem(key);
    if (saved) {
      const data = JSON.parse(saved);
      return computeLoyaltyState(
        data.points || 0,
        data.transactions || [],
        data.totalSpentEur !== undefined ? data.totalSpentEur : undefined
      );
    }
  } catch (e) {
    console.warn('Error reading loyalty state:', e);
  }

  // Initial starter state with tracked initial spending and orders
  const initialTransactions: LoyaltyTransaction[] = [
    {
      id: `tx-init-welcome`,
      userId,
      points: 250,
      amountEur: 0,
      type: 'signup',
      description: 'Sveikinimo premija: Prisijungimas prie Flipukas 3D Atelier',
      timestamp: Date.now() - 1000 * 60 * 60 * 24 * 7,
    },
    {
      id: `tx-init-sample-order`,
      userId,
      points: 420,
      amountEur: 42.0,
      type: 'purchase',
      description: 'Užsakymas #FLP-849201: „Aero-Shift“ Medvilninis Džemperis',
      timestamp: Date.now() - 1000 * 60 * 60 * 24 * 3,
      referenceId: 'FLP-849201',
    },
    {
      id: `tx-init-sample-review`,
      userId,
      points: 100,
      amountEur: 0,
      type: 'review',
      description: 'Taškai už parašytą 5★ atsiliepimą apie audinio kokybę',
      timestamp: Date.now() - 1000 * 60 * 60 * 24,
    },
  ];

  const totalPoints = initialTransactions.reduce((sum, t) => sum + t.points, 0); // 770 pts -> Silver
  const totalSpent = initialTransactions.reduce((sum, t) => sum + (t.amountEur || 0), 0); // 42.00 €
  const state = computeLoyaltyState(totalPoints, initialTransactions, totalSpent);

  try {
    localStorage.setItem(
      getStorageKey(userId),
      JSON.stringify({
        points: state.points,
        totalSpentEur: state.totalSpentEur,
        transactions: state.transactions,
      })
    );
  } catch {
    // ignore
  }

  return state;
}

export function awardLoyaltyPoints(
  userId: string | undefined,
  points: number,
  type: 'purchase' | 'review' | 'signup' | 'bonus',
  description: string,
  referenceId?: string,
  amountEur?: number
): UserLoyaltyState {
  const currentState = getLoyaltyState(userId);
  const newTx: LoyaltyTransaction = {
    id: `tx-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    userId,
    points,
    amountEur: amountEur || 0,
    type,
    description,
    timestamp: Date.now(),
    referenceId,
  };

  const newPoints = currentState.points + points;
  const newSpent = currentState.totalSpentEur + (amountEur || 0);
  const newTransactions = [newTx, ...currentState.transactions];
  const newState = computeLoyaltyState(newPoints, newTransactions, newSpent);

  try {
    localStorage.setItem(
      getStorageKey(userId),
      JSON.stringify({
        points: newState.points,
        totalSpentEur: newState.totalSpentEur,
        transactions: newState.transactions,
      })
    );
    window.dispatchEvent(new CustomEvent('flipukas-loyalty-updated', { detail: newState }));
  } catch (e) {
    console.warn('Error saving loyalty state:', e);
  }

  return newState;
}

export function recordUserPurchase(
  userId: string | undefined,
  amountEur: number,
  orderNumber: string,
  itemNames: string
): UserLoyaltyState {
  // 1 € = 10 loyalty points
  const pointsEarned = Math.round(amountEur * 10);
  return awardLoyaltyPoints(
    userId,
    pointsEarned,
    'purchase',
    `Užsakymas #${orderNumber} (${itemNames})`,
    orderNumber,
    amountEur
  );
}
