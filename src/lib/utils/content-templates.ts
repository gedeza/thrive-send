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

// Template application function
export const applyTemplateToEvent = (
  template: ContentTemplate,
  overrides: Partial<CalendarEvent> = {}
): Partial<CalendarEvent> => {
  const now = new Date();
  const defaultDate = overrides.date || now.toISOString().split('T')[0];
  
  return {
    title: template.defaultTitle,
    description: template.defaultDescription,
    type: template.type,
    date: defaultDate,
    duration: template.defaultDuration,
    status: 'draft',
    socialMediaContent: template.type === 'social' ? {
      platforms: template.suggestedPlatforms || [],
      crossPost: true,
      mediaUrls: [],
      platformSpecificContent: {}
    } : undefined,
    ...overrides
  };
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