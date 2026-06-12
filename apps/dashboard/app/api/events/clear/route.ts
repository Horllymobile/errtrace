import { NextResponse } from 'next/server';
import { put, list } from '@vercel/blob';
import fs from 'fs';
import path from 'path';

const BLOB_TOKEN = process.env.BLOB_READ_WRITE_TOKEN;
const DATA_DIR = path.join(process.cwd(), 'data');
const EVENTS_FILE = path.join(DATA_DIR, 'events.json');

export async function DELETE() {
  try {
    if (BLOB_TOKEN) {
      await put('events.json', JSON.stringify([], null, 2), {
        access: 'private',
        allowOverwrite: true,
      });
    } else {
      if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
      fs.writeFileSync(EVENTS_FILE, JSON.stringify([], null, 2), 'utf-8');
    }

    return NextResponse.json({ success: true, message: 'All events cleared' });
  } catch (error) {
    console.error('Error clearing events:', error);
    return NextResponse.json(
      { error: 'Failed to clear events' },
      { status: 500 }
    );
  }
}