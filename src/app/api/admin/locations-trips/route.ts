import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import db from '@/db';
import { profiles, locations_trips } from '@/db/schema';
import { eq } from 'drizzle-orm';

async function checkAdmin() {
  const { userId } = await auth();
  if (!userId) {
    return { error: 'Unauthorized', status: 401 };
  }

  const userProfile = await db
    .select()
    .from(profiles)
    .where(eq(profiles.clerk_id, userId))
    .limit(1);

  if (!userProfile.length || userProfile[0].role !== 'admin') {
    return { error: 'Forbidden', status: 403 };
  }

  return null;
}

export async function POST(req: NextRequest) {
  const adminError = await checkAdmin();
  if (adminError) {
    return NextResponse.json({ error: adminError.error }, { status: adminError.status });
  }

  try {
    const body = await req.json();
    const { trip, location } = body;

    const result = await db
      .insert(locations_trips)
      .values({
        trip,
        location,
      })
      .returning();

    return NextResponse.json(result[0], { status: 201 });
  } catch (error) {
    console.error('Error creating location trip:', error);
    return NextResponse.json({ error: 'Failed to create location trip' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const adminError = await checkAdmin();
  if (adminError) {
    return NextResponse.json({ error: adminError.error }, { status: adminError.status });
  }

  try {
    const { searchParams } = new URL(req.url);
    const trip = searchParams.get('trip');
    const location = searchParams.get('location');

    if (!trip || !location) {
      return NextResponse.json({ error: 'Missing trip or location' }, { status: 400 });
    }

    await db
      .delete(locations_trips)
      .where(
        eq(locations_trips.trip, trip) && eq(locations_trips.location, location)
      );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting location trip:', error);
    return NextResponse.json({ error: 'Failed to delete location trip' }, { status: 500 });
  }
}
