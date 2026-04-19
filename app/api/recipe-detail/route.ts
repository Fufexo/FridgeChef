import { NextRequest } from 'next/server';
import { getRecipeDetail } from '@/lib/gemini';
import type { RecipeStep } from '@/types';

type DetailCache = { steps: RecipeStep[]; tips: string; calories?: number | null };
const cache = new Map<string, DetailCache>();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { recipeName, userIngredients, recipeBase } = body;

    if (!recipeName) {
      return Response.json({ error: 'recipeName is required' }, { status: 400 });
    }

    const cached = cache.get(recipeName);
    if (cached) {
      return Response.json({ ...recipeBase, ...cached });
    }

    const detail = await getRecipeDetail(recipeName, userIngredients ?? []) as DetailCache;
    cache.set(recipeName, detail);

    return Response.json({ ...recipeBase, ...detail });
  } catch (err) {
    console.error('[/api/recipe-detail]', err);
    return Response.json({ error: 'Failed to fetch recipe detail' }, { status: 500 });
  }
}
