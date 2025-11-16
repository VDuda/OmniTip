import { NextResponse } from 'next/server';
import { getScores, CONTRACT_ADDRESS } from '@/lib/contract';

export async function GET() {
  try {
    if (!CONTRACT_ADDRESS) {
      // Return mock scores if contract not deployed
      return NextResponse.json({ england: 0, argentina: 0 });
    }
    const scores = await getScores();
    return NextResponse.json(scores);
  } catch (e: any) {
    console.error('Failed to fetch scores:', e.message);
    return NextResponse.json({ england: 0, argentina: 0 });
  }
}
