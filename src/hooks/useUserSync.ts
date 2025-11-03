import { useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';

/**
 * Hook to sync user data to the profiles table on first sign-in
 * This is a fallback for when webhooks are not yet configured
 * 
 * Usage: Call this hook in a client component to automatically sync the user
 */
export function useUserSync() {
  const { userId, isLoaded } = useAuth();

  useEffect(() => {
    if (!isLoaded || !userId) return;

    const syncUser = async () => {
      try {
        const response = await fetch('/api/auth/sync-user', {
          method: 'POST',
        });

        if (!response.ok) {
          console.error('Failed to sync user:', response.statusText);
        }
      } catch (error) {
        console.error('Error syncing user:', error);
      }
    };

    syncUser();
  }, [userId, isLoaded]);
}
