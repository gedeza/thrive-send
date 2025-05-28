import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { ApiError } from "@/lib/api/error-handler";

export interface AuthenticatedRequest extends NextRequest {
  auth: {
    userId: string;
    user: {
      id: string;
      clerkId: string;
    };
    organizationId?: string;
  };
}

export async function withAuth(
  request: NextRequest,
  handler: (req: AuthenticatedRequest) => Promise<NextResponse>
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get internal user
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { id: true, clerkId: true },
    });

    if (!user) {
      throw new ApiError("User not found", 404);
    }

    // Add auth info to request
    const authedRequest = request as AuthenticatedRequest;
    authedRequest.auth = {
      userId,
      user,
      organizationId: undefined,
    };

    return handler(authedRequest);
  } catch (error) {
    console.error("Auth middleware error:", error);
    return NextResponse.json(
      { error: "Authentication failed" },
      { status: 401 }
    );
  }
}

export async function withOrganization(
  request: NextRequest,
  handler: (req: AuthenticatedRequest) => Promise<NextResponse>
) {
  return withAuth(request, async (authedRequest) => {
    try {
      const { searchParams } = new URL(request.url);
      const organizationId = searchParams.get("organizationId");

      if (!organizationId) {
        throw new ApiError("organizationId is required", 400);
      }

      // Verify organization access
      const membership = await prisma.organizationMember.findFirst({
        where: {
          organizationId,
          userId: authedRequest.auth.user.id,
        },
      });

      if (!membership) {
        throw new ApiError("Organization not found or access denied", 403);
      }

      // Add organization to auth context
      authedRequest.auth.organizationId = organizationId;

      return handler(authedRequest);
    } catch (error) {
      if (error instanceof ApiError) {
        return NextResponse.json(
          { error: error.message },
          { status: error.statusCode }
        );
      }
      return NextResponse.json(
        { error: "Organization access check failed" },
        { status: 500 }
      );
    }
  });
} 