/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, onSnapshot } from 'firebase/firestore';
import { CartDrawer } from './components/CartDrawer';
import { SideBySideComparisonModal } from './components/Comparison/SideBySideComparisonModal';
import { Footer } from './components/Footer';
import { Hero } from './components/Hero';
import { Navbar } from './components/Navbar';
import { ProductCatalog } from './components/ProductCatalog';
import { StyleLab } from './components/StyleLab/StyleLab';
import { TechFabricShowcase } from './components/TechFabricShowcase';
import { WishlistModal } from './components/Wishlist/WishlistModal';
import { UserProfileModal } from './components/Auth/UserProfileModal';
import { OrderTrackingModal } from './components/Orders/OrderTrackingModal';
import { SEOHead } from './components/SEO/SEOHead';
import { CookieConsentBanner } from './components/Legal/CookieConsentBanner';
import { AIReviewModal } from './components/AIReviewModal';
import { FABRICS, PRODUCTS } from './data/products';
import { CartItem, CustomizationState, FabricMaterial, Product, WishlistItem } from './types/clothing';
import { addWishlistItem, getStoredWishlist, removeWishlistItem } from './utils/wishlistStorage';
import { parseShareableUrl } from './utils/shareUtils';
import { Bot, CheckCircle2, Sparkles, X } from 'lucide-react';
import {
  auth,
  db,
  getPersistedUser,
  UserProfileData,
  syncWishlistItemToCloud,
  deleteWishlistItemFromCloud,
  handleFirestoreError,
  OperationType,
} from './services/firebase';

