"use client";

import { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from "@/components/ui/input";
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from "@/components/ui/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Target, 
  Search, 
  Filter, 
  Mail, 
  MessageSquare, 
  FileText, 
  Eye, 
  Plus,
  RefreshCw,
  AlertCircle,
  Copy,
  Loader2,
  Sparkles,
  TrendingUp,
  Edit
} from "lucide-react";
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  content?: string;
  createdAt: string;
  lastUpdated: string;
  author?: {
    id: string;
    firstName: string;
    lastName: string;
  };
  usageCount?: number;
  lastUsedByUser?: string;
  engagementRate?: number;
  aiRecommended?: boolean;
  performanceScore?: number;
}

const statusBadgeMap: Record<string, { className: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  PUBLISHED: { className: "bg-green-100 text-green-800", variant: "default" },
  DRAFT: { className: "bg-yellow-100 text-yellow-900", variant: "secondary" },
  ARCHIVED: { className: "bg-gray-100 text-gray-600", variant: "outline" }
};

const categoryBadgeMap: Record<string, string> = {
  email: "bg-blue-100 text-blue-800",
  social: "bg-indigo-100 text-indigo-800",
  blog: "bg-orange-100 text-orange-800",
  marketing: "bg-purple-100 text-purple-800",
  sales: "bg-emerald-100 text-emerald-800",
  campaign: "bg-pink-100 text-pink-800"
};

