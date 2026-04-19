import { RecipeSuggestion } from '@/types';
import { normalizeText } from '@/lib/utils';

const imageCache = new Map<string, string | null>();

interface ResolveImageOptions {
  usedUrls?: Set<string>;
}

interface ImageCandidate {
  url: string;
  text: string;
  source: 'pexels' | 'openverse';
}

interface OpenverseTag {
  name?: string;
}

interface OpenverseImageResult {
  url?: string;
  thumbnail?: string;
  title?: string;
  creator?: string;
  tags?: OpenverseTag[];
}

interface PexelsPhoto {
  alt?: string;
  photographer?: string;
  src?: {
    large2x?: string;
    large?: string;
    original?: string;
  };
}

const NEGATIVE_TERMS = [
  'nintendo', 'switch', 'playstation', 'xbox', 'console', 'gamepad',
  'camera', 'lens', 'canon', 'nikon', 'smartphone', 'laptop', 'keyboard',
  'headphones', 'monitor', 'joystick', 'controller', 'electronics', 'tech',
  'restaurant', 'cafe', 'diner', 'menu', 'waiter', 'chef portrait', 'kitchen staff',
  'people eating', 'couple eating', 'family eating', 'person eating',
];

const GENERIC_FOOD_TERMS = [
  'food', 'dish', 'meal', 'plate', 'plated',
  'comida', 'plato', 'cuenco', 'bowl', 'recipe',
  'cooked', 'cocido', 'cocina',
];

const UNPREPARED_SCENE_TERMS = [
  'raw ingredients', 'raw vegetables', 'fresh vegetables', 'grocery', 'produce',
  'kitchen counter', 'wooden table', 'ingredients on table', 'top view ingredients',
  'market vegetables', 'vegetables on table',
];

const TOKEN_SYNONYMS: Record<string, string[]> = {
  arroz: ['rice'],
  blanco: ['white'],
  vapor: ['steam', 'steamed'],
  pollo: ['chicken'],
  carne: ['meat', 'beef', 'pork'],
  pescado: ['fish'],
  sopa: ['soup'],
  ensalada: ['salad'],
  pasta: ['noodles', 'spaghetti'],
  champinon: ['mushroom'],
  tomate: ['tomato'],
  limon: ['lemon'],
  papa: ['potato'],
  patata: ['potato'],
  horneado: ['baked', 'roasted'],
  horno: ['oven', 'baked'],
  plancha: ['grilled'],
  frito: ['fried'],
  vegano: ['vegan'],
  vegetariano: ['vegetarian'],
};


function collapseSpaces(value: string): string {
  return value.replace(/\s+/g, ' ').trim();
}

const QUERY_STOP_WORDS = ['delicioso', 'plato', 'receta', 'comida', 'casero', 'casera'];
const STOP_WORDS_RE = new RegExp(`\\b(${QUERY_STOP_WORDS.join('|')})(\\s+de)?\\b`, 'g');

function limpiarQuery(receta: string): string {
  return collapseSpaces(normalizeText(receta).replace(STOP_WORDS_RE, ''));
}

function tokenize(text: string): string[] {
  return normalizeText(text)
    .split(/[^a-z0-9]+/g)
    .filter((token) => token.length >= 3);
}

function expandToken(token: string): string[] {
  const variants = [token, ...(TOKEN_SYNONYMS[token] ?? [])];
  return Array.from(new Set(variants.map(normalizeText)));
}

function buildTokenSets(tokens: string[]): string[][] {
  return tokens.map(expandToken);
}

function translateQueryForPexels(query: string): string {
  const tokens = tokenize(query);
  const translated = tokens.flatMap((token) => TOKEN_SYNONYMS[token] ?? [token]);
  return collapseSpaces(translated.join(' '));
}

function scoreCandidate(candidate: ImageCandidate, queryTokens: string[]): number {
  const text = normalizeText(candidate.text);
  if (!text) return -2;

  if (NEGATIVE_TERMS.some((term) => text.includes(term))) {
    return -100;
  }

  const tokenSets = buildTokenSets(queryTokens);
  const overlap = tokenSets.reduce((acc, variants) => {
    const matched = variants.some((variant) => text.includes(variant));
    return matched ? acc + 1 : acc;
  }, 0);

  // Require at least 2 matching tokens when query has 3+ tokens (avoids false positives like pizza matching only "oregano")
  const minOverlap = queryTokens.length >= 3 ? 2 : 1;
  if (queryTokens.length > 0 && overlap < minOverlap) {
    return -20;
  }

  // Penalize if the primary token (main ingredient/dish) doesn't appear in the image text
  const primaryTokenVariants = tokenSets[0] ?? [];
  const primaryMatched = primaryTokenVariants.some((v) => text.includes(v));
  const primaryPenalty = !primaryMatched ? 3 : 0;

  const genericFoodHits = GENERIC_FOOD_TERMS.reduce((acc, token) => (text.includes(token) ? acc + 1 : acc), 0);
  const unpreparedPenalty = UNPREPARED_SCENE_TERMS.some((term) => text.includes(term)) ? 4 : 0;
  const sourceBoost = candidate.source === 'pexels' ? 2 : 0;

  return overlap * 5 + genericFoodHits * 0.8 + sourceBoost - unpreparedPenalty - primaryPenalty;
}

function dedupeCandidates(candidates: ImageCandidate[]): ImageCandidate[] {
  const seen = new Set<string>();
  const unique: ImageCandidate[] = [];

  for (const candidate of candidates) {
    if (seen.has(candidate.url)) continue;
    seen.add(candidate.url);
    unique.push(candidate);
  }

  return unique;
}

