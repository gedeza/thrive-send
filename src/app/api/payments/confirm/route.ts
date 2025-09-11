import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
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
    const { paymentIntentId, paymentMethodId } = body;

    if (!paymentIntentId || !paymentMethodId) {
      return NextResponse.json(
        { error: 'Missing paymentIntentId or paymentMethodId' },
        { status: 400 }
      );
    }

    // Confirm the payment intent
    const paymentIntent = await stripe.paymentIntents.confirm(paymentIntentId, {
      payment_method: paymentMethodId,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/marketplace/success`,
    });

    // Create transaction record in database (in production)
    // This would create a Transaction record for tracking
    
    const response = {
      id: paymentIntent.id,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      status: paymentIntent.status,
      paymentMethodId,
      metadata: paymentIntent.metadata,
      createdAt: new Date(paymentIntent.created * 1000).toISOString(),
      updatedAt: new Date().toISOString()
    };

    return NextResponse.json(response);

  } catch (_error) {
    console.error("", _error);
    
    if (_error instanceof Stripe.errors.StripeError) {
      return NextResponse.json(
        { 
          error: 'Payment confirmation failed',
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