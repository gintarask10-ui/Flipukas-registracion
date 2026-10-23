import { StyleMilestone, StyleChallenge, UserMilestonesData } from '../types/milestones';
import { awardLoyaltyPoints } from './loyaltyStorage';

const MILESTONES_STORAGE_PREFIX = 'flipukas_style_milestones_';

export const STYLE_MILESTONES: StyleMilestone[] = [
  {
    id: 'milestone-1',
    titleLt: 'Atelier Pradžia',
    subtitleLt: 'Išsaugok 1-ąjį asmeninį 3D drabužį savo galerijoje',
    requiredDesignsCount: 1,
    rewardPromoCode: 'ATELIER5',
    rewardDiscountPercent: 5,
    rewardPoints: 100,
    tier: 'bronze',
    badgeNameLt: 'Atelier Debiutas',
    badgeDescriptionLt: 'Pirmasis unikalus 3D modelis sukurtas Flipukas laboratorijoje.',
  },
  {
    id: 'milestone-3',
    titleLt: 'Mados Architektas',
    subtitleLt: 'Išsaugok 3 unikalius 3D dizainus asmeninėje spintoje',
    requiredDesignsCount: 3,
    rewardPromoCode: 'ARCHITECT10',
    rewardDiscountPercent: 10,
    rewardPoints: 250,
    tier: 'silver',
    badgeNameLt: 'Stiliaus Architektas',
    badgeDescriptionLt: '3 kruopščiai sukonstruotos 3D konfigūracijos su pasirinktiniais audiniais.',
  },
  {
    id: 'milestone-5',
    titleLt: 'Haute Couture Meistras',
    subtitleLt: 'Sukaupk 5 išskirtinius 3D modelius su skirtingais kirpimais',
    requiredDesignsCount: 5,
    rewardPromoCode: 'COUTURE15',
    rewardDiscountPercent: 15,
    rewardPoints: 500,
    tier: 'gold',
    badgeNameLt: 'Aukštosios Mados Kūrėjas',
    badgeDescriptionLt: 'Tikras atelier meistras su 5 autoriniais 3D darbais.',
  },
  {
    id: 'milestone-10',
    titleLt: 'Flipukas Legenda',
    subtitleLt: 'Pasiek 10 autorinių 3D kolekcijos modelių portfelį',
    requiredDesignsCount: 10,
    rewardPromoCode: 'VIRTUOSO20',
    rewardDiscountPercent: 20,
    rewardPoints: 1000,
    tier: 'diamond',
    badgeNameLt: 'Grand Virtuoso',
    badgeDescriptionLt: 'Elitinis skaitmeninės mados novatorius su pilna 10 modelių kolekcija.',
  },
];

export const STYLE_CHALLENGES: StyleChallenge[] = [
  {
    id: 'challenge-monochrome',
    titleLt: 'Monochrominė Elegancija',
    category: 'palette',
    descriptionLt: 'Sukonfigūruok ir išsaugok minimalistinį dizainą su elegantišku juodu, šampano ar kreminiu atspalviu.',
    hintLt: 'StyleLab parink subtilią prabangią spalvą (pvz., #0f0f14, #d4af37, #f5f5f0) ir išsaugok.',
    rewardPromoCode: 'MONOCHROME5',
    rewardDiscountPercent: 5,
    rewardPoints: 150,
    badgeNameLt: 'Monochrominis Elitas',
    iconType: 'palette',
  },
  {
    id: 'challenge-silk-wool',
    titleLt: 'Audinių Alchemija',
    category: 'fabric',
    descriptionLt: 'Pritaikyk aukščiausios klasės Mulberry Šilką (22 Momme) arba Itališką Merino Vilną 3D modelyje.',
    hintLt: 'Audinių sąraše pasirink „Prabangus Mulberry Šilkas“ arba „Švelni Merino Vilna“.',
    rewardPromoCode: 'SILK10',
    rewardDiscountPercent: 10,
    rewardPoints: 200,
    badgeNameLt: 'Šilko Connoisseur',
    iconType: 'sparkles',
  },
  {
    id: 'challenge-signature',
    titleLt: 'Asmeninis Parašas',
    category: 'signature',
    descriptionLt: 'Papildyk drabužį savo autoriniu išsiuvinėtu tekstu arba monograma.',
    hintLt: 'Skirtuke „Personalizavimas“ įrašyk asmeninį užrašą ar inicialus.',
    rewardPoints: 150,
    badgeNameLt: 'Autoriaus Monograma',
    iconType: 'feather',
  },
  {
    id: 'challenge-tour',
    titleLt: '360° Inspektorius',
    category: 'tour',
    descriptionLt: 'Apžiūrėk drabužį naudodamas „Gidas / Tour“ kameros animaciją arba sprogdintų sluoksnių vaizdą.',
    hintLt: 'Spustelėk „Gidas“ mygtuką 3D peržiūros lange.',
    rewardPoints: 100,
    badgeNameLt: '3D Visionary',
    iconType: 'eye',
  },
  {
    id: 'challenge-eco',
    titleLt: 'Tvarios Mados Vizija',
    category: 'sustainability',
    descriptionLt: 'Pasirink ekologišką audinį (natūralią medvilnę ar šilką) ir peržiūrėk tvarumo balą.',
    hintLt: 'Patikrink gaminio CO2 bei vandens sąnaudų rodiklį StyleLab skiltyje.',
    rewardPromoCode: 'ECO10',
    rewardDiscountPercent: 10,
    rewardPoints: 150,
    badgeNameLt: 'Eko Pionierius',
    iconType: 'leaf',
  },
];

