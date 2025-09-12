'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronRight, LayoutTemplate, Plus, Eye, Copy, Star, Users, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface CampaignTemplate {
  id: string;
  name: string;
  description: string | null;
  content: string | null;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  createdAt: string;
  updatedAt: string;
  organizationId: string;
  userId: string;
  organization: {
    id: string;
    name: string;
  };
  user: {
    id: string;
    firstName: string | null;
    lastName: string | null;
  };
}

interface ShowcaseTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  type: string;
  rating: number;
  usageCount: number;
  lastUsed: string;
  image: string;
  isShowcase: true;
  status: 'PUBLISHED';
  author: string;
  organization: string;
}

// Beautiful sample campaigns for marketing showcase
const showcaseTemplates: ShowcaseTemplate[] = [
  {
    id: 'showcase-1',
    name: 'Product Launch Campaign',
    description: 'Complete template for launching new products with email sequences and social media posts',
    category: 'Product Launch',
    type: 'Multi-Channel',
    rating: 4.8,
    usageCount: 245,
    lastUsed: '2 days ago',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=200&fit=crop',
    isShowcase: true,
    status: 'PUBLISHED',
    author: 'Marketing Team',
    organization: 'ThriveSend'
  },
  {
    id: 'showcase-2',
    name: 'Welcome Email Series',
    description: 'Onboarding email sequence for new customers with personalized content and automated triggers',
    category: 'Onboarding',
    type: 'Email Automation',
    rating: 4.9,
    usageCount: 378,
    lastUsed: '1 day ago',
    image: 'https://images.unsplash.com/photo-1577563908411-5077b6dc7624?w=400&h=200&fit=crop',
    isShowcase: true,
    status: 'PUBLISHED',
    author: 'UX Team',
    organization: 'ThriveSend'
  },
  {
    id: 'showcase-3',
    name: 'Holiday Promotion',
    description: 'Seasonal marketing campaign template with festive designs and limited-time offers',
    category: 'Promotional',
    type: 'Multi-Channel',
    rating: 4.6,
    usageCount: 156,
    lastUsed: '1 week ago',
    image: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400&h=200&fit=crop',
    isShowcase: true,
    status: 'PUBLISHED',
    author: 'Creative Team',
    organization: 'ThriveSend'
  },
  {
    id: 'showcase-4',
    name: 'Customer Retention Flow',
    description: 'Re-engagement campaign to win back inactive customers with personalized offers',
    category: 'Retention',
    type: 'Email + SMS',
    rating: 4.7,
    usageCount: 203,
    lastUsed: '3 days ago',
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=200&fit=crop',
    isShowcase: true,
    status: 'PUBLISHED',
    author: 'CRM Team',
    organization: 'ThriveSend'
  },
  {
    id: 'showcase-5',
    name: 'Webinar Promotion',
    description: 'Complete campaign for promoting webinars including registration and follow-up sequences',
    category: 'Events',
    type: 'Multi-Channel',
    rating: 4.8,
    usageCount: 189,
    lastUsed: '5 days ago',
    image: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=400&h=200&fit=crop',
    isShowcase: true,
    status: 'PUBLISHED',
    author: 'Events Team',
    organization: 'ThriveSend'
  },
  {
    id: 'showcase-6',
    name: 'Social Media Contest',
    description: 'Viral campaign template for social media contests with user-generated content',
    category: 'Social Media',
    type: 'Social + Email',
    rating: 4.5,
    usageCount: 167,
    lastUsed: '4 days ago',
    image: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=400&h=200&fit=crop',
    isShowcase: true,
    status: 'PUBLISHED',
    author: 'Social Team',
    organization: 'ThriveSend'
  }
];

