'use client';

import { useState } from 'react';
import { ShoppingBag, X } from 'lucide-react';
import type { ShoppingItem } from '@/types';
import { useStore } from '@/lib/store';
import { CUSTOM_SHOPPING_GROUP } from '@/lib/constants';
import { getIngredientEmoji } from '@/lib/ingredient-utils';

/** Card to add free-form items that don't belong to any recipe. */
export default function CustomItemsCard({ items }: { items: ShoppingItem[] }) {
  const addToShoppingList = useStore((s) => s.addToShoppingList);
  const removeFromShoppingList = useStore((s) => s.removeFromShoppingList);
  const [input, setInput] = useState('');

  function handleAdd() {
    const name = input.trim();
    if (!name) return;
    addToShoppingList([{ name, emoji: getIngredientEmoji(name), forRecipe: CUSTOM_SHOPPING_GROUP }]);
    setInput('');
  }

  return (
    <article className="bg-primary-container/35 border border-primary/10 rounded-[28px] p-5 flex flex-col min-h-72">
      <div className="w-11 h-11 rounded-2xl bg-primary text-on-primary flex items-center justify-center mb-3 mx-auto">
        <ShoppingBag size={18} />
      </div>
      <p className="font-bold text-primary text-xl mb-1 text-center">¿Necesitas más?</p>
      <p className="text-xs text-on-surface-variant mb-4 text-center">Agrega productos personalizados a tu lista.</p>

      <div className="rounded-2xl bg-surface-container-lowest/80 border border-black/5 p-3 space-y-3">
        <p className="text-[11px] uppercase tracking-wider text-on-surface-variant font-bold">Lista personalizada</p>

        <div className="space-y-2 max-h-28 overflow-y-auto no-scrollbar">
          {items.length === 0 && <p className="text-xs text-on-surface-variant">Sin items aún.</p>}
          {items.map((item) => (
            <div key={item.name} className="flex items-center gap-2 text-sm">
              <span>{item.emoji}</span>
              <span className="font-medium capitalize text-on-surface flex-1">{item.name}</span>
              <button
                type="button"
                onClick={() => removeFromShoppingList(item.name)}
                className="w-6 h-6 inline-flex items-center justify-center rounded-full text-on-surface-variant hover:text-error hover:bg-error-container/20 transition-colors"
                aria-label={`Eliminar: ${item.name}`}
              >
                <X size={13} />
              </button>
            </div>
          ))}
        </div>

        <form
          onSubmit={(e) => { e.preventDefault(); handleAdd(); }}
          className="grid grid-cols-[minmax(0,1fr)_auto] gap-2 items-center"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ej: pan integral, yogur, limón..."
            aria-label="Producto personalizado"
            maxLength={60}
            className="min-w-0 rounded-xl border border-outline-variant/35 bg-white px-3 py-2 text-sm outline-none focus:border-primary"
          />
          <button
            type="submit"
            className="shrink-0 inline-flex items-center gap-1 whitespace-nowrap bg-primary text-on-primary px-3.5 py-2 rounded-xl text-xs font-bold hover:brightness-105 transition-all"
          >
            Agregar
          </button>
        </form>
      </div>
    </article>
  );
}
