'use client';

import RecipeCard from './RecipeCard';
import { RecipeSuggestion } from '@/types';
import { isWideCard } from '@/lib/utils';

interface Props {
  recipes: RecipeSuggestion[];
}

type Variant = 'hero' | 'square' | 'overlay';

function getVariant(index: number): Variant {
  const pos = index % 4;
  if (pos === 0) return 'hero';
  if (pos === 3) return 'overlay';
  return 'square';
}

export default function RecipeGrid({ recipes }: Props) {
  if (recipes.length === 0) return null;
  const count = recipes.length;

  return (
    <div>
      <p className="text-on-surface-variant font-medium text-xs mb-5">
        La IA encontró <span className="text-primary font-bold">{count} receta{count !== 1 ? 's' : ''}</span> con tus ingredientes
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-7">
        {recipes.map((recipe, i) => (
          <div
            key={recipe.id}
            className={isWideCard(i) ? 'lg:col-span-2' : 'lg:col-span-1'}
          >
            <RecipeCard recipe={recipe} index={i} variant={getVariant(i)} />
          </div>
        ))}
      </div>
    </div>
  );
}
