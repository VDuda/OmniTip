import { NextResponse } from 'next/server';
import { getTips } from '@/lib/db';

export async function GET() {
  try {
    const tips = getTips(50);
    return NextResponse.json({ tips });
  } catch (e) {
    return NextResponse.json({ tips: [] });
  }
}
