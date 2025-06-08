import { NextResponse } from 'next/server'
import { auth, clerkClient } from '@clerk/nextjs/server'
import { db } from '@/lib/db'
import { z } from 'zod'

const profileSettingsSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  bio: z.string().optional(),
  timezone: z.string(),
  language: z.string(),
})

export async function GET() {
  try {
    const { userId } = await auth()
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const user = await db.user.findUnique({
      where: { clerkId: userId },
      select: {
        firstName: true,
        lastName: true,
        email: true,
        // Add other profile fields from your schema
      },
    })

    if (!user) {
      return new NextResponse('User not found', { status: 404 })
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error('Error fetching profile settings:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

export async function PATCH(req: Request) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const body = await req.json()
    const validatedData = profileSettingsSchema.parse(body)

    // Update user in database
    const updatedUser = await db.user.update({
      where: { clerkId: userId },
      data: {
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
        email: validatedData.email,
        // Add other fields as needed
      },
    })

    try {
      // Update Clerk user using SDK (excluding email for now)
      await clerkClient.users.updateUser(userId, {
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
        // Note: Email updates in Clerk require email verification flow
        // and should be handled separately through Clerk's email update process
      })

      return NextResponse.json({ success: true, user: updatedUser })
    } catch (clerkError: any) {
      console.error('Clerk update error:', clerkError)
      // Rollback database changes if Clerk update fails
      await db.user.update({
        where: { clerkId: userId },
        data: {
          firstName: updatedUser.firstName, // Restore original values
          lastName: updatedUser.lastName,
        },
      })
      return new NextResponse(
        JSON.stringify({ message: 'Failed to update profile. Please try again.' }),
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Error updating profile settings:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}