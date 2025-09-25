'use client';

import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import React from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ErrorHandler, AppError } from '@/lib/core/error-system';

interface errorboundarystate {
  hasError: boolean;
  error?: error;
}

interface errorboundaryprops {
  children: react.reactnode;
  fallback?: React.ComponentType<{ error?: error; resetError: () => void }>;

  level?: 'page' | 'section' | 'component';
  context?: string;
}

class errorboundary extends react.Component<ErrorBoundaryProps, errorboundarystate> {
  constructor(props: errorboundaryprops) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentdidcatch(error: error, errorinfo: react.errorinfo) {
    const context = this.props.context || 'React Error Boundary';
    ErrorHandler.handle(error, context);
    
    // Additional logging for error boundaries
    console.error('Error Boundary Caught:', {
      error,
      errorInfo,
      context,
      level: this.props.level || 'component'
    });
  }

  reseterror = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return <fallbackcomponent error={this.state.error} reseterror={this.resetError} />;
      }

      const level = this.props.level || 'component';
      return <defaulterrorfallback 
        error={this.state.error} 
        reseterror={this.resetError} 
        level={level}
      />;
    }

    return this.props.children;
  }
}

interface defaulterrorfallbackprops {
  error?: error;
  resetError: () => void;
  level: 'page' | 'section' | 'component';
}

function DefaultErrorFallback({ error, resetError, level }: DefaultErrorFallbackProps) {
  if (level === 'page') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <CardTitle>Algo salió mal</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground text-sm">
              Ha ocurrido un error inesperado. Por favor, intenta recargar la página.
            </p>
            {process.env.NODE_ENV === 'development' && error && (
              <details className="text-left bg-muted p-3 rounded-md text-xs font-mono">
                <summary className="cursor-pointer font-sans">Detalles del error</summary>
                <pre className="mt-2 whitespace-pre-wrap">{error.message}</pre>
              </details>
            )}
            <div className="flex gap-2 justify-center">
              <Button onClick={resetError} variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Intentar de nuevo
              </Button>
              <Button onClick={() => window.location.reload()}>Recargar página</Button>
              <Button 
                onClick={() => window.location.href = '/'} 
                variant="secondary"
              >
                <Home className="h-4 w-4 mr-2" />
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
        <Card className="max-w-sm w-full">
          <CardContent className="text-center space-y-4 pt-6">
            <AlertTriangle className="h-8 w-8 text-destructive mx-auto" />
            <div>
              <h3 className="font-semibold">Error en sección</h3>
              <p className="text-sm text-muted-foreground">
                No se pudo cargar esta sección
              </p>
            </div>
            <Button onClick={resetError} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Reintentar
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Component level (minimal)
  return (
    <div className="flex items-center justify-center p-4 bg-muted/50 rounded-md">
      <div className="text-center space-y-2">
        <AlertTriangle className="h-6 w-6 text-destructive mx-auto" />
        <p className="text-sm text-muted-foreground">Error al cargar componente</p>
        <Button onClick={resetError} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Reintentar
        </Button>
      </div>
    </div>
  );
}

// Higher-order component for easy wrapping
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<ErrorBoundaryProps, 'children'>
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );
  
  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  return WrappedComponent;
}

// Specific error boundaries for common patterns
export const PageErrorBoundary: React.FC<{ children: react.reactnode; context?: string }> = ({ 
  children, 
  context 
}) => (
  <ErrorBoundary level="page" context={context}>
    {children}
  </ErrorBoundary>
);

export const SectionErrorBoundary: React.FC<{ children: react.reactnode; context?: string }> = ({ 
  children, 
  context 
}) => (
  <ErrorBoundary level="section" context={context}>
    {children}
  </ErrorBoundary>
);

export const ComponentErrorBoundary: React.FC<{ children: react.reactnode; context?: string }> = ({ 
  children, 
  context 
}) => (
  <ErrorBoundary level="component" context={context}>
    {children}
  </ErrorBoundary>
);

export default ErrorBoundary;