import { ColorOption, FabricMaterial, Product } from '../types/clothing';

export const FABRICS: FabricMaterial[] = [
  {
    id: 'tech-cotton',
    name: 'Natūrali Šukuotinė Medvilnė 380GSM',
    nameLt: 'Minkšta Šukuotinė Medvilnė',
    description: 'Klasikinis, itin jaukus ir kvėpuojantis 380 GSM medvilnės audinys su švelniu vidiniu pūkeliu. Puikiai tinka kasdienai.',
    roughness: 0.92,
    metalness: 0.02,
    bumpScale: 0.14,
    textureType: 'cotton',
    priceDelta: 0,
    badge: 'Minkšta & Kasdienė',
    gsm: 380,
    composition: '100% Organinė Šukuotinė Medvilnė',
    stretch: 'Natūralus 2-krypčių tamprumas',
    breathability: 5,
    warmth: 4,
    drape: 'Minkštas ir natūralus',
    luster: 'Matinis be blizgesio',
    waterResistance: 'Standartinis (vanduo susigeria)',
  },
  {
    id: 'mulberry-silk',
    name: '100% Natūralus Mulberry Šilkas 22 Momme',
    nameLt: 'Prabangus Mulberry Šilkas',
    description: 'Itin švelnus, hipoalerginis aukščiausios 6A klasės natūralus šilkas su perlamutriniu spindesiu ir sklandžiu kritimu.',
    roughness: 0.22,
    metalness: 0.18,
    bumpScale: 0.05,
    textureType: 'silk',
    priceDelta: 16,
    badge: 'Prabangus & Švelnus',
    gsm: 95,
    composition: '100% Grade 6A Mulberry Šilkas (22 Momme)',
    stretch: 'Minimalus natūralus',
    breathability: 5,
    warmth: 3,
    drape: 'Ypatingai sklandus, krentantis',
    luster: 'Aukštas natūralus perlamutro švytėjimas',
    waterResistance: 'Žemas (gležnas audinys)',
  },
  {
    id: 'selvedge-denim',
    name: 'Japoniškas Selvedge Twill Džinsas 14.5oz',
    nameLt: 'Tvirtas Selvedge Džinsas',
    description: 'Aukščiausios kokybės tankaus 3x1 pynimo džinsinis audinys su autentiška reljefine twill faktūra ir ilgaamžiškumu.',
    roughness: 0.85,
    metalness: 0.03,
    bumpScale: 0.22,
    textureType: 'denim',
    priceDelta: 12,
    badge: 'Autentiškas Twill',
    gsm: 410,
    composition: '100% Neapdorota Selvedge Medvilnė (14.5 oz)',
    stretch: 'Standus (100% Rigid)',
    breathability: 3,
    warmth: 4,
    drape: 'Struktūruotas, laiko griežtą formą',
    luster: 'Matinis, ryški faktūra',
    waterResistance: 'Vidutinis (tankus pynimas sulaiko vėją)',
  },
  {
    id: 'merino-wool',
    name: 'Itališka Gryna Merino Vilna 320GSM',
    nameLt: 'Švelni Merino Vilna',
    description: 'Ypač plonų 19.5 mikrono pluoštų natūrali vilna – termoaktyvi, kvėpuojanti, švelni odai ir pritaikyta visiems sezonams.',
    roughness: 0.94,
    metalness: 0.02,
    bumpScale: 0.20,
    textureType: 'wool',
    priceDelta: 14,
    badge: 'Termoaktyvi & Šilta',
    gsm: 320,
    composition: '100% Extra-Fine Itališka Merino Vilna',
    stretch: 'Elastingas natūralus tamprumas',
    breathability: 5,
    warmth: 5,
    drape: 'Minkštas, jaukus ir purus',
    luster: 'Švelnus matinis mikro-pūkas',
    waterResistance: 'Natūraliai atstumia lašus (lanolinas)',
  },
  {
    id: 'gore-aero',
    name: 'Vėjui ir Lietui Atsparus Softshell',
    nameLt: 'Neperpučiamas Softshell',
    description: 'Lengvas, elastingas techninis audinys su DWR danga ir ripstop armavimu. Apsaugo nuo žvarbaus vėjo bei lietaus.',
    roughness: 0.55,
    metalness: 0.08,
    bumpScale: 0.10,
    textureType: 'ripstop',
    priceDelta: 6,
    badge: 'Atsparus Vėjui',
    gsm: 280,
    composition: '88% Poliesteris, 12% Elastanas su DWR danga',
    stretch: '4-krypčių techninis stretch',
    breathability: 4,
    warmth: 4,
    drape: 'Pusiau standus sportinis',
    luster: 'Satininis pusiau matinis',
    waterResistance: 'Aukštas (10 000 mm hidrostatinis slėgis)',
  },
  {
    id: 'bio-neoprene',
    name: 'Elastingas Sportinis Scuba Trikotažas',
    nameLt: 'Sportinis Scuba Trikotažas',
    description: 'Glotnus, tvirtos geometrinės formos tamprus audinys, kuris nesiglamžo ir išlaiko modernų futuristinį siluetą.',
    roughness: 0.65,
    metalness: 0.05,
    bumpScale: 0.08,
    textureType: 'neoprene',
    priceDelta: 4,
    badge: 'Nesiglamžo',
    gsm: 340,
    composition: '65% Rayon, 30% Nailonas, 5% Spandeksas',
    stretch: 'Itin tamprus 360° elastanas',
    breathability: 3,
    warmth: 3,
    drape: 'Skulptūriškas, architektūrinis',
    luster: 'Glotnus matinis',
    waterResistance: 'Vidutinis (greitai džiūstantis)',
  },
  {
    id: 'liquid-chrome',
    name: 'Matinė Eko Oda su Švelniu Blizgesiu',
    nameLt: 'Matinė Eko Oda',
    description: 'Minkšta, šiuolaikiška sintetinė oda su stilingu subtiliu blizgesiu, reljefine grūdėtumo tekstūra ir atsparumu trinčiai.',
    roughness: 0.35,
    metalness: 0.35,
    bumpScale: 0.06,
    textureType: 'chrome',
    priceDelta: 8,
    badge: 'Matinis Blizgesys',
    gsm: 450,
    composition: 'Poliuretanas (Eko-Vegan oda) ant mikropluošto',
    stretch: 'Mažas (struktūruotas)',
    breathability: 2,
    warmth: 4,
    drape: 'Tvirtas odinis kritimas',
    luster: 'Stilingas metalo/odos pusiau blizgesys',
    waterResistance: 'Itin aukštas (visiškai nepralaidus vandeniui)',
  },
  {
    id: 'matte-leather',
    name: 'Reljefinė Vintažinė Oda su Grūdėtumu',
    nameLt: 'Reljefinė Eko Oda',
    description: 'Organiškos tekstūros natūralios odos imitacija su smulkiu porėtumu, prabangia išvaizda ir ilgaamžiškumu.',
    roughness: 0.88,
    metalness: 0.02,
    bumpScale: 0.15,
    textureType: 'leather',
    priceDelta: 9,
    badge: 'Autentiška Faktūra',
    gsm: 480,
    composition: 'Eko PU oda su medvilniniu pagrindu',
    stretch: 'Minimalus',
    breathability: 2,
    warmth: 4,
    drape: 'Sunkus, autentiškas odos kritimas',
    luster: 'Gilus matinis su mikro-poromis',
    waterResistance: 'Aukštas (atsparus vandeniui ir purvui)',
  }
];

