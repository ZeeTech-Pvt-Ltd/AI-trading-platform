import { ImageResponse } from 'next/og';
import { getPost } from '@/lib/data';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPost('bitcoin', slug);
  const title = post?.title ?? slug;
  const author = post?.author ?? '';

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
          background: 'linear-gradient(135deg, #fff7ec 0%, #ffffff 65%)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div
            style={{
              display: 'flex',
              width: 48,
              height: 48,
              borderRadius: 12,
              background: '#f7931a',
            }}
          />
          <div style={{ display: 'flex', fontSize: 28, fontWeight: 700, color: '#1c1917' }}>
            <span>AI Trading&nbsp;</span>
            <span style={{ color: '#b84c0e' }}>Platform</span>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 18, maxWidth: 920 }}>
          <div
            style={{
              display: 'flex',
              fontSize: 22,
              fontWeight: 700,
              color: '#f7931a',
              textTransform: 'uppercase',
              letterSpacing: 3,
            }}
          >
            Bitcoin Article
          </div>
          <div style={{ display: 'flex', fontSize: 60, fontWeight: 800, color: '#1c1917', lineHeight: 1.15 }}>
            {title}
          </div>
        </div>

        <div style={{ display: 'flex', fontSize: 20, color: '#78716c' }}>
          {author ? `By ${author}` : 'Deep technical writing on Bitcoin development'}
        </div>
      </div>
    ),
    { ...size },
  );
}
