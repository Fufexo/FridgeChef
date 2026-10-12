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
      <AppNavigation activeTab={activeTab} backHref={backHref} />
      <main className={`max-w-280 mx-auto px-6 py-8 md:py-10 pb-32 md:pb-10 ${className}`}>
        {children}
      </main>
    </>
  );
}
