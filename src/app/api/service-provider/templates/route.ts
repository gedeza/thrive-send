import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
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

    // 🚀 SERVICE PROVIDER TEMPLATE DATA - Demo Implementation
    const demoTemplates = [
      {
        id: 'template-1',
        name: 'Municipal Newsletter Template',
        description: 'Professional newsletter template for government communications',
        templateType: 'email',
        content: '<h1>{{CLIENT_NAME}} Newsletter</h1><p>Welcome to this month\'s update from {{CLIENT_NAME}}...</p>',
        previewImage: '/templates/municipal-newsletter.png',
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString(),
        
        // 🎯 SERVICE PROVIDER FIELDS
        serviceProviderId: organizationId,
        createdByUserId: userId,
        isShared: true,
        
        // 📊 SHARING METRICS
        sharedWithClients: ['demo-client-1', 'demo-client-3'],
        totalUsage: 15,
        clientUsage: {
          'demo-client-1': 8,
          'demo-client-3': 7
        },
        
        // 🎨 CUSTOMIZATION OPTIONS
        customizableFields: [
          { field: 'CLIENT_NAME', label: 'Client Name', type: 'text' },
          { field: 'BRAND_COLOR', label: 'Brand Color', type: 'color' },
          { field: 'LOGO_URL', label: 'Logo URL', type: 'url' }
        ],
        
        // 📈 PERFORMANCE TRACKING
        averageEngagement: 8.4,
        bestPerformingClient: 'demo-client-1',
        tags: ['newsletter', 'government', 'professional'],
        category: 'Communications'
      },
      {
        id: 'template-2',
        name: 'Social Media Campaign Template',
        description: 'Engaging social media post template with multiple format options',
        templateType: 'social',
        content: '🎯 {{CAMPAIGN_MESSAGE}}\n\n✨ Key Benefits:\n• {{BENEFIT_1}}\n• {{BENEFIT_2}}\n• {{BENEFIT_3}}\n\n👉 {{CALL_TO_ACTION}}\n\n#{{CLIENT_HASHTAG}} #{{INDUSTRY_TAG}}',
        previewImage: '/templates/social-campaign.png',
        createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        
        // 🎯 SERVICE PROVIDER FIELDS
        serviceProviderId: organizationId,
        createdByUserId: userId,
        isShared: true,
        
        // 📊 SHARING METRICS
        sharedWithClients: ['demo-client-2', 'demo-client-3'],
        totalUsage: 23,
        clientUsage: {
          'demo-client-2': 12,
          'demo-client-3': 11
        },
        
        // 🎨 CUSTOMIZATION OPTIONS
        customizableFields: [
          { field: 'CAMPAIGN_MESSAGE', label: 'Campaign Message', type: 'textarea' },
          { field: 'BENEFIT_1', label: 'Benefit 1', type: 'text' },
          { field: 'BENEFIT_2', label: 'Benefit 2', type: 'text' },
          { field: 'BENEFIT_3', label: 'Benefit 3', type: 'text' },
          { field: 'CALL_TO_ACTION', label: 'Call to Action', type: 'text' },
          { field: 'CLIENT_HASHTAG', label: 'Client Hashtag', type: 'text' },
          { field: 'INDUSTRY_TAG', label: 'Industry Tag', type: 'text' }
        ],
        
        // 📈 PERFORMANCE TRACKING
        averageEngagement: 12.7,
        bestPerformingClient: 'demo-client-2',
        tags: ['social', 'campaign', 'engagement'],
        category: 'Marketing'
      },
      {
        id: 'template-3',
        name: 'Event Announcement Blog',
        description: 'Professional blog template for event announcements and updates',
        templateType: 'blog',
        content: `
        <article>
          <header>
            <h1>{{EVENT_TITLE}}</h1>
            <p class="lead">{{EVENT_SUBTITLE}}</p>
          </header>
          
          <section>
            <h2>Event Details</h2>
            <ul>
              <li><strong>Date:</strong> {{EVENT_DATE}}</li>
              <li><strong>Time:</strong> {{EVENT_TIME}}</li>
              <li><strong>Location:</strong> {{EVENT_LOCATION}}</li>
              <li><strong>Registration:</strong> {{REGISTRATION_LINK}}</li>
            </ul>
          </section>
          
          <section>
            <h2>What to Expect</h2>
            <p>{{EVENT_DESCRIPTION}}</p>
          </section>
          
          <footer>
            <p>Contact {{CLIENT_NAME}} for more information.</p>
          </footer>
        </article>
        `,
        previewImage: '/templates/event-blog.png',
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        
        // 🎯 SERVICE PROVIDER FIELDS
        serviceProviderId: organizationId,
        createdByUserId: userId,
        isShared: true,
        
        // 📊 SHARING METRICS
        sharedWithClients: ['demo-client-1'],
        totalUsage: 6,
        clientUsage: {
          'demo-client-1': 6
        },
        
        // 🎨 CUSTOMIZATION OPTIONS
        customizableFields: [
          { field: 'EVENT_TITLE', label: 'Event Title', type: 'text' },
          { field: 'EVENT_SUBTITLE', label: 'Event Subtitle', type: 'text' },
          { field: 'EVENT_DATE', label: 'Event Date', type: 'date' },
          { field: 'EVENT_TIME', label: 'Event Time', type: 'time' },
          { field: 'EVENT_LOCATION', label: 'Event Location', type: 'text' },
          { field: 'REGISTRATION_LINK', label: 'Registration Link', type: 'url' },
          { field: 'EVENT_DESCRIPTION', label: 'Event Description', type: 'textarea' },
          { field: 'CLIENT_NAME', label: 'Client Name', type: 'text' }
        ],
        
        // 📈 PERFORMANCE TRACKING
        averageEngagement: 6.8,
        bestPerformingClient: 'demo-client-1',
        tags: ['blog', 'event', 'announcement'],
        category: 'Events'
      }
    ];

    // Apply client filtering if specified
    let filteredTemplates = demoTemplates;
    if (clientId) {
      filteredTemplates = demoTemplates.filter(template => 
        template.sharedWithClients.includes(clientId)
      );
    }

    // Apply template type filtering
    if (templateType && templateType !== 'all') {
      filteredTemplates = filteredTemplates.filter(template => 
        template.templateType === templateType
      );
    }

    // Apply search filtering
    if (search) {
      const searchLower = search.toLowerCase();
      filteredTemplates = filteredTemplates.filter(template => 
        template.name.toLowerCase().includes(searchLower) ||
        template.description.toLowerCase().includes(searchLower) ||
        template.tags.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }

    // Apply sorting
    filteredTemplates.sort((a, b) => {
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
    const paginatedTemplates = filteredTemplates.slice(startIndex, startIndex + limit);

    // Calculate summary statistics
    const totalTemplates = filteredTemplates.length;
    const typeCounts = filteredTemplates.reduce((acc, template) => {
      acc[template.templateType] = (acc[template.templateType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const response = {
      templates: paginatedTemplates,
      pagination: {
        page,
        limit,
        total: totalTemplates,
        totalPages: Math.ceil(totalTemplates / limit),
      },
      summary: {
        totalTemplates,
        typeCounts,
        totalUsage: filteredTemplates.reduce((sum, t) => sum + t.totalUsage, 0),
        averageEngagement: filteredTemplates.reduce((sum, t) => sum + t.averageEngagement, 0) / filteredTemplates.length || 0,
      },
      shareableClients: [
        { id: 'demo-client-1', name: 'City of Springfield', type: 'government' },
        { id: 'demo-client-2', name: 'TechStart Inc.', type: 'business' },
        { id: 'demo-client-3', name: 'Local Coffee Co.', type: 'business' }
      ]
    };

    console.log('🎨 Service Provider Templates API response:', {
      templateCount: paginatedTemplates.length,
      totalTemplates,
      clientId: clientId || 'all-clients'
    });

    return NextResponse.json(response);

    // TODO: Replace with actual database query when schema is ready
    /*
    const whereClause = {
      serviceProviderId: organizationId,
      ...(clientId && { sharedWithClients: { has: clientId } }),
      ...(templateType && templateType !== 'all' && { templateType }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
          { tags: { hasSome: [search] } },
        ]
      }),
    };

    const [templates, totalCount] = await Promise.all([
      prisma.contentTemplate.findMany({
        where: whereClause,
        include: {
          sharedClients: {
            select: { id: true, name: true, type: true }
          },
          usage: true,
        },
        orderBy: {
          [sortBy]: sortOrder,
        },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.contentTemplate.count({ where: whereClause }),
    ]);

    return NextResponse.json({
      templates,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
    */

  } catch (error) {
    console.error('❌ Service provider templates error:', error);
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

    // For demo purposes, return success with generated ID
    const newTemplate = {
      id: `template-${Date.now()}`,
      name,
      description,
      templateType,
      content,
      previewImage: `/templates/generated-${templateType}.png`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      
      // 🎯 SERVICE PROVIDER FIELDS
      serviceProviderId,
      createdByUserId: userId,
      isShared: shareWithClients.length > 0,
      
      // 📊 SHARING METRICS
      sharedWithClients: shareWithClients,
      totalUsage: 0,
      clientUsage: {},
      
      // 🎨 CUSTOMIZATION OPTIONS
      customizableFields,
      
      // 📈 PERFORMANCE TRACKING
      averageEngagement: 0,
      bestPerformingClient: null,
      tags,
      category: category || 'General'
    };

    console.log('🎨 Created template with service provider context:', {
      templateId: newTemplate.id,
      templateType: newTemplate.templateType,
      serviceProviderId: newTemplate.serviceProviderId,
      sharedWithClients: newTemplate.sharedWithClients.length
    });

    return NextResponse.json(newTemplate, { status: 201 });

    // TODO: Replace with actual database creation when schema is ready
    /*
    const newTemplate = await prisma.contentTemplate.create({
      data: {
        name,
        description,
        templateType,
        content,
        customizableFields,
        tags,
        category,
        serviceProviderId,
        createdByUserId: userId,
        sharedClients: {
          connect: shareWithClients.map(clientId => ({ id: clientId }))
        }
      },
      include: {
        sharedClients: {
          select: { id: true, name: true, type: true }
        },
      },
    });

    return NextResponse.json(newTemplate, { status: 201 });
    */

  } catch (error) {
    console.error('❌ Error creating service provider template:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}