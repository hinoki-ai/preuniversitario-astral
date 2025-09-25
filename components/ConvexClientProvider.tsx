'use client';

import { useAuth } from '@clerk/nextjs';
import { ConvexReactClient } from 'convex/react';
import { ConvexProviderWithClerk } from 'convex/react-clerk';
import { ReactNode } from 'react';
import { env } from '@/lib/env';

// Validate that we have a proper URL
if (!env.NEXT_PUBLIC_CONVEX_URL || env.NEXT_PUBLIC_CONVEX_URL.trim() === '') {
  throw new Error('NEXT_PUBLIC_CONVEX_URL is not properly configured');
}

const convex = new ConvexReactClient(env.NEXT_PUBLIC_CONVEX_URL);

export default function ConvexClientProvider({ children }: { children: ReactNode }) {
  return (
    <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
      {children}
    </ConvexProviderWithClerk>
  );
}
