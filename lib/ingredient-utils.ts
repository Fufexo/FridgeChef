import { INGREDIENTS_DATA } from '@/lib/ingredients-data';
import { normalizeText } from '@/lib/utils';

export function getIngredientEmoji(name: string): string {
  const n = normalizeText(name);
  const queryWords = new Set(n.split(/\s+/));

  // 1. exact full match
  const exact = INGREDIENTS_DATA.find((i) => normalizeText(i.name) === n);
  if (exact) return exact.emoji;

  // 2. every word of the ingredient name appears as a word in the query
  //    e.g. "aceite de oliva" → words ["aceite","de","oliva"] all in "aceite de oliva extra virgen"
  const wordMatch = INGREDIENTS_DATA.find((i) => {
    const iWords = normalizeText(i.name).split(/\s+/);
    return iWords.length >= 1 && iWords.every((w) => queryWords.has(w));
  });
  if (wordMatch) return wordMatch.emoji;

  // 3. single-word ingredient names that appear as a whole word in the query
  //    Requires ingredient name to be ≥4 chars to avoid short false positives ("res","sal","pan")
  const wordBoundary = INGREDIENTS_DATA.find((i) => {
    const iNorm = normalizeText(i.name);
    if (iNorm.length < 4) return false;
    return new RegExp(`(?<![a-z])${iNorm}(?![a-z])`).test(n);
  });
  if (wordBoundary) return wordBoundary.emoji;

  return '🧂';
}
