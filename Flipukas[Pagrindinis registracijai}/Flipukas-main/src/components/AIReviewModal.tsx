import React, { useState } from 'react';
import {
  X,
  Copy,
  Check,
  Download,
  Bot,
  Sparkles,
  FileCode,
  Layers,
  Cpu,
  Compass,
  ArrowRight,
  ShieldCheck,
  Share2,
} from 'lucide-react';

interface AIReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AI_PROMPT_CONTENT = `# FLIPUKAS ATELIER – IŠSAMUS PROJEKTO DOSJĖ IR AUDITO DOKUMENTAS (SKIRTAS AI PERŽIŪRAI)

Tu esi vyriausiasis skaitmeninių produktų architektas (Chief Product Officer), mados technologijų (FashionTech) investuotojas ir aukščiausio lygio UX/UI bei Three.js ekspertas.
Tavo užduotis: išsamiai ir kritiškai įvertinti pateiktą 3D drabužių el. prekybos ir stiliaus platformą „Flipukas Atelier“, identifikuoti trūkumus, silpnąsias vietas bei pateikti aiškų planą, kaip pasiekti 10/10 lygį ir globalų vienaragio (Unicorn) mastelį.

---

## 1. PROJEKTO SANTRAUKA IR VIZIJA
- Pavadinimas: Flipukas Atelier (3D Drabužių ir Autorinio Stiliaus Platforma)
- Koncepcija: Hibridinis mados namų (Haute Couture) ir interaktyvios 3D e-komercijos modelis, leidžiantis vartotojui naršyklėje realiu laiku modeliuoti, keisti ir apžiūrėti drabužius 360° kampu, tirti mikroskopinius audinių pynimus bei užsisakyti pagal individualią tvarią gamybą (On-Demand / Zero-Waste).
- Misija: Pašalinti didžiausią internetinės prekybos drabužiais problemą – netikrumą dėl audinio kritimo, dydžio ir spalvų, sujungiant WebGL 3D technologiją, audinio fizikos simuliaciją ir aukščiausios klasės atelier estetiką.
- Tikslinė rinka: Mados entuziastai, Z ir Tūkstantmečio kartos pirkėjai, ieškantys unikalumo, tvarios mados gerbėjai, nepriklausomi drabužių kūrėjai.

---

## 2. TECHNOLOGINIS STEKAS
- Frontend branduolys: React 19, TypeScript, Vite
- 3D & Grafika: Three.js (WebGL Canvas su dinaminiais šviesos šaltiniais, bump/normal šešėliavimu, kameros orbitomis, procedūrine audinio fizika)
- Stilius: Tailwind CSS v4, individualios prabangios temos („Luxury Caviar & Champagne Gold“), Google Fonts (Cormorant Garamond, Cinzel, Plus Jakarta Sans)
- Backend & Duomenų bazė: Firebase Firestore (realaus laiko kolekcijos, vartotojų duomenys, galerija) ir Firebase Authentication
- Pagalbinės bibliotekos: Lucide React (ikonos), Canvas Confetti (apdovanojimų ir atsiskaitymo animacijos)
- Saugumas & Taisyklės: firestore.rules su rolių bei naudotojo ID patikra

---

## 3. ĮDIEGTŲ FUNKCIJŲ IR MODULIŲ KATALOGAS
1. 3D Stiliaus Laboratorija (StyleLab):
   - Realaus laiko 3D atvaizdavimas su 360° rotacija, apšvietimo profiliais (Studio, Runway, Cyberpunk, Daylight).
   - Sluoksnių „sprogdinimo“ (Exploded View) funkcija (vidinis pamušalas, furnitūra).
   - Audinio fizikos simuliacija (Cloth Physics Simulation) – realaus laiko audinio banguvimas ir drapiravimas einant ar sukantis.
   - „3 Žingsnių Vedlys“ (Mobile-First / Gamification) vs „Pro Atelier Studija“.
   - AI Stiliaus Konsultantas („Flipukas AI Stilistas“) – derinių analizė ir aksesuarų rekomendacijos su 1-paspaudimo įdėjimu.
   - Dydžių Asistentas (Size Assistant) – optimalaus dydžio (XS–XXL) apskaičiavimas pagal ūgį, svorį ir prigludimą.
   - Gidas (Guided Tour) – kinematografinė kameros ekskursija per siūles, furnitūrą, faktūrą ir monogramą.
   - WebXR / Papildytoji Realybė (AR) – projekcija kambaryje per telefono kamerą.
   - Canva / Grafikos Redaktorius – autorinio teksto, monogramų, geometrinių figūrų ir emblemų kėlimas ant krūtinės, nugaros ar kišenės.
   - Socialinio dalinimosi variklis (Social Share Reel) – 3D video generavimas Instagram Reels / TikTok su vandens ženklu.
   - Trumposios nuorodos (Shortlink) generavimas 3D konfigūracijoms.
   - Tvarumo ir Zero-Waste rodiklis (sutaupytas vanduo litrais, CO2, 0 kg atraižų).
   - Bendruomenės Galerija su viešais vertinimais.
2. Medžiagų & Technologijų Centras (TechFabricShowcase):
   - 2D Makro Pynimo Mikroskopinis Inspektorius (1x–10x priartinimas, matomi atskiri pluošto siūlai, pūkelis, vandens atstūmimo lašeliai medvilnei, šilkui, džinsui, vilnai, softshell).
   - Fizinio svorio indikatorius (GSM ir apskaičiuotas drabužio svoris gramais).
   - Audinių Mėginių Dėžutė (Fabric Sample Box) fizinei apžiūrai į namus.
3. Vartotojo Profilis, Pasiekimai & Garderobas (UserProfileModal):
   - „Style Milestones“ & Virtualūs Ženkliukai (Bronze, Silver, Gold, Diamond) su tikrais nuolaidų kodais (ATELIER5, COUTURE10, MAISON15, ROYAL20).
   - Kūrybiniai Dizaino Iššūkiai su lojalumo taškais.
   - Skaitmeninis Garderobas (Digital Wardrobe) su aplankais („Vasara 2024“, „Darbui“).
   - Lojalumo Taškų Sistema ir Užsakymų Sekimas Realiu Laiku su siuntos žemėlapio simuliacija.
4. E-komercijos & Konversijų Įrankiai:
   - Dviejų Modelių Palyginimas (Side-by-Side Comparison).
   - Krepšelis su aktyvuojamais kuponais ir kurjerio pristatymo pasirinkimu.
   - Socialinis Įrodymas & FOMO (Live Activity Ticker – realaus laiko užsakymai ir riboti audinio likučiai).

---

## 4. TAVO UŽDUOTIS IR KLAUSIMAI (AUDITO REIKALAVIMAI):
Prašau išsamiai ir struktūrizuotai atsakyti į šiuos 5 punktus:
1. **UX/UI Paprastumas vs Funkcijų Perkrova:** Kokie 3 dalykai dabar gali klaidinti vartotoją arba atbaidyti nuo pirkimo? Kaip patobulinti sąsają mobiliesiems įrenginiams?
2. **3D WebGL Našumas:** Kokių Three.js optimizacijų reikia (LOD, tekstūrų kompresija, Draco/KTX2), kad 3D modelis krautųsi per <1 sekundę ir veiktų stabiliais 60 FPS bet kokiame telefone?
3. **Konversijų Rodiklio Didinimas (CRO):** Kaip sumažinti atsitraukimą tarp „Žaidžiu su 3D modeliu“ ir „Apmoku užsakymą“? Kokių pasitikėjimo elementų trūksta?
4. **Vienaragio (Unicorn) Mastelio Strategija:** Kaip iš individualaus konstruktoriaus išaugti į masinės prabangos platformą (pvz., Creator Marketplace nepriklausomiems dizaineriams, B2B Print-on-Demand / gamyklų API integracija)?
5. **Gamybos Automatizavimas:** Kaip sujungti 3D parametrinius duomenis su realiomis siuvyklomis ir siuvinėjimo staklėmis (DST/PES vektorinis failas, spaudos PDF)?
`;

