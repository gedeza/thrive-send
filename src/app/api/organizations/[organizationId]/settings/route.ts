import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { OrganizationService } from "@/lib/api/organization-service";
import { db } from "@/lib/db";

const organizationService = new OrganizationService();

// Add CORS headers to the response
function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
}

// Handle OPTIONS request for CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders(),
  });
}

export async function PATCH(
  req: Request,
  { params }: { params: { organizationId: string } }
) {
  try {
    const { userId } = await auth();
    console.log("[SETTINGS_PATCH] Starting with userId:", userId);
    console.log("[SETTINGS_PATCH] Organization ID:", params.organizationId);
    
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401, headers: corsHeaders() }
      );
    }

    // Get user from database
    const user = await db.user.findUnique({
      where: { clerkId: userId },
    });
    console.log("[SETTINGS_PATCH] Found user:", user);

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404, headers: corsHeaders() }
      );
    }

    // Verify user is a member of the organization
    const membership = await db.organizationMember.findFirst({
      where: {
        userId: user.id,
        organizationId: params.organizationId,
      },
    });
    console.log("[SETTINGS_PATCH] Found membership:", membership);

    if (!membership) {
      return NextResponse.json(
        { error: "Not a member of this organization" },
        { status: 403, headers: corsHeaders() }
      );
    }

    // Only allow ADMIN members to update settings
    if (membership.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Only admins can update organization settings" },
        { status: 403, headers: corsHeaders() }
      );
    }

    // Get request body
    const body = await req.json();
    console.log("[SETTINGS_PATCH] Request body:", body);

    // Verify organization exists
    const organization = await db.organization.findUnique({
      where: { id: params.organizationId },
    });
    console.log("[SETTINGS_PATCH] Found organization:", organization);

    if (!organization) {
      return NextResponse.json(
        { error: "Organization not found" },
        { status: 404, headers: corsHeaders() }
      );
    }

    try {
      // Update organization settings
      const updatedOrganization = await organizationService.updateSettings(
        params.organizationId,
        body
      );
      console.log("[SETTINGS_PATCH] Updated organization:", updatedOrganization);

      return NextResponse.json(updatedOrganization, {
        headers: corsHeaders()
      });
    } catch (updateError) {
      console.error("[SETTINGS_PATCH] Error updating settings:", {
        error: updateError,
        message: updateError instanceof Error ? updateError.message : "Unknown error",
        stack: updateError instanceof Error ? updateError.stack : undefined,
        body,
        organizationId: params.organizationId
      });
      
      // Ensure we're always returning a JSON response
      const errorMessage = updateError instanceof Error ? updateError.message : "Error updating settings";
      return NextResponse.json(
        { error: errorMessage },
        { status: 400, headers: corsHeaders() }
      );
    }
  } catch (error) {
    console.error("[SETTINGS_PATCH] Error:", {
      error,
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
      params,
      userId: (await auth()).userId
    });
    
    // Ensure we're always returning a JSON response
    const errorMessage = error instanceof Error ? error.message : "Internal Error";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500, headers: corsHeaders() }
    );
  }
} 