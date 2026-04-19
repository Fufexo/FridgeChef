export function normalizeText(value: string): string {
  return value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

// Gemini sometimes returns estimatedTime as a string — this safely coerces it.
export function castInt(v: unknown): number {
  const n = parseInt(String(v), 10);
  return Number.isNaN(n) ? 0 : n;
}

// Grid layout: positions 0 and 3 (mod 4) span 2 columns.
export function isWideCard(index: number): boolean {
  const pos = index % 4;
  return pos === 0 || pos === 3;
}

export function buildRecipesCacheKey(ingredients: string[], exclude: string[] = []): string {
  return 'v5:fc:' + [...ingredients].sort().join(',') + '|x:' + [...exclude].sort().join(',');
}
