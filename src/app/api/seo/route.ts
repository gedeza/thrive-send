import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await getAuth(request);
    if (!userId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get('organizationId');
    const clientId = searchParams.get('clientId');
    const contentType = searchParams.get('type');

    // For now, return mock data while we fix database integration
    // This ensures the SEO page works immediately
    const mockSEOContent = [
      {
        id: 'seo-content-1',
        title: 'Complete Guide to Content Marketing Strategy',
        type: 'BLOG_POST',
        status: 'DRAFT',
        excerpt: 'Learn how to create a comprehensive content marketing strategy that drives engagement and conversions for your business.',
        content: 'Content marketing is a strategic approach focused on creating and distributing valuable, relevant, and consistent content to attract and retain a clearly defined audience — and, ultimately, to drive profitable customer action. In this comprehensive guide, we\'ll explore the key elements of a successful content marketing strategy and provide actionable insights to help you get started.',
        slug: 'complete-guide-content-marketing-strategy',
        createdAt: '2024-01-15T10:30:00Z',
        updatedAt: '2024-01-20T14:45:00Z',
        seoScore: 85,
        lastOptimized: '2024-01-20T14:45:00Z',
        wordCount: 387,
        focusKeyword: 'content marketing strategy',
        createdBy: {
          id: 'user-1',
          firstName: 'John',
          lastName: 'Doe'
        },
        analytics: {
          views: 1250,
          likes: 34,
          shares: 12,
          comments: 8
        }
      },
      {
        id: 'seo-content-2',
        title: 'Email Marketing Best Practices',
        type: 'BLOG_POST',
        status: 'PUBLISHED',
        excerpt: 'Discover proven email marketing strategies that boost open rates and drive conversions.',
        content: 'Email marketing remains one of the most effective digital marketing channels. With proper strategy and execution, it can deliver an impressive ROI.',
        slug: 'email-marketing-best-practices',
        createdAt: '2024-01-10T09:15:00Z',
        updatedAt: '2024-01-18T16:30:00Z',
        seoScore: 72,
        lastOptimized: '2024-01-18T16:30:00Z',
        wordCount: 156,
        focusKeyword: 'email marketing',
        createdBy: {
          id: 'user-2',
          firstName: 'Jane',
          lastName: 'Smith'
        },
        analytics: {
          views: 890,
          likes: 21,
          shares: 7,
          comments: 4
        }
      },
      {
        id: 'seo-content-3',
        title: 'How to Increase Website Traffic',
        type: 'BLOG_POST',
        status: 'DRAFT',
        excerpt: null,
        content: 'Website traffic is crucial for online success.',
        slug: 'increase-website-traffic',
        createdAt: '2024-01-05T11:20:00Z',
        updatedAt: '2024-01-05T11:20:00Z',
        seoScore: 30,
        lastOptimized: '2024-01-05T11:20:00Z',
        wordCount: 67,
        createdBy: {
          id: 'user-1',
          firstName: 'John',
          lastName: 'Doe'
        },
        analytics: {
          views: 45,
          likes: 2,
          shares: 0,
          comments: 1
        }
      }
    ];

    return NextResponse.json(mockSEOContent);
  } catch (_error) {
    console.error("", _error);
    return NextResponse.json(
      { 
        message: 'Internal server error', 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { userId } = await getAuth(request);
    if (!userId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { 
      contentId, 
      title,
      excerpt, 
      slug,
      content
    } = body;

    if (!contentId) {
      return NextResponse.json(
        { message: 'Content ID is required' },
        { status: 400 }
      );
    }

    // Update content with basic SEO-related data
    const updatedContent = await db.content.update({
      where: { id: contentId },
      data: {
        ...(title && { title }),
        ...(excerpt && { excerpt }),
        ...(slug && { slug }),
        ...(content && { content }),
        updatedAt: new Date(),
      },
      select: {
        id: true,
        title: true,
        excerpt: true,
        slug: true,
        content: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(updatedContent);
  } catch (_error) {
    console.error("", _error);
    return NextResponse.json(
      { 
        message: 'Internal server error', 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}