export function buildRecipeImageQuery(recipe: Pick<RecipeSuggestion, 'name' | 'availableIngredients' | 'dietaryTags' | 'imageQuery'>): string {
  if (recipe.imageQuery?.trim()) {
    return limpiarQuery(recipe.imageQuery.trim());
  }

  const parts = [recipe.name, ...recipe.availableIngredients.slice(0, 4), ...recipe.dietaryTags.slice(0, 1)]
    .map(normalizeText)
    .filter(Boolean);

  return limpiarQuery(parts.join(' '));
}

function reduceQuery(query: string): string[] {
  const normalized = limpiarQuery(query);
  const words = normalized.split(' ').filter(Boolean);
  const filtered = words.filter((word) => !QUERY_STOP_WORDS.includes(word));
  const english = translateQueryForPexels(filtered.join(' '));

  return [
    collapseSpaces(filtered.join(' ')),
    collapseSpaces(english),
    collapseSpaces(`${english} plated dish`),
    collapseSpaces(`${filtered.join(' ')} food dish`),
    collapseSpaces(`${filtered.join(' ')} comida plato`),
    collapseSpaces(filtered.slice(0, 5).join(' ')),
    collapseSpaces(filtered.slice(0, 3).join(' ')),
  ].filter(Boolean);
}


async function searchOpenverseImageCandidates(query: string): Promise<ImageCandidate[]> {
  const url = new URL('https://api.openverse.org/v1/images/');
  url.searchParams.set('q', query);
  url.searchParams.set('page_size', '8');
  url.searchParams.set('category', 'photograph');
  url.searchParams.set('size', 'large');
  url.searchParams.set('license_type', 'commercial');
  url.searchParams.set('filter_dead', 'true');

  const res = await fetch(url.toString(), {
    headers: {
      Accept: 'application/json',
    },
  });

  if (!res.ok) {
    if (res.status === 429) {
      throw new Error('Openverse rate limit');
    }
    return [];
  }

  const data = await res.json();
  const results: OpenverseImageResult[] = Array.isArray(data?.results)
    ? data.results as OpenverseImageResult[]
    : [];

  const candidates: ImageCandidate[] = [];
  for (const item of results) {
    const urlValue = item?.url ?? item?.thumbnail ?? null;
    if (!urlValue) continue;

    const tagsText = Array.isArray(item?.tags)
      ? item.tags.map((t) => String(t?.name ?? '')).join(' ')
      : '';
    const text = [item?.title, item?.creator, tagsText].filter(Boolean).join(' ');

    candidates.push({
      url: urlValue,
      text,
      source: 'openverse',
    });
  }

  return candidates;
}

async function searchPexelsImageCandidates(query: string): Promise<ImageCandidate[]> {
  const apiKey = process.env.PEXELS_API_KEY;
  if (!apiKey) {
    return [];
  }

  const url = new URL('https://api.pexels.com/v1/search');
  url.searchParams.set('query', query);
  url.searchParams.set('per_page', '30');
  url.searchParams.set('orientation', 'landscape');
  url.searchParams.set('size', 'large');

  const res = await fetch(url.toString(), {
    headers: {
      Accept: 'application/json',
      Authorization: apiKey,
    },
  });

  if (!res.ok) {
    return [];
  }

  const data = await res.json();
  const photos: PexelsPhoto[] = Array.isArray(data?.photos)
    ? data.photos as PexelsPhoto[]
    : [];

  const candidates: ImageCandidate[] = [];
  for (const photo of photos) {
    const urlValue = photo?.src?.large2x ?? photo?.src?.large ?? photo?.src?.original ?? null;
    if (!urlValue) continue;

    const text = [photo?.alt, photo?.photographer].filter(Boolean).join(' ');
    candidates.push({
      url: urlValue,
      text,
      source: 'pexels',
    });
  }

  return candidates;
}

export async function resolveRecipeImageUrl(
  recipe: Pick<RecipeSuggestion, 'name' | 'availableIngredients' | 'dietaryTags' | 'imageQuery'>,
  options: ResolveImageOptions = {}
): Promise<string | null> {
  const { usedUrls } = options;
  const key = `${recipe.name}|${recipe.availableIngredients.join('|')}|${recipe.dietaryTags.join('|')}|${recipe.imageQuery ?? ''}`;
  if (imageCache.has(key)) {
    const cached = imageCache.get(key) ?? null;
    if (cached && usedUrls?.has(cached)) {
      return null;
    }
    return cached;
  }

  const attempts = reduceQuery(buildRecipeImageQuery(recipe));
  for (const attempt of attempts) {
    if (!attempt) continue;
    try {
      const [pexelsCandidates, openverseCandidates] = await Promise.all([
        searchPexelsImageCandidates(attempt),
        searchOpenverseImageCandidates(attempt),
      ]);

      const queryTokens = tokenize(attempt);
      const ranked = dedupeCandidates([...pexelsCandidates, ...openverseCandidates])
        .map((candidate) => ({ candidate, score: scoreCandidate(candidate, queryTokens) }))
        .filter((item) => item.score >= 1)
        .sort((a, b) => b.score - a.score);

      for (const item of ranked) {
        if (usedUrls?.has(item.candidate.url)) continue;
        imageCache.set(key, item.candidate.url);
        return item.candidate.url;
      }
    } catch (error) {
      if (error instanceof Error && error.message === 'Openverse rate limit') {
        break;
      }
    }
  }

  imageCache.set(key, null);
  return null;
}
