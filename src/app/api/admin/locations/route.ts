import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import db from '@/db';
import { profiles, locations } from '@/db/schema';
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
    const {
      name,
      is_draft,
      description,
      type,
      images,
      embedded_links,
      tags,
      city,
      street,
      guide,
      is_guide_premium,
      longitude,
      latitude,
    } = body;

    const result = await db
      .insert(locations)
      .values({
        name,
        is_draft: is_draft ?? true,
        description: description || null,
        type,
        images: images && images.length > 0 ? images : null,
        embedded_links: embedded_links && embedded_links.length > 0 ? embedded_links : null,
        tags: tags && tags.length > 0 ? tags : null,
        city,
        street: street || null,
        guide: guide || null,
        is_guide_premium: is_guide_premium ?? false,
        longitude,
        latitude,
      })
      .returning();

    return NextResponse.json(result[0], { status: 201 });
  } catch (error) {
    console.error('Error creating location:', error);
    return NextResponse.json({ error: 'Failed to create location' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const adminError = await checkAdmin();
  if (adminError) {
    return NextResponse.json({ error: adminError.error }, { status: adminError.status });
  }

  try {
    const body = await req.json();
    const {
      id,
      name,
      is_draft,
      description,
      type,
      images,
      embedded_links,
      tags,
      city,
      street,
      guide,
      is_guide_premium,
      longitude,
      latitude,
    } = body;

    const result = await db
      .update(locations)
      .set({
        name,
        is_draft,
        description: description || null,
        type,
        images: images && images.length > 0 ? images : null,
        embedded_links: embedded_links && embedded_links.length > 0 ? embedded_links : null,
        tags: tags && tags.length > 0 ? tags : null,
        city,
        street: street || null,
        guide: guide || null,
        is_guide_premium,
        longitude,
        latitude,
      })
      .where(eq(locations.id, id))
      .returning();

    return NextResponse.json(result[0]);
  } catch (error) {
    console.error('Error updating location:', error);
    return NextResponse.json({ error: 'Failed to update location' }, { status: 500 });
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

    await db.delete(locations).where(eq(locations.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting location:', error);
    return NextResponse.json({ error: 'Failed to delete location' }, { status: 500 });
  }
}
