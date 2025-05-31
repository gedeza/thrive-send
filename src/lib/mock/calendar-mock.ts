import { CalendarEvent, ContentType, SocialPlatform } from '@/components/content/content-calendar';

export const getMockCalendarEvents = (): CalendarEvent[] => {
  const today = new Date();
  const todayISO = today.toISOString().split('T')[0];
  
  // Generate dates for the current week
  const dates = [];
  for (let i = -3; i <= 3; i++) {
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
      socialMediaContent: {
        platforms: [],
        mediaUrls: [],
        crossPost: false,
        platformSpecificContent: {}
      },
      organizationId: "mock-org",
      createdBy: "mock-user"
    },
    {
      id: "mock-2",
      title: "Weekly Newsletter",
      description: "Company updates and industry news",
      type: "email" as ContentType,
      status: "scheduled",
      date: dates[1],
      time: "09:00",
      socialMediaContent: {
        platforms: [],
        mediaUrls: [],
        crossPost: false,
        platformSpecificContent: {}
      },
      organizationId: "mock-org",
      createdBy: "mock-user"
    },
    {
      id: "mock-3",
      title: "Product Launch Post",
      description: "Announcement of our new product line",
      type: "social" as ContentType,
      status: "draft",
      date: dates[2],
      time: "14:30",
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
      organizationId: "mock-org",
      createdBy: "mock-user"
    },
    {
      id: "mock-4",
      title: "Blog Post: Industry Trends",
      description: "Analysis of current industry trends and predictions",
      type: "blog" as ContentType,
      status: "sent",
      date: dates[3],
      time: "11:00",
      socialMediaContent: {
        platforms: [],
        mediaUrls: [],
        crossPost: false,
        platformSpecificContent: {}
      },
      organizationId: "mock-org",
      createdBy: "mock-user"
    },
    {
      id: "mock-5",
      title: "Customer Success Story",
      description: "Case study featuring our top client",
      type: "article" as ContentType,
      status: "draft",
      date: dates[4],
      time: "15:00",
      socialMediaContent: {
        platforms: [],
        mediaUrls: [],
        crossPost: false,
        platformSpecificContent: {}
      },
      organizationId: "mock-org",
      createdBy: "mock-user"
    },
    {
      id: "mock-6",
      title: "Instagram Product Showcase",
      description: "Visual showcase of product features",
      type: "social" as ContentType,
      status: "scheduled",
      date: dates[5],
      time: "12:00",
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
      organizationId: "mock-org",
      createdBy: "mock-user"
    },
    {
      id: "mock-7",
      title: "Monthly Webinar Invitation",
      description: "Invitation to our monthly educational webinar",
      type: "email" as ContentType,
      status: "draft",
      date: dates[6],
      time: "09:30",
      socialMediaContent: {
        platforms: [],
        mediaUrls: [],
        crossPost: false,
        platformSpecificContent: {}
      },
      organizationId: "mock-org",
      createdBy: "mock-user"
    }
  ];
}; 