'use client';

import React from 'react';
import { AlertTriangle, Home, RefreshCw } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ErrorHandler } from '@/lib/core/error-system';

export type ErrorBoundaryLevel = 'page' | 'section' | 'component';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error?: Error; resetError: () => void }>;
  level?: ErrorBoundaryLevel;
  context?: string;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    const context = this.props.context || 'ReactErrorBoundary';
    ErrorHandler.handle(error, context);

    if (process.env.NODE_ENV === 'development') {
      console.error('Error boundary captured an error', { error, errorInfo, context, level: this.props.level });
    }
  }

  resetError = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      const { fallback: FallbackComponent, level = 'component' } = this.props;

      if (FallbackComponent) {
        return <FallbackComponent error={this.state.error} resetError={this.resetError} />;
      }

      return (
        <DefaultErrorFallback
          error={this.state.error}
          resetError={this.resetError}
          level={level}
        />
      );
    }

    return this.props.children;
  }
}

interface DefaultErrorFallbackProps {
  error?: Error;
  resetError: () => void;
  level: ErrorBoundaryLevel;
}

function DefaultErrorFallback({ error, resetError, level }: DefaultErrorFallbackProps) {
  if (level === 'page') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <AlertTriangle className="mx-auto mb-4 h-12 w-12 text-destructive" />
            <CardTitle>Algo salió mal</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-center">
            <p className="text-sm text-muted-foreground">
              Ha ocurrido un error inesperado. Por favor, intenta recargar la página.
            </p>
            {process.env.NODE_ENV === 'development' && error && (
              <details className="text-left text-xs">
                <summary className="cursor-pointer font-medium">Detalles del error</summary>
                <pre className="mt-2 whitespace-pre-wrap rounded-md bg-muted p-3 font-mono">
                  {error.message}
                </pre>
              </details>
            )}
            <div className="flex justify-center gap-2">
              <Button onClick={resetError} variant="outline">
                <RefreshCw className="mr-2 h-4 w-4" />
                Intentar de nuevo
              </Button>
              <Button onClick={() => window.location.reload()}>Recargar página</Button>
              <Button onClick={() => (window.location.href = '/')} variant="secondary">
                <Home className="mr-2 h-4 w-4" />
                Inicio
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (level === 'section') {
    return (
      <div className="min-h-[200px] flex items-center justify-center p-4">
        <Card className="w-full max-w-sm">
          <CardContent className="space-y-4 pt-6 text-center">
            <AlertTriangle className="mx-auto h-8 w-8 text-destructive" />
            <div>
              <h3 className="font-semibold">Error en sección</h3>
              <p className="text-sm text-muted-foreground">No se pudo cargar esta sección</p>
            </div>
            <Button onClick={resetError} size="sm" variant="outline">
              <RefreshCw className="mr-2 h-4 w-4" />
              Reintentar
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center rounded-md bg-muted/50 p-4">
      <div className="space-y-2 text-center">
        <AlertTriangle className="mx-auto h-6 w-6 text-destructive" />
        <p className="text-sm text-muted-foreground">Error al cargar componente</p>
        <Button onClick={resetError} size="sm" variant="outline">
          <RefreshCw className="mr-2 h-4 w-4" />
          Reintentar
        </Button>
      </div>
    </div>
  );
}

export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<ErrorBoundaryProps, 'children'>
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name || 'Component'})`;
  return WrappedComponent;
}

export const PageErrorBoundary: React.FC<{ children: React.ReactNode; context?: string }> = ({
  children,
  context,
}) => (
  <ErrorBoundary level="page" context={context}>
    {children}
  </ErrorBoundary>
);

export const SectionErrorBoundary: React.FC<{ children: React.ReactNode; context?: string }> = ({
  children,
  context,
}) => (
  <ErrorBoundary level="section" context={context}>
    {children}
  </ErrorBoundary>
);

export const ComponentErrorBoundary: React.FC<{ children: React.ReactNode; context?: string }> = ({
  children,
  context,
}) => (
  <ErrorBoundary level="component" context={context}>
    {children}
  </ErrorBoundary>
);

export default ErrorBoundary;
