import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { userId } = getAuth(req);
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { token } = await req.json();
    if (!token) {
      return new NextResponse("Token is required", { status: 400 });
    }

    const invitation = await db.invitation.findUnique({
      where: { token },
    });

    if (!invitation) {
      return new NextResponse("Invalid invitation token", { status: 404 });
    }

    if (invitation.status !== "PENDING") {
      return new NextResponse("Invitation is no longer valid", { status: 400 });
    }

    // Update invitation status
    await db.invitation.update({
      where: { id: invitation.id },
      data: { status: "ACCEPTED" },
    });

    // Create organization membership
    await db.organizationMembership.create({
      data: {
        userId,
        organizationId: invitation.organizationId,
        role: invitation.role,
      },
    });

    return NextResponse.json({ success: true });
  } catch (_error) {
    console.error("", _error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 