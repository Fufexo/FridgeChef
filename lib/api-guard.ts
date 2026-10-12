import type { NextRequest } from 'next/server';

const MAX_ITEMS = 30;
const MAX_ITEM_LENGTH = 60;

/** Keeps only short, non-empty strings so user input can't bloat or hijack the prompt. */
export function sanitizeList(value: unknown, maxItems = MAX_ITEMS): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((v): v is string => typeof v === 'string')
    .map((v) => v.replace(/[\r\n"`{}[\]]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, MAX_ITEM_LENGTH))
    .filter(Boolean)
    .slice(0, maxItems);
}

/** Map-based cache that evicts the oldest entry once it reaches `max`. */
export function boundedSet<K, V>(cache: Map<K, V>, key: K, value: V, max = 300) {
  if (cache.size >= max) {
    const oldest = cache.keys().next().value;
    if (oldest !== undefined) cache.delete(oldest);
  }
  cache.set(key, value);
}

// Best-effort, per-instance limiter. For real traffic use Vercel Firewall or a shared store.
const hits = new Map<string, number[]>();
const WINDOW_MS = 60_000;

export function isRateLimited(request: NextRequest, limit = 12): boolean {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'local';
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  boundedSet(hits, ip, recent, 5_000);
  return recent.length > limit;
}

/** Maps internal errors to messages that are safe to show the user. */
export function publicErrorMessage(err: unknown): string {
  const msg = err instanceof Error ? err.message : '';
  if (msg === 'quota') return 'quota';
  if (err instanceof Error && (err.name === 'TimeoutError' || err.name === 'AbortError')) {
    return 'La IA tardó demasiado en responder. Intenta de nuevo.';
  }
  return 'No se pudo conectar con la IA. Intenta de nuevo.';
}
