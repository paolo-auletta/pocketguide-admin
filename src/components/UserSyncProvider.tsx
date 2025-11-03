'use client';

import { useUserSync } from '@/hooks/useUserSync';

/**
 * Provider component that syncs the user to the database on first sign-in
 * Wrap your app with this component to enable automatic user syncing
 */
export default function UserSyncProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  useUserSync();

  return <>{children}</>;
}
