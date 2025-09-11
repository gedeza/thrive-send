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
        { error: "Not a member of this organization" },
        { status: 403 }
      );
    }

    // Get billing history from database
    // Note: This would typically integrate with Stripe or your payment provider
    const billingHistory = await db.invoice.findMany({
      where: {
        organizationId: params.organizationId
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 10 // Last 10 invoices
    });

    // If no real billing history exists, return sample data for demo
    if (billingHistory.length === 0) {
      // Get currency from query params or default to USD
      const url = new URL(request.url);
      const currency = url.searchParams.get('currency') || 'USD';
      
      // Currency rates (same as frontend)
      const rates: {[key: string]: number} = {
        USD: 1.00,
        EUR: 0.85,
        GBP: 0.73,
        ZAR: 18.50,
        CAD: 1.35,
        AUD: 1.45,
        JPY: 110.0,
        INR: 83.0,
        BRL: 5.20,
        MXN: 18.0
      };
      
      const convertAmount = (usdAmount: number): number => {
        const rate = rates[currency] || 1;
        return Math.round(usdAmount * rate * 100) / 100; // Round to 2 decimal places
      };
      
      const sampleHistory = [
        {
          date: new Date('2025-01-15').toISOString(),
          amount: convertAmount(79.00),
          currency: currency,
          status: 'paid',
          invoiceId: 'INV-2025-001',
          invoiceUrl: '#'
        },
        {
          date: new Date('2024-12-15').toISOString(),
          amount: convertAmount(79.00),
          currency: currency,
          status: 'paid',
          invoiceId: 'INV-2024-012',
          invoiceUrl: '#'
        },
        {
          date: new Date('2024-11-15').toISOString(),
          amount: convertAmount(79.00),
          currency: currency,
          status: 'paid',
          invoiceId: 'INV-2024-011',
          invoiceUrl: '#'
        }
      ];
      return NextResponse.json(sampleHistory);
    }

    // Transform database records to expected format
    const transformedHistory = billingHistory.map(invoice => ({
      date: invoice.createdAt.toISOString(),
      amount: invoice.amount / 100, // Convert cents to dollars
      status: invoice.status.toLowerCase(),
      invoiceId: invoice.invoiceNumber,
      invoiceUrl: invoice.invoiceUrl || '#'
    }));

    return NextResponse.json(transformedHistory);
  } catch (_error) {
    console.error("", _error);
    return NextResponse.json(
      { error: "Failed to fetch billing history" },
      { status: 500 }
    );
  }
}