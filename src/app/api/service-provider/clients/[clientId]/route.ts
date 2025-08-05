import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

// Simple in-memory storage for demo fallback only when database is unavailable
// This is temporary - the real solution is to fix database connectivity
const sessionDemoClients = new Map<string, any[]>();

// Demo client detailed data consistent with the main client list
const demoClientsData = {
  'demo-client-1': {
    id: 'demo-client-1',
    name: 'City of Springfield',
    type: 'Government',
    status: 'active',
    logoUrl: 'https://api.dicebear.com/7.x/initials/svg?seed=Springfield&backgroundColor=1e40af',
    performanceScore: 92,
    monthlyBudget: 15000,
    lastActivity: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    email: 'communications@springfield.gov',
    website: 'https://springfield.gov',
    phone: '+1 (555) 123-4567',
    address: '123 City Hall Plaza, Springfield, IL 62701',
    industry: 'Municipal Government',
    createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    contactPerson: {
      name: 'Sarah Johnson',
      email: 'communications@springfield.gov',
      phone: '+1 (555) 123-4567',
      title: 'Communications Director'
    },
    demographics: {
      primaryAudience: 'Residents and Local Businesses',
      location: 'Springfield, IL',
      population: 116250,
      averageAge: 38
    },
    services: [
      'Social Media Management',
      'Content Creation',
      'Community Engagement',
      'Crisis Communication'
    ],
    contractDetails: {
      startDate: '2023-06-01',
      endDate: '2024-05-31',
      billingCycle: 'monthly',
      contractValue: 180000
    },
    projects: [
      {
        id: 'proj-1',
        name: 'Summer Community Events 2024',
        status: 'active',
        startDate: '2024-01-15',
        endDate: '2024-08-31',
        budget: 5000,
        progress: 65
      },
      {
        id: 'proj-2',
        name: 'Public Safety Awareness Campaign',
        status: 'completed',
        startDate: '2023-12-01',
        endDate: '2024-01-15',
        budget: 3000,
        progress: 100
      },
      {
        id: 'proj-3',
        name: 'Budget Transparency Initiative',
        status: 'planning',
        startDate: '2024-02-01',
        endDate: '2024-04-30',
        budget: 4000,
        progress: 15
      }
    ],
    recentActivity: [
      {
        id: 'act-1',
        type: 'content_published',
        title: 'Winter Weather Advisory posted',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        platform: 'Facebook'
      },
      {
        id: 'act-2',
        type: 'campaign_approved',
        title: 'Spring Events campaign approved',
        timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        approver: 'Sarah Johnson'
      },
      {
        id: 'act-3',
        type: 'analytics_review',
        title: 'Monthly performance review completed',
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        metrics: { engagement: '12.5%', reach: 15670 }
      }
    ],
    kpis: {
      engagement: {
        current: 8.7,
        target: 10.0,
        trend: 'up',
        change: 1.2
      },
      reach: {
        current: 45200,
        target: 50000,
        trend: 'up',
        change: 5.8
      },
      conversions: {
        current: 234,
        target: 250,
        trend: 'stable',
        change: 0.5
      },
      satisfaction: {
        current: 4.6,
        target: 4.5,
        trend: 'up',
        change: 0.2
      }
    },
    budget: {
      allocated: 15000,
      spent: 11250,
      remaining: 3750,
      spendingByCategory: [
        { category: 'Content Creation', amount: 6000, percentage: 53.3 },
        { category: 'Social Media Management', amount: 3500, percentage: 31.1 },
        { category: 'Analytics & Reporting', amount: 1750, percentage: 15.6 }
      ]
    },
    goals: [
      {
        id: 'goal-1',
        title: 'Increase Community Engagement',
        description: 'Boost social media engagement by 15% this quarter',
        target: 15,
        current: 12.5,
        unit: 'percentage',
        deadline: '2024-03-31',
        status: 'on_track'
      },
      {
        id: 'goal-2',
        title: 'Expand Digital Reach',
        description: 'Reach 50,000 residents through digital channels',
        target: 50000,
        current: 45200,
        unit: 'people',
        deadline: '2024-06-30',
        status: 'on_track'
      },
      {
        id: 'goal-3',
        title: 'Improve Response Time',
        description: 'Reduce average response time to citizen inquiries',
        target: 2,
        current: 3.5,
        unit: 'hours',
        deadline: '2024-04-30',
        status: 'behind'
      }
    ],
    documents: [
      {
        id: 'doc-1',
        name: 'Brand Guidelines 2024',
        type: 'pdf',
        size: '2.4 MB',
        uploadedAt: '2024-01-15T09:00:00Z',
        uploadedBy: 'Sarah Johnson'
      },
      {
        id: 'doc-2',
        name: 'Content Calendar - Q1',
        type: 'xlsx',
        size: '856 KB',
        uploadedAt: '2024-01-10T14:30:00Z',
        uploadedBy: 'Mike Chen'
      }
    ],
    feedback: [
      {
        id: 'feedback-1',
        rating: 5,
        comment: 'Excellent response time and quality of content. The team really understands our community needs.',
        author: 'Sarah Johnson',
        date: '2024-01-18T16:00:00Z',
        category: 'Content Quality'
      },
      {
        id: 'feedback-2',
        rating: 4,
        comment: 'Great work on the winter weather communications. Could use more proactive scheduling.',
        author: 'Mike Rodriguez',
        date: '2024-01-15T10:30:00Z',
        category: 'Timeliness'
      }
    ]
  },
  'demo-client-2': {
    id: 'demo-client-2',
    name: 'Regional Health District',
    type: 'Healthcare',
    status: 'active',
    logoUrl: 'https://api.dicebear.com/7.x/initials/svg?seed=HealthDistrict&backgroundColor=059669',
    performanceScore: 88,
    monthlyBudget: 22000,
    lastActivity: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    email: 'marketing@healthdistrict.org',
    website: 'https://regionalhealthdistrict.org',
    phone: '+1 (555) 987-6543',
    address: '456 Medical Center Dr, Metro City, CA 90210',
    industry: 'Healthcare & Public Health',
    createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    contactPerson: {
      name: 'Dr. Emily Carter',
      email: 'emily.carter@healthdistrict.org',
      phone: '+1 (555) 987-6543',
      title: 'Public Health Director'
    },
    demographics: {
      primaryAudience: 'Healthcare Professionals and General Public',
      location: 'Regional District',
      population: 285000,
      averageAge: 42
    },
    services: [
      'Public Health Campaigns',
      'Crisis Communication',
      'Educational Content',
      'Community Outreach'
    ],
    contractDetails: {
      startDate: '2023-08-01',
      endDate: '2024-07-31',
      billingCycle: 'monthly',
      contractValue: 264000
    },
    projects: [
      {
        id: 'proj-4',
        name: 'Vaccination Awareness Campaign',
        status: 'active',
        startDate: '2024-01-01',
        endDate: '2024-06-30',
        budget: 8000,
        progress: 45
      },
      {
        id: 'proj-5',
        name: 'Mental Health Resources Program',
        status: 'active',
        startDate: '2023-11-15',
        endDate: '2024-05-15',
        budget: 6500,
        progress: 78
      }
    ],
    recentActivity: [
      {
        id: 'act-4',
        type: 'campaign_launched',
        title: 'Flu Prevention campaign launched',
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        platform: 'Multi-platform'
      },
      {
        id: 'act-5',
        type: 'content_approved',
        title: 'Mental Health Week content approved',
        timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        approver: 'Dr. Emily Carter'
      }
    ],
    kpis: {
      engagement: {
        current: 12.3,
        target: 12.0,
        trend: 'up',
        change: 2.1
      },
      reach: {
        current: 78500,
        target: 75000,
        trend: 'up',
        change: 8.2
      },
      conversions: {
        current: 456,
        target: 400,
        trend: 'up',
        change: 14.0
      },
      satisfaction: {
        current: 4.8,
        target: 4.5,
        trend: 'up',
        change: 0.3
      }
    },
    budget: {
      allocated: 22000,
      spent: 16800,
      remaining: 5200,
      spendingByCategory: [
        { category: 'Public Health Campaigns', amount: 9500, percentage: 56.5 },
        { category: 'Educational Content', amount: 4200, percentage: 25.0 },
        { category: 'Community Outreach', amount: 3100, percentage: 18.5 }
      ]
    },
    goals: [
      {
        id: 'goal-4',
        title: 'Increase Health Awareness',
        description: 'Improve public health knowledge metrics by 20%',
        target: 20,
        current: 18.5,
        unit: 'percentage',
        deadline: '2024-04-30',
        status: 'on_track'
      }
    ],
    documents: [
      {
        id: 'doc-4',
        name: 'Public Health Messaging Guide',
        type: 'pdf',
        size: '3.2 MB',
        uploadedAt: '2024-01-12T10:00:00Z',
        uploadedBy: 'Dr. Emily Carter'
      }
    ],
    feedback: [
      {
        id: 'feedback-4',
        rating: 5,
        comment: 'Outstanding work on the vaccination campaign. Very professional and effective messaging.',
        author: 'Dr. Emily Carter',
        date: '2024-01-16T14:00:00Z',
        category: 'Campaign Quality'
      }
    ]
  }
};