export const COLOR_PALETTE: ColorOption[] = [
  { name: 'Obsidian Black', nameLt: 'Klasikinė Juoda', hex: '#161618', category: 'core' },
  { name: 'Titanium Grey', nameLt: 'Grafito Pilka', hex: '#374151', category: 'core' },
  { name: 'Cyber Chalk', nameLt: 'Pieno Balta / Smėlio', hex: '#e2dfd8', category: 'core' },
  { name: 'Electric Amber', nameLt: 'Šilta Gintarinė', hex: '#d97706', category: 'electric' },
  { name: 'Cobalt Pulse', nameLt: 'Tamsi Mėlyna (Navy)', hex: '#1e3a8a', category: 'electric' },
  { name: 'Crimson Matrix', nameLt: 'Vyno Raudona', hex: '#881337', category: 'electric' },
  { name: 'Acid Volt', nameLt: 'Alyvuogių Žalia', hex: '#3f4f38', category: 'earth' },
  { name: 'Sage Tactical', nameLt: 'Šalavijų Pastelė', hex: '#526b58', category: 'earth' },
  { name: 'Raw Sand', nameLt: 'Kapučino Ruda', hex: '#715842', category: 'earth' },
];

export const HARDWARE_COLORS = [
  { name: 'Matte Stealth Black', nameLt: 'Matinė Juoda', hex: '#1c1917' },
  { name: 'Polished Chrome', nameLt: 'Sidabro Metalas', hex: '#cbd5e1' },
  { name: 'Burnished Gold', nameLt: 'Auksinis / Žalvaris', hex: '#b48a3c' },
];

