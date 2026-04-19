'use client';

import { useMemo, useState, useRef } from 'react';
import { Search } from 'lucide-react';
import { INGREDIENTS_DATA } from '@/lib/ingredients-data';
import { useStore } from '@/lib/store';
import { Ingredient } from '@/types';
import { normalizeText } from '@/lib/utils';
import { useClickOutside } from '@/lib/hooks/useClickOutside';

export default function IngredientInput() {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const { addIngredient, selectedIngredients } = useStore();
  const containerRef = useRef<HTMLDivElement>(null);

  const suggestions = useMemo(() => {
    const q = query.trim();
    if (!q) return [];
    const normalizedQuery = normalizeText(q);
    const selectedIds = new Set(selectedIngredients.map((s) => s.id));
    return INGREDIENTS_DATA.filter(
      (i) => normalizeText(i.name).includes(normalizedQuery) && !selectedIds.has(i.id)
    ).slice(0, 8);
  }, [query, selectedIngredients]);

  function handleSelect(ingredient: Ingredient) {
    addIngredient(ingredient);
    setQuery('');
    setOpen(false);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && suggestions.length > 0) handleSelect(suggestions[0]);
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
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Añade pollo, tomate, cebolla..."
          className="flex-1 min-w-0 bg-transparent border-none outline-none text-sm md:text-base text-on-surface placeholder:text-on-surface-variant/55"
        />
      </div>

      <button
        onClick={() => suggestions.length > 0 && handleSelect(suggestions[0])}
        className="w-full md:w-auto shrink-0 h-10 px-5 rounded-full bg-linear-to-br from-primary to-primary-container text-on-primary text-sm font-semibold shadow-[0_10px_16px_rgba(23,106,33,0.24)] hover:brightness-110 transition-[filter] whitespace-nowrap"
      >
        Buscar recetas
      </button>

      {open && suggestions.length > 0 && (
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
        </ul>
      )}
    </div>
  );
}
