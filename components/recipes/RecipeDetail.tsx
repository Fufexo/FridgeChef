'use client';

import type { RecipeDetail as RecipeDetailType } from '@/types';
import RecipeHero from './detail/RecipeHero';
import RecipeIngredients from './detail/RecipeIngredients';
import RecipeSteps from './detail/RecipeSteps';

export default function RecipeDetail({ recipe }: { recipe: RecipeDetailType }) {
  return (
    <>
      <RecipeHero recipe={recipe} />
      <RecipeIngredients recipe={recipe} />
      <RecipeSteps steps={recipe.steps} tips={recipe.tips} />
    </>
  );
}
