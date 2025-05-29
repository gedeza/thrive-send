"use client";

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { TemplateEditor } from '@/components/editor/TemplateEditor';
import { Loader2, Save, Eye, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useOrganization } from '@clerk/nextjs';
import { Label } from '@/components/ui/label';

interface Template {
  id: string;
  name: string;
  description: string;
  category: 'email' | 'social' | 'blog';
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  content: string;
  previewImage?: string;
  organizationId: string;
  createdAt: string;
  updatedAt: string;
}

export default function TemplateEditorPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const { organization } = useOrganization();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [template, setTemplate] = useState<Template | null>(null);
  const [activeTab, setActiveTab] = useState('edit');

  useEffect(() => {
    const fetchTemplate = async () => {
      const templateId = params?.id;
      if (!templateId || typeof templateId !== 'string') {
        router.push('/templates');
        return;
      }

      try {
        const response = await fetch(`/api/templates/${templateId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch template');
        }
        const data = await response.json();
        setTemplate(data);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load template",
          variant: "destructive",
        });
        router.push('/templates');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTemplate();
  }, [params?.id, router, toast]);

  const handleSave = async () => {
    if (!template) return;

    setIsSaving(true);
    try {
      const response = await fetch(`/api/templates/${template.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(template),
      });

      if (!response.ok) {
        throw new Error('Failed to save template');
      }

      toast({
        title: "Success",
        description: "Template saved successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save template",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!template) {
    return null;
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link href="/templates">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Edit Template</h1>
        </div>
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save
            </>
          )}
        </Button>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Template Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={template.name}
                  onChange={(e) => setTemplate({ ...template, name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={template.description}
                  onChange={(e) => setTemplate({ ...template, description: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="category">Category</Label>
                <Select
                  value={template.category}
                  onValueChange={(value: 'email' | 'social' | 'blog') => setTemplate({ ...template, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="social">Social Media</SelectItem>
                    <SelectItem value="blog">Blog Post</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Content</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList>
                <TabsTrigger value="edit">Edit</TabsTrigger>
                <TabsTrigger value="preview">Preview</TabsTrigger>
              </TabsList>
              <TabsContent value="edit">
                <TemplateEditor
                  value={template.content}
                  onChange={(value) => setTemplate({ ...template, content: value })}
                  type={template.category}
                  organizationId={organization?.id || ''}
                  placeholder="Start writing your template..."
                />
              </TabsContent>
              <TabsContent value="preview">
                <div
                  className="prose max-w-none p-4 border rounded-lg min-h-[300px]"
                  dangerouslySetInnerHTML={{ __html: template.content }}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
