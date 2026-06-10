import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

let ai: GoogleGenAI | null = null;

function getAI() {
  if (!ai) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === "MY_GEMINI_API_KEY" || apiKey.trim() === "") {
      throw new Error("GEMINI_API_KEY is not configured. Please add GEMINI_API_KEY to your Environment Variables.");
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

app.use(express.json());

// API Routes
app.post("/api/generate-diagram", async (req, res) => {
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
        console.log(`[Server] Attempting generation with model: ${modelName}`);
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
          console.log(`[Server] Successfully generated diagram with model: ${modelName}`);
          break;
        }
      } catch (err: any) {
        console.warn(`[Server] Model ${modelName} failed:`, err.message || err);
        lastError = err;
      }
    }

    if (!responseText) {
      throw lastError || new Error("All loaded Gemini models failed to generate the diagram due to high load or rate limiting. Please wait a moment and try again.");
    }

    const result = JSON.parse(responseText);
    res.json(result);
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    res.status(500).json({ error: error.message || "Failed to generate diagram. Please try again." });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
