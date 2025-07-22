"use client";

import { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, Copy, Edit, Trash, Loader2, Plus, Search, Filter, Sparkles, Mail, MessageSquare, FileText, Eye, Bookmark, FileTemplate, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { useOrganization } from "@clerk/nextjs";
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Template {
  id: string;
  name: string;
  description: string;
  type: 'email' | 'social' | 'blog';
  category: string;
  status: 'draft' | 'published';
  createdAt: string;
  updatedAt: string;
}

const statusBadgeMap: Record<string, string> = {
  PUBLISHED: "bg-green-100 text-green-800",
  DRAFT: "bg-yellow-100 text-yellow-900",
  ARCHIVED: "bg-gray-100 text-gray-600"
};

const categoryBadgeMap: Record<string, string> = {
  email: "bg-blue-100 text-blue-800",
  social: "bg-indigo-100 text-indigo-800",
  blog: "bg-orange-100 text-orange-800"
};

export default function TemplatesPage() {
  const { organization } = useOrganization();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [duplicatingId, setDuplicatingId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTemplates() {
      try {
        setIsLoading(true);
        const response = await fetch("/api/templates");
        
        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }
        
        const data = await response.json();
        setTemplates(data);
      } catch (err) {
        console.error("Failed to fetch templates:", err);
        toast({
          title: "Unable to load templates",
          description: "Don't worry! You can still create new templates while we fix this.",
          variant: "default",
          className: "bg-blue-50 border-blue-200",
        });
      } finally {
        setIsLoading(false);
      }
    }

    fetchTemplates();
  }, [toast]);

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === 'all' || template.type === selectedType;
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    return matchesSearch && matchesType && matchesCategory;
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'email':
        return <Mail className="h-4 w-4" />;
      case 'social':
        return <MessageSquare className="h-4 w-4" />;
      case 'blog':
        return <FileText className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const handleDuplicate = async (templateId: string, templateName: string, e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigation to template detail
    
    try {
      setDuplicatingId(templateId);

      const response = await fetch(`/api/templates/${templateId}/duplicate`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to duplicate template');
      }

      const duplicatedTemplate = await response.json();

      toast({
        title: "Success",
        description: `Template "${templateName}" duplicated successfully`,
      });

      // Refresh templates list
      const templatesResponse = await fetch("/api/templates");
      if (templatesResponse.ok) {
        const updatedTemplates = await templatesResponse.json();
        setTemplates(updatedTemplates);
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to duplicate template",
        variant: "destructive",
      });
    } finally {
      setDuplicatingId(null);
    }
  };

  const templateStats = useMemo(() => {
    const published = templates.filter(t => t.status === 'published').length;
    const draft = templates.filter(t => t.status === 'draft').length;
    const emailTemplates = templates.filter(t => t.type === 'email').length;
    const socialTemplates = templates.filter(t => t.type === 'social').length;
    
    return {
      total: templates.length,
      published,
      draft,
      email: emailTemplates,
      social: socialTemplates,
      blog: templates.filter(t => t.type === 'blog').length
    };
  }, [templates]);

  return (
    <div className="space-y-4 p-4">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-4">
          <FileTemplate className="h-8 w-8 text-primary" />
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            Templates
          </h1>
        </div>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Create, manage, and organize your content templates to accelerate your content creation.
        </p>
      </div>

      <div className="flex items-center justify-end gap-2 mb-8">
        <div className="flex items-center gap-2">
          <Button asChild>
            <Link href="/templates/new">
              <Plus className="mr-2 h-4 w-4" />
              New Template
            </Link>
          </Button>
        </div>
      </div>

      {/* Template Statistics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Total Templates</p>
                <p className="text-3xl font-bold">{templateStats.total}</p>
              </div>
              <div className="p-3 bg-primary/10 rounded-full">
                <FileTemplate className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Published</p>
                <p className="text-3xl font-bold text-green-600">{templateStats.published}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <Eye className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Draft</p>
                <p className="text-3xl font-bold text-yellow-600">{templateStats.draft}</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-full">
                <Edit className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Email Templates</p>
                <p className="text-3xl font-bold text-blue-600">{templateStats.email}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Mail className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter Bar */}
      <Card>
        <CardContent className="p-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex items-center gap-2 flex-1">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search templates by name or description..."
                className="flex-1 h-8"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="w-24 h-8 text-xs">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="social">Social</SelectItem>
                  <SelectItem value="blog">Blog</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-24 h-8 text-xs">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="marketing">Marketing</SelectItem>
                  <SelectItem value="sales">Sales</SelectItem>
                  <SelectItem value="support">Support</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Templates Grid */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {/* New Template Card */}
        <Link href="/templates/new">
          <Card className="h-full border-2 border-dashed hover:border-primary/50 transition-colors cursor-pointer border-l-4" style={{ borderLeftColor: '#e5e7eb' }}>
            <CardContent className="flex flex-col items-center justify-center h-[200px] text-center p-4">
              <div className="rounded-full bg-primary/10 p-3 mb-3">
                <Plus className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Create New Template</h3>
              <p className="text-sm text-muted-foreground">
                Start from scratch or use AI suggestions
              </p>
            </CardContent>
          </Card>
        </Link>

        {/* Template Cards */}
        {filteredTemplates.map((template) => (
          <Card key={template.id} className="hover:shadow-lg transition-all duration-200 border-l-4" style={{ 
            borderLeftColor: template.status === 'published' ? '#22c55e' : 
                           template.status === 'draft' ? '#f59e0b' : '#6b7280'
          }}>
            <CardHeader className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Badge 
                  variant={template.status === 'published' ? 'default' : 'secondary'}
                  className="text-xs"
                >
                  {template.status}
                </Badge>
                <div className="flex items-center text-muted-foreground">
                  {getTypeIcon(template.type)}
                  <span className="ml-1 text-xs capitalize">{template.type}</span>
                </div>
              </div>
              <CardTitle className="text-sm font-semibold line-clamp-1">{template.name}</CardTitle>
              <CardDescription className="text-xs line-clamp-2">{template.description}</CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-0 flex-grow">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{template.category}</span>
                <span>{new Date(template.updatedAt).toLocaleDateString()}</span>
              </div>
            </CardContent>
            <CardFooter className="flex gap-1 p-4 pt-2">
              <Button variant="ghost" size="sm" asChild className="h-7 px-2 text-xs flex-1">
                <Link href={`/templates/${template.id}`}>
                  <Eye className="h-3 w-3 mr-1" />
                  View
                </Link>
              </Button>
              <Button variant="ghost" size="sm" asChild className="h-7 px-2 text-xs flex-1">
                <Link href={`/templates/editor/${template.id}`}>
                  <Edit className="h-3 w-3 mr-1" />
                  Edit
                </Link>
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={(e) => handleDuplicate(template.id, template.name, e)}
                disabled={duplicatingId === template.id}
                className="h-7 px-2 text-xs"
              >
                {duplicatingId === template.id ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <Copy className="h-3 w-3" />
                )}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredTemplates.length === 0 && !isLoading && (
        <Card className="border-dashed">
          <CardContent className="p-8 text-center">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-muted rounded-full">
                <FileTemplate className="h-8 w-8 text-muted-foreground" />
              </div>
            </div>
            <h3 className="text-lg font-semibold mb-2">No templates found</h3>
            <p className="text-muted-foreground mb-4 max-w-md mx-auto">
              {searchQuery || selectedType !== 'all' || selectedCategory !== 'all'
                ? "No templates match your current search criteria. Try adjusting your filters or search terms."
                : "Get started by creating your first template to accelerate your content creation."}
            </p>
            {templates.length === 0 ? (
              <Button asChild>
                <Link href="/templates/new">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Template
                </Link>
              </Button>
            ) : (
              <div className="flex flex-col sm:flex-row gap-2 justify-center">
                <Button variant="outline" onClick={() => {
                  setSearchQuery('');
                  setSelectedType('all');
                  setSelectedCategory('all');
                }}>
                  Clear Filters
                </Button>
                <Button asChild>
                  <Link href="/templates/new">
                    <Plus className="h-4 w-4 mr-2" />
                    Add New Template
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
