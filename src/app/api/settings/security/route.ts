import { NextRequest, NextResponse } from 'next/server'
import { auth, clerkClient } from '@clerk/nextjs/server'
import { z } from 'zod'

const securitySettingsSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
  enableTwoFactor: z.boolean(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
})

// GET endpoint to retrieve security settings
export async function GET() {
  try {
    const { userId } = await auth()
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    // Get user's current security settings using Clerk SDK
    const user = await clerkClient.users.getUser(userId)
    
    return NextResponse.json({
      twoFactorEnabled: user.twoFactorEnabled || false,
      hasPassword: user.passwordEnabled || false,
      lastPasswordUpdate: user.updatedAt,
    })
  } catch (error) {
    console.error('Error fetching security settings:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

// PATCH endpoint for updating security settings
export async function PATCH(req: Request) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const body = await req.json()
    const validatedData = securitySettingsSchema.parse(body)

    // Update password using Clerk SDK (secure method)
    try {
      await clerkClient.users.updateUser(userId, {
        password: validatedData.newPassword,
      })
    } catch (clerkError: any) {
      console.error('Clerk password update error:', clerkError)
      return NextResponse.json(
        { 
          error: 'Failed to update password', 
          details: clerkError.message || 'Invalid password or user not found'
        },
        { status: 400 }
      )
    }

    return NextResponse.json({ 
      success: true,
      message: 'Security settings updated successfully'
    })
  } catch (error) {
    console.error('Error updating security settings:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}