export const AIReviewModal: React.FC<AIReviewModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'prompt' | 'summary' | 'questions'>('prompt');

  if (!isOpen) return null;

  const handleCopyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(AI_PROMPT_CONTENT);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch {
      // Fallback
      const textarea = document.createElement('textarea');
      textarea.value = AI_PROMPT_CONTENT;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  const handleDownloadMarkdown = () => {
    const blob = new Blob([AI_PROMPT_CONTENT], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'FLIPUKAS_FULL_PROJECT_AUDIT_FOR_AI.md';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-[#0e0e13] border border-[#d4af37]/30 rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-[0_20px_70px_rgba(0,0,0,0.85)] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-stone-800/80 bg-[#13131a] flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#d4af37]/15 border border-[#d4af37]/40 flex items-center justify-center text-[#d4af37] shadow-inner">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-serif-luxury font-bold text-white tracking-tight">
                  AI Projekto Apžvalga & Eksportas
                </h3>
                <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#d4af37] px-2 py-0.5 rounded border border-[#d4af37]/30 bg-[#d4af37]/10">
                  Skirtas Kitiems AI
                </span>
              </div>
              <p className="text-xs text-stone-400 mt-0.5 font-light">
                Pateikite šį dokumentą ChatGPT, Claude ar Gemini, kad gautumėte išsamų 10/10 sistemos auditą ir tobulinimo rekomendacijas.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-white rounded-xl hover:bg-stone-800 transition cursor-pointer"
            aria-label="Uždaryti"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Action Bar */}
        <div className="px-6 py-4 bg-[#161620] border-b border-stone-800 flex flex-wrap items-center justify-between gap-3">
          {/* Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-stone-900/90 rounded-xl border border-stone-800 text-xs font-mono">
            <button
              onClick={() => setActiveTab('prompt')}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'prompt'
                  ? 'bg-[#d4af37] text-stone-950 font-bold'
                  : 'text-stone-400 hover:text-white'
              }`}
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>Pilnas Promptas AI</span>
            </button>
            <button
              onClick={() => setActiveTab('summary')}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'summary'
                  ? 'bg-[#d4af37] text-stone-950 font-bold'
                  : 'text-stone-400 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Sistemos Architektūra</span>
            </button>
            <button
              onClick={() => setActiveTab('questions')}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'questions'
                  ? 'bg-[#d4af37] text-stone-950 font-bold'
                  : 'text-stone-400 hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Klausimai Kitam AI</span>
            </button>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyPrompt}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition flex items-center gap-2 cursor-pointer shadow-sm ${
                copied
                  ? 'bg-emerald-500 text-stone-950'
                  : 'bg-[#d4af37] text-stone-950 hover:bg-[#e6c258]'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Nukopijuota į iškarpinę!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Kopijuoti Promptą AI</span>
                </>
              )}
            </button>

            <button
              onClick={handleDownloadMarkdown}
              className="px-3.5 py-2 text-xs font-medium text-stone-200 bg-stone-900 border border-stone-800 hover:bg-stone-800 hover:border-stone-700 rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-sm"
              title="Atsisiųsti .md failą į kompiuterį"
            >
              <Download className="w-3.5 h-3.5 text-[#d4af37]" />
              <span className="hidden sm:inline">Atsisiųsti .MD</span>
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-sm text-stone-300">
          {activeTab === 'prompt' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-stone-400 font-mono">
                <span>Vienu paspaudimu nukopijuokite šį tekstą ir įklijuokite į ChatGPT, Claude ar Gemini:</span>
                <span className="text-[#d4af37]">Formatas: Markdown (.md)</span>
              </div>
              <div className="relative">
                <pre className="p-4 rounded-2xl bg-black/70 border border-stone-800 text-[12px] font-mono leading-relaxed text-stone-300 whitespace-pre-wrap overflow-x-auto max-h-[50vh] selection:bg-[#d4af37] selection:text-stone-950">
                  {AI_PROMPT_CONTENT}
                </pre>
              </div>
            </div>
          )}

          {activeTab === 'summary' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-[#14141c] border border-stone-800/80 space-y-2.5">
                <div className="flex items-center gap-2 text-white font-serif-luxury font-bold text-sm">
                  <Cpu className="w-4 h-4 text-[#d4af37]" />
                  <span>Technologinis Branduolys</span>
                </div>
                <ul className="text-xs space-y-1.5 text-stone-300">
                  <li>• <strong className="text-white">Three.js WebGL:</strong> 3D atvaizdavimas, dinaminis apšvietimas, sprogdinti sluoksniai.</li>
                  <li>• <strong className="text-white">Cloth Physics:</strong> Realaus laiko audinio judėjimas ir drapiravimas.</li>
                  <li>• <strong className="text-white">React 19 + TypeScript:</strong> Itin greitas našumas ir tipų saugumas.</li>
                  <li>• <strong className="text-white">Tailwind CSS v4:</strong> Prabangus „Atelier“ stilius (Caviar & Champagne Gold).</li>
                  <li>• <strong className="text-white">Firebase:</strong> Firestore realaus laiko duomenų bazė ir autentifikacija.</li>
                </ul>
              </div>

              <div className="p-4 rounded-2xl bg-[#14141c] border border-stone-800/80 space-y-2.5">
                <div className="flex items-center gap-2 text-white font-serif-luxury font-bold text-sm">
                  <Sparkles className="w-4 h-4 text-[#d4af37]" />
                  <span>3D Studijos & UX Inovacijos</span>
                </div>
                <ul className="text-xs space-y-1.5 text-stone-300">
                  <li>• <strong className="text-white">2D Makro Pynimo Inspektorius:</strong> 1x–10x mikroskopinė optika su GSM ir fizinio svorio (g) skaičiavimu.</li>
                  <li>• <strong className="text-white">3 Žingsnių Vedlys:</strong> Supaprastinta gamifikacija pradedantiesiems.</li>
                  <li>• <strong className="text-white">AI Stiliaus Stilistas:</strong> Protingas drabužių derinimas ir aksesuarų parinkimas.</li>
                  <li>• <strong className="text-white">Dydžių Asistentas:</strong> Tiksli rekomendacija pagal ūgį, svorį ir siluetą.</li>
                  <li>• <strong className="text-white">WebXR / AR:</strong> 3D drabužio projekcija jūsų kambaryje per telefono kamerą.</li>
                </ul>
              </div>

              <div className="p-4 rounded-2xl bg-[#14141c] border border-stone-800/80 space-y-2.5">
                <div className="flex items-center gap-2 text-white font-serif-luxury font-bold text-sm">
                  <Share2 className="w-4 h-4 text-[#d4af37]" />
                  <span>Viralumas & Verslo Modelis</span>
                </div>
                <ul className="text-xs space-y-1.5 text-stone-300">
                  <li>• <strong className="text-white">Social Share Reel:</strong> 3D video sugeneravimas Instagram ir TikTok su vandens ženklu.</li>
                  <li>• <strong className="text-white">Style Milestones:</strong> Ženkliukai ir tikri nuolaidų kodai (ATELIER5, COUTURE10...).</li>
                  <li>• <strong className="text-white">Zero-Waste:</strong> Sutaupyto vandens ir nulinio broko ekologinė metrika.</li>
                  <li>• <strong className="text-white">Sample Box:</strong> Fizinis audinių pavyzdžių rinkinys („Phygital“ patirtis).</li>
                </ul>
              </div>

              <div className="p-4 rounded-2xl bg-[#14141c] border border-stone-800/80 space-y-2.5">
                <div className="flex items-center gap-2 text-white font-serif-luxury font-bold text-sm">
                  <ShieldCheck className="w-4 h-4 text-[#d4af37]" />
                  <span>E-komercija & Saugumas</span>
                </div>
                <ul className="text-xs space-y-1.5 text-stone-300">
                  <li>• <strong className="text-white">Dviejų Modelių Palyginimas:</strong> Side-by-Side 3D savybių palyginimas.</li>
                  <li>• <strong className="text-white">Krepšelis su Kuponais:</strong> Automatinis perskaičiavimas ir taškų iškeitimas.</li>
                  <li>• <strong className="text-white">Užsakymų Sekimas:</strong> Interaktyvus siuntos pristatymo sekimas.</li>
                  <li>• <strong className="text-white">GDPR & Teisė:</strong> Pilnas slapukų valdymo centras.</li>
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'questions' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-[#161622] border border-[#d4af37]/20">
                <div className="text-xs font-mono uppercase tracking-wider text-[#d4af37] mb-1">
                  Užduotys, kurias išnagrinės kitas AI:
                </div>
                <p className="text-xs text-stone-300 leading-relaxed font-light">
                  Kitas AI gaus šiuos 5 esminius klausimus, padėsiančius išanalizuoti projektą iš visų pusių – nuo kodo optimizavimo iki verslo vertinimo:
                </p>
              </div>

              <div className="space-y-3">
                <div className="p-3.5 rounded-xl bg-stone-900/70 border border-stone-800">
                  <div className="text-xs font-bold text-white mb-1">
                    1. UX/UI Paprastumas vs. Funkcijų Perkrova
                  </div>
                  <div className="text-xs text-stone-400">
                    Ar platformoje nėra per daug mygtukų ir funkcijų? Kaip optimizuoti mobiliąją patirtį, kad vartotojas nepasimestų?
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-stone-900/70 border border-stone-800">
                  <div className="text-xs font-bold text-white mb-1">
                    2. 3D WebGL Našumas ir Optimizacija
                  </div>
                  <div className="text-xs text-stone-400">
                    Kokių Three.js optimizacijų reikia silpnesniems telefonams (LOD, tekstūrų kompresija KTX2/Draco), kad užkrovimas truktų &lt;1.5s?
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-stone-900/70 border border-stone-800">
                  <div className="text-xs font-bold text-white mb-1">
                    3. Konversijų Rodiklis (CRO) & Pirkimo Sprendimas
                  </div>
                  <div className="text-xs text-stone-400">
                    Kokie elementai paskatintų vartotoją po 3D pritaikymo iškart pirkti, o ne tik eksperimentuoti?
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-stone-900/70 border border-stone-800">
                  <div className="text-xs font-bold text-white mb-1">
                    4. Vienaragio (Unicorn) Mastelio Strategija
                  </div>
                  <div className="text-xs text-stone-400">
                    Kaip pereiti prie Creator Marketplace modelio ir apjungti B2B Print-on-Demand gamyklų API?
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-stone-900/70 border border-stone-800">
                  <div className="text-xs font-bold text-white mb-1">
                    5. Gamybos Automatizavimas
                  </div>
                  <div className="text-xs text-stone-400">
                    Kaip 3D parametrus paversti realiais gamybos failais (siuvinėjimo DST/PES ir spaudos PDF)?
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="p-4 border-t border-stone-800/80 bg-[#111116] flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] font-mono text-stone-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#d4af37]" />
            <span>Failas taip pat pasiekiamas projekto šaknyje: <strong className="text-stone-200">PROJECT_AI_DOSSIER.md</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyPrompt}
              className="text-[#d4af37] hover:underline cursor-pointer flex items-center gap-1"
            >
              <Copy className="w-3 h-3" />
              <span>Kopijuoti ir atidaryti AI</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
