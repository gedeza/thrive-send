import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface CreateContentInput {
  title: string;
  content: string;
  contentType: string;
  mediaUrls?: string[];
  status?: string;
  scheduledFor?: Date;
  authorId: string;
  organizationId: string;
  projectId?: string;
  campaignId?: string;
}

export interface UpdateContentInput extends Partial<CreateContentInput> {
  id: string;
}

export class ContentService {
  // Create new content
  async createContent(data: CreateContentInput) {
    return prisma.contentPiece.create({
      data: {
        ...data,
        status: data.status || 'DRAFT',
      },
      include: {
        author: true,
        project: true,
        campaign: true,
      },
    });
  }

  // Get content by ID
  async getContentById(id: string) {
    return prisma.contentPiece.findUnique({
      where: { id },
      include: {
        author: true,
        project: true,
        campaign: true,
        engagements: true,
        socialPosts: true,
      },
    });
  }

  // Update content
  async updateContent(data: UpdateContentInput) {
    const { id, ...updateData } = data;
    return prisma.contentPiece.update({
      where: { id },
      data: updateData,
      include: {
        author: true,
        project: true,
        campaign: true,
      },
    });
  }

  // Delete content
  async deleteContent(id: string) {
    return prisma.contentPiece.delete({
      where: { id },
    });
  }

  // List content with filters
  async listContent({
    organizationId,
    status,
    authorId,
    projectId,
    campaignId,
    page = 1,
    limit = 10,
  }: {
    organizationId: string;
    status?: string;
    authorId?: string;
    projectId?: string;
    campaignId?: string;
    page?: number;
    limit?: number;
  }) {
    const skip = (page - 1) * limit;
    
    const where = {
      organizationId,
      ...(status && { status }),
      ...(authorId && { authorId }),
      ...(projectId && { projectId }),
      ...(campaignId && { campaignId }),
    };

    const [content, total] = await Promise.all([
      prisma.contentPiece.findMany({
        where,
        skip,
        take: limit,
        include: {
          author: true,
          project: true,
          campaign: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      prisma.contentPiece.count({ where }),
    ]);

    return {
      content,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  // Get content statistics
  async getContentStats(organizationId: string) {
    const [total, published, scheduled, draft] = await Promise.all([
      prisma.contentPiece.count({ where: { organizationId } }),
      prisma.contentPiece.count({ where: { organizationId, status: 'PUBLISHED' } }),
      prisma.contentPiece.count({ where: { organizationId, status: 'SCHEDULED' } }),
      prisma.contentPiece.count({ where: { organizationId, status: 'DRAFT' } }),
    ]);

    return {
      total,
      published,
      scheduled,
      draft,
    };
  }
} 