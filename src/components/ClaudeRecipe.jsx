import React, { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";

const IngredientsList = ({ ingredients }) => {
  const [recipe, setRecipe] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const getRecipe = async (ingredients) => {
    const res = await fetch(
      "https://chef-claude-bar3.onrender.com/api/recipe",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ingredients }),
      }
    );

    const data = await res.json();
    console.log("API response:", data); // ✅ Valid use
    return data.recipe; // ✅ This works inside a function
  };

  useEffect(() => {
    async function fetchRecipe() {
      setIsLoading(true);
      const result = await getRecipe(ingredients);
      setRecipe(result);
      setIsLoading(false);
    }

    if (Array.isArray(ingredients) && ingredients.length > 0) {
      fetchRecipe();
    }
  }, [ingredients]);

  return (
    <section>
      {isLoading ? (
        <h3>Still loading...</h3>
      ) : (
        <>
          <h2>Chef Claude Recommends:</h2>
          <article className="suggested-recipe-container" aria-live="polite">
            <ReactMarkdown>{recipe}</ReactMarkdown>
          </article>
        </>
      )}
    </section>
  );
};

export default IngredientsList;
