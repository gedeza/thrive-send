"use client";

import { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, Copy, Edit, Trash, Loader2, Plus, Search, Filter, Sparkles, Mail, MessageSquare, FileText, Eye, Bookmark, TrendingUp, RefreshCw, Send, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { Input } from "@/components/ui/input";
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from "@/components/ui/use-toast";
import { useOrganization } from "@clerk/nextjs";
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TemplateErrorBoundary, useTemplateErrorHandler } from '@/components/templates/TemplateErrorBoundary';

interface Template {
  id: string;
  name: string;
  description: string;
  type: 'email' | 'social' | 'blog';
  category: string;
  status: 'DRAFT' | 'PENDING_APPROVAL' | 'PUBLISHED' | 'ARCHIVED';
  createdAt: string;
  lastUpdated: string; // Match database field name
}

const statusBadgeMap: Record<string, { className: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  PUBLISHED: { className: "bg-green-100 text-green-800", variant: "default" },
  DRAFT: { className: "bg-yellow-100 text-yellow-900", variant: "secondary" },
  PENDING_APPROVAL: { className: "bg-blue-100 text-blue-800", variant: "default" },
  ARCHIVED: { className: "bg-gray-100 text-gray-600", variant: "outline" }
};

const categoryBadgeMap: Record<string, string> = {
  email: "bg-blue-100 text-blue-800",
  social: "bg-indigo-100 text-indigo-800",
  blog: "bg-orange-100 text-orange-800",
  marketing: "bg-purple-100 text-purple-800",
  sales: "bg-emerald-100 text-emerald-800",
  support: "bg-pink-100 text-pink-800"
};

// Loading component for template statistics
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

