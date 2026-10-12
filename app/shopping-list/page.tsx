import type { Metadata } from 'next';
import ShoppingList from '@/components/shopping/ShoppingList';
import PageShell from '@/components/layout/PageShell';

export const metadata: Metadata = {
  title: 'Lista de compras',
  robots: { index: false, follow: true },
};

export default function ShoppingListPage() {
  return (
    <PageShell activeTab="shopping">
      <ShoppingList />
    </PageShell>
  );
}
