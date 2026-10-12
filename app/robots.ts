import type { MetadataRoute } from 'next';
import { SITE } from '@/lib/site';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // Per-visitor pages (/recipe, /shopping-list) use a noindex meta tag instead, which crawlers must be allowed to read
      disallow: '/api/',
    },
    sitemap: `${SITE.url}/sitemap.xml`,
  };
}