export const PRODUCTS: Product[] = [
  {
    id: 'hoodie-aero-shift',
    slug: 'aero-shift-hoodie',
    name: '„Aero-Shift“ Medvilninis Džemperis',
    categoryLt: 'Džemperiai ir Gobtuvai',
    type: 'hoodie',
    basePrice: 42,
    tagline: 'Minkštas 380 GSM kasdienis džemperis su giliu gobtuvu, priekine kišene ir laisvu kritimu.',
    description: 'Tikras, natūraliai krentantis drabužis be jokių dirbtinių kampų. Šukuotinė medvilnė, tvirtos rankogalių gumos ir patogi kanga kišenė.',
    features: [
      'Gilus dvigubo audinio gobtuvas su tvirtomis virvelėmis',
      'Minkštas vidinis pūkelis papildomam komfortui',
      'Klasikinė kengūros priekinė kišenė',
      'Sustiprintos dvigubos apsiuvimo siūlės'
    ],
    specs: [
      { label: 'Sudėtis', value: '85% Medvilnė, 15% Poliesteris' },
      { label: 'Tankis', value: '380 g/m²' },
      { label: 'Kirpimas', value: 'Laisvas (Relaxed Fit)' },
      { label: 'Priežiūra', value: 'Skalbti 30°C' }
    ],
    image: '/src/assets/images/hoodie_aeroshift_1791560744426.jpg',
    fallbackGradient: 'from-zinc-900 to-neutral-950',
    defaultColors: {
      primary: '#161618',
      secondary: '#27272a',
      accent: '#d97706'
    }
  },
  {
    id: 'jacket-kinetix',
    slug: 'kinetix-01-jacket',
    name: '„Kinetix“ Miesto Bomber Striukė',
    categoryLt: 'Striukės ir Viršutiniai',
    type: 'jacket',
    basePrice: 58,
    tagline: 'Lengva universali striukė pavasariui ir rudeniui su patogiomis šoninėmis kišenėmis.',
    description: 'Klasikinis bomber siluetas su kokybišku metaliniu užtrauktuku, tampria apykakle ir patikima apsauga nuo vėjo.',
    features: [
      'Patikimas metalinis sklandus užtrauktukas',
      'Vėjui atspari išorinė medžiaga su pamušalu',
      'Tampri apykaklė, rankogaliai ir apatinė juosta',
      'Dvi šoninės kišenės + saugi vidinė kišenė'
    ],
    specs: [
      { label: 'Sezonas', value: 'Pavasaris / Ruduo' },
      { label: 'Svoris', value: '550 g' },
      { label: 'Pamukalas', value: 'Kvėpuojantis poliesteris' },
      { label: 'Fasonas', value: 'Standartinis (Regular)' }
    ],
    image: '/src/assets/images/jacket_kinetix_1791560755462.jpg',
    fallbackGradient: 'from-stone-900 to-neutral-950',
    defaultColors: {
      primary: '#27272a',
      secondary: '#18181b',
      accent: '#cbd5e1'
    }
  },
  {
    id: 'sneakers-pulsex',
    slug: 'pulse-x-sneakers',
    name: '„Pulse X“ Kasdieniai Kedai',
    categoryLt: 'Avalynė ir Kedai',
    type: 'sneakers',
    basePrice: 49,
    tagline: 'Minkšti, amortizuojantys laisvalaikio kedai su orui laidžiu tinkleliu ir ergonominiu padu.',
    description: 'Itin lengvi ir patogūs ilgiems pasivaikščiojimams mieste. Lankstus padas ir minkštas vidpadis nevargina kojų.',
    features: [
      'Lengvas amortizuojantis padas',
      'Kvėpuojantis viršutinis audinys',
      'Paminkštintas kulno apvadas',
      'Neslystantis pado protektorius'
    ],
    specs: [
      { label: 'Svoris', value: '280 g (poros batelis)' },
      { label: 'Padas', value: 'Elastingas EVA' },
      { label: 'Vidpadis', value: 'Memory Foam minkštas' },
      { label: 'Paskirtis', value: 'Kasdienai ir laisvalaikiui' }
    ],
    image: '/src/assets/images/sneakers_pulsex_1791560768830.jpg',
    fallbackGradient: 'from-zinc-900 to-neutral-900',
    defaultColors: {
      primary: '#161618',
      secondary: '#3f3f46',
      accent: '#d97706'
    }
  },
  {
    id: 'trench-vektor',
    slug: 'vektor-trench-coat',
    name: '„Vektor“ Prailginta Vėjastriukė',
    categoryLt: 'Paltai ir Striukės',
    type: 'trench',
    basePrice: 54,
    tagline: 'Moderni ilgesnė striukė-lietpaltis su gobtuvu, sauganti nuo lietaus ir vėjo.',
    description: 'Šiuolaikiškas ilgas modelis su patogiu užtrauktuku ir spaudėmis. Lengva, praktiška ir stilinga.',
    features: [
      'Vandenį atstumianti medžiaga',
      'Prailgintas kirpimas papildomai apsaugai',
      'Reguliuojamas gobtuvas ir liemuo',
      'Gilios kišenės'
    ],
    specs: [
      { label: 'Ilgis', value: 'Iki šlaunų vidurio' },
      { label: 'Medžiaga', value: '100% Poliesteris su DWR' },
      { label: 'Priežiūra', value: 'Skalbti 30°C' },
      { label: 'Svoris', value: '490 g' }
    ],
    image: '/src/assets/images/hero_flipukas_studio_1791560733291.jpg',
    fallbackGradient: 'from-neutral-900 to-stone-950',
    defaultColors: {
      primary: '#242b26',
      secondary: '#18181b',
      accent: '#b48a3c'
    }
  },
  {
    id: 'cargo-sub-zero',
    slug: 'sub-zero-cargo-pants',
    name: '„Sub-Zero“ Patogios Kargo Kelnės',
    categoryLt: 'Kelnės ir Kargai',
    type: 'cargo',
    basePrice: 38,
    tagline: 'Tvirtos medvilninės kelnės su šoninėmis kargo kišenėmis ir tampria juosmens guma.',
    description: 'Puikus patogumo ir praktiškumo balansas. Elastinga medžiaga leidžia laisvai judėti.',
    features: [
      '6 talpios funkcinės kišenės',
      'Tampri juosmens guma su virvele',
      'Sustiprinta kelių zona',
      'Reguliuojami klešnių galai'
    ],
    specs: [
      { label: 'Sudėtis', value: '97% Medvilnė, 3% Elastanas' },
      { label: 'Kirpimas', value: 'Tapered (siaurėjantis)' },
      { label: 'Dydžiai', value: 'S iki XXL' },
      { label: 'Priežiūra', value: 'Skalbti 40°C' }
    ],
    image: '/src/assets/images/hero_flipukas_studio_1791560733291.jpg',
    fallbackGradient: 'from-slate-900 to-zinc-950',
    defaultColors: {
      primary: '#1e293b',
      secondary: '#0f172a',
      accent: '#1e3a8a'
    }
  },
  {
    id: 'tshirt-chronos',
    slug: 'chronos-oversized-tee',
    name: '„Chronos“ Natūralūs Marškinėliai',
    categoryLt: 'Marškinėliai',
    type: 'tshirt',
    basePrice: 22,
    tagline: '100% šukuotinės medvilnės kokybiški marškinėliai, kurie nesitraukia ir neblunka.',
    description: 'Tanki 240 GSM medvilnė, tvirta apykaklė, nuleista pečių linija. Puikus pagrindas bet kokiai aprangai.',
    features: [
      '240 GSM gryna šukuotinė medvilnė',
      'Tvirta dviguba apykaklė su elastanu',
      'Laisvas, šiek tiek didintas fasonas',
      'Minkštas ir švelnus audinio pojūtis'
    ],
    specs: [
      { label: 'Tankis', value: '240 g/m²' },
      { label: 'Sudėtis', value: '100% Organinė medvilnė' },
      { label: 'Kirpimas', value: 'Oversized / Boxy' },
      { label: 'Priežiūra', value: 'Skalbti 30°C' }
    ],
    image: '/src/assets/images/hoodie_aeroshift_1791560744426.jpg',
    fallbackGradient: 'from-zinc-900 to-stone-900',
    defaultColors: {
      primary: '#e2dfd8',
      secondary: '#18181b',
      accent: '#881337'
    }
  }
];

export const HERO_IMAGE = '/src/assets/images/hero_flipukas_studio_1791560733291.jpg';
