import type { Metadata } from 'next';

// Recipe pages are built from the visitor's own session, so they shouldn't be indexed.
export const metadata: Metadata = {
  title: 'Receta',
  robots: { index: false, follow: true },
};

export default function RecipeLayout({ children }: { children: React.ReactNode }) {
  return children;
}
