import { auth, clerkClient } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { profileFormSchema } from '@/lib/validations/profile'

export async function PATCH(req: Request) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return new NextResponse(
        JSON.stringify({ message: 'Please sign in to update your profile' }),
        { status: 401 }
      )
    }

    const body = await req.json()
    const validatedData = profileFormSchema.parse(body)
    const { name, bio, role, company, location, website, socialLinks } = validatedData

    // Validate URLs if provided
    if (website && !isValidUrl(website)) {
      return new NextResponse(
        JSON.stringify({ message: 'Please enter a valid website URL' }),
        { status: 400 }
      )
    }

    if (socialLinks?.linkedin && !isValidUrl(socialLinks.linkedin)) {
      return new NextResponse(
        JSON.stringify({ message: 'Please enter a valid LinkedIn URL' }),
        { status: 400 }
      )
    }

    // Split name into first and last name
    const nameParts = name.trim().split(/\s+/)
    const firstName = nameParts[0]
    const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : ''

    // Prepare metadata
    const metadata = {
      bio,
      role,
      company,
      location,
      website,
      socialLinks,
    }

    try {
      // Update user's name using Clerk SDK
      await clerkClient.users.updateUser(userId, {
        firstName,
        lastName,
      })

      // Update user's metadata using Clerk SDK
      await clerkClient.users.updateUserMetadata(userId, {
        publicMetadata: metadata,
      })

      return NextResponse.json({ success: true })
    } catch (clerkError: any) {
      console.error('Clerk update error:', clerkError)
      return new NextResponse(
        JSON.stringify({ message: 'Unable to update profile. Please try again.' }),
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('Profile update error:', error)
    if (error instanceof Error) {
      const errorMessage = error.message
        .replace(/^ZodError: /, '')
        .replace(/^Error: /, '')
        .replace(/^Validation error: /, '')
        
      return new NextResponse(
        JSON.stringify({ message: errorMessage }),
        { status: 400 }
      )
    }
    return new NextResponse(
      JSON.stringify({ message: 'Something went wrong. Please try again.' }),
      { status: 500 }
    )
  }
}

// Helper function to validate URLs
function isValidUrl(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}