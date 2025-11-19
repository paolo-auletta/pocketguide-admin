import { NextRequest, NextResponse } from 'next/server';
import db from '@/db';
import { cities } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { requireAdmin, ApiResponse } from '@/lib/admin-auth';

async function fetchGooglePlaceId(query: string): Promise<string | null> {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    console.warn('GOOGLE_MAPS_API_KEY not set, skipping Google Places lookup');
    return null;
  }

  const url = new URL('https://maps.googleapis.com/maps/api/place/findplacefromtext/json');
  url.searchParams.set('input', query);
  url.searchParams.set('inputtype', 'textquery');
  url.searchParams.set('fields', 'place_id');
  url.searchParams.set('key', apiKey);

  try {
    const res = await fetch(url.toString());
    if (!res.ok) {
      console.error('Google Places API error status:', res.status, await res.text());
      return null;
    }

    const data = await res.json();
    if (Array.isArray(data.candidates) && data.candidates.length > 0 && data.candidates[0].place_id) {
      return data.candidates[0].place_id as string;
    }

    return null;
  } catch (error) {
    console.error('Google Places API request failed:', error);
    return null;
  }
}

export async function POST(req: NextRequest): Promise<NextResponse<ApiResponse>> {
  const adminCheck = await requireAdmin();
  if (adminCheck.error) {
    return adminCheck.response!;
  }

  try {
    const body = await req.json();
    const name = typeof body.name === 'string' ? body.name.trim() : '';
    const cityId = body.cityId as unknown;

    if (!name) {
      return NextResponse.json(
        { error: 'Invalid request', details: 'Missing or empty name' },
        { status: 400 }
      );
    }

    if (typeof cityId !== 'string' || !cityId.match(/^[0-9a-f-]{36}$/i)) {
      return NextResponse.json(
        { error: 'Invalid request', details: 'Missing or invalid cityId' },
        { status: 400 }
      );
    }

    const cityRows = await db
      .select({ name: cities.name, country: cities.country })
      .from(cities)
      .where(eq(cities.id, cityId))
      .limit(1);

    if (!cityRows[0]) {
      return NextResponse.json(
        { error: 'City not found' },
        { status: 404 }
      );
    }

    const city = cityRows[0];
    const parts = [name];
    if (city.name) parts.push(city.name);
    if (city.country) parts.push(city.country);
    const query = parts.join(', ');

    const placeId = await fetchGooglePlaceId(query);

    return NextResponse.json({ data: { placeId } });
  } catch (error) {
    console.error('Error fetching Google Place ID:', error);
    return NextResponse.json(
      { error: 'Failed to fetch Google Place ID' },
      { status: 500 }
    );
  }
}
