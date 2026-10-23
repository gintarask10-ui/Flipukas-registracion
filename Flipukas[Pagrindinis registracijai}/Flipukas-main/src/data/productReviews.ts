import { collection, onSnapshot, doc, setDoc, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../services/firebase';
import { ProductReview, NewReviewInput } from '../types/review';

const LOCAL_STORAGE_REVIEWS_KEY = 'flipukas_product_reviews_v1';
const LOCAL_STORAGE_HELPFUL_KEY = 'flipukas_helpful_reviews_v1';

export const INITIAL_PRODUCT_REVIEWS: ProductReview[] = [
  {
    id: 'rev-hoodie-01',
    productId: 'hoodie-aero-shift',
    productName: '„Aero-Shift“ Medvilninis Džemperis',
    userId: 'user-tomas-v',
    userName: 'Tomas Vaitkevičius',
    rating: 5,
    title: 'Geriausias oversized džemperis spintoje',
    comment:
      '3D laboratorijoje pasirinkau L dydį ir šukuotinę 380 GSM medvilnę su tamsiai pilka spalva. Siuvinėjimo detalė ant krūtinės atvaizduota 1 prie 1 su tuo, ką mačiau 3D ekrane! Audinys itin tankus, vidinis pūkelis švelnus. Po trijų skalbimų spalva ir forma nepakito.',
    customizedDetails: {
      garmentType: 'hoodie',
      garmentName: '„Aero-Shift“ Džemperis',
      fabricName: 'Šukuotinė Medvilnė 380GSM',
      size: 'L',
      primaryColorHex: '#161618',
      primaryColorName: 'Klasikinė Juoda',
    },
    helpfulCount: 24,
    verifiedBuyer: true,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 3, // 3 days ago
  },
  {
    id: 'rev-hoodie-02',
    productId: 'hoodie-aero-shift',
    productName: '„Aero-Shift“ Medvilninis Džemperis',
    userId: 'user-greta-k',
    userName: 'Greta Kazlauskaitė',
    rating: 5,
    title: 'AR matavimasis padėjo pasirinkti tobulą dydį',
    comment:
      'Labai patiko dydžio rekomendacijos įrankis ir QR kodas telefonui. Nuskenavau ir mačiau, kaip atrodys realybėje. Paėmiau M dydį su kreminiu atspalviu. Kokybė pranoko lūkesčius – jokio pigaus poliesterio jausmo.',
    customizedDetails: {
      garmentType: 'hoodie',
      garmentName: '„Aero-Shift“ Džemperis',
      fabricName: 'Šukuotinė Medvilnė 380GSM',
      size: 'M',
      primaryColorHex: '#e2dfd8',
      primaryColorName: 'Pieno Balta / Smėlio',
    },
    helpfulCount: 17,
    verifiedBuyer: true,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 7, // 7 days ago
  },
  {
    id: 'rev-jacket-01',
    productId: 'jacket-kinetix',
    productName: '„Kinetix“ Miesto Bomber Striukė',
    userId: 'user-matas-p',
    userName: 'Matas Paulauskas',
    rating: 5,
    title: 'Ripstop audinys atlaikė Vilniaus liūtį',
    comment:
      'Pasirinkau vandeniui atsparų Ripstop nailoną ir metalinius akcentus. Striukė lengva, bet vėjo nepraleidžia visai. 3D vizualizacijoje patiko galimybė keisti užtrauktuko aparatūrą.',
    customizedDetails: {
      garmentType: 'jacket',
      garmentName: '„Kinetix“ Bomber Striukė',
      fabricName: 'Ripstop Nailonas',
      size: 'XL',
      primaryColorHex: '#374151',
      primaryColorName: 'Grafito Pilka',
    },
    helpfulCount: 19,
    verifiedBuyer: true,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 5,
  },
  {
    id: 'rev-jacket-02',
    productId: 'jacket-kinetix',
    productName: '„Kinetix“ Miesto Bomber Striukė',
    userId: 'user-rokas-b',
    userName: 'Rokas Balčiūnas',
    rating: 4,
    title: 'Puiki konstrukcija, greitas pristatymas',
    comment:
      'Pristatė per 2 dienas į Omniva paštomatą. Siūlės dvigubos, kišenės gilios. Vienintelis minusas – norėtųsi dar daugiau spalvų pasirinkimo pamušalui, bet pats drabužis 10/10.',
    customizedDetails: {
      garmentType: 'jacket',
      garmentName: '„Kinetix“ Bomber Striukė',
      fabricName: 'Ripstop Nailonas',
      size: 'L',
      primaryColorHex: '#161618',
      primaryColorName: 'Klasikinė Juoda',
    },
    helpfulCount: 8,
    verifiedBuyer: true,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 12,
  },
  {
    id: 'rev-tee-01',
    productId: 'tshirt-core-minimal',
    productName: '„Core-01“ Baziniai Marškinėliai',
    userId: 'user-ieva-r',
    userName: 'Ieva Radzevičė',
    rating: 5,
    title: 'Sunkus, kokybiškas kritimas – tikras 240 GSM',
    comment:
      'Dauguma marškinėlių po pirmo skalbimo susisuka, o šie laiko stačiakampę streetwear formą. Personalizavau su minimalistiniu užrašu ant nugaros per Canva studiją.',
    customizedDetails: {
      garmentType: 'tshirt',
      garmentName: '„Core-01“ Marškinėliai',
      fabricName: 'Organinė Medvilnė 240GSM',
      size: 'S',
      primaryColorHex: '#161618',
      primaryColorName: 'Juoda',
    },
    helpfulCount: 15,
    verifiedBuyer: true,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 4,
  },
  {
    id: 'rev-pants-01',
    productId: 'pants-modular-cargo',
    productName: '„Modu-Cargo“ Taktikinės Kelnės',
    userId: 'user-deividas-s',
    userName: 'Deividas Stankus',
    rating: 5,
    title: 'Kišenių talpa ir audinio elastingumas – tobulai',
    comment:
      'Dydžių lentelė atitiko centimetras į centimetrą. Pasirinkau M dydį (liemuo 84 cm). Labai patogu, kad StyleLab galima apžiūrėti kišenių siūles su Macro zoom funkcija.',
    customizedDetails: {
      garmentType: 'cargo',
      garmentName: '„Modu-Cargo“ Kelnės',
      fabricName: 'Tvirtas Selvedge Džinsas',
      size: 'M',
      primaryColorHex: '#3f4f38',
      primaryColorName: 'Alyvuogių Žalia',
    },
    helpfulCount: 11,
    verifiedBuyer: true,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 8,
  },
  {
    id: 'rev-sneakers-01',
    productId: 'sneakers-strata-neo',
    productName: '„Strata-Neo“ Bioniniai Kedai',
    userId: 'user-paulius-l',
    userName: 'Paulius Laužikas',
    rating: 5,
    title: 'Futuristinis dizainas ir minkštas padas',
    comment:
      'Kedai traukia akį gatvėje. 3D laboratorijoje derinau pado ir viršutinės dalies spalvas, rezultatas gyvai atrodo dar geriau!',
    customizedDetails: {
      garmentType: 'sneakers',
      garmentName: '„Strata-Neo“ Kedai',
      fabricName: 'Reljefinė Eko Oda',
      size: 'L',
      primaryColorHex: '#e2dfd8',
      primaryColorName: 'Pieno Balta',
    },
    helpfulCount: 22,
    verifiedBuyer: true,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 2,
  },
];

// Helper to get cached reviews from local storage
export function getLocalStoredReviews(): ProductReview[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_REVIEWS_KEY);
    if (!raw) return INITIAL_PRODUCT_REVIEWS;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      // Merge with initial so standard reviews are always present
      const ids = new Set(parsed.map((p) => p.id));
      const merged = [...parsed];
      for (const init of INITIAL_PRODUCT_REVIEWS) {
        if (!ids.has(init.id)) {
          merged.push(init);
        }
      }
      return merged;
    }
    return INITIAL_PRODUCT_REVIEWS;
  } catch {
    return INITIAL_PRODUCT_REVIEWS;
  }
}

