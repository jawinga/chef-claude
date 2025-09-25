// api/recipe.js (Edge Function)
export const config = { runtime: "edge" };

const SYSTEM_PROMPT = `
You are Chef Claude, a helpful cooking assistant...
(keep your exact prompt here)
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
