import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Sparkles,
  Zap,
  Sun,
  Palette,
  Camera,
  Share2,
  Check,
  HelpCircle,
  X,
  RotateCw,
  Sliders,
  Glasses,
  Ruler,
  Layers,
  ChevronRight,
  Flame,
  Heart,
  Scale,
} from 'lucide-react';
import {
  CustomizationState,
  FabricMaterial,
  Product,
} from '../../types/clothing';
import { PRESET_DESIGN_TEMPLATES, PresetDesignTemplate } from '../../data/presetTemplates';
import { FABRICS } from '../../data/products';

export interface VoiceCommandProps {
  customization: CustomizationState;
  onChangeCustomization: (
    updater: (prev: CustomizationState) => CustomizationState,
    actionDescription?: string
  ) => void;
  onApplyPresetTemplate: (template: PresetDesignTemplate) => void;
  onOpenShareModal: () => void;
  onOpenARModal: () => void;
  onOpenSizeGuideModal: () => void;
  onOpenLightingModal: () => void;
  onOpenTemplatesModal: () => void;
  onTriggerSnapshot: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
  onSaveToWishlist?: () => void;
  onOpenWishlist?: () => void;
  onOpenCompare?: () => void;
}

// Color lookup dictionary supporting English and Lithuanian names
const COLOR_MAP: Record<string, { hex: string; nameLt: string; nameEn: string }> = {
  blue: { hex: '#2563eb', nameLt: 'Karališka Mėlyna', nameEn: 'Royal Blue' },
  'mėlyna': { hex: '#2563eb', nameLt: 'Mėlyna', nameEn: 'Blue' },
  'mėlyną': { hex: '#2563eb', nameLt: 'Mėlyna', nameEn: 'Blue' },
  'dark blue': { hex: '#1e3a8a', nameLt: 'Tamsiai Mėlyna', nameEn: 'Dark Blue' },
  'navy': { hex: '#0f172a', nameLt: 'Tamsi Jūrinė', nameEn: 'Navy' },
  'light blue': { hex: '#38bdf8', nameLt: 'Šviesiai Mėlyna', nameEn: 'Light Blue' },
  'sky blue': { hex: '#38bdf8', nameLt: 'Dangaus Mėlyna', nameEn: 'Sky Blue' },
  'cyan': { hex: '#06b6d4', nameLt: 'Elektrinė Žydra (Cyan)', nameEn: 'Cyan' },
  'žydra': { hex: '#06b6d4', nameLt: 'Žydra', nameEn: 'Cyan' },
  'žydrą': { hex: '#06b6d4', nameLt: 'Žydra', nameEn: 'Cyan' },

  red: { hex: '#dc2626', nameLt: 'Raudona', nameEn: 'Red' },
  'raudona': { hex: '#dc2626', nameLt: 'Raudona', nameEn: 'Red' },
  'raudoną': { hex: '#dc2626', nameLt: 'Raudona', nameEn: 'Red' },
  'crimson': { hex: '#b91c1c', nameLt: 'Skaisčiai Raudona', nameEn: 'Crimson' },

  green: { hex: '#16a34a', nameLt: 'Žalia', nameEn: 'Green' },
  'žalia': { hex: '#16a34a', nameLt: 'Žalia', nameEn: 'Green' },
  'žalią': { hex: '#16a34a', nameLt: 'Žalia', nameEn: 'Green' },
  'emerald': { hex: '#059669', nameLt: 'Smaragdinė', nameEn: 'Emerald' },
  'smaragdas': { hex: '#059669', nameLt: 'Smaragdinė', nameEn: 'Emerald' },
  'lime': { hex: '#84cc16', nameLt: 'Laimo Žalia', nameEn: 'Lime' },
  'neon green': { hex: '#22c55e', nameLt: 'Neoninė Žalia', nameEn: 'Neon Green' },

  yellow: { hex: '#eab308', nameLt: 'Geltona', nameEn: 'Yellow' },
  'geltona': { hex: '#eab308', nameLt: 'Geltona', nameEn: 'Yellow' },
  'geltoną': { hex: '#eab308', nameLt: 'Geltona', nameEn: 'Yellow' },

  amber: { hex: '#f59e0b', nameLt: 'Gintarinė', nameEn: 'Amber' },
  'gintaras': { hex: '#f59e0b', nameLt: 'Gintarinė', nameEn: 'Amber' },
  'gintarinė': { hex: '#f59e0b', nameLt: 'Gintarinė', nameEn: 'Amber' },
  orange: { hex: '#ea580c', nameLt: 'Oranžinė', nameEn: 'Orange' },
  'oranžinė': { hex: '#ea580c', nameLt: 'Oranžinė', nameEn: 'Orange' },
  'oranžinę': { hex: '#ea580c', nameLt: 'Oranžinė', nameEn: 'Orange' },

  purple: { hex: '#9333ea', nameLt: 'Violetinė', nameEn: 'Purple' },
  'violetinė': { hex: '#9333ea', nameLt: 'Violetinė', nameEn: 'Purple' },
  'violetinę': { hex: '#9333ea', nameLt: 'Violetinė', nameEn: 'Purple' },
  magenta: { hex: '#d946ef', nameLt: 'Magenta', nameEn: 'Magenta' },

  pink: { hex: '#ec4899', nameLt: 'Rožinė', nameEn: 'Pink' },
  'rožinė': { hex: '#ec4899', nameLt: 'Rožinė', nameEn: 'Pink' },
  'rožinę': { hex: '#ec4899', nameLt: 'Rožinė', nameEn: 'Pink' },
  'neon pink': { hex: '#f43f5e', nameLt: 'Neoninė Rožinė', nameEn: 'Neon Pink' },

  black: { hex: '#171717', nameLt: 'Anglies Juoda', nameEn: 'Obsidian Black' },
  'juoda': { hex: '#171717', nameLt: 'Juoda', nameEn: 'Black' },
  'juodą': { hex: '#171717', nameLt: 'Juoda', nameEn: 'Black' },
  'dark': { hex: '#0a0a0a', nameLt: 'Tamsi', nameEn: 'Dark' },

  white: { hex: '#f8fafc', nameLt: 'Optinė Balta', nameEn: 'Pure White' },
  'balta': { hex: '#f8fafc', nameLt: 'Balta', nameEn: 'White' },
  'baltą': { hex: '#f8fafc', nameLt: 'Balta', nameEn: 'White' },

  gray: { hex: '#4b5563', nameLt: 'Grafito Pilka', nameEn: 'Graphite Gray' },
  grey: { hex: '#4b5563', nameLt: 'Grafito Pilka', nameEn: 'Graphite Gray' },
  'pilka': { hex: '#4b5563', nameLt: 'Pilka', nameEn: 'Gray' },
  'pilką': { hex: '#4b5563', nameLt: 'Pilka', nameEn: 'Gray' },

  gold: { hex: '#d97706', nameLt: 'Auksinė', nameEn: 'Gold' },
  'auksinė': { hex: '#d97706', nameLt: 'Auksinė', nameEn: 'Gold' },
  'auksinę': { hex: '#d97706', nameLt: 'Auksinė', nameEn: 'Gold' },

  silver: { hex: '#94a3b8', nameLt: 'Sidabrinė', nameEn: 'Silver' },
  'sidabrinė': { hex: '#94a3b8', nameLt: 'Sidabrinė', nameEn: 'Silver' },
  'sidabrinę': { hex: '#94a3b8', nameLt: 'Sidabrinė', nameEn: 'Silver' },
};

