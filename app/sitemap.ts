import type { MetadataRoute } from 'next';
import { SITE } from '@/lib/site';

// Only the home page is public content; recipe and shopping pages are per-visitor state.
export default function sitemap(): MetadataRoute.Sitemap {
  return [{ url: SITE.url, changeFrequency: 'monthly', priority: 1 }];
}
