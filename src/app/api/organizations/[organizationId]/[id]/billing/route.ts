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

    const [subscription, billingHistory] = await Promise.all([
      organizationService.getSubscription(params.organizationId),
      organizationService.getBillingHistory(params.organizationId),
    ]);

    return NextResponse.json({
      subscription,
      billingHistory,
    });
  } catch (error) {
    console.error('[ORGANIZATION_BILLING_GET]', error);
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
    const subscription = await organizationService.updateSubscription(
      params.organizationId,
      body
    );

    return NextResponse.json(subscription);
  } catch (error) {
    console.error('[ORGANIZATION_BILLING_PATCH]', error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
} 