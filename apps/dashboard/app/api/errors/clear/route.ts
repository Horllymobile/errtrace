import { NextResponse } from 'next/server';
import { put, list } from '@vercel/blob';
import fs from 'fs';
import path from 'path';

const BLOB_TOKEN = process.env.BLOB_READ_WRITE_TOKEN;
const DATA_DIR = path.join(process.cwd(), 'data');
const ERRORS_FILE = path.join(DATA_DIR, 'errors.json');

export async function DELETE() {
  try {
    if (BLOB_TOKEN) {
      // Overwrite with empty array
      await put('errors.json', JSON.stringify([], null, 2), {
        access: 'private',
        allowOverwrite: true,
      });
    } else {
      // Local JSON
      if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
      fs.writeFileSync(ERRORS_FILE, JSON.stringify([], null, 2), 'utf-8');
    }

    return NextResponse.json({ success: true, message: 'All errors cleared' });
  } catch (error) {
    console.error('Error clearing errors:', error);
    return NextResponse.json(
      { error: 'Failed to clear errors' },
      { status: 500 }
    );
  }
}