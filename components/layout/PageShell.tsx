import AppNavigation from '@/components/layout/AppNavigation';

interface Props {
  activeTab: React.ComponentProps<typeof AppNavigation>['activeTab'];
  backHref?: string;
  /** Extra classes for <main>; width and padding are shared by every page */
  className?: string;
  children: React.ReactNode;
}

export default function PageShell({ activeTab, backHref, className = '', children }: Props) {
  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-200 focus:bg-primary focus:text-on-primary focus:px-4 focus:py-2 focus:rounded-full focus:font-semibold"
      >
        Saltar al contenido
      </a>
      <AppNavigation activeTab={activeTab} backHref={backHref} />
      <main id="main" tabIndex={-1} className={`outline-none max-w-280 mx-auto px-6 py-8 md:py-10 pb-32 md:pb-10 ${className}`}>
        {children}
      </main>
    </>
  );
}
