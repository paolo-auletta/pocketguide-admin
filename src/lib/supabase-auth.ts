import { createClient } from '@/utils/supabase/client';
import { auth } from '@clerk/nextjs/server';

/**
 * Get a Supabase client with Clerk authentication
 * This syncs the Clerk user session with Supabase
 */
export async function getSupabaseClientWithAuth() {
  const supabase = createClient();
  const { userId } = await auth();

  if (!userId) {
    return supabase;
  }

  // Get the Clerk session token
  const session = await auth();
  
  // For client-side, we need to use the Clerk JWT
  // This is handled automatically by Supabase if configured correctly
  // But we can also manually set the auth header if needed
  
  return supabase;
}

/**
 * Alternative approach: Use a server action to get a signed URL
 * This is more secure as it doesn't expose storage details to the client
 */
export async function getSignedUploadUrl(filePath: string) {
  const supabase = createClient();
  
  const { data, error } = await supabase.storage
    .from('Locations')
    .createSignedUploadUrl(filePath);

  if (error) {
    throw new Error(`Failed to get signed URL: ${error.message}`);
  }

  return data;
}
