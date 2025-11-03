import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import db from '@/db';
import { profiles } from '@/db/schema';
import { eq } from 'drizzle-orm';

/**
 * Endpoint to sync the current user to the profiles table
 * This is a fallback for when webhooks are not configured
 * 
 * Called automatically by useUserSync hook on first sign-in
 */
export async function POST() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if profile already exists
    const existingProfile = await db
      .select()
      .from(profiles)
      .where(eq(profiles.clerk_id, userId))
      .limit(1);

    if (existingProfile.length > 0) {
      // Profile already exists
      return NextResponse.json(
        { message: 'Profile already exists', profile: existingProfile[0] },
        { status: 200 }
      );
    }

    // Create new profile
    const newProfile = await db
      .insert(profiles)
      .values({
        clerk_id: userId,
        role: 'user', // Default role
        plan: 'free', // Default plan
      })
      .returning();

    console.log(`Profile created for user ${userId}`);

    return NextResponse.json(
      { message: 'Profile created successfully', profile: newProfile[0] },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error syncing user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
