import { NextRequest, NextResponse } from 'next/server';
import db from '@/db';
import { locations_tags } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { LocationTagLinkCreate } from '@/validation';
import { requireAdmin, ApiResponse } from '@/lib/admin-auth';

function isValidUUID(id: unknown): id is string {
  return typeof id === 'string' && /^[0-9a-f-]{36}$/i.test(id);
}

export async function POST(req: NextRequest): Promise<NextResponse<ApiResponse>> {
  const adminCheck = await requireAdmin();
  if (adminCheck.error) {
    return adminCheck.response!;
  }

  try {
    const body = await req.json();

    const validationResult = LocationTagLinkCreate.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Invalid request',
          details: validationResult.error.issues,
        },
        { status: 400 }
      );
    }

    const { tag, location } = validationResult.data;

    try {
      const result = await db
        .insert(locations_tags)
        .values({
          tag,
          location,
        })
        .returning();

      if (!result[0]) {
        return NextResponse.json(
          { error: 'Failed to create location tag' },
          { status: 500 }
        );
      }

      return NextResponse.json({ data: result[0] }, { status: 201 });
    } catch (dbError) {
      // Handle unique constraint violation (tag-location pair already exists)
      // PostgreSQL error code 23505 = unique constraint violation
      const errorObj = dbError as Record<string, unknown>;
      const cause = errorObj?.cause as Record<string, unknown>;
      
      // Check both the main error and the nested cause
      const isUniqueConstraintError = 
        errorObj?.code === '23505' ||
        cause?.code === '23505' ||
        errorObj?.message?.toString().includes('duplicate key') ||
        errorObj?.message?.toString().includes('unique constraint') ||
        cause?.message?.toString().includes('duplicate key') ||
        cause?.message?.toString().includes('unique constraint');
      
      console.error('DB Error details:', { 
        code: errorObj?.code, 
        message: errorObj?.message,
        causeCode: cause?.code,
        causeMessage: cause?.message 
      });
      
      if (isUniqueConstraintError) {
        return NextResponse.json(
          { error: 'This tag is already linked to this location' },
          { status: 409 }
        );
      }
      throw dbError;
    }
  } catch (error) {
    console.error('Error creating location tag:', error);
    return NextResponse.json(
      { error: 'Failed to create location tag' },
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
    const tag = searchParams.get('tag');
    const location = searchParams.get('location');

    // Validate UUID format for both parameters
    if (!isValidUUID(tag)) {
      return NextResponse.json(
        { error: 'Invalid request', details: 'Invalid or missing tag ID' },
        { status: 400 }
      );
    }

    if (!isValidUUID(location)) {
      return NextResponse.json(
        { error: 'Invalid request', details: 'Invalid or missing location ID' },
        { status: 400 }
      );
    }

    // Verify the relationship exists before deletion
    const existing = await db
      .select()
      .from(locations_tags)
      .where(
        and(
          eq(locations_tags.tag, tag),
          eq(locations_tags.location, location)
        )
      )
      .limit(1);

    if (!existing.length) {
      return NextResponse.json(
        { error: 'Location tag relationship not found' },
        { status: 404 }
      );
    }

    await db
      .delete(locations_tags)
      .where(
        and(
          eq(locations_tags.tag, tag),
          eq(locations_tags.location, location)
        )
      );

    return NextResponse.json({ data: { success: true } });
  } catch (error) {
    console.error('Error deleting location tag:', error);
    return NextResponse.json(
      { error: 'Failed to delete location tag' },
      { status: 500 }
    );
  }
}
