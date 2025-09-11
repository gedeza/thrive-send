import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_...', {
  apiVersion: '2023-10-16',
});

export async function GET(request: NextRequest) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get('organizationId');
    const status = searchParams.get('status');
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');
    const productId = searchParams.get('productId');
    const clientId = searchParams.get('clientId');
    const limit = parseInt(searchParams.get('limit') || '50');

    if (!organizationId) {
      return NextResponse.json(
        { error: 'organizationId is required' },
        { status: 400 }
      );
    }

    // Build search parameters for Stripe
    const searchParams_stripe: any = {
      limit: Math.min(limit, 100), // Stripe max is 100
    };

    // Add date filters
    if (dateFrom) {
      searchParams_stripe.created = {
        gte: Math.floor(new Date(dateFrom).getTime() / 1000)
      };
    }
    if (dateTo) {
      searchParams_stripe.created = {
        ...searchParams_stripe.created,
        lte: Math.floor(new Date(dateTo).getTime() / 1000)
      };
    }

    // Retrieve payment intents from Stripe
    const paymentIntents = await stripe.paymentIntents.list(searchParams_stripe);

    // Filter by organization and other criteria
    const filteredIntents = paymentIntents.data.filter(intent => {
      const metadata = intent.metadata;
      
      // Filter by organization
      if (metadata.organizationId !== organizationId) return false;
      
      // Filter by status
      if (status && intent.status !== status) return false;
      
      // Filter by product
      if (productId && metadata.productId !== productId) return false;
      
      // Filter by client
      if (clientId && metadata.clientId !== clientId) return false;
      
      return true;
    });

    // Transform to our Transaction format
    const transactions = filteredIntents.map(intent => {
      const charge = intent.charges?.data[0];
      const paymentMethod = charge?.payment_method_details;
      
      return {
        id: intent.id,
        paymentIntentId: intent.id,
        productId: intent.metadata.productId || '',
        productName: intent.metadata.productName || 'Unknown Product',
        clientId: intent.metadata.clientId || '',
        organizationId: intent.metadata.organizationId,
        amount: intent.amount / 100, // Convert from cents
        currency: intent.currency.toUpperCase(),
        status: mapStripeStatusToTransaction(intent.status),
        paymentMethod: {
          id: charge?.payment_method || '',
          type: 'card' as const,
          provider: 'stripe',
          last4: paymentMethod?.card?.last4,
          brand: paymentMethod?.card?.brand,
          isDefault: false
        },
        processingFee: calculateProcessingFee(intent.amount, intent.currency),
        netAmount: intent.amount / 100 - calculateProcessingFee(intent.amount, intent.currency),
        metadata: intent.metadata,
        createdAt: new Date(intent.created * 1000).toISOString(),
        completedAt: charge?.created ? new Date(charge.created * 1000).toISOString() : undefined
      };
    });

    // Sort by creation date (newest first)
    transactions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json({
      data: transactions,
      total: transactions.length,
      hasMore: paymentIntents.has_more
    });

  } catch (_error) {
    console.error("", _error);
    
    if (_error instanceof Stripe.errors.StripeError) {
      return NextResponse.json(
        { 
          error: 'Failed to fetch transaction history',
          details: _error.message 
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper functions
function mapStripeStatusToTransaction(stripeStatus: string): 'pending' | 'completed' | 'failed' | 'refunded' {
  switch (stripeStatus) {
    case 'requires_payment_method':
    case 'requires_confirmation':
    case 'requires_action':
    case 'processing':
      return 'pending';
    case 'succeeded':
      return 'completed';
    case 'requires_capture':
      return 'pending';
    case 'canceled':
      return 'failed';
    default:
      return 'failed';
  }
}

function calculateProcessingFee(amountInCents: number, currency: string): number {
  // Stripe's standard processing fee: 2.9% + $0.30
  const percentageFee = amountInCents * 0.029;
  const fixedFee = currency.toLowerCase() === 'usd' ? 30 : 0; // $0.30 in cents
  
  return Math.round((percentageFee + fixedFee)) / 100; // Convert back to dollars
}