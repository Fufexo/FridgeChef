'use client';

import { useEffect } from 'react';
import { MotionConfig } from 'framer-motion';
import { useStore } from '@/lib/store';

/** App-wide client setup: load persisted state after mount and respect reduced-motion. */
export default function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Rehydrated here (not at store creation) to avoid SSR hydration mismatches
    useStore.persist.rehydrate();
  }, []);

  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
