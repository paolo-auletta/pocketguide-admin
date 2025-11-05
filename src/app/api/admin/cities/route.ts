import { NextRequest, NextResponse } from 'next/server';
import db from '@/db';
import { cities } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { CityCreate, CityUpdate, CityCreateInput, CityUpdateInput } from '@/validation';
import { requireAdmin, ApiResponse } from '@/lib/admin-auth';

export async function POST(req: NextRequest): Promise<NextResponse<ApiResponse>> {
  const adminCheck = await requireAdmin();
  if (adminCheck.error) {
    return adminCheck.response!;
  }

  try {
    const body = await req.json();
    
    const validationResult = CityCreate.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Invalid request',
          details: validationResult.error.issues,
        },
        { status: 400 }
      );
    }
    
    const data: CityCreateInput = validationResult.data;
    
    const result = await db
      .insert(cities)
      .values({
        name: data.name,
        country: data.country,
        is_draft: data.is_draft ?? true,
        center_latitude: data.center_latitude,
        center_longitude: data.center_longitude,
      })
      .returning();

    if (!result[0]) {
      return NextResponse.json(
        { error: 'Failed to create city' },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: result[0] }, { status: 201 });
  } catch (error) {
    console.error('Error creating city:', error);
    return NextResponse.json(
      { error: 'Failed to create city' },
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
    const validationResult = CityUpdate.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Invalid request',
          details: validationResult.error.issues,
        },
        { status: 400 }
      );
    }

    const updateData: CityUpdateInput = validationResult.data;

    // Verify city exists
    const existingCity = await db
      .select()
      .from(cities)
      .where(eq(cities.id, id))
      .limit(1);

    if (!existingCity.length) {
      return NextResponse.json(
        { error: 'City not found' },
        { status: 404 }
      );
    }

    // Update only provided fields
    const updateValues: Record<string, unknown> = {};
    if (updateData.name !== undefined) updateValues.name = updateData.name;
    if (updateData.country !== undefined) updateValues.country = updateData.country;
    if (updateData.is_draft !== undefined) updateValues.is_draft = updateData.is_draft;
    if (updateData.center_latitude !== undefined) updateValues.center_latitude = updateData.center_latitude;
    if (updateData.center_longitude !== undefined) updateValues.center_longitude = updateData.center_longitude;
    
    // Add modified_at timestamp
    updateValues.modified_at = new Date();

    const result = await db
      .update(cities)
      .set(updateValues)
      .where(eq(cities.id, id))
      .returning();

    if (!result[0]) {
      return NextResponse.json(
        { error: 'Failed to update city' },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: result[0] });
  } catch (error) {
    console.error('Error updating city:', error);
    return NextResponse.json(
      { error: 'Failed to update city' },
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

    // Verify city exists before deletion
    const existingCity = await db
      .select()
      .from(cities)
      .where(eq(cities.id, id))
      .limit(1);

    if (!existingCity.length) {
      return NextResponse.json(
        { error: 'City not found' },
        { status: 404 }
      );
    }

    await db.delete(cities).where(eq(cities.id, id));

    return NextResponse.json({ data: { success: true } });
  } catch (error) {
    console.error('Error deleting city:', error);
    return NextResponse.json(
      { error: 'Failed to delete city' },
      { status: 500 }
    );
  }
}
