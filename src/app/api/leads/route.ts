import { NextRequest, NextResponse } from 'next/server';
import db from '@/db';
import { leads } from '@/db/schema';
import { z } from 'zod';
import { eq } from 'drizzle-orm';

const leadSchema = z.object({
  email: z.string().email(),
  device: z.string().min(1),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = leadSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request data', issues: parsed.error.issues },
        { status: 400 }
      );
    }

    const { email, device } = parsed.data;

    // Check if email already exists
    const existingLead = await db
      .select()
      .from(leads)
      .where(eq(leads.email, email))
      .limit(1);

    if (existingLead.length > 0) {
      return NextResponse.json(
        { error: 'Email already registered', message: 'You are already registered to the waitlist' },
        { status: 409 }
      );
    }

    // Insert the lead into the database
    const result = await db
      .insert(leads)
      .values({
        email,
        device,
      })
      .returning();

    return NextResponse.json(
      { data: result[0], message: 'Lead created successfully' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating lead:', error);
    return NextResponse.json(
      { error: 'Failed to create lead' },
      { status: 500 }
    );
  }
}
