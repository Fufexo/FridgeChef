'use client';
/* eslint-disable @next/next/no-img-element */

import { useState } from 'react';
import { useFlash } from '@/lib/hooks/useFlash';
import { motion } from 'framer-motion';
import { Clock, Utensils, ShoppingCart, CheckCircle2, ChefHat, Flame, Star, Award } from 'lucide-react';
import { RecipeDetail as RecipeDetailType, ShoppingItem } from '@/types';
import AppNavigation from '@/components/layout/AppNavigation';
import { useStore } from '@/lib/store';
import { getIngredientEmoji } from '@/lib/ingredient-utils';
import { DIFFICULTY_LABEL } from '@/lib/constants';
import { castInt } from '@/lib/utils';

const fadeUp = { initial: { opacity: 0, y: 14 }, animate: { opacity: 1, y: 0 } };
const fadeIn  = { initial: { opacity: 0 },        animate: { opacity: 1 } };

const t = {
  topRecipe: 'Receta destacada',
  duration: 'Duración',
  difficulty: 'Dificultad',
  servings: 'Porciones',
  people: 'personas',
  whatYouHave: 'Lo que tienes',
  whatYouNeed: 'Lo que te falta',
  ready: 'listo',
  missingHelp: 'Completa estos ingredientes para lograr el mejor resultado.',
  addMissing: 'Agregar faltantes a compras',
  addedOk: 'Agregado a la lista',
  preparation: 'Pasos de preparación',
  chefTip: 'Tip del chef',
  imageFallback: 'Imagen no disponible',
  matchFound: 'Coincidencia',
};

interface StatItemProps {
  label: string;
  children: React.ReactNode;
}

function StatItem({ label, children }: StatItemProps) {
  return (
    <div>
      <p className="text-on-surface-variant text-[11px] uppercase tracking-wider font-bold mb-1.5">{label}</p>
      <p className="flex items-center gap-1.5 font-bold">{children}</p>
    </div>
  );
}

interface Props {
  recipe: RecipeDetailType;
}

