/* eslint-disable @next/next/no-img-element */
import { motion } from 'framer-motion';
import { Award, Clock, Flame, Star, Utensils } from 'lucide-react';
import type { RecipeDetail } from '@/types';
import { DIFFICULTY_LABEL } from '@/lib/constants';
import { castInt } from '@/lib/utils';
import { responsiveImage } from '@/lib/image-url';
import { matchTone } from '../MatchBadge';

const fadeUp = { initial: { opacity: 0, y: 14 }, animate: { opacity: 1, y: 0 } };

function StatItem({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-on-surface-variant text-[11px] uppercase tracking-wider font-bold mb-1.5">{label}</p>
      <p className="flex items-center gap-1.5 font-bold">{children}</p>
    </div>
  );
}

export default function RecipeHero({ recipe }: { recipe: RecipeDetail }) {
  return (
    <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12 items-center mb-12">
      <motion.div {...fadeUp} className="lg:col-span-7">
        <div className="inline-flex items-center gap-2 bg-primary-container/70 text-on-primary-container px-4 py-1.5 rounded-full mb-5 text-xs font-bold uppercase tracking-wider">
          <Star size={13} fill="currentColor" stroke="none" />
          Receta destacada
        </div>

        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-[0.98] mb-6">{recipe.name}</h1>

        <div className="flex flex-wrap gap-5 md:gap-8">
          <StatItem label="Duración">
            <Clock size={20} className="text-primary" fill="currentColor" stroke="white" strokeWidth={1.5} /> {castInt(recipe.estimatedTime)} min
          </StatItem>
          <StatItem label="Dificultad">
            <Award size={15} className="text-secondary" /> {DIFFICULTY_LABEL[recipe.difficulty] ?? recipe.difficulty}
          </StatItem>
          <StatItem label="Porciones">
            <Utensils size={15} className="text-primary" strokeWidth={2.8} /> {recipe.servings} personas
          </StatItem>
          {!!recipe.calories && (
            <StatItem label="Kcal">
              <Flame size={15} className="text-secondary" /> ~{recipe.calories}
            </StatItem>
          )}
        </div>
      </motion.div>

      <motion.div {...fadeUp} className="lg:col-span-5">
        <div className="relative group">
          <div className="absolute -inset-4 bg-primary-container/20 rounded-3xl blur-2xl group-hover:bg-primary-container/30 transition-all" />
          <div className="relative rounded-3xl overflow-hidden shadow-2xl">
            {recipe.imageUrl ? (
              <img
                {...responsiveImage(recipe.imageUrl)}
                sizes="(min-width: 1024px) 460px, 100vw"
                fetchPriority="high"
                alt={recipe.name}
                className="relative w-full aspect-square object-cover hover:scale-[1.02] transition-transform duration-500"
              />
            ) : (
              <div className="w-full aspect-square flex items-center justify-center text-on-surface-variant font-semibold bg-surface-container-low">
                Imagen no disponible
              </div>
            )}
            <div className="absolute top-4 right-4 bg-white/80 backdrop-blur-xl px-3.5 py-2.5 rounded-2xl shadow-[0_8px_24px_rgba(0,0,0,0.18),0_1px_3px_rgba(0,0,0,0.08)] border border-white/60 flex items-center gap-2.5">
              <span className={`w-9 h-9 rounded-full ${matchTone(recipe.matchPercentage)} text-white text-xs font-extrabold flex items-center justify-center shadow-md`}>
                {recipe.matchPercentage}%
              </span>
              <span className="text-xs font-bold text-on-surface pr-0.5">Coincidencia</span>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
