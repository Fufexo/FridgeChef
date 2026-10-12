import { NextRequest } from 'next/server';
import { getRecipeSuggestions } from '@/lib/ai';
import { normalizeRecipes } from '@/lib/recipe-normalize';
import { resolveRecipeImageUrl } from '@/lib/recipe-images';
import { RecipeSuggestion } from '@/types';
import { buildRecipesCacheKey } from '@/lib/utils';
import { boundedSet, isRateLimited, publicErrorMessage, sanitizeList } from '@/lib/api-guard';

// In-memory cache — persists for the lifetime of the server process
const cache = new Map<string, RecipeSuggestion[]>();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const ingredients = sanitizeList(body.ingredients);
    const exclude = sanitizeList(body.exclude, 40);

    if (!ingredients.length) {
      return Response.json({ error: 'No ingredients provided' }, { status: 400 });
    }

    // Same versioned key as the client cache, so bumping the version invalidates both
    const cacheKey = buildRecipesCacheKey(ingredients, exclude);
    if (cache.has(cacheKey)) {
      return Response.json({ recipes: cache.get(cacheKey), cached: true });
    }

    if (isRateLimited(request)) {
      return Response.json({ error: 'quota' }, { status: 429 });
    }

    const raw = await getRecipeSuggestions(ingredients, exclude);
    const suggestions = normalizeRecipes(raw, ingredients);
    if (!suggestions.length) {
      return Response.json({ error: 'La IA no devolvió recetas válidas. Intenta de nuevo.' }, { status: 502 });
    }

    // Resolve all images in parallel, then re-resolve only the ones that collided
    const imageUrls = await Promise.all(suggestions.map((r) => resolveRecipeImageUrl(r)));
    const usedImageUrls = new Set<string>();
    for (let i = 0; i < imageUrls.length; i++) {
      const url = imageUrls[i];
      if (url && usedImageUrls.has(url)) {
        imageUrls[i] = await resolveRecipeImageUrl(suggestions[i], { usedUrls: usedImageUrls });
      }
      if (imageUrls[i]) usedImageUrls.add(imageUrls[i]!);
    }

    const recipes: RecipeSuggestion[] = suggestions.map((r, i) => ({
      ...r,
      id: crypto.randomUUID(),
      imageUrl: imageUrls[i],
    }));

    boundedSet(cache, cacheKey, recipes);
    return Response.json({ recipes });
  } catch (err) {
    console.error('[/api/recipes]', err);
    const error = publicErrorMessage(err);
    return Response.json({ error }, { status: error === 'quota' ? 429 : 500 });
  }
}
