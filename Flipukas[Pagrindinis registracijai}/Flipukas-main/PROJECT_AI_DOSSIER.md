# FLIPUKAS ATELIER – IŠSAMUS PROJEKTO DOSJĖ IR AUDITO DOKUMENTAS (SKIRTAS AI PERŽIŪRAI)

> **Dokumento Paskirtis:** Šis dokumentas yra paruoštas dirbtinio intelekto modeliams (ChatGPT, Claude, Gemini, DeepSeek ir kt.), kad jie galėtų išsamiai įvertinti platformą „Flipukas Atelier“, jos architektūrą, naudotojo patirtį (UX/UI), technologinius sprendimus bei pateikti konkrečių patarimų, kaip šį projektą patobulinti iki 10/10 lygio ir paversti globaliu vienaragiu.

---

## 1. PROJEKTO SANTRAUKA IR VIZIJA
- **Pavadinimas:** Flipukas Atelier (3D Drabužių ir Autorinio Stiliaus Platforma)
- **Koncepcija:** Hibridinis mados namų (Haute Couture) ir modernaus 3D e-komercijos modelis, leidžiantis vartotojui realiu laiku naršyklėje projektuoti, keisti ir apžiūrėti drabužius 360° kampu, tirti mikroskopinius audinių pynimus bei užsisakyti pagal individualią gamybą („On-Demand / Zero-Waste“).
- **Misija:** Pašalinti didžiausią internetinės prekybos drabužiais problemą – netikrumą dėl audinio kritimo, dydžio ir spalvų, sujungiant WebGL 3D technologiją, audinio fizikos simuliaciją ir aukščiausios klasės atelier estetiką.
- **Tikslinė rinka:** Mados entuziastai, Z ir Tūkstantmečio kartos pirkėjai, ieškantys unikalumo, tvarios mados gerbėjai, nepriklausomi drabužių dizaineriai.

---

## 2. TECHNOLOGINIS STEKAS
- **Frontend branduolys:** React 19, TypeScript, Vite
- **3D & Grafika:** Three.js (WebGL Canvas su dinaminiais šviesos šaltiniais, bump/normal šešėliavimu, kameros orbitomis, procedūrine audinio fizika)
- **Stilius:** Tailwind CSS v4, individualios prabangios temos („Luxury Caviar & Champagne Gold“), Google Fonts (`Cormorant Garamond`, `Cinzel`, `Plus Jakarta Sans`)
- **Backend & Duomenų bazė:** Firebase Firestore (realaus laiko kolekcijos, vartotojų duomenys, galerija) ir Firebase Authentication
- **Pagalbinės bibliotekos:** Lucide React (ikonos), Canvas Confetti (apdovanojimų ir atsiskaitymo animacijos)
- **Saugumas & Taisyklės:** `firestore.rules` su rolių bei naudotojo ID patikra

---

## 3. ĮDIEGTŲ FUNKCIJŲ IR MODULIŲ KATALOGAS

### A. 3D Stiliaus Laboratorija („StyleLab“)
1. **Realaus laiko 3D atvaizdavimas:**
   - Pilna 360° laisva arba fiksuota kameros rotacija, priartinimas, kampų keitimas.
   - Sluoksnių „sprogdinimo“ (Exploded View) funkcija – parodo drabužio konstrukciją, vidinį pamušalą ir furnitūrą.
   - Keli apšvietimo profiliai (Atelier Studio, Dramatic Runway, Cyberpunk Neon, Natural Daylight).
2. **Audinio fizikos simuliacija („Cloth Physics Simulation“):**
   - Mygtukas įjungti realaus laiko audinio judėjimą.
   - Drabužis banguoja ir drapesuoja modeliui einant, sukantis ar pučiant vėjui.
3. **„3 Žingsnių Vedlys“ (Mobile-First / Gamification) vs „Pro Atelier Studija“:**
   - Leidžia vartotojui rinktis: greitą ir aiškų 3 žingsnių kelią (1. Pasirink siluetą → 2. Spalva ir audinys → 3. Rezultatas / Užsakymas) arba profesionalią studiją su visais techniniais parametrais.
4. **AI Stiliaus Konsultantas („Flipukas AI Stilistas“):**
   - Analizuoja šiuo metu kuriamą drabužį ir pateikia profesionalių mados stilisto patarimų.
   - Siūlo derančius aksesuarus, batus ar kelnes tiesiai iš katalogo su 1-paspaudimo įdėjimu į krepšelį.
5. **Dydžių Asistentas („Size Assistant“):**
   - Vartotojas įveda ūgį, svorį ir pageidaujamą prigludimą (Slim / Regular / Oversized).
   - Sistema apskaičiuoja ir rekomenduoja optimalų dydį (XS–XXL) pagal drabužio parametrus.
6. **Gidas („Guided Tour“):**
   - Automatinė kinematografinė kameros ekskursija, nukreipianti dėmesį į audinio faktūrą, siūlių dygsnius, rankogalių furnitūrą ir monogramą.
7. **WebXR / Papildytoji Realybė (AR):**
   - Galimybė projektuoti 3D drabužį į savo kambarį ar ant paviršiaus per išmaniojo telefono kamerą.
8. **Canva / Grafikos Redaktorius:**
   - Leidžia piešti, pridėti autorinį tekstą, monogramas, geometrines figūras ir emblemas ant krūtinės, nugaros ar kišenės.
9. **Socialinio dalinimosi variklis („Social Share Reel“):**
   - Vienu paspaudimu sugeneruoja trumpą 3D animacinį video formatą, pritaikytą „Instagram Reels“ ir „TikTok“, su Flipukas vandens ženklu.
   - Trumposios nuorodos (Shortlink) generavimas – leidžia nusiųsti draugui tikslią savo 3D konfigūraciją.
