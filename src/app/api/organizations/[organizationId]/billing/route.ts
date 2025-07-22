import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { OrganizationService } from "@/lib/api/organization-service";

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

    const organizationService = new OrganizationService();
    const subscription = await organizationService.getSubscription(params.organizationId);

    // Transform subscription data for frontend
    const billingData = subscription ? {
      plan: subscription.plan,
      status: subscription.status,
      nextBilling: subscription.currentPeriodEnd,
      features: subscription.features,
      createdAt: subscription.createdAt,
      updatedAt: subscription.updatedAt
    } : {
      plan: 'professional',
      status: 'active',
      nextBilling: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
      features: {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    return NextResponse.json(billingData);
  } catch (error) {
    console.error("Error fetching subscription:", error);
    return NextResponse.json(
      { error: "Failed to fetch subscription" },
      { status: 500 }
    );
  }
}

export async function PATCH(
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

    const body = await request.json();
    const { plan } = body;

    if (!plan) {
      return NextResponse.json(
        { error: "Plan is required" },
        { status: 400 }
      );
    }

    const organizationService = new OrganizationService();
    const subscription = await organizationService.updateSubscription(
      params.organizationId,
      plan
    );

    return NextResponse.json(subscription);
  } catch (error) {
    console.error("Error updating subscription:", error);
    return NextResponse.json(
      { error: "Failed to update subscription" },
      { status: 500 }
    );
  }
} 