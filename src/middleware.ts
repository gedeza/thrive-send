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

export default authMiddleware({
  async beforeAuth(request) {
    // Rate limiting
    const ip = request.ip ?? "127.0.0.1";
    const { success, limit, reset, remaining } = await ratelimit.limit(ip);

    if (!success) {
      return new NextResponse("Too Many Requests", {
        status: 429,
        headers: {
          "X-RateLimit-Limit": limit.toString(),
          "X-RateLimit-Remaining": remaining.toString(),
          "X-RateLimit-Reset": reset.toString(),
        },
      });
    }

    return null;
  },

  async afterAuth(auth, req) {
    // Handle authentication
    if (!auth.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check role-based access
    const hasAccess = await checkRoleAccess(req, auth.userId);
    if (!hasAccess) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    console.log("Middleware: Starting afterAuth with auth:", {
      userId: auth.userId,
      sessionId: auth.sessionId,
      orgId: auth.orgId,
    });

    // If the user is signed in, ensure they exist in our database
    if (auth.userId) {
      try {
        console.log("Middleware: Checking for user with clerkId:", auth.userId);
        
        // Check if user exists
        const user = await prisma.user.findUnique({
          where: { clerkId: auth.userId },
        });

        // If user doesn't exist, create them
        if (!user) {
          const userData = {
            clerkId: auth.userId,
            email: auth.sessionClaims?.email,
            name: `${auth.sessionClaims?.firstName || ''} ${auth.sessionClaims?.lastName || ''}`.trim(),
          };
          
          console.log("Middleware: Creating new user with data:", userData);

          try {
            const newUser = await prisma.user.create({
              data: userData,
            });
            console.log("Middleware: Successfully created new user:", newUser);
          } catch (createError) {
            console.error("Middleware: Failed to create user:", {
              error: createError,
              userData,
              stack: createError instanceof Error ? createError.stack : undefined,
            });
            throw createError; // Re-throw to handle it in the outer catch
          }
        } else {
          console.log("Middleware: Found existing user:", user);
        }
      } catch (error) {
        console.error("Middleware: Error in user creation/check:", {
          error,
          stack: error instanceof Error ? error.stack : undefined,
          auth: {
            userId: auth.userId,
            sessionId: auth.sessionId,
            orgId: auth.orgId,
          },
        });
        // Don't throw the error, just log it
        // This ensures the request continues even if user creation fails
      }
    } else {
      console.log("Middleware: No userId in auth object");
    }

    return null;
  },
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
}; 