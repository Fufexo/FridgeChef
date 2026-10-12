import { describe, expect, it } from 'vitest';
import { normalizeDetail, normalizeRecipes } from './recipe-normalize';

const base = {
  name: 'Arroz con pollo',
  availableIngredients: ['pollo', 'arroz'],
  missingIngredients: ['pimiento'],
  estimatedTime: 45,
  difficulty: 'medio',
  dietaryTags: [],
  servings: 4,
  imageQuery: 'arroz con pollo en sartén',
};

describe('normalizeRecipes', () => {
  it('computes matchPercentage from the ingredient lists instead of trusting the model', () => {
    const [r] = normalizeRecipes({ recipes: [{ ...base, matchPercentage: 99 }] }, ['Pollo', 'Arroz']);
    expect(r.matchPercentage).toBe(67);
    expect(r.availableIngredients).toEqual(['Pollo', 'Arroz']);
    expect(r.missingIngredients).toEqual(['pimiento']);
  });

  it('drops "available" ingredients the user never entered', () => {
    const [r] = normalizeRecipes({ recipes: [{ ...base, availableIngredients: ['pollo', 'queso'] }] }, ['pollo']);
    expect(r.availableIngredients).toEqual(['pollo']);
  });

  it('moves missing items the user actually has into available', () => {
    const [r] = normalizeRecipes(
      { recipes: [{ ...base, availableIngredients: ['pollo'], missingIngredients: ['arroz', 'pimiento'] }] },
      ['pollo', 'arroz']
    );
    expect(r.availableIngredients).toEqual(['pollo', 'arroz']);
    expect(r.missingIngredients).toEqual(['pimiento']);
  });

  it('keeps different products that share a word as missing', () => {
    const [r] = normalizeRecipes(
      { recipes: [{ ...base, availableIngredients: ['arroz'], missingIngredients: ['leche de coco', 'vinagre de arroz', 'Leches'] }] },
      ['arroz', 'leche']
    );
    expect(r.missingIngredients).toEqual(['leche de coco', 'vinagre de arroz']);
    expect(r.availableIngredients).toEqual(['arroz', 'leche']);
  });

  it('ignores pantry staples when counting missing ingredients', () => {
    const [r] = normalizeRecipes(
      { recipes: [{ ...base, missingIngredients: ['sal', 'Aceite de oliva', 'agua'] }] },
      ['pollo', 'arroz']
    );
    expect(r.missingIngredients).toEqual([]);
    expect(r.matchPercentage).toBe(100);
  });

  it('matches plurals, accents and longer names', () => {
    const [r] = normalizeRecipes(
      { recipes: [{ ...base, availableIngredients: ['huevos', 'pechuga de pollo', 'champiñón'], missingIngredients: [] }] },
      ['huevo', 'pollo', 'Champiñones']
    );
    expect(r.availableIngredients).toEqual(['huevo', 'pollo', 'Champiñones']);
  });

  it('discards recipes that use none of the user ingredients', () => {
    const recipes = normalizeRecipes({ recipes: [{ ...base, availableIngredients: ['salmón'] }] }, ['pollo']);
    expect(recipes).toEqual([]);
  });

  it('coerces bad types and falls back to safe defaults', () => {
    const [r] = normalizeRecipes(
      [{ ...base, estimatedTime: '30 min', servings: 'x', difficulty: 'experto', dietaryTags: ['vegano', 'keto'] }],
      ['pollo']
    );
    expect(r.estimatedTime).toBe(30);
    expect(r.servings).toBe(2);
    expect(r.difficulty).toBe('medio');
    expect(r.dietaryTags).toEqual(['vegano', 'vegetariano']);
  });

  it('sorts by matchPercentage descending', () => {
    const recipes = normalizeRecipes(
      { recipes: [{ ...base, name: 'A', missingIngredients: ['x', 'y', 'z'] }, { ...base, name: 'B', missingIngredients: [] }] },
      ['pollo', 'arroz']
    );
    expect(recipes.map((r) => r.name)).toEqual(['B', 'A']);
  });

  it('returns an empty list for malformed output', () => {
    expect(normalizeRecipes(null, ['pollo'])).toEqual([]);
    expect(normalizeRecipes({ foo: 1 }, ['pollo'])).toEqual([]);
  });
});

describe('normalizeDetail', () => {
  it('renumbers steps and drops empty ones', () => {
    const d = normalizeDetail({
      steps: [{ stepNumber: 5, instruction: 'Cortar', duration: '5' }, { instruction: '' }, { instruction: 'Cocinar', duration: null }],
      tips: 'Tip',
      calories: '420',
    });
    expect(d.steps).toEqual([
      { stepNumber: 1, instruction: 'Cortar', duration: 5 },
      { stepNumber: 2, instruction: 'Cocinar', duration: null },
    ]);
    expect(d.calories).toBe(420);
  });
});
