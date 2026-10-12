import { NextRequest } from 'next/server';
import { getRecipeDetail } from '@/lib/ai';
import { normalizeDetail } from '@/lib/recipe-normalize';
import { boundedSet, isRateLimited, publicErrorMessage, sanitizeList } from '@/lib/api-guard';

type DetailCache = ReturnType<typeof normalizeDetail>;
const cache = new Map<string, DetailCache>();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { userIngredients, recipeBase } = body;
    const recipeName = typeof body.recipeName === 'string' ? body.recipeName.trim().slice(0, 120) : '';

    if (!recipeName) {
      return Response.json({ error: 'recipeName is required' }, { status: 400 });
    }

    // Use the card's own ingredient lists so the steps match what the user saw
    const available = sanitizeList(recipeBase?.availableIngredients ?? userIngredients);
    const missing = sanitizeList(recipeBase?.missingIngredients);
    const cacheKey = `${recipeName}|${[...available].sort().join(',')}|${[...missing].sort().join(',')}`;

    const cached = cache.get(cacheKey);
    if (cached) {
      return Response.json({ ...recipeBase, ...cached });
    }

    if (isRateLimited(request)) {
      return Response.json({ error: 'quota' }, { status: 429 });
    }

    const servings = Number.isInteger(recipeBase?.servings) ? recipeBase.servings : undefined;
    const detail = normalizeDetail(await getRecipeDetail(recipeName, available, missing, servings));
    if (!detail.steps.length) {
      return Response.json({ error: 'La IA no devolvió pasos válidos' }, { status: 502 });
    }
    boundedSet(cache, cacheKey, detail);

    return Response.json({ ...recipeBase, ...detail });
  } catch (err) {
    console.error('[/api/recipe-detail]', err);
    const error = publicErrorMessage(err);
    return Response.json({ error }, { status: error === 'quota' ? 429 : 500 });
  }
}
