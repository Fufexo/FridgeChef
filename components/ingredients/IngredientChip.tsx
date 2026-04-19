'use client';

import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { Ingredient } from '@/types';

interface Props {
  ingredient: Ingredient;
  onRemove: (id: string) => void;
}

export default function IngredientChip({ ingredient, onRemove }: Props) {
  return (
    <motion.span
      layout
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.15 } }}
      className="inline-flex items-center gap-2.5 bg-primary-container/80 border border-primary/15 text-on-primary-container pl-3.5 pr-2 py-1.5 rounded-full text-[11px] md:text-xs font-semibold select-none"
    >
      <span className="text-[13px]">{ingredient.emoji}</span>
      <span className="capitalize">{ingredient.name}</span>
      <button
        onClick={() => onRemove(ingredient.id)}
        className="ml-0.5 hover:bg-on-primary-container/10 rounded-full p-0.5 transition-colors"
        aria-label={`Eliminar ${ingredient.name}`}
      >
        <X size={12} />
      </button>
    </motion.span>
  );
}
