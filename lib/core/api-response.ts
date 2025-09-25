/**
 * Standardized API Response System
 * Provides consistent API responses across all endpoints
 */

import { NextResponse } from 'next/server';
import { z } from 'zod';

import { AppError, ErrorCode } from './error-system';

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
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

export class ApiResponseBuilder {
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

  static error(error: AppError | Error | string): NextResponse<ApiResponse> {
    let appError: AppError;

    if (error instanceof AppError) {
      appError = error;
    } else if (error instanceof Error) {
      appError = new AppError(error.message, ErrorCode.INTERNAL_ERROR, 500);
    } else {
      appError = new AppError(error, ErrorCode.UNKNOWN, 500);
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
    } else {
      details = errors;
      message = 'Validation failed';
    }

    const appError = AppError.validation(message, { validationErrors: details });
    return this.error(appError);
  }

  static notFound(resource: string): NextResponse<ApiResponse> {
    return this.error(AppError.notFound(resource));
  }

  static unauthorized(message?: string): NextResponse<ApiResponse> {
    return this.error(AppError.unauthorized(message));
  }

  static forbidden(message?: string): NextResponse<ApiResponse> {
    return this.error(AppError.forbidden(message));
  }

  static paymentRequired(message?: string): NextResponse<ApiResponse> {
    return this.error(AppError.paymentRequired(message));
  }

  static rateLimit(message?: string): NextResponse<ApiResponse> {
    return this.error(AppError.rateLimit(message));
  }

  static redirect(url: string, permanent = false): NextResponse {
    return NextResponse.redirect(url, permanent ? 308 : 307);
  }

  static noContent(): NextResponse {
    return new NextResponse(null, { status: 204 });
  }

  static accepted<T>(data?: T, location?: string): NextResponse<ApiResponse<T>> {
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

    return new NextResponse(JSON.stringify(response), {
      status: 202,
      headers,
    });
  }
}
