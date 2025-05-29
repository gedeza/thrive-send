import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuth } from '@clerk/nextjs/server';
import { nanoid } from 'nanoid';

// POST /api/templates/:id/duplicate - duplicate a template
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId, orgId } = getAuth(req);
    if (!userId || !orgId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const id = params.id;

    // Find the original template
    const originalTemplate = await prisma.template.findUnique({
      where: {
        id,
        organizationId: orgId,
      },
    });

    if (!originalTemplate) {
      return new NextResponse("Template not found", { status: 404 });
    }

    // Create a new template based on the original
    const duplicatedTemplate = await prisma.template.create({
      data: {
        id: nanoid(8),
        name: `${originalTemplate.name} (Copy)`,
        description: originalTemplate.description,
        category: originalTemplate.category,
        status: 'DRAFT', // Always set as draft
        content: originalTemplate.content,
        previewImage: originalTemplate.previewImage,
        lastUpdated: new Date(),
        organizationId: orgId,
        authorId: userId,
      },
    });

    // Fetch the template with author info in a separate query
    const templateWithAuthor = await prisma.template.findUnique({
      where: { id: duplicatedTemplate.id },
      include: {
        User: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    // Return with author info manually structured
    return NextResponse.json({
      ...duplicatedTemplate,
      author: templateWithAuthor?.User ? {
        name: templateWithAuthor.User.name,
        email: templateWithAuthor.User.email,
      } : null,
    });
  } catch (error) {
    console.error("Error duplicating template:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
} 