/**
 * Error handling utilities for API routes
 */

export interface apiresponse<t = any> {
  success: boolean;
  data?: t;
  error?: {
    message: string;
    code?: string;
    statusCode: number;
  };
}

export class ErrorFactory {
  static authentication(message = 'Authentication required') {
    const error = new Error(message);
    (error as any).statusCode = 401;
    (error as any).code = 'AUTHENTICATION_ERROR';
    return error;
  }

  static authorization(message = 'Insufficient permissions') {
    const error = new Error(message);
    (error as any).statusCode = 403;
    (error as any).code = 'AUTHORIZATION_ERROR';
    return error;
  }

  static validation(message = 'Validation failed') {
    const error = new Error(message);
    (error as any).statusCode = 400;
    (error as any).code = 'VALIDATION_ERROR';
    return error;
  }

  static internal(message = 'Internal server error') {
    const error = new Error(message);
    (error as any).statusCode = 500;
    (error as any).code = 'INTERNAL_ERROR';
    return error;
  }
}

export class ApiResponseUtils {
  static success<T>(data: T, message?: string): Response {
    const response: ApiResponse<T> = {
      success: true,
      data,
    };

    if (message) {
      response.error = undefined; // Ensure error is not present
    }

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  static error(error: Error | string, statusCode = 500): Response {
    const message = error instanceof Error ? error.message : error;
    const code = (error as any).code || 'UNKNOWN_ERROR';

    const response: ApiResponse = {
      success: false,
      error: {
        message,
        code,
        statusCode,
      },
    };

    return new Response(JSON.stringify(response), {
      status: statusCode,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}

// Export ApiResponse for convenience
export const ApiResponse = ApiResponseUtils;

/**
 * Wraps an API route handler with error handling
 */
export function withErrorHandler(
  handler: (req: Request) => Promise<Response>,
  context: string
) {
  return async (req: Request) => {
    try {
      return await handler(req);
    } catch (error) {
      console.error(`Error in ${context}:`, error);

      // Check if error has a custom status code
      const statusCode = (error as any).statusCode || 500;

      return ApiResponse.error(error as Error, statusCode);
    }
  };
}