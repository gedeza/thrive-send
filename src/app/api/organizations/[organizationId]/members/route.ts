import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { OrganizationService } from "@/lib/api/organization-service";
import { db } from "@/lib/db";

const organizationService = new OrganizationService();

export async function GET(
  req: Request,
  { params }: { params: { organizationId: string } }
) {
  try {
    const { userId } = await auth();
    console.log("[MEMBERS_GET] Starting with userId:", userId);
    
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Get user from database
    const user = await db.user.findUnique({
      where: { clerkId: userId },
    });
    console.log("[MEMBERS_GET] Found user:", user);

    if (!user) {
      return new NextResponse("User not found", { status: 404 });
    }

    // Verify user is a member of the organization
    const membership = await db.organizationMember.findFirst({
      where: {
        userId: user.id,
        organizationId: params.organizationId,
      },
    });
    console.log("[MEMBERS_GET] Found membership:", membership);

    if (!membership) {
      return new NextResponse("Not a member of this organization", { status: 403 });
    }

    // Get organization members
    const members = await organizationService.getMembers(params.organizationId);
    console.log("[MEMBERS_GET] Found members:", members);

    return NextResponse.json(members);
  } catch (error) {
    console.error("[MEMBERS_GET] Error:", {
      error,
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
    });
    return new NextResponse("Internal Error", { status: 500 });
  }
} 