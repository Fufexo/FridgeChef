import { describe, expect, it } from 'vitest';
import { responsiveImage } from './image-url';

describe('responsiveImage', () => {
  it('builds a resized srcset for Pexels photos, dropping oversized params', () => {
    const { src, srcSet } = responsiveImage(
      'https://images.pexels.com/photos/1/pexels-photo-1.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940'
    );
    expect(src).toBe('https://images.pexels.com/photos/1/pexels-photo-1.jpeg?auto=compress&cs=tinysrgb&w=800');
    expect(srcSet?.split(', ')).toHaveLength(3);
    expect(srcSet).not.toContain('dpr=');
    expect(srcSet).toContain('w=480 480w');
  });

  it('leaves other hosts and invalid URLs untouched', () => {
    expect(responsiveImage('https://api.openverse.org/v1/images/x/thumb/')).toEqual({
      src: 'https://api.openverse.org/v1/images/x/thumb/',
    });
    expect(responsiveImage('not a url')).toEqual({ src: 'not a url' });
  });
});
