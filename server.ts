import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// API routes
app.post("/api/ai/analyze", async (req, res) => {
  try {
    const { workoutData } = req.body;
    if (!workoutData) {
      return res.status(400).json({ error: "No workout data provided" });
    }

    const prompt = `You are a professional athletic coach. Analyze this user's workout data and provide a personalized improvement plan:
    ${JSON.stringify(workoutData)}
    Provide a concise, motivating, and actionable advice to develop the user's performance.`;

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    res.json({ advice: response.text() });
  } catch (error) {
    console.error("Error analyzing workout data:", error);
    res.status(500).json({ error: "Failed to analyze workout data" });
  }
});

// Vite middleware for development
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
