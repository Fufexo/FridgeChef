'use client';

import { useState } from 'react';

export function useFlash(duration = 2000): [boolean, () => void] {
  const [active, setActive] = useState(false);
  function trigger() {
    setActive(true);
    setTimeout(() => setActive(false), duration);
  }
  return [active, trigger];
}