export default function App() {
  const [selectedProduct, setSelectedProduct] = useState<Product>(PRODUCTS[0]);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // User Profile & Firebase Auth State
  const [currentUser, setCurrentUser] = useState<UserProfileData | null>(() => getPersistedUser());
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Wishlist State (Persistent)
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>(() => getStoredWishlist());
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);

  // Side-by-Side Comparison State
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const [compareItemA, setCompareItemA] = useState<WishlistItem | null>(null);
  const [compareItemB, setCompareItemB] = useState<WishlistItem | null>(null);

  // Active 3D Model tracker for Comparison
  const [activeCustomization, setActiveCustomization] = useState<CustomizationState | null>(null);
  const [activeFabric, setActiveFabric] = useState<FabricMaterial>(FABRICS[0]);
  const [activePrice, setActivePrice] = useState<number>(PRODUCTS[0].basePrice);

  // External customization to restore into 3D Lab
  const [customizationToLoad, setCustomizationToLoad] = useState<{
    product: Product;
    customization: CustomizationState;
    timestamp: number;
  } | null>(null);

  // Real-time Order Tracking Simulation State
  const [isOrderTrackingOpen, setIsOrderTrackingOpen] = useState(false);
  const [orderTrackingNumber, setOrderTrackingNumber] = useState<string | null>(null);
  const [sharedLoadedNotice, setSharedLoadedNotice] = useState<string | null>(null);
  const [activePromoCode, setActivePromoCode] = useState<string | null>(null);
  const [isAIReviewOpen, setIsAIReviewOpen] = useState(false);

  const handleOpenOrderTracking = (trackingNum?: string) => {
    if (trackingNum) {
      setOrderTrackingNumber(trackingNum);
    }
    setIsOrderTrackingOpen(true);
  };

  const handleApplyFabricFromShowcase = (fabric: FabricMaterial) => {
    setActiveFabric(fabric);
    if (activeCustomization) {
      setCustomizationToLoad({
        product: selectedProduct,
        customization: {
          ...activeCustomization,
          fabricId: fabric.id,
        },
        timestamp: Date.now(),
      });
    }
    handleScrollToLab();
  };

  // Check URL query parameters on initial load for shared 3D customization link
  useEffect(() => {
    const sharedData = parseShareableUrl();
    if (sharedData && sharedData.productId) {
      const match = PRODUCTS.find(
        (p) => p.id === sharedData.productId || p.slug === sharedData.productId
      );
      if (match) {
        setSelectedProduct(match);

        const defaultCustomization: CustomizationState = {
          primaryColor: sharedData.customization?.primaryColor || match.defaultColors.primary,
          secondaryColor: sharedData.customization?.secondaryColor || match.defaultColors.secondary,
          accentColor: sharedData.customization?.accentColor || match.defaultColors.accent,
          hardwareColor: sharedData.customization?.hardwareColor || '#1c1917',
          fabricId: sharedData.fabricId || sharedData.customization?.fabricId || 'tech-cotton',
          badgeType: sharedData.customization?.badgeType || 'flipukas',
          customText: sharedData.customization?.customText || '',
          pattern: sharedData.customization?.pattern || {
            type: 'none',
            scale: 1,
            primaryColor: '#ffffff',
            secondaryColor: '#000000',
            opacity: 1,
            rotation: 0,
          },
          macroZone: 'full',
          placement: 'chest',
          studioTheme: 'auto',
          studioBrightness: 1,
          size: sharedData.customization?.size || 'L',
          fitMode: sharedData.customization?.fitMode || 'regular',
          wireframe: false,
          exploded: false,
          lightingPreset: 'studio',
          cameraPreset: sharedData.customization?.cameraPreset || 'front',
          autoRotate: false,
        };

        setCustomizationToLoad({
          product: match,
          customization: defaultCustomization,
          timestamp: Date.now(),
        });

        const fabricName =
          FABRICS.find((f) => f.id === defaultCustomization.fabricId)?.nameLt ||
          'Parinktas audinys';
        setSharedLoadedNotice(
          `Atvertas bendrinamas dizainas: ${match.name} (${fabricName}, Dydis: ${defaultCustomization.size})`
        );

        setTimeout(() => {
          const el = document.getElementById('style-lab');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }, 500);

        setTimeout(() => setSharedLoadedNotice(null), 7000);
      }
    }
  }, []);

  // Track Firebase Auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        const profile: UserProfileData = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Flipukas Kūrėjas',
          photoURL: firebaseUser.photoURL,
          createdAt: Date.now(),
        };
        setCurrentUser(profile);
      }
    });
    return () => unsubscribe();
  }, []);

  // Real-time Firestore sync for authenticated user's wishlist
  useEffect(() => {
    if (!currentUser?.uid) return;
    const path = `users/${currentUser.uid}/wishlist`;
    const wishlistCol = collection(db, 'users', currentUser.uid, 'wishlist');
    const unsubscribe = onSnapshot(
      wishlistCol,
      (snapshot) => {
        const cloudItems: WishlistItem[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          if (data && data.id && data.product && data.customization) {
            cloudItems.push(data as WishlistItem);
          }
        });
        if (cloudItems.length > 0) {
          setWishlistItems(cloudItems);
        }
      },
      (err) => {
        handleFirestoreError(err, OperationType.LIST, path);
      }
    );
    return () => unsubscribe();
  }, [currentUser?.uid]);

  // Navigate straight to 3D Lab
  const handleScrollToLab = () => {
    const el = document.getElementById('style-lab');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Select a product from the catalog to customize in 3D Lab (optionally preselecting size)
  const handleCustomizeProduct = (
    product: Product,
    initialSize?: 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL'
  ) => {
    setSelectedProduct(product);
    if (initialSize) {
      setCustomizationToLoad({
        product,
        customization: {
          primaryColor: product.defaultColors.primary,
          secondaryColor: product.defaultColors.secondary,
          accentColor: product.defaultColors.accent,
          hardwareColor: '#1c1917',
          fabricId: 'tech-cotton',
          badgeType: 'flipukas',
          customText: '',
          pattern: {
            type: 'none',
            scale: 1,
            primaryColor: '#ffffff',
            secondaryColor: '#000000',
            opacity: 1,
            rotation: 0,
          },
          macroZone: 'full',
          placement: 'chest',
          studioTheme: 'auto',
          studioBrightness: 1,
          size: initialSize,
          fitMode: 'regular',
          wireframe: false,
          exploded: false,
          lightingPreset: 'studio',
          cameraPreset: 'front',
          autoRotate: false,
        },
        timestamp: Date.now(),
      });
    }
    handleScrollToLab();
  };

  // Add custom garment configuration to cart
  const handleAddToCart = (
    product: Product,
    customization: CustomizationState,
    fabric: FabricMaterial,
    unitPrice: number
  ) => {
    const newItem: CartItem = {
      cartItemId: `${product.id}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      product,
      customization: { ...customization },
      quantity: 1,
      unitPrice,
    };

    setCartItems((prev) => [newItem, ...prev]);
    setIsCartOpen(true);
  };

  // Wishlist Actions with Firestore Cloud Persistence
  const handleAddToWishlist = (
    product: Product,
    customization: CustomizationState,
    fabric: FabricMaterial,
    price: number,
    snapshotUrl?: string
  ) => {
    const updated = addWishlistItem(
      product,
      customization,
      fabric,
      price,
      snapshotUrl
    );
    setWishlistItems(updated);

    // Sync to cloud if user is authenticated
    if (currentUser?.uid && updated[0]) {
      syncWishlistItemToCloud(currentUser.uid, updated[0]).catch((err) => {
        console.warn('Could not sync wishlist item to cloud:', err);
      });
    }
  };

  const handleRemoveFromWishlist = (id: string) => {
    const updated = removeWishlistItem(id);
    setWishlistItems(updated);

    // Remove from cloud if user is authenticated
    if (currentUser?.uid) {
      deleteWishlistItemFromCloud(currentUser.uid, id).catch((err) => {
        console.warn('Could not delete wishlist item from cloud:', err);
      });
    }
  };

  // Load a saved or compared design into the 3D viewer
  const handleLoadInLab = (product: Product, customization: CustomizationState) => {
    setSelectedProduct(product);
    setCustomizationToLoad({
      product,
      customization,
      timestamp: Date.now(),
    });
    handleScrollToLab();
  };

  // Open Compare Modal
  const handleOpenCompare = (itemA?: WishlistItem, itemB?: WishlistItem) => {
    setCompareItemA(itemA || null);
    setCompareItemB(itemB || null);
    setIsCompareOpen(true);
  };

  // Update item quantity
  const handleUpdateQuantity = (cartItemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      handleRemoveItem(cartItemId);
      return;
    }
    setCartItems((prev) =>
      prev.map((item) => (item.cartItemId === cartItemId ? { ...item, quantity: newQuantity } : item))
    );
  };

  // Remove item from cart
  const handleRemoveItem = (cartItemId: string) => {
    setCartItems((prev) => prev.filter((item) => item.cartItemId !== cartItemId));
  };

  const handleClearCart = () => {
    setCartItems([]);
  };

  const totalCartCount = cartItems.reduce((acc, curr) => acc + curr.quantity, 0);

  return (
    <div className="min-h-screen bg-[#0c0c10] text-[#edebe6] flex flex-col selection:bg-[#d4af37] selection:text-stone-950">
      {/* Toast Notice when loaded via shared link */}
      {sharedLoadedNotice && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-lg px-4 animate-in fade-in slide-in-from-top-4 duration-300 pointer-events-auto">
          <div className="bg-neutral-900/95 border border-amber-400/60 rounded-2xl p-4 shadow-2xl backdrop-blur-md flex items-center justify-between gap-3 text-xs text-amber-300">
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
              <span className="font-medium text-white">{sharedLoadedNotice}</span>
            </div>
            <button
              onClick={() => setSharedLoadedNotice(null)}
              className="p-1 rounded-lg hover:bg-neutral-800 text-neutral-400 hover:text-white transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Dynamic SEO Meta Injection & Structured Data */}
      <SEOHead
        product={selectedProduct}
        fabric={activeFabric}
        customization={activeCustomization || undefined}
      />

      {/* Top Bar Header */}
      <Navbar
        cartCount={totalCartCount}
        wishlistCount={wishlistItems.length}
        currentUser={currentUser}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenWishlist={() => setIsWishlistOpen(true)}
        onOpenProfile={() => setIsProfileOpen(true)}
        onOpenCompare={() => handleOpenCompare()}
        onNavigateLab={handleScrollToLab}
        onOpenAIReview={() => setIsAIReviewOpen(true)}
      />

      <main className="flex-1 flex flex-col">
        {/* Hero Section */}
        <Hero onOpenLab={handleScrollToLab} />

        {/* 3D Interactive Style Lab (Centerpiece of the application) */}
        <StyleLab
          selectedProduct={selectedProduct}
          onSelectProduct={setSelectedProduct}
          onAddToCart={handleAddToCart}
          wishlistItems={wishlistItems}
          onAddToWishlist={handleAddToWishlist}
          onOpenWishlist={() => setIsWishlistOpen(true)}
          onOpenCompare={(itemA, itemB) => handleOpenCompare(itemA, itemB)}
          customizationToLoad={customizationToLoad}
          currentUser={currentUser}
          onCustomizationStateChange={(c, f, p) => {
            setActiveCustomization(c);
            setActiveFabric(f);
            setActivePrice(p);
          }}
        />

        {/* Curated Product Catalog Grid with Reviews and Size Guide */}
        <ProductCatalog
          onCustomizeProduct={handleCustomizeProduct}
          currentUser={currentUser}
          onOpenAuth={() => setIsProfileOpen(true)}
        />

        {/* Technology & Tactile Fabrics Breakdown with 2D Macro Weave Inspector */}
        <TechFabricShowcase onSelectFabric={handleApplyFabricFromShowcase} />
      </main>

      {/* Cart & Checkout Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onClearCart={handleClearCart}
        onOpenOrderTracking={handleOpenOrderTracking}
        initialPromoCode={activePromoCode}
      />

      {/* Wishlist Modal */}
      <WishlistModal
        isOpen={isWishlistOpen}
        onClose={() => setIsWishlistOpen(false)}
        items={wishlistItems}
        onRemoveItem={handleRemoveFromWishlist}
        onLoadInLab={(item) => handleLoadInLab(item.product, item.customization)}
        onAddToCart={handleAddToCart}
        onOpenCompare={(itemA, itemB) => handleOpenCompare(itemA, itemB)}
      />

      {/* User Profile & 3D Garment Gallery Modal (Firebase Account + Style Milestones) */}
      <UserProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        currentUser={currentUser}
        onUserChange={setCurrentUser}
        wishlistItems={wishlistItems}
        onRemoveWishlistItem={handleRemoveFromWishlist}
        onLoadInLab={(item) => handleLoadInLab(item.product, item.customization)}
        onAddToCart={handleAddToCart}
        onOpenOrderTracking={handleOpenOrderTracking}
        onApplyPromoCodeToCart={(code) => {
          setActivePromoCode(code);
          setIsCartOpen(true);
        }}
      />

      {/* Real-time Order Tracking Simulation Modal */}
      <OrderTrackingModal
        isOpen={isOrderTrackingOpen}
        onClose={() => setIsOrderTrackingOpen(false)}
        initialOrderNumber={orderTrackingNumber || undefined}
      />

      {/* Side-by-Side Comparison Modal */}
      {activeCustomization && (
        <SideBySideComparisonModal
          isOpen={isCompareOpen}
          onClose={() => setIsCompareOpen(false)}
          activeCustomization={activeCustomization}
          activeProduct={selectedProduct}
          activeFabric={activeFabric}
          activePrice={activePrice}
          wishlistItems={wishlistItems}
          initialItemA={compareItemA}
          initialItemB={compareItemB}
          onLoadInLab={handleLoadInLab}
          onAddToCart={handleAddToCart}
          onSaveToWishlist={handleAddToWishlist}
        />
      )}

      {/* Brand Footer */}
      <Footer
        onOpenCookieSettings={() => window.dispatchEvent(new CustomEvent('open-cookie-settings'))}
        onOpenAIReview={() => setIsAIReviewOpen(true)}
      />

      {/* Floating AI Dossier Quick Trigger */}
      <button
        onClick={() => setIsAIReviewOpen(true)}
        className="fixed bottom-6 left-6 z-40 bg-[#0e0e13]/95 border border-[#d4af37]/50 text-[#d4af37] px-3.5 py-2.5 rounded-2xl shadow-[0_4px_30px_rgba(0,0,0,0.7)] flex items-center gap-2.5 hover:bg-[#d4af37] hover:text-stone-950 transition-all font-mono text-xs cursor-pointer group backdrop-blur-md"
        title="Atidaryti projekto dosjė ir nukopijuoti promptą kitam AI"
      >
        <Bot className="w-4 h-4 group-hover:scale-110 transition-transform" />
        <span className="font-bold hidden sm:inline">Eksportas Kitam AI</span>
        <span className="font-bold sm:hidden">AI Dosjė</span>
        <span className="text-[10px] bg-[#d4af37]/20 group-hover:bg-stone-900/30 px-1.5 py-0.5 rounded font-mono">.MD</span>
      </button>

      {/* AI Review & Dossier Modal */}
      <AIReviewModal
        isOpen={isAIReviewOpen}
        onClose={() => setIsAIReviewOpen(false)}
      />

      {/* GDPR Compliant Cookie Consent Banner (Fixed at Bottom on initial load) */}
      <CookieConsentBanner />
    </div>
  );
}
