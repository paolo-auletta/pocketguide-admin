import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import db from '@/db';
import { profiles } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    return NextResponse.json(
      { error: 'CLERK_WEBHOOK_SECRET is not set' },
      { status: 500 }
    );
  }

  const headersList = await headers();
  const svix_id = headersList.get('svix-id');
  const svix_timestamp = headersList.get('svix-timestamp');
  const svix_signature = headersList.get('svix-signature');

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return NextResponse.json(
      { error: 'Missing svix headers' },
      { status: 400 }
    );
  }

  const body = await req.text();

  const wh = new Webhook(WEBHOOK_SECRET);
  let evt: Record<string, unknown>;

  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as Record<string, unknown>;
  } catch (err) {
    console.error('Webhook verification failed:', err);
    return NextResponse.json(
      { error: 'Webhook verification failed' },
      { status: 400 }
    );
  }

  const eventType = evt.type as string;
  const eventData = evt.data as Record<string, unknown>;

  try {
    if (eventType === 'user.created') {
      const clerk_id = eventData.id as string;

      // Check if profile already exists
      const existingProfile = await db
        .select()
        .from(profiles)
        .where(eq(profiles.clerk_id, clerk_id as string))
        .limit(1);

      if (existingProfile.length === 0) {
        // Create new profile
        await db.insert(profiles).values({
          clerk_id: clerk_id as string,
          role: 'user', // Default role
          plan: 'free', // Default plan
        });

        console.log(`Profile created for user ${clerk_id}`);
      }
    } else if (eventType === 'user.updated') {
      const clerk_id = eventData.id as string;

      // Profile already exists, just log the update
      console.log(`User ${clerk_id} updated`);
    } else if (eventType === 'user.deleted') {
      const clerk_id = eventData.id as string;

      // Delete profile when user is deleted
      await db.delete(profiles).where(eq(profiles.clerk_id, clerk_id as string));

      console.log(`Profile deleted for user ${clerk_id}`);
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
