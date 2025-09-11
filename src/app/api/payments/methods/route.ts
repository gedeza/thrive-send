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

    if (!organizationId) {
      return NextResponse.json(
        { error: 'organizationId is required' },
        { status: 400 }
      );
    }

    // In production, retrieve customer ID from database based on organizationId
    const customerId = `cus_${organizationId}`;

    try {
      // Retrieve customer's payment methods from Stripe
      const paymentMethods = await stripe.paymentMethods.list({
        customer: customerId,
        type: 'card',
      });

      const formattedMethods = paymentMethods.data.map(method => ({
        id: method.id,
        type: 'card' as const,
        provider: 'stripe',
        last4: method.card?.last4,
        brand: method.card?.brand,
        expiryMonth: method.card?.exp_month,
        expiryYear: method.card?.exp_year,
        isDefault: method.id === paymentMethods.data[0]?.id // First one is default
      }));

      return NextResponse.json(formattedMethods);

    } catch (stripeError: any) {
      if (stripeError.code === 'resource_missing') {
        // Customer doesn't exist yet, return empty array
        return NextResponse.json([]);
      }
      throw stripeError;
    }

  } catch (_error) {
    console.error("", _error);
    
    if (_error instanceof Stripe.errors.StripeError) {
      return NextResponse.json(
        { 
          error: 'Failed to fetch payment methods',
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
      organizationId,
      paymentMethodId,
      setAsDefault = false
    } = body;

    if (!organizationId || !paymentMethodId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // In production, retrieve or create customer ID from database
    let customerId = `cus_${organizationId}`;

    try {
      // Try to retrieve existing customer
      await stripe.customers.retrieve(customerId);
    } catch (error: any) {
      if (error.code === 'resource_missing') {
        // Create new customer
        const customer = await stripe.customers.create({
          id: customerId,
          metadata: {
            organizationId,
            userId,
            createdBy: 'marketplace'
          }
        });
        customerId = customer.id;
      } else {
        throw _error;
      }
    }

    // Attach payment method to customer
    await stripe.paymentMethods.attach(paymentMethodId, {
      customer: customerId,
    });

    // Set as default if requested
    if (setAsDefault) {
      await stripe.customers.update(customerId, {
        invoice_settings: {
          default_payment_method: paymentMethodId,
        },
      });
    }

    // Retrieve the attached payment method details
    const paymentMethod = await stripe.paymentMethods.retrieve(paymentMethodId);

    const response = {
      id: paymentMethod.id,
      type: 'card' as const,
      provider: 'stripe',
      last4: paymentMethod.card?.last4,
      brand: paymentMethod.card?.brand,
      expiryMonth: paymentMethod.card?.exp_month,
      expiryYear: paymentMethod.card?.exp_year,
      isDefault: setAsDefault
    };

    return NextResponse.json(response, { status: 201 });

  } catch (_error) {
    console.error("", _error);
    
    if (_error instanceof Stripe.errors.StripeError) {
      return NextResponse.json(
        { 
          error: 'Failed to add payment method',
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

export async function DELETE(request: NextRequest) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const paymentMethodId = searchParams.get('paymentMethodId');

    if (!paymentMethodId) {
      return NextResponse.json(
        { error: 'paymentMethodId is required' },
        { status: 400 }
      );
    }

    // Detach payment method from customer
    await stripe.paymentMethods.detach(paymentMethodId);

    return NextResponse.json({ success: true });

  } catch (_error) {
    console.error("", _error);
    
    if (_error instanceof Stripe.errors.StripeError) {
      return NextResponse.json(
        { 
          error: 'Failed to remove payment method',
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