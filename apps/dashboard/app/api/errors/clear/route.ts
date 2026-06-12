import { NextResponse } from 'next/server';
import { clearEvents } from '@/lib/db';

export async function DELETE() {
  try {
    await clearEvents();
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to clear events' }, { status: 500 });
  }
}