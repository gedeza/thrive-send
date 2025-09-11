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
        { error: "Not authorized to update payment methods" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { cardNumber, expMonth, expYear, cvc, name } = body;

    // Basic validation
    if (!cardNumber || !expMonth || !expYear || !cvc) {
      return NextResponse.json(
        { error: "Missing required payment information" },
        { status: 400 }
      );
    }

    // In production, this would integrate with Stripe or your payment processor
    // For now, we'll simulate the update and store basic info
    
    // Simulate payment method validation
    if (cardNumber.length < 13 || cardNumber.length > 19) {
      return NextResponse.json(
        { error: "Invalid card number" },
        { status: 400 }
      );
    }

    if (cvc.length < 3 || cvc.length > 4) {
      return NextResponse.json(
        { error: "Invalid CVC" },
        { status: 400 }
      );
    }

    const currentYear = new Date().getFullYear();
    const expYearNum = parseInt(expYear);
    const expMonthNum = parseInt(expMonth);
    
    if (expYearNum < currentYear || (expYearNum === currentYear && expMonthNum < new Date().getMonth() + 1)) {
      return NextResponse.json(
        { error: "Card has expired" },
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

    // Store payment info in organization metadata
    const currentMetadata = organization.metadata as any || {};
    const billingData = {
      ...currentMetadata,
      paymentMethod: {
        last4: cardNumber.slice(-4),
        brand: cardNumber.startsWith('4') ? 'visa' : cardNumber.startsWith('5') ? 'mastercard' : 'card',
        expMonth: expMonth,
        expYear: expYear,
        name: name || null,
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

    // Return sanitized payment method info (never return full card details)
    return NextResponse.json({
      type: billingData.paymentMethod.brand,
      last4: billingData.paymentMethod.last4,
      expMonth: billingData.paymentMethod.expMonth,
      expYear: billingData.paymentMethod.expYear,
      name: billingData.paymentMethod.name,
      updatedAt: billingData.paymentMethod.updatedAt
    });

  } catch (_error) {
    console.error("", _error);
    return NextResponse.json(
      { error: "Failed to update payment method" },
      { status: 500 }
    );
  }
}