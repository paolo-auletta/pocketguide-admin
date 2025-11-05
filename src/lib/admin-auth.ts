import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import db from '@/db';
import { profiles } from '@/db/schema';
import { eq } from 'drizzle-orm';

export interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
  details?: unknown;
}

/**
 * Shared admin authentication check
 * Returns error response if user is not authenticated or not an admin
 * Returns null if authentication succeeds
 */
export async function requireAdmin(): Promise<{
  error: string | null;
  response?: NextResponse<ApiResponse>;
}> {
  try {
    const { userId } = await auth();

    if (!userId) {
      return {
        error: 'Unauthorized',
        response: NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        ),
      };
    }

    const userProfile = await db
      .select()
      .from(profiles)
      .where(eq(profiles.clerk_id, userId))
      .limit(1);

    if (!userProfile.length || userProfile[0].role !== 'admin') {
      return {
        error: 'Forbidden',
        response: NextResponse.json(
          { error: 'Forbidden' },
          { status: 403 }
        ),
      };
    }

    return { error: null };
  } catch (error) {
    console.error('Admin auth check failed:', error);
    return {
      error: 'Internal server error',
      response: NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      ),
    };
  }
}
