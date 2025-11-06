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
    const { imagePath } = body as { imagePath: string };

    if (!imagePath) {
      return NextResponse.json(
        { error: 'Image path is required' },
        { status: 400 }
      );
    }

    const supabase = await createAdminClient();

    // Delete the file from Supabase Storage
    const { error: deleteError } = await supabase.storage
      .from('Locations')
      .remove([imagePath]);

    if (deleteError) {
      console.error(`Failed to delete image ${imagePath}:`, deleteError);
      return NextResponse.json(
        { error: `Failed to delete image: ${deleteError.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { data: { success: true, deletedPath: imagePath } },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting image:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete image' },
      { status: 500 }
    );
  }
}
