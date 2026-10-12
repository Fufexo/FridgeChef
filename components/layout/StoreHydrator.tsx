'use client';

import { useEffect } from 'react';
import { useStore } from '@/lib/store';

/** Loads persisted store state from localStorage once the app has mounted. */
export default function StoreHydrator() {
  useEffect(() => {
    useStore.persist.rehydrate();
  }, []);
  return null;
}
