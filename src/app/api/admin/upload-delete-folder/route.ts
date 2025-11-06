import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/utils/supabase/server';
import { requireAdmin, ApiResponse } from '@/lib/admin-auth';

export async function POST(req: NextRequest): Promise<NextResponse<ApiResponse>> {
  const adminCheck = await requireAdmin();
  if (adminCheck.error) {
    return adminCheck.response!;
  }

  try {
    const body = await req.json();
    const { locationId } = body as { locationId: unknown };

    if (!locationId || typeof locationId !== 'string') {
      return NextResponse.json(
        { error: 'Location ID is required and must be a string' },
        { status: 400 }
      );
    }

    const supabase = await createAdminClient();

    // List all files in the location folder
    const { data: files, error: listError } = await supabase.storage
      .from('Locations')
      .list(locationId);

    if (listError) {
      console.error(`Failed to list files in folder ${locationId}:`, listError);
      // If folder doesn't exist, that's fine - nothing to delete
      if (listError.message.includes('not found')) {
        return NextResponse.json(
          { data: { success: true, deletedCount: 0, message: 'Folder does not exist' } },
          { status: 200 }
        );
      }
      return NextResponse.json(
        { error: `Failed to list files: ${listError.message}` },
        { status: 500 }
      );
    }

    if (!files || files.length === 0) {
      return NextResponse.json(
        { data: { success: true, deletedCount: 0, message: 'Folder is empty' } },
        { status: 200 }
      );
    }

    // Build full paths for all files
    const filePaths = files.map(file => `${locationId}/${file.name}`);

    // Delete all files in the folder
    const { error: deleteError } = await supabase.storage
      .from('Locations')
      .remove(filePaths);

    if (deleteError) {
      console.error(`Failed to delete files in folder ${locationId}:`, deleteError);
      return NextResponse.json(
        { error: `Failed to delete files: ${deleteError.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { data: { success: true, deletedCount: filePaths.length, message: `Deleted ${filePaths.length} files from location folder` } },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting location folder:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete location folder' },
      { status: 500 }
    );
  }
}
