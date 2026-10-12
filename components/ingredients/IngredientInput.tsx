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
export const INGREDIENT_INPUT_ID = 'ingredient-input';
const LISTBOX_ID = 'ingredient-suggestions';

/** Free-text ingredient for anything not in the predefined list. */
function customIngredient(name: string): Ingredient {
  const clean = name.trim().toLowerCase();
  return { id: `custom:${normalizeText(clean)}`, name: clean, emoji: getIngredientEmoji(clean) };
}

export default function IngredientInput() {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
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
    // Too short to be a real ingredient: only offer predefined matches
    const offerCustom = !exists && normalizedQuery.length >= 3;
    return { suggestions: matches, custom: offerCustom ? customIngredient(q) : null };
  }, [query, selectedIngredients]);

  // Keyboard/mouse options: predefined matches first, then the free-text ingredient
  const options = useMemo(() => (custom ? [...suggestions, custom] : suggestions), [suggestions, custom]);
  const showList = open && options.length > 0;
  const active = options[Math.min(activeIndex, options.length - 1)];

  function handleSelect(ingredient: Ingredient) {
    addIngredient(ingredient);
    setQuery('');
    setActiveIndex(0);
    setOpen(false);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      if (!options.length) return;
      e.preventDefault();
      setOpen(true);
      const step = e.key === 'ArrowDown' ? 1 : -1;
      setActiveIndex((i) => (Math.min(i, options.length - 1) + step + options.length) % options.length);
    } else if (e.key === 'Enter' && active) {
      e.preventDefault();
      handleSelect(active);
    } else if (e.key === 'Escape') {
      setOpen(false);
      setQuery('');
    }
  }

  useClickOutside(containerRef, () => setOpen(false));

  const optionId = (i: number) => `${LISTBOX_ID}-${i}`;

  return (
    <div ref={containerRef} className="relative flex flex-col md:flex-row md:items-center gap-2 px-2 w-full">
      <div className="flex flex-row items-center gap-3 flex-1 min-w-0">
        <div className="w-9 h-9 rounded-xl bg-primary-container/65 flex items-center justify-center shrink-0" aria-hidden="true">
          <Search size={16} className="text-primary" />
        </div>
        <input
          id={INGREDIENT_INPUT_ID}
          type="text"
          role="combobox"
          value={query}
          onChange={(e) => { setQuery(e.target.value.slice(0, MAX_LENGTH)); setActiveIndex(0); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Añade pollo, tomate, cebolla..."
          aria-label="Agregar ingrediente"
          aria-autocomplete="list"
          aria-expanded={showList}
          aria-controls={LISTBOX_ID}
          aria-activedescendant={showList ? optionId(options.indexOf(active)) : undefined}
          autoComplete="off"
          enterKeyHint="done"
          className="flex-1 min-w-0 bg-transparent border-none outline-none text-base text-on-surface placeholder:text-on-surface-variant/85"
        />
      </div>

      <button
        type="button"
        onClick={() => active && handleSelect(active)}
        disabled={!active}
        className="w-full md:w-auto shrink-0 h-11 px-5 rounded-full bg-linear-to-br from-primary to-primary-container text-on-primary text-sm font-semibold shadow-[0_10px_16px_rgba(23,106,33,0.24)] hover:brightness-110 transition-[filter] whitespace-nowrap disabled:opacity-60"
      >
        Agregar
      </button>

      {showList && (
        <ul
          id={LISTBOX_ID}
          role="listbox"
          aria-label="Sugerencias de ingredientes"
          className="absolute z-20 top-full left-0 mt-2 w-full bg-surface-container-lowest border border-outline-variant/20 rounded-2xl shadow-xl overflow-hidden"
        >
          {options.map((ingredient, i) => {
            const isCustom = ingredient === custom;
            const isActive = ingredient === active;
            return (
              <li
                key={ingredient.id}
                id={optionId(i)}
                role="option"
                aria-selected={isActive}
                onMouseDown={(e) => { e.preventDefault(); handleSelect(ingredient); }}
                onMouseEnter={() => setActiveIndex(i)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors text-sm cursor-pointer ${
                  isActive ? 'bg-primary-container/35' : ''
                } ${isCustom && i > 0 ? 'border-t border-outline-variant/15' : ''}`}
              >
                {isCustom ? (
                  <>
                    <Plus size={18} className="text-primary" aria-hidden="true" />
                    <span className="text-on-surface">Agregar «{ingredient.name}»</span>
                  </>
                ) : (
                  <>
                    <span className="text-xl" aria-hidden="true">{ingredient.emoji}</span>
                    <span className="text-on-surface capitalize">{ingredient.name}</span>
                  </>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
