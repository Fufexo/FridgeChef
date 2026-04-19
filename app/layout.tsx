import type { Metadata } from 'next';
import { Plus_Jakarta_Sans, Be_Vietnam_Pro } from 'next/font/google';
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
  title: 'FridgeChef — Recetas con lo que tienes',
  description: 'Ingresa los ingredientes que tienes y descubre qué puedes cocinar hoy.',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    apple: '/apple-icon.png',
  },
  appleWebApp: { title: 'FridgeChef' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${headline.variable} ${body.variable}`}>
      <body className="min-h-screen bg-surface text-on-surface antialiased pb-24 md:pb-0">
        {children}
      </body>
    </html>
  );
}
