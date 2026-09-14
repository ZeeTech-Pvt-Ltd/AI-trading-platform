import { NextResponse } from 'next/server';
import { getSearchIndex } from '@/lib/search';

// Statically generated at build time — the review index is fixed content, so
// this is a tiny, immutable JSON payload served from the CDN (no runtime work).
export const dynamic = 'force-static';

export function GET() {
  return NextResponse.json(getSearchIndex());
}
