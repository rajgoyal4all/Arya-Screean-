import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Initialize GoogleGenAI server-side with process.env.GEMINI_API_KEY
const ai = new GoogleGenAI();

/**
 * Search-grounded market specifications & pricing research endpoint for printing work types
 * Leverages Google Search data via gemini-3.8-flash to retrieve prevailing Indian market rates,
 * standard printing GSM, dimensions, and turnaround norms.
 */
app.post('/api/research-worktype', async (req, res) => {
  try {
    const { workTypeName } = req.body;
    if (!workTypeName || typeof workTypeName !== 'string') {
      return res.status(400).json({ error: 'workTypeName is required' });
    }

    const prompt = `You are a commercial printing press estimator in India (specializing in Flex, DTP, Offset, Screen Printing, and Signage).
Research and provide accurate, prevailing Indian market specifications for: "${workTypeName}".

Use Google Search to find current market pricing in India, popular materials/GSM, and standard industry dimensions.

Respond ONLY with valid JSON having the exact following structure:
{
  "category": "Outdoor Signage" | "Cards & Stationery" | "Wedding & Invitations" | "DTP & Office Stationery" | "Stickers & Decals" | "Promotional" | "Other",
  "suggestedTitle": "${workTypeName}",
  "unit": "sq.ft" | "per 1000 pcs" | "per 100 pcs" | "per piece" | "per book" | "per page",
  "basePrice": number (realistic average price in INR),
  "minQuantity": number,
  "defaultDimensions": string (e.g. "10x3 ft" or "3.5x2 in"),
  "materialOptions": string[] (3 to 5 realistic GSM or material names),
  "estimatedTurnaround": string (e.g. "Same Day (2-4 hrs)", "24 Hours", "2-3 Days"),
  "description": string (concise commercial product description, 20-40 words),
  "marketInsights": string (brief note on pricing trends or high-demand specs in India)
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const rawText = response.text?.trim() || '{}';
    let parsed: any;
    try {
      parsed = JSON.parse(rawText);
    } catch {
      // Fallback clean regex match for JSON
      const jsonMatch = rawText.match(/\{[\s\S]*\}/);
      parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : {};
    }

    // Extract search grounding metadata
    const groundingMetadata = response.candidates?.[0]?.groundingMetadata;
    const webSearchQueries = groundingMetadata?.webSearchQueries || [];
    const searchChunks = (groundingMetadata?.groundingChunks || [])
      .map((chunk: any) => ({
        title: chunk.web?.title || '',
        url: chunk.web?.uri || '',
      }))
      .filter((c: any) => Boolean(c.url));

    return res.json({
      success: true,
      data: parsed,
      grounding: {
        queries: webSearchQueries,
        sources: searchChunks.slice(0, 5),
      },
    });
  } catch (err: any) {
    console.error('API Error in /api/research-worktype:', err);
    return res.status(500).json({
      error: err.message || 'Failed to research printing work type specifications',
    });
  }
});

// Vite middleware for dev mode or static files for production
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Arya 2 Enterprise server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
