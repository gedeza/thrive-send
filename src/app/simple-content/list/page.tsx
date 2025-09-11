'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RefreshCw } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

interface SimpleContent {
  id: string;
  title: string;
  type: string;
  status: string;
  createdAt: string;
  scheduledAt?: string;
  content: string;
}

export default function SimpleContentListPage() {
  const [content, setContent] = useState<SimpleContent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchContent = async () => {
    try {
      setIsLoading(true);
      console.log('📋 Fetching simple content...');

      const response = await fetch('/api/simple-content');
      if (!response.ok) {
        throw new Error('Failed to fetch content');
      }

      const data = await response.json();
      console.log('✅ Content fetched:', data.content?.length || 0, 'items');
      
      setContent(data.content || []);

    } catch (_error) {
      console.error("", _error);
      toast({
        title: 'Error',
        description: 'Failed to fetch content',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchContent();
  }, []);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">📋 Simple Content List</h1>
          <p className="text-muted-foreground">All your content in one simple view</p>
        </div>
        <Button onClick={fetchContent} disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-12">Loading content...</div>
      ) : content.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-muted-foreground mb-4">No content yet</p>
            <Button asChild>
              <a href="/simple-content">Create Your First Content</a>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {content.map((item) => (
            <Card key={item.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{item.title}</CardTitle>
                  <div className="flex gap-2">
                    <Badge variant="outline">{item.type}</Badge>
                    <Badge variant="secondary">{item.status}</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  {item.content.length > 150 
                    ? `${item.content.substring(0, 150)}...` 
                    : item.content
                  }
                </p>
                <div className="text-xs text-muted-foreground">
                  <p>Created: {new Date(item.createdAt).toLocaleString()}</p>
                  {item.scheduledAt && (
                    <p>Scheduled: {new Date(item.scheduledAt).toLocaleString()}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}