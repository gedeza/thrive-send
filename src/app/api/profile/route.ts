import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

export async function PATCH(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      console.log('No userId found in auth');
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await req.json();
    console.log('Received profile update request:', { userId, body });

    const { name, bio, role, company, location, website, socialLinks } = body;

    // First, update the user's name
    console.log('Updating user name:', { firstName: name.split(' ')[0], lastName: name.split(' ').slice(1).join(' ') });
    const nameResponse = await fetch(`https://api.clerk.dev/v1/users/${userId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.CLERK_SECRET_KEY}`,
      },
      body: JSON.stringify({
        firstName: name.split(' ')[0],
        lastName: name.split(' ').slice(1).join(' '),
      }),
    });

    if (!nameResponse.ok) {
      const error = await nameResponse.json();
      console.error('Failed to update name:', error);
      return new NextResponse('Failed to update name', { status: nameResponse.status });
    }

    // Then, update the user's metadata
    const metadata = {
      bio,
      role,
      company,
      location,
      website,
      socialLinks,
    };
    console.log('Updating user metadata:', metadata);

    const metadataResponse = await fetch(`https://api.clerk.dev/v1/users/${userId}/metadata`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.CLERK_SECRET_KEY}`,
      },
      body: JSON.stringify({
        publicMetadata: metadata,
      }),
    });

    if (!metadataResponse.ok) {
      const error = await metadataResponse.json();
      console.error('Failed to update metadata:', error);
      return new NextResponse('Failed to update profile metadata', { status: metadataResponse.status });
    }

    console.log('Profile update successful');
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Profile update error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 