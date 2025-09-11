import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { sendInvitationEmail } from '@/lib/email';
import { nanoid } from 'nanoid';

export async function POST(req: NextRequest) {
  try {
    const { userId } = getAuth(req);
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { email, role } = await req.json();
    if (!email || !role) {
      return new NextResponse("Email and role are required", { status: 400 });
    }

    // Get the database user first
    const user = await db.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      return new NextResponse("User not found", { status: 404 });
    }

    // Get the organization for the current user
    const membership = await db.organizationMember.findFirst({
      where: { userId: user.id },
      include: { organization: true },
    });

    if (!membership) {
      return new NextResponse("User is not a member of any organization", { status: 400 });
    }

    // Generate a unique token for the invitation
    const token = nanoid();

    // Create the invitation
    const invitation = await db.invitation.create({
      data: {
        email,
        role,
        token,
        status: "PENDING",
        organizationId: membership.organizationId,
      },
    });

    // Send invitation email
    await sendInvitationEmail({
      email,
      token,
      organizationName: membership.organization.name,
      role,
    });

    return NextResponse.json(invitation);
  } catch (_error) {
    console.error("", _error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { userId } = getAuth(req);
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Get the database user first
    const user = await db.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      return new NextResponse("User not found", { status: 404 });
    }

    // Get the organization for the current user
    const membership = await db.organizationMember.findFirst({
      where: { userId: user.id },
    });

    if (!membership) {
      return new NextResponse("User is not a member of any organization", { status: 400 });
    }

    // Get all invitations for the organization
    const invitations = await db.invitation.findMany({
      where: { organizationId: membership.organizationId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(invitations);
  } catch (_error) {
    console.error("", _error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 