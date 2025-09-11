import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db } from '@/lib/db'
import { z } from 'zod'

const contentLibrarySchema = z.object({
  autoTagging: z.boolean(),
  contentApprovalRequired: z.boolean(),
  defaultContentType: z.string(),
  maxFileSize: z.number().min(1).max(100),
  allowedFileTypes: z.array(z.string()),
  enableVersionControl: z.boolean(),
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

    const contentLibrarySettings = (organization?.settings as any)?.contentLibrary || {
      autoTagging: true,
      contentApprovalRequired: false,
      defaultContentType: 'article',
      maxFileSize: 10,
      allowedFileTypes: ['jpg', 'png', 'pdf', 'docx'],
      enableVersionControl: true,
    }

    return NextResponse.json(contentLibrarySettings)
  } catch (_error) {
    console.error('Error fetching content library settings:', error)
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
    const validatedData = contentLibrarySchema.parse(body)

    // Get current settings
    const organization = await db.organization.findUnique({
      where: { clerkOrganizationId: orgId },
      select: { settings: true },
    })

    const currentSettings = (organization?.settings as any) || {}

    // Update content library settings
    await db.organization.update({
      where: { clerkOrganizationId: orgId },
      data: {
        settings: {
          ...currentSettings,
          contentLibrary: validatedData,
        },
      },
    })

    return NextResponse.json({ success: true })
  } catch (_error) {
    console.error('Error updating content library settings:', error)
    if (_error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}