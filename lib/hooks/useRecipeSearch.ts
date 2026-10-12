'use client';

import { useEffect, useMemo, useState } from 'react';
import { useShallow } from 'zustand/react/shallow';
import type { RecipeSuggestion } from '@/types';
import { useStore } from '@/lib/store';
import { buildRecipesCacheKey } from '@/lib/utils';

const DEBOUNCE_MS = 600;

function friendlyError(raw: string): string {
  return raw.includes('quota') || raw.includes('429')
    ? 'Se alcanzó el límite de la API. Espera unos minutos o recarga la página.'
    : raw;
}

async function fetchRecipes(ingredients: string[], exclude: string[] = [], signal?: AbortSignal) {
  const res = await fetch('/api/recipes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ingredients, exclude }),
    signal,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(friendlyError(err.error ?? `Error ${res.status}`));
  }
  const data = await res.json();
  return (data.recipes ?? []) as RecipeSuggestion[];
}

/** Session cache first, network second; results are cached per ingredient set. */
async function cachedFetch(key: string, ingredients: string[], exclude: string[], signal?: AbortSignal) {
  const cached = sessionStorage.getItem(key);
  if (cached) return JSON.parse(cached) as RecipeSuggestion[];
  const fetched = await fetchRecipes(ingredients, exclude, signal);
  sessionStorage.setItem(key, JSON.stringify(fetched));
  return fetched;
}

/**
 * Fetches recipe suggestions whenever the selected ingredients change (debounced),
 * reuses results persisted for the same ingredient set, and supports "load more".
 */
export function useRecipeSearch() {
  const { hasHydrated, selectedIngredients, setRecipes, appendRecipes, setIsLoading, setIsLoadingMore } =
    useStore(useShallow((s) => ({
      hasHydrated: s.hasHydrated,
      selectedIngredients: s.selectedIngredients,
      setRecipes: s.setRecipes,
      appendRecipes: s.appendRecipes,
      setIsLoading: s.setIsLoading,
      setIsLoadingMore: s.setIsLoadingMore,
    })));
  const [error, setError] = useState<string | null>(null);
  const [loadMoreError, setLoadMoreError] = useState<string | null>(null);

  const names = useMemo(() => selectedIngredients.map((i) => i.name), [selectedIngredients]);
  const cacheKey = names.length ? buildRecipesCacheKey(names) : null;

  useEffect(() => {
    // Empty state is handled by the store (removing the last ingredient clears results)
    if (!hasHydrated || !cacheKey) return;
    // Results already in the store for this exact ingredient set (restored or returned to)
    if (cacheKey === useStore.getState().recipesFor) {
      setIsLoading(false);
      return;
    }

    const controller = new AbortController();
    setIsLoading(true);

    const timer = setTimeout(async () => {
      setError(null);
      setLoadMoreError(null);
      try {
        const fetched = await cachedFetch(cacheKey, names, [], controller.signal);
        if (!controller.signal.aborted) setRecipes(fetched, cacheKey);
      } catch (err) {
        if (controller.signal.aborted) return;
        setError(err instanceof Error ? err.message : 'Error al conectar con la IA');
        setRecipes([]);
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    }, DEBOUNCE_MS);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [hasHydrated, cacheKey, names, setRecipes, setIsLoading]);

  async function loadMore() {
    if (!cacheKey) return;
    setIsLoadingMore(true);
    setLoadMoreError(null);
    try {
      const exclude = useStore.getState().recipes.map((r) => r.name);
      const more = await cachedFetch(buildRecipesCacheKey(names, exclude), names, exclude);
      // Ingredients changed while loading — these results belong to the old search
      if (useStore.getState().recipesFor === cacheKey) appendRecipes(more);
    } catch (err) {
      setLoadMoreError(err instanceof Error ? err.message : 'No se pudieron cargar más recetas');
    } finally {
      setIsLoadingMore(false);
    }
  }

  return { error: names.length ? error : null, loadMoreError, loadMore };
}
