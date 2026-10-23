import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  deleteDoc,
  getDocFromServer,
  collection,
  onSnapshot,
  query,
  orderBy,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { WishlistItem } from '../types/clothing';

// Safe singleton initialization
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId); /* CRITICAL: The app will break without this line */

export const googleProvider = new GoogleAuthProvider();

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Validate Connection to Firestore on boot
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.');
    }
  }
}
testConnection();

export interface UserProfileData {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  createdAt: number;
}

const MOCK_USER_STORAGE_KEY = 'flipukas_active_user_v1';

export function getPersistedUser(): UserProfileData | null {
  try {
    const raw = localStorage.getItem(MOCK_USER_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setPersistedUser(user: UserProfileData | null) {
  try {
    if (user) {
      localStorage.setItem(MOCK_USER_STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(MOCK_USER_STORAGE_KEY);
    }
  } catch {
    // ignore
  }
}

// Sign in with Google Popup (Recommended for AI Studio preview environment)
export async function signInWithGoogle(): Promise<UserProfileData> {
  const result = await signInWithPopup(auth, googleProvider);
  const user = result.user;
  const profile: UserProfileData = {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName || user.email?.split('@')[0] || 'Flipukas Kūrėjas',
    photoURL: user.photoURL,
    createdAt: Date.now(),
  };

  try {
    const userDocRef = doc(db, 'users', user.uid);
    await setDoc(userDocRef, profile, { merge: true });
  } catch (err) {
    console.warn('Could not persist user to Firestore:', err);
  }

  setPersistedUser(profile);
  return profile;
}

// Sign out
export async function logOutUser(): Promise<void> {
  await signOut(auth);
  setPersistedUser(null);
}

// Sync Wishlist item to Firestore
export async function syncWishlistItemToCloud(userId: string, item: WishlistItem): Promise<void> {
  const path = `users/${userId}/wishlist/${item.id}`;
  try {
    const docRef = doc(db, 'users', userId, 'wishlist', item.id);
    await setDoc(docRef, {
      ...item,
      userId,
      syncedAt: Date.now(),
    });
  } catch (err) {
    console.warn('Firestore sync skipped or failed:', err);
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

// Delete Wishlist item from Firestore
export async function deleteWishlistItemFromCloud(userId: string, itemId: string): Promise<void> {
  const path = `users/${userId}/wishlist/${itemId}`;
  try {
    const docRef = doc(db, 'users', userId, 'wishlist', itemId);
    await deleteDoc(docRef);
  } catch (err) {
    console.warn('Firestore delete failed:', err);
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}

export interface WishlistComment {
  id: string;
  wishlistId: string;
  userId: string;
  authorName: string;
  content: string;
  createdAt: number;
  tag?: string;
}

const COMMENTS_STORAGE_KEY = 'flipukas_design_comments_v1';

export function getLocalComments(wishlistId: string): WishlistComment[] {
  try {
    const raw = localStorage.getItem(COMMENTS_STORAGE_KEY);
    if (!raw) return [];
    const all = JSON.parse(raw) as Record<string, WishlistComment[]>;
    return all[wishlistId] || [];
  } catch {
    return [];
  }
}

export function saveLocalComment(comment: WishlistComment): void {
  try {
    const raw = localStorage.getItem(COMMENTS_STORAGE_KEY);
    const all: Record<string, WishlistComment[]> = raw ? JSON.parse(raw) : {};
    const list = all[comment.wishlistId] || [];
    all[comment.wishlistId] = [comment, ...list.filter((c) => c.id !== comment.id)];
    localStorage.setItem(COMMENTS_STORAGE_KEY, JSON.stringify(all));
  } catch {
    // ignore
  }
}

export function removeLocalComment(wishlistId: string, commentId: string): void {
  try {
    const raw = localStorage.getItem(COMMENTS_STORAGE_KEY);
    if (!raw) return;
    const all: Record<string, WishlistComment[]> = JSON.parse(raw);
    if (all[wishlistId]) {
      all[wishlistId] = all[wishlistId].filter((c) => c.id !== commentId);
      localStorage.setItem(COMMENTS_STORAGE_KEY, JSON.stringify(all));
    }
  } catch {
    // ignore
  }
}

// Add a note / comment to a saved design (persisted to Firestore subcollection & cached locally)
export async function addDesignComment(
  userId: string,
  wishlistId: string,
  content: string,
  authorName: string,
  tag?: string
): Promise<WishlistComment> {
  const commentId = `cmt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
  const comment: WishlistComment = {
    id: commentId,
    wishlistId,
    userId,
    authorName,
    content,
    createdAt: Date.now(),
    tag,
  };

  // Always save locally for instant responsiveness & offline resilience
  saveLocalComment(comment);

  // If user is authenticated with Firebase, sync to Firestore
  if (auth.currentUser && auth.currentUser.uid === userId) {
    const path = `users/${userId}/wishlist/${wishlistId}/comments/${commentId}`;
    try {
      const commentDocRef = doc(db, 'users', userId, 'wishlist', wishlistId, 'comments', commentId);
      await setDoc(commentDocRef, comment);
    } catch (err) {
      console.warn('Could not persist comment to Firestore subcollection:', err);
      // We don't throw fatal error so UI stays silky smooth
    }
  }

  return comment;
}

// Delete note / comment
export async function deleteDesignComment(
  userId: string,
  wishlistId: string,
  commentId: string
): Promise<void> {
  removeLocalComment(wishlistId, commentId);

  if (auth.currentUser && auth.currentUser.uid === userId) {
    const path = `users/${userId}/wishlist/${wishlistId}/comments/${commentId}`;
    try {
      const commentDocRef = doc(db, 'users', userId, 'wishlist', wishlistId, 'comments', commentId);
      await deleteDoc(commentDocRef);
    } catch (err) {
      console.warn('Could not delete comment from Firestore:', err);
    }
  }
}

// Subscribe to real-time comments on a wishlist item in Firestore
export function subscribeDesignComments(
  userId: string | null,
  wishlistId: string,
  onUpdate: (comments: WishlistComment[]) => void
): () => void {
  // Always supply local comments first
  const localList = getLocalComments(wishlistId);
  onUpdate(localList);

  if (!userId || !auth.currentUser || auth.currentUser.uid !== userId) {
    return () => {};
  }

  try {
    const commentsCol = collection(db, 'users', userId, 'wishlist', wishlistId, 'comments');
    const q = query(commentsCol, orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const cloudComments: WishlistComment[] = [];
        snapshot.forEach((docSnap) => {
          cloudComments.push(docSnap.data() as WishlistComment);
        });
        if (cloudComments.length > 0) {
          // Merge cloud comments with local
          const combined = [...cloudComments];
          localList.forEach((lc) => {
            if (!combined.some((c) => c.id === lc.id)) {
              combined.push(lc);
            }
          });
          combined.sort((a, b) => b.createdAt - a.createdAt);
          onUpdate(combined);
        }
      },
      (err) => {
        console.warn('Comments listener warning:', err.message);
      }
    );
    return unsubscribe;
  } catch (err) {
    console.warn('Could not setup Firestore comments listener:', err);
    return () => {};
  }
}

