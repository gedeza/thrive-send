import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
 
export function middleware(request: NextRequest) {
  // Simple middleware without auth dependencies
  return NextResponse.next();
}
 
export const config = {
  matcher: [
    // Apply to all pages except static files and API routes
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
