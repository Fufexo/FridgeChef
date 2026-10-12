'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Check, Copy, Share2, ShoppingBag } from 'lucide-react';
import { useShallow } from 'zustand/react/shallow';
import type { ShoppingItem } from '@/types';
import { useStore } from '@/lib/store';
import { useFlash } from '@/lib/hooks/useFlash';
import { CUSTOM_SHOPPING_GROUP } from '@/lib/constants';
import ShoppingGroupCard from './ShoppingGroupCard';
import CustomItemsCard from './CustomItemsCard';

function buildListText(items: ShoppingItem[]): string {
  return ['Lista de compras — FridgeChef', ...items.map((i) => `- ${i.emoji} ${i.name} (${i.forRecipe})`)].join('\n');
}

export default function ShoppingList() {
  const { hasHydrated, shoppingList } = useStore(useShallow((s) => ({ hasHydrated: s.hasHydrated, shoppingList: s.shoppingList })));
  const [copyDone, flashCopyDone] = useFlash();
  const [shareDone, flashShareDone] = useFlash();

  const { groupedEntries, customItems } = useMemo(() => {
    const grouped = shoppingList.reduce<Record<string, ShoppingItem[]>>((acc, item) => {
      (acc[item.forRecipe] ??= []).push(item);
      return acc;
    }, {});
    return {
      groupedEntries: Object.entries(grouped).filter(([name]) => name !== CUSTOM_SHOPPING_GROUP),
      customItems: grouped[CUSTOM_SHOPPING_GROUP] ?? [],
    };
  }, [shoppingList]);

  // Avoid flashing the empty state before localStorage has loaded
  if (!hasHydrated) return null;

  if (shoppingList.length === 0) {
    return (
      <div className="text-center py-20 max-w-xl mx-auto">
        <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-primary-container/45 text-primary flex items-center justify-center">
          <ShoppingBag size={28} />
        </div>
        <h3 className="text-2xl font-extrabold text-on-surface mb-2">Tu lista está vacía</h3>
        <p className="text-on-surface-variant text-sm mb-7">Abre una receta y agrega ingredientes faltantes para verlos aquí.</p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-primary text-on-primary font-bold text-sm hover:brightness-105 transition-all"
        >
          Ir al inicio
        </Link>
      </div>
    );
  }

  const listText = buildListText(shoppingList);

  function handleCopyList() {
    navigator.clipboard.writeText(listText).then(flashCopyDone);
  }

  async function handleShare() {
    // The list lives in this browser only, so share its text rather than the page URL
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Lista de compras — FridgeChef', text: listText });
        return;
      } catch { /* cancelled or unsupported — fall back to copying */ }
    }
    navigator.clipboard.writeText(listText).then(flashShareDone);
  }

  return (
    <div className="space-y-8">
      <section className="space-y-5">
        <div>
          <h1 className="text-[44px] md:text-[56px] font-extrabold text-primary tracking-tight leading-[0.96]">
            Lista de compras
          </h1>
          <p className="text-on-surface-variant text-sm md:text-base max-w-xl mt-2">
            Ingredientes para tus próximas comidas de la semana. Compras inteligentes para tu cocina.
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5">
          <button
            onClick={handleCopyList}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-linear-to-r from-primary to-primary-container text-on-primary font-bold text-sm hover:brightness-105 transition-all"
          >
            {copyDone ? <Check size={15} /> : <Copy size={15} />}
            {copyDone ? 'Copiado' : 'Copiar lista'}
          </button>
          <button
            onClick={handleShare}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-outline-variant/35 bg-surface-container-lowest text-primary font-bold text-sm hover:bg-surface-container-low transition-colors"
          >
            {shareDone ? <Check size={15} /> : <Share2 size={15} />}
            {shareDone ? 'Lista copiada' : 'Compartir'}
          </button>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 xl:gap-6 items-start">
        {groupedEntries.map(([recipeName, items], index) => (
          <ShoppingGroupCard key={recipeName} recipeName={recipeName} items={items} index={index} />
        ))}

        <CustomItemsCard items={customItems} />

        <article className="relative min-h-72 rounded-[28px] overflow-hidden border border-black/5 shadow-[0_8px_28px_rgba(45,47,45,0.08)]">
          <Image
            src="https://images.pexels.com/photos/1435895/pexels-photo-1435895.jpeg?auto=compress&cs=tinysrgb&w=1200"
            alt="Verduras frescas"
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-linear-to-t from-primary/70 via-primary/20 to-transparent" />
          <p className="absolute left-4 right-4 bottom-4 text-white text-sm font-semibold leading-snug">
            Tip: compra hierbas al final para mantener su frescura.
          </p>
        </article>
      </section>
    </div>
  );
}
