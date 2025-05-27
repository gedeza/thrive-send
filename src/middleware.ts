import { authMiddleware } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { prisma } from "@/lib/prisma";

// Create a new ratelimiter that allows 10 requests per 10 seconds
const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, "10 s"),
  analytics: true,
});

// Role-based access control middleware
async function checkRoleAccess(request: NextRequest, userId: string) {
  // Skip role check for public routes
  if (request.nextUrl.pathname.startsWith('/api/public')) {
    return true;
  }

  // Get user role from database
  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    select: { role: true }
  });

  if (!user) return false;

  // Define role-based access rules
  const roleAccess = {
    CONTENT_CREATOR: ['/api/content', '/api/comments'],
    REVIEWER: ['/api/content', '/api/comments', '/api/review'],
    APPROVER: ['/api/content', '/api/comments', '/api/review', '/api/approve'],
    PUBLISHER: ['/api/content', '/api/comments', '/api/review', '/api/approve', '/api/publish'],
    ADMIN: ['*'] // Admin has access to everything
  };

  const userRole = user.role;
  const allowedPaths = roleAccess[userRole];

  // Check if the current path is allowed for the user's role
  return allowedPaths.includes('*') || 
    allowedPaths.some(path => request.nextUrl.pathname.startsWith(path));
}

// Check if user has an organization
async function checkOrganizationAccess(userId: string) {
  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: {
      organizationMemberships: true
    }
  });

  return user?.organizationMemberships && user.organizationMemberships.length > 0;
}

// Define public routes that don't require authentication
const publicRoutes = [
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/webhook(.*)',
  '/api/public(.*)'
];

export default authMiddleware({
  publicRoutes,
  async afterAuth(auth, req: NextRequest) {
    // Handle authentication
    if (!auth.userId && !publicRoutes.some(route => req.nextUrl.pathname.match(new RegExp(`^${route}$`)))) {
      const signInUrl = new URL('/sign-in', req.url);
      signInUrl.searchParams.set('redirect_url', req.url);
      return NextResponse.redirect(signInUrl);
    }

    // If the user is signed in and trying to access a public route,
    // redirect them to the content calendar
    if (auth.userId && publicRoutes.some(route => req.nextUrl.pathname.match(new RegExp(`^${route}$`)))) {
      return NextResponse.redirect(new URL('/content/calendar', req.url));
    }

    // Check organization access for protected routes
    if (auth.userId && !publicRoutes.some(route => req.nextUrl.pathname.match(new RegExp(`^${route}$`)))) {
      const hasOrganization = await checkOrganizationAccess(auth.userId);
      if (!hasOrganization) {
        return NextResponse.redirect(new URL('/organization', req.url));
      }
    }

    // Redirect root path to content calendar
    if (auth.userId && req.nextUrl.pathname === '/') {
      return NextResponse.redirect(new URL('/content/calendar', req.url));
    }

    return NextResponse.next();
  }
});

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
}; 