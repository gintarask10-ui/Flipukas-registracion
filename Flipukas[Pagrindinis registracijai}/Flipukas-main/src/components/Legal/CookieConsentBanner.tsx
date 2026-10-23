import React, { useState, useEffect } from 'react';
import { Cookie, ShieldCheck, ChevronDown, ChevronUp, Check, X, Settings2, ExternalLink } from 'lucide-react';

export interface CookiePreferences {
  essential: boolean; // Always true
  functional: boolean;
  analytics: boolean;
  marketing: boolean;
  timestamp: number;
  version: string;
}

const STORAGE_KEY = 'flipukas_cookie_consent_v1';
const CURRENT_VERSION = '1.1.0';

export const CookieConsentBanner: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    essential: true,
    functional: true,
    analytics: true,
    marketing: false,
    timestamp: Date.now(),
    version: CURRENT_VERSION,
  });

  useEffect(() => {
    // Check if user has already set preferences
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as CookiePreferences;
        if (parsed.version === CURRENT_VERSION) {
          // Valid existing consent
          setPreferences(parsed);
          setIsVisible(false);
        } else {
          // Version updated, show banner again
          setIsVisible(true);
        }
      } else {
        // Initial visit - display fixed banner
        setIsVisible(true);
      }
    } catch {
      setIsVisible(true);
    }

    // Allow re-opening anytime from footer or settings
    const handleOpenBanner = () => {
      setIsCustomizing(true);
      setIsVisible(true);
    };

    window.addEventListener('open-cookie-settings', handleOpenBanner);
    return () => {
      window.removeEventListener('open-cookie-settings', handleOpenBanner);
    };
  }, []);

  const saveConsent = (prefs: CookiePreferences) => {
    try {
      const updated = {
        ...prefs,
        essential: true, // strictly required
        timestamp: Date.now(),
        version: CURRENT_VERSION,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      setPreferences(updated);
      setIsVisible(false);
      setIsCustomizing(false);
    } catch (e) {
      console.warn('Failed to save cookie consent:', e);
      setIsVisible(false);
    }
  };

  const handleAcceptAll = () => {
    saveConsent({
      essential: true,
      functional: true,
      analytics: true,
      marketing: true,
      timestamp: Date.now(),
      version: CURRENT_VERSION,
    });
  };

  const handleRejectNonEssential = () => {
    saveConsent({
      essential: true,
      functional: false,
      analytics: false,
      marketing: false,
      timestamp: Date.now(),
      version: CURRENT_VERSION,
    });
  };

  const handleSaveCustom = () => {
    saveConsent(preferences);
  };

  if (!isVisible) return null;

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="Slapukų sutikimo pranešimas"
      className="fixed bottom-0 left-0 right-0 z-50 p-3 sm:p-5 pointer-events-none animate-in fade-in slide-in-from-bottom duration-300"
    >
      <div className="max-w-4xl mx-auto bg-neutral-950/95 backdrop-blur-xl border border-neutral-800 rounded-2xl shadow-2xl p-4 sm:p-6 text-neutral-200 pointer-events-auto">
        <div className="flex flex-col gap-4">
          {/* Header Row */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400 shrink-0">
                <Cookie className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-display font-bold text-white text-sm sm:text-base flex items-center gap-2">
                  <span>Slapukų nustatymai ir BDAR privatumas</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    ES BDAR / GDPR
                  </span>
                </h3>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Užtikriname sklandų 3D laboratorijos veikimą ir gerbiame tavo pasirinkimus.
                </p>
              </div>
            </div>

            <button
              onClick={handleRejectNonEssential}
              title="Atmesti nebūtinus ir uždaryti"
              className="text-neutral-500 hover:text-neutral-300 p-1.5 rounded-lg hover:bg-neutral-900 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Description */}
          <p className="text-xs text-neutral-300 leading-relaxed">
            „Flipukas“ naudoja būtinus slapukus, kad veiktų 3D drabužių modeliavimas, krepšelis ir pirkimo sesija.
            Su tavo sutikimu taip pat naudojame funkcinius bei analitinius slapukus našumui gerinti ir tendencijoms pritaikyti.
          </p>

          {/* Granular Preference Accordion */}
          {isCustomizing && (
            <div className="border border-neutral-800 rounded-xl bg-neutral-900/60 p-3 sm:p-4 flex flex-col gap-3">
              {/* Category 1: Essential */}
              <div className="flex items-start justify-between gap-3 pb-2.5 border-b border-neutral-800">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-xs text-white">Būtini slapukai (Techniniai)</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-neutral-800 text-neutral-400">
                      Privalomi
                    </span>
                  </div>
                  <p className="text-[11px] text-neutral-400 mt-0.5">
                    Būtini 3D Three.js varikliui, krepšelio išsaugojimui ir saugiam prisijungimui. Negali būti išjungti.
                  </p>
                </div>
                <div className="flex items-center">
                  <div className="w-9 h-5 rounded-full bg-emerald-500/30 border border-emerald-500/50 flex items-center justify-end px-0.5 cursor-not-allowed">
                    <div className="w-4 h-4 rounded-full bg-emerald-400 flex items-center justify-center">
                      <Check className="w-2.5 h-2.5 text-neutral-950 font-bold" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Category 2: Functional */}
              <div className="flex items-start justify-between gap-3 pb-2.5 border-b border-neutral-800">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-xs text-white">Funkciniai slapukai</span>
                  </div>
                  <p className="text-[11px] text-neutral-400 mt-0.5">
                    Išsaugo tavo 3D studijos nustatymus (šviesumo temas, balso komandų pageidavimus, paskutinį modelį).
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setPreferences((p) => ({ ...p, functional: !p.functional }))}
                  className={`w-9 h-5 rounded-full transition-colors flex items-center px-0.5 ${
                    preferences.functional
                      ? 'bg-amber-400 justify-end'
                      : 'bg-neutral-800 border border-neutral-700 justify-start'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full transition-transform ${
                      preferences.functional ? 'bg-neutral-950' : 'bg-neutral-500'
                    }`}
                  />
                </button>
              </div>

              {/* Category 3: Analytics */}
              <div className="flex items-start justify-between gap-3 pb-2.5 border-b border-neutral-800">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-xs text-white">Analitiniai slapukai</span>
                  </div>
                  <p className="text-[11px] text-neutral-400 mt-0.5">
                    Padeda analizuoti sistemos spartą, kadrų dažnį (FPS) ir WebGL suderinamumą skirtinguose įrenginiuose.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setPreferences((p) => ({ ...p, analytics: !p.analytics }))}
                  className={`w-9 h-5 rounded-full transition-colors flex items-center px-0.5 ${
                    preferences.analytics
                      ? 'bg-amber-400 justify-end'
                      : 'bg-neutral-800 border border-neutral-700 justify-start'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full transition-transform ${
                      preferences.analytics ? 'bg-neutral-950' : 'bg-neutral-500'
                    }`}
                  />
                </button>
              </div>

              {/* Category 4: Marketing */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-xs text-white">Rinkodaros ir mados rekomendacijos</span>
                  </div>
                  <p className="text-[11px] text-neutral-400 mt-0.5">
                    Leidžia gauti populiariausių bendruomenės stilių („Trending Style“) įspėjimus ir suasmenintas nuolaidas.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setPreferences((p) => ({ ...p, marketing: !p.marketing }))}
                  className={`w-9 h-5 rounded-full transition-colors flex items-center px-0.5 ${
                    preferences.marketing
                      ? 'bg-amber-400 justify-end'
                      : 'bg-neutral-800 border border-neutral-700 justify-start'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full transition-transform ${
                      preferences.marketing ? 'bg-neutral-950' : 'bg-neutral-500'
                    }`}
                  />
                </button>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-1">
            <button
              onClick={() => setIsCustomizing(!isCustomizing)}
              className="text-xs text-neutral-400 hover:text-white flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl hover:bg-neutral-900 transition border border-transparent hover:border-neutral-800"
            >
              <Settings2 className="w-3.5 h-3.5" />
              <span>{isCustomizing ? 'Slėpti nustatymus' : 'Tinkinti nustatymus'}</span>
              {isCustomizing ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
              {isCustomizing ? (
                <button
                  onClick={handleSaveCustom}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-neutral-700 bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-xs transition"
                >
                  Išsaugoti pasirinkimus
                </button>
              ) : (
                <button
                  onClick={handleRejectNonEssential}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-neutral-700 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white font-medium text-xs transition"
                >
                  Atmesti nebūtinus
                </button>
              )}

              <button
                onClick={handleAcceptAll}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold text-xs transition shadow-lg shadow-amber-400/20 active:scale-98"
              >
                Priimti visus
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
