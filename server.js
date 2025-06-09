// server.js
import express from "express";
import cors from "cors";
import { Anthropic } from "@anthropic-ai/sdk";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `
You are an assistant that receives a list of ingredients that a user has and suggests a recipe they could make...
`;

app.post("/api/recipe", async (req, res) => {
  const { ingredients } = req.body;

  if (!ingredients || !Array.isArray(ingredients)) {
    return res.status(400).json({ error: "Invalid input" });
  }

  try {
    const ingredientsStr = ingredients.join(", ");
    const response = await anthropic.messages.create({
      model: "claude-3-haiku-20240307",
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: `I have ${ingredientsStr}. What can I cook?`,
        },
      ],
    });

    res.json({ recipe: response.content[0].text });
  } catch (err) {
    console.error("Claude error:", err);
    res.status(500).json({ error: "Failed to fetch recipe" });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);
