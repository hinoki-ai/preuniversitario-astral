'use client';

import { useAuth } from '@clerk/nextjs';
import { ConvexReactClient } from 'convex/react';
import { ConvexProviderWithClerk } from 'convex/react-clerk';
import { ReactNode, useMemo } from 'react';

// Lazy initialization to avoid issues during module loading
function createConvexClient() {
  // Get environment variables at runtime, not during module import
  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL || 'https://bright-heron-314.convex.cloud';

  if (!convexUrl || convexUrl.trim() === '') {
    console.error('NEXT_PUBLIC_CONVEX_URL is not properly configured:', convexUrl);
    throw new Error('NEXT_PUBLIC_CONVEX_URL is not properly configured');
  }

  return new ConvexReactClient(convexUrl);
}

export default function ConvexClientProvider({ children }: { children: ReactNode }) {
  const convex = useMemo(() => createConvexClient(), []);

  return (
    <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
      {children}
    </ConvexProviderWithClerk>
  );
}
