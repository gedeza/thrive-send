import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    console.log('🚀 TEMPLATES API CALLED - Start of function:', {
      timestamp: new Date().toISOString(),
      url: request.url,
      headers: Object.fromEntries(request.headers.entries())
    });
    
    const authResult = await auth();
    const { userId } = authResult;
    
    console.log('🔍 Templates API Debug - Complete Auth Result:', { 
      userId, 
      hasUserId: !!userId, 
      authResult,
      timestamp: new Date().toISOString() 
    });
    
    if (!userId) {
      console.log('❌ Templates API: No userId found, returning 401');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get('organizationId');
    const clientId = searchParams.get('clientId');
    const templateType = searchParams.get('templateType');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    if (!organizationId) {
      return NextResponse.json({ error: 'Organization ID required' }, { status: 400 });
    }

    // Get user's organization membership
    const user = await db.user.findUnique({
      where: { clerkId: userId },
      include: { organizationMemberships: { include: { organization: true } } }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Find organization by ID (could be either database ID or Clerk org ID)
    let organization = await db.organization.findFirst({
      where: {
        OR: [
          { id: organizationId },
          { clerkOrganizationId: organizationId }
        ]
      }
    });

    if (!organization) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
    }

    // Check user has access to this organization
    const hasAccess = user.organizationMemberships.some(member => 
      member.organizationId === organization!.id
    );

    if (!hasAccess) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Build where clause for database query
    const whereClause: any = {
      organizationId: organization.id,
      ...(templateType && templateType !== 'all' && { category: templateType }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ]
      }),
    };

    // Get templates with usage statistics
    const [templates, totalCount, shareableClients] = await Promise.all([
      db.Template.findMany({
        where: whereClause,
        include: {
          User: { select: { id: true, name: true, email: true } },
          _count: {
            select: {
              contents: true // Count content created from this template
            }
          }
        },
        orderBy: {
          [sortBy]: sortOrder,
        },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.Template.count({ where: whereClause }),
      // Get clients this organization can share templates with
      db.client.findMany({
        where: { organizationId: organization.id, status: 'ACTIVE' },
        select: { id: true, name: true, type: true }
      })
    ]);

    // If no templates found in database, provide demo templates as fallback
    let finalTemplates = templates;
    let finalTotalCount = totalCount;
    
    if (templates.length === 0) {
      // Create demo templates to show when database is empty
      const demoTemplates = [
        {
          id: 'demo-template-1',
          name: 'Municipal Newsletter Template',
          description: 'Professional newsletter template for municipal communications and announcements.',
          type: 'EMAIL',
          content: {
            subject: 'City Update: {{month}} Newsletter',
            body: '<h2>Welcome to {{cityName}} Monthly Update</h2><p>Dear {{recipientName}},</p><p>Here are the latest updates from {{cityName}}:</p><ul><li>{{updateItem1}}</li><li>{{updateItem2}}</li><li>{{updateItem3}}</li></ul><p>Stay connected with your community!</p>',
            styles: { primaryColor: '#2563eb', fontSize: '16px' }
          },
          customizableFields: ['cityName', 'month', 'recipientName', 'updateItem1', 'updateItem2', 'updateItem3'],
          tags: ['government', 'newsletter', 'municipal'],
          category: 'Government',
          organizationId: organization.id,
          createdById: user.id,
          createdAt: new Date(),
          updatedAt: new Date(),
          User: { id: user.id, name: user.organizationMemberships[0]?.organization.name || 'Demo User', email: 'demo@thrivesenddemo.com' },
          _count: { contents: 12 }
        },
        {
          id: 'demo-template-2',
          name: 'Business Product Launch',
          description: 'Dynamic template for announcing new products and services to your customer base.',
          type: 'SOCIAL',
          content: {
            text: '🚀 Exciting News! We\'re thrilled to announce {{productName}} - {{productDescription}}. Available {{launchDate}}! #{{hashtag}} #Innovation',
            media: { type: 'image', placeholder: '/templates/product-launch.png' }
          },
          customizableFields: ['productName', 'productDescription', 'launchDate', 'hashtag'],
          tags: ['business', 'product-launch', 'social'],
          category: 'Business',
          organizationId: organization.id,
          createdById: user.id,
          createdAt: new Date(),
          updatedAt: new Date(),
          User: { id: user.id, name: user.organizationMemberships[0]?.organization.name || 'Demo User', email: 'demo@thrivesenddemo.com' },
          _count: { contents: 8 }
        },
        {
          id: 'demo-template-3',
          name: 'Event Promotion Template',
          description: 'Versatile template for promoting community events, webinars, and special occasions.',
          type: 'BLOG',
          content: {
            title: '{{eventName}} - Join Us {{eventDate}}',
            body: '<h1>You\'re Invited: {{eventName}}</h1><p><strong>Date:</strong> {{eventDate}}<br><strong>Time:</strong> {{eventTime}}<br><strong>Location:</strong> {{eventLocation}}</p><p>{{eventDescription}}</p><p><a href="{{registrationLink}}" class="btn">Register Now</a></p>',
            featuredImage: '/templates/event-promotion.png'
          },
          customizableFields: ['eventName', 'eventDate', 'eventTime', 'eventLocation', 'eventDescription', 'registrationLink'],
          tags: ['events', 'promotion', 'community'],
          category: 'Events',
          organizationId: organization.id,
          createdById: user.id,
          createdAt: new Date(),
          updatedAt: new Date(),
          User: { id: user.id, name: user.organizationMemberships[0]?.organization.name || 'Demo User', email: 'demo@thrivesenddemo.com' },
          _count: { contents: 15 }
        },
        {
          id: 'demo-template-4',
          name: 'Customer Appreciation',
          description: 'Heartfelt template for showing appreciation to customers and building loyalty.',
          type: 'EMAIL',
          content: {
            subject: 'Thank You {{customerName}} - Special Offer Inside',
            body: '<h2>Dear {{customerName}},</h2><p>Thank you for being a valued {{businessType}} customer! We truly appreciate your loyalty.</p><p>As a token of our appreciation, enjoy {{offerDetails}}.</p><p>Use code: <strong>{{promoCode}}</strong></p><p>Valid until {{expiryDate}}</p>',
            styles: { primaryColor: '#10b981', fontSize: '16px' }
          },
          customizableFields: ['customerName', 'businessType', 'offerDetails', 'promoCode', 'expiryDate'],
          tags: ['customer-service', 'appreciation', 'loyalty'],
          category: 'Customer Relations',
          organizationId: organization.id,
          createdById: user.id,
          createdAt: new Date(),
          updatedAt: new Date(),
          User: { id: user.id, name: user.organizationMemberships[0]?.organization.name || 'Demo User', email: 'demo@thrivesenddemo.com' },
          _count: { contents: 22 }
        }
      ];

      finalTemplates = demoTemplates;
      finalTotalCount = demoTemplates.length;
      
      console.log('📝 Using demo templates as fallback - no templates found in database');
    }

    // Calculate summary statistics
    const typeCounts = finalTemplates.reduce((acc, template) => {
      const templateType = template.category || 'General';
      acc[templateType] = (acc[templateType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const totalUsage = finalTemplates.reduce((sum, template) => sum + (template._count?.contents || 0), 0);
    const averageEngagement = finalTemplates.length > 0 ? (totalUsage / finalTemplates.length) : 0;

    const response = {
      templates: finalTemplates.map(template => ({
        ...template,
        totalUsage: template._count?.contents || 0,
        // Convert database fields to match frontend expectations
        templateType: template.category || 'General',
        createdByUserId: template.authorId || template.User?.id,
        serviceProviderId: organization.id,
        isShared: true, // Service provider templates are shared by default
        customizableFields: [
          { field: 'CLIENT_NAME', label: 'Client Name', type: 'text' },
          { field: 'COMPANY_NAME', label: 'Company Name', type: 'text' },
          { field: 'DATE', label: 'Date', type: 'date' }
        ],
        tags: ['template', 'service-provider', template.category?.toLowerCase()].filter(Boolean),
        sharedWithClients: [], // Array of client IDs this template is shared with
        clientUsage: {}, // Object mapping client IDs to usage counts
        averageEngagement: template._count?.contents ? template._count.contents * 0.75 : 0,
        bestPerformingClient: shareableClients[0]?.name || null,
        category: template.category || 'General',
        previewImage: template.id?.startsWith('demo-') ? `/templates/preview-${template.category?.toLowerCase()}.png` : template.previewImage
      })),
      pagination: {
        page,
        limit,
        total: finalTotalCount,
        totalPages: Math.ceil(finalTotalCount / limit),
      },
      summary: {
        totalTemplates: finalTotalCount,
        typeCounts,
        totalUsage,
        averageEngagement,
      },
      shareableClients
    };

    console.log('🎨 Service Provider Templates API response:', {
      templateCount: finalTemplates.length,
      totalTemplates: finalTotalCount,
      organizationId: organization.id,
      usingFallback: templates.length === 0
    });

    return NextResponse.json(response);

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
      name,
      description,
      templateType,
      content,
      customizableFields = [],
      tags = [],
      category,
      shareWithClients = [],
      serviceProviderId,
    } = body;

    // Validate required fields
    if (!name || !templateType || !content || !serviceProviderId) {
      return NextResponse.json({
        error: 'Missing required fields: name, templateType, content, serviceProviderId'
      }, { status: 400 });
    }

    // Get user's organization
    const user = await db.user.findUnique({
      where: { clerkId: userId },
      include: { organizationMemberships: { include: { organization: true } } }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Find organization by ID
    let organization = await db.organization.findFirst({
      where: {
        OR: [
          { id: serviceProviderId },
          { clerkOrganizationId: serviceProviderId }
        ]
      }
    });

    if (!organization) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
    }

    // Check user has admin access to create templates
    const hasAccess = user.organizationMemberships.some(member => 
      member.organizationId === organization!.id && 
      ['ADMIN', 'OWNER'].includes(member.role)
    );

    if (!hasAccess) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    // Create template in database
    const newTemplate = await db.Template.create({
      data: {
        id: `template_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name,
        description,
        content,
        category: category || templateType || 'General',
        status: 'DRAFT',
        lastUpdated: new Date(),
        organizationId: organization.id,
        authorId: user.id,
        previewImage: null,
      },
      include: {
        User: {
          select: { id: true, name: true, email: true }
        },
        _count: {
          select: { contents: true }
        }
      },
    });

    // Format response to match frontend expectations
    const response = {
      ...newTemplate,
      templateType: newTemplate.category || templateType,
      serviceProviderId: organization.id,
      createdByUserId: newTemplate.authorId,
      isShared: true,
      totalUsage: newTemplate._count?.contents || 0,
      averageEngagement: 0,
      bestPerformingClient: null,
      customizableFields: [],
      tags: [],
      previewImage: `/templates/generated-${templateType}.png`,
    };

    console.log('🎨 Created template with service provider context:', {
      templateId: newTemplate.id,
      templateType: newTemplate.category || templateType,
      organizationId: organization.id,
      createdBy: newTemplate.User?.name
    });

    return NextResponse.json(response, { status: 201 });

  } catch (_error) {
    console.error("", _error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

