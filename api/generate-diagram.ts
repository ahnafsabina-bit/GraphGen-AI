import { GoogleGenAI, Type } from "@google/genai";

let ai: GoogleGenAI | null = null;

function getAI() {
  if (!ai) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === "MY_GEMINI_API_KEY" || apiKey.trim() === "") {
      throw new Error("GEMINI_API_KEY is not configured. Please add GEMINI_API_KEY to your Vercel Environment Variables in your Vercel Project Dashboard under Settings > Environment Variables.");
    }
    ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return ai;
}

export default async function handler(req: any, res: any) {
  // Allow CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { topic, category } = req.body;

  if (!topic) {
    return res.status(400).json({ error: "Topic is required" });
  }

  try {
    const client = getAI();
    const prompt = `Generate a simple, clean, and professional scientific diagram for the topic: "${topic}" in the category of "${category}".
Return ONLY a valid JSON object in the following format:
{
  "title": "Diagram Title",
  "type": "scientific_diagram",
  "svg": "<svg>...</svg>",
  "labels": ["label1", "label2"],
  "short_explanation": "1-2 line explanation"
}

SVG Requirements:
- Use clear lines and shapes.
- Include labeled parts within the SVG using <text> elements.
- Use realistic, clear, high-contrast scientific colors for clarity and educational value (not constrained to any branding color scheme).
- Ensure the SVG has a viewBox and is responsive.
- Do not include heavy styling, keep it minimal and educational.`;

    const responseSchema = {
       type: Type.OBJECT,
       properties: {
         title: { type: Type.STRING },
         type: { type: Type.STRING },
         svg: { type: Type.STRING },
         labels: { type: Type.ARRAY, items: { type: Type.STRING } },
         short_explanation: { type: Type.STRING }
       },
       required: ["title", "type", "svg", "labels", "short_explanation"]
    };

    const modelsToTry = ["gemini-2.5-flash", "gemini-1.5-flash", "gemini-3.5-flash"];
    let responseText = "";
    let lastError: any = null;

    for (const modelName of modelsToTry) {
      try {
        console.log(`[Vercel API] Attempting generation with model: ${modelName}`);
        const response = await client.models.generateContent({
          model: modelName,
          contents: [{ parts: [{ text: prompt }] }],
          config: {
            responseMimeType: "application/json",
            responseSchema: responseSchema
          }
        });
        if (response && response.text) {
          responseText = response.text;
          console.log(`[Vercel API] Successfully generated diagram with model: ${modelName}`);
          break;
        }
      } catch (err: any) {
        console.warn(`[Vercel API] Model ${modelName} failed:`, err.message || err);
        lastError = err;
      }
    }

    if (!responseText) {
      throw lastError || new Error("All loaded Gemini models failed to generate the diagram due to high load or rate limiting. Please wait a moment and try again.");
    }

    const result = JSON.parse(responseText);
    res.status(200).json(result);
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    res.status(500).json({ error: error.message || "Failed to generate diagram. Please try again." });
  }
}
