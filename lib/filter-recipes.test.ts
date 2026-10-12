import { describe, expect, it } from 'vitest';
import type { Filters, RecipeSuggestion } from '@/types';
import { filterRecipes } from './filter-recipes';

const recipe = (over: Partial<RecipeSuggestion>): RecipeSuggestion => ({
  id: 'x', name: 'x', matchPercentage: 50, missingIngredients: [], availableIngredients: [],
  estimatedTime: 30, difficulty: 'fácil', dietaryTags: [], servings: 2, ...over,
});
const none: Filters = { maxTime: null, difficulty: null, dietaryTag: null };

describe('filterRecipes', () => {
  const list = [
    recipe({ id: 'a', estimatedTime: 15, dietaryTags: ['vegano', 'vegetariano'] }),
    recipe({ id: 'b', estimatedTime: 60, difficulty: 'difícil', dietaryTags: ['sin gluten'] }),
    recipe({ id: 'c', estimatedTime: 25, dietaryTags: ['vegano'] }),
  ];
  const ids = (f: Partial<Filters>) => filterRecipes(list, { ...none, ...f }).map((r) => r.id);

  it('returns everything without filters', () => expect(ids({})).toEqual(['a', 'b', 'c']));
  it('filters by max time', () => expect(ids({ maxTime: 30 })).toEqual(['a', 'c']));
  it('filters by difficulty', () => expect(ids({ difficulty: 'difícil' })).toEqual(['b']));
  it('treats vegan dishes as vegetarian', () => expect(ids({ dietaryTag: 'vegetariano' })).toEqual(['a', 'c']));
  it('matches other diet tags exactly', () => expect(ids({ dietaryTag: 'sin gluten' })).toEqual(['b']));
});
