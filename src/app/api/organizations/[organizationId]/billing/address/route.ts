import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";

export async function PUT(
  request: Request,
  { params }: { params: { organizationId: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Verify user is admin/owner of organization
    const membership = await db.organizationMember.findFirst({
      where: {
        organizationId: params.organizationId,
        userId: userId,
        role: {
          in: ['ADMIN', 'OWNER']
        }
      },
    });

    if (!membership) {
      return NextResponse.json(
        { error: "Not authorized to update billing address" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { name, line1, line2, city, state, postalCode, country } = body;

    // Basic validation
    if (!name || !line1 || !city || !postalCode || !country) {
      return NextResponse.json(
        { error: "Missing required address information" },
        { status: 400 }
      );
    }

    // Get current organization
    const organization = await db.organization.findUnique({
      where: { id: params.organizationId }
    });

    if (!organization) {
      return NextResponse.json(
        { error: "Organization not found" },
        { status: 404 }
      );
    }

    // Store billing address in organization metadata
    const currentMetadata = organization.metadata as any || {};
    const billingData = {
      ...currentMetadata,
      billingAddress: {
        name,
        line1,
        line2: line2 || null,
        city,
        state,
        postalCode,
        country,
        updatedAt: new Date().toISOString()
      }
    };

    // Update organization metadata
    const updatedOrg = await db.organization.update({
      where: { id: params.organizationId },
      data: {
        metadata: billingData,
        updatedAt: new Date()
      }
    });

    return NextResponse.json({
      name: billingData.billingAddress.name,
      line1: billingData.billingAddress.line1,
      line2: billingData.billingAddress.line2,
      city: billingData.billingAddress.city,
      state: billingData.billingAddress.state,
      postalCode: billingData.billingAddress.postalCode,
      country: billingData.billingAddress.country,
      updatedAt: billingData.billingAddress.updatedAt
    });

  } catch (error) {
    console.error("Error updating billing address:", error);
    return NextResponse.json(
      { error: "Failed to update billing address" },
      { status: 500 }
    );
  }
}