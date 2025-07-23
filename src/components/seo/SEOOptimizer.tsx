'use client';

import React, { useState } from 'react';
import { Search, TrendingUp, Zap, Settings, Target, BookOpen, BarChart3 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SEOAnalyzer } from './SEOAnalyzer';
import { KeywordResearch } from './KeywordResearch';

interface SEOOptimizerProps {
  initialTitle?: string;
  initialContent?: string;
  initialExcerpt?: string;
  initialFocusKeyword?: string;
  onUpdate?: (field: string, value: string) => void;
}

interface SEOMetrics {
  contentScore: number;
  technicalScore: number;
  keywordScore: number;
  readabilityScore: number;
}

export function SEOOptimizer({
  initialTitle = '',
  initialContent = '',
  initialExcerpt = '',
  initialFocusKeyword = '',
  onUpdate
}: SEOOptimizerProps) {
  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);
  const [excerpt, setExcerpt] = useState(initialExcerpt);
  const [focusKeyword, setFocusKeyword] = useState(initialFocusKeyword);
  const [metaTitle, setMetaTitle] = useState(initialTitle);
  const [metaDescription, setMetaDescription] = useState(initialExcerpt);
  const [slug, setSlug] = useState('');

  const handleFieldUpdate = (field: string, value: string) => {
    switch (field) {
      case 'title':
        setTitle(value);
        setMetaTitle(value); // Auto-sync meta title
        break;
      case 'content':
        setContent(value);
        break;
      case 'excerpt':
        setExcerpt(value);
        setMetaDescription(value); // Auto-sync meta description
        break;
      case 'focusKeyword':
        setFocusKeyword(value);
        break;
      case 'metaTitle':
        setMetaTitle(value);
        break;
      case 'metaDescription':
        setMetaDescription(value);
        break;
      case 'slug':
        setSlug(value);
        break;
    }
    onUpdate?.(field, value);
  };

  const generateSlug = () => {
    const generatedSlug = title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .trim();
    setSlug(generatedSlug);
    onUpdate?.('slug', generatedSlug);
  };

  const optimizeForKeyword = (keyword: string) => {
    setFocusKeyword(keyword);
    
    // Suggest optimized title if keyword not in title
    if (!title.toLowerCase().includes(keyword.toLowerCase())) {
      const optimizedTitle = `${keyword} - ${title}`.substring(0, 60);
      setTitle(optimizedTitle);
      setMetaTitle(optimizedTitle);
      onUpdate?.('title', optimizedTitle);
    }
    
    // Suggest optimized meta description
    if (!metaDescription.toLowerCase().includes(keyword.toLowerCase())) {
      const optimizedDescription = `Learn about ${keyword}. ${metaDescription}`.substring(0, 160);
      setMetaDescription(optimizedDescription);
      onUpdate?.('metaDescription', optimizedDescription);
    }
  };

  const handleKeywordSelect = (keyword: string) => {
    setFocusKeyword(keyword);
    optimizeForKeyword(keyword);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            SEO Optimizer
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Optimize your content for search engines with real-time analysis and suggestions.
          </p>
        </CardContent>
      </Card>

      <Tabs defaultValue="content" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="content" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Content
          </TabsTrigger>
          <TabsTrigger value="analysis" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Analysis
          </TabsTrigger>
          <TabsTrigger value="keywords" className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            Keywords
          </TabsTrigger>
          <TabsTrigger value="technical" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Technical
          </TabsTrigger>
        </TabsList>

        {/* Content Tab */}
        <TabsContent value="content" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Content Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="focus-keyword">Focus Keyword</Label>
                    <Input
                      id="focus-keyword"
                      value={focusKeyword}
                      onChange={(e) => handleFieldUpdate('focusKeyword', e.target.value)}
                      placeholder="Enter your main keyword..."
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      The primary keyword you want to rank for
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      value={title}
                      onChange={(e) => handleFieldUpdate('title', e.target.value)}
                      placeholder="Enter your content title..."
                    />
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>Recommended: 30-60 characters</span>
                      <span className={title.length > 60 ? 'text-red-500' : title.length > 30 ? 'text-green-500' : 'text-yellow-500'}>
                        {title.length}/60
                      </span>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="excerpt">Excerpt/Summary</Label>
                    <Textarea
                      id="excerpt"
                      value={excerpt}
                      onChange={(e) => handleFieldUpdate('excerpt', e.target.value)}
                      placeholder="Brief summary of your content..."
                      rows={3}
                    />
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>Recommended: 120-160 characters</span>
                      <span className={excerpt.length > 160 ? 'text-red-500' : excerpt.length > 120 ? 'text-green-500' : 'text-yellow-500'}>
                        {excerpt.length}/160
                      </span>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="content">Content</Label>
                    <Textarea
                      id="content"
                      value={content}
                      onChange={(e) => handleFieldUpdate('content', e.target.value)}
                      placeholder="Enter your main content..."
                      rows={8}
                    />
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>Word count: {content.split(/\s+/).filter(word => word.length > 0).length}</span>
                      <span>Recommended: 300+ words</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">SEO Preview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 border rounded-lg bg-muted/30">
                      <div className="text-sm text-muted-foreground mb-1">Google Search Result Preview</div>
                      <div className="space-y-1">
                        <div className="text-blue-600 text-lg font-medium hover:underline cursor-pointer">
                          {metaTitle || title || 'Your page title will appear here'}
                        </div>
                        <div className="text-green-700 text-sm">
                          https://yourdomain.com/{slug || 'your-url-slug'}
                        </div>
                        <div className="text-sm text-gray-600">
                          {metaDescription || excerpt || 'Your meta description will appear here and help users understand what your page is about...'}
                        </div>
                      </div>
                    </div>

                    <div className="p-4 border rounded-lg bg-muted/30">
                      <div className="text-sm text-muted-foreground mb-1">Social Media Preview</div>
                      <div className="border rounded bg-white p-3">
                        <div className="text-sm font-medium mb-1">
                          {title || 'Your content title'}
                        </div>
                        <div className="text-xs text-muted-foreground mb-2">
                          {excerpt || 'Your content description will appear here'}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          yourdomain.com
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="text-sm font-medium">Quick Stats</div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="flex justify-between">
                          <span>Title length:</span>
                          <span className={title.length > 60 ? 'text-red-500' : title.length > 30 ? 'text-green-500' : 'text-yellow-500'}>
                            {title.length}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Description:</span>
                          <span className={excerpt.length > 160 ? 'text-red-500' : excerpt.length > 120 ? 'text-green-500' : 'text-yellow-500'}>
                            {excerpt.length}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Word count:</span>
                          <span className={content.split(/\s+/).filter(w => w.length > 0).length < 300 ? 'text-yellow-500' : 'text-green-500'}>
                            {content.split(/\s+/).filter(w => w.length > 0).length}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Focus keyword:</span>
                          <span className={focusKeyword ? 'text-green-500' : 'text-red-500'}>
                            {focusKeyword ? 'Set' : 'Missing'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Analysis Tab */}
        <TabsContent value="analysis">
          <SEOAnalyzer
            content={content}
            title={title}
            excerpt={excerpt}
            focusKeyword={focusKeyword}
            onSuggestionApply={handleFieldUpdate}
          />
        </TabsContent>

        {/* Keywords Tab */}
        <TabsContent value="keywords">
          <KeywordResearch onKeywordSelect={handleKeywordSelect} />
        </TabsContent>

        {/* Technical Tab */}
        <TabsContent value="technical" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Technical SEO Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="meta-title">Meta Title</Label>
                <Input
                  id="meta-title"
                  value={metaTitle}
                  onChange={(e) => handleFieldUpdate('metaTitle', e.target.value)}
                  placeholder="Custom meta title (if different from main title)"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>Should include focus keyword</span>
                  <span className={metaTitle.length > 60 ? 'text-red-500' : 'text-green-500'}>
                    {metaTitle.length}/60
                  </span>
                </div>
              </div>

              <div>
                <Label htmlFor="meta-description">Meta Description</Label>
                <Textarea
                  id="meta-description"
                  value={metaDescription}
                  onChange={(e) => handleFieldUpdate('metaDescription', e.target.value)}
                  placeholder="Custom meta description for search results"
                  rows={3}
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>Should include focus keyword and call-to-action</span>
                  <span className={metaDescription.length > 160 ? 'text-red-500' : metaDescription.length > 120 ? 'text-green-500' : 'text-yellow-500'}>
                    {metaDescription.length}/160
                  </span>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="slug">URL Slug</Label>
                  <Button variant="outline" size="sm" onClick={generateSlug}>
                    Generate from Title
                  </Button>
                </div>
                <Input
                  id="slug"
                  value={slug}
                  onChange={(e) => handleFieldUpdate('slug', e.target.value)}
                  placeholder="url-friendly-slug"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Keep it short, descriptive, and include your focus keyword
                </p>
              </div>

              <div className="pt-4 border-t">
                <h4 className="font-medium mb-3">Technical Checklist</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <div className={`w-2 h-2 rounded-full ${metaTitle && metaTitle.includes(focusKeyword) ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <span>Focus keyword in meta title</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className={`w-2 h-2 rounded-full ${metaDescription && metaDescription.includes(focusKeyword) ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <span>Focus keyword in meta description</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className={`w-2 h-2 rounded-full ${slug && slug.includes(focusKeyword.toLowerCase().replace(/\s+/g, '-')) ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <span>Focus keyword in URL slug</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className={`w-2 h-2 rounded-full ${metaTitle.length >= 30 && metaTitle.length <= 60 ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                    <span>Optimal meta title length</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className={`w-2 h-2 rounded-full ${metaDescription.length >= 120 && metaDescription.length <= 160 ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                    <span>Optimal meta description length</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Advanced Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-medium mb-2">Schema Markup Suggestions</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Add structured data to help search engines understand your content better.
                </p>
                <div className="space-y-2 text-sm">
                  <div>• Article schema for blog posts and articles</div>
                  <div>• FAQ schema for question-based content</div>
                  <div>• How-to schema for tutorial content</div>
                  <div>• Organization schema for company pages</div>
                </div>
              </div>

              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-medium mb-2">Internal Linking Opportunities</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Link to related content on your site to improve SEO and user experience.
                </p>
                <Button variant="outline" size="sm">
                  Find Related Content
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}