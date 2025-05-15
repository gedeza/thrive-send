import { NextResponse } from "next/server";

export function handleApiError(error: unknown): NextResponse {
  console.error("[API] Error:", error);
  
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
        details: (error as any).message || "Unknown database error"
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
  
  // Default error response
  return NextResponse.json(
    { error: "Something went wrong" }, 
    { status: 500 }
  );
}