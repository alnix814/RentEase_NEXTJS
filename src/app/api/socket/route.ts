import { NextResponse } from 'next/server';
import { initSocket } from '@/lib/socket';

export async function GET(req: Request) {
  try {
    const response = NextResponse.json({ success: true });
    initSocket(response as any);
    return response;
  } catch (error) {
    console.error('Socket initialization error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
} 