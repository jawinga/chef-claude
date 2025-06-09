import React, { useState } from "react";
import IngredientsList from "./IngredientsList";

const Main = () => {
  const [ingredients, setIngredients] = useState([]);
  const [recipe, setRecipe] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function getRecipe() {
    setIsLoading(true);
    const res = await fetch("http://localhost:3001/api/recipe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ingredients }),
    });

    const data = await res.json();
    setRecipe(data.recipe);
    setIsLoading(false);
  }

  function submitForm(formData) {
    const newIngredient = formData.get("ingredient");
    setIngredients((prev) => [...prev, newIngredient]);
  }

  return (
    <main>
      <form className="form-container" action={submitForm}>
        <input
          type="text"
          placeholder="e.g. oregano"
          aria-label="Add ingredient"
          className="form-input"
          name="ingredient"
        />
        <button className="form-button" type="submit">
          Add ingredient
        </button>
      </form>

      {ingredients.length >= 1 && (
        <IngredientsList
          ingredients={ingredients}
          getRecipe={getRecipe}
          recipe={recipe}
          isLoading={isLoading}
        />
      )}
    </main>
  );
};

export default Main;
