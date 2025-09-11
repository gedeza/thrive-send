import { NextResponse } from "next/server";

export function handleApiError(error: unknown): NextResponse {
  console.error("", _error);
  
  // Handle Prisma errors
  if (
    typeof error === "object" && 
    error !== null && 
    'code' in error && 
    'meta' in error
  ) {
    // This is likely a Prisma error
    return NextResponse.json(
      { 
        error: "Database operation failed", 
        details: (error as any).message || "Unknown database error",
        code: (error as any).code
      }, 
      { status: 500 }
    );
  }
  
  // Handle validation errors
  if (
    typeof error === "object" && 
    error !== null && 
    'name' in error && 
    (error as any).name === "ZodError"
  ) {
    return NextResponse.json(
      { 
        error: "Invalid request data",
        details: (error as any).errors || "Validation failed"
      }, 
      { status: 400 }
    );
  }
  
  // Default error response with more details
  return NextResponse.json(
    { 
      error: "Something went wrong",
      details: error instanceof Error ? error.message : String(error)
    }, 
    { status: 500 }
  );
}