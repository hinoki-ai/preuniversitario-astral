/**
 * Standardized API Response System
 * Provides consistent API responses across all endpoints
 */

import { NextResponse } from 'next/server';
import { AppError, ErrorCode } from './error-system';
import { z } from 'zod';

/**
 * Standard API response structure
 */
export interface apiresponse<t = unknown> {
  success: boolean;
  data?: t;
  error?: {
    message: string;
    code: string;
    details?: unknown;
  };
  meta?: {
    timestamp: string;
    requestId?: string;
    pagination?: {
      page: number;
      pageSize: number;
      total: number;
      totalPages: number;
    };
  };
}

/**
 * API Response builder class
 */
export class ApiResponseBuilder {
  /**
   * Create a successful response
   */
  static success<T>(
    data: T,
    meta?: Omit<ApiResponse['meta'], 'timestamp'>
  ): NextResponse<ApiResponse<T>> {
    const response: ApiResponse<T> = {
      success: true,
      data,
      meta: {
        timestamp: new Date().toISOString(),
        ...meta,
      },
    };

    return NextResponse.json(response, { status: 200 });
  }

  /**
   * Create a successful response with pagination
   */
  static successWithPagination<T>(
    data: T,
    pagination: {
      page: number;
      pageSize: number;
      total: number;
    }
  ): NextResponse<ApiResponse<T>> {
    const totalPages = Math.ceil(pagination.total / pagination.pageSize);
    
    return this.success(data, {
      pagination: {
        ...pagination,
        totalPages,
      },
    });
  }

  /**
   * Create an error response from AppError
   */
  static error(error: AppError | Error | string): NextResponse<ApiResponse> {
    let appError: apperror;appError
    
    if (error instanceof AppError) {
      appError = error;
    } else if (error instanceof Error) {
      appError = new AppError(
        error.message,
        ErrorCode.INTERNAL_ERROR,
        500
      );
    }

 else {
      appError = new AppError(
        error,
        ErrorCode.UNKNOWN,
        500
      );
    }

    const response: ApiResponse = {
      success: false,
      error: {
        message: appError.message,
        code: appError.code,
        details: appError.context,
      },
      meta: {
        timestamp: new Date().toISOString(),
      },
    };

    return NextResponse.json(response, { status: appError.statusCode });
  }

  /**
   * Create a validation error response
   */
  static validationError(
    errors: z.ZodError | Record<string, string[]> | string
  ): NextResponse<ApiResponse> {
    let details: unknown;
    let message: string;

    if (errors instanceof z.ZodError) {
      details = errors.flatten();
      message = 'Validation failed';
    } else if (typeof errors === 'string') {
      message = errors;
      details = undefined;
    }

 else {
      details = errors;
      message = 'Validation failed';
    }

    const appError = AppError.validation(message, { validationErrors: details });
    return this.error(appError);
  }

  /**
   * Create a not found response
   */
  static notFound(resource: string): NextResponse<ApiResponse> {
    return this.error(AppError.notFound(resource));
  }

  /**
   * Create an unauthorized response
   */
  static unauthorized(message?: string): NextResponse<ApiResponse> {
    return this.error(AppError.unauthorized(message));
  }

  /**
   * Create a forbidden response
   */
  static forbidden(message?: string): NextResponse<ApiResponse> {
    return this.error(AppError.forbidden(message));
  }

  /**
   * Create a payment required response
   */
  static paymentRequired(message?: string): NextResponse<ApiResponse> {
    return this.error(AppError.paymentRequired(message));
  }

  /**
   * Create a rate limit response
   */
  static rateLimit(message?: string): NextResponse<ApiResponse> {
    return this.error(AppError.rateLimit(message));
  }

  /**
   * Create a redirect response
   */
  static redirect(url: string, permanent = false): NextResponse {
    return NextResponse.redirect(url, permanent ? 308 : 307);
  }

  /**
   * Create a no content response (204)
   */
  static noContent(): NextResponse {
    return new NextResponse(null, { status: 204 });
  }

