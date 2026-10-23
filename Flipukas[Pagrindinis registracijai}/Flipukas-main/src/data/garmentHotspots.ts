import { GarmentType, MacroZone } from '../types/clothing';

export interface GarmentHotspot {
  id: string;
  garmentType: GarmentType;
  title: string;
  subtitle: string;
  category: 'fabric' | 'construction' | 'seam' | 'ergonomics';
  position: [number, number, number]; // [x, y, z] in Three.js coordinate system
  normalDirection?: [number, number, number];
  macroZone?: MacroZone;
  fabricTech: {
    gsm: string;
    composition: string;
    weave: string;
    breathability: string;
    resistance: string;
    stretch?: string;
  };
  constructionTech: {
    stitchType: string;
    reinforcement: string;
    durabilityStandard: string;
    craftNote: string;
  };
}

export const GARMENT_HOTSPOTS: Record<GarmentType, GarmentHotspot[]> = {
  hoodie: [
    {
      id: 'hoodie-hood',
      garmentType: 'hoodie',
      title: '3-Panelių Gobtuvo Konstrukcija',
      subtitle: 'Dvigubas medvilninis pamušalas ir sutvirtinti metaliniai žiedai',
      category: 'construction',
      position: [0.0, 1.25, 0.22],
      macroZone: 'hood-drawstrings',
      fabricTech: {
        gsm: '420 GSM sunkiasvorė medvilnė',
        composition: '85% šukuotinė organinė medvilnė, 15% perdirbtas poliesteris',
        weave: '3-siūlių tankusis prancūziškas kilpinis trikotažas (French Terry)',
        breathability: 'Aukštas garų pralaidumas (Ret < 6 m²·Pa/W)',
        resistance: 'Martindale > 45 000 trinties ciklų',
        stretch: 'Natūralus 12% tamprumas be spandekso degradacijos',
      },
      constructionTech: {
        stitchType: '4-siūlių plokščioji „Overlock“ ir dengiamasis dygsnis',
        reinforcement: 'Antirūdijančios nikelio neturinčios žalvario kilputės su vidine veltinio poveržle',
        durabilityStandard: 'Išlaiko geometriją po 50+ skalbimų 40°C temperatūroje',
        craftNote: 'Gobtuvas sukonstruotas iš trijų anatominių dalių, todėl natūraliai priglunda prie galvos ir nenukrenta pučiant vėjui.',
      },
    },
    {
      id: 'hoodie-chest',
      garmentType: 'hoodie',
      title: 'Pagrindinis Audinio Skydas & Dygsniai',
      subtitle: 'Optimizuotas paviršius tiesioginiam siuvinėjimui ir spaudai',
      category: 'fabric',
      position: [0.0, 0.45, 0.42],
      macroZone: 'chest-design',
      fabricTech: {
        gsm: '420 GSM aukščiausios klasės šiauštas audinys',
        composition: '100% šukuotinė medvilnė priekiniame paviršiuje',
        weave: 'Vienalytis 32/1 verpalų tankis lygiam mikro reljefui',
        breathability: 'Natūrali šilumos termoreguliacija',
        resistance: 'Antipilling 4.5/5.0 standartas (nesipūkuoja)',
        stretch: 'Išilginis stabilumas su formos atmintimi',
      },
      constructionTech: {
        stitchType: 'Dvigubas adatų sutvirtinimas (Twin-Needle Topstitch)',
        reinforcement: 'Vidinė pečių ir apykaklės silikoninė juosta (Cotton Herringbone Tape)',
        durabilityStandard: 'Atitinka OEKO-TEX® Standard 100 ir GOTS ekologinius reikalavimus',
        craftNote: 'Priekinė krūtinės plokštuma paruošta rankiniam siuvinėjimui — siūlai neįstringa ir audinys nesiraukšlėja po skalbimo.',
      },
    },
    {
      id: 'hoodie-pocket',
      garmentType: 'hoodie',
      title: 'Kengūros Kišenė su „Bartack“ Taškais',
      subtitle: 'Pramoninis 14 dygsnių sutvirtinimas ties didžiausio krūvio zonomis',
      category: 'seam',
      position: [0.0, -0.15, 0.46],
      macroZone: 'pocket-seams',
      fabricTech: {
        gsm: '420 GSM atsparus trynimuisi audinys',
        composition: 'Medvilnės ir poliesterio kompozitas vidiniam kišenės sluoksniui',
        weave: 'Sustiprintas įstrižas pynimas',
        breathability: 'Minkštas rankų šildymo mikropluoštas viduje',
        resistance: 'Triguba apsauga nuo plyšimo kampuose',
      },
      constructionTech: {
        stitchType: 'Pramoniniai „Bartack“ fiksavimo mazgai (28 dygsniai/cm)',
        reinforcement: 'Vidiniai įsiuvai kišenių kampuose, atlaikantys iki 25 kg tempimo jėgą',
        durabilityStandard: 'Išbandyta ISO 13934 tempimo atsparumo testu',
        craftNote: 'Kišenės kraštai apsiūti briaunota elastine juosta, todėl telefonas ar piniginė neiškrenta judant.',
      },
    },
    {
      id: 'hoodie-cuff',
      garmentType: 'hoodie',
      title: '2x2 Briaunoti Rankogaliai su Lycra®',
      subtitle: 'Ergonominė rankovės linija su formą išlaikančiu elastanu',
      category: 'ergonomics',
      position: [-0.98, -0.45, 0.12],
      macroZone: 'cuff-elastic',
      fabricTech: {
        gsm: '480 GSM briaunotas trikotažas (2x2 Rib-Knit)',
        composition: '95% šukuotinė medvilnė, 5% DuPont Lycra®',
        weave: 'Didelio tankio 2x2 elastinis vertikalus griovelių pynimas',
        breathability: 'Elastingas ir pralaidus orui',
        resistance: '100% elastingumo atsistatymas po 2000 ištempimų',
      },
      constructionTech: {
        stitchType: 'Besiūlė apskritiminė mezgimo technologija rankogaliams',
        reinforcement: 'Dvigubas saugumo dygsnis ties rankovės sujungimu',
        durabilityStandard: 'Neišsitampo ties riešais po ilgo kasdienio dėvėjimo',
        craftNote: 'Rankogaliai suformuoti taip, kad priglustų prie riešo be nemalonaus spaudimo ir neišleistų šilumos.',
      },
    },
  ],
  tshirt: [
    {
      id: 'tshirt-collar',
      garmentType: 'tshirt',
      title: 'Apykaklės Briauna su Vidine Juosta',
      subtitle: 'Herringbone pynimo kaklo juosta nuo išsitampymo',
      category: 'construction',
      position: [0.0, 0.95, 0.20],
      macroZone: 'chest-design',
      fabricTech: {
        gsm: '240 GSM sunkiasvoris trikotažas (Single Jersey)',
        composition: '100% šukuotinė organinė medvilnė (Ring-spun)',
        weave: 'Kompaktiškas viensluoksnis tankusis pynimas',
        breathability: 'Itin aukštas oro pralaidumas karštoms dienoms',
        resistance: 'Enziminis audinio apdirbimas šilko švelnumui',
      },
      constructionTech: {
        stitchType: '1x1 elastinė apykaklės juostelė su dvigubu viršutiniu apsiuvimu',
        reinforcement: 'Nuo peties iki peties įsiūta standumo juostelė (Shoulder-to-shoulder tape)',
        durabilityStandard: 'Išlaiko kaklo apvalumą net po džiovyklės',
        craftNote: 'Apykaklė nesisuka ir nesiglamžo dėvint po švarku ar džemperiu.',
      },
    },
    {
      id: 'tshirt-fabric',
      garmentType: 'tshirt',
      title: '240 GSM Organinė Medvilnė',
      subtitle: 'Tvirta, nepermatoma tekstūra su natūraliu kritimu',
      category: 'fabric',
      position: [0.0, 0.35, 0.32],
      macroZone: 'fabric-weave',
      fabricTech: {
        gsm: '240 GSM (Heavyweight Luxury Cotton)',
        composition: '100% GOTS sertifikuota organinė medvilnė',
        weave: 'Smulkus tankus mezgimas (Single Jersey 24/1)',
        breathability: 'Maksimalus natūralių pluoštų komfortas',
        resistance: 'Atspari skalbimo susitraukimui (iš anksto nupjauta garais)',
      },
      constructionTech: {
        stitchType: 'Plokščios šoninės siūlės arba besiūlis cilindrinis korpusas',
        reinforcement: 'Dvigubos siūlės ties pažastų sujungimais',
        durabilityStandard: 'Išlaiko spalvos ryškumą (reaktyvinis dažymas 4/5)',
        craftNote: 'Audinys pasižymi prabangiu standumu — marškinėliai neatrodo kaip pigūs apatiniai, o turi skulptūrišką siluetą.',
      },
    },
    {
      id: 'tshirt-hem',
      garmentType: 'tshirt',
      title: 'Dviadatinis Apačios Kraštas',
      subtitle: 'Twin-Needle elastinga grandinė, nevaržanti judesių',
      category: 'seam',
      position: [0.0, -0.80, 0.34],
      macroZone: 'cuff-elastic',
      fabricTech: {
        gsm: '240 GSM',
        composition: '100% šukuotinė medvilnė',
        weave: 'Platus 2.5 cm apačios palenkimas',
        breathability: 'Laisvas oro judėjimas',
        resistance: 'Apsaugota nuo siūlų iširimo kraštuose',
      },
      constructionTech: {
        stitchType: 'Apatinis grandininis „Coverstitch“ dygsnis',
        reinforcement: 'Termiškai fiksuota lenkimo briauna',
        durabilityStandard: 'Neužsiraito po skalbimo',
        craftNote: 'Palenkimas atliktas specialia pramonine mašina su diferenciniu audinio padavimu.',
      },
    },
  ],
  jacket: [
    {
      id: 'jacket-membrane',
      garmentType: 'jacket',
      title: '3 Sluoksnių Vandeniui Atspari Membrana',
      subtitle: '20 000 mm hidrostatinis slėgis ir pilnas vėjo blokavimas',
      category: 'fabric',
      position: [0.0, 0.45, 0.45],
      macroZone: 'fabric-weave',
      fabricTech: {
        gsm: '195 GSM kompozicinė techninė medžiaga',
        composition: '100% perdirbtas nailonas Ripstop + TPU mikroporinė membrana',
        weave: '3D Rip-Stop kvadratėlių tinklelis (apsauga nuo įpjovimų)',
        breathability: '15 000 g/m²/24h aktyviam judėjimui',
        resistance: 'DWR (Durable Water Repellent) C0 be fluorintų angliavandenilių',
      },
      constructionTech: {
        stitchType: 'Lazeriu pjauti kraštai ir ultragarsu suvirintos siūlės',
        reinforcement: 'Termiškai lydytos 13 mm poliuretano vandens nepraleidžiančios juostos',
        durabilityStandard: 'Atitinka EN 343 4:4 apsaugos nuo lietaus standartą',
        craftNote: 'Lietaus lašai nuo audinio nubėga tarsi nuo lotoso lapo, o prakaitas išgarinamas per mikroporas.',
      },
    },
    {
      id: 'jacket-zipper',
      garmentType: 'jacket',
      title: 'YKK AquaGuard® Sandarus Užtrauktukas',
      subtitle: 'Laminuotas poliuretanu su paslėpta smakro apsauga',
      category: 'construction',
      position: [0.0, 0.15, 0.48],
      macroZone: 'chest-design',
      fabricTech: {
        gsm: 'Sustiprinta poliesterio juosta su PU laminatu',
        composition: 'Vandeniui atsparūs matiniai dantukai',
        weave: 'Hermetinis sandarinimas',
        breathability: 'Apsauga nuo drėgmės prasiskverbimo',
        resistance: 'Atlaiko iki 1 baro vandens srautą',
      },
      constructionTech: {
        stitchType: 'Sandarus laminavimas su apsaugine vidine audinio kloste',
        reinforcement: 'Ergonominis metalinis traukiklis su virvele patogiam suėmimui su pirštinėmis',
        durabilityStandard: 'Išbandytas 10 000 atidarymo/uždarymo ciklų',
        craftNote: 'Viršuje įsiūta minkšta flisinė apsauga, kad užtrauktukas nebraižytų smakro.',
      },
    },
    {
      id: 'jacket-cuff',
      garmentType: 'jacket',
      title: 'Reguliuojamas Velcro® Rankogalis',
      subtitle: 'Lazeriu išpjautas dirželis su sandariu prigludimu prie riešo',
      category: 'ergonomics',
      position: [-0.92, -0.40, 0.22],
      macroZone: 'cuff-elastic',
      fabricTech: {
        gsm: 'Termoplastinis TPU laminatas su mikro-kabliukais',
        composition: 'Nailonas ir hipoalerginis elastomerinis polimeras',
        weave: 'Plokščias profilis, nekimba prie džemperių',
        breathability: 'Atsparus drėgmei ir šalčiui iki -30°C',
        resistance: 'Atsparumas purvui ir sniegui',
      },
      constructionTech: {
        stitchType: 'Dvigubas sustiprintas rėminis apsiuvimas',
        reinforcement: 'Elastinis vidinis rankogalis su nykščio kilpa (Gaiter)',
        durabilityStandard: 'Velcro sukibimas išlieka virš 5000 ciklų',
        craftNote: 'Galima sandariai užsegti ant slidinėjimo ar dviračio pirštinių.',
      },
    },
  ],
  sneakers: [
    {
      id: 'sneakers-upper',
      garmentType: 'sneakers',
      title: 'Pilno Grūdo Nappa Oda & Zomšas',
      subtitle: '1.4 mm natūrali oda su hidrofobiniu impregnavimu',
      category: 'fabric',
      position: [0.0, 0.25, 0.35],
      macroZone: 'fabric-weave',
      fabricTech: {
        gsm: '1.4–1.6 mm kalibruotas odos storis',
        composition: '100% natūrali itališka Nappa oda ir versto plauko zomšas',
        weave: 'Natūralus odos mikro pluoštas su porėtu kvėpavimu',
        breathability: 'Natūrali ventiliacija su perforuota priekine dalimi',
        resistance: 'Bally Flexometer > 50 000 lankstymo ciklų be įtrūkimų',
      },
      constructionTech: {
        stitchType: 'Rankomis tikrinta vokiško siūlo „Serafil“ dviguba siūlė',
        reinforcement: 'Termiškai formuotas priekinis pirštų gaubtas nuo smūgių',
        durabilityStandard: 'Atspari dėmėms ir purvui',
        craftNote: 'Oda suminkštinta natūraliais aliejais, todėl batai iškart patogūs nuo pirmos dienos.',
      },
    },
    {
      id: 'sneakers-sole',
      garmentType: 'sneakers',
      title: 'Dvigubo Tankio EVA & Guminis Padas',
      subtitle: 'Smūgius sugeriantis padas su sukibimo protektoriumi',
      category: 'construction',
      position: [0.0, -0.35, 0.15],
      macroZone: 'cuff-elastic',
      fabricTech: {
        gsm: 'Lengvasvoris EVA (Shore A 45 kietumas)',
        composition: 'EVA amortizacinis vidpadis + vulkanizuota natūrali guma',
        weave: 'Gilus 3.5 mm geometrinis protektorius',
        breathability: 'Termoizoliacinis barjeras nuo šaltos žemės',
        resistance: 'DIN dilimo testas < 120 mm³ (ypatingai ilgaamžis)',
      },
      constructionTech: {
        stitchType: 'Strobel konstrukcija ir šoninis pado apsiuvimas (Cupsole Stitch)',
        reinforcement: 'Integruota pėdos skliauto stabilizavimo plokštelė',
        durabilityStandard: 'Išbandytas 1 000 000 žingsnių teste',
        craftNote: 'Užtikrina minkštą nusileidimą kulnui ir energijos grąžinimą atsispiriant.',
      },
    },
    {
      id: 'sneakers-heel',
      garmentType: 'sneakers',
      title: 'Termoplastinis Kulno Stabilizatorius',
      subtitle: 'Anatominis TPU karkasas apsaugai nuo krypavimo',
      category: 'ergonomics',
      position: [0.0, 0.05, -0.65],
      macroZone: 'pocket-seams',
      fabricTech: {
        gsm: 'TPU kompozitas su atminties putomis',
        composition: 'Recycled TPU + antibakterinis bambuko pluošto pamušalas',
        weave: 'Paminkštinta Achilo sausgyslės apsauga',
        breathability: 'Drėgmę šalinantis vidpadis',
        resistance: 'Maksimalus šoninis stabilumas',
      },
      constructionTech: {
        stitchType: '3D išlenktas integruotas karkasas',
        reinforcement: 'Dvigubas odos užkulnio apsiuvas su atšvaistiniu elementu',
        durabilityStandard: 'Nesmunka ir nesideformuoja',
        craftNote: 'Kulnas tvirtai fiksuojamas, todėl koja nepavargsta vaikštant visą dieną.',
      },
    },
  ],
  cargo: [
    {
      id: 'cargo-waist',
      garmentType: 'cargo',
      title: 'Elastinis Juosmuo su Sutvirtinta Virvele',
      subtitle: '360° patogumas su vidine pramonine guma ir metaliniais antgaliais',
      category: 'construction',
      position: [0.0, 0.70, 0.28],
      macroZone: 'hood-drawstrings',
      fabricTech: {
        gsm: '320 GSM ruoželinis medvilnės ruoželis (Cotton Twill)',
        composition: '97% šukuotinė medvilnė, 3% elastanas judesių laisvei',
        weave: 'Ruoželinis 3/1 pynimas dideliam atsparumui',
        breathability: 'Orui pralaidi natūrali medžiaga',
        resistance: 'Triguba apsauga nuo trinties juosmens srityje',
      },
      constructionTech: {
        stitchType: '4-eilių grandininis juosmens dygsnis',
        reinforcement: 'Metaliniai antgaliai ir apsiūtos virvelės angos',
        durabilityStandard: 'Neapsiverčia ir nesusiglamžo dėvint',
        craftNote: 'Kelnes galima dėvėti tiek su diržu, tiek be jo — virvelė paslepiama viduje.',
      },
    },
    {
      id: 'cargo-knee',
      garmentType: 'cargo',
      title: 'Anatominės Kelių Klostės (Articulated Darts)',
      subtitle: 'Ergonominis kirpimas, neleidžiantis kelnėms kilti sėdantis',
      category: 'ergonomics',
      position: [0.28, -0.15, 0.25],
      macroZone: 'pocket-seams',
      fabricTech: {
        gsm: '320 GSM',
        composition: 'Medvilnė su 3% elastanu',
        weave: 'Elastingas skersinis ruoželis',
        breathability: 'Komfortiška oro apykaita',
        resistance: 'Sustiprinta kelių zona',
      },
      constructionTech: {
        stitchType: 'Dvigubos šoninės klostės',
        reinforcement: 'Vidinės sutvirtinimo juostelės',
        durabilityStandard: 'Keliai „neišsipučia“ po ilgo sėdėjimo',
        craftNote: 'Dviratininkams ir aktyviai judantiems sukurta forma.',
      },
    },
    {
      id: 'cargo-gusset',
      garmentType: 'cargo',
      title: 'Rombinis Tarpkojo Įsiuvas (Diamond Gusset)',
      subtitle: 'Eliminuoja 4 krypčių siūlių susikirtimo įtampą',
      category: 'seam',
      position: [0.0, 0.15, 0.05],
      macroZone: 'cuff-elastic',
      fabricTech: {
        gsm: '320 GSM sustiprintas audinys',
        composition: 'Maksimalaus atsparumo pluoštas',
        weave: 'Didelio tankio ruoželis',
        breathability: 'Laisvas judėjimas',
        resistance: 'Apsauga nuo plyšimo sėdant į automobilį ar pritūpus',
      },
      constructionTech: {
        stitchType: 'Triguba prancūziška siūlė (Triple-Needle Felled Seam)',
        reinforcement: 'Bartack taškai ties visomis siūlių sandūromis',
        durabilityStandard: 'Atlaiko iki 300 N tempimo jėgą',
        craftNote: 'Pašalina trintį tarp kojų einant didelius atstumus.',
      },
    },
  ],
  trench: [
    {
      id: 'trench-lapel',
      garmentType: 'trench',
      title: 'Dvigubas Užsegimas ir Atvartai (Storm Flap)',
      subtitle: 'Vėjui ir lietui atsparus klasikinis gabardino priekis',
      category: 'construction',
      position: [0.0, 0.65, 0.35],
      macroZone: 'chest-design',
      fabricTech: {
        gsm: '290 GSM tankus medvilninis gabardinas',
        composition: '100% tankaus pynimo medvilnė su DWR danga',
        weave: 'Vandens lašus atstumiantis įstrižas pynimas',
        breathability: 'Kvėpuojantis natūralus audinys',
        resistance: 'Apsauga nuo stipraus vėjo gūsių',
      },
      constructionTech: {
        stitchType: 'Rankomis apmėtytos sagų kilpos ir rago imitacijos sagos',
        reinforcement: 'Vidinės sutvirtintos sagutės (Backing buttons)',
        durabilityStandard: 'Išlaiko elegantišką formą dešimtmečius',
        craftNote: 'Klasikinis dizainas su apsauginiu atvartu virš krūtinės lietui nubėgti.',
      },
    },
    {
      id: 'trench-belt',
      garmentType: 'trench',
      title: 'Liemens Diržas su Metalo D-Žiedais',
      subtitle: 'Tradicinė konstrukcija su sustiprintomis ėmomis',
      category: 'seam',
      position: [0.0, -0.10, 0.40],
      macroZone: 'cuff-elastic',
      fabricTech: {
        gsm: 'Dvigubas laminuotas gabardinas',
        composition: 'Medvilnė ir metalinė furnitūra be nikelio',
        weave: 'Tvirtas 4 cm pločio diržo pynimas',
        breathability: 'Reguliuojamas siluetas',
        resistance: 'Atsparumas tempimui',
      },
      constructionTech: {
        stitchType: 'Daugiaeilis lygiagretus dygsniavimas standumui',
        reinforcement: 'Oda aptraukta sagtis ir žalvariniai D-formos žiedai',
        durabilityStandard: 'Nesilanksto ir nepraranda geometrijos',
        craftNote: 'Diržą galima surišti mazgu arba užsegti sagtimi pagal norimą stilių.',
      },
    },
  ],
};
