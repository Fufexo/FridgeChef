'use client';

import { useMemo, useState, useRef } from 'react';
import { Plus, Search } from 'lucide-react';
import { INGREDIENTS_DATA } from '@/lib/ingredients-data';
import { useShallow } from 'zustand/react/shallow';
import { useStore } from '@/lib/store';
import { Ingredient } from '@/types';
import { normalizeText } from '@/lib/utils';
import { useClickOutside } from '@/lib/hooks/useClickOutside';
import { getIngredientEmoji } from '@/lib/ingredient-utils';

const MAX_LENGTH = 40;

/** Free-text ingredient for anything not in the predefined list. */
function customIngredient(name: string): Ingredient {
  const clean = name.trim().toLowerCase();
  return { id: `custom:${normalizeText(clean)}`, name: clean, emoji: getIngredientEmoji(clean) };
}

export default function IngredientInput() {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const { addIngredient, selectedIngredients } = useStore(useShallow((s) => ({ addIngredient: s.addIngredient, selectedIngredients: s.selectedIngredients })));
  const containerRef = useRef<HTMLDivElement>(null);

  const { suggestions, custom } = useMemo(() => {
    const q = query.trim();
    if (!q) return { suggestions: [], custom: null };
    const normalizedQuery = normalizeText(q);
    const selectedNames = new Set(selectedIngredients.map((s) => normalizeText(s.name)));
    const matches = INGREDIENTS_DATA.filter(
      (i) => normalizeText(i.name).includes(normalizedQuery) && !selectedNames.has(normalizeText(i.name))
    ).slice(0, 8);
    const exists = selectedNames.has(normalizedQuery) || matches.some((i) => normalizeText(i.name) === normalizedQuery);
    return { suggestions: matches, custom: exists ? null : customIngredient(q) };
  }, [query, selectedIngredients]);

  // Enter / button: best predefined match first, otherwise the free-text ingredient
  const primary = suggestions[0] ?? custom;

  function handleSelect(ingredient: Ingredient) {
    addIngredient(ingredient);
    setQuery('');
    setOpen(false);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && primary) { e.preventDefault(); handleSelect(primary); }
    if (e.key === 'Escape') { setOpen(false); setQuery(''); }
  }

  useClickOutside(containerRef, () => setOpen(false));

  return (
    <div ref={containerRef} className="relative flex flex-col md:flex-row md:items-center gap-2 px-2 w-full">
      <div className="flex flex-row items-center gap-3 flex-1 min-w-0">
        <div className="w-9 h-9 rounded-xl bg-primary-container/65 flex items-center justify-center shrink-0">
          <Search size={16} className="text-primary" />
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => { setQuery(e.target.value.slice(0, MAX_LENGTH)); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Añade pollo, tomate, cebolla..."
          aria-label="Agregar ingrediente"
          aria-autocomplete="list"
          className="flex-1 min-w-0 bg-transparent border-none outline-none text-sm md:text-base text-on-surface placeholder:text-on-surface-variant/55"
        />
      </div>

      <button
        onClick={() => primary && handleSelect(primary)}
        disabled={!primary}
        className="w-full md:w-auto shrink-0 h-10 px-5 rounded-full bg-linear-to-br from-primary to-primary-container text-on-primary text-sm font-semibold shadow-[0_10px_16px_rgba(23,106,33,0.24)] hover:brightness-110 transition-[filter] whitespace-nowrap disabled:opacity-60"
      >
        Agregar
      </button>

      {open && (suggestions.length > 0 || custom) && (
        <ul className="absolute z-20 top-full left-0 mt-2 w-full bg-surface-container-lowest border border-outline-variant/20 rounded-2xl shadow-xl overflow-hidden">
          {suggestions.map((ingredient) => (
            <li key={ingredient.id}>
              <button
                onMouseDown={(e) => { e.preventDefault(); handleSelect(ingredient); }}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-primary-container/35 text-left transition-colors text-sm"
              >
                <span className="text-xl">{ingredient.emoji}</span>
                <span className="text-on-surface capitalize">{ingredient.name}</span>
              </button>
            </li>
          ))}
          {custom && (
            <li>
              <button
                onMouseDown={(e) => { e.preventDefault(); handleSelect(custom); }}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-primary-container/35 text-left transition-colors text-sm border-t border-outline-variant/15"
              >
                <Plus size={18} className="text-primary" />
                <span className="text-on-surface">Agregar «{custom.name}»</span>
              </button>
            </li>
          )}
        </ul>
      )}
    </div>
  );
}
