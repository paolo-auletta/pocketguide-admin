import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/utils/supabase/server';
import { requireAdmin } from '@/lib/admin-auth';

export async function POST(req: NextRequest) {
  const adminCheck = await requireAdmin();
  if (adminCheck.error) {
    return adminCheck.response!;
  }

  try {
    const body = await req.json();
    const { locationId } = body;

    if (!locationId) {
      return NextResponse.json({ error: 'Location ID is required' }, { status: 400 });
    }

    const supabase = await createAdminClient();

    // List all files in the location folder
    const { data: files, error: listError } = await supabase.storage
      .from('Locations')
      .list(locationId);

    if (listError) {
      console.error('Error listing files:', listError);
      // Continue anyway - folder might not exist
    }

    // Delete all files in the location folder
    if (files && files.length > 0) {
      const filePaths = files
        .filter((file) => file.name !== '.emptyFolderPlaceholder')
        .map((file) => `${locationId}/${file.name}`);

      if (filePaths.length > 0) {
        const { error: deleteError } = await supabase.storage
          .from('Locations')
          .remove(filePaths);

        if (deleteError) {
          console.error('Error deleting files:', deleteError);
          // Continue anyway
        }
      }
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Error cleaning up files:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to cleanup files' },
      { status: 500 }
    );
  }
}
