import { NextResponse } from 'next/server';
import { adminScoreGoal } from '@/lib/contract';
import { getAdminWallet } from '@/lib/particle';

export async function POST(request: Request) {
  try {
    const { team, password } = await request.json();
    
    // Simple password check
    if (password !== 'hack2025') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (team !== 'England' && team !== 'Argentina') {
      return NextResponse.json({ error: 'Invalid team' }, { status: 400 });
    }

    // Get admin wallet and submit goal
    const adminWallet = getAdminWallet();
    const txHash = await adminScoreGoal(adminWallet, team);

    return NextResponse.json({ 
      success: true, 
      txHash,
      message: `${team} scored! Transaction: ${txHash}` 
    });
  } catch (e: any) {
    console.error('Admin goal error:', e);
    return NextResponse.json({ 
      error: e.message || 'Failed to score goal' 
    }, { status: 500 });
  }
}
