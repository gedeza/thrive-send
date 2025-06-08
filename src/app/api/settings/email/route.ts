import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs'
import { db } from '@/lib/db'
import { z } from 'zod'

const emailSettingsSchema = z.object({
  marketingEmails: z.boolean(),
  productUpdates: z.boolean(),
  weeklyDigest: z.boolean(),
  campaignNotifications: z.boolean(),
  collaborationAlerts: z.boolean(),
})

export async function GET() {
  try {
    const { userId, orgId } = await auth()
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    // Get user's email preferences from organization settings or user settings
    const user = await db.user.findUnique({
      where: { clerkId: userId },
      select: { id: true },
    })

    if (!user) {
      return new NextResponse('User not found', { status: 404 })
    }

    // For now, return default settings - you can extend this to store in database
    const defaultSettings = {
      marketingEmails: true,
      productUpdates: true,
      weeklyDigest: false,
      campaignNotifications: true,
      collaborationAlerts: true,
    }

    return NextResponse.json(defaultSettings)
  } catch (error) {
    console.error('Error fetching email settings:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

export async function PATCH(req: Request) {
  try {
    const { userId, orgId } = await auth()
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const body = await req.json()
    const validatedData = emailSettingsSchema.parse(body)

    // Store email preferences in organization settings
    if (orgId) {
      await db.organization.update({
        where: { clerkOrganizationId: orgId },
        data: {
          settings: {
            emailPreferences: {
              [userId]: validatedData,
            },
          },
        },
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating email settings:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}