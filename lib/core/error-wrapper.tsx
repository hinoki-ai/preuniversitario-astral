'use client';

import React from 'react';
import { ComponentErrorBoundary } from '@/components/ErrorBoundary';
import { useErrorHandler } from '@/lib/core/error-system';

/**
 * Higher-order component that wraps components with standardized error handling
 */
export function withStandardErrorHandling<P extends object>(
  Component: React.ComponentType<P>,
  options: {
    componentName?: string;
    level?: 'page' | 'section' | 'component';
    fallbackValue?: any;
    onError?: (error: Error, context: string) => void;
  } = {}
) {
  const { componentName, level = 'component', fallbackValue, onError } = options;
  
  const WrappedComponent = React.forwardRef<any, P>((props, ref) => {
    const { handleError, safeExecute } = useErrorHandler();
    const context = componentName || Component.displayName || Component.name || 'Anonymous Component';
    
    // Handle custom error callback
    const customHandleError = React.useCallback((error: Error, errorContext: string) => {
      if (onError) {
        onError(error, errorContext);
      }
      handleError(error, errorContext);
    }, [handleError, onError]);
    
    // Wrap the component render with error handling
    const renderComponent = React.useCallback(() => {
      return safeExecute(
        () => <Component {...props} ref={ref} />,
        `${context}.render`,
        fallbackValue
      );
    }, [props, ref, context, fallbackValue, safeExecute]);

    const ErrorBoundaryComponent = level === 'page' 
      ? React.Fragment 
      : ComponentErrorBoundary;
      
    const boundaryProps = level === 'page' ? {} : { context };

    return (
      <ErrorBoundaryComponent {...boundaryProps}>
        {renderComponent()}
      </ErrorBoundaryComponent>
    );
  });

  WrappedComponent.displayName = `withStandardErrorHandling(${Component.displayName || Component.name})`;
  return WrappedComponent;
}

/**
 * Hook for components to handle errors in a standardized way
 */
export function usestandarderrorhandling(componentname?: string) {
  const { handleError, wrapAsync, safeExecute } = useErrorHandler();
  const context = componentName || 'Component';

  const handleComponentError = React.useCallback((error: Error | string, operation?: string) => {
    const errorContext = operation ? `${context}.${operation}` : context;
    const actualError = typeof error === 'string' ? new Error(error) : error;
    handleError(actualError, errorContext);
  }, [handleError, context]);

  const safeAsyncCall = React.useCallback(async <T,>(
    asyncFn: () => Promise<T>,
    operation?: string,
    fallback?: T
  ): Promise<T | undefined> => {
    const errorContext = operation ? `${context}.${operation}` : `${context}.async`;
    return wrapAsync(asyncFn, errorContext, fallback);
  }, [wrapAsync, context]);

  const safeSyncCall = React.useCallback(<T,>(
    fn: () => T,
    operation?: string,
    fallback?: T
  ): T | undefined => {
    const errorContext = operation ? `${context}.${operation}` : `${context}.sync`;
    return safeExecute(fn, errorContext, fallback);
  }, [safeExecute, context]);

  return {
    handleError: handlecomponenterror,
    safeasynccall,
    safesynccall,
  };
}

/**
 * React hook for handling async operations with automatic error handling
 */
export function useAsyncOperation<T = any>(
  operation: () => Promise<T>,
  deps: React.DependencyList,
  options: {
    componentName?: string;
    operationName?: string;
    onError?: (error: Error) => void;
    fallbackValue?: T;
  } = {}
) {
  const { componentName = 'Component', operationName = 'operation', onError, fallbackValue } = options;
  const { handleError, wrapAsync } = useErrorHandler();
  const [data, setData] = React.useState<T | undefined>(fallbackValue);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);

  const execute = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    
    const result = await wrapAsync(
      operation,
      `${componentName}.${operationName}`,
      fallbackValue
    );
    
    setData(result);
    setLoading(false);
    
    return result;
  }, [operation, componentName, operationName, fallbackValue, wrapAsync]);

  React.useEffect(() => {
    execute();
  }, deps);

  return { data, loading, error, retry: executeloading,error,retry };
}