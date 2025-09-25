'use client';

import React from 'react';

import { ComponentErrorBoundary } from '@/components/ErrorBoundary';
import { ErrorHandler } from '@/lib/core/error-system';
import { useStandardErrorHandling } from '@/lib/core/error-wrapper';

export function withErrorHandling<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  displayName?: string
) {
  const EnhancedComponent = React.forwardRef<any, P>((props, ref) => {
    const componentName = displayName || WrappedComponent.displayName || WrappedComponent.name || 'Component';

    return (
      <ComponentErrorBoundary context={componentName}>
        <WrappedComponent {...props} ref={ref} />
      </ComponentErrorBoundary>
    );
  });

  EnhancedComponent.displayName = `withErrorHandling(${displayName || WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;
  return EnhancedComponent;
}

export function withFormErrorHandling<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  displayName?: string
) {
  const EnhancedFormComponent = React.forwardRef<any, P>((props, ref) => {
    const { handleError, safeAsyncCall } = useStandardErrorHandling(displayName || 'Form');
    const componentName = displayName || WrappedComponent.displayName || WrappedComponent.name || 'FormComponent';

    const enhancedProps = {
      ...props,
      onError: handleError,
      safeSubmit: safeAsyncCall,
    } as P;

    return (
      <ComponentErrorBoundary context={componentName}>
        <WrappedComponent {...enhancedProps} ref={ref} />
      </ComponentErrorBoundary>
    );
  });

  EnhancedFormComponent.displayName = `withFormErrorHandling(${displayName || WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;
  return EnhancedFormComponent;
}

export function withAsyncErrorHandling<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  displayName?: string
) {
  const EnhancedAsyncComponent = React.forwardRef<any, P>((props, ref) => {
    const { handleError, safeAsyncCall } = useStandardErrorHandling(displayName || 'AsyncComponent');
    const componentName = displayName || WrappedComponent.displayName || WrappedComponent.name || 'AsyncComponent';

    const enhancedProps = {
      ...props,
      onError: handleError,
      asyncCall: safeAsyncCall,
    } as P;

    return (
      <ComponentErrorBoundary context={componentName}>
        <WrappedComponent {...enhancedProps} ref={ref} />
      </ComponentErrorBoundary>
    );
  });

  EnhancedAsyncComponent.displayName = `withAsyncErrorHandling(${displayName || WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;
  return EnhancedAsyncComponent;
}

export function SafeComponent<P extends object>(props: {
  component: React.ComponentType<P>;
  componentProps: P;
  fallback?: React.ReactNode;
  context?: string;
}) {
  const { component, componentProps, fallback, context = 'SafeComponent' } = props;
  const { safeSyncCall } = useStandardErrorHandling(context);

  const content = safeSyncCall(
    () => React.createElement(component, componentProps),
    'render',
    fallback || <div className="text-sm text-muted-foreground">Component failed to load</div>
  );

  return <ComponentErrorBoundary context={context}>{content}</ComponentErrorBoundary>;
}

export function enhanceComponentsWithErrorHandling<T extends Record<string, React.ComponentType<any>>>(
  components: T
): { [K in keyof T]: React.ComponentType<React.ComponentProps<T[K]>> } {
  const enhanced = {} as { [K in keyof T]: React.ComponentType<React.ComponentProps<T[K]>> };

  (Object.entries(components) as Array<[keyof T, React.ComponentType<any>]>).forEach(([name, Component]) => {
    enhanced[name] = withErrorHandling(Component, String(name));
  });

  return enhanced;
}

export function safeEventHandler<T extends (...args: any[]) => any>(handler: T, context = 'EventHandler'): T {
  return ((...args: Parameters<T>) => {
    try {
      return handler(...args);
    } catch (error) {
      ErrorHandler.handle(error as Error, `${context}.eventHandler`);
      return undefined;
    }
  }) as T;
}
