import { supabaseAdmin } from './supabase';
import { ErrorLog, TrackErrTraceEvent } from './types';

// ------------------------------------------------------------------
// Errors
// ------------------------------------------------------------------
export async function saveError(error: ErrorLog) {
  const { data, error: dbError } = await supabaseAdmin
    .from('errors')
    .insert({
      id: error.id,
      level: error.level || 'error',
      message: error.message,
      url: error.url,
      stack_trace: error.stack_trace,
      metadata: typeof error.metadata === 'string'
        ? JSON.parse(error.metadata)
        : error.metadata || {},
      resolved: error.resolved || 0,
      created_at: error.created_at || new Date().toISOString(),
    })
    .select('id')
    .single();

  if (dbError) {
    console.error('Error saving error:', dbError);
    throw dbError;
  }

  return data.id;
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
  let query = supabaseAdmin
    .from('errors')
    .select('*', { count: 'exact' });

  // Filters
  if (level) {
    query = query.eq('level', level);
  }
  if (resolved !== undefined && resolved !== '') {
    query = query.eq('resolved', resolved === '1' ? 1 : 0);
  }
  if (search) {
    query = query.or(
      `message.ilike.%${search}%,url.ilike.%${search}%,stack_trace.ilike.%${search}%`
    );
  }

  // Date filter
  const dateFilter = getDateFilter(dateRange);
  if (dateFilter) {
    query = query.gte('created_at', dateFilter);
  }

  // Pagination
  const from = offset;
  const to = offset + limit - 1;

  const { data, count, error: dbError } = await query
    .order('created_at', { ascending: false })
    .range(from, to);

  if (dbError) {
    console.error('Error fetching errors:', dbError);
    throw dbError;
  }

  return {
    errors: data || [],
    pagination: {
      total: count || 0,
      limit,
      offset,
      has_more: (count || 0) > offset + limit,
    },
  };
}

export async function getError(id: string) {
  const { data, error } = await supabaseAdmin
    .from('errors')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching error:', error);
    return null;
  }

  return data;
}

export async function updateError(id: string, updates: Partial<ErrorLog>) {
  const { error } = await supabaseAdmin
    .from('errors')
    .update({
      ...(updates.resolved !== undefined && { resolved: updates.resolved }),
      ...(updates.message && { message: updates.message }),
    })
    .eq('id', id);

  if (error) {
    console.error('Error updating error:', error);
    throw error;
  }
}

export async function deleteError(id: string) {
  const { error } = await supabaseAdmin
    .from('errors')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting error:', error);
    throw error;
  }
}

export async function clearErrors() {
  const { error } = await supabaseAdmin
    .from('errors')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

  if (error) {
    console.error('Error clearing errors:', error);
    throw error;
  }
}

export async function getErrorStats() {
  const { data: total, error: totalError } = await supabaseAdmin
    .from('errors')
    .select('*', { count: 'exact', head: true });

  const { data: unresolved, error: unresolvedError } = await supabaseAdmin
    .from('errors')
    .select('*', { count: 'exact', head: true })
    .eq('resolved', 0);

  const today = new Date().toISOString().split('T')[0];
  const { data: todayData, error: todayError } = await supabaseAdmin
    .from('errors')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', today);

  // By level
  const { data: byLevel, error: levelError } = await supabaseAdmin
    .from('errors')
    .select('level')
    .then(({ data }) => {
      const counts: Record<string, number> = {};
      data?.forEach((e: any) => {
        counts[e.level] = (counts[e.level] || 0) + 1;
      });
      return {
        data: Object.entries(counts).map(([level, count]) => ({ level, count })),
        error: null,
      };
    });

  // Recent errors
  const { data: recent, error: recentError } = await supabaseAdmin
    .from('errors')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5);

  return {
    total: total?.length || 0,
    unresolved: unresolved?.length || 0,
    today: todayData?.length || 0,
    by_level: byLevel || [],
    recent_errors: recent || [],
  };
}