function TemplatesPageContent() {
  const { organization } = useOrganization();
  const { toast } = useToast();
  const { handleTemplateError } = useTemplateErrorHandler();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [duplicatingId, setDuplicatingId] = useState<string | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [quickActionLoading, setQuickActionLoading] = useState<string | null>(null);

  const fetchTemplates = async () => {
    try {
      setIsLoading(true);
      setFetchError(null);
      
      const response = await fetch("/api/templates");
      
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
      const errorInfo = handleTemplateError(error, "fetch templates");
      
      console.error("", _error);
      setFetchError(error.message);
      
      toast({
        title: errorInfo.title,
        description: errorInfo.description,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

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
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || `Failed to duplicate template: ${response.status}`);
      }

      const duplicatedTemplate = await response.json();

      toast({
        title: "Template Ready!",
        description: `"${templateName}" copied and ready to customize 🚀`,
      });

      // Instead of refetching all templates, add the new one to the list
      setTemplates(prevTemplates => [duplicatedTemplate, ...prevTemplates]);
      
    } catch (err) {
      const error = err as Error;
      const errorInfo = handleTemplateError(error, "duplicate template");
      
      console.error("", _error);
      
      toast({
        title: errorInfo.title,
        description: errorInfo.description,
        variant: "destructive",
      });
    } finally {
      setDuplicatingId(null);
    }
  };

  const handleQuickAction = async (templateId: string, action: 'use' | 'preview', e: React.MouseEvent) => {
    e.preventDefault();
    
    try {
      setQuickActionLoading(`${action}-${templateId}`);
      
      if (action === 'use') {
        // Direct navigation to editor with template loaded
        window.location.href = `/templates/editor/${templateId}?quick=true`;
      } else if (action === 'preview') {
        // Quick preview modal or navigation
        window.open(`/templates/${templateId}?preview=true`, '_blank', 'width=800,height=600');
      }
      
    } catch (err) {
      console.error(`Quick action ${action} failed:`, err);
      toast({
        title: "Quick Action Failed",
        description: "Please try again or use the regular buttons",
        variant: "destructive",
      });
    } finally {
      setTimeout(() => setQuickActionLoading(null), 1000); // Clear after navigation
    }
  };

  const templateStats = useMemo(() => {
    const published = templates.filter(t => t.status === 'PUBLISHED').length;
    const draft = templates.filter(t => t.status === 'DRAFT').length;
    const archived = templates.filter(t => t.status === 'ARCHIVED').length;
    const emailTemplates = templates.filter(t => t.type === 'email').length;
    const socialTemplates = templates.filter(t => t.type === 'social').length;
    
    return {
      total: templates.length,
      published,
      draft,
      archived,
      email: emailTemplates,
      social: socialTemplates,
      blog: templates.filter(t => t.type === 'blog').length
    };
  }, [templates]);

  // Show error state if there was a fetch error
  if (fetchError && templates.length === 0 && !isLoading) {
    return (
      <div className="space-y-4 p-4">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <FileText className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Templates
            </h1>
          </div>
        </div>
        
        <Card className="border-destructive/20 bg-destructive/5">
          <CardContent className="p-6 text-center">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-destructive/10 rounded-full">
                <FileText className="h-8 w-8 text-destructive" />
              </div>
            </div>
            <h3 className="text-lg font-semibold mb-2">Failed to Load Templates</h3>
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
      {/* Customer-Centric Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="p-3 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full">
            <Sparkles className="h-8 w-8 text-blue-600" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Content Templates
          </h1>
        </div>
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto mb-4">
          <strong>Save time and boost consistency</strong> with professional templates. Create once, reuse everywhere.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>10x faster content creation</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span>Brand consistency guaranteed</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
            <span>AI-powered suggestions</span>
          </div>
        </div>
      </div>

      {/* Customer-Focused Action Bar */}
      <div className="flex items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <Button asChild size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
            <Link href="/templates/new">
              <Sparkles className="mr-2 h-4 w-4" />
              Create Template
            </Link>
          </Button>
          <Button variant="outline" size="lg">
            <TrendingUp className="mr-2 h-4 w-4" />
            Browse Popular
          </Button>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Bookmark className="h-4 w-4" />
          <span>Templates save you an average of <strong>2.5 hours per week</strong></span>
        </div>
      </div>

      {/* Value-Driven Analytics */}
      {isLoading ? (
        <TemplateStatsLoading />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-blue-500 bg-gradient-to-br from-blue-50/50 to-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-blue-700">Your Template Library</p>
                  <p className="text-3xl font-bold text-blue-600">{templateStats.total}</p>
                  <p className="text-xs text-blue-600/70">Ready to use instantly</p>
                </div>
                <div className="p-3 bg-blue-500/10 rounded-full">
                  <FileText className="h-6 w-6 text-blue-500" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-green-500 bg-gradient-to-br from-green-50/50 to-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-green-700">Published & Active</p>
                  <p className="text-3xl font-bold text-green-600">{templateStats.published}</p>
                  <p className="text-xs text-green-600/70">Driving results now</p>
                </div>
                <div className="p-3 bg-green-500/10 rounded-full">
                  <TrendingUp className="h-6 w-6 text-green-500" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-amber-500 bg-gradient-to-br from-amber-50/50 to-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-amber-700">In Development</p>
                  <p className="text-3xl font-bold text-amber-600">{templateStats.draft}</p>
                  <p className="text-xs text-amber-600/70">Almost ready to launch</p>
                </div>
                <div className="p-3 bg-amber-500/10 rounded-full">
                  <Edit className="h-6 w-6 text-amber-500" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-purple-500 bg-gradient-to-br from-purple-50/50 to-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-purple-700">Email Campaigns</p>
                  <p className="text-3xl font-bold text-purple-600">{templateStats.email}</p>
                  <p className="text-xs text-purple-600/70">High-converting emails</p>
                </div>
                <div className="p-3 bg-purple-500/10 rounded-full">
                  <Mail className="h-6 w-6 text-purple-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Smart Search and Discovery */}
      <Card className="border-2 border-muted/50 bg-gradient-to-r from-slate-50/50 to-blue-50/30">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex items-center gap-3 flex-1">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Search className="h-4 w-4 text-blue-600" />
              </div>
              <Input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Find the perfect template... (e.g., 'newsletter', 'welcome email', 'product launch')"
                className="flex-1 h-10 border-0 bg-white shadow-sm"
              />
            </div>
            
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium text-muted-foreground">Filter by:</span>
              </div>
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="w-32 h-10 bg-white shadow-sm">
                  <SelectValue placeholder="Content Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="email">📧 Email</SelectItem>
                  <SelectItem value="social">📱 Social</SelectItem>
                  <SelectItem value="blog">📝 Blog</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-32 h-10 bg-white shadow-sm">
                  <SelectValue placeholder="Purpose" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Purposes</SelectItem>
                  <SelectItem value="marketing">🎯 Marketing</SelectItem>
                  <SelectItem value="sales">💼 Sales</SelectItem>
                  <SelectItem value="support">🤝 Support</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Smart Suggestions Section */}
      {templates.length > 0 && (
        <Card className="mb-6 bg-gradient-to-r from-indigo-50/80 to-purple-50/80 border-indigo-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <Sparkles className="h-5 w-5 text-indigo-600" />
              </div>
              <div>
                <h3 className="font-semibold text-indigo-900">AI-Powered Suggestions</h3>
                <p className="text-sm text-indigo-700">Recommended templates based on your usage patterns</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" className="h-7 bg-white/70 hover:bg-indigo-100 border-indigo-200 text-indigo-700">
                <Mail className="h-3 w-3 mr-1" />
                Welcome Email Series
              </Button>
              <Button variant="outline" size="sm" className="h-7 bg-white/70 hover:bg-purple-100 border-purple-200 text-purple-700">
                <MessageSquare className="h-3 w-3 mr-1" />
                Social Media Pack
              </Button>
              <Button variant="outline" size="sm" className="h-7 bg-white/70 hover:bg-blue-100 border-blue-200 text-blue-700">
                <FileText className="h-3 w-3 mr-1" />
                Newsletter Template
              </Button>
              <Button variant="outline" size="sm" className="h-7 bg-white/70 hover:bg-green-100 border-green-200 text-green-700">
                <TrendingUp className="h-3 w-3 mr-1" />
                High-Converting CTA
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Templates Grid */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {/* Customer-Focused Create Card */}
        <Link href="/templates/new">
          <Card className="h-full border-2 border-dashed border-blue-200 hover:border-blue-400 hover:shadow-lg transition-all duration-300 cursor-pointer bg-gradient-to-br from-blue-50/30 to-purple-50/30 group">
            <CardContent className="flex flex-col items-center justify-center h-[220px] text-center p-6">
              <div className="rounded-full bg-gradient-to-r from-blue-500 to-purple-500 p-4 mb-4 group-hover:scale-110 transition-transform">
                <Sparkles className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-gray-800">Create Your Template</h3>
              <p className="text-sm text-gray-600 mb-3">
                🚀 Start with AI assistance<br/>
                ⏱️ Save hours of work<br/>
                🎯 Boost engagement
              </p>
              <div className="text-xs text-blue-600 font-medium">
                Click to get started →
              </div>
            </CardContent>
          </Card>
        </Link>

        {/* Template Cards */}
        {filteredTemplates.map((template) => (
          <Card key={template.id} className="hover:shadow-lg transition-all duration-200 border-l-4" style={{ 
            borderLeftColor: template.status === 'PUBLISHED' ? '#22c55e' : 
                           template.status === 'DRAFT' ? '#f59e0b' : 
                           template.status === 'PENDING_APPROVAL' ? '#3b82f6' : 
                           template.status === 'ARCHIVED' ? '#6b7280' : '#6b7280'
          }}>
            <CardHeader className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Badge 
                    variant={statusBadgeMap[template.status]?.variant || 'secondary'}
                    className={`text-xs font-medium ${statusBadgeMap[template.status]?.className || ''}`}
                  >
                    {template.status === 'PUBLISHED' ? '✅ Live' : 
                     template.status === 'DRAFT' ? '🚧 Draft' : 
                     template.status === 'PENDING_APPROVAL' ? '⏳ Pending' : '📦 Archived'}
                  </Badge>
                  <Badge 
                    variant="outline"
                    className={`text-xs ${categoryBadgeMap[template.category] || 'bg-gray-100 text-gray-800'}`}
                  >
                    {template.category === 'marketing' ? '🎯' : template.category === 'sales' ? '💼' : '🤝'} {template.category}
                  </Badge>
                </div>
                <div className="flex items-center text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                  {getTypeIcon(template.type)}
                  <span className="ml-1 text-xs capitalize font-medium">{template.type}</span>
                </div>
              </div>
              <CardTitle className="text-base font-bold line-clamp-1 text-gray-800">{template.name}</CardTitle>
              <CardDescription className="text-sm line-clamp-2 text-gray-600">{template.description}</CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-0 flex-grow">
              <div className="flex items-center justify-between text-xs mb-3">
                <span className="text-muted-foreground">Updated {new Date(template.lastUpdated).toLocaleDateString()}</span>
                <div className="flex items-center gap-1">
                  {/* Performance indicator based on template status */}
                  {template.status === 'PUBLISHED' ? (
                    <div className="flex items-center gap-1 text-green-600">
                      <TrendingUp className="h-3 w-3" />
                      <span className="font-medium text-xs">Top Performer</span>
                    </div>
                  ) : template.status === 'DRAFT' ? (
                    <div className="flex items-center gap-1 text-amber-600">
                      <Edit className="h-3 w-3" />
                      <span className="font-medium text-xs">In Progress</span>
                    </div>
                  ) : template.status === 'PENDING_APPROVAL' ? (
                    <div className="flex items-center gap-1 text-blue-600">
                      <Send className="h-3 w-3" />
                      <span className="font-medium text-xs">Under Review</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-gray-500">
                      <Bookmark className="h-3 w-3" />
                      <span className="font-medium text-xs">Archived</span>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Quick Actions Bar */}
              <div className="flex gap-1 mb-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={(e) => handleQuickAction(template.id, 'preview', e)}
                  disabled={quickActionLoading === `preview-${template.id}`}
                  className="h-6 px-2 text-xs bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-700 flex-1"
                >
                  {quickActionLoading === `preview-${template.id}` ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <>
                      <Eye className="h-3 w-3 mr-1" />
                      Quick View
                    </>
                  )}
                </Button>
                <Button 
                  size="sm"
                  onClick={(e) => handleQuickAction(template.id, 'use', e)}
                  disabled={quickActionLoading === `use-${template.id}`}
                  className="h-6 px-2 text-xs bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white flex-1"
                >
                  {quickActionLoading === `use-${template.id}` ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <>
                      <Sparkles className="h-3 w-3 mr-1" />
                      Use Now
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
            <CardFooter className="flex gap-2 p-4 pt-2">
              <Button variant="outline" size="sm" asChild className="h-8 px-3 text-xs flex-1 hover:bg-blue-50 hover:border-blue-200">
                <Link href={`/templates/${template.id}`}>
                  <Eye className="h-3 w-3 mr-1" />
                  Preview
                </Link>
              </Button>
              
              {template.status === 'DRAFT' ? (
                <>
                  <Button size="sm" asChild className="h-8 px-3 text-xs flex-1 bg-purple-600 hover:bg-purple-700">
                    <Link href={`/templates/editor/${template.id}`}>
                      <Edit className="h-3 w-3 mr-1" />
                      Edit
                    </Link>
                  </Button>
                  <Button 
                    size="sm"
                    onClick={() => {
                      toast({
                        title: "Approval Request! 📋",
                        description: `Go to Settings → Workflows to request approval for "${template.name}"`,
                      });
                    }}
                    className="h-8 px-3 text-xs flex-1 bg-teal-600 hover:bg-teal-700"
                    title="Request approval from team leads"
                  >
                    <Send className="h-3 w-3 mr-1" />
                    Request Approval
                  </Button>
                </>
              ) : template.status === 'PENDING_APPROVAL' ? (
                <>
                  <Button size="sm" disabled className="h-8 px-3 text-xs flex-1 bg-blue-500">
                    <Send className="h-3 w-3 mr-1" />
                    Under Review
                  </Button>
                  <Button 
                    size="sm"
                    onClick={() => {
                      toast({
                        title: "Review Status 📋",
                        description: `Check Settings → Workflows to see approval progress for "${template.name}"`,
                      });
                    }}
                    className="h-8 px-3 text-xs flex-1 bg-blue-600 hover:bg-blue-700"
                    title="View approval status"
                  >
                    <Eye className="h-3 w-3 mr-1" />
                    View Status
                  </Button>
                </>
              ) : template.status === 'PUBLISHED' ? (
                <>
                  <Button size="sm" asChild className="h-8 px-3 text-xs flex-1 bg-green-600 hover:bg-green-700">
                    <Link href={`/templates/editor/${template.id}`}>
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Published
                    </Link>
                  </Button>
                </>
              ) : (
                <Button size="sm" asChild className="h-8 px-3 text-xs flex-1 bg-gray-600 hover:bg-gray-700">
                  <Link href={`/templates/editor/${template.id}`}>
                    <Edit className="h-3 w-3 mr-1" />
                    View
                  </Link>
                </Button>
              )}
              
              <Button 
                variant="outline" 
                size="sm"
                onClick={(e) => handleDuplicate(template.id, template.name, e)}
                disabled={duplicatingId === template.id}
                className="h-8 px-2 text-xs hover:bg-purple-50 hover:border-purple-200"
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

      {/* Performance Insights */}
      {templates.length > 0 && !isLoading && (
        <Card className="mt-6 bg-gradient-to-r from-emerald-50/80 to-teal-50/80 border-emerald-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-emerald-100 rounded-lg">
                <TrendingUp className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <h3 className="font-semibold text-emerald-900">Template Performance Insights</h3>
                <p className="text-sm text-emerald-700">Analytics to help optimize your templates</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white/70 rounded-lg p-3 border border-emerald-100">
                <div className="text-2xl font-bold text-emerald-600">{templateStats.total > 0 ? Math.round((templateStats.published / templateStats.total) * 100) : 0}%</div>
                <div className="text-sm text-emerald-700">Templates Published</div>
                <div className="text-xs text-emerald-600 mt-1">
                  ↗️ {templateStats.published > templateStats.draft ? 'Great publishing rate!' : 'Consider publishing more drafts'}
                </div>
              </div>
              <div className="bg-white/70 rounded-lg p-3 border border-teal-100">
                <div className="text-2xl font-bold text-teal-600">{templateStats.email + templateStats.social}</div>
                <div className="text-sm text-teal-700">Multi-Channel Templates</div>
                <div className="text-xs text-teal-600 mt-1">
                  📊 Diversified content strategy
                </div>
              </div>
              <div className="bg-white/70 rounded-lg p-3 border border-blue-100">
                <div className="text-2xl font-bold text-blue-600">2.5hrs</div>
                <div className="text-sm text-blue-700">Estimated Time Saved</div>
                <div className="text-xs text-blue-600 mt-1">
                  ⏱️ Per week with current templates
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {filteredTemplates.length === 0 && !isLoading && (
        <Card className="border-dashed">
          <CardContent className="p-6 text-center">
            <div className="flex justify-center mb-4">
              <div className="p-4 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full">
                <Sparkles className="h-12 w-12 text-blue-600" />
              </div>
            </div>
            <h3 className="text-2xl font-bold mb-3 text-gray-800">Your Template Library Awaits!</h3>
            <p className="text-gray-600 mb-6 max-w-lg mx-auto leading-relaxed">
              {searchQuery || selectedType !== 'all' || selectedCategory !== 'all'
                ? "🔍 No templates match your search. Try different keywords or clear filters to explore all available templates."
                : "🚀 Templates are your content creation superpowers! Start with your most frequently used content type and transform hours of work into minutes."}
            </p>
            {templates.length === 0 ? (
              <div className="space-y-4">
                <Button asChild size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg px-8">
                  <Link href="/templates/new">
                    <Sparkles className="h-5 w-5 mr-2" />
                    Create Your First Template
                  </Link>
                </Button>
                <div className="flex items-center justify-center gap-4 text-sm text-gray-500 mt-4">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span>Instant content creation</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                    <span>Brand consistency</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                    <span>Time savings</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button variant="outline" size="lg" onClick={() => {
                  setSearchQuery('');
                  setSelectedType('all');
                  setSelectedCategory('all');
                }} className="border-gray-300 hover:bg-gray-50">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Show All Templates
                </Button>
                <Button asChild size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
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
    </div>
  );
}

// Main component with error boundary
export default function TemplatesPage() {
  return (
    <TemplateErrorBoundary 
      fallbackTitle="Templates System Error"
      fallbackDescription="We encountered an error while loading the templates system. Your templates are safe and you can still create new ones."
      onRetry={() => window.location.reload()}
    >
      <TemplatesPageContent />
    </TemplateErrorBoundary>
  );
}
