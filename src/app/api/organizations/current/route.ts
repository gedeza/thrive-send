import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { OrganizationService } from "@/lib/api/organization-service";
import { db } from "@/lib/db";

const organizationService = new OrganizationService();

export async function GET() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Get user from database
    const user = await db.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      return new NextResponse("User not found", { status: 404 });
    }

    // Get organization using the service
    const organization = await organizationService.getOrganizationByUserId(user.id);

    if (!organization) {
      return new NextResponse("Organization not found", { status: 404 });
    }

    return NextResponse.json(organization);
  } catch (error) {
    console.error("[ORGANIZATIONS_CURRENT_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 