import type { Metadata } from 'next';
import PageShell from '@/components/layout/PageShell';
import IngredientInput from '@/components/ingredients/IngredientInput';
import IngredientList from '@/components/ingredients/IngredientList';
import AddIngredientFab from '@/components/ingredients/AddIngredientFab';
import RecipeResults from '@/components/recipes/RecipeResults';
import { SITE } from '@/lib/site';

export const metadata: Metadata = {
  alternates: { canonical: '/' },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: SITE.name,
  url: SITE.url,
  description: SITE.description,
  applicationCategory: 'LifestyleApplication',
  operatingSystem: 'Web',
  inLanguage: 'es',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
};

// Server component: the hero is static HTML; only the interactive pieces are client components.
export default function HomePage() {
  return (
    <PageShell activeTab="pantry" className="space-y-9 isolate">
      <script
        type="application/ld+json"
        // Escape "<" so the payload can never close the script tag
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
      />
      <section className="space-y-5">
        <div className="max-w-3xl text-center lg:text-left mx-auto lg:mx-0">
          <h1 className="text-[44px] md:text-[56px] font-extrabold text-on-surface tracking-tight mb-2 leading-[0.96]">
            ¿Qué hay en tu{' '}
            <span className="inline-block bg-linear-to-br from-primary to-primary-container bg-clip-text text-transparent italic px-2 -mx-2 pb-2 -mb-2">
              refrigerador?
            </span>
          </h1>
          <p className="text-on-surface-variant text-[14px] md:text-[15px] font-medium max-w-xl leading-relaxed mx-auto lg:mx-0">
            Convierte ingredientes sueltos en recetas increíbles. Solo escribe lo que tienes.
          </p>
        </div>

        <div className="max-w-2xl mx-auto lg:mx-0 bg-white border border-black/6 rounded-2xl px-3 py-2.5 shadow-[0_10px_30px_rgba(25,33,20,0.08)] focus-within:ring-2 focus-within:ring-primary/60 transition-shadow">
          <IngredientInput />
        </div>

        <IngredientList />
      </section>

      <RecipeResults />

      <AddIngredientFab />
    </PageShell>
  );
}
