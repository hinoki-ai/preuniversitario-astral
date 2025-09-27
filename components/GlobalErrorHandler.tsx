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
      const errorMessage = event.reason?.message || event.reason?.toString() || 'Unhandled Promise Rejection';
      const errorStack = event.reason?.stack || 'No stack trace available';

      console.error('🚨 UNHANDLED PROMISE REJECTION:', {
        reason: event.reason,
        message: errorMessage,
        stack: errorStack,
        timestamp: new Date().toISOString(),
        url: window.location.href,
        userAgent: navigator.userAgent
      });

      ErrorHandler.handle(
        new Error(errorMessage),
        'Global.UnhandledPromiseRejection'
      );

      // Prevent the default browser behavior (logging to console)
      event.preventDefault();
    };

    // Handle global JavaScript errors
    const handleGlobalError = (event: ErrorEvent) => {
      console.error('🚨 GLOBAL JAVASCRIPT ERROR:', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error,
        stack: event.error?.stack || 'No stack trace available',
        timestamp: new Date().toISOString(),
        url: window.location.href,
        userAgent: navigator.userAgent
      });

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
  const [errorInfo, setErrorInfo] = React.useState<{ error: Error; errorInfo: React.ErrorInfo } | null>(null);

  React.useEffect(() => {
    if (hasError) {
      // Reset error state after a delay
      const timer = setTimeout(() => setHasError(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [hasError]);

  // Enhanced React error boundary
  class GlobalReactErrorBoundary extends React.Component<
    { children: React.ReactNode },
    { hasError: boolean; error: Error | null; errorInfo: React.ErrorInfo | null }
  > {
    constructor(props: { children: React.ReactNode }) {
      super(props);
      this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error: Error) {
      return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
      console.error('🚨 REACT ERROR BOUNDARY:', {
        error: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        timestamp: new Date().toISOString(),
        url: window.location.href,
        userAgent: navigator.userAgent
      });

      setErrorInfo({ error, errorInfo });
      setHasError(true);

      ErrorHandler.handle(error, 'Global.ReactErrorBoundary');
    }

    render() {
      if (this.state.hasError) {
        return (
          <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-destructive/10 border border-destructive/20 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-destructive mb-2">Error de Aplicación</h2>
              <p className="text-sm text-muted-foreground mb-4">
                Algo salió mal. Nuestro equipo ha sido notificado.
              </p>
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="mb-4">
                  <summary className="cursor-pointer text-sm font-medium">Detalles del Error (Dev)</summary>
                  <pre className="mt-2 text-xs bg-black/10 p-2 rounded overflow-auto max-h-32">
                    {this.state.error.message}
                    {this.state.error.stack && '\n\n' + this.state.error.stack}
                  </pre>
                </details>
              )}
              <button
                onClick={() => window.location.reload()}
                className="w-full bg-destructive text-destructive-foreground px-4 py-2 rounded text-sm font-medium hover:bg-destructive/90"
              >
                Recargar Página
              </button>
            </div>
          </div>
        );
      }

      return this.props.children;
    }
  }

  return (
    <GlobalReactErrorBoundary>
      {children}
    </GlobalReactErrorBoundary>
  );
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
          <h2 className="text-lg font-bold">Error de Desarrollo</h2>
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