// Helper to save reviews to local storage cache
export function setLocalStoredReviews(reviews: ProductReview[]) {
  try {
    localStorage.setItem(LOCAL_STORAGE_REVIEWS_KEY, JSON.stringify(reviews));
  } catch (err) {
    console.warn('Failed to cache reviews in localStorage', err);
  }
}

// Get reviews for specific product
export function getReviewsForProduct(productId?: string): ProductReview[] {
  const all = getLocalStoredReviews();
  if (!productId || productId === 'all') return all;
  return all.filter((r) => r.productId === productId);
}

// Calculate product average rating and count
export function getProductRatingStats(productId: string): {
  averageRating: number;
  totalReviews: number;
  breakdown: Record<number, number>;
} {
  const reviews = getReviewsForProduct(productId);
  if (reviews.length === 0) {
    return {
      averageRating: 5.0,
      totalReviews: 0,
      breakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
    };
  }

  const breakdown: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  let sum = 0;

  reviews.forEach((r) => {
    const rounded = Math.min(5, Math.max(1, Math.round(r.rating)));
    breakdown[rounded] = (breakdown[rounded] || 0) + 1;
    sum += r.rating;
  });

  return {
    averageRating: parseFloat((sum / reviews.length).toFixed(1)),
    totalReviews: reviews.length,
    breakdown,
  };
}

