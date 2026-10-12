import { Clock, Users } from 'lucide-react';
import type { RecipeSuggestion } from '@/types';
import { DIFFICULTY_LABEL } from '@/lib/constants';
import { castInt } from '@/lib/utils';

interface Props {
  recipe: Pick<RecipeSuggestion, 'estimatedTime' | 'servings' | 'difficulty'>;
  className?: string;
  /** Hide the difficulty label on very small screens */
  compact?: boolean;
}

export default function RecipeMeta({ recipe, className = '', compact = false }: Props) {
  return (
    <div className={`flex items-center gap-4 font-medium ${className}`}>
      <span className="flex items-center gap-1"><Clock size={14} /> {castInt(recipe.estimatedTime)} min</span>
      <span className="flex items-center gap-1"><Users size={14} /> {recipe.servings} porciones</span>
      <span className={`capitalize ${compact ? 'hidden sm:inline' : ''}`}>
        {DIFFICULTY_LABEL[recipe.difficulty] ?? recipe.difficulty}
      </span>
    </div>
  );
}
