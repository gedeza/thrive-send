'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight, ArrowLeft, Edit, Copy, Eye, ExternalLink } from 'lucide-react';
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

export default function TemplatePreviewPage() {
  const params = useParams();
  const router = useRouter();
  const [template, setTemplate] = useState<CampaignTemplate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTemplate() {
      try {
        const response = await fetch(`/api/templates/${params.id}`);
        if (!response.ok) {
          throw new Error('Template not found');
        }
        const data = await response.json();
        setTemplate(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    if (params.id) {
      fetchTemplate();
    }
  }, [params.id]);

  const handleUseTemplate = () => {
    router.push(`/campaigns/new?template=${params.id}`);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="h-64 bg-gray-200 rounded mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (error || !template) {
    return (
      <div className="container mx-auto px-4 py-6 text-center">
        <h1 className="text-2xl font-bold mb-4">Template Not Found</h1>
        <p className="text-muted-foreground mb-6">{error || 'The requested template could not be found.'}</p>
        <Button asChild>
          <Link href="/campaigns/templates">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Templates
          </Link>
        </Button>
      </div>
    );
  }

  const authorName = template.user.firstName && template.user.lastName 
    ? `${template.user.firstName} ${template.user.lastName}`
    : 'Unknown Author';

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
        <Link href="/campaigns/templates" className="hover:text-foreground">
          Templates
        </Link>
        <ChevronRight className="h-4 w-4 mx-2" />
        <span className="text-foreground">Preview</span>
      </nav>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold">{template.name}</h1>
            <Badge variant={template.status === 'PUBLISHED' ? 'default' : 'secondary'}>
              {template.status}
            </Badge>
          </div>
          {template.description && (
            <p className="text-muted-foreground">{template.description}</p>
          )}
          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
            <span>Created by {authorName}</span>
            <span>•</span>
            <span>{template.organization.name}</span>
            <span>•</span>
            <span>{new Date(template.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href={`/templates/${template.id}`}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Link>
          </Button>
          <Button onClick={handleUseTemplate}>
            <Copy className="h-4 w-4 mr-2" />
            Use Template
          </Button>
        </div>
      </div>

      {/* Preview Content */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Template Content Preview */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Template Preview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg p-6 bg-white min-h-[400px]">
                {template.content ? (
                  <div 
                    className="prose max-w-none"
                    dangerouslySetInnerHTML={{ __html: template.content }}
                  />
                ) : (
                  <div className="flex items-center justify-center h-64 text-muted-foreground">
                    <div className="text-center">
                      <Eye className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No content preview available</p>
                      <p className="text-sm">Content will be added when creating a campaign from this template</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Template Information */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Template Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Status</label>
                <div className="mt-1">
                  <Badge variant={template.status === 'PUBLISHED' ? 'default' : 'secondary'}>
                    {template.status}
                  </Badge>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium">Organization</label>
                <p className="text-sm text-muted-foreground mt-1">{template.organization.name}</p>
              </div>

              <div>
                <label className="text-sm font-medium">Created By</label>
                <p className="text-sm text-muted-foreground mt-1">{authorName}</p>
              </div>

              <div>
                <label className="text-sm font-medium">Created Date</label>
                <p className="text-sm text-muted-foreground mt-1">
                  {new Date(template.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium">Last Updated</label>
                <p className="text-sm text-muted-foreground mt-1">
                  {new Date(template.updatedAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full" onClick={handleUseTemplate}>
                <Copy className="h-4 w-4 mr-2" />
                Create Campaign from Template
              </Button>
              
              <Button variant="outline" className="w-full" asChild>
                <Link href={`/templates/${template.id}`}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Template
                </Link>
              </Button>

              <Button variant="outline" className="w-full" asChild>
                <Link href="/campaigns/templates">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Templates
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}