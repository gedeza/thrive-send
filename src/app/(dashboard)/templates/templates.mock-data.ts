export type TemplateCategory = "Email" | "Social Media" | "Form" | "Blog" | "Notification";
export type TemplateStatus = "draft" | "published" | "archived";
export interface Template {
  id: string;
  name: string;
  category: TemplateCategory;
  lastUpdated: string; // ISO date
  status: TemplateStatus;
  author: string;
  description?: string;
}

export const templates: Template[] = [
  {
    id: '1',
    name: 'Welcome Email',
    category: 'Email',
    lastUpdated: '2023-10-15',
    status: 'published',
    author: 'Alice Johnson',
    description: 'Friendly welcome for new subscribers.'
  },
  {
    id: '2',
    name: 'Weekly Newsletter',
    category: 'Email',
    lastUpdated: '2023-11-02',
    status: 'draft',
    author: 'Dana West',
    description: 'Template for sending weekly updates.'
  },
  {
    id: '3',
    name: 'Product Announcement',
    category: 'Social Media',
    lastUpdated: '2023-11-10',
    status: 'published',
    author: 'Chris Moore',
    description: 'Share new product launches on all socials.'
  },
  {
    id: '4',
    name: 'Customer Survey',
    category: 'Form',
    lastUpdated: '2023-10-28',
    status: 'archived',
    author: 'Sarah Lee',
    description: 'Quick survey to gather feedback from users.'
  }
];