export default function CampaignTemplatesPage() {
  const [templates, setTemplates] = useState<CampaignTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showShowcaseTemplates, setShowShowcaseTemplates] = useState(true);

  useEffect(() => {
    async function fetchTemplates() {
      try {
        const response = await fetch('/api/campaign-templates');
        if (!response.ok) {
          throw new Error('Failed to fetch templates');
        }
        const data = await response.json();
        setTemplates(data);
        
        // Only show showcase templates if we have few or no real templates
        setShowShowcaseTemplates(data.length < 3);
      } catch (err: any) {
        setError(err.message);
        // Show showcase templates on error for demo purposes
        setShowShowcaseTemplates(true);
      } finally {
        setLoading(false);
      }
    }

    fetchTemplates();
  }, []);

  // Combine real templates with showcase templates for marketing
  const allTemplates = showShowcaseTemplates 
    ? [...showcaseTemplates, ...templates] 
    : templates;

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-1/4"></div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="space-y-4">
                <div className="h-48 bg-muted rounded"></div>
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-4 bg-muted rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-6 text-center">
        <h1 className="text-2xl font-bold mb-4">Error Loading Templates</h1>
        <p className="text-muted-foreground mb-6">{error}</p>
        <Button onClick={() => window.location.reload()}>
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Breadcrumbs */}
      <nav className="flex items-center text-sm text-muted-foreground">
        <Link href="/dashboard" className="hover:text-foreground">
          Dashboard
        </Link>
        <ChevronRight className="h-4 w-4 mx-2" />
        <Link href="/campaigns" className="hover:text-foreground">
          Campaigns
        </Link>
        <ChevronRight className="h-4 w-4 mx-2" />
        <span className="text-foreground">Templates</span>
      </nav>
      
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <LayoutTemplate className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Campaign Templates</h1>
        </div>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Browse our collection of professional campaign templates to accelerate your marketing efforts.
        </p>
        
        {/* Showcase Info Banner */}
        {showShowcaseTemplates && (
          <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 border border-purple-200 dark:border-purple-800 rounded-lg max-w-4xl mx-auto">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Star className="h-4 w-4 text-accent" />
              <span className="font-semibold text-accent">Marketing Showcase Mode</span>
            </div>
            <p className="text-sm text-accent">
              You're viewing beautiful sample templates perfect for demos and marketing materials. 
              These showcase templates display professional designs, ratings, and usage stats to demonstrate platform capabilities.
            </p>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Showcase Toggle */}
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={showShowcaseTemplates}
              onChange={(e) => setShowShowcaseTemplates(e.target.checked)}
              className="rounded border-muted text-primary focus:ring-primary"
            />
            <span className="text-muted-foreground">Show showcase templates</span>
          </label>
          
          {showShowcaseTemplates && (
            <Badge variant="outline" className="text-xs bg-accent/10 text-accent border-accent/20">
              Marketing Demo Mode
            </Badge>
          )}
        </div>
        
        <Button asChild>
          <Link href="/templates/new">
            <Plus className="h-4 w-4 mr-2" />
            Create Template
          </Link>
        </Button>
      </div>

      {/* Templates Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {allTemplates.map((template) => {
          // Handle both showcase and real templates
          const isShowcase = 'isShowcase' in template;
          
          let authorName, orgName, createdDate, description;
          
          if (isShowcase) {
            const showcaseTemplate = template as ShowcaseTemplate;
            authorName = showcaseTemplate.author;
            orgName = showcaseTemplate.organization;
            createdDate = showcaseTemplate.lastUsed;
            description = showcaseTemplate.description;
          } else {
            const realTemplate = template as CampaignTemplate;
            authorName = realTemplate.user.firstName && realTemplate.user.lastName 
              ? `${realTemplate.user.firstName} ${realTemplate.user.lastName}`
              : 'Unknown Author';
            orgName = realTemplate.organization.name;
            createdDate = new Date(realTemplate.createdAt).toLocaleDateString();
            description = realTemplate.description || 'No description available for this template.';
          }

          return (
            <Card key={template.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              {/* Template Preview/Image */}
              <div className="aspect-video w-full bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-950 dark:to-indigo-900 flex items-center justify-center">
                {isShowcase ? (
                  <img
                    src={template.image}
                    alt={template.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <LayoutTemplate className="h-12 w-12 text-primary opacity-60" />
                )}
              </div>
              
              {/* Template Content */}
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-lg">{template.name}</CardTitle>
                      {isShowcase && (
                        <Badge variant="outline" className="text-xs bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0">
                          Showcase
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge 
                        variant={template.status === 'PUBLISHED' ? 'default' : 'secondary'} 
                        className="text-xs"
                      >
                        {template.status}
                      </Badge>
                      {isShowcase ? (
                        <>
                          <Badge variant="outline" className="text-xs">
                            {template.category}
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            {template.type}
                          </Badge>
                        </>
                      ) : (
                        <Badge variant="outline" className="text-xs">
                          {orgName}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                  {description}
                </p>
                
                {/* Template Details */}
                <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center">
                      {isShowcase ? (
                        <>
                          <Star className="h-3 w-3 fill-warning text-warning mr-1" />
                          <span>{template.rating}</span>
                        </>
                      ) : (
                        <>
                          <Users className="h-3 w-3 mr-1" />
                          <span>{authorName}</span>
                        </>
                      )}
                    </div>
                    {isShowcase && (
                      <div className="flex items-center">
                        <Users className="h-3 w-3 mr-1" />
                        <span>{template.usageCount}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center">
                    <Calendar className="h-3 w-3 mr-1" />
                    <span>{createdDate}</span>
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1" asChild>
                    <Link href={isShowcase ? '#' : `/templates/${template.id}/preview`}>
                      <Eye className="h-4 w-4 mr-1" />
                      Preview
                    </Link>
                  </Button>
                  <Button 
                    size="sm" 
                    className="flex-1" 
                    asChild={!isShowcase}
                    disabled={isShowcase}
                  >
                    {isShowcase ? (
                      <span className="flex items-center">
                        <Copy className="h-4 w-4 mr-1" />
                        Demo Template
                      </span>
                    ) : (
                      <Link href={`/campaigns/new?template=${template.id}`}>
                        <Copy className="h-4 w-4 mr-1" />
                        Use Template
                      </Link>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Empty State Message if no templates */}
      {allTemplates.length === 0 && (
        <div className="text-center py-12">
          <LayoutTemplate className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No templates found</h3>
          <p className="text-muted-foreground mb-4">
            Create your first campaign template to get started.
          </p>
          <Button asChild>
            <Link href="/templates/new">
              <Plus className="h-4 w-4 mr-2" />
              Create Template
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
}