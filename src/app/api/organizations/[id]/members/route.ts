import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs';
import { OrganizationService } from '@/lib/api/organization-service';

const organizationService = new OrganizationService();

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await currentUser();
    if (!user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const members = await organizationService.getMembers(params.id);
    return NextResponse.json(members);
  } catch (error) {
    console.error('[ORGANIZATION_MEMBERS_GET]', error);
    return new NextResponse('Internal error', { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await currentUser();
    if (!user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await request.json();
    const invitation = await organizationService.inviteMember(
      params.id,
      body.email,
      body.role
    );

    return NextResponse.json(invitation);
  } catch (error) {
    console.error('[ORGANIZATION_MEMBERS_POST]', error);
    return new NextResponse('Internal error', { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await currentUser();
    if (!user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await request.json();
    const member = await organizationService.updateMemberRole(
      params.id,
      body.memberId,
      body.role
    );

    return NextResponse.json(member);
  } catch (error) {
    console.error('[ORGANIZATION_MEMBERS_PATCH]', error);
    return new NextResponse('Internal error', { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await currentUser();
    if (!user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const memberId = searchParams.get('memberId');

    if (!memberId) {
      return new NextResponse('Member ID is required', { status: 400 });
    }

    await organizationService.removeMember(params.id, memberId);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('[ORGANIZATION_MEMBERS_DELETE]', error);
    return new NextResponse('Internal error', { status: 500 });
  }
} 