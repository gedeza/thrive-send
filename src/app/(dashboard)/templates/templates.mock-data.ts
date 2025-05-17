export type Template = {
  id: string;
  name: string;
  description: string;
  type: 'email' | 'social' | 'blog';
  status: 'draft' | 'published' | 'archived';
  createdAt: string;
  updatedAt: string;
  createdBy: string;
};

export const templates: Template[] = [
  {
    id: '1',
    name: 'Welcome Email',
    description: 'A warm welcome email for new subscribers',
    type: 'email',
    status: 'published',
    createdAt: '2024-03-15T10:00:00Z',
    updatedAt: '2024-03-15T10:00:00Z',
    createdBy: 'John Doe'
  },
  {
    id: '2',
    name: 'Product Launch',
    description: 'Announcement template for new product launches',
    type: 'social',
    status: 'draft',
    createdAt: '2024-03-14T15:30:00Z',
    updatedAt: '2024-03-14T15:30:00Z',
    createdBy: 'Jane Smith'
  },
  {
    id: '3',
    name: 'Weekly Newsletter',
    description: 'Template for weekly company updates',
    type: 'email',
    status: 'published',
    createdAt: '2024-03-13T09:15:00Z',
    updatedAt: '2024-03-13T09:15:00Z',
    createdBy: 'Mike Johnson'
  },
  {
    id: '4',
    name: 'Blog Post Template',
    description: 'Standard template for blog posts',
    type: 'blog',
    status: 'published',
    createdAt: '2024-03-12T14:20:00Z',
    updatedAt: '2024-03-12T14:20:00Z',
    createdBy: 'Sarah Wilson'
  },
  {
    id: '5',
    name: 'Holiday Promotion',
    description: 'Special offers for holiday season',
    type: 'social',
    status: 'archived',
    createdAt: '2024-03-11T11:45:00Z',
    updatedAt: '2024-03-11T11:45:00Z',
    createdBy: 'David Brown'
  }
]; 