import { ImageResponse } from 'next/og';
import { getPost, getCard } from '@/lib/data';
import { brandName, ratingVerdict } from '@/lib/format';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPost('trading', slug);
  const card = getCard('trading', slug);
  const name = post ? brandName(post.title) : slug;
  const rating = card?.ratingValue;
  const verdict = ratingVerdict(rating);

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '64px',
          background: 'linear-gradient(135deg, #fbefe8 0%, #ffffff 65%)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div
            style={{
              display: 'flex',
              width: 48,
              height: 48,
              borderRadius: 12,
              background: '#b84c0e',
            }}
          />
          <div style={{ display: 'flex', fontSize: 28, fontWeight: 700, color: '#1c1917' }}>
            <span>AI Trading&nbsp;</span>
            <span style={{ color: '#b84c0e' }}>Platform</span>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 18, maxWidth: 880 }}>
          <div
            style={{
              display: 'flex',
              fontSize: 22,
              fontWeight: 700,
              color: '#b84c0e',
              textTransform: 'uppercase',
              letterSpacing: 3,
            }}
          >
            Platform Review
          </div>
          <div style={{ display: 'flex', fontSize: 68, fontWeight: 800, color: '#1c1917', lineHeight: 1.1 }}>
            {name}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          {rating ? (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                width: 132,
                height: 132,
                borderRadius: '50%',
                border: '7px solid #b84c0e',
                background: '#fff',
              }}
            >
              <div style={{ display: 'flex', fontSize: 42, fontWeight: 800, color: '#1c1917' }}>
                {rating}
              </div>
              <div style={{ display: 'flex', fontSize: 16, fontWeight: 600, color: '#78716c' }}>
                out of 5
              </div>
            </div>
          ) : null}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ display: 'flex', fontSize: 22, fontWeight: 700, color: '#1c1917' }}>
              {verdict.label}
            </div>
            <div style={{ display: 'flex', fontSize: 18, color: '#78716c' }}>
              Independent, fact-checked review
            </div>
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
