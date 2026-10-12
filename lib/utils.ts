export function normalizeText(value: string): string {
  return value.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
}

// The model sometimes returns numbers as a string — this safely coerces it.
export function castInt(v: unknown): number {
  const n = parseInt(String(v), 10);
  return Number.isNaN(n) ? 0 : n;
}

/** Keeps the first item for each key, preserving order. */
export function uniqueBy<T>(items: T[], key: (item: T) => string): T[] {
  const seen = new Set<string>();
  return items.filter((item) => {
    const k = key(item);
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}

export type CardVariant = 'hero' | 'square' | 'overlay';

// Grid rhythm of 4: wide hero, two squares, wide overlay.
export function getCardVariant(index: number): CardVariant {
  const pos = index % 4;
  if (pos === 0) return 'hero';
  if (pos === 3) return 'overlay';
  return 'square';
}

export function isWideCard(index: number): boolean {
  return getCardVariant(index) !== 'square';
}

export function buildRecipesCacheKey(ingredients: string[], exclude: string[] = []): string {
  return 'v6:fc:' + [...ingredients].sort().join(',') + '|x:' + [...exclude].sort().join(',');
}