function getStorageKey(userId?: string): string {
  return `${MILESTONES_STORAGE_PREFIX}${userId || 'guest'}`;
}

export function getMilestonesData(userId?: string): UserMilestonesData {
  try {
    const raw = localStorage.getItem(getStorageKey(userId));
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.warn('Failed to read milestones data:', e);
  }
  return {
    savedDesignsCount: 0,
    completedChallengeIds: [],
    claimedPromoCodes: [],
    unlockedAt: {},
  };
}

export function saveMilestonesData(data: UserMilestonesData, userId?: string): void {
  try {
    localStorage.setItem(getStorageKey(userId), JSON.stringify(data));
    window.dispatchEvent(
      new CustomEvent('flipukas-milestones-updated', { detail: data })
    );
  } catch (e) {
    console.warn('Failed to save milestones data:', e);
  }
}

export function checkAndUpdateMilestones(
  wishlistCount: number,
  userId?: string
): { data: UserMilestonesData; newUnlockedMilestones: StyleMilestone[] } {
  const data = getMilestonesData(userId);
  data.savedDesignsCount = wishlistCount;

  const newUnlocked: StyleMilestone[] = [];

  STYLE_MILESTONES.forEach((m) => {
    if (wishlistCount >= m.requiredDesignsCount && !data.unlockedAt[m.id]) {
      data.unlockedAt[m.id] = Date.now();
      newUnlocked.push(m);

      // Automatically award loyalty points
      awardLoyaltyPoints(
        userId,
        m.rewardPoints,
        'bonus',
        `Pasiekimas: „${m.titleLt}“ (+${m.rewardPoints} tšk.)`
      );
    }
  });

  saveMilestonesData(data, userId);
  return { data, newUnlockedMilestones: newUnlocked };
}

export function completeChallenge(
  challengeId: string,
  userId?: string
): { success: boolean; data: UserMilestonesData; challenge?: StyleChallenge } {
  const data = getMilestonesData(userId);
  if (data.completedChallengeIds.includes(challengeId)) {
    return { success: false, data };
  }

  const challenge = STYLE_CHALLENGES.find((c) => c.id === challengeId);
  if (!challenge) {
    return { success: false, data };
  }

  data.completedChallengeIds.push(challengeId);
  data.unlockedAt[challengeId] = Date.now();

  awardLoyaltyPoints(
    userId,
    challenge.rewardPoints,
    'bonus',
    `Iššūkis įvykdytas: „${challenge.titleLt}“ (+${challenge.rewardPoints} tšk.)`
  );

  saveMilestonesData(data, userId);
  return { success: true, data, challenge };
}

export function claimPromoCode(code: string, userId?: string): UserMilestonesData {
  const data = getMilestonesData(userId);
  if (!data.claimedPromoCodes.includes(code)) {
    data.claimedPromoCodes.push(code);
    saveMilestonesData(data, userId);
  }
  return data;
}
