import { authMiddleware } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export default authMiddleware({
  async afterAuth(auth, req) {
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

    return NextResponse.next();
  },
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
}; 