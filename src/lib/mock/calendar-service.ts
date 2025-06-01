import { CalendarEvent, ContentType, SocialPlatform } from '@/components/content/content-calendar';

/**
 * Provides mock calendar events for development and fallback scenarios
 * when the database is unavailable.
 */
export const getMockCalendarEvents = (): CalendarEvent[] => {
  const today = new Date();
  const todayISO = today.toISOString().split('T')[0];
  
  // Generate dates for the current week and month
  const dates = [];
  for (let i = -14; i <= 14; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() + i);
    dates.push(date.toISOString().split('T')[0]);
  }
  
  return [
    {
      id: "mock-1",
      title: "Marketing Email Campaign",
      description: "Q3 product launch email with details about new features and pricing",
      type: "email" as ContentType,
      status: "draft",
      date: dates[0],
      time: "10:00",
      startTime: new Date(`${dates[0]}T10:00:00`).toISOString(),
      endTime: new Date(`${dates[0]}T11:00:00`).toISOString(),
      socialMediaContent: {
        platforms: [],
        mediaUrls: [],
        crossPost: false,
        platformSpecificContent: {}
      },
      analytics: {
        views: 0,
        engagement: {
          likes: 0,
          shares: 0,
          comments: 0
        },
        clicks: 0,
        lastUpdated: new Date().toISOString()
      },
      organizationId: "mock-org",
      createdBy: "mock-user",
      tags: ["email", "marketing", "product"]
    },
    {
      id: "mock-2",
      title: "Weekly Newsletter",
      description: "Company updates and industry news",
      type: "email" as ContentType,
      status: "scheduled",
      date: dates[2],
      time: "09:00",
      startTime: new Date(`${dates[2]}T09:00:00`).toISOString(),
      endTime: new Date(`${dates[2]}T09:30:00`).toISOString(),
      socialMediaContent: {
        platforms: [],
        mediaUrls: [],
        crossPost: false,
        platformSpecificContent: {}
      },
      analytics: {
        views: 0,
        engagement: {
          likes: 0,
          shares: 0,
          comments: 0
        },
        clicks: 0,
        lastUpdated: new Date().toISOString()
      },
      organizationId: "mock-org",
      createdBy: "mock-user",
      tags: ["newsletter", "weekly"]
    },
    {
      id: "mock-3",
      title: "Product Launch Post",
      description: "Announcement of our new product line",
      type: "social" as ContentType,
      status: "draft",
      date: dates[5],
      time: "14:30",
      startTime: new Date(`${dates[5]}T14:30:00`).toISOString(),
      endTime: new Date(`${dates[5]}T15:00:00`).toISOString(),
      socialMediaContent: {
        platforms: ["FACEBOOK" as SocialPlatform, "TWITTER" as SocialPlatform],
        mediaUrls: ["https://via.placeholder.com/600x400"],
        crossPost: true,
        platformSpecificContent: {
          "FACEBOOK": {
            text: "We're excited to announce our new product line! #launch #newproduct",
            mediaUrls: ["https://via.placeholder.com/600x400"],
            scheduledTime: undefined
          },
          "TWITTER": {
            text: "New products just dropped! Check them out now #launch",
            mediaUrls: ["https://via.placeholder.com/600x400"],
            scheduledTime: undefined
          }
        }
      },
      analytics: {
        views: 0,
        engagement: {
          likes: 0,
          shares: 0,
          comments: 0
        },
        clicks: 0,
        lastUpdated: new Date().toISOString()
      },
      organizationId: "mock-org",
      createdBy: "mock-user",
      tags: ["product", "launch", "social"]
    },
    {
      id: "mock-4",
      title: "Blog Post: Industry Trends",
      description: "Analysis of current industry trends and predictions",
      type: "blog" as ContentType,
      status: "sent",
      date: dates[7],
      time: "11:00",
      startTime: new Date(`${dates[7]}T11:00:00`).toISOString(),
      endTime: new Date(`${dates[7]}T11:30:00`).toISOString(),
      socialMediaContent: {
        platforms: [],
        mediaUrls: [],
        crossPost: false,
        platformSpecificContent: {}
      },
      analytics: {
        views: 423,
        engagement: {
          likes: 38,
          shares: 12,
          comments: 7
        },
        clicks: 86,
        lastUpdated: new Date().toISOString()
      },
      organizationId: "mock-org",
      createdBy: "mock-user",
      tags: ["blog", "industry", "trends"]
    },
    {
      id: "mock-5",
      title: "Customer Success Story",
      description: "Case study featuring our top client",
      type: "article" as ContentType,
      status: "draft",
      date: dates[10],
      time: "15:00",
      startTime: new Date(`${dates[10]}T15:00:00`).toISOString(),
      endTime: new Date(`${dates[10]}T16:00:00`).toISOString(),
      socialMediaContent: {
        platforms: [],
        mediaUrls: [],
        crossPost: false,
        platformSpecificContent: {}
      },
      analytics: {
        views: 0,
        engagement: {
          likes: 0,
          shares: 0,
          comments: 0
        },
        clicks: 0,
        lastUpdated: new Date().toISOString()
      },
      organizationId: "mock-org",
      createdBy: "mock-user",
      tags: ["case study", "customer", "success"]
    },
    {
      id: "mock-6",
      title: "Instagram Product Showcase",
      description: "Visual showcase of product features",
      type: "social" as ContentType,
      status: "scheduled",
      date: dates[12],
      time: "12:00",
      startTime: new Date(`${dates[12]}T12:00:00`).toISOString(),
      endTime: new Date(`${dates[12]}T12:30:00`).toISOString(),
      socialMediaContent: {
        platforms: ["INSTAGRAM" as SocialPlatform],
        mediaUrls: [
          "https://via.placeholder.com/1080x1080",
          "https://via.placeholder.com/1080x1080"
        ],
        crossPost: false,
        platformSpecificContent: {
          "INSTAGRAM": {
            text: "Swipe to see all the amazing features of our new product! #newlaunch #productshowcase",
            mediaUrls: [
              "https://via.placeholder.com/1080x1080",
              "https://via.placeholder.com/1080x1080"
            ],
            scheduledTime: undefined
          }
        }
      },
      analytics: {
        views: 0,
        engagement: {
          likes: 0,
          shares: 0,
          comments: 0
        },
        clicks: 0,
        lastUpdated: new Date().toISOString()
      },
      organizationId: "mock-org",
      createdBy: "mock-user",
      tags: ["instagram", "product", "visual"]
    },
    {
      id: "mock-7",
      title: "Monthly Webinar Invitation",
      description: "Invitation to our monthly educational webinar",
      type: "email" as ContentType,
      status: "draft",
      date: dates[15],
      time: "09:30",
      startTime: new Date(`${dates[15]}T09:30:00`).toISOString(),
      endTime: new Date(`${dates[15]}T10:30:00`).toISOString(),
      socialMediaContent: {
        platforms: [],
        mediaUrls: [],
        crossPost: false,
        platformSpecificContent: {}
      },
      analytics: {
        views: 0,
        engagement: {
          likes: 0,
          shares: 0,
          comments: 0
        },
        clicks: 0,
        lastUpdated: new Date().toISOString()
      },
      organizationId: "mock-org",
      createdBy: "mock-user",
      tags: ["webinar", "invitation", "education"]
    },
    {
      id: "mock-8",
      title: "Q3 Marketing Strategy",
      description: "Planning session for Q3 marketing initiatives",
      type: "custom" as ContentType,
      status: "scheduled",
      date: dates[17],
      time: "13:00",
      startTime: new Date(`${dates[17]}T13:00:00`).toISOString(),
      endTime: new Date(`${dates[17]}T14:30:00`).toISOString(),
      socialMediaContent: {
        platforms: [],
        mediaUrls: [],
        crossPost: false,
        platformSpecificContent: {}
      },
      analytics: {
        views: 0,
        engagement: {
          likes: 0,
          shares: 0,
          comments: 0
        },
        clicks: 0,
        lastUpdated: new Date().toISOString()
      },
      organizationId: "mock-org",
      createdBy: "mock-user",
      tags: ["planning", "strategy", "marketing"]
    }
  ];
};

