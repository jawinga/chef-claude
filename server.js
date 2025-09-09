// server.js
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import "dotenv/config.js";
import { Anthropic } from "@anthropic-ai/sdk";

const app = express();
app.use(cors()); // or configure allowed origins
app.use(bodyParser.json());

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY, // from server-side .env (NO VITE_ prefix)
});

const SYSTEM_PROMPT = `
You are an assistant that receives a list of ingredients that a user has and suggests a recipe...
`;

app.post("/api/recipe", async (req, res) => {
  try {
    const { ingredients } = req.body;
    if (!Array.isArray(ingredients) || ingredients.length === 0) {
      return res
        .status(400)
        .json({ error: "ingredients must be a non-empty array" });
    }

    const ingredientsString = ingredients.join(", ");

    const msg = await anthropic.messages.create({
      model: "claude-3-haiku-20240307",
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: `I have ${ingredientsString}. Please give me a recipe you'd recommend I make!`,
        },
      ],
    });

    const text = msg.content?.[0]?.text ?? "";
    res.json({ recipe: text });
  } catch (err) {
    console.error("API error:", err);
    res.status(500).json({ error: "Failed to generate recipe" });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () =>
  console.log(`API server listening on http://localhost:${PORT}`)
);