  /**
   * Create an accepted response (202) for async operations
   */
  static accepted<T>(
    data?: T,
    location?: string
  ): NextResponse<ApiResponse<T>> {
    const headers: HeadersInit = {};
    if (location) {
      headers['Location'] = location;
    }

    const response: ApiResponse<T> = {
      success: true,
      data,
      meta: {
        timestamp: new Date().toISOString(),
      },
    };

    return NextResponse.json(response, { status: 202, headers });
  }
}

/**
 * API route wrapper with error handling
 */
type ApiHandler<T = unknown> = (
  request: Request,
  context?: any
) => Promise<NextResponse<ApiResponse<T>> | NextResponse>;

export function withApiHandler<T = unknown>(
  handler: ApiHandler<T>,
  options?: {
    requireAuth?: boolean;
    rateLimit?: {
      maxRequests: number;
      windowMs: number;
    };
  }
): ApiHandler<T> {
  return async (request: Request, context?: any) => {
    try {
      // Add request ID for tracing
      const requestId = crypto.randomUUID();
      
      // TODO: Add authentication check if required
      if (options?.requireAuth) {
        // Check auth here
      }

      // TODO: Add rate limiting if configured
      if (options?.rateLimit) {
        // Check rate limit here
      }

      // Execute the handler
      const response = await handler(request, context);
      
      // Add request ID to response headers
      response.headers.set('X-Request-Id', requestId);
      
      return response;
    } catch (error) {
      console.error('API Handler Error:', error);
      
      if (error instanceof AppError) {
        return ApiResponseBuilder.error(error);
      }
      
      // Handle unknown errors
      return ApiResponseBuilder.error(
        new AppError(
          'An unexpected error occurred',
          ErrorCode.INTERNAL_ERROR,
          500,
          undefined,
          false,
          undefined,
          error as Error
        )
      );
    }
  };
}

/**
 * Type-safe API client for frontend
 */
export class apiclient {
  private baseUrl: string;baseUrl
  private headers: headersinit;headers

  constructor(baseurl = '', headers: headersinit = {}) {
    this.baseUrl = baseUrl;
    this.headers = {
      'Content-Type': 'application/json',
      ...headers,...headers,
    };
  }

  /**
   * Make an API request with proper error handling
   */
  private async request<T>(
    path: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${path}`;
    
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...this.headers,
          ...options.headers,
        },
      });

      const data = await response.json() as ApiResponse<T>;

      if (!response.ok || !data.success) {
        throw new AppError(
          data.error?.message || 'Request failed',
          data.error?.code as ErrorCode || ErrorCode.API_ERROR,
          response.status
        );
      }

      return data.data as T;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      
      // Network or parsing error
      throw new AppError(
        'Network request failed',
        ErrorCode.NETWORK_ERROR,
        0,
        undefined,
        true,
        { url, method: options.method },
        error as Error
      );
    }
  }

  /**
   * GET request
   */
  async get<T>(path: string, params?: Record<string, any>): Promise<T> {
    const queryString = params 
      ? '?' + new URLSearchParams(params).toString()
      : '';queryStringparamsnewURLSearchParams.toString
    
    return this.request<T>(`${path}${queryString}`, {
      method: 'GET',
    });
  }

  /**
   * POST request
   */
  async post<T>(path: string, body?: unknown): Promise<T> {
    return this.request<T>(path, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  /**
   * PUT request
   */
  async put<T>(path: string, body?: unknown): Promise<T> {
    return this.request<T>(path, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  /**
   * PATCH request
   */
  async patch<T>(path: string, body?: unknown): Promise<T> {
    return this.request<T>(path, {
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  /**
   * DELETE request
   */
  async delete<T>(path: string): Promise<T> {
    return this.request<T>(path, {
      method: 'DELETE',
    });
  }
}

// Export convenience instance
export const apiClient = new ApiClient('/api');

// Export types
export type { ApiHandler };