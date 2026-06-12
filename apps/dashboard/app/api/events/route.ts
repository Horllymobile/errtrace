import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { put, list } from '@vercel/blob';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, properties, timestamp, user, tags, environment } = body;

    if (!name) {
      return NextResponse.json({ error: 'Event name required' }, { status: 400 });
    }

    // Load existing events
    let events: any[] = [];
    try {
      const { blobs } = await list({ prefix: 'events.json' });
      if (blobs.length > 0) {
        const response = await fetch(blobs[0].url, {
          headers: { Authorization: `Bearer ${process.env.BLOB_READ_WRITE_TOKEN}` },
        });
        const text = await response.text();
        events = JSON.parse(text);
      }
    } catch (e) {
      // Start fresh
    }

    const event = {
      id: body.id || uuidv4(),
      name,
      properties: properties || {},
      timestamp: timestamp || new Date().toISOString(),
      user,
      tags,
      environment,
    };

    events.push(event);

    await put('events.json', JSON.stringify(events, null, 2), {
      access: 'private',
      allowOverwrite: true,
    });

    return NextResponse.json({ success: true, event_id: event.id }, { status: 201 });
  } catch (error) {
    console.error('Error tracking event:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { blobs } = await list({ prefix: 'events.json' });
    if (blobs.length > 0) {
      const response = await fetch(blobs[0].url, {
        headers: { Authorization: `Bearer ${process.env.BLOB_READ_WRITE_TOKEN}` },
      });
      const text = await response.text();
      const events = JSON.parse(text);

      const searchParams = request.nextUrl.searchParams;
      const limit = parseInt(searchParams.get('limit') || '50');
      const name = searchParams.get('name');

      let filtered = events;
      if (name) {
        filtered = filtered.filter((e: any) => e.name === name);
      }

      // Sort newest first
      filtered.sort((a: any, b: any) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );

      const total = filtered.length;
      const paged = filtered.slice(0, limit);

      return NextResponse.json({ events: paged, total });
    }
    return NextResponse.json({ events: [], total: 0 });
  } catch (error) {
    console.error('Error fetching events:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}