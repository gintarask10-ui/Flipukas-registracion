import express, { Request, Response } from 'express';
import { GoogleGenAI } from '@google/genai';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);

app.use(express.json({ limit: '1mb' }));

// Security headers middleware
app.use((_req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

// Simple in-memory rate limiter for API endpoints (max 40 requests/min per IP)
const ipRequestCounts = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 40;

const apiRateLimiter = (req: Request, res: Response, next: () => void) => {
  const ip = req.ip || req.socket.remoteAddress || 'unknown-client';
  const now = Date.now();
  const current = ipRequestCounts.get(ip);

  if (!current || now > current.resetTime) {
    ipRequestCounts.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    return next();
  }

  if (current.count >= MAX_REQUESTS_PER_WINDOW) {
    return res.status(429).json({
      error: 'Too Many Requests',
      messageLt: 'Per daug užklausų per trumpą laiką. Prašome palaukti minutę.',
    });
  }

  current.count += 1;
  next();
};

app.use('/api', apiRateLimiter);

// Initialize Google GenAI SDK (User-Agent header required by AI Studio guidelines)
const apiKey = process.env.GEMINI_API_KEY;
let aiClient: GoogleGenAI | null = null;

if (apiKey && apiKey !== 'MY_GEMINI_API_KEY') {
  try {
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  } catch (err) {
    console.warn('Failed to initialize GoogleGenAI client:', err);
  }
}

// Catalog complementary items definitions for AI matching
const CATALOG_COMPLEMENTARY_POOL = [
  {
    id: 'comp-sneakers-kinetix',
    titleLt: 'Kinetix-01 Bioniniai Kedai',
    categoryLt: 'Avalynė',
    price: 64,
    image: 'https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=600&q=80',
    tags: ['futuristic', 'sport', 'tpu', 'sneakers', 'streetwear', 'aeroshift'],
    fabricMatch: ['bio-neoprene', 'gore-aero', 'tech-cotton'],
    colorMatches: ['#161618', '#374151', '#d97706', '#d4af37'],
    fabricNameLt: 'Bioninis TPU & Aerotrikotažas',
  },
  {
    id: 'comp-pants-cargo',
    titleLt: 'Modulinės Krovinių Kelnės (Cargo Tech)',
    categoryLt: 'Kelnės',
    price: 49,
    image: 'https://images.unsplash.com/photo-1517445312882-bc9910d016b7?auto=format&fit=crop&w=600&q=80',
    tags: ['cargo', 'technical', 'ripstop', 'utility', 'oversized'],
    fabricMatch: ['gore-aero', 'selvedge-denim', 'tech-cotton'],
    colorMatches: ['#161618', '#3f4f38', '#526b58', '#374151'],
    fabricNameLt: 'Atsparus Ripstop Softshell',
  },
  {
    id: 'comp-scarf-silk',
    titleLt: 'Atelier Šilko Skarelė / Monogramos Juosta',
    categoryLt: 'Aksesuaras',
    price: 24,
    image: 'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?auto=format&fit=crop&w=600&q=80',
    tags: ['silk', 'luxury', 'champagne', 'formal', 'gold'],
    fabricMatch: ['mulberry-silk', 'merino-wool', 'liquid-chrome'],
    colorMatches: ['#d4af37', '#e2dfd8', '#881337', '#161618'],
    fabricNameLt: '100% Mulberry Šilkas 22 Momme',
  },
  {
    id: 'comp-beanie-merino',
    titleLt: 'Minimalistinė Merino Vilnos Kepurė (Beanie)',
    categoryLt: 'Aksesuaras',
    price: 19,
    image: 'https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?auto=format&fit=crop&w=600&q=80',
    tags: ['wool', 'warm', 'cozy', 'minimalist', 'casual'],
    fabricMatch: ['merino-wool', 'tech-cotton', 'selvedge-denim'],
    colorMatches: ['#161618', '#715842', '#374151', '#526b58'],
    fabricNameLt: '100% Itališka Merino Vilna 320GSM',
  },
  {
    id: 'comp-leather-belt',
    titleLt: 'Rankų Darbo Eko Odos Diržas su Magnetine Sagtimi',
    categoryLt: 'Galanterija',
    price: 28,
    image: 'https://images.unsplash.com/photo-1624222247344-550fb60583dc?auto=format&fit=crop&w=600&q=80',
    tags: ['leather', 'belt', 'hardware', 'luxury', 'classic'],
    fabricMatch: ['liquid-chrome', 'matte-leather', 'selvedge-denim'],
    colorMatches: ['#161618', '#b48a3c', '#cbd5e1', '#715842'],
    fabricNameLt: 'Reljefinė Grūdėta Eko Oda & Aliuminis',
  },
  {
    id: 'comp-crossbody-bag',
    titleLt: 'Vandeniui Atspari Crossbody Tech Rankinė',
    categoryLt: 'Krepšiai',
    price: 36,
    image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=600&q=80',
    tags: ['techwear', 'bag', 'waterproof', 'functional'],
    fabricMatch: ['gore-aero', 'bio-neoprene', 'tech-cotton'],
    colorMatches: ['#161618', '#1e3a8a', '#3f4f38'],
    fabricNameLt: 'Cordura & DWR Softshell',
  },
];

// POST /api/gemini/style-consultant
// Analyzes current customization using Gemini API and suggests matching catalog accessories
app.post('/api/gemini/style-consultant', async (req: Request, res: Response) => {
  try {
    const {
      productName,
      productType,
      fabric,
      colors,
      fitMode,
      customText,
      userPrompt,
    } = req.body;

    const selectedFabricName = fabric?.nameLt || fabric?.name || 'Minkšta Šukuotinė Medvilnė';
    const textureType = fabric?.textureType || 'cotton';
    const primaryColor = colors?.primary || '#161618';
    const secondaryColor = colors?.secondary || '#374151';
    const accentColor = colors?.accent || '#d4af37';
    const hardwareColor = colors?.hardware || '#cbd5e1';

    // Check if Gemini API is available
    if (aiClient) {
      try {
        const prompt = `
Tu esi aukščiausio lygio „Flipukas Atelier“ vyriausiasis mados stilistas ir dirbtinio intelekto konsultantas.
Vartotojas 3D laboratorijoje kuria šį drabužį:
- Drabužio modelis: "${productName || 'Aero-Shift Džemperis'}" (tipas: ${productType || 'hoodie'})
- Pasirinktas audinys: "${selectedFabricName}" (tekstūra: ${textureType}, GSM: ${fabric?.gsm || 380}, sudėtis: ${fabric?.composition || '100% Organinė Medvilnė'})
- Spalvų paletė: Pagrindinė (${primaryColor}), Antrinė (${secondaryColor}), Akcentas (${accentColor}), Metalinė furnitūra (${hardwareColor})
- Kirpimas (fit): "${fitMode || 'regular'}"
- Monograma / Tekstas: "${customText || 'Nėra'}"
${userPrompt ? `- Vartotojo asmeninė stiliaus užklausa: "${userPrompt}"` : ''}

Mūsų kataloge turimi papildomi aksesuarai ir deriniai:
${JSON.stringify(
  CATALOG_COMPLEMENTARY_POOL.map((item) => ({
    id: item.id,
    titleLt: item.titleLt,
    categoryLt: item.categoryLt,
    price: item.price,
    fabricNameLt: item.fabricNameLt,
    tags: item.tags,
  })),
  null,
  2
)}

Užduotis:
1. Įvertink šio drabužio spalvų harmoniją ir audinio pritaikymą (profesionali, bet glausta lietuviška apžvalga).
2. Parink 3 labiausiai tinkančius aksesuarus / prekes iš katalogo sąrašo, kurie tobulai papildytų šį pasirinktą audinį ir spalvų paletę.
3. Kiekvienam aksesuarui parašyk aiškią, argumentuotą stilisto priežastį (reasonLt), kodėl jis tinka būtent prie šio audinio (${selectedFabricName}) ir šių spalvų.
4. Sugeneruok rekomenduojamą bendro įvaizdžio pavadinimą (titleLt) ir įvaizdžio aprašymą (descriptionLt).
5. Pateik atsakymą TIKTAIS griežtu JSON formatu (be jokio papildomo teksto prieš ar po):
{
  "titleLt": "Įvaizdžio pavadinimas",
  "descriptionLt": "1-2 sakinių aprašymas apie stilių",
  "styleVibeLt": "Elegantiškas / Urban Tech / Atelier Minimal",
  "colorHarmonyAdviceLt": "Glaustas komentaras apie pagrindinės ir akcento spalvų kontrastą",
  "fabricSynergyLt": "Komentaras apie audinio drapiravimą ir judėjimą",
  "recommendedItems": [
    {
      "id": "aksesuaro_id_iš_katalogo",
      "reasonLt": "Kodėl tinka prie pasirinkto audinio ir spalvų"
    }
  ],
  "suggestedColorTweaks": {
    "recommendedAccent": "${accentColor}",
    "recommendedHardware": "${hardwareColor}"
  }
}
`;

        const response = await aiClient.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            temperature: 0.7,
          },
        });

        const textResponse = response.text || '';
        let parsedData;
        try {
          parsedData = JSON.parse(textResponse);
        } catch {
          // Extract JSON if wrapped in markdown
          const match = textResponse.match(/\{[\s\S]*\}/);
          if (match) {
            parsedData = JSON.parse(match[0]);
          }
        }

        if (parsedData && Array.isArray(parsedData.recommendedItems)) {
          // Merge with catalog item details
          const matchedAccessories = parsedData.recommendedItems
            .map((recItem: { id: string; reasonLt?: string }) => {
              const catalogItem = CATALOG_COMPLEMENTARY_POOL.find((c) => c.id === recItem.id);
              if (!catalogItem) return null;
              return {
                ...catalogItem,
                reasonLt: recItem.reasonLt || `Deranti estetika su ${selectedFabricName}.`,
                colorHex: accentColor,
              };
            })
            .filter(Boolean);

          return res.json({
            success: true,
            provider: 'gemini-3.8-flash',
            titleLt: parsedData.titleLt || 'Atelier Personalizuotas Derinys',
            descriptionLt: parsedData.descriptionLt || 'Profesionaliai suderintas stilius pagal jūsų pasirinktą audinį ir paletę.',
            styleVibeLt: parsedData.styleVibeLt || 'Moderni Atelier Prabanga',
            colorHarmonyAdviceLt: parsedData.colorHarmonyAdviceLt || `Spalva ${accentColor} suteikia elegantišką vizualinį kontrastą tamsesnei bazei.`,
            fabricSynergyLt: parsedData.fabricSynergyLt || `${selectedFabricName} suteikia išskirtinį kritimą ir drapiravimą judesyje.`,
            accessories: matchedAccessories.length > 0 ? matchedAccessories : CATALOG_COMPLEMENTARY_POOL.slice(0, 3),
            suggestedColorTweaks: parsedData.suggestedColorTweaks || null,
          });
        }
      } catch (geminiError) {
        console.warn('Gemini API call returned an error, falling back to curated AI engine:', geminiError);
      }
    }

    // Curated high-precision fallback if Gemini API key is absent or pending
    let fallbackTitle = 'Atelier Harmoninis Derinys';
    let fallbackDesc = `Subalansuotas įvaizdis, išryškinantis ${selectedFabricName} tekstūrą ir subtilius akcentus.`;
    let fallbackVibe = 'Modernus Minimalizmas';
    let fallbackHarmony = `Spalvų paletė subalansuoja pagrindinį toną su švytinčiu ${accentColor} akcentu.`;
    let fallbackSynergy = `${selectedFabricName} (${textureType}) užtikrina tolygų audinio kritimą ir natūralų drape judant.`;

    // Filter matching accessories from pool based on fabric type and colors
    const matched = CATALOG_COMPLEMENTARY_POOL.filter((item) => {
      const matchesFabric = item.fabricMatch.includes(fabric?.id || '');
      return matchesFabric;
    });

    const chosenItems = (matched.length >= 2 ? matched : CATALOG_COMPLEMENTARY_POOL).slice(0, 3).map((item) => ({
      ...item,
      colorHex: accentColor,
      reasonLt: `Aksesuaras puikiai atkartoja ${selectedFabricName} faktūrą ir apjungia ${accentColor} bei ${hardwareColor} detalių harmoniją.`,
    }));

    return res.json({
      success: true,
      provider: 'curated-ai-fallback',
      titleLt: fallbackTitle,
      descriptionLt: fallbackDesc,
      styleVibeLt: fallbackVibe,
      colorHarmonyAdviceLt: fallbackHarmony,
      fabricSynergyLt: fallbackSynergy,
      accessories: chosenItems,
    });
  } catch (error) {
    console.error('Error in /api/gemini/style-consultant:', error);
    return res.status(500).json({
      error: 'Failed to analyze style customization',
      details: error instanceof Error ? error.message : String(error),
    });
  }
});

// Setup Vite middlewares in development or static serving in production
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Flipukas Server running on port ${PORT} (NODE_ENV: ${process.env.NODE_ENV || 'development'})`);
  });
}

startServer();
