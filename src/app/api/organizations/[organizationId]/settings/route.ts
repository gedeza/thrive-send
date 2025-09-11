import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { OrganizationService } from "@/lib/api/organization-service";
import { db } from "@/lib/prisma";

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

    // Verify user is a member of the organization
    const membership = await db.organizationMember.findFirst({
      where: {
        userId: userId,
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

    // Only allow ADMIN and OWNER members to update settings
    if (!['ADMIN', 'OWNER'].includes(membership.role)) {
      return NextResponse.json(
        { error: "Only admins and owners can update organization settings" },
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
  } catch (_error) {
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

export async function PUT(
  req: Request,
  { params }: { params: { organizationId: string } }
) {
  try {
    const { userId } = await auth();
    console.log("[SETTINGS_PUT] Starting with userId:", userId);
    console.log("[SETTINGS_PUT] Organization ID:", params.organizationId);
    
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401, headers: corsHeaders() }
      );
    }

    // Verify user is a member of the organization
    const membership = await db.organizationMember.findFirst({
      where: {
        userId: userId,
        organizationId: params.organizationId,
      },
    });
    console.log("[SETTINGS_PUT] Found membership:", membership);

    if (!membership) {
      return NextResponse.json(
        { error: "Not a member of this organization" },
        { status: 403, headers: corsHeaders() }
      );
    }

    // Only allow ADMIN and OWNER members to update settings
    if (!['ADMIN', 'OWNER'].includes(membership.role)) {
      return NextResponse.json(
        { error: "Only admins and owners can update organization settings" },
        { status: 403, headers: corsHeaders() }
      );
    }

    // Get request body
    const body = await req.json();
    const { name, description, industry, timezone, website, location, brandColor } = body;
    console.log("[SETTINGS_PUT] Request body:", body);

    // Basic validation
    if (!name || name.length < 2) {
      return NextResponse.json(
        { error: "Organization name must be at least 2 characters" },
        { status: 400, headers: corsHeaders() }
      );
    }

    // Verify organization exists
    const organization = await db.organization.findUnique({
      where: { id: params.organizationId },
    });
    console.log("[SETTINGS_PUT] Found organization:", organization);

    if (!organization) {
      return NextResponse.json(
        { error: "Organization not found" },
        { status: 404, headers: corsHeaders() }
      );
    }

    try {
      // Store additional settings in organization settings field
      const currentSettings = organization.settings as any || {};
      const updatedSettings = {
        ...currentSettings,
        description,
        industry,
        timezone,
        website,
        location,
        brandColor,
        updatedAt: new Date().toISOString()
      };

      // Update organization
      const updatedOrg = await db.organization.update({
        where: { id: params.organizationId },
        data: {
          name, // Update the name in the main table
          settings: updatedSettings,
          updatedAt: new Date()
        }
      });

      console.log("[SETTINGS_PUT] Updated organization:", updatedOrg);

      return NextResponse.json({
        message: "Organization settings updated successfully",
        organization: {
          id: updatedOrg.id,
          name: updatedOrg.name,
          settings: updatedSettings
        }
      }, {
        headers: corsHeaders()
      });

    } catch (updateError) {
      console.error("[SETTINGS_PUT] Error updating settings:", {
        error: updateError,
        message: updateError instanceof Error ? updateError.message : "Unknown error",
        stack: updateError instanceof Error ? updateError.stack : undefined,
        body,
        organizationId: params.organizationId
      });
      
      const errorMessage = updateError instanceof Error ? updateError.message : "Error updating settings";
      return NextResponse.json(
        { error: errorMessage },
        { status: 400, headers: corsHeaders() }
      );
    }
  } catch (_error) {
    console.error("[SETTINGS_PUT] Error:", {
      error,
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
      params,
      userId: (await auth()).userId
    });
    
    const errorMessage = error instanceof Error ? error.message : "Internal Error";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500, headers: corsHeaders() }
    );
  }
}

export async function GET(
  req: Request,
  { params }: { params: { organizationId: string } }
) {
  try {
    const { userId } = await auth();
    console.log("[SETTINGS_GET] Starting with userId:", userId);
    console.log("[SETTINGS_GET] Organization ID:", params.organizationId);
    
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401, headers: corsHeaders() }
      );
    }

    // Verify user is a member of the organization
    const membership = await db.organizationMember.findFirst({
      where: {
        userId: userId,
        organizationId: params.organizationId,
      },
    });

    if (!membership) {
      return NextResponse.json(
        { error: "Not a member of this organization" },
        { status: 403, headers: corsHeaders() }
      );
    }

    // Get organization with metadata
    const organization = await db.organization.findUnique({
      where: { id: params.organizationId }
    });

    if (!organization) {
      return NextResponse.json(
        { error: "Organization not found" },
        { status: 404, headers: corsHeaders() }
      );
    }

    const settings = organization.settings as any || {};
    
    return NextResponse.json({
      id: organization.id,
      name: organization.name,
      slug: organization.slug,
      ...settings
    }, {
      headers: corsHeaders()
    });

  } catch (_error) {
    console.error("", _error);
    const errorMessage = error instanceof Error ? error.message : "Internal Error";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500, headers: corsHeaders() }
    );
  }
} 