export async function GET(
  request: NextRequest,
  { params }: { params: { clientId: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get('organizationId');
    const clientId = params.clientId;

    console.log('Client detail request:', {
      clientId,
      organizationId,
      userId,
      requestUrl: request.url
    });

    // Validate required parameters
    if (!organizationId) {
      return NextResponse.json(
        { error: 'Organization ID is required' },
        { status: 400 }
      );
    }

    if (!clientId) {
      return NextResponse.json(
        { error: 'Client ID is required' },
        { status: 400 }
      );
    }

    // Check if this is a static demo client first
    if (demoClientsData[clientId as keyof typeof demoClientsData]) {
      const demoClient = demoClientsData[clientId as keyof typeof demoClientsData];
      // Add organizationId to demo client for consistency
      return NextResponse.json({
        ...demoClient,
        organizationId
      });
    }

    // Check if this is a session demo client (user-created in demo mode)
    const sessionKey = `${organizationId}-${userId}`;
    const sessionClients = sessionDemoClients.get(sessionKey) || [];
    const sessionClient = sessionClients.find(c => c.id === clientId);
    
    console.log('Session client lookup:', {
      clientId,
      sessionKey,
      sessionClientsFound: sessionClients.length,
      sessionClientIds: sessionClients.map(c => c.id),
      foundSessionClient: !!sessionClient,
      allSessionKeys: Array.from(sessionDemoClients.keys())
    });
    
    if (sessionClient) {
      // Transform session client to detailed format
      return NextResponse.json({
        ...sessionClient,
        organizationId,
        // Add minimal detail data for session clients
        contactPerson: {
          name: 'Client Representative',
          email: sessionClient.email,
          phone: sessionClient.phone || 'Not provided',
          title: 'Primary Contact'
        },
        demographics: {
          primaryAudience: 'General Audience',
          location: 'Not specified',
          population: 0,
          averageAge: 0
        },
        services: ['Content Management'],
        contractDetails: {
          startDate: sessionClient.createdAt,
          endDate: null,
          billingCycle: 'monthly',
          contractValue: sessionClient.monthlyBudget * 12 || 0
        },
        projects: [],
        recentActivity: [
          {
            id: 'act-session-1',
            type: 'client_created',
            title: 'Client account created',
            timestamp: sessionClient.createdAt,
          }
        ],
        kpis: {
          engagement: { current: 0, target: 5.0, trend: 'stable', change: 0 },
          reach: { current: 0, target: 1000, trend: 'stable', change: 0 },
          conversions: { current: 0, target: 50, trend: 'stable', change: 0 },
          satisfaction: { current: 0, target: 4.5, trend: 'stable', change: 0 }
        },
        budget: {
          allocated: sessionClient.monthlyBudget || 0,
          spent: 0,
          remaining: sessionClient.monthlyBudget || 0,
          spendingByCategory: []
        },
        goals: [],
        documents: [],
        feedback: []
      });
    }

    // If not a demo client, try to fetch from database with fallback
    let client: any = null;
    
    try {
      console.log('Attempting to fetch client from database...');
      client = await prisma.client.findFirst({
        where: {
          id: clientId,
          organizationId,
          status: 'ACTIVE'
        },
        include: {
          campaigns: {
            select: {
              id: true,
              name: true,
              status: true,
            },
          },
          projects: {
            select: {
              id: true,
              name: true,
              status: true,
            },
          },
          socialAccounts: {
            select: {
              id: true,
              platform: true,
              handle: true,
            },
          },
          goals: {
            select: {
              id: true,
              name: true,
              description: true,
              targetValue: true,
              currentValue: true,
              startDate: true,
              endDate: true,
              status: true,
            },
          },
          documents: {
            select: {
              id: true,
              title: true,
              fileUrl: true,
              fileType: true,
              createdAt: true,
              uploadedBy: {
                select: {
                  name: true,
                },
              },
            },
          },
          feedback: {
            select: {
              id: true,
              rating: true,
              comment: true,
              category: true,
              createdAt: true,
            },
          },
        },
      });
    } catch (dbError) {
      console.warn('Database unavailable when fetching client details:', dbError);
      client = null;
    }

    if (!client) {
      return NextResponse.json(
        { error: 'Client not found' },
        { status: 404 }
      );
    }

    // Transform database client to expected format
    const clientResponse = {
      id: client.id,
      name: client.name,
      organizationId: client.organizationId,
      email: client.email,
      type: client.type,
      status: client.status === 'ACTIVE' ? 'active' : 'inactive',
      industry: client.industry || 'General',
      website: client.website,
      phone: client.phone,
      address: client.address,
      logoUrl: client.logoUrl,
      createdAt: client.createdAt.toISOString(),
      updatedAt: client.updatedAt.toISOString(),
      monthlyBudget: client.monthlyBudget ? Number(client.monthlyBudget) : null,
      lastActivity: client.updatedAt.toISOString(),
      
      // Calculate performance score
      performanceScore: Math.min(
        (client.campaigns.filter(c => c.status === 'ACTIVE').length * 25) +
        (client.projects.filter(p => p.status === 'ACTIVE').length * 15) +
        Math.max(30 - Math.floor((Date.now() - client.createdAt.getTime()) / (1000 * 60 * 60 * 24 * 30)), 0),
        100
      ),
      
      // Transform related data
      projects: client.projects.map(p => ({
        id: p.id,
        name: p.name,
        status: p.status.toLowerCase(),
      })),
      
      goals: client.goals.map(g => ({
        id: g.id,
        title: g.name,
        description: g.description,
        target: g.targetValue,
        current: g.currentValue,
        deadline: g.endDate?.toISOString(),
        status: g.status.toLowerCase().replace('_', '_'),
      })),
      
      documents: client.documents.map(d => ({
        id: d.id,
        name: d.title,
        type: d.fileType,
        uploadedAt: d.createdAt.toISOString(),
        uploadedBy: d.uploadedBy.name,
      })),
      
      feedback: client.feedback.map(f => ({
        id: f.id,
        rating: f.rating,
        comment: f.comment,
        category: f.category,
        date: f.createdAt.toISOString(),
      })),
      
      // Placeholder data for fields not in database
      contactPerson: {
        name: 'Client Representative',
        email: client.email,
        phone: client.phone || 'Not provided',
        title: 'Primary Contact'
      },
      
      recentActivity: [
        {
          id: 'act-db-1',
          type: 'client_created',
          title: 'Client account created',
          timestamp: client.createdAt.toISOString(),
        }
      ],
      
      kpis: {
        engagement: { current: 0, target: 5.0, trend: 'stable', change: 0 },
        reach: { current: 0, target: 1000, trend: 'stable', change: 0 },
        conversions: { current: 0, target: 50, trend: 'stable', change: 0 },
        satisfaction: { current: 0, target: 4.5, trend: 'stable', change: 0 }
      },
      
      budget: {
        allocated: client.monthlyBudget ? Number(client.monthlyBudget) : 0,
        spent: 0,
        remaining: client.monthlyBudget ? Number(client.monthlyBudget) : 0,
        spendingByCategory: []
      }
    };

    return NextResponse.json(clientResponse);

  } catch (error) {
    console.error('Error fetching client details:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}