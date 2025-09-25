'use client';

import React from 'react';
import { AppError } from '@/lib/core/error-system';

/**
 * Error boundary fallback component
 * Used to display errors in a user-friendly way
 */
export function ErrorFallback({ 
  error, 
  resetError 
}: { 
  error?: Error | AppError; 
  resetError: () => void;
}) {
  return (
    <div className="min-h-[400px] flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center space-y-4">
        <div className="w-20 h-20 mx-auto bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
          <span className="text-3xl">⚠️</span>
        </div>
        
        <h2 className="text-xl font-semibold">Something went wrong</h2>
        
        <p className="text-muted-foreground">
          {error?.message || 'An unexpected error occurred'}
        </p>
        
        <div className="flex gap-4 justify-center">
          <button
            onClick={resetError}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            Try Again
          </button>
          
          <button
            onClick={() => window.location.href = '/'}
            className="px-4 py-2 border border-input rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            Go Home
          </button>
        </div>
      </div>
    </div>
  );
}