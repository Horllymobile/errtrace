import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase';

export async function GET() {
  try {
    // Total errors
    const { count: total } = await supabaseAdmin
      .from('errors')
      .select('*', { count: 'exact', head: true });

    // Unresolved
    const { count: unresolved } = await supabaseAdmin
      .from('errors')
      .select('*', { count: 'exact', head: true })
      .eq('resolved', 0);

    // Today
    const today = new Date().toISOString().split('T')[0];
    const { count: todayCount } = await supabaseAdmin
      .from('errors')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', today);

    // By level
    const { data: allErrors } = await supabaseAdmin
      .from('errors')
      .select('level');

    const byLevel: Record<string, number> = {};
    allErrors?.forEach((e: any) => {
      byLevel[e.level] = (byLevel[e.level] || 0) + 1;
    });

    // Recent errors
    const { data: recent } = await supabaseAdmin
      .from('errors')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);

    return NextResponse.json({
      total: total || 0,
      unresolved: unresolved || 0,
      today: todayCount || 0,
      by_level: Object.entries(byLevel).map(([level, count]) => ({ level, count })),
      recent_errors: recent || [],
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json(
      { error: 'Internal server error', total: 0, unresolved: 0, today: 0, by_level: [], recent_errors: [] },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-ErrTrace-Key',
      'Access-Control-Max-Age': '86400',
    },
  });
}