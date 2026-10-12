'use client';

import type { ShoppingItem } from '@/types';
import { useStore } from '@/lib/store';

const badgeTones = [
  'text-secondary bg-secondary-container/35',
  'text-tertiary bg-primary-container/35',
  'text-primary bg-primary-container/45',
] as const;

interface Props {
  recipeName: string;
  items: ShoppingItem[];
  index: number;
}

/** Missing ingredients for one recipe; ticking an item marks it as bought. */
export default function ShoppingGroupCard({ recipeName, items, index }: Props) {
  const removeFromShoppingList = useStore((s) => s.removeFromShoppingList);

  return (
    <article className="bg-surface-container-lowest rounded-[28px] p-4 md:p-5 shadow-[0_8px_28px_rgba(45,47,45,0.05)] border border-black/5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-headline font-bold text-lg leading-tight">{recipeName}</h3>
        <span className={`text-[11px] font-extrabold uppercase tracking-[0.12em] whitespace-nowrap px-3 py-1 rounded-full ${badgeTones[index % badgeTones.length]}`}>
          {items.length} {items.length === 1 ? 'item' : 'items'}
        </span>
      </div>

      <ul className="space-y-2">
        {items.map((item) => (
          <li key={item.name}>
            <label className="flex items-center gap-3 rounded-[18px] bg-surface-container-low/65 hover:bg-surface-container transition-colors px-4 py-3 cursor-pointer">
              <input
                type="checkbox"
                checked={false}
                onChange={() => removeFromShoppingList(item.name)}
                className="w-4.5 h-4.5 rounded-full border-outline-variant text-primary focus:ring-primary focus:ring-offset-0"
              />
              <span className="text-xl leading-none">{item.emoji}</span>
              <span className="text-[17px] font-semibold text-on-surface capitalize">{item.name}</span>
              <span className="ml-auto text-[10px] uppercase tracking-wider font-semibold text-on-surface-variant/80">
                Comprado
              </span>
            </label>
          </li>
        ))}
      </ul>
    </article>
  );
}
