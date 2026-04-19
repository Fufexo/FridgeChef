'use client';

import ShoppingList from '@/components/shopping/ShoppingList';
import AppNavigation from '@/components/layout/AppNavigation';

export default function ShoppingListPage() {
  return (
    <div className="min-h-screen bg-surface text-on-surface">
      <AppNavigation activeTab="shopping" />
      <main className="max-w-280 mx-auto px-6 py-8 md:py-10 pb-32 md:pb-10">
        <ShoppingList />
      </main>
    </div>
  );
}
