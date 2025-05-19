import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { profileFormSchema } from '@/lib/validations/profile';

export async function PATCH(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse(
        JSON.stringify({ message: 'Please sign in to update your profile' }),
        { status: 401 }
      );
    }

    const body = await req.json();

    // Validate the request body
    try {
      const validatedData = profileFormSchema.parse(body);
      const { name, bio, role, company, location, website, socialLinks } = validatedData;

      // Validate URLs if provided
      if (website && !isValidUrl(website)) {
        return new NextResponse(
          JSON.stringify({ message: 'Please enter a valid website URL' }),
          { status: 400 }
        );
      }

      if (socialLinks?.linkedin && !isValidUrl(socialLinks.linkedin)) {
        return new NextResponse(
          JSON.stringify({ message: 'Please enter a valid LinkedIn URL' }),
          { status: 400 }
        );
      }

      // Split name into first and last name, handling cases where there might not be a last name
      const nameParts = name.trim().split(/\s+/);
      const firstName = nameParts[0];
      const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';

      // First, update the user's name
      const nameResponse = await fetch(`https://api.clerk.dev/v1/users/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.CLERK_SECRET_KEY}`,
        },
        body: JSON.stringify({
          firstName,
          lastName,
        }),
      });

      if (!nameResponse.ok) {
        const error = await nameResponse.json();
        console.error('Failed to update name:', error);
        return new NextResponse(
          JSON.stringify({ message: 'Unable to update your name. Please try again.' }),
          { status: nameResponse.status }
        );
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
        return new NextResponse(
          JSON.stringify({ message: 'Unable to update your profile information. Please try again.' }),
          { status: metadataResponse.status }
        );
      }

      return NextResponse.json({ success: true });
    } catch (validationError) {
      // Handle Zod validation errors
      if (validationError instanceof Error) {
        const errorMessage = validationError.message
          .replace(/^ZodError: /, '')
          .replace(/^Error: /, '')
          .replace(/^Validation error: /, '');
        
        return new NextResponse(
          JSON.stringify({ message: errorMessage }),
          { status: 400 }
        );
      }
      throw validationError;
    }
  } catch (error) {
    console.error('Profile update error:', error);
    return new NextResponse(
      JSON.stringify({ message: 'Something went wrong. Please try again.' }),
      { status: 500 }
    );
  }
}

// Helper function to validate URLs
function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
} 