function TemplateStatsLoading() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
      {[...Array(4)].map((_, index) => (
        <Card key={index} className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-16" />
              </div>
              <Skeleton className="h-12 w-12 rounded-full" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default function CampaignTemplatesPage() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [duplicatingId, setDuplicatingId] = useState<string | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const fetchTemplates = async () => {
    try {
      setIsLoading(true);
      setFetchError(null);
      
      const response = await fetch("/api/templates?enhanced=true&context=campaign&limit=100");
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || `API Error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      if (!Array.isArray(data)) {
        throw new Error('Invalid response format: expected array of templates');
      }
      
      setTemplates(data);
      setFetchError(null);
    } catch (err) {
      const error = err as Error;
      console.error("Failed to fetch campaign templates:", error);
      setFetchError(error.message);
      
      toast({
        title: "Failed to load templates",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const filteredTemplates = useMemo(() => {
    return templates.filter(template => {
      const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           template.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [templates, searchQuery, selectedCategory]);

  const getTypeIcon = (category: string) => {
    switch (category) {
      case 'email':
        return <Mail className="h-4 w-4" />;
      case 'social':
        return <MessageSquare className="h-4 w-4" />;
      case 'blog':
        return <FileText className="h-4 w-4" />;
      default:
        return <Target className="h-4 w-4" />;
    }
  };

  const handleDuplicate = async (templateId: string, templateName: string, e: React.MouseEvent) => {
    e.preventDefault();
    
    try {
      setDuplicatingId(templateId);

      const response = await fetch(`/api/templates/${templateId}/duplicate`, {
        method: 'POST',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || `Failed to duplicate template: ${response.status}`);
      }

      const duplicatedTemplate = await response.json();

      toast({
        title: "Template Duplicated!",
        description: `"${templateName}" has been copied for your campaign.`,
      });

      setTemplates(prevTemplates => [duplicatedTemplate, ...prevTemplates]);
      
    } catch (err) {
      const error = err as Error;
      console.error("Failed to duplicate template:", error);
      
      toast({
        title: "Failed to duplicate template",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setDuplicatingId(null);
    }
  };

  const templateStats = useMemo(() => {
    const published = templates.filter(t => t.status === 'PUBLISHED').length;
    const draft = templates.filter(t => t.status === 'DRAFT').length;
    const archived = templates.filter(t => t.status === 'ARCHIVED').length;
    const campaignTemplates = templates.filter(t => t.category === 'campaign' || t.category === 'marketing').length;
    
    return {
      total: templates.length,
      published,
      draft,
      archived,
      campaign: campaignTemplates
    };
  }, [templates]);

  // Show error state if there was a fetch error
  if (fetchError && templates.length === 0 && !isLoading) {
    return (
      <div className="space-y-4 p-4">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Target className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Campaign Templates
            </h1>
          </div>
        </div>
        
        <Card className="border-destructive/20 bg-destructive/5">
          <CardContent className="p-8 text-center">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-destructive/10 rounded-full">
                <AlertCircle className="h-8 w-8 text-destructive" />
              </div>
            </div>
            <h3 className="text-lg font-semibold mb-2">Failed to Load Campaign Templates</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              {fetchError}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button variant="outline" onClick={fetchTemplates}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
              <Button asChild>
                <Link href="/templates/new">
                  <Plus className="h-4 w-4 mr-2" />
                  Create New Template
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Target className="h-8 w-8 text-primary" />
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            Campaign Templates
          </h1>
        </div>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Ready-to-use templates specifically designed for your marketing campaigns.
        </p>
      </div>

      {/* Action Bar */}
      <div className="flex items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <Button asChild>
            <Link href="/templates/new">
              <Plus className="mr-2 h-4 w-4" />
              Create Campaign Template
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/templates">
              <Eye className="mr-2 h-4 w-4" />
              View All Templates
            </Link>
          </Button>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchTemplates}
          disabled={isLoading}
        >
          <RefreshCw className={cn("mr-2 h-4 w-4", isLoading && "animate-spin")} />
          Refresh
        </Button>
      </div>
      
      {/* Template Statistics */}
      {isLoading ? (
        <TemplateStatsLoading />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Total Templates</p>
                  <p className="text-3xl font-bold text-primary">{templateStats.total}</p>
                  <p className="text-xs text-muted-foreground">Available for campaigns</p>
                </div>
                <div className="p-3 bg-primary/10 rounded-full">
                  <Target className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-green-700">Published</p>
                  <p className="text-3xl font-bold text-green-600">{templateStats.published}</p>
                  <p className="text-xs text-green-600/70">Ready to use</p>
                </div>
                <div className="p-3 bg-green-500/10 rounded-full">
                  <TrendingUp className="h-6 w-6 text-green-500" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-amber-700">Draft</p>
                  <p className="text-3xl font-bold text-amber-600">{templateStats.draft}</p>
                  <p className="text-xs text-amber-600/70">In development</p>
                </div>
                <div className="p-3 bg-amber-500/10 rounded-full">
                  <Edit className="h-6 w-6 text-amber-500" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-purple-700">Campaign-Specific</p>
                  <p className="text-3xl font-bold text-purple-600">{templateStats.campaign}</p>
                  <p className="text-xs text-purple-600/70">Marketing focused</p>
                </div>
                <div className="p-3 bg-purple-500/10 rounded-full">
                  <Sparkles className="h-6 w-6 text-purple-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      
      {/* Search and Filters */}
      <Card>
        <CardContent className="p-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex items-center gap-2 flex-1">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search campaign templates..."
                className="flex-1 h-8"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-32 h-8 text-xs">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="social">Social</SelectItem>
                  <SelectItem value="blog">Blog</SelectItem>
                  <SelectItem value="marketing">Marketing</SelectItem>
                  <SelectItem value="campaign">Campaign</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Loading State */}
      {isLoading && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[...Array(8)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                    <Skeleton className="h-6 w-6" />
                  </div>
                  <div className="flex gap-2">
                    <Skeleton className="h-5 w-16" />
                    <Skeleton className="h-5 w-20" />
                  </div>
                  <Skeleton className="h-3 w-full" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      
      {/* Empty State */}
      {!isLoading && !fetchError && filteredTemplates.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="p-8 text-center">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-muted rounded-full">
                <Target className="h-8 w-8 text-muted-foreground" />
              </div>
            </div>
            <h3 className="text-lg font-semibold mb-2">No campaign templates found</h3>
            <p className="text-muted-foreground mb-4 max-w-md mx-auto">
              {templates.length === 0 
                ? "Get started by creating your first campaign template."
                : "No templates match your current search criteria. Try adjusting your filters or search terms."
              }
            </p>
            {templates.length === 0 ? (
              <Button asChild>
                <Link href="/templates/new">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Campaign Template
                </Link>
              </Button>
            ) : (
              <div className="flex flex-col sm:flex-row gap-2 justify-center">
                <Button variant="outline" onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                }}>
                  Clear Filters
                </Button>
                <Button asChild>
                  <Link href="/templates/new">
                    <Plus className="h-4 w-4 mr-2" />
                    Create New Template
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
      
      {/* Templates Grid */}
      {!isLoading && !fetchError && filteredTemplates.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredTemplates.map((template) => (
            <Card key={template.id} className="hover:shadow-lg transition-all duration-200 border-l-4" style={{ 
              borderLeftColor: template.status === 'PUBLISHED' ? '#22c55e' : 
                             template.status === 'DRAFT' ? '#f59e0b' : '#6b7280'
            }}>
              <CardHeader className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant={statusBadgeMap[template.status]?.variant || 'secondary'}
                      className={`text-xs font-medium ${statusBadgeMap[template.status]?.className || ''}`}
                    >
                      {template.status === 'PUBLISHED' ? '✅ Live' : 
                       template.status === 'DRAFT' ? '🚧 Draft' : '📦 Archived'}
                    </Badge>
                    <Badge 
                      variant="outline"
                      className={`text-xs ${categoryBadgeMap[template.category] || 'bg-gray-100 text-gray-800'}`}
                    >
                      {template.category}
                    </Badge>
                  </div>
                  <div className="flex items-center text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                    {getTypeIcon(template.category)}
                    <span className="ml-1 text-xs capitalize font-medium">{template.category}</span>
                  </div>
                </div>
                <CardTitle className="text-base font-bold line-clamp-1 text-gray-800">{template.name}</CardTitle>
                <CardDescription className="text-sm line-clamp-2 text-gray-600">{template.description}</CardDescription>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="flex items-center justify-between text-xs mb-3">
                  <span className="text-muted-foreground">Updated {new Date(template.lastUpdated).toLocaleDateString()}</span>
                  {template.aiRecommended && (
                    <div className="flex items-center gap-1 text-purple-600">
                      <Sparkles className="h-3 w-3" />
                      <span className="font-medium text-xs">AI Recommended</span>
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex gap-2 p-4 pt-2">
                <Button variant="outline" size="sm" asChild className="h-8 px-3 text-xs flex-1">
                  <Link href={`/templates/${template.id}`}>
                    <Eye className="h-3 w-3 mr-1" />
                    Preview
                  </Link>
                </Button>
                
                <Button size="sm" asChild className="h-8 px-3 text-xs flex-1">
                  <Link href={`/templates/editor/${template.id}?context=campaign`}>
                    <Edit className="h-3 w-3 mr-1" />
                    Use in Campaign
                  </Link>
                </Button>
                
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={(e) => handleDuplicate(template.id, template.name, e)}
                  disabled={duplicatingId === template.id}
                  className="h-8 px-2 text-xs"
                  title="Duplicate this template"
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
      )}
    </div>
  );
}