import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET() {
  try {
    // Total events
    const { count: total } = await supabaseAdmin
      .from('events')
      .select('*', { count: 'exact', head: true });

    // Today's events
    const today = new Date().toISOString().split('T')[0];
    const { count: todayCount } = await supabaseAdmin
      .from('events')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', today);

    // Top events
    const { data: allEvents } = await supabaseAdmin
      .from('events')
      .select('name');

    const eventCounts: Record<string, number> = {};
    allEvents?.forEach((e: any) => {
      eventCounts[e.name] = (eventCounts[e.name] || 0) + 1;
    });

    const topEvents = Object.entries(eventCounts)
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

    return NextResponse.json({
      total: total || 0,
      today: todayCount || 0,
      uniqueUsers: 0, // Add user tracking later
      topEvents,
      eventTimeline: Object.entries(hourlyEvents).map(([hour, count]) => ({
        hour,
        count,
      })),
    });
  } catch (error) {
    console.error('Error fetching event stats:', error);
    return NextResponse.json(
      { error: 'Internal server error', total: 0, today: 0, topEvents: [], eventTimeline: [] },
      { status: 500 }
    );
  }
}