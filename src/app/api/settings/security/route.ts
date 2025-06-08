import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs'
import { z } from 'zod'
import bcrypt from 'bcryptjs'

const securitySettingsSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
  enableTwoFactor: z.boolean(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
})

export async function PATCH(req: Request) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const body = await req.json()
    const validatedData = securitySettingsSchema.parse(body)

    // Update password via Clerk API
    const clerkResponse = await fetch(`https://api.clerk.dev/v1/users/${userId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.CLERK_SECRET_KEY}`,
      },
      body: JSON.stringify({
        password: validatedData.newPassword,
      }),
    })

    if (!clerkResponse.ok) {
      const error = await clerkResponse.json()
      return NextResponse.json(
        { error: 'Failed to update password', details: error },
        { status: 400 }
      )
    }

    // Handle two-factor authentication settings
    if (validatedData.enableTwoFactor) {
      // Enable 2FA via Clerk API
      // This would require additional Clerk API calls
    }

    return NextResponse.json({ success: true })
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