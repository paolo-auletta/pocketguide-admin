import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/utils/supabase/server';
import { requireAdmin } from '@/lib/admin-auth';

export async function POST(req: NextRequest) {
  const adminCheck = await requireAdmin();
  if (adminCheck.error) {
    return adminCheck.response!;
  }

  try {
    const formData = await req.formData();
    const files = formData.getAll('files') as File[];
    const locationId = formData.get('locationId') as string;

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No files provided' }, { status: 400 });
    }

    if (!locationId) {
      return NextResponse.json({ error: 'Location ID is required' }, { status: 400 });
    }

    const supabase = await createAdminClient();
    const uploadedPaths: string[] = [];

    for (const file of files) {
      const fileName = `${Date.now()}-${file.name}`;
      const filePath = `${locationId}/${fileName}`;

      // Convert File to Buffer
      const buffer = await file.arrayBuffer();

      // Upload file to Supabase Storage using admin client (bypasses RLS)
      const { error: uploadError } = await supabase.storage
        .from('Locations')
        .upload(filePath, buffer, {
          contentType: file.type,
          upsert: true,
        });

      if (uploadError) {
        throw new Error(`Failed to upload ${file.name}: ${uploadError.message}`);
      }

      // Store just the path, not the full URL
      uploadedPaths.push(filePath);
    }

    return NextResponse.json({ paths: uploadedPaths }, { status: 200 });
  } catch (error) {
    console.error('Error uploading files:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to upload files' },
      { status: 500 }
    );
  }
}
