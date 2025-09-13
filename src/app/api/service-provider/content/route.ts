import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get('organizationId');
    const clientId = searchParams.get('clientId');
    const status = searchParams.get('status');
    const contentType = searchParams.get('contentType');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    if (!organizationId) {
      return NextResponse.json({ error: 'Organization ID required' }, { status: 400 });
    }

    // For demo purposes, return demo content with client context
    const demoContent = [
      {
        id: 'content-1',
        title: 'Springfield Summer Festival Campaign',
        content: 'Join us for the annual Springfield Summer Festival! 🎪',
        contentType: 'social',
        status: 'published',
        tags: ['festival', 'community', 'summer'],
        excerpt: 'Annual community festival celebration',
        scheduledAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString(),
        // 🎯 SERVICE PROVIDER FIELDS
        clientId: 'demo-client-1',
        clientName: 'City of Springfield',
        serviceProviderId: organizationId,
        createdByUserId: 'demo-user',
        // Performance metrics
        views: 2547,
        likes: 189,
        shares: 45,
        comments: 23,
        engagementRate: 7.4,
        performanceScore: 92,
      },
      {
        id: 'content-2', 
        title: 'TechStart Product Launch Blog',
        content: 'Introducing our revolutionary new product that will change everything!',
        contentType: 'blog',
        status: 'draft',
        tags: ['product', 'launch', 'technology'],
        excerpt: 'Revolutionary product announcement',
        scheduledAt: null,
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString(),
        // 🎯 SERVICE PROVIDER FIELDS
        clientId: 'demo-client-2',
        clientName: 'TechStart Inc.',
        serviceProviderId: organizationId,
        createdByUserId: 'demo-user',
        // Performance metrics
        views: 0,
        likes: 0,
        shares: 0,
        comments: 0,
        engagementRate: 0,
        performanceScore: 0,
      },
      {
        id: 'content-3',
        title: 'Coffee Shop Newsletter - Weekly Brew',
        content: 'This week\'s featured coffee beans and brewing tips! ☕',
        contentType: 'email',
        status: 'scheduled',
        tags: ['newsletter', 'coffee', 'weekly'],
        excerpt: 'Weekly coffee newsletter with brewing tips',
        scheduledAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString(),
        // 🎯 SERVICE PROVIDER FIELDS
        clientId: 'demo-client-3',
        clientName: 'Local Coffee Co.',
        serviceProviderId: organizationId,
        createdByUserId: 'demo-user',
        // Performance metrics
        views: 834,
        likes: 67,
        shares: 12,
        comments: 8,
        engagementRate: 10.4,
        performanceScore: 76,
      },
    ];

    // Apply client filtering if specified
    let filteredContent = demoContent;
    if (clientId) {
      filteredContent = demoContent.filter(content => content.clientId === clientId);
    }

    // Apply status filtering
    if (status && status !== 'all') {
      filteredContent = filteredContent.filter(content => content.status === status);
    }

    // Apply content type filtering
    if (contentType && contentType !== 'all') {
      filteredContent = filteredContent.filter(content => content.contentType === contentType);
    }

    // Apply search filtering
    if (search) {
      const searchLower = search.toLowerCase();
      filteredContent = filteredContent.filter(content => 
        content.title.toLowerCase().includes(searchLower) ||
        content.content.toLowerCase().includes(searchLower) ||
        content.tags.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }

    // Apply sorting
    filteredContent.sort((a, b) => {
      const aValue = a[sortBy as keyof typeof a];
      const bValue = b[sortBy as keyof typeof b];
      
      if (sortOrder === 'desc') {
        return bValue > aValue ? 1 : -1;
      } else {
        return aValue > bValue ? 1 : -1;
      }
    });

    // Apply pagination
    const startIndex = (page - 1) * limit;
    const paginatedContent = filteredContent.slice(startIndex, startIndex + limit);

    // Calculate summary statistics
    const totalContent = filteredContent.length;
    const statusCounts = filteredContent.reduce((acc, content) => {
      acc[content.status] = (acc[content.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const response = {
      content: paginatedContent,
      pagination: {
        page,
        limit,
        total: totalContent,
        totalPages: Math.ceil(totalContent / limit),
      },
      summary: {
        totalContent,
        statusCounts,
        clientCounts: clientId ? { [clientId]: totalContent } : {
          'demo-client-1': demoContent.filter(c => c.clientId === 'demo-client-1').length,
          'demo-client-2': demoContent.filter(c => c.clientId === 'demo-client-2').length,
          'demo-client-3': demoContent.filter(c => c.clientId === 'demo-client-3').length,
        },
      },
    };

    return NextResponse.json(response);

    // TODO: Replace with actual database query when schema is ready
    /*
    const whereClause = {
      serviceProviderId: organizationId,
      ...(clientId && { clientId }),
      ...(status && status !== 'all' && { status }),
      ...(contentType && contentType !== 'all' && { contentType }),
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { content: { contains: search, mode: 'insensitive' } },
          { tags: { hasSome: [search] } },
        ]
      }),
    };

    const [content, totalCount] = await Promise.all([
      db.content.findMany({
        where: whereClause,
        include: {
          client: {
            select: { id: true, name: true, type: true }
          },
          analytics: true,
        },
        orderBy: {
          [sortBy]: sortOrder,
        },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.content.count({ where: whereClause }),
    ]);

    return NextResponse.json({
      content,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
    */

  } catch (_error) {
    console.error("", _error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      title,
      content,
      contentType,
      status = 'draft',
      tags = [],
      excerpt,
      scheduledAt,
      clientId,
      serviceProviderId,
      createdByUserId,
      clientName,
    } = body;

    // Validate required fields
    if (!title || !content || !clientId || !serviceProviderId) {
      return NextResponse.json({
        error: 'Missing required fields: title, content, clientId, serviceProviderId'
      }, { status: 400 });
    }

    // For demo purposes, return success with generated ID
    const newContent = {
      id: `content-${Date.now()}`,
      title,
      content,
      contentType: contentType || 'blog',
      status,
      tags,
      excerpt: excerpt || content.substring(0, 150) + '...',
      scheduledAt,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      // 🎯 SERVICE PROVIDER FIELDS
      clientId,
      clientName,
      serviceProviderId,
      createdByUserId: createdByUserId || userId,
      // Initial performance metrics
      views: 0,
      likes: 0,
      shares: 0,
      comments: 0,
      engagementRate: 0,
      performanceScore: 0,
    };

    console.log('🚀 Created content with service provider context:', {
      contentId: newContent.id,
      clientId: newContent.clientId,
      clientName: newContent.clientName,
      serviceProviderId: newContent.serviceProviderId,
    });

    return NextResponse.json(newContent, { status: 201 });

    // TODO: Replace with actual database creation when schema is ready
    /*
    const newContent = await db.content.create({
      data: {
        title,
        content,
        contentType,
        status,
        tags,
        excerpt,
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
        clientId,
        serviceProviderId,
        createdByUserId,
      },
      include: {
        client: {
          select: { id: true, name: true, type: true }
        },
      },
    });

    return NextResponse.json(newContent, { status: 201 });
    */

  } catch (_error) {
    console.error("", _error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}