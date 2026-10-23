import { useCallback, useEffect, useRef, useState } from 'react';
import { CustomizationState, Product } from '../../types/clothing';
import {
  createDefaultGarmentLayers,
  renderLayersToCanvas,
} from '../../utils/garmentCanvasRenderer';

export interface StyleLabSnapshot {
  customization: CustomizationState;
  canvasDataUrl: string | null;
  actionLabel: string;
  timestamp: number;
}

interface UseStyleLabHistoryProps {
  initialProduct: Product;
  initialCustomization: CustomizationState;
}

export const useStyleLabHistory = ({
  initialProduct,
  initialCustomization,
}: UseStyleLabHistoryProps) => {
  // If layers are not provided, initialize with defaults
  const resolvedInitialCustomization: CustomizationState = {
    ...initialCustomization,
    layers:
      initialCustomization.layers ||
      createDefaultGarmentLayers(
        initialProduct.defaultColors.primary,
        initialProduct.defaultColors.accent
      ),
  };

  // Initial rendered canvas from layers
  const initialCanvas = resolvedInitialCustomization.layers
    ? renderLayersToCanvas(resolvedInitialCustomization.layers)
    : null;
  const initialCanvasDataUrl = initialCanvas ? initialCanvas.toDataURL('image/png') : null;

  // Current active customization state
  const [customization, setCustomizationState] = useState<CustomizationState>(
    resolvedInitialCustomization
  );
  const [activeDrawingCanvas, setActiveDrawingCanvasState] =
    useState<HTMLCanvasElement | null>(initialCanvas);

  // History stack
  const [history, setHistory] = useState<StyleLabSnapshot[]>([
    {
      customization: resolvedInitialCustomization,
      canvasDataUrl: initialCanvasDataUrl,
      actionLabel: `Pradinis ${initialProduct.name}`,
      timestamp: Date.now(),
    },
  ]);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Temporary feedback toast for undo/redo
  const [actionNotice, setActionNotice] = useState<string | null>(null);
  const toastTimeoutRef = useRef<number | null>(null);

  const showNotice = useCallback((text: string) => {
    if (toastTimeoutRef.current) {
      window.clearTimeout(toastTimeoutRef.current);
    }
    setActionNotice(text);
    toastTimeoutRef.current = window.setTimeout(() => {
      setActionNotice(null);
    }, 2400);
  }, []);

  // Track the current canvas data URL to avoid re-serializing repeatedly
  const currentCanvasDataUrlRef = useRef<string | null>(initialCanvasDataUrl);

  // Helper to serialize canvas
  const getCanvasDataUrl = useCallback((canvas: HTMLCanvasElement | null): string | null => {
    if (!canvas) return null;
    try {
      return canvas.toDataURL('image/png');
    } catch {
      return null;
    }
  }, []);

  // Update canvas state & register to history
  const updateDrawingCanvas = useCallback((canvas: HTMLCanvasElement | null, actionLabel = 'Pakeistas piešinys / grafika') => {
    const dataUrl = getCanvasDataUrl(canvas);
    currentCanvasDataUrlRef.current = dataUrl;
    setActiveDrawingCanvasState(canvas);

    setHistory((prevHistory) => {
      const sliced = prevHistory.slice(0, currentIndex + 1);
      const newSnapshot: StyleLabSnapshot = {
        customization,
        canvasDataUrl: dataUrl,
        actionLabel,
        timestamp: Date.now(),
      };
      // Keep max 40 entries
      const updated = [...sliced, newSnapshot].slice(-40);
      setCurrentIndex(updated.length - 1);
      return updated;
    });
  }, [currentIndex, customization, getCanvasDataUrl]);

  // Main customization updater
  const updateCustomization = useCallback(
    (
      action: Partial<CustomizationState> | ((prev: CustomizationState) => CustomizationState),
      actionLabel = 'Pakeistas nustatymas',
      debounceMs = 0
    ) => {
      setCustomizationState((prevCustomization) => {
        const nextCustomization: CustomizationState =
          typeof action === 'function' ? action(prevCustomization) : { ...prevCustomization, ...action };

        // Check if there is an actual change to prevent duplicate history records
        if (JSON.stringify(prevCustomization) === JSON.stringify(nextCustomization)) {
          return prevCustomization;
        }

        // Add to history
        setHistory((prevHistory) => {
          const sliced = prevHistory.slice(0, currentIndex + 1);
          const newSnapshot: StyleLabSnapshot = {
            customization: nextCustomization,
            canvasDataUrl: currentCanvasDataUrlRef.current,
            actionLabel,
            timestamp: Date.now(),
          };
          const updated = [...sliced, newSnapshot].slice(-40);
          setCurrentIndex(updated.length - 1);
          return updated;
        });

        return nextCustomization;
      });
    },
    [currentIndex]
  );

  // Restore canvas from snapshot data URL
  const restoreCanvasFromDataUrl = useCallback((dataUrl: string | null) => {
    currentCanvasDataUrlRef.current = dataUrl;
    if (!dataUrl) {
      setActiveDrawingCanvasState(null);
      return;
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const offscreen = document.createElement('canvas');
      offscreen.width = img.width || 512;
      offscreen.height = img.height || 512;
      const ctx = offscreen.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0);
        setActiveDrawingCanvasState(offscreen);
      }
    };
    img.src = dataUrl;
  }, []);

  // UNDO
  const undo = useCallback(() => {
    if (currentIndex <= 0) return;
    const targetIndex = currentIndex - 1;
    const target = history[targetIndex];
    if (!target) return;

    setCurrentIndex(targetIndex);
    setCustomizationState(target.customization);
    restoreCanvasFromDataUrl(target.canvasDataUrl);
    showNotice(`↶ Atšaukta: ${history[currentIndex]?.actionLabel || 'pakeitimas'}`);
  }, [currentIndex, history, restoreCanvasFromDataUrl, showNotice]);

  // REDO
  const redo = useCallback(() => {
    if (currentIndex >= history.length - 1) return;
    const targetIndex = currentIndex + 1;
    const target = history[targetIndex];
    if (!target) return;

    setCurrentIndex(targetIndex);
    setCustomizationState(target.customization);
    restoreCanvasFromDataUrl(target.canvasDataUrl);
    showNotice(`↷ Grąžinta: ${target.actionLabel || 'pakeitimas'}`);
  }, [currentIndex, history, restoreCanvasFromDataUrl, showNotice]);

  // Reset to initial state
  const resetToInitial = useCallback((product: Product) => {
    const defaultLayers = createDefaultGarmentLayers(
      product.defaultColors.primary,
      product.defaultColors.accent
    );
    const freshCanvas = renderLayersToCanvas(defaultLayers);
    const freshDataUrl = freshCanvas ? freshCanvas.toDataURL('image/png') : null;

    const freshCustomization: CustomizationState = {
      ...customization,
      primaryColor: product.defaultColors.primary,
      secondaryColor: product.defaultColors.secondary,
      accentColor: product.defaultColors.accent,
      badgeType: 'flipukas',
      customText: 'FLIPUKAS',
      pattern: {
        type: 'none',
        scale: 3,
        primaryColor: product.defaultColors.primary,
        secondaryColor: '#f59e0b',
        opacity: 0.85,
        rotation: 0,
        visible: true,
        locked: false,
      },
      layers: defaultLayers,
      macroZone: 'full',
      placement: 'chest',
      wireframe: false,
      exploded: false,
    };

    currentCanvasDataUrlRef.current = freshDataUrl;
    setActiveDrawingCanvasState(freshCanvas);
    setCustomizationState(freshCustomization);

    setHistory((prev) => {
      const sliced = prev.slice(0, currentIndex + 1);
      const newSnapshot: StyleLabSnapshot = {
        customization: freshCustomization,
        canvasDataUrl: freshDataUrl,
        actionLabel: 'Atkurta pradinė būsena',
        timestamp: Date.now(),
      };
      const updated = [...sliced, newSnapshot].slice(-40);
      setCurrentIndex(updated.length - 1);
      return updated;
    });

    showNotice('🔄 Atkurta pradinė drabužio būsena');
  }, [currentIndex, customization, showNotice]);

  // Global Keyboard shortcuts: Ctrl+Z / Cmd+Z, Ctrl+Y / Cmd+Shift+Z
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input or textarea
      const target = e.target as HTMLElement;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable)
      ) {
        return;
      }

      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const isCmdOrCtrl = isMac ? e.metaKey : e.ctrlKey;

      if (!isCmdOrCtrl) return;

      if (e.key === 'z' || e.key === 'Z') {
        if (e.shiftKey) {
          // Redo on Ctrl+Shift+Z or Cmd+Shift+Z
          e.preventDefault();
          redo();
        } else {
          // Undo on Ctrl+Z or Cmd+Z
          e.preventDefault();
          undo();
        }
      } else if (e.key === 'y' || e.key === 'Y') {
        // Redo on Ctrl+Y
        e.preventDefault();
        redo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo]);

  return {
    customization,
    setCustomization: updateCustomization,
    activeDrawingCanvas,
    setActiveDrawingCanvas: updateDrawingCanvas,
    canUndo: currentIndex > 0,
    canRedo: currentIndex < history.length - 1,
    undo,
    redo,
    resetToInitial,
    historyLength: history.length,
    currentIndex,
    currentActionLabel: history[currentIndex]?.actionLabel || '',
    actionNotice,
  };
};
