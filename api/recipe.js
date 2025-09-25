import { Anthropic } from "@anthropic-ai/sdk";

const SYSTEM_PROMPT = `
You are Chef Claude, a helpful cooking assistant. You receive a list of ingredients from the user and suggest one creative, delicious recipe...
`;

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const { ingredients } = req.body ?? {};
    if (!Array.isArray(ingredients) || ingredients.length === 0) {
      return res
        .status(400)
        .json({ error: "ingredients must be a non-empty array" });
    }

    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    const msg = await anthropic.messages.create({
      model: "claude-3-haiku-20240307",
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: `I have ${ingredients.join(
            ", "
          )}. Please give me a recipe you'd recommend I make!`,
        },
      ],
    });

    const text = msg?.content?.[0]?.text ?? "";
    return res.status(200).json({ recipe: text });
  } catch (err) {
    console.error("API error:", err);
    return res.status(500).json({ error: "Failed to generate recipe" });
  }
}
