import type { RecipeSuggestion, RecipeStep } from '@/types';
import { castInt, normalizeText, uniqueBy } from '@/lib/utils';

// Basics everyone is assumed to have — never counted as missing.
const PANTRY_STAPLES = new Set(
  ['sal', 'pimienta', 'pimienta negra', 'agua', 'aceite', 'aceite de oliva', 'aceite vegetal']
    .map(normalizeText)
);

const DIFFICULTIES = ['fácil', 'medio', 'difícil'] as const;
const DIETARY_TAGS = ['vegetariano', 'vegano', 'sin gluten', 'sin lácteos'];

const STOP_WORDS = new Set(['de', 'del', 'la', 'el', 'los', 'las', 'en', 'con', 'y', 'al']);

function words(value: string): string[] {
  return normalizeText(value).split(/[^a-z]+/).filter((w) => w.length > 1 && !STOP_WORDS.has(w));
}

// Singular/plural tolerant comparison ("huevo" ~ "huevos", "limón" ~ "limones").
function sameWord(a: string, b: string): boolean {
  return a === b || a + 's' === b || b + 's' === a || a + 'es' === b || b + 'es' === a;
}

function containsAllWords(haystack: string[], needle: string[]): boolean {
  return needle.length > 0 && needle.every((n) => haystack.some((h) => sameWord(h, n)));
}

/**
 * Returns the user's own ingredient name that `name` refers to, or null.
 * - loose: word containment ("pechuga de pollo" → "pollo"). Only safe when the model
 *   already claims the user has it, because "leche de coco" also contains "leche".
 * - strict: same words, tolerant of plurals ("huevos" → "huevo").
 */
function findUserIngredient(name: string, userIngredients: string[], loose: boolean): string | null {
  const nameWords = words(name);
  for (const user of userIngredients) {
    const userWords = words(user);
    const sameWords = containsAllWords(nameWords, userWords) && containsAllWords(userWords, nameWords);
    const related = containsAllWords(nameWords, userWords) || containsAllWords(userWords, nameWords);
    if (loose ? related : sameWords) return user;
  }
  return null;
}

function stringList(v: unknown): string[] {
  return Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string' && x.trim() !== '').map((x) => x.trim()) : [];
}

function dedupe(list: string[]): string[] {
  return uniqueBy(list, normalizeText);
}

/**
 * Turns raw model output into trustworthy suggestions: ingredient lists are
 * reconciled against what the user actually has and matchPercentage is
 * computed here instead of trusting the model's estimate.
 */
export function normalizeRecipes(raw: unknown, userIngredients: string[]): Omit<RecipeSuggestion, 'id'>[] {
  const list = Array.isArray(raw) ? raw : (raw as { recipes?: unknown })?.recipes;
  if (!Array.isArray(list)) return [];

  const recipes: Omit<RecipeSuggestion, 'id'>[] = [];
  for (const item of list) {
    if (!item || typeof item !== 'object') continue;
    const r = item as Record<string, unknown>;
    const name = typeof r.name === 'string' ? r.name.trim() : '';
    if (!name) continue;

    const available: string[] = [];
    const missing: string[] = [];

    for (const ing of stringList(r.availableIngredients)) {
      const owned = findUserIngredient(ing, userIngredients, true);
      // Drop ingredients the model claims the user has but they never entered
      if (owned) available.push(owned);
    }
    for (const ing of stringList(r.missingIngredients)) {
      if (PANTRY_STAPLES.has(normalizeText(ing))) continue;
      // A missing "leche de coco" is not the user's "leche" — only exact names move over
      const owned = findUserIngredient(ing, userIngredients, false);
      if (owned) available.push(owned);
      else missing.push(ing);
    }

    const availableIngredients = dedupe(available);
    const missingIngredients = dedupe(missing);
    // A recipe that uses nothing from the fridge is not a match at all
    if (availableIngredients.length === 0) continue;

    const total = availableIngredients.length + missingIngredients.length;
    const difficulty = DIFFICULTIES.find((d) => d === r.difficulty) ?? 'medio';
    const dietaryTags = stringList(r.dietaryTags).filter((t) => DIETARY_TAGS.includes(t));
    if (dietaryTags.includes('vegano') && !dietaryTags.includes('vegetariano')) dietaryTags.push('vegetariano');

    recipes.push({
      name,
      matchPercentage: Math.round((availableIngredients.length / total) * 100),
      availableIngredients,
      missingIngredients,
      estimatedTime: castInt(r.estimatedTime) || 30,
      difficulty,
      dietaryTags,
      servings: castInt(r.servings) || 2,
      imageQuery: typeof r.imageQuery === 'string' ? r.imageQuery : undefined,
    });
  }

  return recipes.sort((a, b) => b.matchPercentage - a.matchPercentage);
}

export function normalizeDetail(raw: unknown): { steps: RecipeStep[]; tips: string; calories: number | null } {
  const r = (raw ?? {}) as Record<string, unknown>;
  const steps = (Array.isArray(r.steps) ? r.steps : [])
    .map((s) => s as Record<string, unknown>)
    .filter((s) => typeof s?.instruction === 'string' && s.instruction.trim() !== '')
    .map((s, i) => ({
      stepNumber: i + 1,
      instruction: String(s.instruction).trim(),
      duration: s.duration == null ? null : castInt(s.duration) || null,
    }));
  return {
    steps,
    tips: typeof r.tips === 'string' ? r.tips : '',
    calories: r.calories == null ? null : castInt(r.calories) || null,
  };
}
