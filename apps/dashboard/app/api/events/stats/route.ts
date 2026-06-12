import { NextResponse } from 'next/server';
import { list } from '@vercel/blob';
import fs from 'fs';
import path from 'path';

const BLOB_TOKEN = process.env.BLOB_READ_WRITE_TOKEN;
const DATA_DIR = path.join(process.cwd(), 'data');
const EVENTS_FILE = path.join(DATA_DIR, 'events.json');

async function getEvents(): Promise<any[]> {
  if (BLOB_TOKEN) {
    try {
      const { blobs } = await list({ prefix: 'events.json' });
      if (blobs.length > 0) {
        const response = await fetch(blobs[0].url, {
          headers: { Authorization: `Bearer ${BLOB_TOKEN}` },
        });
        const text = await response.text();
        return JSON.parse(text);
      }
    } catch (e) {
      console.error('Failed to read events from Blob:', e);
    }
    return [];
  }
  
  // Local JSON fallback
  if (fs.existsSync(EVENTS_FILE)) {
    try {
      return JSON.parse(fs.readFileSync(EVENTS_FILE, 'utf-8'));
    } catch (e) {
      console.error('Failed to read local events:', e);
    }
  }
  return [];
}

export async function GET() {
  try {
    const events = await getEvents();
    const total = events.length;
    
    // Today's events
    const today = new Date().toISOString().split('T')[0];
    const todayCount = events.filter(e => e.timestamp?.startsWith(today)).length;
    
    // Top event names
    const eventCounts: Record<string, number> = {};
    events.forEach(e => {
      eventCounts[e.name] = (eventCounts[e.name] || 0) + 1;
    });
    
    const topEvents = Object.entries(eventCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }));
    
    // Unique users
    const uniqueUsers = new Set(
      events
        .filter(e => e.user?.id || e.user?.email)
        .map(e => e.user?.id || e.user?.email)
    ).size;
    
    // Events per hour (last 24 hours)
    const hourlyEvents: Record<string, number> = {};
    const now = new Date();
    for (let i = 23; i >= 0; i--) {
      const hour = new Date(now.getTime() - i * 3600000);
      const hourKey = hour.toISOString().substring(0, 13); // YYYY-MM-DDTHH
      hourlyEvents[hourKey] = 0;
    }
    
    events.forEach(e => {
      if (e.timestamp) {
        const eventHour = e.timestamp.substring(0, 13);
        if (hourlyEvents[eventHour] !== undefined) {
          hourlyEvents[eventHour]++;
        }
      }
    });
    
    const eventTimeline = Object.entries(hourlyEvents).map(([hour, count]) => ({
      hour,
      count,
    }));
    
    return NextResponse.json({
      total,
      today: todayCount,
      uniqueUsers,
      topEvents,
      eventTimeline,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error fetching event stats:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}