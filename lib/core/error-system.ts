/**
 * Unified Error Handling System
 * Provides consistent error handling across the entire application
 */

import { toast } from '@/hooks/use-toast';

// Custom error codes for different error types
export enum ErrorCode {
  // Authentication & Authorization
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  SESSION_EXPIRED = 'SESSION_EXPIRED',
  
  // Validation
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  INVALID_INPUT = 'INVALID_INPUT',
  
  // API & Network
  NETWORK_ERROR = 'NETWORK_ERROR',
  API_ERROR = 'API_ERROR',
  TIMEOUT = 'TIMEOUT',
  
  // Database & Storage
  DATABASE_ERROR = 'DATABASE_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  CONFLICT = 'CONFLICT',
  
  // Application
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  FEATURE_DISABLED = 'FEATURE_DISABLED',
  RATE_LIMIT = 'RATE_LIMIT',
  
  // Payment
  PAYMENT_REQUIRED = 'PAYMENT_REQUIRED',
  PAYMENT_FAILED = 'PAYMENT_FAILED',
  
  // Unknown
  UNKNOWN = 'UNKNOWN',
}

// Error severity levels
export enum ErrorSeverity {
  LOW = 'low',      // Log only, no user notification
  MEDIUM = 'medium', // Show toast notification
  HIGH = 'high',    // Show modal or redirect
  CRITICAL = 'critical', // System failure, require immediate action
}

/**
 * Custom application error class
 */
export class AppError extends Error {
  public readonly code: ErrorCode;
  public readonly statusCode: number;
  public readonly severity: ErrorSeverity;
  public readonly isOperational: boolean;
  public readonly context?: Record<string, unknown>;
  public readonly originalError?: Error;

  constructor(
    message: string,
    code: ErrorCode = ErrorCode.INTERNAL_ERROR,
    statusCode: number = 500,
    severity: ErrorSeverity = ErrorSeverity.MEDIUM,
    isOperational: boolean = true,
    context?: Record<string, unknown>,
    originalError?: Error
  ) {
    super(message);
    
    this.name = 'AppError';
    this.code = code;
    this.statusCode = statusCode;
    this.severity = severity;
    this.isOperational = isOperational;
    this.context = context;
    this.originalError = originalError;
    
    // Maintains proper stack trace
    Object.setPrototypeOf(this, AppError.prototype);
    Error.captureStackTrace(this, this.constructor);
  }

  // Helper method to create common error types
  static unauthorized(message = 'Authentication required'): AppError {
    return new AppError(
      message,
      ErrorCode.UNAUTHORIZED,
      401,
      ErrorSeverity.HIGH
    );
  }

  static forbidden(message = 'Insufficient permissions'): AppError {
    return new AppError(
      message,
      ErrorCode.FORBIDDEN,
      403,
      ErrorSeverity.HIGH
    );
  }

  static notFound(resource: string): AppError {
    return new AppError(
      `${resource} not found`,
      ErrorCode.NOT_FOUND,
      404,
      ErrorSeverity.LOW
    );
  }

  static validation(message: string, context?: Record<string, unknown>): AppError {
    return new AppError(
      message,
      ErrorCode.VALIDATION_ERROR,
      400,
      ErrorSeverity.MEDIUM,
      true,
      context
    );
  }

  static paymentRequired(message = 'Payment required to access this feature'): AppError {
    return new AppError(
      message,
      ErrorCode.PAYMENT_REQUIRED,
      402,
      ErrorSeverity.HIGH
    );
  }

  static rateLimit(message = 'Too many requests. Please try again later.'): AppError {
    return new AppError(
      message,
      ErrorCode.RATE_LIMIT,
      429,
      ErrorSeverity.MEDIUM
    );
  }

  static network(message = 'Network error. Please check your connection.'): AppError {
    return new AppError(
      message,
      ErrorCode.NETWORK_ERROR,
      0,
      ErrorSeverity.MEDIUM
    );
  }

  static internal(message = 'An unexpected error occurred', originalError?: Error): AppError {
    return new AppError(
      message,
      ErrorCode.INTERNAL_ERROR,
      500,
      ErrorSeverity.HIGH,
      false,
      undefined,
      originalError
    );
  }

  // Convert to plain object for serialization
  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      statusCode: this.statusCode,
      severity: this.severity,
      isOperational: this.isOperational,
      context: this.context,
      stack: this.stack,
    };
  }
}

/**
 * Global error handler
 */
export class ErrorHandler {
  private static isDevelopment = process.env.NODE_ENV === 'development';
  /**
   * Main error handling method
   */
  static handle(error: Error | AppError, context?: string): void {
    // Convert regular errors to AppError
    const appError = error instanceof AppError 
      ? error 
      : new AppError(
          error.message,
          ErrorCode.UNKNOWN,
          500,
          ErrorSeverity.MEDIUM,
          false,
          { context },
          error
        );

    // Log error details
    this.logError(appError, context);

    // Handle based on severity
    switch (appError.severity) {
      case ErrorSeverity.LOW:
        // just log, no user notification
        break;
      case ErrorSeverity.MEDIUM:
        this.showToast(appError);
        break;
      case ErrorSeverity.HIGH:
        this.showToast(appError, 'destructive');
        this.handleHighSeverity(appError);
        break;
      case ErrorSeverity.CRITICAL:
        this.handleCritical(appError);
        break;
    }

    // Report to monitoring service in production
    if (!this.isDevelopment && !appError.isOperational) {
      this.reportToMonitoring(appError);
    }
  }