10. **Tvarumo ir „Zero-Waste“ rodiklis:**
    - Dinamiškai skaičiuoja sutaupytą vandenį (litrais), CO2 pėdsaką ir pabrėžia 0 kg atraižų atliekų dėl gamybos pagal užsakymą.
11. **Bendruomenės Galerija:**
    - Vartotojai gali paviešinti savo sukurtus dizainus, rinkti įvertinimus ir peržiūrėti kitų mados kūrėjų darbus.

### B. Medžiagų & Technologijų Centras („TechFabricShowcase“)
1. **2D Makro Pynimo Mikroskopinis Inspektorius:**
   - Paspaudus ant bet kurio audinio pavyzdžio (šukuotinė medvilnė, šilkas, Selvedge džinsas, Merino vilna, Softshell) atidaromas didelės raiškos 2D pynimo langas.
   - Galima priartinti audinį nuo 1x iki 10x, matyti atskirus pluošto siūlus, pūkelį, vandens atstūmimo lašelius.
   - Apšvietimo kampo keitimas pluošto gyliui ištirti.
2. **Fizinis Svorio Indikatorius:**
   - Dinamiškai rodo audinio tankį (GSM – g/m²) ir apskaičiuotą tikrąjį drabužio svorį gramais.
3. **Audinių Mėginių Dėžutė („Fabric Sample Box“):**
   - Phygital sprendimas – galimybė užsisakyti fizinius audinių pavyzdžius į namus prieš galutinį užsakymą.

### C. Vartotojo Profilis, Pasiekimai & Garderobas („UserProfileModal“)
1. **„Style Milestones“ & Virtualūs Ženkliukai:**
   - Apdovanojimų sistema: vartotojas renka ženkliukus (Iniciatorius, Mados Architektas, Haute Couture Meistras, Atelier Virtuozas).
   - Kiekvienas pasiekimas suteikia realų nuolaidos kodą (`ATELIER5`, `COUTURE10`, `MAISON15`, `ROYAL20`), kurį galima nukopijuoti arba tiesiogiai įkelti į krepšelį.
2. **Dizaino Iššūkiai:**
   - Interaktyvios kūrybinės užduotys (pvz. sukurti monochrominį derinį, panaudoti šilko audinį, sukurti monogramą), skatinančios įsitraukimą ir duodančios taškų.
3. **Skaitmeninis Garderobas („Digital Wardrobe“):**
   - Išsaugotų 3D konfigūracijų organizavimas į katalogus („Vasara 2024“, „Darbui“, „Šventinis“).
4. **Lojalumo Taškų Sistema:**
   - Taškai už pirkinius, išsaugotus modelius, pasidalinimus, kuriuos galima iškeisti į nuolaidas.
5. **Užsakymų Sekimas Realiu Laiku:**
   - Simuliacinis siuntos judėjimo žemėlapis ir statusų kaita (Gamyba → Kokybės patikra → Kurjeris).

### D. E-komercijos & Konversijų Įrankiai
1. **Dviejų Modelių Palyginimas („Side-by-Side Comparison“):**
   - Lygiagretus dviejų 3D modelių lyginimas pagal audinį, kainą, svorį ir savybes.
2. **Krepšelis ir Kuponų Sistema:**
   - Aktyvuojami nuolaidų kodai, automatinis kainos perskaičiavimas, nemokamo pristatymo riba.
3. **Socialinis Įrodymas & FOMO (Live Activity Ticker):**
   - Iškylantys pranešimai apie kitų pirkėjų užsakymus ir ribotus partijų likučius.
4. **GDPR Slapukų Skydelis ir Teisiniai Puslapiai.**

---

## 4. KĄ REIKIA ĮVERTINTI IR PATOBULINTI? (KLAUSIMAI KITAM AI)

Kai pateiksite šią informaciją kitam AI, užduokite šiuos pagrindinius klausimus:

1. **UX/UI Paprastumas vs. Funkcijų Perkrova:**
   - Ar platformoje nėra per daug mygtukų ir funkcijų viename ekrane?
   - Kaip dar geriau struktūrizuoti mobiliąją versiją, kad vartotojas nepasimestų tarp 3D nustatymų?

2. **3D/WebGL Našumas ir Optimizavimas:**
   - Kokių Three.js optimizacijų reikėtų silpnesniems išmaniesiems telefonams (LOD – Level of Detail, tekstūrų kompresija KTX2/Draco, šešėlių mažinimas)?
   - Kaip užtikrinti žaibišką pirminį modelio užkrovimą (<1.5s)?

3. **Konversijų Rodiklio Didinimas (CRO):**
   - Kokie psichologiniai ar dizaino elementai paskatintų vartotoją po 3D pritaikymo iškart spausti „Pirkti“?
   - Kaip sumažinti baimę dėl „On-Demand“ individualios gamybos pristatymo termino?

4. **Vienaragio Mastelis ir Verslo Modelis:**
   - Kaip pereiti nuo individualaus konstravimo prie masinės prabangos?
   - Ar verta įtraukti „Creator Drop Marketplace“, kur nepriklausomi dizaineriai parduoda savo ribotus leidimus?
   - Kokia turėtų būti B2B partnerystė su drabužių gamyklomis (Print-on-Demand, siuvyklos API integracija)?

5. **Trūkstamos Techninės Grandys iki Pilnos Gamybos:**
   - Ko trūksta pereinant nuo prototipo iki tikro gamybos failo eksporto (pvz., automatizuotas vektorinis siuvinėjimo failas DST/PES arba spaudos PDF generavimas pagal 3D koordinates)?
