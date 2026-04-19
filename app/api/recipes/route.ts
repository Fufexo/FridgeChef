import { NextRequest } from 'next/server';
import { getRecipeSuggestions } from '@/lib/gemini';
import { resolveRecipeImageUrl } from '@/lib/recipe-images';
import { RecipeSuggestion } from '@/types';

// In-memory cache — persists for the lifetime of the server process
const cache = new Map<string, RecipeSuggestion[]>();
const CACHE_VERSION = 'v5';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const ingredients: string[] = body.ingredients ?? [];
    const exclude: string[] = body.exclude ?? [];

    if (!ingredients.length) {
      return Response.json({ error: 'No ingredients provided' }, { status: 400 });
    }

    const cacheKey = `${CACHE_VERSION}:` + [...ingredients].sort().join(',') + '|x:' + [...exclude].sort().join(',');
    if (cache.has(cacheKey)) {
      return Response.json({ recipes: cache.get(cacheKey), cached: true });
    }

    const raw = await getRecipeSuggestions(ingredients, exclude);

    const usedImageUrls = new Set<string>();
    const recipes: RecipeSuggestion[] = [];

    for (const r of raw as Omit<RecipeSuggestion, 'id'>[]) {
      const imageUrl = await resolveRecipeImageUrl(r, { usedUrls: usedImageUrls });
      if (imageUrl) usedImageUrls.add(imageUrl);

      recipes.push({
        ...r,
        id: crypto.randomUUID(),
        imageUrl,
      });
    }

    cache.set(cacheKey, recipes);
    return Response.json({ recipes });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    console.error('[/api/recipes]', msg);
    return Response.json({ error: msg }, { status: 500 });
  }
}
