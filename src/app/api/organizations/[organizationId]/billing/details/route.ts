import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";

export async function GET(
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

    // Verify user is member of organization
    const membership = await db.organizationMember.findFirst({
      where: {
        organizationId: params.organizationId,
        userId: userId,
      },
    });

    if (!membership) {
      return NextResponse.json(
        { error: "Not authorized to view billing details" },
        { status: 403 }
      );
    }

    // Get organization with metadata
    const organization = await db.organization.findUnique({
      where: { id: params.organizationId }
    });

    if (!organization) {
      return NextResponse.json(
        { error: "Organization not found" },
        { status: 404 }
      );
    }

    const metadata = organization.metadata as any || {};
    
    // Return billing data from metadata
    const billingData = {
      paymentMethod: metadata.paymentMethod || null,
      billingAddress: metadata.billingAddress || null
    };

    return NextResponse.json(billingData);

  } catch (error) {
    console.error("Error fetching billing details:", error);
    return NextResponse.json(
      { error: "Failed to fetch billing details" },
      { status: 500 }
    );
  }
}