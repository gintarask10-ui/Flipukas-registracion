import React, { useState } from 'react';
import {
  X,
  Share2,
  Copy,
  Check,
  Download,
  Video,
  Sparkles,
  QrCode,
  ArrowRight,
  Flame,
} from 'lucide-react';
import { CustomizationState, FabricMaterial, Product } from '../../types/clothing';
import { copyShareableLinkToClipboard } from '../../utils/shareUtils';

interface SocialShareReelModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product;
  customization: CustomizationState;
  activeFabric: FabricMaterial;
  snapshotUrl?: string | null;
}

export const SocialShareReelModal: React.FC<SocialShareReelModalProps> = ({
  isOpen,
  onClose,
  product,
  customization,
  activeFabric,
  snapshotUrl,
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [reelAspect, setReelAspect] = useState<'reel-9-16' | 'post-1-1'>('reel-9-16');
  const [isExporting, setIsExporting] = useState(false);
  const [exportedSuccess, setExportedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleCopyLink = async () => {
    const success = await copyShareableLinkToClipboard(
      product.id,
      customization,
      activeFabric.id
    );
    if (success) {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const handleDownloadCard = () => {
    setIsExporting(true);
    setTimeout(() => {
      // Create download trigger
      const link = document.createElement('a');
      link.download = `Flipukas-Atelier-${product.slug}-${Date.now()}.png`;
      link.href = snapshotUrl || product.image;
      link.click();
      setIsExporting(false);
      setExportedSuccess(true);
      setTimeout(() => setExportedSuccess(false), 3000);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-neutral-950/85 backdrop-blur-md transition-opacity"
      />

      {/* Luxury Container */}
      <div className="relative w-full max-w-2xl bg-gradient-to-br from-[#15151c] via-[#101015] to-[#0b0b0f] border border-[#d4af37]/35 rounded-3xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-5 border-b border-stone-800 flex items-center justify-between gap-4 bg-black/40">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-[#d4af37]/15 border border-[#d4af37]/35 flex items-center justify-center text-[#d4af37]">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] font-mono tracking-widest uppercase text-[#d4af37] font-semibold">
                Social Reel & Video Variklis
              </div>
              <h3 className="font-serif-luxury font-bold text-lg text-white">
                Sukurk ir Pasidalink (TikTok / Instagram Reels)
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-stone-400 hover:text-white hover:bg-stone-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col md:flex-row gap-6 items-center justify-center">
          {/* Reel Visual Preview Card */}
          <div
            className={`relative rounded-3xl border border-[#d4af37]/40 overflow-hidden shadow-2xl bg-gradient-to-b from-[#181822] via-[#0e0e13] to-black flex flex-col justify-between p-5 transition-all ${
              reelAspect === 'reel-9-16' ? 'w-64 h-[440px]' : 'w-72 h-72'
            }`}
          >
            {/* Top Watermark Branding */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="font-serif-luxury font-bold text-sm text-white">Flipukas</span>
                <span className="text-[8px] font-mono uppercase text-[#d4af37] px-1 py-0.2 rounded border border-[#d4af37]/30 bg-[#d4af37]/15">
                  Atelier
                </span>
              </div>
              <span className="text-[9px] font-mono text-stone-400">
                #Flipukas3D
              </span>
            </div>

            {/* Central Snapshot / Render */}
            <div className="relative flex-1 flex items-center justify-center my-2 overflow-hidden">
              <img
                src={snapshotUrl || product.image}
                alt="3D Garment Render"
                className="max-h-full max-w-full object-contain filter drop-shadow-[0_15px_25px_rgba(0,0,0,0.8)]"
              />
            </div>

            {/* Bottom Card Overlay Details */}
            <div className="p-3 rounded-2xl bg-black/75 backdrop-blur-md border border-stone-800/80 space-y-1">
              <div className="flex items-center justify-between text-[11px] font-serif-luxury font-bold text-white">
                <span className="truncate">{product.name}</span>
                <span className="text-[#f5e6b8] font-mono">Dydis {customization.size}</span>
              </div>
              <div className="flex items-center justify-between text-[10px] font-mono text-stone-400">
                <span>{activeFabric.nameLt}</span>
                {customization.customText && (
                  <span className="text-[#d4af37] truncate">
                    „{customization.customText}“
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Controls & Share Actions */}
          <div className="flex-1 space-y-5">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#d4af37] font-semibold block mb-1">
                Formato Pasirinkimas
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setReelAspect('reel-9-16')}
                  className={`p-3 rounded-xl border text-xs font-mono transition text-left cursor-pointer ${
                    reelAspect === 'reel-9-16'
                      ? 'bg-[#d4af37]/20 border-[#d4af37] text-[#f5e6b8] font-bold'
                      : 'bg-stone-900 border-stone-800 text-stone-400 hover:text-white'
                  }`}
                >
                  <div className="font-bold">9:16 Vertikalus</div>
                  <div className="text-[10px] text-stone-400 mt-0.5">TikTok & IG Stories</div>
                </button>
                <button
                  type="button"
                  onClick={() => setReelAspect('post-1-1')}
                  className={`p-3 rounded-xl border text-xs font-mono transition text-left cursor-pointer ${
                    reelAspect === 'post-1-1'
                      ? 'bg-[#d4af37]/20 border-[#d4af37] text-[#f5e6b8] font-bold'
                      : 'bg-stone-900 border-stone-800 text-stone-400 hover:text-white'
                  }`}
                >
                  <div className="font-bold">1:1 Kvadratas</div>
                  <div className="text-[10px] text-stone-400 mt-0.5">Instagram Post</div>
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-2.5">
              <button
                type="button"
                onClick={handleDownloadCard}
                disabled={isExporting}
                className="w-full py-3.5 luxury-button-gold text-stone-950 font-bold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-lg active:scale-98"
              >
                <Download className="w-4 h-4" />
                <span>{isExporting ? 'Ruošiamas vaizdo įrašas...' : 'Atsisiųsti 3D Kortelę / Reel'}</span>
              </button>

              <button
                type="button"
                onClick={handleCopyLink}
                className="w-full py-3 bg-stone-900 hover:bg-stone-800 border border-stone-800 text-stone-200 text-xs font-mono rounded-xl flex items-center justify-center gap-2 cursor-pointer transition active:scale-98"
              >
                {copiedLink ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span className="text-emerald-400 font-bold">Unikali 3D nuoroda nukopijuota!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-[#d4af37]" />
                    <span>Kopijuoti tiesioginę 3D nuorodą</span>
                  </>
                )}
              </button>
            </div>

            {exportedSuccess && (
              <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400" />
                <span>3D vaizdas sėkmingai paruoštas dalinimuisi!</span>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-stone-800 bg-black/40 flex items-center justify-between text-xs text-stone-400">
          <span>Pasidalinkite su #FlipukasAtelier mados bendruomene</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-200 font-medium transition cursor-pointer border border-stone-800"
          >
            Uždaryti
          </button>
        </div>
      </div>
    </div>
  );
};
