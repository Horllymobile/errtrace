import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { ErrorLog } from './types';

// ------------------------------------------------------------------
// JSON file store (no native modules, works on all platforms)
// ------------------------------------------------------------------
const DATA_DIR = path.join(process.cwd(), 'data');
const ERRORS_FILE = path.join(DATA_DIR, 'errors.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// In‑memory cache (loaded from disk)
let errorsCache: ErrorLog[] = [];

function loadErrors(): ErrorLog[] {
  try {
    if (fs.existsSync(ERRORS_FILE)) {
      const raw = fs.readFileSync(ERRORS_FILE, 'utf-8');
      return JSON.parse(raw);
    }
  } catch (error) {
    console.error('Failed to load errors, starting fresh:', error);
  }
  return [];
}

function saveErrors(errors: ErrorLog[]) {
  fs.writeFileSync(ERRORS_FILE, JSON.stringify(errors, null, 2), 'utf-8');
}

// Initialize cache
errorsCache = loadErrors();

// ------------------------------------------------------------------
// Public API (same signatures as before)
// ------------------------------------------------------------------
export async function saveError(error: ErrorLog) {
  const newError: ErrorLog = {
    ...error,
    id: error.id || uuidv4(),
    created_at: error.created_at || new Date().toISOString(),
    metadata: typeof error.metadata === 'string' ? error.metadata : JSON.stringify(error.metadata || {}),
  };
  errorsCache.push(newError);
  saveErrors(errorsCache);
  return newError.id;
}

export async function getErrors({
  limit = 20,
  offset = 0,
  level,
  resolved,
  search,
}: {
  limit?: number;
  offset?: number;
  level?: string;
  resolved?: string;
  search?: string;
} = {}) {
  let filtered = [...errorsCache];

  if (level) {
    filtered = filtered.filter(e => e.level === level);
  }
  if (resolved !== undefined && resolved !== '') {
    const isResolved = resolved === '1' ? 1 : 0;
    filtered = filtered.filter(e => e.resolved === isResolved);
  }
  if (search) {
    const s = search.toLowerCase();
    filtered = filtered.filter(e =>
      (e.message && e.message.toLowerCase().includes(s)) ||
      (e.url && e.url.toLowerCase().includes(s)) ||
      (e.stack_trace && e.stack_trace.toLowerCase().includes(s))
    );
  }

  // Sort newest first
  filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const total = filtered.length;
  const paged = filtered.slice(offset, offset + limit);

  return {
    errors: paged.map(e => ({
      ...e,
      metadata: typeof e.metadata === 'string' ? JSON.parse(e.metadata) : e.metadata,
    })),
    pagination: {
      total,
      limit,
      offset,
      has_more: offset + limit < total,
    },
  };
}

export async function getError(id: string) {
  const error = errorsCache.find(e => e.id === id) || null;
  if (!error) return null;
  return {
    ...error,
    metadata: typeof error.metadata === 'string' ? JSON.parse(error.metadata) : error.metadata,
  };
}

export async function updateError(id: string, updates: Partial<ErrorLog>) {
  const index = errorsCache.findIndex(e => e.id === id);
  if (index === -1) throw new Error('Error not found');

  errorsCache[index] = { ...errorsCache[index], ...updates };
  saveErrors(errorsCache);
}

export async function deleteError(id: string) {
  errorsCache = errorsCache.filter(e => e.id !== id);
  saveErrors(errorsCache);
}

export async function getStats() {
  const total = errorsCache.length;
  const unresolved = errorsCache.filter(e => !e.resolved).length;
  const today = new Date().toISOString().split('T')[0];
  const todayCount = errorsCache.filter(e => e.created_at.startsWith(today)).length;

  const byLevel: Record<string, number> = {};
  errorsCache.forEach(e => {
    byLevel[e.level] = (byLevel[e.level] || 0) + 1;
  });

  const recent = [...errorsCache]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5)
    .map(e => ({
      ...e,
      metadata: typeof e.metadata === 'string' ? JSON.parse(e.metadata) : e.metadata,
    }));

  return {
    total,
    unresolved,
    today: todayCount,
    by_level: Object.entries(byLevel).map(([level, count]) => ({ level, count })),
    recent_errors: recent,
  };
}