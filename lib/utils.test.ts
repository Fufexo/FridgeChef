import { describe, expect, it } from 'vitest';
import { buildRecipesCacheKey, castInt, getCardVariant, isWideCard, normalizeText, uniqueBy } from './utils';

describe('utils', () => {
  it('normalizeText lowercases and strips accents', () => {
    expect(normalizeText('Champiñón LIMÓN')).toBe('champinon limon');
  });

  it('castInt parses numeric strings and defaults to 0', () => {
    expect(castInt('45 min')).toBe(45);
    expect(castInt('abc')).toBe(0);
  });

  it('uniqueBy keeps the first item per key', () => {
    expect(uniqueBy(['Pollo', 'pollo', 'arroz'], (s) => s.toLowerCase())).toEqual(['Pollo', 'arroz']);
  });

  it('card layout repeats every 4 cards', () => {
    expect([0, 1, 2, 3, 4].map(getCardVariant)).toEqual(['hero', 'square', 'square', 'overlay', 'hero']);
    expect([0, 1, 2, 3].map(isWideCard)).toEqual([true, false, false, true]);
  });

  it('cache key ignores ingredient order', () => {
    expect(buildRecipesCacheKey(['b', 'a'])).toBe(buildRecipesCacheKey(['a', 'b']));
  });
});
