import { NextRequest, NextResponse } from 'next/server';
import { saveEvent, getEvents } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      properties,
      timestamp,
      user_id,
      user_identifier,
      tags,
      environment,
    } = body;

    if (!name) {
      return NextResponse.json({ error: 'Event name required' }, { status: 400 });
    }

    const eventId = await saveEvent({
      id: body.id || undefined,
      name,
      properties: { ...properties, user: body.user, tags, environment },
      timestamp: timestamp || new Date().toISOString(),
      user_id: user_id || user_identifier || null,   // <-- use whichever is present
    });

    return NextResponse.json({ success: true, event_id: eventId }, { status: 201 });
  } catch (error) {
    console.error('Error tracking event:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '50');
    const name = searchParams.get('name') || undefined;
    const dateRange = searchParams.get('dateRange') || 'all';

    const result = await getEvents({ limit, name, dateRange });

    // console.log(result.events[0]);
    return NextResponse.json({
      events: result.events.map((e: any) => {
        return {
          id: e.id,
          name: e.name,
          properties: e.metadata || {},
          timestamp: e.created_at,
          user: e.metadata.user || e.metadata?.metadata?.user || e.metadata?.user_identifier,
          tags: e.metadata?.tags,
          environment: e.metadata?.environment,
        }
      }),
      total: result.total,
    });
  } catch (error) {
    console.error('Error fetching events:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}