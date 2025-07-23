/**
 * Content Templates System
 * Provides pre-defined templates for quick event creation
 */

import { CalendarEvent, ContentType, SocialPlatform } from '@/components/content/types';

export interface ContentTemplate {
  id: string;
  name: string;
  description: string;
  type: ContentType;
  category: 'marketing' | 'social' | 'blog' | 'email' | 'custom';
  icon?: string;
  defaultTitle: string;
  defaultDescription: string;
  defaultDuration?: number; // minutes
  suggestedPlatforms?: SocialPlatform[];
  tags: string[];
  isCustom?: boolean;
  createdBy?: string;
  organizationId?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// Pre-defined templates
export const DEFAULT_TEMPLATES: ContentTemplate[] = [
  // Social Media Templates
  {
    id: 'social-product-launch',
    name: 'Product Launch',
    description: 'Announce a new product or feature launch',
    type: 'social',
    category: 'marketing',
    icon: '🚀',
    defaultTitle: 'Exciting News: [Product Name] is Here!',
    defaultDescription: 'We\'re thrilled to announce the launch of [Product Name]! This innovative solution will help you [key benefit]. Available now at [link].\n\n#ProductLaunch #Innovation #[YourBrand]',
    defaultDuration: 30,
    suggestedPlatforms: ['facebook', 'twitter', 'linkedin', 'instagram'],
    tags: ['product', 'launch', 'announcement', 'marketing']
  },
  {
    id: 'social-behind-scenes',
    name: 'Behind the Scenes',
    description: 'Share behind-the-scenes content to build connection',
    type: 'social',
    category: 'social',
    icon: '🎬',
    defaultTitle: 'Behind the Scenes at [Company Name]',
    defaultDescription: 'Take a peek behind the curtain! Here\'s what goes into making [process/product]. Our team works hard to bring you the best experience possible.\n\n#BehindTheScenes #TeamWork #[YourBrand]',
    defaultDuration: 20,
    suggestedPlatforms: ['instagram', 'facebook', 'twitter'],
    tags: ['bts', 'team', 'culture', 'authentic']
  },
  {
    id: 'social-user-generated',
    name: 'User Generated Content',
    description: 'Share customer testimonials and user content',
    type: 'social',
    category: 'social',
    icon: '💝',
    defaultTitle: 'Customer Spotlight: [Customer Name]',
    defaultDescription: 'We love seeing how our customers use [product/service]! Here\'s what [Customer Name] had to say: "[testimonial]"\n\nThank you for being part of our community! 🙏\n\n#CustomerLove #Testimonial #Community',
    defaultDuration: 25,
    suggestedPlatforms: ['facebook', 'instagram', 'linkedin'],
    tags: ['ugc', 'testimonial', 'community', 'social-proof']
  },
  {
    id: 'social-tip-tuesday',
    name: 'Tip Tuesday',
    description: 'Weekly tips and educational content',
    type: 'social',
    category: 'social',
    icon: '💡',
    defaultTitle: 'Tip Tuesday: [Topic]',
    defaultDescription: 'Today\'s tip: [Helpful tip related to your industry]\n\nTry this out and let us know how it works for you!\n\n#TipTuesday #Tips #[YourIndustry] #HelpfulHints',
    defaultDuration: 15,
    suggestedPlatforms: ['twitter', 'linkedin', 'facebook'],
    tags: ['tips', 'education', 'weekly', 'value']
  },

  // Blog Templates
  {
    id: 'blog-how-to-guide',
    name: 'How-To Guide',
    description: 'Step-by-step instructional blog post',
    type: 'blog',
    category: 'blog',
    icon: '📖',
    defaultTitle: 'How to [Achieve Specific Goal]: A Step-by-Step Guide',
    defaultDescription: 'In this comprehensive guide, we\'ll walk you through exactly how to [achieve goal]. Whether you\'re a beginner or looking to refine your approach, this step-by-step tutorial will help you [benefit].\n\n## What You\'ll Learn\n- [Key point 1]\n- [Key point 2]\n- [Key point 3]\n\n## Step 1: [First Step]\n[Detailed instructions]\n\n## Step 2: [Second Step]\n[Detailed instructions]\n\n## Conclusion\n[Summary and next steps]',
    defaultDuration: 180,
    tags: ['tutorial', 'guide', 'education', 'how-to']
  },
  {
    id: 'blog-industry-trends',
    name: 'Industry Trends',
    description: 'Analysis of current industry trends and insights',
    type: 'blog',
    category: 'blog',
    icon: '📈',
    defaultTitle: '[Year] [Industry] Trends: What You Need to Know',
    defaultDescription: 'The [industry] landscape is constantly evolving. As we move through [year], several key trends are shaping the future of [industry]. Here\'s what businesses need to know to stay competitive.\n\n## Key Trends to Watch\n\n### 1. [Trend 1]\n[Analysis and implications]\n\n### 2. [Trend 2]\n[Analysis and implications]\n\n### 3. [Trend 3]\n[Analysis and implications]\n\n## What This Means for Your Business\n[Actionable insights]',
    defaultDuration: 240,
    tags: ['trends', 'industry', 'analysis', 'insights']
  },

  // Email Templates
  {
    id: 'email-welcome-series',
    name: 'Welcome Email',
    description: 'Welcome new subscribers or customers',
    type: 'email',
    category: 'email',
    icon: '👋',
    defaultTitle: 'Welcome to [Company Name]! Here\'s what\'s next...',
    defaultDescription: 'Subject: Welcome to [Company Name] - Let\'s get you started! 🎉\n\nHi [First Name],\n\nWelcome to the [Company Name] family! We\'re excited to have you on board.\n\nHere\'s what you can expect:\n✅ [Benefit 1]\n✅ [Benefit 2]\n✅ [Benefit 3]\n\nTo get started:\n1. [First action]\n2. [Second action]\n3. [Third action]\n\nIf you have any questions, just reply to this email - we\'re here to help!\n\nBest regards,\n[Your Name]\n[Company Name]',
    defaultDuration: 60,
    tags: ['welcome', 'onboarding', 'introduction', 'automation']
  },
  {
    id: 'email-newsletter',
    name: 'Monthly Newsletter',
    description: 'Regular newsletter template',
    type: 'email',
    category: 'email',
    icon: '📰',
    defaultTitle: '[Month] Newsletter: [Theme/Topic]',
    defaultDescription: 'Subject: Your [Month] Update from [Company Name] 📬\n\nHi [First Name],\n\nHere\'s what\'s been happening at [Company Name] this month:\n\n## 🌟 This Month\'s Highlights\n- [Highlight 1]\n- [Highlight 2]\n- [Highlight 3]\n\n## 📚 Featured Content\n[Brief description of main content piece]\n[Read more link]\n\n## 🎯 Quick Tips\n[Helpful tip related to your audience]\n\n## 📅 Upcoming Events\n- [Event 1] - [Date]\n- [Event 2] - [Date]\n\nThat\'s all for now! See you next month.\n\nBest,\n[Your Name]',
    defaultDuration: 90,
    tags: ['newsletter', 'monthly', 'updates', 'engagement']
  },

  // Article Templates
  {
    id: 'article-case-study',
    name: 'Case Study',
    description: 'Customer success story or case study',
    type: 'article',
    category: 'marketing',
    icon: '📊',
    defaultTitle: 'Case Study: How [Company] Achieved [Result] with [Solution]',
    defaultDescription: '## Executive Summary\n[Brief overview of the case study]\n\n## The Challenge\n[Client\'s initial problem or challenge]\n\n## The Solution\n[How your product/service addressed the challenge]\n\n## Implementation\n[Details about the implementation process]\n\n## Results\n- [Quantifiable result 1]\n- [Quantifiable result 2]\n- [Quantifiable result 3]\n\n## Client Testimonial\n"[Quote from the client]" - [Client Name, Title, Company]\n\n## Key Takeaways\n[Lessons learned and broader applications]',
    defaultDuration: 200,
    tags: ['case-study', 'success-story', 'results', 'testimonial']
  },

  // Custom Templates
  {
    id: 'custom-event-announcement',
    name: 'Event Announcement',
    description: 'Promote upcoming events or webinars',
    type: 'custom',
    category: 'marketing',
    icon: '🎉',
    defaultTitle: 'Join Us: [Event Name] on [Date]',
    defaultDescription: 'You\'re invited to [Event Name]!\n\n📅 Date: [Date]\n🕒 Time: [Time]\n📍 Location: [Location/Virtual Link]\n\nWhat to expect:\n• [Agenda item 1]\n• [Agenda item 2]\n• [Agenda item 3]\n\nWho should attend:\n[Target audience description]\n\nRegister now: [Registration link]\n\nLimited seats available!',
    defaultDuration: 45,
    tags: ['event', 'announcement', 'registration', 'webinar']
  }
];

// Template management functions
export const getTemplatesByCategory = (category: ContentTemplate['category']): ContentTemplate[] => {
  return DEFAULT_TEMPLATES.filter(template => template.category === category);
};

export const getTemplatesByType = (type: ContentType): ContentTemplate[] => {
  return DEFAULT_TEMPLATES.filter(template => template.type === type);
};

export const searchTemplates = (query: string): ContentTemplate[] => {
  const lowercaseQuery = query.toLowerCase();
  return DEFAULT_TEMPLATES.filter(template => 
    template.name.toLowerCase().includes(lowercaseQuery) ||
    template.description.toLowerCase().includes(lowercaseQuery) ||
    template.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
  );
};

export const getTemplateById = (id: string): ContentTemplate | undefined => {
  return DEFAULT_TEMPLATES.find(template => template.id === id);
};

// Enhanced template application function with time zone handling and platform optimization
export const applyTemplateToEvent = (
  template: ContentTemplate,
  overrides: Partial<CalendarEvent> = {},
  options: {
    timezone?: string;
    scheduleTime?: string;
    optimizeForPlatforms?: boolean;
    includeAnalytics?: boolean;
  } = {}
): Partial<CalendarEvent> => {
  const now = new Date();
  const defaultDate = overrides.date || now.toISOString().split('T')[0];
  
  // Enhanced time handling with timezone support
  const calculateScheduleTime = () => {
    if (options.scheduleTime) {
      return options.scheduleTime;
    }
    
    // Smart scheduling based on content type and optimal engagement times
    const optimalTimes = {
      social: '14:00', // 2 PM - peak social media engagement
      email: '09:00',  // 9 AM - peak email open rates
      blog: '10:00',   // 10 AM - peak content consumption
      article: '11:00', // 11 AM - professional reading time
      custom: '12:00'   // Noon - neutral time
    };
    
    return optimalTimes[template.type] || '12:00';
  };

  // Enhanced duration calculation based on content complexity
  const calculateDuration = () => {
    if (template.defaultDuration) {
      return template.defaultDuration;
    }
    
    // Smart duration based on content type and description length
    const baseDurations = {
      social: 30,   // 30 minutes for social posts
      email: 60,    // 1 hour for emails
      blog: 180,    // 3 hours for blog posts
      article: 240, // 4 hours for articles
      custom: 60    // 1 hour default
    };
    
    let duration = baseDurations[template.type] || 60;
    
    // Adjust based on content complexity
    const descriptionLength = template.defaultDescription?.length || 0;
    if (descriptionLength > 500) {
      duration *= 1.5; // 50% more time for complex content
    } else if (descriptionLength > 1000) {
      duration *= 2; // Double time for very complex content
    }
    
    return Math.round(duration);
  };

  // Platform-specific optimization for social media content
  const optimizeSocialContent = () => {
    if (template.type !== 'social' || !options.optimizeForPlatforms) {
      return template.type === 'social' ? {
        platforms: template.suggestedPlatforms || [],
        crossPost: true,
        mediaUrls: [],
        platformSpecificContent: {}
      } : undefined;
    }

    const platformSpecificContent: any = {};
    const platforms = template.suggestedPlatforms || [];

    // Generate platform-optimized content
    platforms.forEach(platform => {
      const platformLimits = {
        twitter: { maxLength: 280, hashtags: 2 },
        facebook: { maxLength: 500, hashtags: 3 },
        instagram: { maxLength: 300, hashtags: 5 },
        linkedin: { maxLength: 700, hashtags: 3 },
        tiktok: { maxLength: 150, hashtags: 3 }
      };

      const limits = platformLimits[platform as keyof typeof platformLimits];
      if (limits) {
        let optimizedText = template.defaultDescription;
        
        // Truncate if too long
        if (optimizedText && optimizedText.length > limits.maxLength) {
          optimizedText = optimizedText.substring(0, limits.maxLength - 3) + '...';
        }

        // Add platform-specific formatting
        if (platform === 'twitter') {
          // Add Twitter-specific formatting
          optimizedText = optimizedText?.replace(/\n\n/g, '\n');
        } else if (platform === 'linkedin') {
          // Add LinkedIn professional formatting
          optimizedText = optimizedText?.replace(/\n/g, '\n\n');
        } else if (platform === 'instagram') {
          // Add Instagram emoji and hashtag optimization
          if (!optimizedText?.includes('📸') && !optimizedText?.includes('🎯')) {
            optimizedText = '✨ ' + optimizedText;
          }
        }

        platformSpecificContent[platform] = {
          text: optimizedText,
          mediaUrls: [],
          scheduledTime: calculateScheduleTime(),
          hashtags: template.tags.slice(0, limits.hashtags).map(tag => `#${tag.replace(/\s+/g, '')}`),
          optimizedFor: platform
        };
      }
    });

    return {
      platforms,
      crossPost: platforms.length > 1,
      mediaUrls: [],
      platformSpecificContent
    };
  };

  // Generate analytics tracking data
  const generateAnalyticsData = () => {
    if (!options.includeAnalytics) return undefined;
    
    return {
      templateId: template.id,
      templateCategory: template.category,
      templateTags: template.tags,
      expectedDuration: calculateDuration(),
      optimizationLevel: options.optimizeForPlatforms ? 'high' : 'basic',
      schedulingSource: 'template',
      createdAt: new Date().toISOString()
    };
  };

  const scheduleTime = calculateScheduleTime();
  const duration = calculateDuration();
  
  // Create enhanced event data
  const eventData: Partial<CalendarEvent> = {
    title: template.defaultTitle,
    description: template.defaultDescription,
    type: template.type,
    date: defaultDate,
    time: scheduleTime,
    duration,
    status: 'draft',
    
    // Enhanced startTime and endTime calculation
    startTime: `${defaultDate}T${scheduleTime}:00`,
    endTime: (() => {
      const start = new Date(`${defaultDate}T${scheduleTime}:00`);
      const end = new Date(start.getTime() + duration * 60000); // Add duration in milliseconds
      return end.toISOString();
    })(),
    
    // Template metadata for tracking and optimization
    templateMetadata: {
      templateId: template.id,
      templateName: template.name,
      templateCategory: template.category,
      appliedAt: new Date().toISOString(),
      // Store original values for comparison during analytics tracking
      originalTitle: template.defaultTitle,
      originalDescription: template.defaultDescription,
      originalTime: scheduleTime,
      originalPlatforms: template.suggestedPlatforms || [],
      optimizations: {
        timeOptimized: !!options.scheduleTime,
        platformOptimized: options.optimizeForPlatforms && template.type === 'social',
        analyticsEnabled: options.includeAnalytics
      }
    },
    
    // Enhanced social media content
    socialMediaContent: optimizeSocialContent(),
    
    // Analytics data for performance tracking
    analytics: generateAnalyticsData(),
    
    // Apply any overrides last
    ...overrides
  };

  return eventData;
};

// Custom template management (for future database integration)
export interface CustomTemplate extends ContentTemplate {
  isCustom: true;
  createdBy: string;
  organizationId: string;
}

export const createCustomTemplate = (
  template: Omit<CustomTemplate, 'id' | 'isCustom' | 'createdAt' | 'updatedAt'>,
  userId: string,
  organizationId: string
): CustomTemplate => {
  return {
    ...template,
    id: `custom-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    isCustom: true,
    createdBy: userId,
    organizationId,
    createdAt: new Date(),
    updatedAt: new Date()
  };
};

// Template categories for UI organization
export const TEMPLATE_CATEGORIES = [
  {
    id: 'marketing',
    name: 'Marketing',
    description: 'Product launches, announcements, promotions',
    icon: '📢'
  },
  {
    id: 'social',
    name: 'Social Engagement',
    description: 'Community building, engagement, authentic content',
    icon: '💬'
  },
  {
    id: 'blog',
    name: 'Blog Content',
    description: 'Educational articles, guides, industry insights',
    icon: '✍️'
  },
  {
    id: 'email',
    name: 'Email Campaigns',
    description: 'Newsletters, welcome series, promotional emails',
    icon: '📧'
  },
  {
    id: 'custom',
    name: 'Custom Content',
    description: 'Events, announcements, specialized content',
    icon: '🎯'
  }
] as const;