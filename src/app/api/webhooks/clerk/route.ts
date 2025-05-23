import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { WebhookEvent } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  console.log('Received webhook request');
  
  // Get the headers
  const headerPayload = headers();
  const svix_id = headerPayload.get('svix-id');
  const svix_timestamp = headerPayload.get('svix-timestamp');
  const svix_signature = headerPayload.get('svix-signature');

  console.log('Webhook headers:', { svix_id, svix_timestamp, svix_signature });

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    console.error('Missing webhook headers');
    return new Response('Error occurred -- no svix headers', {
      status: 400,
    });
  }

  // Get the body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  console.log('Webhook payload:', payload);

  // Create a new Svix instance with your webhook secret
  const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET || '');

  let evt: WebhookEvent;

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent;
    console.log('Webhook verified successfully');
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return new Response('Error occurred', {
      status: 400,
    });
  }

  // Handle the webhook
  const eventType = evt.type;
  console.log('Processing webhook event:', eventType);

  if (eventType === 'user.created' || eventType === 'user.updated') {
    const { id, email_addresses, first_name, last_name, image_url } = evt.data;
    console.log('User data:', { id, email_addresses, first_name, last_name, image_url });

    // Get the primary email
    const primaryEmail = email_addresses?.[0]?.email_address;

    if (!primaryEmail) {
      console.error('No primary email found');
      return new Response('No primary email found', {
        status: 400,
      });
    }

    try {
      // Create or update the user in our database
      const user = await prisma.user.upsert({
        where: { clerkId: id },
        create: {
          clerkId: id,
          email: primaryEmail,
          firstName: first_name,
          lastName: last_name,
          imageUrl: image_url,
        },
        update: {
          email: primaryEmail,
          firstName: first_name,
          lastName: last_name,
          imageUrl: image_url,
        },
      });

      console.log('User synced successfully:', user);
      return new Response('User synced successfully', {
        status: 200,
      });
    } catch (error) {
      console.error('Error syncing user:', error);
      return new Response('Error syncing user', {
        status: 500,
      });
    }
  }

  if (eventType === 'user.deleted') {
    const { id } = evt.data;
    console.log('Deleting user:', id);

    try {
      // Delete the user from our database
      await prisma.user.delete({
        where: { clerkId: id },
      });

      console.log('User deleted successfully');
      return new Response('User deleted successfully', {
        status: 200,
      });
    } catch (error) {
      console.error('Error deleting user:', error);
      return new Response('Error deleting user', {
        status: 500,
      });
    }
  }

  console.log('Webhook processed successfully');
  return new Response('Webhook received', {
    status: 200,
  });
} 