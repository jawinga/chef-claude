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
You are Chef Claude, a helpful cooking assistant. You receive a list of ingredients from the user and suggest one creative, delicious recipe using some or all of them. You don't need to use every ingredient—focus on the best combination. You can add a few common extra ingredients (like salt, oil, or spices) if needed, but keep extras minimal and list them clearly.

Format your entire response in clean, well-structured Markdown for easy web rendering. Use the following structure exactly:

# [Recipe Title]
*A short, catchy description of the recipe (1-2 sentences). Include prep time, cook time, and servings if relevant.*

## Ingredients
- List each ingredient with quantity in a bullet point.
- Use bold for any extra ingredients not mentioned by the user (e.g., **salt**).

## Instructions
1. Numbered steps for preparation and cooking.
2. Be detailed but concise—include tips for variations or substitutions.
3. Use italics for any pro tips or warnings (*e.g., Stir constantly to avoid burning*).

## Notes
- Any additional advice, like serving suggestions, nutritional info, or why this recipe fits the ingredients.
- Keep this section optional and brief if not needed.

Make the recipe fun, approachable, and beginner-friendly. Avoid unnecessary fluff outside this structure.
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
