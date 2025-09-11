'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/components/ui/use-toast';

export default function SimpleContentPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    type: 'SOCIAL' as const,
    scheduledAt: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      console.log('🚀 Submitting simple content:', formData);

      const response = await fetch('/api/simple-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.details || error.error || 'Failed to create content');
      }

      const result = await response.json();
      console.log('✅ Content created:', result);

      toast({
        title: 'Success!',
        description: 'Content created successfully',
      });

      // Reset form
      setFormData({
        title: '',
        content: '',
        type: 'SOCIAL',
        scheduledAt: ''
      });

    } catch (_error) {
      console.error("", _error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create content',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>🚀 Simple Content Creator</CardTitle>
          <p className="text-muted-foreground">Clean, simple content creation that just works</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium">Title</label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter content title..."
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium">Content</label>
              <Textarea
                value={formData.content}
                onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                placeholder="Write your content here..."
                className="min-h-32"
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium">Type</label>
              <Select value={formData.type} onValueChange={(value: unknown) => setFormData(prev => ({ ...prev, type: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SOCIAL">Social Media</SelectItem>
                  <SelectItem value="BLOG">Blog Post</SelectItem>
                  <SelectItem value="EMAIL">Email</SelectItem>
                  <SelectItem value="ARTICLE">Article</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Schedule Date (Optional)</label>
              <Input
                type="datetime-local"
                value={formData.scheduledAt}
                onChange={(e) => setFormData(prev => ({ ...prev, scheduledAt: e.target.value }))}
              />
            </div>

            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? 'Creating...' : 'Create Content'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>✅ What This Does</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>• Creates content in database</p>
          <p>• Automatically creates calendar event for social media & scheduled content</p>
          <p>• Shows in content library</p>
          <p>• Shows in calendar</p>
          <p>• No complex validation - just works!</p>
        </CardContent>
      </Card>
    </div>
  );
}