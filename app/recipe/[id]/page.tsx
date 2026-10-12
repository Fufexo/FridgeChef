'use client';

import { use, useEffect, useState } from 'react';
import RecipeDetailComponent from '@/components/recipes/RecipeDetail';
import { RecipeDetail } from '@/types';
import { useStore } from '@/lib/store';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import PageShell from '@/components/layout/PageShell';


export default function RecipeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const hasHydrated = useStore((s) => s.hasHydrated);
  const base = useStore((s) => s.recipes.find((r) => r.id === id));
  const selectedIngredients = useStore((s) => s.selectedIngredients);
  const [recipe, setRecipe] = useState<RecipeDetail | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!base) return;
    let cancelled = false;

    async function load(recipeBase: NonNullable<typeof base>) {
      try {
        const cacheKey = `fc-detail:${recipeBase.id}`;
        const cached = sessionStorage.getItem(cacheKey);
        if (cached) {
          if (!cancelled) setRecipe(JSON.parse(cached));
          return;
        }

        const res = await fetch('/api/recipe-detail', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            recipeName: recipeBase.name,
            userIngredients: selectedIngredients.map((i) => i.name),
            recipeBase,
          }),
        });
        if (!res.ok) throw new Error(`Error ${res.status}`);
        const data = await res.json();
        sessionStorage.setItem(cacheKey, JSON.stringify(data));
        if (!cancelled) setRecipe(data);
      } catch {
        if (!cancelled) setFailed(true);
      }
    }
    load(base);
    return () => { cancelled = true; };
    // Only refetch when the recipe itself changes, not on ingredient edits
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [base?.id]);

  const loading = !hasHydrated || (!!base && !recipe && !failed);
  const error = hasHydrated && (!base || failed);

  if (loading) {
    return (
      <PageShell activeTab="recipes" backHref="/">
        <div className="max-w-2xl mx-auto py-4">
          <p className="text-on-surface-variant text-sm mb-4">Cargando receta...</p>
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-surface-container rounded-full w-1/2" />
            <div className="h-4 bg-surface-container rounded-full w-1/3" />
            <div className="h-32 bg-surface-container rounded-2xl" />
            <div className="h-48 bg-surface-container rounded-2xl" />
          </div>
        </div>
      </PageShell>
    );
  }

  if (error || !recipe) {
    return (
      <PageShell activeTab="recipes" backHref="/">
        <div className="max-w-2xl mx-auto py-4 text-center">
          <p className="text-on-surface-variant mb-4">No se pudo cargar la receta.</p>
          <Link href="/" className="inline-flex items-center gap-2 text-primary hover:underline text-sm">
            <ArrowLeft size={14} /> Volver al inicio
          </Link>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell activeTab="recipes" backHref="/">
      <RecipeDetailComponent recipe={recipe} />
    </PageShell>
  );
}
