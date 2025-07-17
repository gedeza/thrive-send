"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronRight, Edit, Calendar, Clock, Tag, Share, ArrowLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/use-toast";
import { format, formatDistanceToNow } from "date-fns";
import { cn, truncateText } from "@/lib/utils";
import { ContentData } from "@/lib/api/content-service";

// Content type configurations (same as in main page)
const CONTENT_TYPE_CONFIG = {
  blog: { label: 'Blog Post', color: 'bg-blue-100 text-blue-800 border-blue-200' },
  article: { label: 'Article', color: 'bg-green-100 text-green-800 border-green-200' },
  social: { label: 'Social Media', color: 'bg-purple-100 text-purple-800 border-purple-200' },
  email: { label: 'Email Campaign', color: 'bg-orange-100 text-orange-800 border-orange-200' },
} as const;

// Status configurations
const STATUS_CONFIG = {
  draft: { label: 'Draft', color: 'bg-gray-100 text-gray-800 border-gray-200', icon: Edit },
  published: { label: 'Published', color: 'bg-green-100 text-green-800 border-green-200', icon: Share },
  scheduled: { label: 'Scheduled', color: 'bg-blue-100 text-blue-800 border-blue-200', icon: Calendar },
} as const;

export default function ContentViewPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [content, setContent] = useState<ContentData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await fetch(`/api/content/${params.id}`, {
          credentials: 'include',
        });
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Content not found');
          } else if (response.status === 403) {
            throw new Error('You do not have permission to view this content');
          } else {
            throw new Error('Failed to load content');
          }
        }
        
        const data = await response.json();
        setContent(data);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
        setError(errorMessage);
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (params.id) {
      fetchContent();
    }
  }, [params.id]);

  const handleEdit = () => {
    router.push(`/content/edit/${params.id}`);
  };

  const handleBack = () => {
    router.push('/content');
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 space-y-8">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <Skeleton className="h-6 w-48" />
        </div>
        
        <div className="space-y-4">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>

        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
            <div className="flex gap-2">
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-6 w-24" />
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !content) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center py-12">
          <div className="mx-auto max-w-md">
            <h3 className="text-lg font-semibold mb-2">Content Not Found</h3>
            <p className="text-muted-foreground mb-6">
              {error || 'The content you are looking for could not be found.'}
            </p>
            <div className="flex gap-2 justify-center">
              <Button variant="outline" onClick={handleBack}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Content
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const typeConfig = CONTENT_TYPE_CONFIG[content.type.toLowerCase() as keyof typeof CONTENT_TYPE_CONFIG];
  const statusConfig = STATUS_CONFIG[content.status.toLowerCase() as keyof typeof STATUS_CONFIG];

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Navigation */}
      <div className="flex items-center justify-between">
        <nav className="flex items-center text-sm text-muted-foreground">
          <Link href="/dashboard" className="hover:text-foreground transition-colors">
            Dashboard
          </Link>
          <ChevronRight className="h-4 w-4 mx-2" />
          <Link href="/content" className="hover:text-foreground transition-colors">
            Content
          </Link>
          <ChevronRight className="h-4 w-4 mx-2" />
          <span className="text-foreground">View Content</span>
        </nav>
        
        <Button variant="outline" onClick={handleBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
      </div>
      
      {/* Page Header */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">{content.title}</h1>
            <div className="flex flex-wrap items-center gap-2">
              {typeConfig && (
                <Badge variant="outline" className={cn("border", typeConfig.color)}>
                  {typeConfig.label}
                </Badge>
              )}
              {statusConfig && (
                <Badge variant="outline" className={cn("border", statusConfig.color)}>
                  <statusConfig.icon className="h-3 w-3 mr-1" />
                  {statusConfig.label}
                </Badge>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button onClick={handleEdit}>
              <Edit className="h-4 w-4 mr-2" />
              Edit Content
            </Button>
          </div>
        </div>

        {/* Metadata */}
        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>
              Created {formatDistanceToNow(new Date(content.createdAt!), { addSuffix: true })}
            </span>
          </div>
          
          {content.scheduledAt && (
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>
                Scheduled for {format(new Date(content.scheduledAt), 'MMM d, yyyy h:mm a')}
              </span>
            </div>
          )}
          
          {content.publishedAt && (
            <div className="flex items-center gap-1">
              <Share className="h-4 w-4" />
              <span>
                Published {formatDistanceToNow(new Date(content.publishedAt), { addSuffix: true })}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Content</CardTitle>
            </CardHeader>
            <CardContent>
              {content.excerpt && (
                <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Excerpt</h4>
                  <p className="text-blue-800">{content.excerpt}</p>
                </div>
              )}
              
              <div className="prose prose-gray max-w-none">
                {content.content.split('\n').map((paragraph, index) => (
                  <p key={index} className="mb-4 text-gray-700 leading-relaxed">
                    {paragraph}
                  </p>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Tags */}
          {content.tags && content.tags.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Tag className="h-4 w-4" />
                  Tags
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {content.tags.map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Media */}
          {content.media && (
            <Card>
              <CardHeader>
                <CardTitle>Media</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Array.isArray(content.media) ? (
                    content.media.map((mediaItem, index) => (
                      <div key={index} className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600">Media {index + 1}</p>
                      </div>
                    ))
                  ) : (
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600">Media attached</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" size="sm" onClick={handleEdit} className="w-full justify-start">
                <Edit className="h-4 w-4 mr-2" />
                Edit Content
              </Button>
              
              <Button variant="outline" size="sm" className="w-full justify-start" asChild>
                <Link href="/content/new">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Create Similar
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}