// ------------------------------------------------------------------
// Events
// ------------------------------------------------------------------
export async function saveEvent(event: {
  id?: string;
  name: string;
  properties?: Record<string, any>;
  timestamp?: string;
  environment?: string;
  tags?: string[];
  user?: any;
}) {
  const { data, error: dbError } = await supabaseAdmin
    .from('events')
    .insert({
      id: event.id || undefined,
      user_id: event.user.id,
      name: event.name,
      url: event.properties?.path || event.properties?.url || null,
      metadata: {
        ...event.properties,
        user: event.user,
        tags: event.tags,
        environment: event.environment,
      },
      created_at: event.timestamp || new Date().toISOString(),
    })
    .select('id')
    .single();

  if (dbError) {
    console.error('Error saving event:', dbError);
    throw dbError;
  }

  return data.id;
}

export async function getEvents({
  limit = 50,
  name,
  dateRange = 'all',
}: {
  limit?: number;
  name?: string;
  dateRange?: string;
} = {}) {
  let query = supabaseAdmin
    .from('events')
    .select('*', { count: 'exact' });

  if (name) {
    query = query.eq('name', name);
  }

  const dateFilter = getDateFilter(dateRange);
  if (dateFilter) {
    query = query.gte('created_at', dateFilter);
  }

  const { data, count, error } = await query
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching events:', error);
    throw error;
  }

  return {
    events: data || [],
    total: count || 0,
  };
}

export async function deleteEvent(id: string) {
  const { error } = await supabaseAdmin
    .from('events')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting event:', error);
    throw error;
  }
}

export async function clearEvents() {
  const { error } = await supabaseAdmin
    .from('events')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000');

  if (error) {
    console.error('Error clearing events:', error);
    throw error;
  }
}

export async function getEventStats() {
  const { data: total, error: totalError } = await supabaseAdmin
    .from('events')
    .select('*', { count: 'exact', head: true });

  const today = new Date().toISOString().split('T')[0];
  const { data: todayData } = await supabaseAdmin
    .from('events')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', today);

  // Top events
  const { data: topEvents } = await supabaseAdmin
    .from('events')
    .select('name');

  const eventCounts: Record<string, number> = {};
  topEvents?.forEach((e: any) => {
    eventCounts[e.name] = (eventCounts[e.name] || 0) + 1;
  });

  const sorted = Object.entries(eventCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([name, count]) => ({ name, count }));

  // Events per hour (last 24h)
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { data: hourlyData } = await supabaseAdmin
    .from('events')
    .select('created_at')
    .gte('created_at', twentyFourHoursAgo);

  const hourlyEvents: Record<string, number> = {};
  for (let i = 23; i >= 0; i--) {
    const hour = new Date(Date.now() - i * 3600000);
    const hourKey = hour.toISOString().substring(0, 13);
    hourlyEvents[hourKey] = 0;
  }

  hourlyData?.forEach((e: any) => {
    const eventHour = e.created_at.substring(0, 13);
    if (hourlyEvents[eventHour] !== undefined) {
      hourlyEvents[eventHour]++;
    }
  });

  return {
    total: total?.length || 0,
    today: todayData?.length || 0,
    topEvents: sorted,
    eventTimeline: Object.entries(hourlyEvents).map(([hour, count]) => ({
      hour,
      count,
    })),
  };
}

// ------------------------------------------------------------------
// Helpers
// ------------------------------------------------------------------
function getDateFilter(dateRange: string): string | null {
  const now = new Date();
  switch (dateRange) {
    case 'today':
      return now.toISOString().split('T')[0];
    case 'yesterday': {
      const yesterday = new Date(now.getTime() - 86400000);
      return yesterday.toISOString().split('T')[0];
    }
    case '7d':
      return new Date(now.getTime() - 7 * 86400000).toISOString();
    case '30d':
      return new Date(now.getTime() - 30 * 86400000).toISOString();
    case '90d':
      return new Date(now.getTime() - 90 * 86400000).toISOString();
    default:
      return null;
  }
}