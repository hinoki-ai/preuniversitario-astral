'use client';

import React from 'react';
import { ErrorHandler } from '@/lib/core/error-system';

/**
 * Global error handler component
 * Handles unhandled promise rejections and global JavaScript errors
 */
export function GlobalErrorHandler({ children }: { children: React.ReactNode }) {
  React.useEffect(() => {
    // Handle unhandled promise rejections
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('Unhandled Promise Rejection:', event.reason);
      ErrorHandler.handle(
        new Error(event.reason?.message || 'Unhandled Promise Rejection'),
        'Global.UnhandledPromiseRejection'
      );
      
      // Prevent the default browser behavior (logging to console)
      event.preventDefault();
    };

    // Handle global JavaScript errors
    const handleGlobalError = (event: ErrorEvent) => {
      console.error('Global JavaScript Error:', event.error);
      ErrorHandler.handle(
        event.error || new Error(event.message),
        'Global.JavaScriptError'
      );
    };

    // Add event listeners
    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    window.addEventListener('error', handleGlobalError);

    // Cleanup
    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      window.removeEventListener('error', handleGlobalError);
    };
  }, []);

  // Also handle React errors at the highest level
  const [hasError, setHasError] = React.useState(false);

  React.useEffect(() => {
    if (hasError) {
      // Reset error state after a delay
      const timer = setTimeout(() => setHasError(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [hasError]);

  return <>{children}</>;
}

/**
 * Development-only error overlay
 */
export function DevelopmentErrorOverlay({ error, onDismiss }: { 
  error?: Error | null; 
  onDismiss: () => void; 
}) {
  if (process.env.NODE_ENV !== 'development' || !error) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[9999] bg-black/80 flex items-center justify-center p-4">
      <div className="bg-destructive text-destructive-foreground p-6 rounded-lg max-w-2xl max-h-[80vh] overflow-auto">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-lg font-bold">Development Error</h2>
          <button 
            onClick={onDismiss}
            className="text-destructive-foreground/70 hover:text-destructive-foreground"
          >
            ✕
          </button>
        </div>
        <div className="space-y-2">
          <p className="font-semibold">{error.message}</p>
          {error.stack && (
            <pre className="text-xs bg-black/20 p-2 rounded overflow-x-auto">
              {error.stack}
            </pre>
          )}
        </div>
      </div>
    </div>
  );
}