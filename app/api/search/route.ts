import { NextResponse } from 'next/server';
import { searchCards } from '@/lib/search';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q') ?? '';

  return NextResponse.json({ query: q.trim(), results: searchCards(q) });
}
