import { NextResponse } from 'next/server';
import { clearErrors } from '@/lib/db';

export async function DELETE() {
  try {
    await clearErrors();
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to clear errors' }, { status: 500 });
  }
}