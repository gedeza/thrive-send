import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { userId, sessionClaims } = auth();
    
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Get or create the user from the database
    let user = await db.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      // Create the user if they don't exist
      user = await db.user.create({
        data: {
          clerkId: userId,
          email: sessionClaims?.email as string,
          name: `${sessionClaims?.firstName || ''} ${sessionClaims?.lastName || ''}`.trim(),
          role: "ADMIN", // Set initial role as ADMIN
        },
      });
    }

    // Check if user already has an organization
    const existingMembership = await db.organizationMember.findFirst({
      where: { userId: user.id },
    });

    if (existingMembership) {
      return new NextResponse("User already has an organization", { status: 400 });
    }

    // Create an organization
    const organization = await db.organization.create({
      data: {
        name: "My Organization",
        slug: "my-organization",
      },
    });

    // Add the user as a member of the organization with ADMIN role
    await db.organizationMember.create({
      data: {
        userId: user.id,
        organizationId: organization.id,
        role: "ADMIN", // This matches the string type in the schema
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[SETUP_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 