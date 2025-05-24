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

  // Handle organization events
  if (eventType === 'organization.created') {
    const { id, name, slug, image_url } = evt.data;
    console.log('Creating organization:', { id, name, slug, image_url });

    try {
      // Create the organization in our database
      const organization = await prisma.organization.create({
        data: {
          id,
          name,
          slug: slug || name.toLowerCase().replace(/\s+/g, '-'),
          logoUrl: image_url,
        },
      });

      console.log('Organization created successfully:', organization);
      return new Response('Organization created successfully', {
        status: 200,
      });
    } catch (error) {
      console.error('Error creating organization:', error);
      return new Response('Error creating organization', {
        status: 500,
      });
    }
  }

  if (eventType === 'organizationMembership.created') {
    const { organization, public_user_data } = evt.data;
    console.log('Creating organization membership:', { organization, public_user_data });

    try {
      // Create the organization membership in our database
      const membership = await prisma.organizationMember.create({
        data: {
          organizationId: organization.id,
          userId: public_user_data.user_id,
          role: 'MEMBER', // Default role
        },
      });

      console.log('Organization membership created successfully:', membership);
      return new Response('Organization membership created successfully', {
        status: 200,
      });
    } catch (error) {
      console.error('Error creating organization membership:', error);
      return new Response('Error creating organization membership', {
        status: 500,
      });
    }
  }

  if (eventType === 'organizationMembership.deleted') {
    const { organization, public_user_data } = evt.data;
    console.log('Deleting organization membership:', { organization, public_user_data });

    try {
      // Delete the organization membership from our database
      await prisma.organizationMember.deleteMany({
        where: {
          organizationId: organization.id,
          userId: public_user_data.user_id,
        },
      });

      console.log('Organization membership deleted successfully');
      return new Response('Organization membership deleted successfully', {
        status: 200,
      });
    } catch (error) {
      console.error('Error deleting organization membership:', error);
      return new Response('Error deleting organization membership', {
        status: 500,
      });
    }
  }

  console.log('Webhook processed successfully');
  return new Response('Webhook received', {
    status: 200,
  });
} 