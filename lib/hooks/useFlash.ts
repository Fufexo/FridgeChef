'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

/** Timed boolean flash: `trigger()` sets it true for `duration` ms. */
export function useFlash(duration = 2000): [boolean, () => void] {
  const [active, setActive] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  const trigger = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    setActive(true);
    timer.current = setTimeout(() => setActive(false), duration);
  }, [duration]);

  return [active, trigger];
}
