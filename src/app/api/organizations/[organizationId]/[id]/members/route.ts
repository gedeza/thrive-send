import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { OrganizationService } from '@/lib/api/organization-service';

const organizationService = new OrganizationService();

export async function GET(
  request: Request,
  { params }: { params: { organizationId: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const members = await organizationService.getMembers(params.organizationId);
    return NextResponse.json(members);
  } catch (error) {
    console.error('[ORGANIZATION_MEMBERS_GET]', error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: { organizationId: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const invitation = await organizationService.inviteMember(
      params.organizationId,
      body.email,
      body.role
    );

    return NextResponse.json(invitation);
  } catch (error) {
    console.error('[ORGANIZATION_MEMBERS_POST]', error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { organizationId: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const member = await organizationService.updateMemberRole(
      params.organizationId,
      body.memberId,
      body.role
    );

    return NextResponse.json(member);
  } catch (error) {
    console.error('[ORGANIZATION_MEMBERS_PATCH]', error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { organizationId: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const memberId = searchParams.get('memberId');

    if (!memberId) {
      return NextResponse.json({ error: "Member ID is required" }, { status: 400 });
    }

    await organizationService.removeMember(params.organizationId, memberId);
    return NextResponse.json({ success: true }, { status: 204 });
  } catch (error) {
    console.error('[ORGANIZATION_MEMBERS_DELETE]', error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
} 