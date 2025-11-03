import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import db from '@/db';
import { profiles, cities } from '@/db/schema';
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
    const { name, country, is_draft, center_latitude, center_longitude } = body;

    const result = await db
      .insert(cities)
      .values({
        name,
        country,
        is_draft: is_draft ?? true,
        center_latitude,
        center_longitude,
      })
      .returning();

    return NextResponse.json(result[0], { status: 201 });
  } catch (error) {
    console.error('Error creating city:', error);
    return NextResponse.json({ error: 'Failed to create city' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const adminError = await checkAdmin();
  if (adminError) {
    return NextResponse.json({ error: adminError.error }, { status: adminError.status });
  }

  try {
    const body = await req.json();
    const { id, name, country, is_draft, center_latitude, center_longitude } = body;

    const result = await db
      .update(cities)
      .set({
        name,
        country,
        is_draft,
        center_latitude,
        center_longitude,
      })
      .where(eq(cities.id, id))
      .returning();

    return NextResponse.json(result[0]);
  } catch (error) {
    console.error('Error updating city:', error);
    return NextResponse.json({ error: 'Failed to update city' }, { status: 500 });
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

    await db.delete(cities).where(eq(cities.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting city:', error);
    return NextResponse.json({ error: 'Failed to delete city' }, { status: 500 });
  }
}