export default function RecipeDetail({ recipe }: Props) {
  const { addToShoppingList } = useStore();
  const [added, flashAdded] = useFlash();
  const [availableIngredients, setAvailableIngredients] = useState<string[]>(() => recipe.availableIngredients ?? []);
  const [missingIngredients, setMissingIngredients] = useState<string[]>(() => recipe.missingIngredients ?? []);

  function handleAddToShopping() {
    const items: ShoppingItem[] = missingIngredients.map((name) => ({
      name,
      emoji: getIngredientEmoji(name),
      forRecipe: recipe.name,
    }));
    addToShoppingList(items);
    flashAdded();
  }

  function handleMarkAsAvailable(name: string) {
    setMissingIngredients((prev) => prev.filter((item) => item !== name));
    setAvailableIngredients((prev) => (prev.includes(name) ? prev : [...prev, name]));
  }

  function handleMarkAsMissing(name: string) {
    setAvailableIngredients((prev) => prev.filter((item) => item !== name));
    setMissingIngredients((prev) => (prev.includes(name) ? prev : [...prev, name]));
  }

  return (
    <div className="min-h-screen bg-surface text-on-surface">
      <AppNavigation activeTab="recipes" backHref="/" />

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8 pb-28 md:pb-10">

        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12 items-center mb-12">
        <motion.div {...fadeUp} className="lg:col-span-7">
          <div className="inline-flex items-center gap-2 bg-primary-container/70 text-on-primary-container px-4 py-1.5 rounded-full mb-5 text-xs font-bold uppercase tracking-wider">
            <Star size={13} fill="currentColor" stroke="none" />
            {t.topRecipe}
          </div>

          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-[0.98] mb-6">{recipe.name}</h1>

          <div className="flex flex-wrap gap-5 md:gap-8">
            <StatItem label={t.duration}>
              <Clock size={20} className="text-primary" fill="currentColor" stroke="white" strokeWidth={1.5} /> {castInt(recipe.estimatedTime)} min
            </StatItem>
            <StatItem label={t.difficulty}>
              <Award size={15} className="text-secondary" /> {DIFFICULTY_LABEL[recipe.difficulty] ?? recipe.difficulty}
            </StatItem>
            <StatItem label={t.servings}>
              <Utensils size={15} className="text-primary" strokeWidth={2.8} /> {recipe.servings} {t.people}
            </StatItem>
            {recipe.calories && (
              <StatItem label="Kcal">
                <Flame size={15} className="text-secondary" /> ~{recipe.calories}
              </StatItem>
            )}
          </div>
        </motion.div>

        <motion.div {...fadeUp} className="lg:col-span-5">
          <div className="relative group">
            <div className="absolute -inset-4 bg-primary-container/20 rounded-3xl blur-2xl group-hover:bg-primary-container/30 transition-all" />
            <div className="relative rounded-3xl overflow-hidden shadow-2xl">
              {recipe.imageUrl ? (
                <img
                  src={recipe.imageUrl}
                  alt={recipe.name}
                  className="relative w-full aspect-square object-cover hover:scale-[1.02] transition-transform duration-500"
                />
              ) : (
                <div className="w-full aspect-square flex items-center justify-center text-on-surface-variant font-semibold bg-surface-container-low">
                  {t.imageFallback}
                </div>
              )}
              <div className="absolute top-4 right-4 bg-white/80 backdrop-blur-xl px-3.5 py-2.5 rounded-2xl shadow-[0_8px_24px_rgba(0,0,0,0.18),0_1px_3px_rgba(0,0,0,0.08)] border border-white/60 flex items-center gap-2.5">
                <span className="w-9 h-9 rounded-full bg-linear-to-br from-primary to-primary-container text-on-primary text-xs font-extrabold flex items-center justify-center shadow-[0_4px_10px_rgba(23,106,33,0.4)]">{recipe.matchPercentage}%</span>
                <span className="text-xs font-bold text-on-surface pr-0.5">{t.matchFound}</span>
              </div>
            </div>
          </div>
        </motion.div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-14">
        <motion.div {...fadeIn} className="md:col-span-2 bg-surface-container-low rounded-3xl p-6">
          <div className="flex justify-between items-center mb-5">
            <h2 className="text-2xl font-bold">{t.whatYouHave}</h2>
            <span className="text-primary font-bold text-xs md:text-sm inline-flex items-center gap-1">
              <CheckCircle2 size={18} fill="currentColor" stroke="white" strokeWidth={1.5} />
              {availableIngredients.length}/{Math.max(availableIngredients.length + missingIngredients.length, 1)} {t.ready}
            </span>
          </div>

          <div className="flex flex-wrap gap-2.5">
            {availableIngredients.map((name) => (
              <button
                key={name}
                type="button"
                onClick={() => handleMarkAsMissing(name)}
                className="bg-surface-container-lowest px-4 py-2.5 rounded-2xl flex items-center gap-2 shadow-sm border border-black/5 hover:bg-error-container/15 transition-colors"
              >
                <span className="text-lg">{getIngredientEmoji(name)}</span>
                <span className="font-semibold text-sm capitalize">{name}</span>
              </button>
            ))}
          </div>
        </motion.div>

        <motion.div {...fadeIn} className="bg-secondary-container/25 rounded-3xl p-6 flex flex-col justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-4">{t.whatYouNeed}</h2>
            <ul className="space-y-3">
              {missingIngredients.slice(0, 5).map((name) => (
                <li key={name}>
                  <button
                    type="button"
                    onClick={() => handleMarkAsAvailable(name)}
                    className="w-full text-left flex items-center gap-3 bg-surface-container-lowest/75 px-4 py-3 rounded-2xl hover:bg-primary-container/30 transition-colors"
                  >
                  <span className="text-xl">{getIngredientEmoji(name)}</span>
                  <div>
                    <p className="font-bold text-sm capitalize">{name}</p>
                    <p className="text-xs text-on-surface-variant">{t.missingHelp}</p>
                  </div>
                  </button>
                </li>
              ))}
              {missingIngredients.length === 0 && (
                <li className="text-sm text-on-surface-variant bg-surface-container-lowest/75 px-4 py-3 rounded-2xl">
                  Excelente, ya no falta nada.
                </li>
              )}
            </ul>
          </div>

          {missingIngredients.length > 0 && (
            <button
              onClick={handleAddToShopping}
              className={`mt-6 w-full py-3.5 rounded-2xl font-bold text-sm inline-flex items-center justify-center gap-2 min-w-0 overflow-hidden transition-all ${
                added
                  ? 'bg-primary-container text-on-primary-container'
                  : 'bg-linear-to-r from-primary to-primary-container text-on-primary hover:brightness-105'
              }`}
            >
              <ShoppingCart size={16} className="shrink-0" />
              <span className="truncate">{added ? t.addedOk : t.addMissing}</span>
            </button>
          )}
        </motion.div>
        </section>

        <section className="max-w-4xl mx-auto mb-14">
        <h2 className="text-3xl font-extrabold mb-10 flex items-center gap-3">
          <span className="w-1.5 h-8 bg-primary rounded-full" />
          {t.preparation}
        </h2>

        <ol className="space-y-10">
          {(recipe.steps ?? []).map((step, idx, arr) => (
            <li key={step.stepNumber} className="flex gap-5 relative">
              <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center font-bold z-10">
                {step.stepNumber}
              </div>

              {idx < arr.length - 1 && <div className="absolute left-5 top-10 h-[calc(100%+1.2rem)] w-px bg-surface-container" />}

              <div className="pt-1 flex-1">
                <div className="flex items-center justify-between mb-2 gap-4">
                  <h3 className="text-xl font-bold">{`Paso ${step.stepNumber}`}</h3>
                  {step.duration && (
                    <span className="text-primary font-bold text-xs bg-primary-container/25 px-3 py-1 rounded-full whitespace-nowrap">
                      {step.duration} min
                    </span>
                  )}
                </div>
                <p className="text-on-surface-variant leading-relaxed text-sm md:text-base">{step.instruction}</p>
              </div>
            </li>
          ))}
        </ol>
        </section>

        {recipe.tips && (
          <section className="max-w-4xl mx-auto">
            <div className="bg-primary-container/35 p-6 rounded-3xl border border-primary-container/70 flex gap-4 items-start">
              <div className="w-11 h-11 rounded-2xl bg-primary text-on-primary flex items-center justify-center shrink-0">
                <ChefHat size={18} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-on-primary-container mb-1">{t.chefTip}</h3>
                <p className="text-on-surface text-sm leading-relaxed">{recipe.tips}</p>
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
