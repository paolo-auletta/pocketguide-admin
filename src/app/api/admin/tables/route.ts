import { NextRequest, NextResponse } from 'next/server';
import db from '@/db';
import { profiles, cities, locations, trips, locations_trips, tags, locations_tags } from '@/db/schema';
import { requireAdmin } from '@/lib/admin-auth';

/* ======================== Constants ======================== */

const DEFAULT_LIMIT = 1000;
const MAX_LIMIT = 10000;

/* ======================== Handler ======================== */

export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    // Check admin authorization
    const adminCheck = await requireAdmin();
    if (adminCheck.error) {
      return adminCheck.response!;
    }

    // Parse query parameters
    const { searchParams } = new URL(req.url);
    const limit = Math.min(
      Math.max(parseInt(searchParams.get('limit') || String(DEFAULT_LIMIT)), 1),
      MAX_LIMIT
    );
    const table = searchParams.get('table')?.toLowerCase();

    // Fetch specific table or all tables
    let profilesData: Record<string, unknown>[] = [];
    let citiesData: Record<string, unknown>[] = [];
    let locationsData: Record<string, unknown>[] = [];
    let tripsData: Record<string, unknown>[] = [];
    let locationTripsData: Record<string, unknown>[] = [];
    let tagsData: Record<string, unknown>[] = [];
    let locationsTagsData: Record<string, unknown>[] = [];

    if (!table || table === 'profiles') {
      // Select only non-sensitive columns from profiles
      profilesData = await db
        .select({
          id: profiles.id,
          name: profiles.name,
          clerk_id: profiles.clerk_id,
          role: profiles.role,
          plan: profiles.plan,
          created_at: profiles.created_at,
        })
        .from(profiles)
        .limit(limit);
    }

    if (!table || table === 'cities') {
      citiesData = await db.select().from(cities).limit(limit);
    }

    if (!table || table === 'locations') {
      locationsData = await db.select().from(locations).limit(limit);
    }

    if (!table || table === 'trips') {
      tripsData = await db.select().from(trips).limit(limit);
    }

    if (!table || table === 'locations_trips') {
      locationTripsData = await db.select().from(locations_trips).limit(limit);
    }

    if (!table || table === 'tags') {
      tagsData = await db.select().from(tags).limit(limit);
    }

    if (!table || table === 'locations_tags') {
      locationsTagsData = await db.select().from(locations_tags).limit(limit);
    }

    return NextResponse.json({
      tables: {
        profiles: {
          name: 'Profiles',
          count: profilesData.length,
          data: profilesData,
        },
        cities: {
          name: 'Cities',
          count: citiesData.length,
          data: citiesData,
        },
        locations: {
          name: 'Locations',
          count: locationsData.length,
          data: locationsData,
        },
        trips: {
          name: 'Trips',
          count: tripsData.length,
          data: tripsData,
        },
        locations_trips: {
          name: 'Locations Trips',
          count: locationTripsData.length,
          data: locationTripsData,
        },
        tags: {
          name: 'Tags',
          count: tagsData.length,
          data: tagsData,
        },
        locations_tags: {
          name: 'Locations Tags',
          count: locationsTagsData.length,
          data: locationsTagsData,
        },
      },
    });
  } catch (error) {
    console.error('Error fetching tables:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
