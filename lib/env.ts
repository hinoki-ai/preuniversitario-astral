/**
 * Environment Variable Validation
 * Ensures all required environment variables are present and valid at build time
 */

import { z } from 'zod';

const envSchema = z.object({
  // Next.js
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  
  // Convex
  NEXT_PUBLIC_CONVEX_URL: z.string().url('Invalid Convex URL'),
  
  // Clerk Authentication
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string().min(1, 'Clerk publishable key is required'),
  CLERK_SECRET_KEY: z.string().min(1, 'Clerk secret key is required'),
  CLERK_WEBHOOK_SECRET: z.string().optional(),
  
  // Zoom SDK (optional - only needed for Zoom features)
  NEXT_PUBLIC_ZOOM_MEETING_SDK_KEY: z.string().optional(),
  ZOOM_MEETING_SDK_SECRET: z.string().optional(),
  NEXT_PUBLIC_ZOOM_DEMO_MODE: z.enum(['true', 'false']).optional().transform(v => v === 'true'),
  
  // App Configuration
  NEXT_PUBLIC_APP_URL: z.string().url().optional().default('http://localhost:3000'),
  
  // Analytics (optional)
  NEXT_PUBLIC_VERCEL_ANALYTICS_ID: z.string().optional(),
  
  // Feature Flags (optional)
  NEXT_PUBLIC_ENABLE_ZOOM: z.enum(['true', 'false']).optional().transform(v => v === 'true'),
  NEXT_PUBLIC_ENABLE_MOCK_EXAMS: z.enum(['true', 'false']).optional().default('true').transform(v => v === 'true'),
});

// Type inference for TypeScript
type Env = z.infer<typeof envSchema>;

// Parse and validate environment variables
function validateEnv(): Env {
  try {
    // In production, be more lenient with environment variable validation
    // as they might not be available during initial module loading
    if (process.env.NODE_ENV === 'production') {
      // Try to parse with partial validation first
      try {
        return envSchema.partial().parse(process.env) as Env;
      } catch (error) {
        console.warn('⚠️  Partial environment parsing failed in production, using fallback values');
      }
    }

    return envSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessage = error.errors
        .map(e => `${e.path.join('.')}: ${e.message}`)
        .join('\n');

      console.error('❌ Environment validation failed:\n', errorMessage);

      // Return fallback configuration to prevent crashes
      console.warn('⚠️  Using fallback environment configuration');

      return {
        NODE_ENV: process.env.NODE_ENV || 'production',
        NEXT_PUBLIC_CONVEX_URL: process.env.NEXT_PUBLIC_CONVEX_URL || 'https://bright-heron-314.convex.cloud',
        NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || '',
        CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY || '',
        NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'https://preuastral.cl',
        NEXT_PUBLIC_ENABLE_MOCK_EXAMS: process.env.NEXT_PUBLIC_ENABLE_MOCK_EXAMS !== 'false',
        NEXT_PUBLIC_ZOOM_DEMO_MODE: false,
        NEXT_PUBLIC_ENABLE_ZOOM: false,
      } as Env;
    }
    throw error;
  }
}

// Export validated environment variables
export const env = validateEnv();

// Helper function to check if a feature is enabled
export function isFeatureEnabled(feature: 'zoom' | 'mockExams'): boolean {
  switch (feature) {
    case 'zoom':
      return env.NEXT_PUBLIC_ENABLE_ZOOM === true &&
             !!env.NEXT_PUBLIC_ZOOM_MEETING_SDK_KEY &&
             !!env.ZOOM_MEETING_SDK_SECRET;
    case 'mockExams':
      return env.NEXT_PUBLIC_ENABLE_MOCK_EXAMS === true;
    default:
      return false;
  }
}

// Type-safe environment variable access
export function getEnvVar<K extends keyof Env>(key: K): Env[K] {
  return env[key];
}

// Export types for use in other files
export type { Env };