import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { userId, sessionClaims } = await auth();
    console.log("[SETUP] Starting setup with userId:", userId);
    
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Get or create the user from the database
    let user = await db.user.findUnique({
      where: { clerkId: userId },
    });
    console.log("[SETUP] Found user:", user);

    if (!user) {
      console.log("[SETUP] Creating new user with data:", {
        clerkId: userId,
        email: sessionClaims?.email,
        name: `${sessionClaims?.firstName || ''} ${sessionClaims?.lastName || ''}`.trim(),
      });
      
      // Create the user if they don't exist
      user = await db.user.create({
        data: {
          clerkId: userId,
          email: sessionClaims?.email as string,
          name: `${sessionClaims?.firstName || ''} ${sessionClaims?.lastName || ''}`.trim(),
          role: "ADMIN", // Set initial role as ADMIN
        },
      });
      console.log("[SETUP] Created new user:", user);
    }

    // Check if user already has an organization
    const existingMembership = await db.organizationMember.findFirst({
      where: { userId: user.id },
    });
    console.log("[SETUP] Existing membership:", existingMembership);

    if (existingMembership) {
      return new NextResponse("User already has an organization", { status: 400 });
    }

    // Create an organization
    console.log("[SETUP] Creating new organization");
    const organization = await db.organization.create({
      data: {
        name: "My Organization",
        slug: "my-organization",
      },
    });
    console.log("[SETUP] Created organization:", organization);

    // Add the user as a member of the organization with ADMIN role
    console.log("[SETUP] Creating organization membership");
    await db.organizationMember.create({
      data: {
        userId: user.id,
        organizationId: organization.id,
        role: "ADMIN", // This matches the string type in the schema
      },
    });
    console.log("[SETUP] Created organization membership");

    return NextResponse.json({ success: true });
  } catch (_error) {
    console.error("[SETUP_POST] Error details:", {
      error,
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
    });
    return new NextResponse("Internal Error", { status: 500 });
  }
} 