'use client';

import { useEffect, useState } from 'react';
import RecipeDetailComponent from '@/components/recipes/RecipeDetail';
import { RecipeDetail } from '@/types';
import { useStore } from '@/lib/store';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import AppNavigation from '@/components/layout/AppNavigation';

function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-surface text-on-surface">
      <AppNavigation activeTab="recipes" backHref="/" />
      {children}
    </div>
  );
}

export default function RecipeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const [recipe, setRecipe] = useState<RecipeDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const { recipes, selectedIngredients } = useStore();

  useEffect(() => {
    setLoading(true);
    setError(false);

    async function load() {
      const { id } = await params;
      const base = recipes.find((r) => r.id === id);

      if (!base) {
        setError(true);
        setLoading(false);
        return;
      }

      try {
        const cacheKey = `fc-detail:${base.name}`;
        const cached = sessionStorage.getItem(cacheKey);
        if (cached) {
          setRecipe(JSON.parse(cached));
          setLoading(false);
          return;
        }

        const res = await fetch('/api/recipe-detail', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            recipeName: base.name,
            userIngredients: selectedIngredients.map((i) => i.name),
            recipeBase: base,
          }),
        });
        if (!res.ok) { setError(true); return; }
        const data = await res.json();
        sessionStorage.setItem(cacheKey, JSON.stringify(data));
        setRecipe(data);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return (
      <PageShell>
        <div className="max-w-2xl mx-auto px-4 py-12">
          <p className="text-on-surface-variant text-sm mb-4">Cargando receta...</p>
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-gray-200 rounded-full w-1/2" />
            <div className="h-4 bg-gray-200 rounded-full w-1/3" />
            <div className="h-32 bg-gray-200 rounded-2xl" />
            <div className="h-48 bg-gray-200 rounded-2xl" />
          </div>
        </div>
      </PageShell>
    );
  }

  if (error || !recipe) {
    return (
      <PageShell>
        <div className="max-w-2xl mx-auto px-4 py-12 text-center">
          <p className="text-gray-500 mb-4">No se pudo cargar la receta.</p>
          <Link href="/" className="inline-flex items-center gap-2 text-primary hover:underline text-sm">
            <ArrowLeft size={14} /> Volver al inicio
          </Link>
        </div>
      </PageShell>
    );
  }

  return <RecipeDetailComponent recipe={recipe} />;
}
