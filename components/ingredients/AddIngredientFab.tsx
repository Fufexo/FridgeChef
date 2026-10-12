'use client';

import { Plus } from 'lucide-react';
import { INGREDIENT_INPUT_ID } from './IngredientInput';

/** Floating shortcut that scrolls back to the ingredient input and focuses it. */
export default function AddIngredientFab() {
  function handleClick() {
    const input = document.getElementById(INGREDIENT_INPUT_ID);
    input?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    input?.focus({ preventScroll: true });
  }

  return (
    <button
      onClick={handleClick}
      aria-label="Agregar ingrediente"
      className="fixed bottom-32 right-6 md:bottom-20 md:right-8 w-14 h-14 bg-linear-to-br from-primary to-primary-container text-on-primary rounded-full shadow-[0_16px_32px_rgba(30,58,24,0.25)] flex items-center justify-center z-40 active:scale-95 transition-transform duration-150"
    >
      <Plus size={26} />
    </button>
  );
}
