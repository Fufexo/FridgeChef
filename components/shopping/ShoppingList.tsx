'use client';

import { useMemo, useState } from 'react';
import { useFlash } from '@/lib/hooks/useFlash';
import Link from 'next/link';
import Image from 'next/image';
import { Check, Copy, Share2, ShoppingBag, X } from 'lucide-react';
import { useStore } from '@/lib/store';
import { CUSTOM_SHOPPING_GROUP as CUSTOM_GROUP } from '@/lib/constants';

const badgeTones = [
  'text-secondary bg-secondary-container/35',
  'text-tertiary bg-primary-container/35',
  'text-primary bg-primary-container/45',
] as const;

export default function ShoppingList() {
  const { shoppingList, addToShoppingList, removeFromShoppingList } = useStore();
  const [copyDone, flashCopyDone] = useFlash();
  const [shareDone, flashShareDone] = useFlash();
  const [customItemInput, setCustomItemInput] = useState('');

  const { groupedEntries, customItems } = useMemo(() => {
    const grouped = shoppingList.reduce<Record<string, typeof shoppingList>>((acc, item) => {
      if (!acc[item.forRecipe]) acc[item.forRecipe] = [];
      acc[item.forRecipe].push(item);
      return acc;
    }, {});
    return {
      groupedEntries: Object.entries(grouped).filter(([name]) => name !== CUSTOM_GROUP),
      customItems: grouped[CUSTOM_GROUP] ?? [],
    };
  }, [shoppingList]);

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

  function buildListText() {
    return shoppingList.map((i) => `- ${i.emoji} ${i.name} (${i.forRecipe})`).join('\n');
  }

  function handleCopyList() {
    navigator.clipboard.writeText(buildListText()).then(() => flashCopyDone());
  }

  async function handleShare() {
    if (navigator.share) {
      try {
        await navigator.share({ title: 'FridgeChef', text: buildListText(), url: window.location.href });
        return;
      } catch { /* user cancelled */ }
    }
    navigator.clipboard.writeText(window.location.href).then(() => flashShareDone());
  }

  function handleAddCustomItem() {
    const name = customItemInput.trim();
    if (!name) return;
    addToShoppingList([{ name, emoji: '🛍️', forRecipe: CUSTOM_GROUP }]);
    setCustomItemInput('');
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
            {shareDone ? 'Enlace copiado' : 'Compartir'}
          </button>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 xl:gap-6 items-start">
        {groupedEntries.map(([recipeName, items], index) => (
          <article
            key={recipeName}
            className="bg-surface-container-lowest rounded-[28px] p-4 md:p-5 shadow-[0_8px_28px_rgba(45,47,45,0.05)] border border-black/5"
          >
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
        ))}

        <article className="bg-primary-container/35 border border-primary/10 rounded-[28px] p-5 flex flex-col min-h-72">
          <div className="w-11 h-11 rounded-2xl bg-primary text-on-primary flex items-center justify-center mb-3 mx-auto">
            <ShoppingBag size={18} />
          </div>
          <p className="font-bold text-primary text-xl mb-1 text-center">¿Necesitas más?</p>
          <p className="text-xs text-on-surface-variant mb-4 text-center">Agrega productos personalizados a tu lista.</p>

          <div className="rounded-2xl bg-surface-container-lowest/80 border border-black/5 p-3 space-y-3">
            <p className="text-[11px] uppercase tracking-wider text-on-surface-variant font-bold">Lista personalizada</p>

            <div className="space-y-2 max-h-28 overflow-y-auto no-scrollbar">
              {customItems.length === 0 && (
                <p className="text-xs text-on-surface-variant">Sin items aún.</p>
              )}
              {customItems.map((item) => (
                <div key={item.name} className="flex items-center gap-2 text-sm">
                  <span>{item.emoji}</span>
                  <span className="font-medium capitalize text-on-surface flex-1">{item.name}</span>
                  <button
                    type="button"
                    onClick={() => removeFromShoppingList(item.name)}
                    className="w-6 h-6 inline-flex items-center justify-center rounded-full text-on-surface-variant hover:text-error hover:bg-error-container/20 transition-colors"
                    aria-label={`Eliminar: ${item.name}`}
                  >
                    <X size={13} />
                  </button>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-2 items-center">
              <input
                value={customItemInput}
                onChange={(e) => setCustomItemInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddCustomItem(); } }}
                placeholder="Ej: pan integral, yogur, limón..."
                className="min-w-0 rounded-xl border border-outline-variant/35 bg-white px-3 py-2 text-sm outline-none focus:border-primary"
              />
              <button
                onClick={handleAddCustomItem}
                className="shrink-0 inline-flex items-center gap-1 whitespace-nowrap bg-primary text-on-primary px-3.5 py-2 rounded-xl text-xs font-bold hover:brightness-105 transition-all"
              >
                Agregar
              </button>
            </div>
          </div>
        </article>

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
