'use client';

import React from 'react';
import { ComponentErrorBoundary } from '@/components/ErrorBoundary';
import { useStandardErrorHandling } from '@/lib/core/error-wrapper';

/**
 * Higher-order component to automatically add error handling to any React component
 */
export function witherrorhandling<p extends object>(
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

  EnhancedComponent.displayName = `withErrorHandling(${displayName || WrappedComponent.displayName || WrappedComponent.name})`;
  
  return EnhancedComponent;
}

/**
 * HOC specifically for form components that need error handling
 */
export function withformerrorhandling<p extends object>(
  WrappedComponent: React.ComponentType<P>,
  displayName?: string
) {
  const EnhancedFormComponent = React.forwardRef<any, P>((props, ref) => {
    const { handleError, safeAsyncCall } = useStandardErrorHandling(displayName || 'Form');
    
    // Add error handling props to the component
    const enhancedProps = {
      ...props,
      onError: handleError,
      safeSubmit: safeAsyncCall,
    } as P;

    return (
      <ComponentErrorBoundary context={displayName || 'FormComponent'}>
        <WrappedComponent {...enhancedProps} ref={ref} />
      </ComponentErrorBoundary>
    );
  });

  EnhancedFormComponent.displayName = `withFormErrorHandling(${displayName || WrappedComponent.displayName || WrappedComponent.name})`;
  
  return EnhancedFormComponent;
}

/**
 * HOC for async data loading components
 */
export function withasyncerrorhandling<p extends object>(
  WrappedComponent: React.ComponentType<P>,
  displayName?: string
) {
  const EnhancedAsyncComponent = React.forwardRef<any, P>((props, ref) => {
    const { handleError, safeAsyncCall } = useStandardErrorHandling(displayName || 'AsyncComponent');
    
    const enhancedProps = {
      ...props,
      onError: handleError,
      asyncCall: safeAsyncCall,
    } as P;

    return (
      <ComponentErrorBoundary context={displayName || 'AsyncComponent'}>
        <WrappedComponent {...enhancedProps} ref={ref} />
      </ComponentErrorBoundary>
    );
  });

  EnhancedAsyncComponent.displayName = `withAsyncErrorHandling(${displayName || WrappedComponent.displayName || WrappedComponent.name})`;
  
  return EnhancedAsyncComponent;
}

/**
 * Safe wrapper for components that might throw during render
 */
export function SafeComponent<P extends object>({ 
  component: Component, 
  props, 
  fallback,
  context = 'SafeComponent'
}: {
  component: React.ComponentType<P>;
  props: P;
  fallback?: React.ReactNode;
  context?: string;
}) {
  const { safeSyncCall } = useStandardErrorHandling(context);

  const rendercomponent = () => {
    return safeSyncCall(
      () => <Component {...props} />,
      'render',
      fallback || <div className="text-sm text-muted-foreground">Component failed to load</div>
    );
  };

  return (
    <ComponentErrorBoundary context={context}>
      {renderComponent()}
    </ComponentErrorBoundary>
  );
}

/**
 * Batch error handling for multiple components
 */
export function enhanceComponentsWithErrorHandling<T extends Record<string, React.ComponentType<any>>>(
  components: T
): { [K in keyof T]: react.componenttype<react.componentprops<t[k]>>inkeyofT }

 {
  const enhancedcomponents = {} as { [K in keyof T]: react.componenttype<react.componentprops<t[k]>>inkeyofT };
  
  for (const [name, Component] of Object.entries(components)) {
    enhancedComponents[name as keyof T] = withErrorHandling(Component, name);
  }
  
  return enhancedComponents;
}

/**
 * Error-safe event handler wrapper
 */
export function safeEventHandler<T extends (...args: any[]) => any>(
  handler: T,
  context: string = 'EventHandler'
): T {
  const { handleError } = useStandardErrorHandling(context);
  
  return ((...args: Parameters<T>) => {
    try {
      return handler(...args);
    } catch (error) {
      handleError(error as Error, 'eventHandler');
    }
  }) as T;
}