// Play short pleasant Web Audio feedback chime
function playAudioChime(type: 'success' | 'listening' | 'error') {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === 'success') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } else if (type === 'listening') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(554.37, ctx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
      osc.start();
      osc.stop(ctx.currentTime + 0.2);
    } else {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(160, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    }
  } catch {
    // ignore audio context restrictions
  }
}

export const VoiceControlPanel: React.FC<VoiceCommandProps> = ({
  customization,
  onChangeCustomization,
  onApplyPresetTemplate,
  onOpenShareModal,
  onOpenARModal,
  onOpenSizeGuideModal,
  onOpenLightingModal,
  onOpenTemplatesModal,
  onTriggerSnapshot,
  onUndo,
  onRedo,
  onSaveToWishlist,
  onOpenWishlist,
  onOpenCompare,
}) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [lastExecutedCommand, setLastExecutedCommand] = useState<string | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<{ text: string; success: boolean } | null>(null);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [audioFeedbackEnabled, setAudioFeedbackEnabled] = useState(true);
  const [speechSynthesisEnabled, setSpeechSynthesisEnabled] = useState(false);
  const [isSupported, setIsSupported] = useState(true);

  const recognitionRef = useRef<any>(null);
  const isListeningRef = useRef(false);
  const restartTimerRef = useRef<any>(null);

  // Optional Voice spoken confirmation
  const speakFeedback = (text: string) => {
    if (!speechSynthesisEnabled || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.1;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    } catch {
      // ignore
    }
  };

  // Process text command
  const executeCommand = useCallback(
    (inputRaw: string): boolean => {
      const phrase = inputRaw.toLowerCase().trim();
      if (!phrase) return false;

      let recognized = false;
      let feedback = '';

      // 1. LIGHTING COMMANDS (Explicit requirement: "show me neon lighting")
      if (
        phrase.includes('neon lighting') ||
        phrase.includes('neon light') ||
        phrase.includes('show me neon') ||
        phrase.includes('neon night') ||
        phrase.includes('neoninis apšvietimas') ||
        phrase.includes('parodyk neon') ||
        phrase.includes('kiberpank apšvietimas')
      ) {
        onChangeCustomization((c) => ({ ...c, lightingPreset: 'neon-night' }), 'Balso komanda: Neon Night apšvietimas');
        feedback = 'Įjungtas Neon Night apšvietimas!';
        recognized = true;
      } else if (
        phrase.includes('studio white') ||
        phrase.includes('studio lighting') ||
        phrase.includes('show me studio') ||
        phrase.includes('white lighting') ||
        phrase.includes('studijos apšvietimas') ||
        phrase.includes('balta šviesa')
      ) {
        onChangeCustomization((c) => ({ ...c, lightingPreset: 'studio' }), 'Balso komanda: Studio White apšvietimas');
        feedback = 'Įjungtas Studio White neutralus apšvietimas!';
        recognized = true;
      } else if (
        phrase.includes('golden hour') ||
        phrase.includes('sunset') ||
        phrase.includes('warm lighting') ||
        phrase.includes('auksinė valanda') ||
        phrase.includes('saulėlydžio šviesa') ||
        phrase.includes('šilta šviesa')
      ) {
        onChangeCustomization((c) => ({ ...c, lightingPreset: 'golden-hour' }), 'Balso komanda: Golden Hour apšvietimas');
        feedback = 'Įjungtas šiltas Golden Hour apšvietimas!';
        recognized = true;
      } else if (
        phrase.includes('daylight') ||
        phrase.includes('natural light') ||
        phrase.includes('dienos šviesa') ||
        phrase.includes('natūrali šviesa')
      ) {
        onChangeCustomization((c) => ({ ...c, lightingPreset: 'daylight' }), 'Balso komanda: Daylight apšvietimas');
        feedback = 'Įjungtas natūralios dienos apšvietimas!';
        recognized = true;
      } else if (
        phrase.includes('brighter') ||
        phrase.includes('increase brightness') ||
        phrase.includes('more light') ||
        phrase.includes('šviesiau') ||
        phrase.includes('daugiau šviesos')
      ) {
        onChangeCustomization(
          (c) => ({
            ...c,
            studioBrightness: Math.min(2.0, Number((c.studioBrightness + 0.25).toFixed(2))),
          }),
          'Balso komanda: Padidintas šviesumas'
        );
        feedback = 'Padidintas studijos ryškumas!';
        recognized = true;
      } else if (
        phrase.includes('dimmer') ||
        phrase.includes('decrease brightness') ||
        phrase.includes('less light') ||
        phrase.includes('tamsiau') ||
        phrase.includes('mažiau šviesos')
      ) {
        onChangeCustomization(
          (c) => ({
            ...c,
            studioBrightness: Math.max(0.7, Number((c.studioBrightness - 0.25).toFixed(2))),
          }),
          'Balso komanda: Sumažintas šviesumas'
        );
        feedback = 'Sumažintas studijos ryškumas!';
        recognized = true;
      } else if (
        phrase.includes('dark studio') ||
        phrase.includes('dark mode') ||
        phrase.includes('tamsi studija')
      ) {
        onChangeCustomization((c) => ({ ...c, studioTheme: 'dark' }), 'Balso komanda: Tamsi studija');
        feedback = 'Įjungta tamsi studijos aplinka!';
        recognized = true;
      } else if (
        phrase.includes('bright studio') ||
        phrase.includes('light studio') ||
        phrase.includes('šviesi studija')
      ) {
        onChangeCustomization((c) => ({ ...c, studioTheme: 'bright' }), 'Balso komanda: Šviesi studija');
        feedback = 'Įjungta šviesi studijos aplinka!';
        recognized = true;
      }

      // 2. COLOR COMMANDS (Explicit requirement: "change color to blue")
      if (!recognized) {
        const isAccentTarget =
          phrase.includes('accent') || phrase.includes('akcent') || phrase.includes('akcentinė');
        const isSecondaryTarget =
          phrase.includes('secondary') || phrase.includes('antrin') || phrase.includes('antrinė');
        const isHardwareTarget =
          phrase.includes('hardware') ||
          phrase.includes('zipper') ||
          phrase.includes('užtrauktuk') ||
          phrase.includes('detal');

        // Check color keywords
        for (const [key, colorData] of Object.entries(COLOR_MAP)) {
          // e.g. "change color to blue", "color blue", "blue color", "pakeisk spalvą į mėlyną"
          const matchesColor =
            phrase.includes(`to ${key}`) ||
            phrase.includes(`į ${key}`) ||
            phrase.includes(`color ${key}`) ||
            phrase.includes(`spalva ${key}`) ||
            phrase.includes(`spalvą ${key}`) ||
            phrase.endsWith(` ${key}`) ||
            phrase.startsWith(`${key} `) ||
            phrase === key;

          if (matchesColor) {
            if (isAccentTarget) {
              onChangeCustomization(
                (c) => ({ ...c, accentColor: colorData.hex }),
                `Balso komanda: Akcento spalva į ${colorData.nameLt}`
              );
              feedback = `Akcento spalva pakeista į ${colorData.nameLt}!`;
            } else if (isSecondaryTarget) {
              onChangeCustomization(
                (c) => ({ ...c, secondaryColor: colorData.hex }),
                `Balso komanda: Antrinė spalva į ${colorData.nameLt}`
              );
              feedback = `Antrinė spalva pakeista į ${colorData.nameLt}!`;
            } else if (isHardwareTarget) {
              onChangeCustomization(
                (c) => ({ ...c, hardwareColor: colorData.hex }),
                `Balso komanda: Furnitūra į ${colorData.nameLt}`
              );
              feedback = `Furnitūros spalva pakeista į ${colorData.nameLt}!`;
            } else {
              // Primary color
              onChangeCustomization(
                (c) => ({ ...c, primaryColor: colorData.hex }),
                `Balso komanda: Pagrindinė spalva į ${colorData.nameLt}`
              );
              feedback = `Pagrindinė spalva pakeista į ${colorData.nameLt}!`;
            }
            recognized = true;
            break;
          }
        }
      }

      // 3. PRESET TEMPLATES COMMANDS
      if (!recognized) {
        if (
          phrase.includes('cyberpunk') ||
          phrase.includes('kiberpank') ||
          phrase.includes('neo tokyo')
        ) {
          const tmpl = PRESET_DESIGN_TEMPLATES.find((t) => t.id === 'cyberpunk');
          if (tmpl) {
            onApplyPresetTemplate(tmpl);
            feedback = 'Pritaikytas Cyberpunk 2099 šablonas!';
            recognized = true;
          }
        } else if (
          phrase.includes('minimalist') ||
          phrase.includes('minimal') ||
          phrase.includes('minimalus')
        ) {
          const tmpl = PRESET_DESIGN_TEMPLATES.find((t) => t.id === 'minimal-mono');
          if (tmpl) {
            onApplyPresetTemplate(tmpl);
            feedback = 'Pritaikytas Minimalist Monochrome šablonas!';
            recognized = true;
          }
        } else if (
          phrase.includes('floral') ||
          phrase.includes('botanical') ||
          phrase.includes('nature') ||
          phrase.includes('gėlių') ||
          phrase.includes('augal')
        ) {
          const tmpl = PRESET_DESIGN_TEMPLATES.find((t) => t.id === 'botanical-eco');
          if (tmpl) {
            onApplyPresetTemplate(tmpl);
            feedback = 'Pritaikytas Botanical Eco / Floral šablonas!';
            recognized = true;
          }
        } else if (
          phrase.includes('vintage') ||
          phrase.includes('retro')
        ) {
          const tmpl = PRESET_DESIGN_TEMPLATES.find((t) => t.id === 'vintage-heritage');
          if (tmpl) {
            onApplyPresetTemplate(tmpl);
            feedback = 'Pritaikytas Vintage Heritage šablonas!';
            recognized = true;
          }
        } else if (
          phrase.includes('streetwear') ||
          phrase.includes('grafiti')
        ) {
          const tmpl = PRESET_DESIGN_TEMPLATES.find((t) => t.id === 'streetwear-acid');
          if (tmpl) {
            onApplyPresetTemplate(tmpl);
            feedback = 'Pritaikytas Acid Streetwear šablonas!';
            recognized = true;
          }
        }
      }

      // 4. FABRIC & MATERIAL COMMANDS
      if (!recognized) {
        const fabricMatches = [
          { key: 'šilk', id: 'mulberry-silk', name: 'Prabangus Mulberry Šilkas' },
          { key: 'silk', id: 'mulberry-silk', name: 'Mulberry Silk' },
          { key: 'džins', id: 'selvedge-denim', name: 'Tvirtas Selvedge Džinsas' },
          { key: 'denim', id: 'selvedge-denim', name: 'Selvedge Denim' },
          { key: 'viln', id: 'merino-wool', name: 'Švelni Merino Vilna' },
          { key: 'wool', id: 'merino-wool', name: 'Merino Wool' },
          { key: 'medviln', id: 'tech-cotton', name: 'Minkšta Šukuotinė Medvilnė' },
          { key: 'cotton', id: 'tech-cotton', name: 'Combed Cotton' },
          { key: 'softshell', id: 'gore-aero', name: 'Neperpučiamas Softshell' },
          { key: 'ripstop', id: 'gore-aero', name: 'Ripstop' },
          { key: 'scuba', id: 'bio-neoprene', name: 'Sportinis Scuba Trikotažas' },
          { key: 'neopren', id: 'bio-neoprene', name: 'Neoprene' },
          { key: 'od', id: 'matte-leather', name: 'Reljefinė Eko Oda' },
          { key: 'leather', id: 'matte-leather', name: 'Leather' },
          { key: 'chrom', id: 'liquid-chrome', name: 'Matinė Eko Oda' },
        ];

        for (const fm of fabricMatches) {
          if (phrase.includes(fm.key)) {
            const fabricObj = FABRICS.find((f: FabricMaterial) => f.id === fm.id);
            if (fabricObj) {
              onChangeCustomization(
                (c) => ({ ...c, fabricId: fabricObj.id }),
                `Balso komanda: Audinys ${fabricObj.nameLt}`
              );
              feedback = `Audinys pakeistas į ${fabricObj.nameLt}!`;
              recognized = true;
              break;
            }
          }
        }
      }

      // 5. SIZE & FIT COMMANDS
      if (!recognized) {
        if (
          phrase.includes('oversized') ||
          phrase.includes('oversize') ||
          phrase.includes('padidintas')
        ) {
          onChangeCustomization((c) => ({ ...c, fitMode: 'oversized' }), 'Balso komanda: Oversized kirpimas');
          feedback = 'Kirpimas pakeistas į Oversized!';
          recognized = true;
        } else if (
          phrase.includes('tailored') ||
          phrase.includes('slim') ||
          phrase.includes('siauras')
        ) {
          onChangeCustomization((c) => ({ ...c, fitMode: 'tailored' }), 'Balso komanda: Tailored kirpimas');
          feedback = 'Kirpimas pakeistas į Tailored (prigludusį)!';
          recognized = true;
        } else if (
          phrase.includes('regular fit') ||
          phrase.includes('standartinis')
        ) {
          onChangeCustomization((c) => ({ ...c, fitMode: 'regular' }), 'Balso komanda: Regular kirpimas');
          feedback = 'Kirpimas pakeistas į Regular!';
          recognized = true;
        } else if (phrase.includes('size xs') || phrase.includes('dydis xs')) {
          onChangeCustomization((c) => ({ ...c, size: 'XS' }), 'Balso komanda: Dydis XS');
          feedback = 'Dydis pakeistas į XS!';
          recognized = true;
        } else if (phrase.includes('size s') || phrase.includes('dydis s') || phrase.includes('size small')) {
          onChangeCustomization((c) => ({ ...c, size: 'S' }), 'Balso komanda: Dydis S');
          feedback = 'Dydis pakeistas į S!';
          recognized = true;
        } else if (phrase.includes('size m') || phrase.includes('dydis m') || phrase.includes('size medium')) {
          onChangeCustomization((c) => ({ ...c, size: 'M' }), 'Balso komanda: Dydis M');
          feedback = 'Dydis pakeistas į M!';
          recognized = true;
        } else if (phrase.includes('size l') || phrase.includes('dydis l') || phrase.includes('size large')) {
          onChangeCustomization((c) => ({ ...c, size: 'L' }), 'Balso komanda: Dydis L');
          feedback = 'Dydis pakeistas į L!';
          recognized = true;
        } else if (phrase.includes('size xl') || phrase.includes('dydis xl') || phrase.includes('extra large')) {
          onChangeCustomization((c) => ({ ...c, size: 'XL' }), 'Balso komanda: Dydis XL');
          feedback = 'Dydis pakeistas į XL!';
          recognized = true;
        } else if (phrase.includes('size xxl') || phrase.includes('dydis xxl') || phrase.includes('double xl')) {
          onChangeCustomization((c) => ({ ...c, size: 'XXL' }), 'Balso komanda: Dydis XXL');
          feedback = 'Dydis pakeistas į XXL!';
          recognized = true;
        }
      }

      // 6. ROTATION & 3D CONTROLS
      if (!recognized) {
        if (
          phrase.includes('rotate') ||
          phrase.includes('spin') ||
          phrase.includes('sukti') ||
          phrase.includes('suktis')
        ) {
          onChangeCustomization(
            (c) => ({ ...c, autoRotate: !c.autoRotate }),
            'Balso komanda: Sukimo perjungimas'
          );
          feedback = '3D modelio automatinis sukimasis perjungtas!';
          recognized = true;
        } else if (phrase.includes('front view') || phrase.includes('priekis')) {
          onChangeCustomization((c) => ({ ...c, cameraPreset: 'front' }), 'Balso komanda: Priekinė kamera');
          feedback = 'Kamera nukreipta į priekį!';
          recognized = true;
        } else if (phrase.includes('back view') || phrase.includes('galas')) {
          onChangeCustomization((c) => ({ ...c, cameraPreset: 'back' }), 'Balso komanda: Galinė kamera');
          feedback = 'Kamera nukreipta į nugarą!';
          recognized = true;
        } else if (phrase.includes('side view') || phrase.includes('šonas')) {
          onChangeCustomization((c) => ({ ...c, cameraPreset: 'side' }), 'Balso komanda: Šoninė kamera');
          feedback = 'Kamera nukreipta iš šono!';
          recognized = true;
        } else if (phrase.includes('wireframe') || phrase.includes('tinklelis')) {
          onChangeCustomization((c) => ({ ...c, wireframe: !c.wireframe }), 'Balso komanda: Tinklelis');
          feedback = 'Tinklelio režimas perjungtas!';
          recognized = true;
        } else if (phrase.includes('exploded') || phrase.includes('išskaidyti')) {
          onChangeCustomization((c) => ({ ...c, exploded: !c.exploded }), 'Balso komanda: Išskaidymas');
          feedback = 'Išskaidytas 3D vaizdas perjungtas!';
          recognized = true;
        }
      }

      // 7. ACTIONS & MODALS
      if (!recognized) {
        if (
          phrase.includes('snapshot') ||
          phrase.includes('photo') ||
          phrase.includes('picture') ||
          phrase.includes('nuotrauk') ||
          phrase.includes('fotografuoti')
        ) {
          onTriggerSnapshot();
          feedback = '3D kadras išsaugotas!';
          recognized = true;
        } else if (
          phrase.includes('share') ||
          phrase.includes('dalintis') ||
          phrase.includes('social') ||
          phrase.includes('instagram') ||
          phrase.includes('pinterest')
        ) {
          onOpenShareModal();
          feedback = 'Atidarytas dalinimosi langas!';
          recognized = true;
        } else if (
          phrase.includes('ar view') ||
          phrase.includes('augmented') ||
          phrase.includes('papildyta realyb') ||
          phrase.includes('kamera')
        ) {
          onOpenARModal();
          feedback = 'Atidaryta papildytos realybės (AR) peržiūra!';
          recognized = true;
        } else if (
          phrase.includes('size guide') ||
          phrase.includes('dydžių gidas') ||
          phrase.includes('išmatavimai') ||
          phrase.includes('matmenys')
        ) {
          onOpenSizeGuideModal();
          feedback = 'Atidarytas Dydžių ir Kūno Matmenų gidas!';
          recognized = true;
        } else if (
          phrase.includes('lighting') ||
          phrase.includes('apšvietim')
        ) {
          onOpenLightingModal();
          feedback = 'Atidarytas 3D apšvietimo valdymo skydelis!';
          recognized = true;
        } else if (
          phrase.includes('template') ||
          phrase.includes('preset') ||
          phrase.includes('šablon')
        ) {
          onOpenTemplatesModal();
          feedback = 'Atidaryta Dizaino Šablonų biblioteka!';
          recognized = true;
        } else if (
          (phrase.includes('undo') || phrase.includes('atšaukti')) &&
          onUndo
        ) {
          onUndo();
          feedback = 'Pakeitimas atšauktas!';
          recognized = true;
        } else if (
          (phrase.includes('redo') || phrase.includes('grąžinti')) &&
          onRedo
        ) {
          onRedo();
          feedback = 'Pakeitimas grąžintas!';
          recognized = true;
        } else if (
          (phrase.includes('save to wishlist') ||
            phrase.includes('add to wishlist') ||
            phrase.includes('išsaugoti į wishlist') ||
            phrase.includes('išsaugoti modelį') ||
            phrase.includes('įsiminti')) &&
          onSaveToWishlist
        ) {
          onSaveToWishlist();
          feedback = 'Modelis išsaugotas į Wishlist!';
          recognized = true;
        } else if (
          (phrase.includes('open wishlist') ||
            phrase.includes('show wishlist') ||
            phrase.includes('atidaryti wishlist') ||
            phrase.includes('mano rūbai') ||
            phrase.includes('norų sąrašas')) &&
          onOpenWishlist
        ) {
          onOpenWishlist();
          feedback = 'Atidarytas Wishlist sąrašas!';
          recognized = true;
        } else if (
          (phrase.includes('compare') ||
            phrase.includes('side by side') ||
            phrase.includes('palyginti') ||
            phrase.includes('lyginimas')) &&
          onOpenCompare
        ) {
          onOpenCompare();
          feedback = 'Atidarytas Side-by-Side drabužių lyginimas!';
          recognized = true;
        }
      }

      setLastExecutedCommand(inputRaw);

      if (recognized) {
        setFeedbackMessage({ text: feedback, success: true });
        if (audioFeedbackEnabled) playAudioChime('success');
        speakFeedback(feedback);
      } else {
        setFeedbackMessage({
          text: `Neatpažinta: "${inputRaw}". Spustelėk klaustuką dėl komandų sąrašo!`,
          success: false,
        });
        if (audioFeedbackEnabled) playAudioChime('error');
      }

      setTimeout(() => {
        setFeedbackMessage((current) => (current?.text === feedback ? null : current));
      }, 4000);

      return recognized;
    },
    [
      audioFeedbackEnabled,
      onChangeCustomization,
      onApplyPresetTemplate,
      onOpenShareModal,
      onOpenARModal,
      onOpenSizeGuideModal,
      onOpenLightingModal,
      onOpenTemplatesModal,
      onTriggerSnapshot,
      onUndo,
      onRedo,
      speechSynthesisEnabled,
    ]
  );

  // Initialize Speech Recognition API
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setIsSupported(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;
      recognition.lang = 'en-US'; // Primary engine; our regex supports both EN and LT commands

      recognition.onstart = () => {
        setIsListening(true);
        isListeningRef.current = true;
      };

      recognition.onresult = (event: any) => {
        let currentInterim = '';
        let finalPhrase = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalPhrase += event.results[i][0].transcript;
          } else {
            currentInterim += event.results[i][0].transcript;
          }
        }

        setInterimTranscript(currentInterim);

        if (finalPhrase.trim()) {
          setTranscript(finalPhrase);
          executeCommand(finalPhrase);
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('SpeechRecognition error:', event.error);
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          setIsListening(false);
          isListeningRef.current = false;
        }
      };

      recognition.onend = () => {
        // If user didn't explicitly toggle off, restart to keep hands-free experience active
        if (isListeningRef.current) {
          restartTimerRef.current = setTimeout(() => {
            try {
              recognition.start();
            } catch {
              // ignore restart collision
            }
          }, 300);
        } else {
          setIsListening(false);
        }
      };

      recognitionRef.current = recognition;
    } catch (e) {
      console.warn('SpeechRecognition initialization error:', e);
      setIsSupported(false);
    }

    return () => {
      if (restartTimerRef.current) clearTimeout(restartTimerRef.current);
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // ignore
        }
      }
    };
  }, [executeCommand]);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      setIsHelpOpen(true);
      return;
    }

    if (isListening) {
      isListeningRef.current = false;
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
      setIsListening(false);
      setInterimTranscript('');
    } else {
      isListeningRef.current = true;
      try {
        recognitionRef.current.start();
        setIsListening(true);
        if (audioFeedbackEnabled) playAudioChime('listening');
      } catch (err) {
        console.error('Failed to start speech recognition:', err);
      }
    }
  };

  // Curated clickable command test chips
  const EXAMPLE_COMMANDS = [
    { label: "'change color to blue'", category: 'Spalva', command: 'change color to blue' },
    { label: "'show me neon lighting'", category: 'Apšvietimas', command: 'show me neon lighting' },
    { label: "'show me golden hour'", category: 'Apšvietimas', command: 'show me golden hour' },
    { label: "'studio white'", category: 'Apšvietimas', command: 'studio white' },
    { label: "'apply cyberpunk preset'", category: 'Šablonas', command: 'apply cyberpunk preset' },
    { label: "'apply minimalist preset'", category: 'Šablonas', command: 'apply minimalist preset' },
    { label: "'apply floral preset'", category: 'Šablonas', command: 'apply floral preset' },
    { label: "'color red'", category: 'Spalva', command: 'color red' },
    { label: "'color emerald'", category: 'Spalva', command: 'color emerald' },
    { label: "'color neon green'", category: 'Spalva', command: 'color neon green' },
    { label: "'accent color yellow'", category: 'Spalva', command: 'accent color yellow' },
    { label: "'change fabric to denim'", category: 'Audinys', command: 'change fabric to denim' },
    { label: "'change fabric to silk'", category: 'Audinys', command: 'change fabric to silk' },
    { label: "'change fabric to leather'", category: 'Audinys', command: 'change fabric to leather' },
    { label: "'change size to XL'", category: 'Dydis', command: 'change size to XL' },
    { label: "'oversized fit'", category: 'Kirpimas', command: 'oversized fit' },
    { label: "'rotate model'", category: 'Kamera', command: 'rotate model' },
    { label: "'take snapshot'", category: 'Eksportas', command: 'take snapshot' },
    { label: "'share design'", category: 'Social', command: 'share design' },
    { label: "'open AR view'", category: 'AR', command: 'open AR view' },
    { label: "'save to wishlist'", category: 'Wishlist', command: 'save to wishlist' },
    { label: "'open wishlist'", category: 'Wishlist', command: 'open wishlist' },
    { label: "'compare'", category: 'Lyginimas', command: 'compare' },
  ];

  return (
    <>
      {/* 1. Main Floating HUD Bar on 3D Stage */}
      <div className="flex items-center gap-2">
        {/* Toggle Voice Button */}
        <button
          onClick={toggleListening}
          title={
            isListening
              ? 'Balso atpažinimas įjungtas (Paspausk, kad sustabdytum)'
              : 'Įjungti valdymą balsu ("change color to blue", "show me neon lighting")'
          }
          className={`relative p-2.5 rounded-lg border text-xs font-mono font-bold transition-all flex items-center gap-2 shadow-lg backdrop-blur-md cursor-pointer select-none ${
            isListening
              ? 'bg-rose-500/20 border-rose-500/80 text-rose-300 ring-2 ring-rose-500/50 shadow-rose-500/30 animate-pulse'
              : 'bg-neutral-900/90 border-neutral-700/80 text-neutral-300 hover:text-white hover:bg-neutral-800'
          }`}
        >
          {isListening ? (
            <>
              <div className="relative">
                <Mic className="w-3.5 h-3.5 text-rose-400" />
                <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-rose-500 animate-ping" />
              </div>
              <span className="text-[11px] font-extrabold text-rose-300 flex items-center gap-1.5">
                <span>Klausoma...</span>
                {/* Audio wave simulation bars */}
                <span className="flex items-center gap-0.5 h-3">
                  <span className="w-0.5 h-2 bg-rose-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-0.5 h-3 bg-rose-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-0.5 h-1.5 bg-rose-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </span>
              </span>
            </>
          ) : (
            <>
              <Mic className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline text-[11px]">Balsas</span>
            </>
          )}
        </button>

        {/* Quick Cheatsheet / Help button */}
        <button
          onClick={() => setIsHelpOpen(true)}
          title="Peržiūrėti palaikomas balso komandas ir išbandyti 1 paspaudimu"
          className="p-2.5 rounded-lg border border-neutral-700/80 bg-neutral-900/80 text-neutral-400 hover:text-amber-300 hover:bg-neutral-800 text-xs font-mono transition-all backdrop-blur-md"
        >
          <HelpCircle className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 2. Floating Live Speech Notification Toast */}
      {(interimTranscript || feedbackMessage) && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 max-w-lg w-11/12 pointer-events-none animate-in fade-in slide-in-from-bottom-3 duration-200">
          <div
            className={`p-3.5 rounded-2xl border backdrop-blur-xl shadow-2xl flex items-center gap-3 ${
              feedbackMessage
                ? feedbackMessage.success
                  ? 'bg-neutral-900/95 border-emerald-500/60 text-emerald-200 shadow-emerald-500/20'
                  : 'bg-neutral-900/95 border-amber-500/60 text-amber-200 shadow-amber-500/20'
                : 'bg-neutral-900/95 border-rose-500/50 text-white shadow-rose-500/20'
            }`}
          >
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                feedbackMessage
                  ? feedbackMessage.success
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : 'bg-amber-500/20 text-amber-400'
                  : 'bg-rose-500/20 text-rose-400 animate-pulse'
              }`}
            >
              {feedbackMessage ? (
                feedbackMessage.success ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <Sparkles className="w-4 h-4" />
                )
              ) : (
                <Mic className="w-4 h-4" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="text-[11px] font-mono uppercase tracking-wider text-neutral-400">
                {feedbackMessage
                  ? feedbackMessage.success
                    ? '✓ Balso komanda atlikta'
                    : 'ℹ️ Balso asistentas'
                  : '🎤 Klausomasi jūsų balso...'}
              </div>
              <div className="text-xs font-medium text-white truncate mt-0.5">
                {feedbackMessage ? feedbackMessage.text : `"${interimTranscript}"`}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. Voice Commands Cheatsheet & Interactive Testing Modal */}
      {isHelpOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div
            className="w-full max-w-2xl bg-neutral-900 border border-neutral-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-6 py-4 border-b border-neutral-800 bg-neutral-950/80 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400">
                  <Mic className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <span>Valdymas Balsu (Hands-Free StyleLab)</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                      AI Speech
                    </span>
                  </h3>
                  <p className="text-xs text-neutral-400">
                    Balsu keisk drabužio spalvą, apšvietimą, šablonus ir 3D parametrus
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsHelpOpen(false)}
                className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 overflow-y-auto flex flex-col gap-6">
              {/* Active Mic Status & Test Trigger */}
              <div className="p-4 rounded-2xl border border-neutral-800 bg-neutral-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-3.5 h-3.5 rounded-full ${
                      isListening ? 'bg-rose-500 animate-ping' : 'bg-neutral-600'
                    }`}
                  />
                  <div>
                    <div className="text-xs font-bold text-white flex items-center gap-2">
                      <span>Mikrofonas: {isListening ? 'KLAUSOSI' : 'PASTABDYTAS'}</span>
                      {!isSupported && (
                        <span className="text-[10px] text-amber-400">(Naudok demonstracinius mygtukus žemiau)</span>
                      )}
                    </div>
                    <div className="text-[11px] text-neutral-400">
                      Sakykite komandą anglų arba lietuvių kalba
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    onClick={toggleListening}
                    className={`flex-1 sm:flex-none px-4 py-2 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition active:scale-95 cursor-pointer ${
                      isListening
                        ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/30'
                        : 'bg-amber-400 hover:bg-amber-300 text-neutral-950 shadow-lg shadow-amber-400/20'
                    }`}
                  >
                    {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                    <span>{isListening ? 'Išjungti mikrofoną' : 'Įjungti mikrofoną'}</span>
                  </button>

                  <button
                    onClick={() => setAudioFeedbackEnabled(!audioFeedbackEnabled)}
                    title={audioFeedbackEnabled ? 'Išjungti garso signalus' : 'Įjungti garso signalus'}
                    className={`p-2 rounded-xl border transition ${
                      audioFeedbackEnabled
                        ? 'border-amber-400/40 text-amber-400 bg-amber-400/10'
                        : 'border-neutral-800 text-neutral-500 bg-neutral-900'
                    }`}
                  >
                    {audioFeedbackEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Click-to-Test Interactive Commands Grid */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-mono uppercase tracking-wider text-amber-400 font-bold flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Išbandyk komandas 1 paspaudimu (Click to Test):</span>
                  </h4>
                  <span className="text-[10px] text-neutral-500">Spustelk bet kurį pavyzdį</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {EXAMPLE_COMMANDS.map((cmd) => (
                    <button
                      key={cmd.command}
                      onClick={() => executeCommand(cmd.command)}
                      className="p-3 rounded-xl border border-neutral-800 bg-neutral-950/60 hover:bg-neutral-800/80 hover:border-amber-400/50 text-left transition flex items-center justify-between group active:scale-98 cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-neutral-800 text-neutral-300 group-hover:bg-amber-400/10 group-hover:text-amber-300">
                          {cmd.category}
                        </span>
                        <span className="text-xs font-mono text-white group-hover:text-amber-300 font-medium">
                          {cmd.label}
                        </span>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-neutral-600 group-hover:text-amber-400 group-hover:translate-x-0.5 transition" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Category Breakdown Guide */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                {/* 1. Lighting presets */}
                <div className="p-3.5 rounded-xl border border-neutral-800/80 bg-neutral-950/40">
                  <div className="font-bold text-amber-300 mb-1 flex items-center gap-1.5">
                    <Sun className="w-3.5 h-3.5" />
                    <span>3D Apšvietimas (Lighting)</span>
                  </div>
                  <ul className="text-neutral-400 space-y-1 text-[11px] list-disc list-inside">
                    <li><code className="text-neutral-200">"show me neon lighting"</code> – Neon Night</li>
                    <li><code className="text-neutral-200">"studio white"</code> – 5500K fotostudija</li>
                    <li><code className="text-neutral-200">"golden hour"</code> – Saulėlydžio šviesa</li>
                    <li><code className="text-neutral-200">"brighter"</code> / <code className="text-neutral-200">"dimmer"</code> – Ryškumas</li>
                  </ul>
                </div>

                {/* 2. Color adjustments */}
                <div className="p-3.5 rounded-xl border border-neutral-800/80 bg-neutral-950/40">
                  <div className="font-bold text-cyan-300 mb-1 flex items-center gap-1.5">
                    <Palette className="w-3.5 h-3.5" />
                    <span>Spalvos (Colors)</span>
                  </div>
                  <ul className="text-neutral-400 space-y-1 text-[11px] list-disc list-inside">
                    <li><code className="text-neutral-200">"change color to blue"</code> – Karališka mėlyna</li>
                    <li><code className="text-neutral-200">"color red / green / yellow"</code> – Pagrindinė</li>
                    <li><code className="text-neutral-200">"accent color pink"</code> – Akcentinė linija</li>
                    <li><code className="text-neutral-200">"hardware gold"</code> – Užtrauktukai ir metalas</li>
                  </ul>
                </div>

                {/* 3. Preset Templates */}
                <div className="p-3.5 rounded-xl border border-neutral-800/80 bg-neutral-950/40">
                  <div className="font-bold text-emerald-300 mb-1 flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5" />
                    <span>Šablonai (Templates)</span>
                  </div>
                  <ul className="text-neutral-400 space-y-1 text-[11px] list-disc list-inside">
                    <li><code className="text-neutral-200">"apply cyberpunk preset"</code> – Kiberpank 2099</li>
                    <li><code className="text-neutral-200">"apply minimalist preset"</code> – Monochromas</li>
                    <li><code className="text-neutral-200">"apply floral preset"</code> – Botaninis / Eco</li>
                    <li><code className="text-neutral-200">"apply streetwear preset"</code> – Acid grafika</li>
                  </ul>
                </div>

                {/* 4. Controls & Export */}
                <div className="p-3.5 rounded-xl border border-neutral-800/80 bg-neutral-950/40">
                  <div className="font-bold text-purple-300 mb-1 flex items-center gap-1.5">
                    <Camera className="w-3.5 h-3.5" />
                    <span>Kamera & Eksportas</span>
                  </div>
                  <ul className="text-neutral-400 space-y-1 text-[11px] list-disc list-inside">
                    <li><code className="text-neutral-200">"take snapshot"</code> – Išsaugoti nuotrauką</li>
                    <li><code className="text-neutral-200">"share design"</code> – Instagram/Pinterest dalinimasis</li>
                    <li><code className="text-neutral-200">"open AR view"</code> – Papildyta realybė</li>
                    <li><code className="text-neutral-200">"rotate model"</code> – Įjungti / išjungti sukimą</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-3 border-t border-neutral-800 bg-neutral-950/80 flex items-center justify-between text-xs text-neutral-400">
              <span>Paskutinė vykdyta: <strong className="text-amber-400 font-mono">{lastExecutedCommand || '—'}</strong></span>
              <button
                onClick={() => setIsHelpOpen(false)}
                className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-medium transition cursor-pointer"
              >
                Uždaryti
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
