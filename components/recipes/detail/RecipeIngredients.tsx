'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, ShoppingCart } from 'lucide-react';
import type { RecipeDetail, ShoppingItem } from '@/types';
import { useStore } from '@/lib/store';
import { useFlash } from '@/lib/hooks/useFlash';
import { getIngredientEmoji } from '@/lib/ingredient-utils';

const fadeIn = { initial: { opacity: 0 }, animate: { opacity: 1 } };

function moveItem(name: string, from: string[], to: string[]): [string[], string[]] {
  return [from.filter((item) => item !== name), to.includes(name) ? to : [...to, name]];
}

/** "Lo que tienes" / "Lo que te falta" panels; tapping an ingredient moves it between lists. */
export default function RecipeIngredients({ recipe }: { recipe: RecipeDetail }) {
  const addToShoppingList = useStore((s) => s.addToShoppingList);
  const [added, flashAdded] = useFlash();
  const [available, setAvailable] = useState<string[]>(() => recipe.availableIngredients ?? []);
  const [missing, setMissing] = useState<string[]>(() => recipe.missingIngredients ?? []);

  function markAsMissing(name: string) {
    const [nextAvailable, nextMissing] = moveItem(name, available, missing);
    setAvailable(nextAvailable);
    setMissing(nextMissing);
  }

  function markAsAvailable(name: string) {
    const [nextMissing, nextAvailable] = moveItem(name, missing, available);
    setMissing(nextMissing);
    setAvailable(nextAvailable);
  }

  function handleAddToShopping() {
    const items: ShoppingItem[] = missing.map((name) => ({
      name,
      emoji: getIngredientEmoji(name),
      forRecipe: recipe.name,
    }));
    addToShoppingList(items);
    flashAdded();
  }

  return (
    <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-14">
      <motion.div {...fadeIn} className="md:col-span-2 bg-surface-container-low rounded-3xl p-6">
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-2xl font-bold">Lo que tienes</h2>
          <span className="text-primary font-bold text-xs md:text-sm inline-flex items-center gap-1">
            <CheckCircle2 size={18} fill="currentColor" stroke="white" strokeWidth={1.5} />
            {available.length}/{Math.max(available.length + missing.length, 1)} listo
          </span>
        </div>

        <div className="flex flex-wrap gap-2.5">
          {available.map((name) => (
            <button
              key={name}
              type="button"
              onClick={() => markAsMissing(name)}
              aria-label={`${name}: lo tienes. Tocar para marcar como faltante`}
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
          <h2 className="text-2xl font-bold mb-4">Lo que te falta</h2>
          <ul className="space-y-3">
            {missing.map((name) => (
              <li key={name}>
                <button
                  type="button"
                  onClick={() => markAsAvailable(name)}
                  aria-label={`${name}: falta. Tocar para marcar como disponible`}
                  className="w-full text-left flex items-center gap-3 bg-surface-container-lowest/75 px-4 py-3 rounded-2xl hover:bg-primary-container/30 transition-colors"
                >
                  <span className="text-xl">{getIngredientEmoji(name)}</span>
                  <span className="font-bold text-sm capitalize">{name}</span>
                </button>
              </li>
            ))}
            {missing.length === 0 && (
              <li className="text-sm text-on-surface-variant bg-surface-container-lowest/75 px-4 py-3 rounded-2xl">
                Excelente, ya no falta nada.
              </li>
            )}
          </ul>
          {missing.length > 0 && (
            <p className="text-xs text-on-surface-variant mt-3">¿Ya tienes alguno? Tócalo para marcarlo como disponible.</p>
          )}
        </div>

        {missing.length > 0 && (
          <button
            onClick={handleAddToShopping}
            className={`mt-6 w-full py-3.5 rounded-2xl font-bold text-sm inline-flex items-center justify-center gap-2 min-w-0 overflow-hidden transition-all ${
              added
                ? 'bg-primary-container text-on-primary-container'
                : 'bg-linear-to-r from-primary to-primary-container text-on-primary hover:brightness-105'
            }`}
          >
            <ShoppingCart size={16} className="shrink-0" />
            <span className="truncate">{added ? 'Agregado a la lista' : 'Agregar faltantes a compras'}</span>
          </button>
        )}
      </motion.div>
    </section>
  );
}
