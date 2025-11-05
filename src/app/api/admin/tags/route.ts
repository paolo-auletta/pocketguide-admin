import { NextRequest, NextResponse } from 'next/server';
import db from '@/db';
import { tags } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { TagCreate } from '@/validation';
import { z } from 'zod';
import { requireAdmin, ApiResponse } from '@/lib/admin-auth';

function isValidUUID(id: unknown): id is string {
  return typeof id === 'string' && /^[0-9a-f-]{36}$/i.test(id);
}

// Partial update schema for PUT requests
const TagPartialUpdate = TagCreate.partial().extend({ 
  id: z.string().uuid() 
});

export async function POST(req: NextRequest): Promise<NextResponse<ApiResponse>> {
  const adminCheck = await requireAdmin();
  if (adminCheck.error) {
    return adminCheck.response!;
  }

  try {
    const body = await req.json();
    
    const validationResult = TagCreate.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: validationResult.error.issues },
        { status: 400 }
      );
    }

    const { name, icon, type } = validationResult.data;

    const result = await db
      .insert(tags)
      .values({
        name,
        icon,
        type,
      })
      .returning();

    if (!result[0]) {
      return NextResponse.json(
        { error: 'Failed to create tag' },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: result[0] }, { status: 201 });
  } catch (error) {
    console.error('Error creating tag:', error);
    return NextResponse.json(
      { error: 'Failed to create tag' },
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
    const { id, ...updateData } = body;

    // Validate ID format
    if (!isValidUUID(id)) {
      return NextResponse.json(
        { error: 'Invalid request', details: 'Invalid or missing tag ID' },
        { status: 400 }
      );
    }

    // Validate update data using partial schema
    const validationResult = TagPartialUpdate.safeParse({ id, ...updateData });
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: validationResult.error.issues },
        { status: 400 }
      );
    }

    // Build update object with only provided fields
    const updateValues: Record<string, unknown> = {};
    if (updateData.name !== undefined) updateValues.name = updateData.name;
    if (updateData.icon !== undefined) updateValues.icon = updateData.icon;
    if (updateData.type !== undefined) updateValues.type = updateData.type;

    // Update the tag using Drizzle ORM
    const result = await db
      .update(tags)
      .set(updateValues)
      .where(eq(tags.id, id))
      .returning();

    if (!result.length) {
      return NextResponse.json(
        { error: 'Tag not found' },
        { status: 404 }
      );
    }

    // Convert Date objects to ISO strings for JSON serialization
    const serializedResult = {
      ...result[0],
      created_at: result[0].created_at instanceof Date ? result[0].created_at.toISOString() : result[0].created_at,
      modified_at: result[0].modified_at instanceof Date ? result[0].modified_at.toISOString() : result[0].modified_at,
    };

    return NextResponse.json({ data: serializedResult });
  } catch (error) {
    console.error('Error updating tag:', error);
    return NextResponse.json(
      { error: 'Failed to update tag' },
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

    // Validate UUID format
    if (!isValidUUID(id)) {
      return NextResponse.json(
        { error: 'Invalid request', details: 'Invalid or missing tag ID' },
        { status: 400 }
      );
    }

    // Verify the tag exists before deletion
    const existing = await db
      .select()
      .from(tags)
      .where(eq(tags.id, id))
      .limit(1);

    if (!existing.length) {
      return NextResponse.json(
        { error: 'Tag not found' },
        { status: 404 }
      );
    }

    await db.delete(tags).where(eq(tags.id, id));

    return NextResponse.json({ data: { success: true } });
  } catch (error) {
    console.error('Error deleting tag:', error);
    return NextResponse.json(
      { error: 'Failed to delete tag' },
      { status: 500 }
    );
  }
}
