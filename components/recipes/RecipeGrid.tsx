'use client';

import RecipeCard from './RecipeCard';
import { RecipeSuggestion } from '@/types';
import { getCardVariant, isWideCard } from '@/lib/utils';

interface Props {
  recipes: RecipeSuggestion[];
}

export default function RecipeGrid({ recipes }: Props) {
  if (recipes.length === 0) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-7">
      {recipes.map((recipe, i) => (
        <div
            key={recipe.id}
            className={isWideCard(i) ? 'lg:col-span-2' : 'lg:col-span-1'}
          >
            <RecipeCard recipe={recipe} index={i} variant={getCardVariant(i)} />
          </div>
        ))}
    </div>
  );
}
