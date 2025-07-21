"use client";

import { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, Copy, Edit, Trash, Loader2, Plus, Search, Filter, Sparkles, Mail, MessageSquare, FileText, Eye } from 'lucide-react';
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

  return (
    <div className="container mx-auto py-8">
      {/* Hero Section */}
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold mb-4">Content Templates</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Create, manage, and organize your content templates. Use AI-powered suggestions to enhance your content.
        </p>
      </div>

      {/* Search and Filter Bar */}
      <div className="mb-8 flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex-1 max-w-md w-full">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <div className="flex gap-4">
          <Select value={selectedType} onValueChange={setSelectedType}>
            <SelectTrigger className="w-[180px]">
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
            <SelectTrigger className="w-[180px]">
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

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* New Template Card */}
        <Link href="/templates/new">
          <Card className="h-full border-2 border-dashed hover:border-primary/50 transition-colors cursor-pointer">
            <CardContent className="flex flex-col items-center justify-center h-[300px] text-center p-6">
              <div className="rounded-full bg-primary/10 p-4 mb-4">
                <Plus className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Create New Template</h3>
              <p className="text-muted-foreground">
                Start from scratch or use AI-powered suggestions
              </p>
            </CardContent>
          </Card>
        </Link>

        {/* Template Cards */}
        {filteredTemplates.map((template) => (
          <Card key={template.id} className="h-full hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between mb-2">
                <Badge variant={template.status === 'published' ? 'default' : 'secondary'}>
                  {template.status}
                </Badge>
                <div className="flex items-center text-muted-foreground">
                  {getTypeIcon(template.type)}
                  <span className="ml-2 text-sm capitalize">{template.type}</span>
                </div>
              </div>
              <CardTitle className="line-clamp-1">{template.name}</CardTitle>
              <CardDescription className="line-clamp-2">{template.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>{template.category}</span>
                <span>Updated {new Date(template.updatedAt).toLocaleDateString()}</span>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between gap-2">
              <Button variant="outline" size="sm" asChild>
                <Link href={`/templates/${template.id}`}>
                  <Eye className="h-4 w-4 mr-2" />
                  View
                </Link>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Link href={`/templates/editor/${template.id}`}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Link>
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={(e) => handleDuplicate(template.id, template.name, e)}
                disabled={duplicatingId === template.id}
              >
                {duplicatingId === template.id ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredTemplates.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <div className="rounded-full bg-blue-50 p-4 w-16 h-16 mx-auto mb-4">
            <Sparkles className="h-8 w-8 text-blue-500" />
          </div>
          <h3 className="text-xl font-semibold mb-2">No templates found</h3>
          <p className="text-muted-foreground mb-4">
            {searchQuery || selectedType !== 'all' || selectedCategory !== 'all'
              ? "Try adjusting your search or filters to find what you're looking for"
              : "Ready to create your first template? Let's get started!"}
          </p>
          <Link href="/templates/new">
            <Button className="bg-blue-500 hover:bg-blue-600">
              <Plus className="h-4 w-4 mr-2" />
              Create Template
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
