// api/recipe.js (Edge Function)
export const config = { runtime: "edge" };

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

export default async function handler(request) {
  try {
    if (request.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method Not Allowed" }), {
        status: 405,
        headers: { "content-type": "application/json" },
      });
    }

    const { ingredients } = await request.json();
    if (!Array.isArray(ingredients) || ingredients.length === 0) {
      return new Response(
        JSON.stringify({ error: "ingredients must be a non-empty array" }),
        { status: 400, headers: { "content-type": "application/json" } }
      );
    }

    const anthropicRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
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
      }),
    });

    if (!anthropicRes.ok) {
      const errText = await anthropicRes.text();
      return new Response(
        JSON.stringify({ error: "Upstream error", detail: errText }),
        { status: 502, headers: { "content-type": "application/json" } }
      );
    }

    const data = await anthropicRes.json();
    const text =
      (data && data.content && data.content[0] && data.content[0].text) || "";

    return new Response(JSON.stringify({ recipe: text }), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: "Server error" }), {
      status: 500,
      headers: { "content-type": "application/json" },
    });
  }
}
