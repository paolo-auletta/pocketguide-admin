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
    const { fromLocationId, toLocationId, imagePaths } = body as {
      fromLocationId: string;
      toLocationId: string;
      imagePaths: string[];
    };

    if (!fromLocationId || !toLocationId || !imagePaths || imagePaths.length === 0) {
      return NextResponse.json(
        { error: 'Missing required parameters: fromLocationId, toLocationId, imagePaths' },
        { status: 400 }
      );
    }

    const supabase = await createAdminClient();
    const newPaths: string[] = [];

    for (const imagePath of imagePaths) {
      try {
        // Download the file from the temp location
        const { data, error: downloadError } = await supabase.storage
          .from('Locations')
          .download(imagePath);

        if (downloadError) {
          console.error(`Failed to download ${imagePath}:`, downloadError);
          continue;
        }

        // Extract the filename from the path
        const fileName = imagePath.split('/').pop();
        if (!fileName) {
          console.error(`Could not extract filename from path: ${imagePath}`);
          continue;
        }

        // Upload to the new location
        const newPath = `${toLocationId}/${fileName}`;
        const { error: uploadError } = await supabase.storage
          .from('Locations')
          .upload(newPath, data, {
            contentType: data.type,
            upsert: true,
          });

        if (uploadError) {
          console.error(`Failed to upload to ${newPath}:`, uploadError);
          continue;
        }

        newPaths.push(newPath);

        // Delete the old file from temp location
        const { error: deleteError } = await supabase.storage
          .from('Locations')
          .remove([imagePath]);

        if (deleteError) {
          console.error(`Failed to delete temp file ${imagePath}:`, deleteError);
          // Don't fail if deletion fails, the file will just remain in temp
        }
      } catch (err) {
        console.error(`Error processing image ${imagePath}:`, err);
        continue;
      }
    }

    return NextResponse.json(
      { data: { newPaths, movedCount: newPaths.length } },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error moving images:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to move images' },
      { status: 500 }
    );
  }
}
