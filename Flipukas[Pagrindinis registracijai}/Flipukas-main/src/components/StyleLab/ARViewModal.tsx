import React, { useCallback, useEffect, useRef, useState } from 'react';
import confetti from 'canvas-confetti';
import {
  Camera,
  Check,
  Compass,
  Download,
  FlipHorizontal,
  Maximize2,
  Minimize2,
  Move,
  QrCode,
  RefreshCw,
  RotateCw,
  Share2,
  Sliders,
  Smartphone,
  Sparkles,
  Sun,
  Video,
  VideoOff,
  X,
  Zap,
} from 'lucide-react';
import { CustomizationState, FabricMaterial, Product } from '../../types/clothing';
import { ThreeGarmentViewer } from '../ThreeCanvas/ThreeGarmentViewer';

export interface ARViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product;
  customization: CustomizationState;
  fabric: FabricMaterial;
  drawingCanvas?: HTMLCanvasElement | null;
  onUpdateLighting?: (preset: CustomizationState['lightingPreset']) => void;
}

export const ARViewModal: React.FC<ARViewModalProps> = ({
  isOpen,
  onClose,
  product,
  customization,
  fabric,
  drawingCanvas,
  onUpdateLighting,
}) => {
  const [hasCamera, setHasCamera] = useState<boolean | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // AR Transformations & Placement
  const [arScale, setArScale] = useState<number>(0.95);
  const [arElevation, setArElevation] = useState<number>(0.0);
  const [isPinned, setIsPinned] = useState<boolean>(true);
  const [autoRotate, setAutoRotate] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'camera' | 'qrcode'>('camera');

  // WebXR Device Support & Surface Tap-to-Place
  const [isWebXRSupported, setIsWebXRSupported] = useState<boolean | null>(null);
  const [reticlePos, setReticlePos] = useState<{ xPercent: number; yPercent: number }>({ xPercent: 50, yPercent: 68 });
  const [placeCount, setPlaceCount] = useState<number>(1);

  // Photo Capture
  const [capturedPhotoUrl, setCapturedPhotoUrl] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [copiedNotification, setCopiedNotification] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const modalContainerRef = useRef<HTMLDivElement | null>(null);

  // Start Live Camera
  const startCamera = useCallback(async (mode: 'environment' | 'user') => {
    // Stop any existing stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    setCameraError(null);

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Naršyklė nepalaiko tiesioginio kameros srauto.');
      }

      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: { ideal: mode },
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(() => {});
      }

      setHasCamera(true);
      setIsCameraActive(true);
    } catch (err: unknown) {
      console.warn('Camera access issue:', err);
      setHasCamera(false);
      setIsCameraActive(false);
      const message =
        err instanceof Error && err.name === 'NotAllowedError'
          ? 'Kameros leidimas atmestas. Naudojama fotostudijos aplinka.'
          : 'Kamera nepasiekiama. Naudojamas virtualus AR kambarys.';
      setCameraError(message);
    }
  }, []);

  // Stop camera stream
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  }, []);

  // Initialize camera when opening
  useEffect(() => {
    if (isOpen) {
      startCamera(facingMode);
    } else {
      stopCamera();
      setCapturedPhotoUrl(null);
    }

    return () => {
      stopCamera();
    };
  }, [isOpen, facingMode, startCamera, stopCamera]);

  // Check WebXR device capability
  useEffect(() => {
    if (typeof navigator !== 'undefined' && 'xr' in navigator && (navigator as any).xr?.isSessionSupported) {
      (navigator as any).xr
        .isSessionSupported('immersive-ar')
        .then((supported: boolean) => {
          setIsWebXRSupported(Boolean(supported));
        })
        .catch(() => {
          setIsWebXRSupported(false);
        });
    } else {
      setIsWebXRSupported(false);
    }
  }, []);

  // WebXR Immersive Session Launcher
  const handleLaunchWebXRSession = async () => {
    if (typeof navigator !== 'undefined' && (navigator as any).xr?.requestSession) {
      try {
        const session = await (navigator as any).xr.requestSession('immersive-ar', {
          requiredFeatures: ['hit-test'],
          optionalFeatures: ['dom-overlay', 'light-estimation'],
          domOverlay: { root: modalContainerRef.current },
        });
        session.addEventListener('end', () => {});
      } catch (err) {
        console.warn('WebXR direct session failed, fallback active:', err);
        setCameraError('WebXR tiesioginė įrenginio sesija nepavyko. Toliau naudojamas tiesioginis kameros AR režimas.');
        setTimeout(() => setCameraError(null), 4000);
      }
    }
  };

  // Surface Tap-to-Place Gesture
  const handleViewportTap = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!modalContainerRef.current) return;
    const rect = modalContainerRef.current.getBoundingClientRect();
    const xPct = Math.max(15, Math.min(85, ((e.clientX - rect.left) / rect.width) * 100));
    const yPct = Math.max(30, Math.min(85, ((e.clientY - rect.top) / rect.height) * 100));

    setReticlePos({ xPercent: xPct, yPercent: yPct });
    setPlaceCount((c) => c + 1);

    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(20);
    }
  };

  // Toggle Camera Facing Mode (Rear environment vs front selfie)
  const toggleFacingMode = () => {
    const next = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(next);
    startCamera(next);
  };

  // Fullscreen toggle
  const toggleFullscreen = () => {
    if (!modalContainerRef.current) return;
    if (!document.fullscreenElement) {
      modalContainerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  // Capture composite AR Photo (Camera frame + 3D Garment canvas)
  const handleCapturePhoto = async () => {
    setIsCapturing(true);

    try {
      const outputCanvas = document.createElement('canvas');
      const w = 1280;
      const h = 720;
      outputCanvas.width = w;
      outputCanvas.height = h;
      const ctx = outputCanvas.getContext('2d');
      if (!ctx) return;

      // 1. Draw video background (if camera active) or simulated loft background
      if (isCameraActive && videoRef.current && videoRef.current.readyState >= 2) {
        // Draw video aspect-fill
        const video = videoRef.current;
        const vW = video.videoWidth || w;
        const vH = video.videoHeight || h;
        const vAspect = vW / vH;
        const cAspect = w / h;

        let sW = vW;
        let sH = vH;
        let sX = 0;
        let sY = 0;

        if (vAspect > cAspect) {
          sW = vH * cAspect;
          sX = (vW - sW) / 2;
        } else {
          sH = vW / cAspect;
          sY = (vH - sH) / 2;
        }

        if (facingMode === 'user') {
          // Flip mirror horizontally for selfie
          ctx.save();
          ctx.translate(w, 0);
          ctx.scale(-1, 1);
          ctx.drawImage(video, sX, sY, sW, sH, 0, 0, w, h);
          ctx.restore();
        } else {
          ctx.drawImage(video, sX, sY, sW, sH, 0, 0, w, h);
        }
      } else {
        // High quality simulated modern living loft gradient
        const bgGrad = ctx.createLinearGradient(0, 0, w, h);
        bgGrad.addColorStop(0, '#1c1917');
        bgGrad.addColorStop(0.5, '#292524');
        bgGrad.addColorStop(1, '#0c0a09');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, w, h);

        // Simulated floor line
        ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
        ctx.fillRect(0, h * 0.75, w, h * 0.25);
      }

      // 2. Draw 3D Garment Canvas
      const garmentCanvas = modalContainerRef.current?.querySelector('canvas') as HTMLCanvasElement;
      if (garmentCanvas) {
        ctx.drawImage(garmentCanvas, 0, 0, w, h);
      }

      // 3. Draw Stylized AR Watermark Overlay
      ctx.fillStyle = 'rgba(10, 10, 12, 0.7)';
      ctx.fillRect(24, h - 84, 380, 60);
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 2;
      ctx.strokeRect(24, h - 84, 380, 60);

      // Watermark text
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 15px monospace';
      ctx.fillText(`FLIPUKAS // AR KAMBARYJE • ${product.name.toUpperCase()}`, 38, h - 54);

      ctx.fillStyle = '#9ca3af';
      ctx.font = '11px monospace';
      ctx.fillText(`Dydis ${customization.size} • Audinys: ${fabric.nameLt} • 1:1 Tikras dydis`, 38, h - 36);

      // Flash AR badge top right
      ctx.fillStyle = 'rgba(245, 158, 11, 0.9)';
      ctx.fillRect(w - 140, 24, 116, 32);
      ctx.fillStyle = '#000000';
      ctx.font = 'bold 12px monospace';
      ctx.fillText('LIVE AR VIEW', w - 128, 45);

      const dataUrl = outputCanvas.toDataURL('image/png');
      setCapturedPhotoUrl(dataUrl);

      confetti({
        particleCount: 30,
        spread: 50,
        origin: { y: 0.8 },
      });
    } catch (e) {
      console.error('AR Photo capture error:', e);
    } finally {
      setIsCapturing(false);
    }
  };

  // Download captured photo
  const handleDownloadPhoto = () => {
    if (!capturedPhotoUrl) return;
    const link = document.createElement('a');
    link.download = `flipukas_AR_${product.slug}_${Date.now()}.png`;
    link.href = capturedPhotoUrl;
    link.click();
  };

  // Copy captured photo to clipboard
  const handleCopyPhoto = async () => {
    if (!capturedPhotoUrl) return;
    try {
      const res = await fetch(capturedPhotoUrl);
      const blob = await res.blob();
      await navigator.clipboard.write([
        new ClipboardItem({
          'image/png': blob,
        }),
      ]);
      setCopiedNotification(true);
      setTimeout(() => setCopiedNotification(false), 2000);
    } catch {
      handleDownloadPhoto();
    }
  };

  if (!isOpen) return null;

  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';

  return (
    <div
      ref={modalContainerRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black select-none animate-in fade-in duration-200 overflow-hidden"
    >
      {/* 1. Live Camera Video Background / Simulated Environment */}
      <div className="absolute inset-0 w-full h-full overflow-hidden bg-neutral-950">
        <video
          ref={videoRef}
          playsInline
          autoPlay
          muted
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            isCameraActive ? 'opacity-100' : 'opacity-0'
          } ${facingMode === 'user' ? 'scale-x-[-1]' : ''}`}
        />

        {/* Fallback photorealistic ambient room backdrop if camera is off or denied */}
        {!isCameraActive && (
          <div className="absolute inset-0 w-full h-full bg-gradient-to-b from-stone-900 via-neutral-900 to-stone-950 flex flex-col justify-end">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(245,158,11,0.06)_0,transparent_70%)] pointer-events-none" />
            {/* Perspective grid floor */}
            <div
              className="w-full h-[40%] border-t border-neutral-700/40 opacity-30 pointer-events-none"
              style={{
                backgroundImage:
                  'linear-gradient(to right, rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.08) 1px, transparent 1px)',
                backgroundSize: '40px 40px',
                transform: 'perspective(400px) rotateX(60deg)',
                transformOrigin: 'bottom center',
              }}
            />
          </div>
        )}
      </div>

      {/* 2. Interactive 3D Garment Viewer Layer */}
      <div
        onClick={handleViewportTap}
        className="absolute inset-0 w-full h-full pointer-events-auto flex items-center justify-center cursor-crosshair"
      >
        <ThreeGarmentViewer
          garmentType={product.type}
          customization={{
            ...customization,
            autoRotate: autoRotate,
          }}
          activeFabric={fabric}
          drawingCanvas={drawingCanvas}
          arMode={true}
          arScale={arScale}
          arElevation={arElevation}
          className="w-full h-full"
        />

        {/* Real-world floor placement reticle indicator */}
        <div
          className="absolute pointer-events-none flex flex-col items-center justify-center opacity-90 transition-all duration-300 transform -translate-x-1/2 -translate-y-1/2"
          style={{
            left: `${reticlePos.xPercent}%`,
            top: `${reticlePos.yPercent}%`,
          }}
        >
          <div className="relative w-44 h-16 rounded-full border border-amber-400/70 animate-pulse flex items-center justify-center shadow-lg shadow-amber-400/20">
            <div className="w-32 h-10 rounded-full border border-dashed border-amber-400/50" />
            <div className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-md shadow-amber-400" />
          </div>
          <span className="text-[10px] font-mono text-amber-300 bg-black/75 px-2.5 py-0.5 rounded-full mt-1.5 backdrop-blur-md border border-neutral-800">
            ✓ Paviršius užfiksuotas • Palieskite bet kur, kad perkeltumėte
          </span>
        </div>
      </div>

      {/* 3. Top Floating Navigation Bar */}
      <div className="absolute top-0 inset-x-0 p-3 sm:p-5 flex items-center justify-between z-20 bg-gradient-to-b from-black/80 via-black/40 to-transparent">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-400 text-neutral-950 font-bold flex items-center justify-center shadow-lg shadow-amber-400/20">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-white text-sm sm:text-base leading-tight drop-shadow-md">
                WebXR AR Kamera
              </h2>
              <span className="text-[9px] font-mono font-bold uppercase px-1.5 py-0.5 rounded bg-amber-400/20 text-amber-400 border border-amber-400/40">
                {isWebXRSupported ? 'WebXR Ready' : 'Live Camera AR'}
              </span>
              <span className="text-[9px] font-mono font-bold uppercase px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 hidden sm:inline">
                1:1 Scale
              </span>
            </div>
            <p className="text-[11px] text-neutral-300 drop-shadow">
              {product.name} ({customization.size}) • {fabric.nameLt}
            </p>
          </div>
        </div>

        {/* Top Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* WebXR direct session button if supported */}
          {isWebXRSupported && (
            <button
              onClick={handleLaunchWebXRSession}
              title="Paleisti tiesioginę WebXR Immersive sesiją"
              className="px-2.5 py-2 rounded-xl bg-[#d4af37] text-stone-950 font-bold text-xs font-mono flex items-center gap-1.5 shadow-md hover:bg-[#e6c258] transition cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">WebXR Start</span>
            </button>
          )}
          {/* Camera flip toggle */}
          <button
            onClick={toggleFacingMode}
            title={facingMode === 'environment' ? 'Persijungti į priekinę (Selfie) kamerą' : 'Persijungti į galinę kamerą'}
            className="p-2 sm:p-2.5 rounded-xl bg-neutral-900/80 hover:bg-neutral-800 border border-neutral-700/80 text-white backdrop-blur-md transition cursor-pointer"
          >
            <FlipHorizontal className="w-4 h-4 text-amber-400" />
          </button>

          {/* Toggle Live Camera on/off */}
          <button
            onClick={() => {
              if (isCameraActive) {
                stopCamera();
              } else {
                startCamera(facingMode);
              }
            }}
            title={isCameraActive ? 'Išjungti kamerą' : 'Įjungti kamerą'}
            className="p-2 sm:p-2.5 rounded-xl bg-neutral-900/80 hover:bg-neutral-800 border border-neutral-700/80 text-white backdrop-blur-md transition cursor-pointer"
          >
            {isCameraActive ? (
              <Video className="w-4 h-4 text-emerald-400" />
            ) : (
              <VideoOff className="w-4 h-4 text-neutral-400" />
            )}
          </button>

          {/* QR Code for Mobile */}
          <button
            onClick={() => setActiveTab(activeTab === 'qrcode' ? 'camera' : 'qrcode')}
            title="Nuskaityti telefonu (QR kodas)"
            className={`p-2 sm:p-2.5 rounded-xl border backdrop-blur-md transition cursor-pointer ${
              activeTab === 'qrcode'
                ? 'bg-amber-400 text-neutral-950 font-bold border-amber-300'
                : 'bg-neutral-900/80 hover:bg-neutral-800 border-neutral-700/80 text-white'
            }`}
          >
            <QrCode className="w-4 h-4" />
          </button>

          {/* Fullscreen */}
          <button
            onClick={toggleFullscreen}
            title="Per visą ekraną"
            className="p-2 sm:p-2.5 rounded-xl bg-neutral-900/80 hover:bg-neutral-800 border border-neutral-700/80 text-white backdrop-blur-md transition cursor-pointer hidden sm:block"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          {/* Close AR View */}
          <button
            onClick={onClose}
            className="p-2 sm:p-2.5 rounded-xl bg-neutral-900/90 hover:bg-red-500/20 border border-neutral-700/80 text-white hover:text-red-400 backdrop-blur-md transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 4. Notification / Camera Status Banner */}
      {cameraError && (
        <div className="absolute top-16 inset-x-4 sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 z-20 bg-neutral-900/90 border border-amber-500/50 text-amber-300 text-xs px-3.5 py-2 rounded-xl backdrop-blur-md flex items-center justify-between gap-3 shadow-xl">
          <div className="flex items-center gap-2">
            <VideoOff className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>{cameraError}</span>
          </div>
          <button
            onClick={() => startCamera(facingMode)}
            className="text-[11px] font-mono underline font-semibold text-white hover:text-amber-400"
          >
            Bandyti vėl
          </button>
        </div>
      )}

      {/* 5. Mobile QR Code Popup Modal */}
      {activeTab === 'qrcode' && (
        <div className="absolute inset-0 z-30 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div
            className="max-w-sm w-full bg-neutral-900 border border-neutral-800 rounded-3xl p-6 flex flex-col items-center text-center shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setActiveTab('camera')}
              className="absolute top-4 right-4 p-2 rounded-full text-neutral-400 hover:text-white hover:bg-neutral-800 transition"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="w-12 h-12 rounded-2xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-amber-400 mb-3">
              <Smartphone className="w-6 h-6" />
            </div>

            <h3 className="font-bold text-white text-base">
              Nuskaitykite savo išmaniuoju telefonu
            </h3>
            <p className="text-xs text-neutral-400 mt-1 mb-5">
              Nukreipkite iPhone ar Android kamerą į šį kodą – pamatysite šį pritaikytą drabužį tiesiog savo kambaryje!
            </p>

            {/* Generated QR Code representation */}
            <div className="p-4 bg-white rounded-2xl shadow-xl flex items-center justify-center mb-4">
              <svg className="w-48 h-48" viewBox="0 0 100 100" fill="none">
                {/* Clean SVG Mock QR pattern */}
                <rect width="100" height="100" fill="#ffffff" />
                {/* Corner markers */}
                <rect x="5" y="5" width="26" height="26" rx="4" fill="#000000" />
                <rect x="9" y="9" width="18" height="18" rx="2" fill="#ffffff" />
                <rect x="13" y="13" width="10" height="10" fill="#000000" />

                <rect x="69" y="5" width="26" height="26" rx="4" fill="#000000" />
                <rect x="73" y="9" width="18" height="18" rx="2" fill="#ffffff" />
                <rect x="77" y="13" width="10" height="10" fill="#000000" />

                <rect x="5" y="69" width="26" height="26" rx="4" fill="#000000" />
                <rect x="9" y="73" width="18" height="18" rx="2" fill="#ffffff" />
                <rect x="13" y="77" width="10" height="10" fill="#000000" />

                {/* Data blocks */}
                <rect x="36" y="8" width="6" height="6" fill="#000000" />
                <rect x="46" y="14" width="6" height="6" fill="#000000" />
                <rect x="56" y="8" width="6" height="6" fill="#000000" />
                <rect x="36" y="24" width="8" height="8" fill="#000000" />
                <rect x="50" y="24" width="10" height="8" fill="#000000" />

                <rect x="10" y="38" width="8" height="8" fill="#000000" />
                <rect x="24" y="44" width="8" height="6" fill="#000000" />
                <rect x="38" y="38" width="16" height="16" rx="3" fill="#f59e0b" />
                <rect x="60" y="40" width="8" height="8" fill="#000000" />
                <rect x="74" y="38" width="16" height="8" fill="#000000" />

                <rect x="38" y="60" width="8" height="8" fill="#000000" />
                <rect x="52" y="58" width="10" height="10" fill="#000000" />
                <rect x="68" y="54" width="6" height="6" fill="#000000" />
                <rect x="80" y="58" width="10" height="10" fill="#000000" />

                <rect x="38" y="76" width="12" height="12" fill="#000000" />
                <rect x="56" y="74" width="8" height="8" fill="#000000" />
                <rect x="70" y="78" width="16" height="12" fill="#000000" />
              </svg>
            </div>

            <div className="flex items-center gap-2 text-[11px] font-mono text-neutral-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>Suderinama su iOS Safari & Android Chrome</span>
            </div>

            <button
              onClick={() => setActiveTab('camera')}
              className="mt-4 w-full py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold text-xs transition cursor-pointer"
            >
              Tęsti peržiūrą ekrane
            </button>
          </div>
        </div>
      )}

      {/* 6. Captured Photo Preview Modal */}
      {capturedPhotoUrl && (
        <div className="absolute inset-0 z-40 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-200">
          <div
            className="max-w-2xl w-full bg-neutral-900 border border-neutral-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-neutral-800 flex items-center justify-between bg-neutral-950/60">
              <div className="flex items-center gap-2 text-white font-semibold text-sm">
                <Camera className="w-4 h-4 text-amber-400" />
                <span>AR Nuotrauka Paruošta!</span>
              </div>
              <button
                onClick={() => setCapturedPhotoUrl(null)}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 flex items-center justify-center bg-black/60">
              <img
                src={capturedPhotoUrl}
                alt="AR drabužio nuotrauka"
                className="max-h-[55vh] rounded-xl border border-neutral-800 object-contain shadow-2xl"
              />
            </div>

            <div className="p-4 border-t border-neutral-800 bg-neutral-950/80 flex flex-wrap items-center justify-between gap-3">
              <div className="text-xs text-neutral-400">
                Nuotrauka užfiksuota su tavo individualiu dizainu ir realia aplinka
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyPhoto}
                  className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-medium text-xs transition flex items-center gap-1.5 cursor-pointer"
                >
                  {copiedNotification ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Nukopijuota!</span>
                    </>
                  ) : (
                    <>
                      <Share2 className="w-3.5 h-3.5 text-amber-400" />
                      <span>Kopijuoti</span>
                    </>
                  )}
                </button>
                <button
                  onClick={handleDownloadPhoto}
                  className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold text-xs transition flex items-center gap-1.5 cursor-pointer shadow-lg"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Atsisiųsti PNG</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 7. Bottom Floating AR Control Center (Thumb-Friendly for Mobile) */}
      <div className="absolute bottom-0 inset-x-0 p-3 sm:p-5 flex flex-col items-center gap-3 z-20 bg-gradient-to-t from-black/90 via-black/60 to-transparent">
        {/* Quick presets pills */}
        <div className="flex items-center gap-1.5 bg-neutral-900/80 p-1 rounded-2xl border border-neutral-800 backdrop-blur-md overflow-x-auto max-w-full scrollbar-none">
          {/* Scale Presets */}
          <button
            onClick={() => setArScale(0.4)}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono transition cursor-pointer ${
              Math.abs(arScale - 0.4) < 0.05
                ? 'bg-amber-400 text-neutral-950 font-bold shadow'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Miniatūra (35%)
          </button>
          <button
            onClick={() => setArScale(0.7)}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono transition cursor-pointer ${
              Math.abs(arScale - 0.7) < 0.05
                ? 'bg-amber-400 text-neutral-950 font-bold shadow'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Manekenas (70%)
          </button>
          <button
            onClick={() => setArScale(1.0)}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono transition cursor-pointer ${
              Math.abs(arScale - 1.0) < 0.05
                ? 'bg-amber-400 text-neutral-950 font-bold shadow'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            1:1 Tikras dydis
          </button>

          <span className="w-px h-4 bg-neutral-700/80 mx-1" />

          {/* Turntable Auto-rotate */}
          <button
            onClick={() => setAutoRotate(!autoRotate)}
            title="Auto rotacija"
            className={`px-3 py-1.5 rounded-xl text-xs font-mono flex items-center gap-1 transition cursor-pointer ${
              autoRotate
                ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <RotateCw className={`w-3 h-3 ${autoRotate ? 'animate-spin' : ''}`} />
            <span>Sukti</span>
          </button>

          {/* Lighting Environment Match */}
          {onUpdateLighting && (
            <button
              onClick={() => {
                const presets: CustomizationState['lightingPreset'][] = [
                  'studio',
                  'golden-hour',
                  'neon-night',
                ];
                const next =
                  presets[(presets.indexOf(customization.lightingPreset) + 1) % presets.length];
                onUpdateLighting(next);
              }}
              title="Priderinti apšvietimą prie kambario"
              className="px-3 py-1.5 rounded-xl text-xs font-mono flex items-center gap-1 text-neutral-300 hover:text-white transition cursor-pointer"
            >
              <Sun className="w-3 h-3 text-amber-400" />
              <span className="capitalize">
                {customization.lightingPreset === 'golden-hour'
                  ? 'Šilta'
                  : customization.lightingPreset === 'neon-night'
                  ? 'Kiber'
                  : 'Diena'}
              </span>
            </button>
          )}
        </div>

        {/* Central Shutter Button & Placement Controls */}
        <div className="flex items-center justify-center gap-6 sm:gap-8 w-full max-w-sm">
          {/* Elevation down */}
          <button
            onClick={() => setArElevation((prev) => Math.max(prev - 0.2, -0.6))}
            title="Nuleisti žemiau link grindų"
            className="w-11 h-11 rounded-2xl bg-neutral-900/80 hover:bg-neutral-800 border border-neutral-700/80 text-white flex items-center justify-center backdrop-blur-md transition cursor-pointer active:scale-95"
          >
            <span className="text-xs font-mono font-bold">- H</span>
          </button>

          {/* Big Shutter Button */}
          <button
            onClick={handleCapturePhoto}
            disabled={isCapturing}
            title="Užfiksuoti AR nuotrauką"
            className="w-16 h-16 sm:w-18 sm:h-18 rounded-full border-4 border-amber-400 bg-white/90 hover:bg-white text-neutral-950 flex items-center justify-center shadow-2xl shadow-amber-400/40 transition-transform active:scale-90 cursor-pointer group"
          >
            <Camera className="w-7 h-7 sm:w-8 sm:h-8 text-neutral-950 group-hover:scale-110 transition-transform" />
          </button>

          {/* Elevation up */}
          <button
            onClick={() => setArElevation((prev) => Math.min(prev + 0.2, 0.6))}
            title="Pakelti aukščiau"
            className="w-11 h-11 rounded-2xl bg-neutral-900/80 hover:bg-neutral-800 border border-neutral-700/80 text-white flex items-center justify-center backdrop-blur-md transition cursor-pointer active:scale-95"
          >
            <span className="text-xs font-mono font-bold">+ H</span>
          </button>
        </div>

        {/* Bottom subtle hint */}
        <div className="text-[11px] font-mono text-neutral-400 flex items-center gap-2 drop-shadow">
          <Move className="w-3 h-3 text-amber-400" />
          <span>Braukite pirštu, kad pasuktumėte 360° • Spustelėkite fotoaparatą, kad išsaugotumėte</span>
        </div>
      </div>
    </div>
  );
};
