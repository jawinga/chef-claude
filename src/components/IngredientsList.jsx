import React from "react";
import ReactMarkdown from "react-markdown";

const IngredientsList = ({ ingredients, getRecipe, recipe, isLoading }) => {
  return (
    <section>
      <h2>Ingredients on hand:</h2>
      <ul className="ingredients-list" aria-live="polite">
        {ingredients.map((ing, i) => (
          <li key={i}>{ing}</li>
        ))}
      </ul>

      {ingredients.length >= 2 && (
        <div className="get-recipe-container">
          <div>
            <h3>Ready for a recipe?</h3>
            <p>Generate a recipe from your list of ingredients.</p>
          </div>
          <button onClick={getRecipe}>Get a recipe</button>
        </div>
      )}

      {isLoading && <p>Loading recipe...</p>}

      {recipe && (
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
