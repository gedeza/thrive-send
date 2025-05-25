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

    const [subscription, billingHistory] = await Promise.all([
      organizationService.getSubscription(params.id),
      organizationService.getBillingHistory(params.id),
    ]);

    return NextResponse.json({
      subscription,
      billingHistory,
    });
  } catch (error) {
    console.error('[ORGANIZATION_BILLING_GET]', error);
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
    const subscription = await organizationService.updateSubscription(
      params.id,
      body
    );

    return NextResponse.json(subscription);
  } catch (error) {
    console.error('[ORGANIZATION_BILLING_PATCH]', error);
    return new NextResponse('Internal error', { status: 500 });
  }
} 