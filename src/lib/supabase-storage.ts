import { createClient } from '@/utils/supabase/client';

/**
 * Get a signed URL for a file in Supabase Storage
 * @param filePath - The path to the file (e.g., "LocationName/timestamp-filename.jpg")
 * @param expiresIn - Expiration time in seconds (default: 3600 = 1 hour)
 */
export async function getSignedImageUrl(
  filePath: string,
  expiresIn: number = 3600
): Promise<string | null> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase.storage
      .from('Locations')
      .createSignedUrl(filePath, expiresIn);

    if (error) {
      console.error('Error creating signed URL:', error);
      return null;
    }

    return data?.signedUrl || null;
  } catch (err) {
    console.error('Error getting signed URL:', err);
    return null;
  }
}

/**
 * Get multiple signed URLs for files
 */
export async function getSignedImageUrls(
  filePaths: string[],
  expiresIn: number = 3600
): Promise<Record<string, string>> {
  const urls: Record<string, string> = {};

  for (const path of filePaths) {
    const url = await getSignedImageUrl(path, expiresIn);
    if (url) {
      urls[path] = url;
    }
  }

  return urls;
}
