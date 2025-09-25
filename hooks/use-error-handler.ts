'use client';

import { useCallback } from 'react';
import { toast } from './use-toast';

interface UseErrorHandlerReturn {
  handleError: (error: Error | string, context?: string) => void;
  wrapAsync: <T>(
    asyncFunction: () => Promise<T>,
    context?: string
  ) => Promise<T>;
}

export function useErrorHandler(): UseErrorHandlerReturn {
  const handleError = useCallback((error: Error | string, context?: string) => {
    const errorMessage = error instanceof Error ? error.message : error;
    const contextMessage = context ? ` (${context})` : '';

    console.error(`Error${contextMessage}:`, error);

    // Show toast with error message
    toast({
      title: 'Error',
      description: errorMessage,
      variant: 'destructive',
    });
  }, []);

  const wrapAsync = useCallback(async <T>(
    asyncFunction: () => Promise<T>,
    context?: string
  ): Promise<T> => {
    try {
      return await asyncFunction();
    } catch (error) {
      handleError(error as Error, context);
      throw error; // Re-throw so the error still propagates
    }
  }, [handleError]);

  return {
    handleError,
    wrapAsync,
  };
}