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
- Use a clean white/purple color scheme.
- Ensure the SVG has a viewBox and is responsive.
- Do not include heavy styling, keep it minimal and educational.`;

    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            type: { type: Type.STRING },
            svg: { type: Type.STRING },
            labels: { type: Type.ARRAY, items: { type: Type.STRING } },
            short_explanation: { type: Type.STRING }
          },
          required: ["title", "type", "svg", "labels", "short_explanation"]
        }
      }
    });

    const result = JSON.parse(response.text);
    res.status(200).json(result);
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    res.status(500).json({ error: error.message || "Failed to generate diagram. Please try again." });
  }
}
