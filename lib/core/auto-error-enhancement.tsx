'use client';

/**
 * Automatic Error Enhancement System
 * Provides decorators and utilities to automatically enhance components with error handling
 */

import React from 'react';
import { ComponentErrorBoundary } from '@/components/ErrorBoundary';
import { useStandardErrorHandling } from '@/lib/core/error-wrapper';

// Component registry for tracking enhanced components
const enhancedComponents = new Map<string, React.ComponentType<any>>();

/**
 * Decorator to automatically add error handling to functional components
 */
export function ErrorSafe<P extends object>(
  TargetComponent: React.ComponentType<P>,
  context: { kind: string; name: string }
): React.ComponentType<P> {
  const componentName = context.name || TargetComponent.displayName || TargetComponent.name || 'Component';

  if (enhancedComponents.has(componentName)) {
    return enhancedComponents.get(componentName)!;
  }

  const EnhancedComponent = React.forwardRef<any, P>((props, ref) => {
    const { handleError, safeSyncCall, safeAsyncCall } = useStandardErrorHandling(componentName);

    // Wrap the original component with error handling
    const wrappedRender = React.useMemo(() => {
      return safeSyncCall(
        () => React.createElement(TargetComponent, { ...props, ref } as any),
        'render',
        <div className="text-sm text-muted-foreground p-4 text-center">
          Component failed to load: {componentName}
        </div>
      );
    }, [props, ref, safeSyncCall]);

    return (
      <ComponentErrorBoundary context={componentName}>
        {wrappedRender}
      </ComponentErrorBoundary>
    );
  });

  EnhancedComponent.displayName = `ErrorSafe(${componentName})`;
  enhancedComponents.set(componentName, EnhancedComponent);

  return EnhancedComponent as unknown as React.ComponentType<P>;
}

/**
 * Batch enhance multiple components at once
 */
export function createErrorSafeComponents<T extends Record<string, React.ComponentType<any>>>(
  components: T
): { [K in keyof T]: React.ComponentType<React.ComponentProps<T[K]>> } {
  const enhanced = {} as { [K in keyof T]: React.ComponentType<React.ComponentProps<T[K]>> };
  
  Object.entries(components).forEach(([name, Component]) => {
    enhanced[name as keyof T] = ErrorSafe(Component, { kind: 'function', name });
  });
  
  return enhanced;
}

/**
 * HOC that adds comprehensive error handling with minimal configuration
 */
export function withMinimalErrorHandling<P extends object>(
  Component: React.ComponentType<P>,
  options: {
    componentName?: string;
    showFallback?: boolean;
    customFallback?: React.ReactNode;
    logErrors?: boolean;
  } = {}
) {
  const {
    componentName = Component.displayName || Component.name || 'Component',
    showFallback = true,
    customFallback,
    logErrors = true
  } = options;

  const EnhancedComponent = React.forwardRef<any, P>((props, ref) => {
    const { safeSyncCall } = useStandardErrorHandling(componentName);

    const fallback = customFallback || (
      showFallback ? (
        <div className="text-sm text-muted-foreground p-2 text-center border border-dashed border-muted-foreground/30 rounded">
          {componentName} failed to load
        </div>
      ) : null
    );

    const renderedComponent = safeSyncCall(
      () => React.createElement(Component, { ...props, ref } as any),
      'render',
      fallback
    );

    return (
      <ComponentErrorBoundary context={componentName}>
        {renderedComponent}
      </ComponentErrorBoundary>
    );
  });

  EnhancedComponent.displayName = `ErrorSafe(${componentName})`;
  return EnhancedComponent;
}

/**
 * Auto-enhance all exported components from a module
 */
export function enhanceModule<T extends Record<string, any>>(
  moduleExports: T,
  options: {
    exclude?: string[];
    include?: string[];
    prefix?: string;
  } = {}
): Record<string, any> {
  const { exclude = [], include = [], prefix = '' } = options;
  const enhanced: Record<string, any> = { ...moduleExports };

  Object.entries(moduleExports).forEach(([exportName, exportValue]) => {
    // Only enhance React components
    if (React.isValidElement(exportValue) || 
        (typeof exportValue === 'function' && exportValue.prototype?.isReactComponent) ||
        (typeof exportValue === 'function' && exportName[0] === exportName[0].toUpperCase())) {
      
      // Skip if in exclude list
      if (exclude.includes(exportName)) return;
      
      // Skip if include list is provided and item is not in it
      if (include.length > 0 && !include.includes(exportName)) return;

      enhanced[exportName] = withMinimalErrorHandling(
        exportValue as React.ComponentType<any>,
        { 
          componentName: `${prefix}${exportName}`,
          showFallback: true,
          logErrors: true
        }
      );
    }
  });

  return enhanced;
}

/**
 * React Hook to automatically handle component lifecycle errors
 */
export function useComponentErrorHandling(componentName?: string) {
  const { handleError, safeSyncCall, safeAsyncCall } = useStandardErrorHandling(componentName);
  const [componentError, setComponentError] = React.useState<Error | null>(null);

  // Error boundary-like behavior for hooks
  React.useEffect(() => {
    const handleGlobalError = (event: ErrorEvent) => {
      if (event.error) {
        setComponentError(event.error);
        handleError(event.error, 'componentLifecycle');
      }
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const error = new Error(event.reason?.message || 'Unhandled Promise Rejection');
      setComponentError(error);
      handleError(error, 'unhandledPromise');
    };

    window.addEventListener('error', handleGlobalError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleGlobalError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, [handleError]);

  const resetError = React.useCallback(() => {
    setComponentError(null);
  }, []);

  return {
    hasError: Boolean(componentError),
    error: componentError,
    resetError,
    safeSyncCall,
    safeAsyncCall,
    handleError,
  };
}