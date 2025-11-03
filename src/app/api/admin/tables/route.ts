import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import db from '@/db';
import { profiles, cities, locations, trips, locations_trips } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const userProfile = await db
      .select()
      .from(profiles)
      .where(eq(profiles.clerk_id, userId))
      .limit(1);

    if (!userProfile.length || userProfile[0].role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Fetch all tables
    const [profilesData, citiesData, locationsData, tripsData, locationTripsData] =
      await Promise.all([
        db.select().from(profiles),
        db.select().from(cities),
        db.select().from(locations),
        db.select().from(trips),
        db.select().from(locations_trips),
      ]);

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