  /**
   * Log error with appropriate detail level
   */
  private static logError(error: AppError, context?: string): void {
    const logData = {
      timestamp: new Date().toISOString(),
      context,
      error: error.toJSON(),
    };

    if (this.isDevelopment) {
      console.group(`🔴 ${error.code}`);
      console.error('Message:', error.message);
      console.error('Context:', context);
      console.error('Details:', logData);
      if (error.originalError) {
        console.error('Original Error:', error.originalError);
      }
      console.trace('Stack Trace');
      console.groupEnd();
    }

 else {
      // In production, use structured logging
      console.error(JSON.stringify(logData));
    }
  }

  /**
   * Show toast notification to user
   */
  private static showToast(
    error: AppError,
    variant: 'default' | 'destructive' = 'default'
  ): void {
    const title = this.getUserFriendlyTitle(error.code);
    const description = this.getUserFriendlyMessage(error);

    toast({
      title,
      description,
      variant,
    });
  }

  /**
   * Handle high severity errors
   */
  private static handleHighSeverity(error: AppError): void {
    // Handle specific error codes
    switch (error.code) {
      case ErrorCode.UNAUTHORIZED:
      case ErrorCode.SESSION_EXPIRED:
        // Redirect to login
        if (typeof window !== 'undefined') {
          window.location.href = '/sign-in';
        }
        break;
      
      case ErrorCode.PAYMENT_REQUIRED:
        // Redirect to pricing
        if (typeof window !== 'undefined') {
          window.location.href = '/dashboard/plan';
        }
        break;
      
      default:
        // log for investigation
        break;
    }
  }

  /**
   * Handle critical errors (system failures)
   */
  private static handleCritical(error: AppError): void {
    // In production, show error page
    if (!this.isDevelopment && typeof window !== 'undefined') {
      // Store error details in session storage for error page
      sessionStorage.setItem('lastCriticalError', JSON.stringify(error.toJSON()));
      window.location.href = '/error';
    }
  }

  /**
   * Report error to monitoring service (e.g., Sentry, LogRocket)
   */
  private static reportToMonitoring(error: AppError): void {
    // TODO: integrate with your monitoring service
    //; Example: Sentry.captureException(error)
    console.error('[Monitoring] Would report error:', error.toJSON());
  }

  /**
   * Get user-friendly error title
   */
  private static getUserFriendlyTitle(code: ErrorCode): string {
    const titles: Record<ErrorCode, string> = {
      [ErrorCode.UNAUTHORIZED]: 'Authentication Required',
      [ErrorCode.FORBIDDEN]: 'Access Denied',
      [ErrorCode.SESSION_EXPIRED]: 'Session Expired',
      [ErrorCode.VALIDATION_ERROR]: 'Invalid Input',
      [ErrorCode.INVALID_INPUT]: 'Invalid Input',
      [ErrorCode.NETWORK_ERROR]: 'Connection Error',
      [ErrorCode.API_ERROR]: 'Service Error',
      [ErrorCode.TIMEOUT]: 'Request Timeout',
      [ErrorCode.DATABASE_ERROR]: 'Data Error',
      [ErrorCode.NOT_FOUND]: 'Not Found',
      [ErrorCode.CONFLICT]: 'Conflict',
      [ErrorCode.INTERNAL_ERROR]: 'System Error',
      [ErrorCode.FEATURE_DISABLED]: 'Feature Unavailable',
      [ErrorCode.RATE_LIMIT]: 'Too Many Requests',
      [ErrorCode.PAYMENT_REQUIRED]: 'Payment Required',
      [ErrorCode.PAYMENT_FAILED]: 'Payment Failed',
      [ErrorCode.UNKNOWN]: 'Error',
    };

    return titles[code] || 'Error';
  }

  /**
   * Get user-friendly error message
   */
  private static getUserFriendlyMessage(error: AppError): string {
    // For operational errors, use the actual message
    if (error.isOperational) {
      return error.message;
    }

    // For non-operational errors, use generic messages
    const messages: Partial<Record<ErrorCode, string>> = {
      [ErrorCode.NETWORK_ERROR]: 'Please check your internet connection and try again.',
      [ErrorCode.INTERNAL_ERROR]: 'Something went wrong. Our team has been notified.',
      [ErrorCode.DATABASE_ERROR]: 'Unable to access data. Please try again later.',
    };

    return messages[error.code] || 'An unexpected error occurred. Please try again.';
  }
}

/**
 * React hook for error handling in components
 */
export function useErrorHandler() {
  const handleError = (error: Error | AppError, context?: string) => {
    ErrorHandler.handle(error, context);
  };

  const handleAsync = async <T,>(
    asyncFn: () => Promise<T>,
    context?: string
  ): Promise<T | undefined> => {
    try {
      return await asyncFn();
    } catch (error) {
      handleError(error as Error, context);
      return undefined;
    }
  };

  const wrapAsync = async <T,>(
    asyncFn: () => Promise<T>,
    context?: string,
    fallbackValue?: T
  ): Promise<T | undefined> => {
    try {
      return await asyncFn();
    } catch (error) {
      handleError(error as Error, context);
      return fallbackValue;
    }
  };

  const safeExecute = <T,>(
    fn: () => T,
    context?: string,
    fallbackValue?: T
  ): T | undefined => {
    try {
      return fn();
    } catch (error) {
      handleError(error as Error, context);
      return fallbackValue;
    }
  };

  return {
    handleError,
    handleAsync,
    wrapAsync,
    safeExecute,
    AppError,
  };
}


// Export everything
export default ErrorHandler;