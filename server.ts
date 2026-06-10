import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

// Initialize Gemini Client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

app.use(express.json());

// API Routes
app.post("/api/generate-diagram", async (req, res) => {
  const { topic, category } = req.body;

  if (!topic) {
    return res.status(400).json({ error: "Topic is required" });
  }

  try {
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
- Use a clean white/blue color scheme.
- Ensure the SVG has a viewBox and is responsive.
- Do not include heavy styling, keep it minimal and educational.`;

    const response = await ai.models.generateContent({
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
    res.json(result);
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    res.status(500).json({ error: "Failed to generate diagram. Please try again." });
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
