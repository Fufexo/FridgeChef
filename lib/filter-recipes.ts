import type { Filters, RecipeSuggestion } from '@/types';

/** Client-side filters — never trigger a new AI call. */
export function filterRecipes(recipes: RecipeSuggestion[], filters: Filters): RecipeSuggestion[] {
  return recipes.filter((r) => {
    if (filters.maxTime !== null && r.estimatedTime > filters.maxTime) return false;
    if (filters.difficulty !== null && r.difficulty !== filters.difficulty) return false;
    if (filters.dietaryTag !== null) {
      const tags = r.dietaryTags ?? [];
      // Vegan dishes are vegetarian too
      const match = filters.dietaryTag === 'vegetariano'
        ? tags.includes('vegetariano') || tags.includes('vegano')
        : tags.includes(filters.dietaryTag);
      if (!match) return false;
    }
    return true;
  });
}
