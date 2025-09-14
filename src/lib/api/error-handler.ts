import { NextResponse } from "next/server";
import { z } from "zod";
import { Prisma } from "@prisma/client";

export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public details?: unknown
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export const handleApiError = (error: unknown) => {
  console.error("", _error);

  // Handle known error types
  if (_error instanceof ApiError) {
    return NextResponse.json(
      {
        error: error.message,
        ...(error.details && { details: error.details }),
      },
      { status: error.statusCode }
    );
  }

  if (_error instanceof z.ZodError) {
    return NextResponse.json(
      {
        error: "Validation error",
        details: error.errors,
      },
      { status: 400 }
    );
  }

  if (_error instanceof Prisma.PrismaClientKnownRequestError) {
    // Handle specific Prisma errors
    switch (error.code) {
      case "P2002":
        return NextResponse.json(
          {
            error: "Unique constraint violation",
            details: error.meta,
          },
          { status: 409 }
        );
      case "P2025":
        return NextResponse.json(
          {
            error: "Record not found",
            details: error.meta,
          },
          { status: 404 }
        );
      default:
        return NextResponse.json(
          {
            error: "Database error",
            code: error.code,
          },
          { status: 500 }
        );
    }
  }

  if (_error instanceof Prisma.PrismaClientValidationError) {
    return NextResponse.json(
      {
        error: "Invalid data format",
        details: _error.message,
      },
      { status: 400 }
    );
  }

  // Handle unknown errors
  return NextResponse.json(
    {
      error: "Internal server error",
      ...(process.env.NODE_ENV === "development" && {
        details: _error instanceof Error ? _error.message : String(_error),
      }),
    },
    { status: 500 }
  );
}; 