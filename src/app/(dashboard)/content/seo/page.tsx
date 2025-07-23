'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import { Search, TrendingUp, Target, BookOpen, Settings, Plus, FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SEOOptimizer } from '@/components/seo/SEOOptimizer';
import Link from 'next/link';

interface ContentItem {
  id: string;
  title: string;
  type: string;
  status: string;
  seoScore: number;
  lastOptimized: string;
  focusKeyword?: string;
}

const mockContentItems: ContentItem[] = [
  {
    id: '1',
    title: 'Complete Guide to Content Marketing Strategy',
    type: 'BLOG_POST',
    status: 'DRAFT',
    seoScore: 85,
    lastOptimized: '2024-01-15',
    focusKeyword: 'content marketing strategy'
  },
  {
    id: '2',
    title: 'Email Marketing Best Practices for 2024',
    type: 'BLOG_POST',
    status: 'PUBLISHED',
    seoScore: 72,
    lastOptimized: '2024-01-10',
    focusKeyword: 'email marketing'
  },
  {
    id: '3',
    title: 'Social Media Content Calendar Template',
    type: 'TEMPLATE',
    status: 'REVIEW',
    seoScore: 45,
    lastOptimized: '2024-01-05',
    focusKeyword: 'social media calendar'
  },
  {
    id: '4',
    title: 'How to Increase Website Traffic',
    type: 'BLOG_POST',
    status: 'DRAFT',
    seoScore: 30,
    lastOptimized: 'Never',
  }
];

export default function SEOContentPage() {
  const { userId } = useAuth();
  const [contentItems, setContentItems] = useState<ContentItem[]>(mockContentItems);
  const [selectedContent, setSelectedContent] = useState<ContentItem | null>(null);
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState('seo-score');

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    if (score >= 40) return 'text-orange-600 bg-orange-100';
    return 'text-red-600 bg-red-100';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Needs Work';
    return 'Poor';
  };

  const filteredContent = contentItems
    .filter(item => filterType === 'all' || item.type.toLowerCase().includes(filterType.toLowerCase()))
    .sort((a, b) => {
      switch (sortBy) {
        case 'seo-score':
          return a.seoScore - b.seoScore; // Show worst scores first
        case 'title':
          return a.title.localeCompare(b.title);
        case 'last-optimized':
          if (a.lastOptimized === 'Never') return -1;
          if (b.lastOptimized === 'Never') return 1;
          return new Date(b.lastOptimized).getTime() - new Date(a.lastOptimized).getTime();
        default:
          return 0;
      }
    });

  const needsOptimization = contentItems.filter(item => item.seoScore < 60).length;
  const averageScore = Math.round(contentItems.reduce((sum, item) => sum + item.seoScore, 0) / contentItems.length);

  if (selectedContent) {
    return (
      <div className="container mx-auto px-6 py-8">
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => setSelectedContent(null)}
            className="mb-4"
          >
            ← Back to Content List
          </Button>
          <h1 className="text-3xl font-bold mb-2">SEO Optimization</h1>
          <p className="text-muted-foreground">{selectedContent.title}</p>
        </div>

        <SEOOptimizer
          initialTitle={selectedContent.title}
          initialFocusKeyword={selectedContent.focusKeyword || ''}
          onUpdate={(field, value) => {
            // Handle content updates
            console.log(`Updated ${field}:`, value);
          }}
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">SEO Content Optimization</h1>
          <p className="text-muted-foreground">
            Optimize your content for search engines and improve rankings
          </p>
        </div>
        <Link href="/content/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create New Content
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Content</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{contentItems.length}</div>
            <p className="text-xs text-muted-foreground">Pieces of content</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average SEO Score</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${averageScore >= 70 ? 'text-green-600' : averageScore >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
              {averageScore}
            </div>
            <p className="text-xs text-muted-foreground">Out of 100</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Needs Optimization</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{needsOptimization}</div>
            <p className="text-xs text-muted-foreground">Content items</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Well Optimized</CardTitle>
            <Search className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {contentItems.filter(item => item.seoScore >= 80).length}
            </div>
            <p className="text-xs text-muted-foreground">Content items</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Content List */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <CardTitle>Content SEO Overview</CardTitle>
            <div className="flex gap-2">
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="blog">Blog Posts</SelectItem>
                  <SelectItem value="template">Templates</SelectItem>
                  <SelectItem value="social">Social Media</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="seo-score">SEO Score (Low to High)</SelectItem>
                  <SelectItem value="title">Title (A-Z)</SelectItem>
                  <SelectItem value="last-optimized">Last Optimized</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredContent.map((item) => (
              <div 
                key={item.id} 
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold">{item.title}</h3>
                    <Badge variant="outline">{item.type.replace('_', ' ')}</Badge>
                    <Badge variant={item.status === 'PUBLISHED' ? 'default' : 'secondary'}>
                      {item.status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>Last optimized: {item.lastOptimized === 'Never' ? 'Never' : new Date(item.lastOptimized).toLocaleDateString()}</span>
                    {item.focusKeyword && (
                      <span className="flex items-center gap-1">
                        <Target className="h-3 w-3" />
                        {item.focusKeyword}
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <div className={`text-2xl font-bold px-3 py-1 rounded ${getScoreColor(item.seoScore)}`}>
                      {item.seoScore}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {getScoreLabel(item.seoScore)}
                    </div>
                  </div>
                  
                  <Button 
                    onClick={() => setSelectedContent(item)}
                    variant={item.seoScore < 60 ? 'default' : 'outline'}
                  >
                    {item.seoScore < 60 ? 'Optimize Now' : 'Review SEO'}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* SEO Tips Card */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            SEO Quick Tips
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2">Focus Keywords</h4>
              <p className="text-sm text-blue-700">
                Research and use relevant keywords in your title, headings, and content naturally.
              </p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <h4 className="font-semibold text-green-900 mb-2">Content Quality</h4>
              <p className="text-sm text-green-700">
                Create comprehensive, valuable content that answers your audience's questions.
              </p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <h4 className="font-semibold text-purple-900 mb-2">Technical SEO</h4>
              <p className="text-sm text-purple-700">
                Optimize meta titles, descriptions, and URL structures for better search visibility.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}