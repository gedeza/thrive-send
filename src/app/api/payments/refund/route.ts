import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_...', {
  apiVersion: '2023-10-16',
});

export async function POST(request: NextRequest) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      transactionId, // This is the payment intent ID
      amount,
      reason = 'requested_by_customer'
    } = body;

    if (!transactionId) {
      return NextResponse.json(
        { error: 'transactionId is required' },
        { status: 400 }
      );
    }

    // Retrieve the payment intent to validate and get charge ID
    const paymentIntent = await stripe.paymentIntents.retrieve(transactionId);
    
    if (!paymentIntent) {
      return NextResponse.json(
        { error: 'Payment intent not found' },
        { status: 404 }
      );
    }

    // Verify the payment was successful
    if (paymentIntent.status !== 'succeeded') {
      return NextResponse.json(
        { error: 'Cannot refund unsuccessful payment' },
        { status: 400 }
      );
    }

    // Get the charge ID (needed for refund)
    const charge = paymentIntent.charges?.data[0];
    if (!charge) {
      return NextResponse.json(
        { error: 'No charge found for this payment' },
        { status: 400 }
      );
    }

    // Create refund
    const refundData: any = {
      charge: charge.id,
      reason: reason
    };

    // If partial refund amount specified
    if (amount && amount < paymentIntent.amount / 100) {
      refundData.amount = Math.round(amount * 100); // Convert to cents
    }

    const refund = await stripe.refunds.create(refundData);

    // In production, update transaction record in database
    // This would mark the transaction as refunded and store refund details

    // Return updated transaction format
    const response = {
      id: paymentIntent.id,
      paymentIntentId: paymentIntent.id,
      productId: paymentIntent.metadata.productId || '',
      productName: paymentIntent.metadata.productName || 'Unknown Product',
      clientId: paymentIntent.metadata.clientId || '',
      organizationId: paymentIntent.metadata.organizationId,
      amount: paymentIntent.amount / 100,
      currency: paymentIntent.currency.toUpperCase(),
      status: 'refunded' as const,
      paymentMethod: {
        id: charge.payment_method || '',
        type: 'card' as const,
        provider: 'stripe',
        last4: charge.payment_method_details?.card?.last4,
        brand: charge.payment_method_details?.card?.brand,
        isDefault: false
      },
      processingFee: calculateProcessingFee(paymentIntent.amount, paymentIntent.currency),
      netAmount: (paymentIntent.amount / 100) - calculateProcessingFee(paymentIntent.amount, paymentIntent.currency),
      refund: {
        id: refund.id,
        amount: refund.amount / 100,
        reason: refund.reason,
        status: refund.status,
        createdAt: new Date(refund.created * 1000).toISOString()
      },
      metadata: paymentIntent.metadata,
      createdAt: new Date(paymentIntent.created * 1000).toISOString(),
      completedAt: new Date(charge.created * 1000).toISOString(),
      refundedAt: new Date(refund.created * 1000).toISOString()
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Refund processing error:', error);
    
    if (error instanceof Stripe.errors.StripeError) {
      return NextResponse.json(
        { 
          error: 'Refund processing failed',
          details: error.message 
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

// Helper function
function calculateProcessingFee(amountInCents: number, currency: string): number {
  const percentageFee = amountInCents * 0.029;
  const fixedFee = currency.toLowerCase() === 'usd' ? 30 : 0;
  
  return Math.round((percentageFee + fixedFee)) / 100;
}