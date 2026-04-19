'use client';
/* eslint-disable @next/next/no-img-element */

import { motion, type Variants } from 'framer-motion';
import { Clock, ImageOff, Users } from 'lucide-react';
import Link from 'next/link';
import { RecipeSuggestion } from '@/types';
import { DIFFICULTY_LABEL } from '@/lib/constants';
import { castInt } from '@/lib/utils';

interface Props {
  recipe: RecipeSuggestion;
  index: number;
  variant: 'hero' | 'square' | 'overlay';
}

function CardPhoto({ photo, alt, overlayClass }: { photo: string | null | undefined; alt: string; overlayClass: string }) {
  if (!photo) {
    return (
      <div className="absolute inset-0 bg-linear-to-br from-surface-container-high via-surface-container to-surface-container-lowest flex items-center justify-center text-center p-6">
        <div className="space-y-3 text-on-surface-variant">
          <ImageOff size={34} className="mx-auto opacity-60" />
          <p className="text-sm font-semibold">Imagen no disponible</p>
        </div>
      </div>
    );
  }
  return (
    <>
      <img src={photo} alt={alt} loading="lazy" className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
      <div className={`absolute inset-0 ${overlayClass}`} />
    </>
  );
}

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.08, duration: 0.35 },
  }),
};


function MatchBadge({ pct }: { pct: number }) {
  const style =
    pct === 100 ? 'bg-primary/90 text-white' :
    pct >= 75   ? 'bg-tertiary/90 text-white' :
    pct >= 50   ? 'bg-secondary/90 text-white' :
                  'bg-error/90 text-white';
  return (
    <span className={`${style} backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-xl`}>
      {pct}% coincidencia
    </span>
  );
}

export default function RecipeCard({ recipe, index, variant }: Props) {
  const photo = recipe.imageUrl;

  if (variant === 'overlay') {
    return (
      <motion.div
        custom={index} variants={cardVariants} initial="hidden" animate="visible"
        className="group relative rounded-3xl overflow-hidden h-64 md:h-72 flex flex-col justify-end"
      >
        <CardPhoto photo={photo} alt={recipe.name} overlayClass="bg-linear-to-t from-black/70 via-black/20 to-transparent" />
        <Link href={`/recipe/${recipe.id}`} className="relative z-10 p-6 space-y-3">
          <div className="flex gap-2 flex-wrap">
            <MatchBadge pct={recipe.matchPercentage} />
            {recipe.estimatedTime <= 20 && (
              <span className="bg-white/20 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-bold uppercase">
                Rápido
              </span>
            )}
          </div>
          <h3 className="text-2xl font-bold text-white tracking-tight leading-tight max-w-[20ch]">
            {recipe.name}
          </h3>
          <div className="flex items-center gap-4 text-white/80 text-sm font-medium">
            <span className="flex items-center gap-1"><Clock size={14} /> {castInt(recipe.estimatedTime)} min</span>
            <span className="flex items-center gap-1"><Users size={14} /> {recipe.servings} porciones</span>
            <span className="capitalize">{DIFFICULTY_LABEL[recipe.difficulty] ?? recipe.difficulty}</span>
          </div>
        </Link>
      </motion.div>
    );
  }

  const aspectClass = variant === 'hero' ? 'aspect-[16/9]' : 'aspect-square';

  return (
    <motion.div
      custom={index} variants={cardVariants} initial="hidden" animate="visible"
      className="group"
    >
      <Link href={`/recipe/${recipe.id}`}>
        <div className={`relative overflow-hidden rounded-3xl ${aspectClass} mb-3`}>
          <CardPhoto photo={photo} alt={recipe.name} overlayClass="bg-linear-to-t from-black/45 via-transparent to-transparent" />
          <div className="absolute top-4 left-4">
            <MatchBadge pct={recipe.matchPercentage} />
          </div>
        </div>

        <div className="flex justify-between items-start gap-3">
          <div>
            <h3 className={`font-bold text-on-surface tracking-tight mb-1 leading-snug group-hover:text-primary transition-colors ${variant === 'hero' ? 'text-[30px]' : 'text-[28px] md:text-[24px]'}`}>
              {recipe.name}
            </h3>
            <div className="flex items-center gap-4 text-on-surface-variant text-xs font-medium">
              <span className="flex items-center gap-1"><Clock size={13} /> {castInt(recipe.estimatedTime)} min</span>
              <span className="flex items-center gap-1"><Users size={14} /> {recipe.servings} porciones</span>
              <span className="capitalize hidden sm:inline">{DIFFICULTY_LABEL[recipe.difficulty] ?? recipe.difficulty}</span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
