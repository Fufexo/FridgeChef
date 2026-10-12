// Single source of truth for site-wide SEO values.
export const SITE = {
  name: 'FridgeChef',
  title: 'FridgeChef — Recetas con lo que tienes en el refrigerador',
  description:
    'Escribe los ingredientes que tienes y la IA te sugiere recetas reales ordenadas por % de coincidencia, con pasos, calorías y lista de compras.',
  url: process.env.NEXT_PUBLIC_SITE_URL ?? 'https://fridgechef-olive.vercel.app',
  locale: 'es_ES',
  themeColor: '#176a21',
  backgroundColor: '#f7f7f3',
} as const;
