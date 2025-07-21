"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { 
  ArrowLeft, 
  Edit, 
  Copy, 
  Trash2, 
  Loader2,
  AlertCircle,
  Eye,
  FileText,
  Calendar,
  User,
  Building2
} from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface Template {
  id: string;
  name: string;
  description: string;
  category: 'email' | 'social' | 'blog';
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  content: string;
  createdAt: string;
  updatedAt: string;
  authorId: string;
  organizationId: string;
}

const STATUS_COLORS = {
  DRAFT: 'bg-yellow-100 text-yellow-800',
  PUBLISHED: 'bg-green-100 text-green-800',
  ARCHIVED: 'bg-gray-100 text-gray-800',
};

const CATEGORY_COLORS = {
  email: 'bg-blue-100 text-blue-800',
  social: 'bg-indigo-100 text-indigo-800',
  blog: 'bg-orange-100 text-orange-800',
};

export default function TemplateDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [template, setTemplate] = useState<Template | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDuplicating, setIsDuplicating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const templateId = params?.id as string;

  useEffect(() => {
    const fetchTemplate = async () => {
      if (!templateId) return;

      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch(`/api/templates/${templateId}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            setError('Template not found');
          } else {
            throw new Error('Failed to fetch template');
          }
          return;
        }

        const data = await response.json();
        setTemplate(data);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to load template';
        setError(message);
        toast({
          title: "Error",
          description: message,
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchTemplate();
  }, [templateId, toast]);

  const handleDelete = async () => {
    if (!template) return;

    try {
      setIsDeleting(true);

      const response = await fetch(`/api/templates/${template.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete template');
      }

      toast({
        title: "Success",
        description: "Template deleted successfully",
      });

      router.push('/templates');
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to delete template",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDuplicate = async () => {
    if (!template) return;

    try {
      setIsDuplicating(true);

      const response = await fetch(`/api/templates/${template.id}/duplicate`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to duplicate template');
      }

      const duplicatedTemplate = await response.json();

      toast({
        title: "Success",
        description: "Template duplicated successfully",
      });

      router.push(`/templates/editor/${duplicatedTemplate.id}`);
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to duplicate template",
        variant: "destructive",
      });
    } finally {
      setIsDuplicating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-destructive" />
                Error
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">{error}</p>
              <div className="flex gap-2">
                <Button onClick={() => router.push('/templates')} variant="outline">
                  Back to Templates
                </Button>
                <Button onClick={() => window.location.reload()}>
                  Try Again
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!template) {
    return null;
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/templates">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{template.name}</h1>
            <p className="text-muted-foreground">Template Details</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleDuplicate} disabled={isDuplicating}>
            {isDuplicating ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Copy className="h-4 w-4 mr-2" />
            )}
            Duplicate
          </Button>
          <Button variant="outline" asChild>
            <Link href={`/templates/editor/${template.id}`}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Link>
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Template</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete "{template.name}"? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    'Delete Template'
                  )}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Main Content */}
        <div className="md:col-span-2 space-y-6">
          {/* Template Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-medium mb-2">Description</h3>
                <p className="text-muted-foreground">
                  {template.description || 'No description provided'}
                </p>
              </div>
              
              <Separator />
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-sm mb-1">Status</h4>
                  <Badge 
                    variant="secondary" 
                    className={STATUS_COLORS[template.status]}
                  >
                    {template.status}
                  </Badge>
                </div>
                <div>
                  <h4 className="font-medium text-sm mb-1">Category</h4>
                  <Badge 
                    variant="secondary" 
                    className={CATEGORY_COLORS[template.category]}
                  >
                    {template.category}
                  </Badge>
                </div>
                <div>
                  <h4 className="font-medium text-sm mb-1">Created</h4>
                  <p className="text-sm text-muted-foreground">
                    {formatDistanceToNow(new Date(template.createdAt))} ago
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-sm mb-1">Last Updated</h4>
                  <p className="text-sm text-muted-foreground">
                    {formatDistanceToNow(new Date(template.updatedAt))} ago
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Template Content */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Content
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="preview" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="preview" className="flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    Preview
                  </TabsTrigger>
                  <TabsTrigger value="raw" className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Raw HTML
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="preview" className="mt-4">
                  <div className="border rounded-lg p-4 min-h-[300px] max-h-[500px] overflow-y-auto">
                    {template.content ? (
                      <div 
                        className="prose max-w-none"
                        dangerouslySetInnerHTML={{ __html: template.content }}
                      />
                    ) : (
                      <p className="text-muted-foreground text-center py-8">
                        No content available
                      </p>
                    )}
                  </div>
                </TabsContent>
                <TabsContent value="raw" className="mt-4">
                  <div className="border rounded-lg p-4 bg-muted/30 min-h-[300px] max-h-[500px] overflow-auto">
                    <pre className="text-sm whitespace-pre-wrap break-words">
                      {template.content || 'No content available'}
                    </pre>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Info */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="font-medium text-sm">Organization</p>
                  <p className="text-sm text-muted-foreground">{template.organizationId}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <User className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="font-medium text-sm">Author</p>
                  <p className="text-sm text-muted-foreground">{template.authorId}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="font-medium text-sm">Created</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(template.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full" asChild>
                <Link href={`/templates/editor/${template.id}`}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Template
                </Link>
              </Button>
              <Button 
                variant="outline" 
                className="w-full" 
                onClick={handleDuplicate}
                disabled={isDuplicating}
              >
                {isDuplicating ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Copy className="h-4 w-4 mr-2" />
                )}
                Duplicate Template
              </Button>
              <Button variant="outline" className="w-full" asChild>
                <Link href={`/content/new?template=${template.id}`}>
                  <FileText className="h-4 w-4 mr-2" />
                  Use in Content
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}