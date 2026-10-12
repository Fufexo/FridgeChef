// Responsive <img> attributes for recipe photos.
// Pexels' CDN resizes on the fly and serves AVIF/WebP via content negotiation, so we build
// a srcset from URL params instead of spending Vercel image-optimization quota on every new photo.

const PEXELS_HOST = 'images.pexels.com';
const PEXELS_WIDTHS = [480, 800, 1200];

function pexelsAtWidth(url: URL, width: number): string {
  const sized = new URL(url.origin + url.pathname);
  sized.searchParams.set('auto', 'compress');
  sized.searchParams.set('cs', 'tinysrgb');
  sized.searchParams.set('w', String(width));
  return sized.toString();
}

export function responsiveImage(src: string): { src: string; srcSet?: string } {
  let url: URL;
  try {
    url = new URL(src);
  } catch {
    return { src };
  }
  if (url.hostname !== PEXELS_HOST) return { src };

  return {
    src: pexelsAtWidth(url, 800),
    srcSet: PEXELS_WIDTHS.map((w) => `${pexelsAtWidth(url, w)} ${w}w`).join(', '),
  };
}
