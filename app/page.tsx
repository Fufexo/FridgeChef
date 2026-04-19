'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { buildRecipesCacheKey } from '@/lib/utils';
import { AlertCircle, ChevronDown, Loader2, Plus } from 'lucide-react';
import IngredientInput from '@/components/ingredients/IngredientInput';
import IngredientList from '@/components/ingredients/IngredientList';
import FilterBar from '@/components/filters/FilterBar';
import RecipeGrid from '@/components/recipes/RecipeGrid';
import LoadingSkeleton from '@/components/ui/LoadingSkeleton';
import EmptyState from '@/components/ui/EmptyState';
import AppNavigation from '@/components/layout/AppNavigation';
import { useStore } from '@/lib/store';

export default function HomePage() {
  const {
    selectedIngredients, recipes, isLoading, setRecipes, setIsLoading,
    appendRecipes, isLoadingMore, setIsLoadingMore,
    filters,
  } = useStore();
  const [fetchError, setFetchError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const requestIdRef = useRef(0);

  useEffect(() => {
    requestIdRef.current += 1;
    const requestId = requestIdRef.current;

    if (selectedIngredients.length === 0) {
      setRecipes([]);
      setFetchError(null);
      setIsLoading(false);
      return;
    }

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setIsLoading(true);
    setFetchError(null);

    const timer = setTimeout(async () => {
      try {
        const names = selectedIngredients.map((i) => i.name);
        const cacheKey = buildRecipesCacheKey(names);
        const cached = sessionStorage.getItem(cacheKey);
        if (cached) {
          if (requestId !== requestIdRef.current) return;
          setRecipes(JSON.parse(cached));
          setIsLoading(false);
          return;
        }

        const res = await fetch('/api/recipes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ingredients: names }),
          signal: controller.signal,
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          const raw = err.error ?? `Error ${res.status}`;
          const msg = raw.includes('quota') || raw.includes('429')
            ? 'Se alcanzó el límite de la API. Espera unos minutos o recarga la página.'
            : raw;
          throw new Error(msg);
        }

        const data = await res.json();
        const fetched = data.recipes ?? [];
        if (requestId !== requestIdRef.current) return;
        sessionStorage.setItem(cacheKey, JSON.stringify(fetched));
        setRecipes(fetched);
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') return;
        if (requestId !== requestIdRef.current) return;
        setFetchError(err instanceof Error ? err.message : 'Error al conectar con la IA');
        setRecipes([]);
      } finally {
        if (requestId !== requestIdRef.current) return;
        setIsLoading(false);
      }
    }, 600);

    return () => { clearTimeout(timer); };
  }, [selectedIngredients]); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleLoadMore() {
    setIsLoadingMore(true);
    try {
      const ingredients = selectedIngredients.map((i) => i.name);
      const exclude = recipes.map((r) => r.name);
      const cacheKey = buildRecipesCacheKey(ingredients, exclude);
      const cached = sessionStorage.getItem(cacheKey);
      if (cached) { appendRecipes(JSON.parse(cached)); return; }

      const res = await fetch('/api/recipes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ingredients, exclude }),
      });
      if (!res.ok) throw new Error('No se pudieron cargar más recetas');
      const data = await res.json();
      const more = data.recipes ?? [];
      sessionStorage.setItem(cacheKey, JSON.stringify(more));
      appendRecipes(more);
    } catch (err) {
      console.error('[load more]', err);
    } finally {
      setIsLoadingMore(false);
    }
  }

  const filteredRecipes = useMemo(() => {
    return recipes.filter((r) => {
      if (filters.maxTime !== null && r.estimatedTime > filters.maxTime) return false;
      if (filters.difficulty !== null && r.difficulty !== filters.difficulty) return false;
      if (filters.dietaryTag !== null) {
        const tags = r.dietaryTags ?? [];
        const match = filters.dietaryTag === 'vegetariano'
          ? tags.includes('vegetariano') || tags.includes('vegano')
          : tags.includes(filters.dietaryTag);
        if (!match) return false;
      }
      return true;
    });
  }, [recipes, filters]);

  const showEmpty   = !isLoading && selectedIngredients.length === 0;
  const showNoMatch = !isLoading && !fetchError && selectedIngredients.length > 0
                      && filteredRecipes.length === 0 && recipes.length > 0;

  return (
    <div className="min-h-screen bg-surface text-on-surface">
      <AppNavigation activeTab="pantry" />

      <main className="max-w-280 mx-auto px-6 py-8 md:py-10 space-y-9 isolate">

        {/* Hero */}
        <section className="space-y-5">
          <div className="max-w-3xl text-center lg:text-left mx-auto lg:mx-0">
            <h1 className="text-[44px] md:text-[56px] font-extrabold text-on-surface tracking-tight mb-2 leading-[0.96]">
              Qué hay en tu{' '}
              <span className="inline-block bg-linear-to-br from-primary to-primary-container bg-clip-text text-transparent italic px-2 -mx-2 pb-2 -mb-2">
                refrigerador?
              </span>
            </h1>
            <p className="text-on-surface-variant text-[14px] md:text-[15px] font-medium max-w-xl leading-relaxed mx-auto lg:mx-0">
              Convierte ingredientes sueltos en recetas increíbles. Solo escribe lo que tienes.
            </p>
          </div>

          <div className="max-w-2xl mx-auto lg:mx-0 bg-white border border-black/6 rounded-2xl px-3 py-2.5 shadow-[0_10px_30px_rgba(25,33,20,0.08)]">
            <IngredientInput />
          </div>

          {selectedIngredients.length > 0 && <IngredientList />}
        </section>

        <div id="recipes" className="scroll-mt-28" />

        {recipes.length > 0 && !isLoading && (
          <section className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pt-1">
            <FilterBar />
            <p className="text-on-surface-variant font-medium text-xs shrink-0">
              Mostrando <span className="text-primary font-bold">{filteredRecipes.length}</span> recetas según tus ingredientes
            </p>
          </section>
        )}

        {isLoading && <LoadingSkeleton />}

        {showEmpty && <EmptyState />}

        {fetchError && !isLoading && (
          <div className="flex items-start gap-3 bg-error-container/10 border border-error/20 rounded-2xl px-5 py-4 text-sm text-error">
            <AlertCircle size={18} className="shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">No se pudieron obtener recetas</p>
              <p className="opacity-80 mt-0.5">{fetchError}</p>
            </div>
          </div>
        )}

        {showNoMatch && (
          <div className="text-center py-16 text-on-surface-variant text-sm">
            No hay recetas que coincidan con los filtros seleccionados.
          </div>
        )}

        {!isLoading && filteredRecipes.length > 0 && (
          <>
            <RecipeGrid recipes={filteredRecipes} />

            <div className="flex justify-center pt-4">
              <button
                onClick={handleLoadMore}
                disabled={isLoadingMore}
                className="flex items-center gap-2 px-8 py-3 rounded-full border border-outline-variant/30 text-on-surface text-sm font-semibold hover:bg-primary hover:text-on-primary hover:border-primary transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoadingMore ? (
                  <><Loader2 size={16} className="animate-spin" /> Buscando más recetas...</>
                ) : (
                  <><ChevronDown size={16} /> Ver más recetas</>
                )}
              </button>
            </div>
          </>
        )}
      </main>

      <button
        onClick={() => document.querySelector('input')?.focus()}
        className="fixed bottom-32 right-6 md:bottom-20 md:right-8 w-14 h-14 bg-linear-to-br from-primary to-primary-container text-on-primary rounded-full shadow-[0_16px_32px_rgba(30,58,24,0.25)] flex items-center justify-center z-40 active:scale-95 transition-transform duration-150"
      >
        <Plus size={26} />
      </button>
    </div>
  );
}
