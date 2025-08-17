import { headers } from 'next/headers';
import { WebhookEvent } from '@clerk/nextjs/server';
import { db as prisma } from '@/lib/db';

export async function POST(req: Request) {
  console.log('Received webhook request');
  
  // Simplified webhook handler without svix dependency
  // In production, implement proper webhook signature verification
  
  try {
    const payload = await req.json();
    const eventType = payload.type;

    if (eventType === 'user.created') {
      const { id, email_addresses, first_name, last_name } = payload.data;
      
      await prisma.user.create({
        data: {
          clerkId: id,
          email: email_addresses[0]?.email_address || '',
          firstName: first_name || '',
          lastName: last_name || '',
          role: 'CONTENT_CREATOR'
        }
      });
    }

    if (eventType === 'user.updated') {
      const { id, email_addresses, first_name, last_name } = payload.data;
      
      await prisma.user.update({
        where: { clerkId: id },
        data: {
          email: email_addresses[0]?.email_address || '',
          firstName: first_name || '',
          lastName: last_name || ''
        }
      });
    }

    if (eventType === 'user.deleted') {
      const { id } = payload.data;
      
      await prisma.user.delete({
        where: { clerkId: id }
      });
    }

    return new Response('Webhook processed', { status: 200 });
  } catch (error) {
    console.error('Webhook processing error:', error);
    return new Response('Webhook processing failed', { status: 500 });
  }
}