/**
 * Simulate creating a calendar event with mock data
 */
export const createMockCalendarEvent = (event: Omit<CalendarEvent, "id">): CalendarEvent => {
  return {
    ...event,
    id: `mock-${Date.now()}`,
    startTime: event.startTime || new Date(`${event.date}T${event.time || '00:00'}:00`).toISOString(),
    endTime: event.endTime || new Date(`${event.date}T${event.time || '00:00'}:00`).toISOString(),
    analytics: {
      views: 0,
      engagement: {
        likes: 0,
        shares: 0,
        comments: 0
      },
      clicks: 0,
      lastUpdated: new Date().toISOString()
    }
  };
};

/**
 * Simulate updating a calendar event with mock data
 */
export const updateMockCalendarEvent = (event: CalendarEvent): CalendarEvent => {
  return {
    ...event,
    updatedAt: new Date().toISOString()
  };
};

/**
 * Simulate deleting a calendar event with mock data
 */
export const deleteMockCalendarEvent = (id: string): boolean => {
  return true;
};

/**
 * Get mock analytics data for the calendar
 */
export const getMockCalendarAnalytics = () => {
  return {
    totalEvents: 8,
    byType: {
      email: 3,
      social: 2,
      blog: 1,
      article: 1,
      custom: 1
    },
    byStatus: {
      draft: 4,
      scheduled: 3,
      sent: 1,
      failed: 0
    },
    topTags: [
      { tag: "marketing", count: 3 },
      { tag: "product", count: 3 },
      { tag: "social", count: 2 }
    ]
  };
}; 