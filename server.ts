import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini client lazily
let aiClient: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("GEMINI_API_KEY is not defined in environment. AI suggestions will use fallback data.");
    }
    aiClient = new GoogleGenAI({ apiKey: apiKey || "MOCK_KEY" });
  }
  return aiClient;
}

// API Routes
app.post('/api/generate-idea', async (req, res) => {
  const { vibe, productType } = req.body;

  if (!vibe) {
    return res.status(400).json({ error: "Vibe is required" });
  }

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      // Return a realistic set of high-end ideas if the key is missing (for the sandbox)
      return res.json(getFallbackIdeas(vibe, productType));
    }

    const ai = getAiClient();
    const prompt = `You are the lead designer for DjassaClub, an ultra-premium, Y2K-inspired, high-fashion custom streetwear and merchandise brand. 
The brand combines the rebellious attitude of MSCHF, the technical minimalist elegance of Nothing, and the premium athletics of Nike.

The user wants a design suggestion for a "${productType || 'streetwear item'}" with a "${vibe}" vibe.

Generate exactly 3 distinct streetwear design concepts in JSON format.
Each design concept should have:
1. "slogan": A striking, memorable text or phrase in French or English (e.g., "TEMPORARY REALITY", "STRESS RELIEF", "NOT FOR RESALE", "DJASSA SOUL") that would look incredible printed in a big bold high-fashion font.
2. "subtext": A smaller secondary line of text (like technical coordinates, a date, a subtle brand manifesto, or a ironic subversion) to go underneath the slogan in a small monospace font.
3. "font": Suggest one of these exact fonts: 'Space Grotesk' (modern bold), 'Syne' (futuristic heavy), 'JetBrains Mono' (technical code), 'Inter' (clean minimal), or 'Impact' (brutalist bold).
4. "color": An elegant hex code for the text (prefer brand colors like White #F8F8F8, Crimson Red #C8102E, Matte Black #111111, Chrome Silver #D1D1D6, Acid Lime #CCFF00, or Electric Blue #0044FF).
5. "fabricColor": The recommended item color as a hex code (e.g. #111111 for Ink Black, #F8F8F8 for Off-White, #C8102E for Crimson, #222222 for Slate Gray).
6. "graphicSuggestion": A description of a graphic element, logo, emoji or QR code to place on the item (e.g. "Un grand logo étoile chrome Y2K centré", "Un QR code technique imprimé sur la manche", "Une signature manuscrite rouge sur la poitrine").
7. "explanation": A 1-sentence French explanation of the design concept's artistic message.

Return ONLY a raw JSON array containing these 3 objects. Do not wrap the JSON in markdown code blocks or write any extra text before or after.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      }
    });

    const responseText = response.text || '';
    const cleanJsonString = responseText.trim().replace(/^```json\s*/, '').replace(/```$/, '');
    const data = JSON.parse(cleanJsonString);
    res.json(data);
  } catch (error) {
    console.error("Gemini AI generation error:", error);
    // Return high-quality fallback on error
    res.json(getFallbackIdeas(vibe, productType));
  }
});

function getFallbackIdeas(vibe: string, productType: string) {
  const normalizedVibe = vibe.toLowerCase();
  
  if (normalizedVibe.includes('y2k') || normalizedVibe.includes('cyber') || normalizedVibe.includes('chrome')) {
    return [
      {
        slogan: "LOST IN PORTAL",
        subtext: "REF. 404 // DJASSA.NETWORKS.ONLINE",
        font: "Syne",
        color: "#CCFF00",
        fabricColor: "#111111",
        graphicSuggestion: "Un chrome star Y2K brillant et des lignes de données.",
        explanation: "Inspiré de l'esthétique Web 1.0 et de l'ère cybernétique du début des années 2000."
      },
      {
        slogan: "LIQUID SOUL",
        subtext: "METALLIC EMOTIONS™ [ALL RIGHTS RESERVED]",
        font: "Space Grotesk",
        color: "#D1D1D6",
        fabricColor: "#111111",
        graphicSuggestion: "Une grande flaque d'aspect métal liquide réfléchissant.",
        explanation: "Un contraste saisissant entre la fluidité organique et l'esthétique industrielle froide."
      },
      {
        slogan: "FUTURE DECAY",
        subtext: "EST. 2026 // BATCH-77291-C",
        font: "JetBrains Mono",
        color: "#C8102E",
        fabricColor: "#222222",
        graphicSuggestion: "Un QR code menant vers le manifeste de la marque.",
        explanation: "Un look de pièces déconstruites avec une touche technique cyberpunk brutale."
      }
    ];
  }

  // General default fallback
  return [
    {
      slogan: "NOT FOR RESALE",
      subtext: "MADE FOR CREATORS // DJASSA CLUB MEMBERS ONLY",
      font: "Space Grotesk",
      color: "#F8F8F8",
      fabricColor: "#111111",
      graphicSuggestion: "Un code-barres industriel surdimensionné.",
      explanation: "Une subversion ironique de la culture du battage médiatique (hype culture)."
    },
    {
      slogan: "HUMAN DESIGN",
      subtext: "01001000 01010101 01001101 01000001 01001110",
      font: "JetBrains Mono",
      color: "#C8102E",
      fabricColor: "#F8F8F8",
      graphicSuggestion: "Une signature d'atelier rouge manuscrite.",
      explanation: "Célèbre l'imperfection de la création humaine face à l'automatisation numérique."
    },
    {
      slogan: "SENSORY OVERLOAD",
      subtext: "WARNING: DYNAMIC CONTENT DETECTED",
      font: "Syne",
      color: "#CCFF00",
      fabricColor: "#111111",
      graphicSuggestion: "Une flèche d'avertissement jaune néon détournée.",
      explanation: "Un cri visuel maximaliste inspiré de l'art urbain et du design Nothing."
    }
  ];
}

// Vite integration
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Vite middleware mounted in Development mode");
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
    console.log("Serving static assets in Production mode");
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`DjassaClub Server running on port ${PORT}`);
  });
}

startServer();
