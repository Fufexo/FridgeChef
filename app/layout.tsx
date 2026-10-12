import type { Metadata, Viewport } from 'next';
import { Plus_Jakarta_Sans, Be_Vietnam_Pro } from 'next/font/google';
import Providers from '@/components/layout/Providers';
import { SITE } from '@/lib/site';
import './globals.css';

const headline = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '600', '700', '800'],
  variable: '--font-jakarta',
  display: 'swap',
});

const body = Be_Vietnam_Pro({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-vietnam',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: SITE.title, template: `%s — ${SITE.name}` },
  description: SITE.description,
  applicationName: SITE.name,
  keywords: ['recetas', 'ingredientes', 'qué cocinar', 'recetas con lo que tengo', 'IA', 'lista de compras'],
  openGraph: {
    type: 'website',
    locale: SITE.locale,
    siteName: SITE.name,
    title: SITE.title,
    description: SITE.description,
    url: '/',
  },
  twitter: { card: 'summary_large_image', title: SITE.title, description: SITE.description },
  // Icons come from the app/ file conventions (favicon.ico, icon.svg, apple-icon.png)
  appleWebApp: { title: SITE.name },
};

export const viewport: Viewport = {
  themeColor: SITE.themeColor,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${headline.variable} ${body.variable}`}>
      <body className="min-h-screen bg-surface text-on-surface antialiased pb-24 md:pb-0">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
