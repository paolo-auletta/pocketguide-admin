import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';

/**
 * Endpoint for EditorJS Image tool to validate and fetch images by URL
 * This allows admins to embed images via URL in the guide editor
 */
export async function GET(req: NextRequest) {
  try {
    // Check admin authorization
    const adminCheck = await requireAdmin();
    if (adminCheck.error) {
      return adminCheck.response!;
    }

    const { searchParams } = new URL(req.url);
    const url = searchParams.get('url');

    if (!url) {
      return NextResponse.json(
        { success: 0, error: 'URL parameter is required' },
        { status: 400 }
      );
    }

    // Validate that it's a proper URL
    try {
      new URL(url);
    } catch {
      return NextResponse.json(
        { success: 0, error: 'Invalid URL format' },
        { status: 400 }
      );
    }

    // Return the URL in EditorJS expected format
    return NextResponse.json({
      success: 1,
      file: {
        url,
      },
    });
  } catch (error) {
    console.error('Error fetching image URL:', error);
    return NextResponse.json(
      { success: 0, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
