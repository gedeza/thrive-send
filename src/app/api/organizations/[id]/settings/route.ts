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

    const organization = await organizationService.getOrganization(params.id);
    if (!organization) {
      return new NextResponse('Organization not found', { status: 404 });
    }

    return NextResponse.json(organization);
  } catch (error) {
    console.error('[ORGANIZATION_SETTINGS_GET]', error);
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
    const organization = await organizationService.updateSettings(params.id, body);

    return NextResponse.json(organization);
  } catch (error) {
    console.error('[ORGANIZATION_SETTINGS_PATCH]', error);
    return new NextResponse('Internal error', { status: 500 });
  }
} 