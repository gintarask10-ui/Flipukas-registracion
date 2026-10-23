import React, { useEffect, useRef, useState } from 'react';
import {
  Check,
  Copy,
  Download,
  ExternalLink,
  Image as ImageIcon,
  Layers,
  Send,
  Share2,
  Sparkles,
  X,
} from 'lucide-react';
import { CustomizationState, FabricMaterial, Product } from '../../types/clothing';
import { generateShareableUrl } from '../../utils/shareUtils';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product;
  customization: CustomizationState;
  fabric: FabricMaterial;
  price: number;
}

type CardFormat = 'square' | 'story' | 'pin' | 'landscape' | 'transparent';
type CardTheme = 'studio-light' | 'dark-obsidian' | 'amber-sunset' | 'transparent';

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  product,
  customization,
  fabric,
  price,
}) => {
  const [format, setFormat] = useState<CardFormat>('square');
  const [theme, setTheme] = useState<CardTheme>('studio-light');
  const [includeDetails, setIncludeDetails] = useState(true);
  const [previewDataUrl, setPreviewDataUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedImage, setCopiedImage] = useState(false);
  const [shareSuccess, setShareSuccess] = useState<string | null>(null);

  const previewCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const rawGarmentImageRef = useRef<HTMLImageElement | null>(null);

  // Capture the raw 3D canvas when modal opens
  useEffect(() => {
    if (!isOpen) return;

    setIsGenerating(true);
    const canvas = (document.getElementById('three-garment-canvas') ||
      document.querySelector('#style-lab canvas') ||
      document.querySelector('canvas')) as HTMLCanvasElement | null;

    if (canvas) {
      try {
        const rawDataUri = canvas.toDataURL('image/png');
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          rawGarmentImageRef.current = img;
          renderExportCard(img, format, theme, includeDetails);
        };
        img.src = rawDataUri;
      } catch (err) {
        console.error('Failed to capture canvas:', err);
        setIsGenerating(false);
      }
    } else {
      setIsGenerating(false);
    }
  }, [isOpen]);

  // Re-render export card when format, theme, or includeDetails changes
  useEffect(() => {
    if (!isOpen || !rawGarmentImageRef.current) return;
    renderExportCard(rawGarmentImageRef.current, format, theme, includeDetails);
  }, [format, theme, includeDetails, isOpen]);

  // Render high-res social card on offscreen canvas
  const renderExportCard = (
    garmentImg: HTMLImageElement,
    cardFormat: CardFormat,
    cardTheme: CardTheme,
    showDetails: boolean
  ) => {
    let width = 1080;
    let height = 1080;

    if (cardFormat === 'story') {
      width = 1080;
      height = 1920;
    } else if (cardFormat === 'pin') {
      width = 1000;
      height = 1500; // 2:3 Pinterest optimal ratio
    } else if (cardFormat === 'landscape') {
      width = 1200;
      height = 630;
    } else if (cardFormat === 'transparent') {
      width = 1080;
      height = 1080;
    }

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      setIsGenerating(false);
      return;
    }

    // 1. Draw Background
    if (cardFormat === 'transparent' || cardTheme === 'transparent') {
      ctx.clearRect(0, 0, width, height);
    } else if (cardTheme === 'studio-light') {
      const grad = ctx.createRadialGradient(
        width / 2,
        height * 0.45,
        100,
        width / 2,
        height / 2,
        width * 0.75
      );
      grad.addColorStop(0, '#f8fafc');
      grad.addColorStop(0.5, '#f1f5f9');
      grad.addColorStop(1, '#e2e8f0');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // Soft ground contact shadow
      ctx.save();
      const shadowGrad = ctx.createRadialGradient(
        width / 2,
        height * 0.78,
        30,
        width / 2,
        height * 0.78,
        width * 0.38
      );
      shadowGrad.addColorStop(0, 'rgba(15, 23, 42, 0.16)');
      shadowGrad.addColorStop(1, 'rgba(15, 23, 42, 0)');
      ctx.fillStyle = shadowGrad;
      ctx.beginPath();
      ctx.ellipse(width / 2, height * 0.78, width * 0.36, 45, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    } else if (cardTheme === 'dark-obsidian') {
      const grad = ctx.createLinearGradient(0, 0, width, height);
      grad.addColorStop(0, '#090d16');
      grad.addColorStop(0.5, '#0f172a');
      grad.addColorStop(1, '#020617');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // Subtle atmospheric grid
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
      ctx.lineWidth = 1;
      const gridSize = 40;
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }
    } else if (cardTheme === 'amber-sunset') {
      const grad = ctx.createLinearGradient(0, 0, 0, height);
      grad.addColorStop(0, '#1c1917');
      grad.addColorStop(0.65, '#292524');
      grad.addColorStop(1, '#451a03');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // Warm glow behind garment
      const glowGrad = ctx.createRadialGradient(
        width / 2,
        height * 0.5,
        50,
        width / 2,
        height * 0.5,
        width * 0.4
      );
      glowGrad.addColorStop(0, 'rgba(245, 158, 11, 0.18)');
      glowGrad.addColorStop(1, 'rgba(245, 158, 11, 0)');
      ctx.fillStyle = glowGrad;
      ctx.fillRect(0, 0, width, height);
    }

    // 2. Draw 3D Garment centered with proportional scaling
    const targetGarmentHeight = cardFormat === 'story' ? height * 0.58 : cardFormat === 'pin' ? height * 0.65 : height * 0.74;
    const scale = targetGarmentHeight / garmentImg.height;
    const drawWidth = garmentImg.width * scale;
    const drawHeight = targetGarmentHeight;
    const drawX = (width - drawWidth) / 2;
    const drawY = cardFormat === 'story' ? (height - drawHeight) * 0.45 : cardFormat === 'pin' ? (height - drawHeight) * 0.44 : (height - drawHeight) * 0.42;

    ctx.drawImage(garmentImg, drawX, drawY, drawWidth, drawHeight);

    // 3. Draw Branding & Metadata (if enabled and not transparent cut-out)
    if (showDetails && cardFormat !== 'transparent' && cardTheme !== 'transparent') {
      const isLight = cardTheme === 'studio-light';
      const textColorPrimary = isLight ? '#0f172a' : '#f8fafc';
      const textColorSecondary = isLight ? '#64748b' : '#94a3b8';
      const accentColor = '#f59e0b';
      const padding = 56;

      // Top Header: Brand & Studio Tag
      ctx.font = 'bold 24px Outfit, sans-serif';
      ctx.fillStyle = textColorPrimary;
      ctx.fillText('FLIPUKAS', padding, padding + 20);

      ctx.font = '500 14px "Space Mono", monospace';
      ctx.fillStyle = accentColor;
      ctx.fillText('// 3D STYLE LAB', padding + 130, padding + 18);

      ctx.font = '13px "Space Mono", monospace';
      ctx.fillStyle = textColorSecondary;
      ctx.textAlign = 'right';
      ctx.fillText('CUSTOM 1-OF-1 · 2026', width - padding, padding + 20);
      ctx.textAlign = 'left';

      // Bottom Section: Product Name, Fabric, Color Swatches, Price
      const bottomY = height - padding;

      // Garment Name
      ctx.font = 'bold 36px Outfit, sans-serif';
      ctx.fillStyle = textColorPrimary;
      ctx.fillText(product.name, padding, bottomY - 54);

      // Fabric & Size
      ctx.font = '500 16px Outfit, sans-serif';
      ctx.fillStyle = textColorSecondary;
      ctx.fillText(
        `${fabric.nameLt} · Dydis ${customization.size} · ${customization.fitMode.toUpperCase()}`,
        padding,
        bottomY - 24
      );

      // Color Swatches
      const swatchY = bottomY + 2;
      const swatches = [
        customization.primaryColor,
        customization.secondaryColor,
        customization.accentColor,
      ];
      swatches.forEach((hex, idx) => {
        ctx.beginPath();
        ctx.arc(padding + idx * 26 + 10, swatchY, 9, 0, Math.PI * 2);
        ctx.fillStyle = hex;
        ctx.fill();
        ctx.strokeStyle = isLight ? 'rgba(0,0,0,0.15)' : 'rgba(255,255,255,0.2)';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      });

      // Price Tag (Right side)
      ctx.textAlign = 'right';
      ctx.font = 'bold 42px Outfit, sans-serif';
      ctx.fillStyle = accentColor;
      ctx.fillText(`${price} €`, width - padding, bottomY - 34);

      ctx.font = '13px "Space Mono", monospace';
      ctx.fillStyle = textColorSecondary;
      ctx.fillText('flipukas.lt', width - padding, bottomY);
      ctx.textAlign = 'left';
    }

    try {
      const dataUri = canvas.toDataURL('image/png');
      setPreviewDataUrl(dataUri);
      previewCanvasRef.current = canvas;
    } catch (e) {
      console.error(e);
    } finally {
      setIsGenerating(false);
    }
  };

  // Build share text and URL
  const shareTitle = `Mano sukurtas ${product.name} – Flipukas 3D Studija`;
  const shareText = `Ką tik susikūriau unikalų ${product.name} (${customization.size}, ${fabric.nameLt}) su 3D siuvinėjimu @Flipukas! Tikra kaina: ${price} €. Įvertink dizainą:`;
  const shareUrl = generateShareableUrl(product.id, customization, fabric.id);

  // 1. Native Web Share API (Directly shares PNG image file on mobile/desktop)
  const handleNativeShare = async () => {
    if (!previewCanvasRef.current) return;

    try {
      const blob = await new Promise<Blob | null>((resolve) =>
        previewCanvasRef.current?.toBlob(resolve, 'image/png')
      );

      if (!blob) throw new Error('No blob generated');

      const fileName = `flipukas_${product.slug}_${customization.size}.png`;
      const file = new File([blob], fileName, { type: 'image/png' });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          files: [file],
        });
        setShareSuccess('Sėkmingai pasidalinta per sistemą!');
      } else if (navigator.share) {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl,
        });
        setShareSuccess('Nuoroda pasidalinta!');
      } else {
        handleCopyLink();
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.error('Share error:', err);
        handleCopyLink();
      }
    }
  };

  // 2. Download Image File
  const handleDownloadImage = () => {
    if (!previewDataUrl) return;
    const link = document.createElement('a');
    link.download = `flipukas_${product.slug}_${format}_${Date.now()}.png`;
    link.href = previewDataUrl;
    link.click();
    setShareSuccess('Nuotrauka sėkmingai atsiųsta!');
    setTimeout(() => setShareSuccess(null), 3000);
  };

  // 3. Copy Image to Clipboard
  const handleCopyImageToClipboard = async () => {
    if (!previewCanvasRef.current) return;

    try {
      const blob = await new Promise<Blob | null>((resolve) =>
        previewCanvasRef.current?.toBlob(resolve, 'image/png')
      );
      if (!blob) return;

      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob }),
      ]);
      setCopiedImage(true);
      setShareSuccess('Paveikslėlis nukopijuotas į iškarpinę! Gali įklijuoti (Ctrl+V) į Messenger, Discord ar el. paštą.');
      setTimeout(() => {
        setCopiedImage(false);
        setShareSuccess(null);
      }, 3500);
    } catch (err) {
      console.warn('Clipboard write image failed:', err);
      handleCopyLink();
    }
  };

  // 4. Copy Link
  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopiedLink(true);
    setShareSuccess('Nuoroda nukopijuota į iškarpinę!');
    setTimeout(() => {
      setCopiedLink(false);
      setShareSuccess(null);
    }, 3000);
  };

  // 5. Dedicated Instagram Share (Direct file share or HD download + caption copy)
  const handleShareToInstagram = async () => {
    if (!previewCanvasRef.current) return;
    const instagramCaption = `${shareTitle}\n\n${shareText}\n\n#Flipukas #3DFashion #DigitalFashion #CustomStyle #${product.slug} #LithuanianDesign`;

    try {
      const blob = await new Promise<Blob | null>((resolve) =>
        previewCanvasRef.current?.toBlob(resolve, 'image/png')
      );
      if (blob) {
        const fileName = `flipukas_${product.slug}_instagram_${format}_${Date.now()}.png`;
        const file = new File([blob], fileName, { type: 'image/png' });

        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: shareTitle,
            text: instagramCaption,
            files: [file],
          });
          setShareSuccess('Sėkmingai atidarytas dalinimosi meniu (pasirink Instagram Feed arba Stories)!');
          return;
        }
      }
    } catch (err: any) {
      if (err.name === 'AbortError') return;
      console.warn('Native share failed, using fallback:', err);
    }

    // Desktop/Fallback: Download HD image, copy caption to clipboard, open Instagram
    handleDownloadImage();
    try {
      await navigator.clipboard.writeText(instagramCaption);
    } catch {}
    setShareSuccess('📸 Instagram kadras paruoštas ir atsiųstas! Aprašas nukopijuotas į iškarpinę. Atidaroma Instagram platforma...');
    window.open('https://www.instagram.com/', '_blank', 'noopener,noreferrer');
  };

  // 6. Dedicated Pinterest Share (HD download + Pinterest Pin Creation Tool)
  const handleShareToPinterest = async () => {
    if (!previewCanvasRef.current) return;
    const pinDescription = `${shareTitle} – ${product.name} (${customization.size}, ${fabric.nameLt}) su 3D personalizavimu @Flipukas. Kaina: ${price} €.`;

    // Download optimal Pin image so user has it ready
    handleDownloadImage();
    try {
      await navigator.clipboard.writeText(pinDescription);
    } catch {}

    const pinUrl = `https://www.pinterest.com/pin-creation-tool/?description=${encodeURIComponent(
      pinDescription
    )}&link=${encodeURIComponent(shareUrl)}`;

    window.open(pinUrl, '_blank', 'noopener,noreferrer');
    setShareSuccess('📌 Pinterest kortelė paruošta ir atsiųsta! Atvertas Pinterest kūrimo įrankis.');
  };

  // Social platform share links
  const socialLinks = [
    {
      name: 'Instagram',
      icon: (
        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
        </svg>
      ),
      color: 'bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 hover:opacity-90 text-white border-transparent font-bold',
      action: handleShareToInstagram,
    },
    {
      name: 'Pinterest',
      icon: (
        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
          <path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 0 1 .083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z" />
        </svg>
      ),
      color: 'bg-[#E60023] hover:bg-[#b8001c] text-white border-transparent font-bold',
      action: handleShareToPinterest,
    },
    {
      name: 'X (Twitter)',
      icon: (
        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      ),
      color: 'bg-black hover:bg-neutral-800 text-white border-neutral-700',
      action: () => {
        const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
          shareText
        )}&url=${encodeURIComponent(shareUrl)}`;
        window.open(url, '_blank', 'noopener,noreferrer');
      },
    },
    {
      name: 'WhatsApp',
      icon: (
        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
          <path d="M17.472 14.382c-.301-.15-1.78-.878-2.056-.979-.275-.1-.476-.15-.677.15-.2.301-.776.979-.952 1.18-.175.2-.351.226-.652.075-.301-.15-1.272-.469-2.423-1.497-.896-.799-1.501-1.786-1.677-2.087-.175-.3-.019-.462.132-.612.136-.135.301-.351.451-.527.151-.175.201-.3.302-.501.101-.2.05-.376-.026-.526-.075-.15-.677-1.632-.927-2.234-.244-.587-.492-.507-.677-.516l-.578-.01c-.2 0-.527.075-.802.376s-1.053 1.029-1.053 2.509 1.079 2.91 1.229 3.111c.15.2 2.124 3.243 5.147 4.549.719.311 1.28.497 1.718.636.723.23 1.381.197 1.901.12.579-.087 1.78-.727 2.032-1.431.251-.703.251-1.306.175-1.431-.075-.126-.276-.201-.577-.352zM12 21.82c-1.77 0-3.507-.463-5.039-1.34l-.361-.214-3.743.982.999-3.649-.235-.374A9.799 9.799 0 0 1 2.2 12C2.2 6.6 6.6 2.2 12 2.2s9.8 4.4 9.8 9.8-4.4 9.82-9.8 9.82zM12 0C5.373 0 0 5.373 0 12c0 2.115.549 4.103 1.514 5.845L0 24l6.326-1.66A11.954 11.954 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z" />
        </svg>
      ),
      color: 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-500',
      action: () => {
        const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(
          `${shareText} ${shareUrl}`
        )}`;
        window.open(url, '_blank', 'noopener,noreferrer');
      },
    },
    {
      name: 'Facebook',
      icon: (
        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      ),
      color: 'bg-blue-600 hover:bg-blue-500 text-white border-blue-500',
      action: () => {
        const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
          shareUrl
        )}&quote=${encodeURIComponent(shareText)}`;
        window.open(url, '_blank', 'noopener,noreferrer');
      },
    },
    {
      name: 'Pinterest',
      icon: (
        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
          <path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 0 1 .083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z" />
        </svg>
      ),
      color: 'bg-rose-600 hover:bg-rose-500 text-white border-rose-500',
      action: () => {
        const url = `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(
          shareUrl
        )}&description=${encodeURIComponent(shareText)}`;
        window.open(url, '_blank', 'noopener,noreferrer');
      },
    },
    {
      name: 'Telegram',
      icon: (
        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
          <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.121l-6.871 4.326-2.962-.924c-.643-.204-.657-.643.136-.953l11.57-4.458c.538-.196 1.006.128.832.939z" />
        </svg>
      ),
      color: 'bg-sky-500 hover:bg-sky-400 text-white border-sky-400',
      action: () => {
        const url = `https://t.me/share/url?url=${encodeURIComponent(
          shareUrl
        )}&text=${encodeURIComponent(shareText)}`;
        window.open(url, '_blank', 'noopener,noreferrer');
      },
    },
    {
      name: 'Reddit',
      icon: (
        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
          <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.609a1.246 1.246 0 0 1 1.108-.693zM9.018 13.003a1.18 1.18 0 0 0-1.18 1.18 1.18 1.18 0 0 0 1.18 1.18 1.18 1.18 0 0 0 1.18-1.18 1.18 1.18 0 0 0-1.18-1.18zm5.964 0a1.18 1.18 0 0 0-1.18 1.18 1.18 1.18 0 0 0 1.18 1.18 1.18 1.18 0 0 0 1.18-1.18 1.18 1.18 0 0 0-1.18-1.18zm-4.706 3.655a.35.35 0 0 0-.258.098.35.35 0 0 0 0 .495 3.328 3.328 0 0 0 4.195 0 .35.35 0 0 0 0-.495.35.35 0 0 0-.495 0 2.628 2.628 0 0 1-3.2 0 .35.35 0 0 0-.242-.098z" />
        </svg>
      ),
      color: 'bg-orange-600 hover:bg-orange-500 text-white border-orange-500',
      action: () => {
        const url = `https://reddit.com/submit?url=${encodeURIComponent(
          shareUrl
        )}&title=${encodeURIComponent(shareTitle)}`;
        window.open(url, '_blank', 'noopener,noreferrer');
      },
    },
    {
      name: 'LinkedIn',
      icon: (
        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
          <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
        </svg>
      ),
      color: 'bg-blue-700 hover:bg-blue-600 text-white border-blue-600',
      action: () => {
        const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
          shareUrl
        )}`;
        window.open(url, '_blank', 'noopener,noreferrer');
      },
    },
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-neutral-950/80">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-400 text-neutral-950 flex items-center justify-center font-bold">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>Eksportuoti ir Dalintis 2D Dizainu</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-400/10 text-amber-400 border border-amber-400/30">
                  Social HD
                </span>
              </h3>
              <p className="text-xs text-neutral-400">
                Atsisiųsk aukštos raiškos 2D nuotrauką arba pasidalink tiesiogiai socialiniuose tinkluose
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success toast notification */}
        {shareSuccess && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{shareSuccess}</span>
          </div>
        )}

        {/* Content Body (2 Columns on Desktop) */}
        <div className="p-6 overflow-y-auto grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          {/* Left Column: Live 2D Snapshot Preview (7 cols) */}
          <div className="md:col-span-7 flex flex-col gap-4">
            <div className="text-xs font-mono uppercase tracking-wider text-neutral-400 flex items-center justify-between">
              <span>Peržiūros Kortelė</span>
              <span className="text-amber-400 font-bold">
                {format === 'square'
                  ? '1080 × 1080 px (Instagram / 1:1)'
                  : format === 'story'
                  ? '1080 × 1920 px (Instagram Story / 9:16)'
                  : format === 'pin'
                  ? '1000 × 1500 px (Pinterest Pin / 2:3)'
                  : format === 'landscape'
                  ? '1200 × 630 px (Horizontali)'
                  : '1080 × 1080 px (Skaidrus PNG)'}
              </span>
            </div>

            {/* Preview Canvas Display */}
            <div className="w-full aspect-square max-h-[380px] sm:max-h-[420px] rounded-2xl border border-neutral-800 bg-neutral-950 flex items-center justify-center p-3 relative overflow-hidden group">
              {isGenerating ? (
                <div className="flex flex-col items-center gap-2 text-neutral-400 text-xs font-mono">
                  <div className="w-7 h-7 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
                  <span>Generuojamas 2D kadras...</span>
                </div>
              ) : previewDataUrl ? (
                <img
                  src={previewDataUrl}
                  alt="Garment 2D Preview"
                  className="max-h-full max-w-full object-contain rounded-xl shadow-xl transition-transform duration-300 group-hover:scale-[1.01]"
                />
              ) : (
                <div className="text-neutral-500 text-xs font-mono">
                  Nepavyko nuskaityti 3D modelio
                </div>
              )}
            </div>

            {/* Quick 1-Click Action Buttons */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <button
                onClick={handleDownloadImage}
                disabled={isGenerating || !previewDataUrl}
                className="py-2.5 px-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition active:scale-95 cursor-pointer disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                <span>Atsisiųsti HD</span>
              </button>

              <button
                onClick={handleCopyImageToClipboard}
                disabled={isGenerating || !previewDataUrl}
                className="py-2.5 px-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-medium text-xs flex items-center justify-center gap-2 border border-neutral-700 transition active:scale-95 cursor-pointer disabled:opacity-50"
              >
                {copiedImage ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>{copiedImage ? 'Nukopijuota!' : 'Kopijuoti foto'}</span>
              </button>

              <button
                onClick={handleNativeShare}
                disabled={isGenerating || !previewDataUrl}
                className="col-span-2 sm:col-span-1 py-2.5 px-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-medium text-xs flex items-center justify-center gap-2 border border-neutral-700 transition active:scale-95 cursor-pointer disabled:opacity-50"
              >
                <Send className="w-4 h-4 text-amber-400" />
                <span>Sistema / Tel.</span>
              </button>
            </div>
          </div>

          {/* Right Column: Format Options & Social Media Icons (5 cols) */}
          <div className="md:col-span-5 flex flex-col gap-5">
            {/* 1. Format Presets */}
            <div>
              <label className="text-xs font-semibold text-neutral-200 block mb-2">
                1. Kortelės Formatas:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {(
                  [
                    { id: 'square', label: 'Instagram (1:1)', desc: 'Post, Feed' },
                    { id: 'story', label: 'Story (9:16)', desc: 'IG Stories, Reels' },
                    { id: 'pin', label: 'Pinterest (2:3)', desc: 'Optimalus Pin' },
                    { id: 'landscape', label: 'Horizontali', desc: 'Twitter, FB card' },
                    { id: 'transparent', label: 'Be fono', desc: 'Skaidrus PNG' },
                  ] as const
                ).map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setFormat(f.id)}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      format === f.id
                        ? 'border-amber-400 bg-amber-400/10 text-white font-medium ring-1 ring-amber-400/30'
                        : 'border-neutral-800 bg-neutral-950 text-neutral-400 hover:text-white hover:border-neutral-700'
                    }`}
                  >
                    <div className="text-xs font-semibold text-neutral-200">{f.label}</div>
                    <div className="text-[10px] text-neutral-500">{f.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Visual Theme (if not transparent) */}
            {format !== 'transparent' && (
              <div>
                <label className="text-xs font-semibold text-neutral-200 block mb-2">
                  2. Fono Aplinka:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(
                    [
                      { id: 'studio-light', label: 'Šviesi Studija', swatch: 'bg-slate-200 border-slate-300' },
                      { id: 'dark-obsidian', label: 'Tamsi Naktis', swatch: 'bg-neutral-950 border-neutral-700' },
                      { id: 'amber-sunset', label: 'Gintaro Šviesa', swatch: 'bg-amber-950 border-amber-800' },
                    ] as const
                  ).map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setTheme(t.id)}
                      className={`p-2 rounded-xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                        theme === t.id
                          ? 'border-amber-400 bg-amber-400/10 text-white font-medium'
                          : 'border-neutral-800 bg-neutral-950 text-neutral-400 hover:text-white'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-full border ${t.swatch}`} />
                      <span className="text-[11px] truncate w-full">{t.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 3. Branding Watermark Toggle */}
            <div className="flex items-center justify-between p-3 rounded-xl border border-neutral-800 bg-neutral-950">
              <div className="text-xs">
                <span className="text-neutral-200 font-medium block">Drabužio aprašas & Logotipas</span>
                <span className="text-[10px] text-neutral-500">Pavadinimas, audinys, kaina ir spalvų paletė</span>
              </div>
              <input
                type="checkbox"
                checked={includeDetails}
                onChange={(e) => setIncludeDetails(e.target.checked)}
                className="w-4 h-4 accent-amber-400 cursor-pointer"
              />
            </div>

            {/* 4. Social Media Direct Share */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-neutral-200">
                  Tiesioginis Dalinimasis Socialiniuose Tinkluose:
                </label>
                <span className="text-[10px] text-amber-400 font-mono">1-Click HD Export</span>
              </div>

              {/* Featured Primary Targets: Instagram & Pinterest */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-3">
                <button
                  onClick={handleShareToInstagram}
                  disabled={isGenerating || !previewDataUrl}
                  className="p-3 rounded-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 hover:from-purple-500 hover:to-amber-400 text-white font-bold text-xs flex items-center justify-between shadow-lg shadow-pink-600/25 transition active:scale-98 cursor-pointer disabled:opacity-50"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                      <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                      </svg>
                    </div>
                    <div className="text-left">
                      <div className="text-xs font-bold leading-tight">Instagram</div>
                      <div className="text-[10px] text-white/80 font-normal">Feed & Stories HD</div>
                    </div>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 opacity-80" />
                </button>

                <button
                  onClick={handleShareToPinterest}
                  disabled={isGenerating || !previewDataUrl}
                  className="p-3 rounded-2xl bg-[#E60023] hover:bg-[#b8001c] text-white font-bold text-xs flex items-center justify-between shadow-lg shadow-rose-900/25 transition active:scale-98 cursor-pointer disabled:opacity-50"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                      <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24">
                        <path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 0 1 .083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z" />
                      </svg>
                    </div>
                    <div className="text-left">
                      <div className="text-xs font-bold leading-tight">Pinterest</div>
                      <div className="text-[10px] text-white/80 font-normal">Kurti Pin Lentą</div>
                    </div>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 opacity-80" />
                </button>
              </div>

              {/* Other Social Networks */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {socialLinks
                  .filter((s) => s.name !== 'Instagram' && s.name !== 'Pinterest')
                  .map((s) => (
                    <button
                      key={s.name}
                      onClick={s.action}
                      className={`py-2 px-3 rounded-xl border text-xs font-medium flex items-center justify-center gap-2 transition active:scale-95 cursor-pointer ${s.color}`}
                    >
                      {s.icon}
                      <span className="truncate">{s.name}</span>
                    </button>
                  ))}
              </div>
            </div>

            {/* 5. Copy Link Box */}
            <div className="pt-2 border-t border-neutral-800 flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={shareUrl}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs font-mono text-neutral-400 truncate focus:outline-none"
              />
              <button
                onClick={handleCopyLink}
                className="shrink-0 px-3 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-medium border border-neutral-700 transition flex items-center gap-1.5 cursor-pointer"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedLink ? 'Kopijuota' : 'Kopijuoti'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
