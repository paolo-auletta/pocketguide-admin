import { NextRequest, NextResponse } from 'next/server';
import db from '@/db';
import { locations, cities } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { LocationCreate, LocationUpdate, LocationCreateInput, LocationUpdateInput } from '@/validation';
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

async function updateGooglePlacesIdForLocation(locationId: string, name: string, cityId: string) {
  try {
    const cityRows = await db
      .select({ name: cities.name, country: cities.country })
      .from(cities)
      .where(eq(cities.id, cityId))
      .limit(1);

    const city = cityRows[0];
    const parts = [name];
    if (city?.name) parts.push(city.name);
    if (city?.country) parts.push(city.country);
    const query = parts.join(', ');

    const placeId = await fetchGooglePlaceId(query);
    if (!placeId) return;

    await db
      .update(locations)
      .set({ google_places_id: placeId })
      .where(eq(locations.id, locationId));
  } catch (error) {
    console.error('Failed to update google_places_id for location', locationId, error);
  }
}

export async function POST(req: NextRequest): Promise<NextResponse<ApiResponse>> {
  const adminCheck = await requireAdmin();
  if (adminCheck.error) {
    return adminCheck.response!;
  }

  try {
    const body = await req.json();

    const validationResult = LocationCreate.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Invalid request',
          details: validationResult.error.issues,
        },
        { status: 400 }
      );
    }

    const data: LocationCreateInput = validationResult.data;

    const guideValue =
      typeof data.guide === 'string'
        ? data.guide
        : data.guide
        ? JSON.stringify(data.guide)
        : null;

    const result = await db
      .insert(locations)
      .values({
        name: data.name,
        is_draft: data.is_draft ?? true,
        description: data.description || null,
        type: data.type,
        images: data.images && data.images.length > 0 ? data.images : null,
        embedded_links: data.embedded_links && data.embedded_links.length > 0 ? data.embedded_links : null,
        city: data.city,
        street: data.street || null,
        guide: guideValue,
        is_guide_premium: data.is_guide_premium ?? false,
        longitude: data.longitude,
        latitude: data.latitude,
        priceLow: data.priceLow ?? null,
        priceHigh: data.priceHigh ?? null,
        timeLow: data.timeLow ?? null,
        timeHigh: data.timeHigh ?? null,
        google_places_id: data.google_places_id || null,
        allow_getyourguide_search:
          typeof data.allow_getyourguide_search === 'boolean'
            ? data.allow_getyourguide_search
            : true,
        website: data.website || null,
        maps_url: data.maps_url || null,
        price_level: data.price_level ?? null,
        rating: data.rating ?? null,
        user_ratings_total: data.user_ratings_total ?? null,
        google_photos: data.google_photos && data.google_photos.length > 0 ? data.google_photos : null,
      })
      .returning();

    if (!result[0]) {
      return NextResponse.json(
        { error: 'Failed to create location' },
        { status: 500 }
      );
    }

    const created = result[0] as { id: string; name: string; city: string };
    await updateGooglePlacesIdForLocation(created.id, created.name, created.city);

    return NextResponse.json({ data: created }, { status: 201 });
  } catch (error) {
    console.error('Error creating location:', error);
    return NextResponse.json(
      { error: 'Failed to create location' },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest): Promise<NextResponse<ApiResponse>> {
  const adminCheck = await requireAdmin();
  if (adminCheck.error) {
    return adminCheck.response!;
  }

  try {
    const body = await req.json();

    // Extract and validate ID
    const id = body.id as unknown;
    if (typeof id !== 'string' || !id.match(/^[0-9a-f-]{36}$/i)) {
      return NextResponse.json(
        { error: 'Invalid request', details: 'Missing or invalid id' },
        { status: 400 }
      );
    }

    // Validate update data
    const validationResult = LocationUpdate.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Invalid request',
          details: validationResult.error.issues,
        },
        { status: 400 }
      );
    }

    const updateData: LocationUpdateInput = validationResult.data;

    // Verify location exists
    const existingLocation = await db
      .select()
      .from(locations)
      .where(eq(locations.id, id))
      .limit(1);

    if (!existingLocation.length) {
      return NextResponse.json(
        { error: 'Location not found' },
        { status: 404 }
      );
    }

    // Update only provided fields - Drizzle handles arrays natively
    const updateValues: Record<string, unknown> = {};
    if (updateData.name !== undefined) updateValues.name = updateData.name;
    if (updateData.is_draft !== undefined) updateValues.is_draft = updateData.is_draft;
    if (updateData.description !== undefined) updateValues.description = updateData.description;
    if (updateData.priceLow !== undefined) updateValues.priceLow = updateData.priceLow;
    if (updateData.priceHigh !== undefined) updateValues.priceHigh = updateData.priceHigh;
    if (updateData.timeLow !== undefined) updateValues.timeLow = updateData.timeLow;
    if (updateData.timeHigh !== undefined) updateValues.timeHigh = updateData.timeHigh;
    if (updateData.type !== undefined) updateValues.type = updateData.type;
    if (updateData.images !== undefined)
      updateValues.images =
        updateData.images && updateData.images.length > 0 ? updateData.images : null;
    if (updateData.embedded_links !== undefined)
      updateValues.embedded_links =
        updateData.embedded_links && updateData.embedded_links.length > 0
          ? updateData.embedded_links
          : null;
    if (updateData.city !== undefined) updateValues.city = updateData.city;
    if (updateData.street !== undefined) updateValues.street = updateData.street;
    if (updateData.guide !== undefined) {
      updateValues.guide =
        updateData.guide === null
          ? null
          : typeof updateData.guide === 'string'
          ? updateData.guide
          : JSON.stringify(updateData.guide);
    }
    if (updateData.is_guide_premium !== undefined)
      updateValues.is_guide_premium = updateData.is_guide_premium;
    if (updateData.longitude !== undefined) updateValues.longitude = updateData.longitude;
    if (updateData.latitude !== undefined) updateValues.latitude = updateData.latitude;
    if (updateData.google_places_id !== undefined)
      updateValues.google_places_id = updateData.google_places_id;
    if (updateData.allow_getyourguide_search !== undefined)
      updateValues.allow_getyourguide_search = updateData.allow_getyourguide_search;
    if (updateData.website !== undefined) updateValues.website = updateData.website;
    if (updateData.maps_url !== undefined) updateValues.maps_url = updateData.maps_url;
    if (updateData.price_level !== undefined) updateValues.price_level = updateData.price_level;
    if (updateData.rating !== undefined) updateValues.rating = updateData.rating;
    if (updateData.user_ratings_total !== undefined)
      updateValues.user_ratings_total = updateData.user_ratings_total;
    if (updateData.google_photos !== undefined)
      updateValues.google_photos =
        updateData.google_photos && updateData.google_photos.length > 0
          ? updateData.google_photos
          : null;
    
    // Add modified_at timestamp
    updateValues.modified_at = new Date();

    const result = await db
      .update(locations)
      .set(updateValues)
      .where(eq(locations.id, id))
      .returning();

    if (!result[0]) {
      return NextResponse.json(
        { error: 'Failed to update location' },
        { status: 500 }
      );
    }

    const updated = result[0] as { id: string; name: string; city: string };
    await updateGooglePlacesIdForLocation(updated.id, updated.name, updated.city);

    return NextResponse.json({ data: updated });
  } catch (error) {
    console.error('Error updating location:', error);
    return NextResponse.json(
      { error: 'Failed to update location' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest): Promise<NextResponse<ApiResponse>> {
  const adminCheck = await requireAdmin();
  if (adminCheck.error) {
    return adminCheck.response!;
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id || typeof id !== 'string' || !id.match(/^[0-9a-f-]{36}$/i)) {
      return NextResponse.json(
        { error: 'Invalid request', details: 'Missing or invalid id' },
        { status: 400 }
      );
    }

    // Verify location exists before deletion
    const existingLocation = await db
      .select()
      .from(locations)
      .where(eq(locations.id, id))
      .limit(1);

    if (!existingLocation.length) {
      return NextResponse.json(
        { error: 'Location not found' },
        { status: 404 }
      );
    }

    await db.delete(locations).where(eq(locations.id, id));

    return NextResponse.json({ data: { success: true } });
  } catch (error) {
    console.error('Error deleting location:', error);
    return NextResponse.json(
      { error: 'Failed to delete location' },
      { status: 500 }
    );
  }
}
