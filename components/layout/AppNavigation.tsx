'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { ArrowLeft, ChefHat, ShoppingBasket, UtensilsCrossed } from 'lucide-react';
import { useStore } from '@/lib/store';

type Tab = 'pantry' | 'recipes' | 'shopping';

interface Props {
  activeTab: Tab;
  backHref?: string;
}

interface NavItem {
  key: Tab;
  label: string;
  staticHref?: string;
  icon: React.ReactNode;
  activeExtraClass?: string;
}

const NAV_ITEMS: NavItem[] = [
  { key: 'pantry',   label: 'Ingredientes', staticHref: '/',             icon: <ChefHat size={20} /> },
  { key: 'recipes',  label: 'Recetas',                                    icon: <UtensilsCrossed size={20} /> },
  { key: 'shopping', label: 'Compras',      staticHref: '/shopping-list', icon: <ShoppingBasket size={20} />, activeExtraClass: 'bg-primary-container/45 scale-105' },
];

export default function AppNavigation({ activeTab, backHref }: Props) {
  const shoppingCount = useStore((state) => state.shoppingList.length);
  const recipesHref = activeTab === 'pantry' ? '#recipes' : '/#recipes';

  const navItems = useMemo(() => NAV_ITEMS.map((item) => ({
    ...item,
    href: item.key === 'recipes' ? recipesHref : item.staticHref!,
  })), [recipesHref]);

  return (
    <>
      <header className="bg-surface/95 backdrop-blur-md w-full sticky top-0 z-50">
        <div className="flex justify-between items-center px-6 py-4 w-full max-w-280 mx-auto">
          <div className="flex items-center gap-2">
            {backHref && (
              <Link
                href={backHref}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-primary-container/50 transition-colors"
                aria-label="Volver"
              >
                <ArrowLeft size={18} className="text-primary" />
              </Link>
            )}
            <span className="text-[26px] font-extrabold text-primary font-headline tracking-tight leading-none">
              FridgeChef
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-7 text-sm">
            {navItems.map((item) => (
              <Link
                key={item.key}
                href={item.href}
                className={activeTab === item.key
                  ? 'text-primary font-semibold'
                  : 'text-on-surface-variant hover:text-primary transition-colors'}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <Link
            href="/shopping-list"
            className="relative text-on-surface-variant hover:text-primary transition-colors"
            aria-label="Compras"
          >
            <ShoppingBasket size={22} />
            {shoppingCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-primary text-on-primary text-xs w-4 h-4 rounded-full flex items-center justify-center font-bold">
                {shoppingCount}
              </span>
            )}
          </Link>
        </div>
        <div className="h-px w-full bg-black/5" />
      </header>

      <nav className="md:hidden fixed bottom-0 left-0 w-full z-100 rounded-t-3xl bg-white/95 backdrop-blur-xl shadow-[0_-4px_20px_rgba(45,47,45,0.08)] flex justify-around items-center px-4 pt-3 pb-8">
        {navItems.map((item) => {
          const isActive = activeTab === item.key;
          return (
            <Link
              key={item.key}
              href={item.href}
              className={`flex flex-col items-center gap-1 px-3 py-2 flex-1 rounded-full ${
                isActive
                  ? `text-primary${item.activeExtraClass ? ` ${item.activeExtraClass}` : ''}`
                  : 'text-on-surface-variant'
              }`}
            >
              {item.icon}
              <span className="text-[9px] font-semibold uppercase tracking-wider">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
