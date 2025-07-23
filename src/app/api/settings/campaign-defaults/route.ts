import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db } from '@/lib/db'
import { z } from 'zod'

const campaignDefaultsSchema = z.object({
  defaultTimezone: z.string(),
  defaultSendTime: z.string(),
  defaultFromName: z.string().min(1, 'From name is required'),
  defaultFromEmail: z.string().email('Invalid email address'),
  autoSaveInterval: z.number().min(1).max(60),
  enableAutoScheduling: z.boolean(),
})

export async function GET() {
  try {
    const { userId, orgId } = await auth()
    if (!userId || !orgId) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const organization = await db.organization.findUnique({
      where: { clerkOrganizationId: orgId },
      select: { settings: true },
    })

    const campaignDefaults = (organization?.settings as any)?.campaignDefaults || {
      defaultTimezone: 'UTC',
      defaultSendTime: '09:00',
      defaultFromName: '',
      defaultFromEmail: '',
      autoSaveInterval: 5,
      enableAutoScheduling: false,
    }

    return NextResponse.json(campaignDefaults)
  } catch (error) {
    console.error('Error fetching campaign defaults:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

export async function PATCH(req: Request) {
  try {
    const { userId, orgId } = await auth()
    if (!userId || !orgId) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const body = await req.json()
    const validatedData = campaignDefaultsSchema.parse(body)

    // Get current settings
    const organization = await db.organization.findUnique({
      where: { clerkOrganizationId: orgId },
      select: { settings: true },
    })

    const currentSettings = (organization?.settings as any) || {}

    // Update campaign defaults
    await db.organization.update({
      where: { clerkOrganizationId: orgId },
      data: {
        settings: {
          ...currentSettings,
          campaignDefaults: validatedData,
        },
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating campaign defaults:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}