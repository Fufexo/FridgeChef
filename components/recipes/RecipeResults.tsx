'use client';

import { useMemo } from 'react';
import { AlertCircle, ChevronDown, Loader2 } from 'lucide-react';
import { useShallow } from 'zustand/react/shallow';
import { useStore } from '@/lib/store';
import { useRecipeSearch } from '@/lib/hooks/useRecipeSearch';
import { filterRecipes } from '@/lib/filter-recipes';
import FilterBar from '@/components/filters/FilterBar';
import LoadingSkeleton from '@/components/ui/LoadingSkeleton';
import EmptyState from '@/components/ui/EmptyState';
import RecipeGrid from './RecipeGrid';

/** Everything below the ingredient input: filters, loading, errors, grid and "load more". */
export default function RecipeResults() {
  const { hasHydrated, hasIngredients, recipes, isLoading, isLoadingMore, filters } = useStore(useShallow((s) => ({
    hasHydrated: s.hasHydrated,
    hasIngredients: s.selectedIngredients.length > 0,
    recipes: s.recipes,
    isLoading: s.isLoading,
    isLoadingMore: s.isLoadingMore,
    filters: s.filters,
  })));
  const { error, loadMoreError, loadMore } = useRecipeSearch();

  const filteredRecipes = useMemo(() => filterRecipes(recipes, filters), [recipes, filters]);

  const showEmpty = hasHydrated && !isLoading && !hasIngredients;
  const showNoMatch = !isLoading && !error && hasIngredients && recipes.length > 0 && filteredRecipes.length === 0;

  return (
    <section id="recipes" aria-label="Recetas sugeridas" aria-busy={isLoading} className="space-y-9 scroll-mt-28">
      {recipes.length > 0 && !isLoading && (
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pt-1">
          <FilterBar />
          <p className="text-on-surface-variant font-medium text-xs shrink-0" aria-live="polite">
            Mostrando <span className="text-primary font-bold">{filteredRecipes.length}</span> de {recipes.length} recetas según tus ingredientes
          </p>
        </div>
      )}

      {isLoading && <LoadingSkeleton />}

      {showEmpty && <EmptyState />}

      {error && !isLoading && (
        <div role="alert" className="flex items-start gap-3 bg-error-container/10 border border-error/20 rounded-2xl px-5 py-4 text-sm text-error">
          <AlertCircle size={18} className="shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">No se pudieron obtener recetas</p>
            <p className="opacity-80 mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {showNoMatch && (
        <p className="text-center py-16 text-on-surface-variant text-sm">
          No hay recetas que coincidan con los filtros seleccionados.
        </p>
      )}

      {!isLoading && filteredRecipes.length > 0 && (
        <>
          <RecipeGrid recipes={filteredRecipes} />

          <div className="flex flex-col items-center gap-2 pt-4">
            <button
              onClick={loadMore}
              disabled={isLoadingMore}
              className="flex items-center gap-2 px-8 py-3 rounded-full border border-outline-variant/30 text-on-surface text-sm font-semibold hover:bg-primary hover:text-on-primary hover:border-primary transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoadingMore ? (
                <><Loader2 size={16} className="animate-spin" /> Buscando más recetas...</>
              ) : (
                <><ChevronDown size={16} /> Ver más recetas</>
              )}
            </button>
            {loadMoreError && <p role="alert" className="text-xs text-error">{loadMoreError}</p>}
          </div>
        </>
      )}
    </section>
  );
}
