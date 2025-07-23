import { NextResponse } from "next/server";
import { ZodError } from "zod";

// Standardized error response types
export interface ApiError {
  error: string;
  message?: string;
  details?: any;
  code?: string;
  timestamp?: string;
}

export interface ApiSuccess<T = any> {
  data: T;
  message?: string;
  timestamp?: string;
}

// Standard HTTP status codes
export const HttpStatus = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
} as const;

// Standardized error response helper
export function createErrorResponse(
  error: string,
  status: number = HttpStatus.INTERNAL_SERVER_ERROR,
  details?: any,
  code?: string
): NextResponse<ApiError> {
  const errorResponse: ApiError = {
    error,
    timestamp: new Date().toISOString(),
    ...(details && { details }),
    ...(code && { code }),
  };

  return NextResponse.json(errorResponse, { status });
}

// Standardized success response helper
export function createSuccessResponse<T>(
  data: T,
  status: number = HttpStatus.OK,
  message?: string
): NextResponse<ApiSuccess<T>> {
  const successResponse: ApiSuccess<T> = {
    data,
    timestamp: new Date().toISOString(),
    ...(message && { message }),
  };

  return NextResponse.json(successResponse, { status });
}

// Handle common error types
export function handleApiError(error: unknown): NextResponse<ApiError> {
  console.error("API Error:", error);

  if (error instanceof ZodError) {
    return createErrorResponse(
      "Validation failed",
      HttpStatus.BAD_REQUEST,
      error.errors,
      "VALIDATION_ERROR"
    );
  }

  if (error instanceof Error) {
    // Check for specific database errors
    if (error.message.includes("P2002")) {
      return createErrorResponse(
        "A record with this information already exists",
        HttpStatus.CONFLICT,
        { constraint: "unique_constraint" },
        "DUPLICATE_RECORD"
      );
    }

    if (error.message.includes("P2025")) {
      return createErrorResponse(
        "Record not found",
        HttpStatus.NOT_FOUND,
        null,
        "RECORD_NOT_FOUND"
      );
    }

    if (error.message.includes("P1001")) {
      return createErrorResponse(
        "Database connection failed",
        HttpStatus.SERVICE_UNAVAILABLE,
        null,
        "DATABASE_ERROR"
      );
    }

    return createErrorResponse(
      "An unexpected error occurred",
      HttpStatus.INTERNAL_SERVER_ERROR,
      { message: error.message },
      "INTERNAL_ERROR"
    );
  }

  return createErrorResponse(
    "An unknown error occurred",
    HttpStatus.INTERNAL_SERVER_ERROR,
    null,
    "UNKNOWN_ERROR"
  );
}

// Authentication helper
export function createUnauthorizedResponse(message: string = "Authentication required"): NextResponse<ApiError> {
  return createErrorResponse(message, HttpStatus.UNAUTHORIZED, null, "UNAUTHORIZED");
}

// Authorization helper
export function createForbiddenResponse(message: string = "Access denied"): NextResponse<ApiError> {
  return createErrorResponse(message, HttpStatus.FORBIDDEN, null, "FORBIDDEN");
}

// Validation helper
export function createValidationResponse(message: string, details?: any): NextResponse<ApiError> {
  return createErrorResponse(message, HttpStatus.BAD_REQUEST, details, "VALIDATION_ERROR");
}

// Not found helper
export function createNotFoundResponse(resource: string = "Resource"): NextResponse<ApiError> {
  return createErrorResponse(`${resource} not found`, HttpStatus.NOT_FOUND, null, "NOT_FOUND");
}