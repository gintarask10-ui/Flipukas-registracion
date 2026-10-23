import { CustomizationState, Product } from '../types/clothing';

export interface DecodedShareData {
  productId?: string;
  fabricId?: string;
  customization?: Partial<CustomizationState>;
  sharedAt?: number;
}

/**
 * Encodes the current customization state, fabric choice, and product ID into a shareable URL.
 */
export function generateShareableUrl(
  productId: string,
  customization: CustomizationState,
  fabricId: string
): string {
  try {
    const compactState = {
      p: productId,
      f: fabricId || customization.fabricId,
      col: customization.primaryColor,
      col2: customization.secondaryColor,
      col3: customization.accentColor,
      hw: customization.hardwareColor,
      sz: customization.size,
      fit: customization.fitMode,
      txt: customization.customText || '',
      bdg: customization.badgeType,
      cam: customization.cameraPreset,
      pat: customization.pattern
        ? {
            t: customization.pattern.type,
            s: customization.pattern.scale,
            p: customization.pattern.primaryColor,
            sec: customization.pattern.secondaryColor,
            o: customization.pattern.opacity,
            r: customization.pattern.rotation,
          }
        : undefined,
      t: Date.now(),
    };

    const jsonString = JSON.stringify(compactState);
    const base64Data = btoa(encodeURIComponent(jsonString));

    const url = new URL(window.location.href);
    url.searchParams.set('share', '1');
    url.searchParams.set('product', productId);
    url.searchParams.set('fabric', fabricId || customization.fabricId);
    url.searchParams.set('size', customization.size);
    url.searchParams.set('color', encodeURIComponent(customization.primaryColor));
    url.searchParams.set('design', base64Data);

    return url.toString();
  } catch (err) {
    console.error('Failed to encode shareable URL:', err);
    // Fallback simple query string
    const fallbackUrl = new URL(window.location.href);
    fallbackUrl.searchParams.set('share', '1');
    fallbackUrl.searchParams.set('product', productId);
    fallbackUrl.searchParams.set('fabric', fabricId);
    fallbackUrl.searchParams.set('size', customization.size);
    return fallbackUrl.toString();
  }
}

/**
 * Decodes the customization state, fabric choice, and product ID from URL query parameters.
 */
export function parseShareableUrl(): DecodedShareData | null {
  if (typeof window === 'undefined') return null;

  try {
    const urlParams = new URLSearchParams(window.location.search);
    const isShare = urlParams.get('share') === '1' || urlParams.has('design') || urlParams.has('product');

    if (!isShare) return null;

    const base64Design = urlParams.get('design');
    const productId = urlParams.get('product') || undefined;
    const fabricId = urlParams.get('fabric') || undefined;
    const size = urlParams.get('size') as CustomizationState['size'] | null;
    const color = urlParams.get('color');

    if (base64Design) {
      try {
        const decodedJson = decodeURIComponent(atob(base64Design));
        const parsed = JSON.parse(decodedJson);

        const partialCustomization: Partial<CustomizationState> = {};
        if (parsed.col) partialCustomization.primaryColor = parsed.col;
        if (parsed.col2) partialCustomization.secondaryColor = parsed.col2;
        if (parsed.col3) partialCustomization.accentColor = parsed.col3;
        if (parsed.hw) partialCustomization.hardwareColor = parsed.hw;
        if (parsed.sz) partialCustomization.size = parsed.sz;
        if (parsed.fit) partialCustomization.fitMode = parsed.fit;
        if (parsed.txt !== undefined) partialCustomization.customText = parsed.txt;
        if (parsed.bdg) partialCustomization.badgeType = parsed.bdg;
        if (parsed.cam) partialCustomization.cameraPreset = parsed.cam;
        if (parsed.f) partialCustomization.fabricId = parsed.f;
        if (parsed.pat) {
          partialCustomization.pattern = {
            type: parsed.pat.t,
            scale: parsed.pat.s,
            primaryColor: parsed.pat.p,
            secondaryColor: parsed.pat.sec,
            opacity: parsed.pat.o,
            rotation: parsed.pat.r,
          };
        }

        return {
          productId: parsed.p || productId,
          fabricId: parsed.f || fabricId,
          customization: partialCustomization,
          sharedAt: parsed.t,
        };
      } catch (e) {
        console.warn('Failed to parse compact base64 design:', e);
      }
    }

    // Fallback individual query parameters
    if (productId) {
      const fallbackCustomization: Partial<CustomizationState> = {};
      if (fabricId) fallbackCustomization.fabricId = fabricId;
      if (size) fallbackCustomization.size = size;
      if (color) fallbackCustomization.primaryColor = decodeURIComponent(color);

      return {
        productId,
        fabricId,
        customization: fallbackCustomization,
      };
    }

    return null;
  } catch (err) {
    console.error('Error parsing shareable URL:', err);
    return null;
  }
}

/**
 * Copies the shareable URL to clipboard with fallback.
 */
export async function copyShareableLinkToClipboard(
  productId: string,
  customization: CustomizationState,
  fabricId: string
): Promise<boolean> {
  const shareUrl = generateShareableUrl(productId, customization, fabricId);

  try {
    if (navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(shareUrl);
      return true;
    }
  } catch (err) {
    console.warn('Navigator clipboard failed, trying execCommand fallback:', err);
  }

  // Fallback for iframe / unsupported browsers
  try {
    const textArea = document.createElement('textarea');
    textArea.value = shareUrl;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);
    return successful;
  } catch (fallbackErr) {
    console.error('execCommand copy fallback failed:', fallbackErr);
    return false;
  }
}
