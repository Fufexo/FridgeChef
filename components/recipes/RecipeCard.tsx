'use client';
/* eslint-disable @next/next/no-img-element */

import { motion, type Variants } from 'framer-motion';
import { ImageOff } from 'lucide-react';
import Link from 'next/link';
import { RecipeSuggestion } from '@/types';
import type { CardVariant } from '@/lib/utils';
import { responsiveImage } from '@/lib/image-url';
import MatchBadge from './MatchBadge';
import RecipeMeta from './RecipeMeta';

interface Props {
  recipe: RecipeSuggestion;
  index: number;
  variant: CardVariant;
}

interface CardPhotoProps {
  photo: string | null | undefined;
  alt: string;
  overlayClass: string;
  /** Rendered width hint for srcset selection */
  sizes: string;
  priority?: boolean;
}

function CardPhoto({ photo, alt, overlayClass, sizes, priority = false }: CardPhotoProps) {
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
      <img
        {...responsiveImage(photo)}
        sizes={sizes}
        alt={alt}
        // The first card is usually the LCP element: load it eagerly with high priority
        loading={priority ? 'eager' : 'lazy'}
        fetchPriority={priority ? 'high' : 'auto'}
        decoding="async"
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
      <div className={`absolute inset-0 ${overlayClass}`} />
    </>
  );
}

// Grid: 1 col on mobile, 2 on md, 3 on lg (wide cards span 2) inside a 1120px container
const WIDE_SIZES = '(min-width: 1024px) 740px, (min-width: 768px) 50vw, 100vw';
const SQUARE_SIZES = '(min-width: 1024px) 360px, (min-width: 768px) 50vw, 100vw';

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.08, duration: 0.35 },
  }),
};

export default function RecipeCard({ recipe, index, variant }: Props) {
  const photo = recipe.imageUrl;

  if (variant === 'overlay') {
    return (
      <motion.div
        custom={index} variants={cardVariants} initial="hidden" animate="visible"
        className="group relative rounded-3xl overflow-hidden h-64 md:h-72 flex flex-col justify-end"
      >
        <CardPhoto photo={photo} alt={recipe.name} sizes={WIDE_SIZES} overlayClass="bg-linear-to-t from-black/70 via-black/20 to-transparent" />
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
          <RecipeMeta recipe={recipe} className="text-white/80 text-sm" />
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
          <CardPhoto
            photo={photo}
            alt={recipe.name}
            sizes={variant === 'hero' ? WIDE_SIZES : SQUARE_SIZES}
            overlayClass="bg-linear-to-t from-black/45 via-transparent to-transparent"
            priority={index === 0}
          />
          <div className="absolute top-4 left-4">
            <MatchBadge pct={recipe.matchPercentage} />
          </div>
        </div>

        <h3 className={`font-bold text-on-surface tracking-tight mb-1 leading-snug group-hover:text-primary transition-colors ${variant === 'hero' ? 'text-[30px]' : 'text-[28px] md:text-[24px]'}`}>
          {recipe.name}
        </h3>
        <RecipeMeta recipe={recipe} compact className="text-on-surface-variant text-xs" />
      </Link>
    </motion.div>
  );
}
