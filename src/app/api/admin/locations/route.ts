import { NextRequest, NextResponse } from 'next/server';
import db from '@/db';
import { locations } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { LocationCreate, LocationUpdate, LocationCreateInput, LocationUpdateInput } from '@/validation';
import { requireAdmin, ApiResponse } from '@/lib/admin-auth';

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
        guide: data.guide || null,
        is_guide_premium: data.is_guide_premium ?? false,
        longitude: data.longitude,
        latitude: data.latitude,
      })
      .returning();

    if (!result[0]) {
      return NextResponse.json(
        { error: 'Failed to create location' },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: result[0] }, { status: 201 });
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
    if (updateData.images !== undefined) updateValues.images = updateData.images && updateData.images.length > 0 ? updateData.images : null;
    if (updateData.embedded_links !== undefined) updateValues.embedded_links = updateData.embedded_links && updateData.embedded_links.length > 0 ? updateData.embedded_links : null;
    if (updateData.city !== undefined) updateValues.city = updateData.city;
    if (updateData.street !== undefined) updateValues.street = updateData.street;
    if (updateData.guide !== undefined) updateValues.guide = updateData.guide;
    if (updateData.is_guide_premium !== undefined) updateValues.is_guide_premium = updateData.is_guide_premium;
    if (updateData.longitude !== undefined) updateValues.longitude = updateData.longitude;
    if (updateData.latitude !== undefined) updateValues.latitude = updateData.latitude;
    
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

    return NextResponse.json({ data: result[0] });
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
