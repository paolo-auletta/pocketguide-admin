import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import db from '@/db';
import { profiles, trips } from '@/db/schema';
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
    const { name, owner, city, number_of_adults, number_of_children, preferences } = body;

    const result = await db
      .insert(trips)
      .values({
        name,
        owner,
        city,
        number_of_adults: number_of_adults || null,
        number_of_children: number_of_children || null,
        preferences: preferences && preferences.length > 0 ? preferences : null,
      })
      .returning();

    return NextResponse.json(result[0], { status: 201 });
  } catch (error) {
    console.error('Error creating trip:', error);
    return NextResponse.json({ error: 'Failed to create trip' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const adminError = await checkAdmin();
  if (adminError) {
    return NextResponse.json({ error: adminError.error }, { status: adminError.status });
  }

  try {
    const body = await req.json();
    const { id, name, owner, city, number_of_adults, number_of_children, preferences } = body;

    const result = await db
      .update(trips)
      .set({
        name,
        owner,
        city,
        number_of_adults: number_of_adults || null,
        number_of_children: number_of_children || null,
        preferences: preferences && preferences.length > 0 ? preferences : null,
      })
      .where(eq(trips.id, id))
      .returning();

    return NextResponse.json(result[0]);
  } catch (error) {
    console.error('Error updating trip:', error);
    return NextResponse.json({ error: 'Failed to update trip' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const adminError = await checkAdmin();
  if (adminError) {
    return NextResponse.json({ error: adminError.error }, { status: adminError.status });
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Missing id' }, { status: 400 });
    }

    await db.delete(trips).where(eq(trips.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting trip:', error);
    return NextResponse.json({ error: 'Failed to delete trip' }, { status: 500 });
  }
}
