import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
// Lazy import database to prevent blocking server startup
let prisma: any = null;
const getPrisma = async () => {
  if (!prisma) {
    const { db } = await import("@/lib/db");
    prisma = db;
  }
  return prisma;
};

// Role-based access control middleware - simplified for development
async function checkRoleAccess(request: NextRequest, userId: string) {
  // Skip role checks for public API routes
  if (request.nextUrl.pathname.startsWith('/api/public') || 
      request.nextUrl.pathname.startsWith('/api/test-') ||
      request.nextUrl.pathname.startsWith('/api/db/')) {
    return true;
  }
  return true; // Allow all for now
}

// Check if user has an organization - simplified for development
async function checkOrganizationAccess(userId: string) {
  return true; // Allow all for now
}

// Define public routes that don't require authentication
const publicRoutes = [
  '/landing',
  '/sign-in(.*)', 
  '/sign-up(.*)',
  '/api/webhook(.*)',
  '/api/webhooks(.*)',
  '/api/public(.*)',
  '/api/test-db(.*)',
  '/api/simple-test(.*)',
  '/api/db/(.*)'
];

const isPublicRoute = createRouteMatcher(publicRoutes);

export default clerkMiddleware(async (auth, req) => {
  // Check for malformed URL patterns first
  const url = req.nextUrl.clone();
  const pathname = url.pathname;
  
  // DEVELOPMENT MODE: Allow all API routes to pass through
  if (pathname.startsWith('/api/')) {
    return NextResponse.next();
  }
  
  // Improved malformed URL detection - check for different types of array notations
  if (pathname.includes('/content/[') || 
      pathname.includes('/content/%5B') || 
      pathname.includes('/content/%22') ||
      pathname === '/content/[]' ||
      pathname.match(/\/content\/\[[^\]]*\]/) ||
      pathname.match(/\/content\/\[.*/) ||
      pathname.match(/\/content\/.*\]/) ||
      pathname.match(/\/content\/blob:/) ||
      pathname.includes('localhost:3000')) {
    // Redirect to the content dashboard
    url.pathname = '/content';
    return NextResponse.redirect(url);
  }

  const { userId } = await auth();

  // Handle authentication for non-API routes
  if (!userId && !isPublicRoute(req)) {
    const signInUrl = new URL('/sign-in', req.url);
    signInUrl.searchParams.set('redirect_url', req.url);
    return NextResponse.redirect(signInUrl);
  }

  // If the user is signed in and trying to access a public route,
  // redirect them to the content calendar
  if (userId && isPublicRoute(req)) {
    return NextResponse.redirect(new URL('/content/calendar', req.url));
  }

  // Redirect landing page to content calendar for authenticated users
  if (userId && req.nextUrl.pathname === '/landing') {
    return NextResponse.redirect(new URL('/content/calendar', req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
}; 