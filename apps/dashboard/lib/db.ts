import { put, list } from '@vercel/blob';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';
import { ErrorLog } from './types';

// ------------------------------------------------------------------
// Determine storage backend
// ------------------------------------------------------------------
const IS_VERCEL = process.env.VERCEL === '1';
const BLOB_TOKEN = process.env.BLOB_READ_WRITE_TOKEN;

// Only use Blob if we have a token, OR if we're on Vercel
const USE_BLOB = !!(BLOB_TOKEN) || IS_VERCEL;

// Local JSON fallback (only used locally, not on Vercel)
const DATA_DIR = path.join(process.cwd(), 'data');
const ERRORS_FILE = path.join(DATA_DIR, 'errors.json');
let localCache: ErrorLog[] = [];

if (!USE_BLOB) {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (fs.existsSync(ERRORS_FILE)) {
    try {
      localCache = JSON.parse(fs.readFileSync(ERRORS_FILE, 'utf-8'));
    } catch (e) {
      console.error('Failed to load local errors:', e);
    }
  }
  console.log('📁 Using local JSON file storage');
} else {
  if (!BLOB_TOKEN) {
    throw new Error(
      'BLOB_READ_WRITE_TOKEN is required when running on Vercel. ' +
      'Add it in your project settings: Settings → Environment Variables'
    );
  }
  console.log('☁️  Using Vercel Blob storage');
}

async function safeFetchJson(url: string, init?: RequestInit) {
  try {
    const res = await fetch(url, init);
    if (!res.ok) {
      throw new Error(`Blob fetch failed with status ${res.status}`);
    }
    const text = await res.text();
    return JSON.parse(text);
  } catch (err) {
    console.error(`Failed to fetch/parse blob at ${url}`, err);
    // Log the first 200 characters of the response if we got a text body
    try {
      const res = await fetch(url, init);
      const text = await res.text();
      console.error('Blob response preview:', text.substring(0, 200));
    } catch { }
    return null; // or return an appropriate default (e.g., [])
  }
}

// ------------------------------------------------------------------
// Read / Write helpers
// ------------------------------------------------------------------
async function readErrors(): Promise<ErrorLog[]> {
  if (USE_BLOB) {
    try {
      const { blobs } = await list({ prefix: 'errors.json' });
      if (blobs.length > 0) {
        const url = blobs[0].url;
        const response = await fetch(url, {
          headers: { Authorization: `Bearer ${process.env.BLOB_READ_WRITE_TOKEN}` },
        });
        const text = await response.text();
        try {
          return JSON.parse(text);
        } catch {
          console.warn('⚠️  Blob returned non‑JSON, using in‑memory fallback');
          return localCache;
        }
      }
    } catch (e) {
      console.error('Failed to read from Blob:', e);
    }
    return localCache;
  }
  return [...localCache];
}

async function writeErrors(errors: ErrorLog[]): Promise<void> {
  // Always update local in‑memory cache
  localCache = errors;

  if (USE_BLOB) {
    try {
      await put('errors.json', JSON.stringify(errors, null, 2), {
        access: 'private',
        addRandomSuffix: false,
        allowOverwrite: true,
      });
    } catch (e) {
      console.warn('⚠️  Failed to write to Blob, using in‑memory fallback');
      // If local file exists (dev), write to it as well
      if (!IS_VERCEL) {
        fs.writeFileSync(ERRORS_FILE, JSON.stringify(errors, null, 2), 'utf-8');
      }
    }
  } else {
    // Already handled for file-based storage
    if (fs.existsSync(DATA_DIR) || !USE_BLOB) {
      fs.writeFileSync(ERRORS_FILE, JSON.stringify(errors, null, 2), 'utf-8');
    }
  }
}

// ------------------------------------------------------------------
// Public API
// ------------------------------------------------------------------
export async function saveError(error: ErrorLog) {
  const errors = await readErrors();
  const newError: ErrorLog = {
    ...error,
    id: error.id || uuidv4(),
    created_at: error.created_at || new Date().toISOString(),
    metadata: typeof error.metadata === 'string' ? error.metadata : JSON.stringify(error.metadata || {}),
  };
  errors.push(newError);
  await writeErrors(errors);
  return newError.id;
}

export function getDateFilter(dateRange: string): string | null {
  const now = new Date();
  switch (dateRange) {
    case 'today':
      return now.toISOString().split('T')[0];
    case 'yesterday':
      const yesterday = new Date(now.getTime() - 86400000);
      return yesterday.toISOString().split('T')[0];
    case '7d':
      const sevenDays = new Date(now.getTime() - 7 * 86400000);
      return sevenDays.toISOString();
    case '30d':
      const thirtyDays = new Date(now.getTime() - 30 * 86400000);
      return thirtyDays.toISOString();
    case '90d':
      const ninetyDays = new Date(now.getTime() - 90 * 86400000);
      return ninetyDays.toISOString();
    default:
      return null; // all time
  }
}

export async function getErrors({
  limit = 20,
  offset = 0,
  level,
  resolved,
  search,
  dateRange = 'all',
}: {
  limit?: number;
  offset?: number;
  level?: string;
  resolved?: string;
  search?: string;
  dateRange?: string;
} = {}) {
  let errors = await readErrors();

  if (level) errors = errors.filter(e => e.level === level);
  if (resolved !== undefined && resolved !== '') {
    errors = errors.filter(e => e.resolved === (resolved === '1' ? 1 : 0));
  }
  if (search) {
    const s = search.toLowerCase();
    errors = errors.filter(e =>
      (e.message && e.message.toLowerCase().includes(s)) ||
      (e.url && e.url.toLowerCase().includes(s)) ||
      (e.stack_trace && e.stack_trace.toLowerCase().includes(s))
    );
  }

  const dateFilter = getDateFilter(dateRange);
  if (dateFilter) {
    if (dateRange === 'today' || dateRange === 'yesterday') {
      // Exact date match
      errors = errors.filter(e => e.created_at?.startsWith(dateFilter));
    } else {
      // Greater than or equal
      errors = errors.filter(e => e.created_at && new Date(e.created_at) >= new Date(dateFilter));
    }
  }

  errors.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const total = errors.length;
  const paged = errors.slice(offset, offset + limit);

  return {
    errors: paged,
    pagination: { total, limit, offset, has_more: offset + limit < total },
  };
}

export async function getError(id: string) {
  const errors = await readErrors();
  return errors.find(e => e.id === id) || null;
}

export async function updateError(id: string, updates: Partial<ErrorLog>) {
  const errors = await readErrors();
  const index = errors.findIndex(e => e.id === id);
  if (index === -1) throw new Error('Error not found');
  errors[index] = { ...errors[index], ...updates };
  await writeErrors(errors);
}

export async function deleteError(id: string) {
  let errors = await readErrors();
  errors = errors.filter(e => e.id !== id);
  await writeErrors(errors);
}

export async function getStats() {
  const errors = await readErrors();
  const total = errors.length;
  const unresolved = errors.filter(e => !e.resolved).length;
  const today = new Date().toISOString().split('T')[0];
  const todayCount = errors.filter(e => e.created_at.startsWith(today)).length;

  const byLevel: Record<string, number> = {};
  errors.forEach(e => { byLevel[e.level] = (byLevel[e.level] || 0) + 1; });

  const recent = [...errors]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);

  return {
    total,
    unresolved,
    today: todayCount,
    by_level: Object.entries(byLevel).map(([level, count]) => ({ level, count })),
    recent_errors: recent,
  };
}