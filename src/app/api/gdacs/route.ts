// src/app/api/gdacs/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const res = await fetch('https://www.gdacs.org/xml/rss.xml', {
      headers: { 'Content-Type': 'application/xml' },
    });
    if (!res.ok) {
      throw new Error(`Failed to fetch GDACS RSS feed: ${res.status} ${res.statusText}`);
    }
    const data = await res.text();
    return NextResponse.json({ data }, { status: 200 });
  } catch (error) {
    console.error('Error in /api/gdacs:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error fetching GDACS data' },
      { status: 500 }
    );
  }
}