// Add a new review and sync to Firestore
export async function addProductReview(
  input: NewReviewInput,
  user: { uid: string; displayName?: string | null; photoURL?: string | null }
): Promise<ProductReview> {
  const newReview: ProductReview = {
    id: `rev-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    productId: input.productId,
    productName: input.productName,
    userId: user.uid,
    userName: user.displayName || 'Flipukas Klientas',
    userAvatar: user.photoURL || undefined,
    rating: input.rating,
    title: input.title?.trim() || undefined,
    comment: input.comment.trim(),
    customizedDetails: input.customizedDetails,
    helpfulCount: 0,
    verifiedBuyer: true,
    createdAt: Date.now(),
  };

  // 1. Immediately save to LocalStorage cache
  const current = getLocalStoredReviews();
  const updated = [newReview, ...current];
  setLocalStoredReviews(updated);

  // 2. Persist to Firestore if available
  try {
    const docRef = doc(db, 'product_reviews', newReview.id);
    await setDoc(docRef, newReview);
  } catch (err) {
    console.warn('Firestore review sync error (using local cache):', err);
  }

  return newReview;
}

// Toggle helpful button
export function toggleHelpfulReview(reviewId: string): number {
  try {
    const votedRaw = localStorage.getItem(LOCAL_STORAGE_HELPFUL_KEY);
    const votedIds: string[] = votedRaw ? JSON.parse(votedRaw) : [];

    const isAlreadyVoted = votedIds.includes(reviewId);
    const nextVoted = isAlreadyVoted
      ? votedIds.filter((id) => id !== reviewId)
      : [...votedIds, reviewId];

    localStorage.setItem(LOCAL_STORAGE_HELPFUL_KEY, JSON.stringify(nextVoted));

    const reviews = getLocalStoredReviews();
    let updatedCount = 0;
    const mapped = reviews.map((r) => {
      if (r.id === reviewId) {
        const delta = isAlreadyVoted ? -1 : 1;
        const newCount = Math.max(0, r.helpfulCount + delta);
        updatedCount = newCount;
        return { ...r, helpfulCount: newCount };
      }
      return r;
    });

    setLocalStoredReviews(mapped);
    return updatedCount;
  } catch {
    return 0;
  }
}

export function isReviewMarkedHelpful(reviewId: string): boolean {
  try {
    const votedRaw = localStorage.getItem(LOCAL_STORAGE_HELPFUL_KEY);
    const votedIds: string[] = votedRaw ? JSON.parse(votedRaw) : [];
    return votedIds.includes(reviewId);
  } catch {
    return false;
  }
}

// Subscribe to Firestore product reviews in real-time
export function subscribeProductReviews(
  onUpdate: (reviews: ProductReview[]) => void
): () => void {
  try {
    const colRef = collection(db, 'product_reviews');
    const q = query(colRef, orderBy('createdAt', 'desc'), limit(50));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const firestoreReviews: ProductReview[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          if (data && data.productId && data.rating) {
            firestoreReviews.push(data as ProductReview);
          }
        });

        if (firestoreReviews.length > 0) {
          // Merge with initial
          const seen = new Set(firestoreReviews.map((r) => r.id));
          const merged = [...firestoreReviews];
          for (const init of INITIAL_PRODUCT_REVIEWS) {
            if (!seen.has(init.id)) {
              merged.push(init);
            }
          }
          setLocalStoredReviews(merged);
          onUpdate(merged);
        } else {
          onUpdate(getLocalStoredReviews());
        }
      },
      (err) => {
        console.warn('Real-time reviews snapshot error (fallback to local cache):', err);
        onUpdate(getLocalStoredReviews());
      }
    );

    return unsubscribe;
  } catch (err) {
    console.warn('Failed to attach review listener, using local cache:', err);
    onUpdate(getLocalStoredReviews());
    return () => {};
  }
}
