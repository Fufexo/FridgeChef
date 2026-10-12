import { ImageResponse } from 'next/og';
import { SITE } from '@/lib/site';

// Share card for links on WhatsApp, X, LinkedIn, etc. Generated at build time.
export const alt = SITE.title;
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

const CHIPS = ['pollo', 'arroz', 'tomate', 'cebolla'];

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: 72,
          background: 'linear-gradient(135deg, #f7f7f3 0%, #dff5d8 100%)',
          color: '#2d2f2d',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', fontSize: 40, fontWeight: 800, color: SITE.themeColor }}>FridgeChef</div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div style={{ display: 'flex', fontSize: 84, fontWeight: 800, lineHeight: 1, letterSpacing: -2 }}>
            ¿Qué hay en tu refrigerador?
          </div>
          <div style={{ display: 'flex', fontSize: 34, color: '#5a5c58', maxWidth: 900 }}>
            Recetas reales con lo que tienes, ordenadas por % de coincidencia.
          </div>
        </div>

        <div style={{ display: 'flex', gap: 16 }}>
          {CHIPS.map((chip) => (
            <div
              key={chip}
              style={{
                display: 'flex',
                padding: '12px 28px',
                borderRadius: 999,
                background: '#9df197',
                color: '#005c15',
                fontSize: 30,
                fontWeight: 700,
              }}
            >
              {chip}
            </div>
          ))}
          <div
            style={{
              display: 'flex',
              marginLeft: 'auto',
              padding: '12px 28px',
              borderRadius: 999,
              background: SITE.themeColor,
              color: '#ffffff',
              fontSize: 30,
              fontWeight: 700,
            }}
          >
            100% coincidencia
          </div>
        </div>
      </div>
    ),
    size
  );
}
