'use client';

import { useState, useMemo, useEffect, useCallback } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Search, RefreshCw, FileText, Eye, Clock } from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { listContent, ContentData } from '@/lib/api/content-service';
import { toast } from '@/components/ui/use-toast';
import { cn, formatDate, truncateText } from '@/lib/utils';

function SimpleContentLibraryPage() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [isClient, setIsClient] = useState(false);

  // Simple query to get content
  const {
    data: contentData,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['content', { page: 1, limit: 20 }],
    queryFn: () => listContent({ page: '1', limit: '20', sortBy: 'createdAt', sortOrder: 'desc' }),
    staleTime: 2 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
  });

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleRefresh = async () => {
    try {
      await refetch();
      toast({
        title: "Success",
        description: "Content list refreshed successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to refresh content list",
        variant: "destructive",
      });
    }
  };

  if (!isClient) {
    return <div>Loading...</div>;
  }

  if (error) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-2xl font-bold text-destructive">Error Loading Content</h2>
        <p className="text-muted-foreground mt-2">Please try again later</p>
        <Button onClick={() => refetch()} className="mt-4">
          <RefreshCw className="h-4 w-4 mr-2" />
          Retry
        </Button>
      </div>
    );
  }

  const content = contentData?.content || [];

  return (
    <div className="space-y-4 p-4">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-4">
          <FileText className="h-8 w-8 text-primary" />
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            Content Library
          </h1>
        </div>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Create, manage, and schedule your content across all channels and platforms.
        </p>
      </div>

      {/* Action Bar */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search content..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isLoading}
          >
            <RefreshCw className={cn("mr-2 h-4 w-4", isLoading && "animate-spin")} />
            Refresh
          </Button>
          
          <Button asChild>
            <Link href="/content/new">
              <Plus className="mr-2 h-4 w-4" />
              New Content
            </Link>
          </Button>
        </div>
      </div>

      {/* Content Stats */}
      <div className="grid gap-4 md:grid-cols-3 mb-6">
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-primary mb-2">{content.length}</div>
            <div className="text-sm text-muted-foreground">Total Content</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-green-600 mb-2">
              {content.filter(item => item.status === 'PUBLISHED').length}
            </div>
            <div className="text-sm text-muted-foreground">Published</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-yellow-600 mb-2">
              {content.filter(item => item.status === 'DRAFT').length}
            </div>
            <div className="text-sm text-muted-foreground">Drafts</div>
          </CardContent>
        </Card>
      </div>

      {/* Content List */}
      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="space-y-3">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <div className="flex gap-2">
                    <Skeleton className="h-5 w-16" />
                    <Skeleton className="h-5 w-20" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : content.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <FileText className="h-16 w-16 mx-auto mb-6 text-muted-foreground opacity-50" />
            <h3 className="text-xl font-semibold mb-2">No Content Yet</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Get started by creating your first piece of content.
            </p>
            <Button asChild>
              <Link href="/content/new">
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Content
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {content
            .filter((item: ContentData) => 
              !searchQuery || 
              item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
              item.type.toLowerCase().includes(searchQuery.toLowerCase())
            )
            .map((item: ContentData) => (
              <Card key={item.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold">{item.title}</h3>
                        <Badge variant="outline" className="text-xs">
                          {item.type}
                        </Badge>
                        <Badge 
                          variant="outline" 
                          className={cn(
                            "text-xs",
                            item.status === 'PUBLISHED' && "bg-green-50 text-green-700 border-green-200",
                            item.status === 'DRAFT' && "bg-yellow-50 text-yellow-700 border-yellow-200"
                          )}
                        >
                          {item.status}
                        </Badge>
                      </div>
                      
                      {item.excerpt && (
                        <p className="text-muted-foreground mb-3 line-clamp-2">
                          {truncateText(item.excerpt, 150)}
                        </p>
                      )}
                      
                      {item.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {item.tags.slice(0, 3).map((tag, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                          {item.tags.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{item.tags.length - 3} more
                            </Badge>
                          )}
                        </div>
                      )}
                      
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Created {formatDate(item.createdAt)}
                        </div>
                        {item.scheduledAt && (
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            Scheduled {formatDate(item.scheduledAt)}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/content/${item.id}`}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
        </div>
      )}

      {/* Debug Info */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="text-sm">Debug Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-xs text-muted-foreground space-y-1">
            <p>API Status: {error ? 'Error' : isLoading ? 'Loading' : 'Success'}</p>
            <p>Content Count: {content.length}</p>
            <p>Page Loading: {isClient ? 'Complete' : 'Loading'}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default SimpleContentLibraryPage;