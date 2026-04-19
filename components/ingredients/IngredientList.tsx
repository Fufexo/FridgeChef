'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import IngredientChip from './IngredientChip';
import { useStore } from '@/lib/store';

const MAX_VISIBLE = 3;

export default function IngredientList() {
  const { selectedIngredients, removeIngredient, clearIngredients } = useStore();
  const [expanded, setExpanded] = useState(false);

  if (selectedIngredients.length === 0) return null;

  const hidden = selectedIngredients.length - MAX_VISIBLE;
  const visible = expanded || hidden <= 0
    ? selectedIngredients
    : selectedIngredients.slice(0, MAX_VISIBLE);

  return (
    <div className="mt-1">
      <div className="flex flex-wrap gap-2.5 items-center">
        <AnimatePresence mode="popLayout">
          {visible.map((ingredient) => (
            <IngredientChip
              key={ingredient.id}
              ingredient={ingredient}
              onRemove={removeIngredient}
            />
          ))}
        </AnimatePresence>

        <AnimatePresence>
          {hidden > 0 && (
            <motion.button
              key={expanded ? 'less-pill' : 'more-pill'}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.15 } }}
              onClick={() => setExpanded((v) => !v)}
              className={`inline-flex items-center gap-1 bg-on-surface/8 border border-on-surface/12 text-on-surface-variant pl-3 pr-3.5 py-1.5 rounded-full text-[11px] md:text-xs font-semibold transition-colors select-none ${
                expanded
                  ? 'hover:bg-surface-variant hover:text-on-surface'
                  : 'hover:bg-primary-container/60 hover:text-on-primary-container hover:border-primary/20'
              }`}
            >
              {expanded ? 'Ver menos' : <><span className="text-[13px] leading-none">+</span>{hidden} más</>}
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {selectedIngredients.length > 1 && (
        <button
          onClick={clearIngredients}
          className="mt-2 text-xs text-on-surface-variant/70 hover:text-on-surface transition-colors"
        >
          Limpiar todo
        </button>
      )}
    </div>
  );
}
