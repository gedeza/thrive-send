'use client';

import React, { useState, useEffect } from 'react';
import { Search, TrendingUp, CheckCircle, AlertTriangle, X, Target, BookOpen, Zap, Eye } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface SEOScore {
  overall: number;
  readability: number;
  keywords: number;
  structure: number;
  technical: number;
}

interface SEOIssue {
  type: 'error' | 'warning' | 'success';
  category: 'readability' | 'keywords' | 'structure' | 'technical';
  title: string;
  description: string;
  suggestion?: string;
}

interface SEOAnalyzerProps {
  content: string;
  title: string;
  excerpt?: string;
  focusKeyword?: string;
  onSuggestionApply?: (type: string, value: string) => void;
}

export function SEOAnalyzer({ 
  content, 
  title, 
  excerpt = '', 
  focusKeyword = '',
  onSuggestionApply 
}: SEOAnalyzerProps) {
  const [seoScore, setSeoScore] = useState<SEOScore>({
    overall: 0,
    readability: 0,
    keywords: 0,
    structure: 0,
    technical: 0
  });
  const [issues, setIssues] = useState<SEOIssue[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [keywordDensity, setKeywordDensity] = useState<{[key: string]: number}>({});

  useEffect(() => {
    if (content || title) {
      analyzeSEO();
    }
  }, [content, title, excerpt, focusKeyword]);

  const analyzeSEO = async () => {
    setIsAnalyzing(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const analysis = performSEOAnalysis();
    setSeoScore(analysis.score);
    setIssues(analysis.issues);
    setKeywordDensity(analysis.keywordDensity);
    
    setIsAnalyzing(false);
  };

  const performSEOAnalysis = () => {
    const issues: SEOIssue[] = [];
    const scores = { readability: 0, keywords: 0, structure: 0, technical: 0 };
    
    // Title Analysis
    if (!title) {
      issues.push({
        type: 'error',
        category: 'structure',
        title: 'Missing Title',
        description: 'Your content needs a title for SEO.',
        suggestion: 'Add a compelling title with your focus keyword'
      });
    } else {
      if (title.length < 30) {
        issues.push({
          type: 'warning',
          category: 'structure',
          title: 'Title Too Short',
          description: `Title is ${title.length} characters. Recommended 30-60 characters.`,
          suggestion: 'Expand your title to better describe the content'
        });
        scores.structure += 20;
      } else if (title.length > 60) {
        issues.push({
          type: 'warning',
          category: 'structure',
          title: 'Title Too Long',
          description: `Title is ${title.length} characters. May be truncated in search results.`,
          suggestion: 'Shorten your title to under 60 characters'
        });
        scores.structure += 20;
      } else {
        scores.structure += 40;
        issues.push({
          type: 'success',
          category: 'structure',
          title: 'Good Title Length',
          description: 'Title length is optimal for search engines.'
        });
      }
    }

    // Content Length Analysis
    const wordCount = content.split(/\s+/).filter(word => word.length > 0).length;
    if (wordCount < 300) {
      issues.push({
        type: 'warning',
        category: 'technical',
        title: 'Content Too Short',
        description: `Content has ${wordCount} words. Recommended minimum 300 words.`,
        suggestion: 'Add more valuable content to improve SEO ranking'
      });
      scores.technical += 20;
    } else if (wordCount > 2000) {
      scores.technical += 40;
      issues.push({
        type: 'success',
        category: 'technical',
        title: 'Comprehensive Content',
        description: 'Content length is excellent for SEO.'
      });
    } else {
      scores.technical += 35;
      issues.push({
        type: 'success',
        category: 'technical',
        title: 'Good Content Length',
        description: `Content has ${wordCount} words, which is good for SEO.`
      });
    }

    // Keyword Analysis
    const keywordDensity: {[key: string]: number} = {};
    if (focusKeyword) {
      const keywordRegex = new RegExp(focusKeyword.toLowerCase(), 'gi');
      const matches = (content + ' ' + title + ' ' + excerpt).match(keywordRegex);
      const totalWords = (content + ' ' + title + ' ' + excerpt).split(/\s+/).length;
      const density = matches ? (matches.length / totalWords) * 100 : 0;
      
      keywordDensity[focusKeyword] = density;
      
      if (density === 0) {
        issues.push({
          type: 'error',
          category: 'keywords',
          title: 'Focus Keyword Missing',
          description: 'Focus keyword not found in content.',
          suggestion: 'Include your focus keyword naturally in the content'
        });
      } else if (density < 0.5) {
        issues.push({
          type: 'warning',
          category: 'keywords',
          title: 'Low Keyword Density',
          description: `Keyword density is ${density.toFixed(2)}%. Consider 0.5-2.5%.`,
          suggestion: 'Use your focus keyword more naturally throughout the content'
        });
        scores.keywords += 20;
      } else if (density > 2.5) {
        issues.push({
          type: 'warning',
          category: 'keywords',
          title: 'High Keyword Density',
          description: `Keyword density is ${density.toFixed(2)}%. May appear spammy.`,
          suggestion: 'Reduce keyword usage to avoid over-optimization'
        });
        scores.keywords += 20;
      } else {
        scores.keywords += 40;
        issues.push({
          type: 'success',
          category: 'keywords',
          title: 'Optimal Keyword Density',
          description: `Keyword density is ${density.toFixed(2)}%, which is optimal.`
        });
      }

      // Title keyword check
      if (title.toLowerCase().includes(focusKeyword.toLowerCase())) {
        scores.keywords += 20;
        issues.push({
          type: 'success',
          category: 'keywords',
          title: 'Keyword in Title',
          description: 'Focus keyword found in title.'
        });
      } else {
        issues.push({
          type: 'warning',
          category: 'keywords',
          title: 'Keyword Not in Title',
          description: 'Consider including focus keyword in title.',
          suggestion: 'Add your focus keyword to the title naturally'
        });
      }
    }

    // Readability Analysis
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const avgWordsPerSentence = sentences.length > 0 ? wordCount / sentences.length : 0;
    
    if (avgWordsPerSentence > 20) {
      issues.push({
        type: 'warning',
        category: 'readability',
        title: 'Long Sentences',
        description: `Average ${avgWordsPerSentence.toFixed(1)} words per sentence. Consider shorter sentences.`,
        suggestion: 'Break long sentences into shorter, more readable ones'
      });
      scores.readability += 20;
    } else {
      scores.readability += 40;
      issues.push({
        type: 'success',
        category: 'readability',
        title: 'Good Sentence Length',
        description: 'Sentences are appropriately sized for readability.'
      });
    }

    // Structure Analysis
    const hasHeadings = /<h[1-6]>/i.test(content) || content.includes('#');
    if (!hasHeadings) {
      issues.push({
        type: 'warning',
        category: 'structure',
        title: 'No Headings Found',
        description: 'Content lacks headings for better structure.',
        suggestion: 'Add H2 and H3 headings to organize your content'
      });
    } else {
      scores.structure += 30;
      issues.push({
        type: 'success',
        category: 'structure',
        title: 'Good Content Structure',
        description: 'Content has headings for better organization.'
      });
    }

    // Meta Description Analysis
    if (!excerpt) {
      issues.push({
        type: 'warning',
        category: 'technical',
        title: 'Missing Meta Description',
        description: 'No meta description provided.',
        suggestion: 'Add a compelling 150-160 character meta description'
      });
    } else if (excerpt.length < 120) {
      issues.push({
        type: 'warning',
        category: 'technical',
        title: 'Short Meta Description',
        description: `Meta description is ${excerpt.length} characters. Recommended 120-160.`,
        suggestion: 'Expand your meta description to better describe the content'
      });
      scores.technical += 15;
    } else if (excerpt.length > 160) {
      issues.push({
        type: 'warning',
        category: 'technical',
        title: 'Long Meta Description',
        description: `Meta description is ${excerpt.length} characters. May be truncated.`,
        suggestion: 'Shorten your meta description to under 160 characters'
      });
      scores.technical += 15;
    } else {
      scores.technical += 25;
      issues.push({
        type: 'success',
        category: 'technical',
        title: 'Good Meta Description',
        description: 'Meta description length is optimal.'
      });
    }

    const overall = Math.round((scores.readability + scores.keywords + scores.structure + scores.technical) / 4);
    
    return {
      score: { ...scores, overall },
      issues,
      keywordDensity
    };
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Needs Work';
    return 'Poor';
  };

  const groupedIssues = {
    readability: issues.filter(issue => issue.category === 'readability'),
    keywords: issues.filter(issue => issue.category === 'keywords'),
    structure: issues.filter(issue => issue.category === 'structure'),
    technical: issues.filter(issue => issue.category === 'technical')
  };

  return (
    <div className="space-y-6">
      {/* Overall Score */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            SEO Analysis
            {isAnalyzing && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="text-center">
              <div className={`text-3xl font-bold ${getScoreColor(seoScore.overall)}`}>
                {seoScore.overall}
              </div>
              <div className="text-sm text-muted-foreground">Overall</div>
              <div className="text-xs font-medium">{getScoreLabel(seoScore.overall)}</div>
            </div>
            
            <div className="text-center">
              <div className={`text-2xl font-semibold ${getScoreColor(seoScore.readability)}`}>
                {seoScore.readability}
              </div>
              <div className="text-sm text-muted-foreground">Readability</div>
              <Progress value={seoScore.readability} className="mt-1 h-2" />
            </div>
            
            <div className="text-center">
              <div className={`text-2xl font-semibold ${getScoreColor(seoScore.keywords)}`}>
                {seoScore.keywords}
              </div>
              <div className="text-sm text-muted-foreground">Keywords</div>
              <Progress value={seoScore.keywords} className="mt-1 h-2" />
            </div>
            
            <div className="text-center">
              <div className={`text-2xl font-semibold ${getScoreColor(seoScore.structure)}`}>
                {seoScore.structure}
              </div>
              <div className="text-sm text-muted-foreground">Structure</div>
              <Progress value={seoScore.structure} className="mt-1 h-2" />
            </div>
            
            <div className="text-center">
              <div className={`text-2xl font-semibold ${getScoreColor(seoScore.technical)}`}>
                {seoScore.technical}
              </div>
              <div className="text-sm text-muted-foreground">Technical</div>
              <Progress value={seoScore.technical} className="mt-1 h-2" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Analysis */}
      <Tabs defaultValue="issues" className="space-y-4">
        <TabsList>
          <TabsTrigger value="issues" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Issues ({issues.filter(i => i.type !== 'success').length})
          </TabsTrigger>
          <TabsTrigger value="keywords" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Keywords
          </TabsTrigger>
          <TabsTrigger value="suggestions" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Suggestions
          </TabsTrigger>
        </TabsList>

        <TabsContent value="issues" className="space-y-4">
          {Object.entries(groupedIssues).map(([category, categoryIssues]) => (
            categoryIssues.length > 0 && (
              <Card key={category}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg capitalize">{category}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {categoryIssues.map((issue, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 rounded-lg border">
                      {issue.type === 'error' && <X className="h-5 w-5 text-red-500 mt-0.5" />}
                      {issue.type === 'warning' && <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5" />}
                      {issue.type === 'success' && <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />}
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium">{issue.title}</h4>
                          <Badge variant={issue.type === 'error' ? 'destructive' : issue.type === 'warning' ? 'secondary' : 'default'}>
                            {issue.type}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{issue.description}</p>
                        {issue.suggestion && (
                          <p className="text-sm text-blue-600 bg-blue-50 p-2 rounded">
                            💡 {issue.suggestion}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )
          ))}
        </TabsContent>

        <TabsContent value="keywords" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Keyword Analysis</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.keys(keywordDensity).length > 0 ? (
                <div className="space-y-3">
                  {Object.entries(keywordDensity).map(([keyword, density]) => (
                    <div key={keyword} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">{keyword}</div>
                        <div className="text-sm text-muted-foreground">
                          Density: {density.toFixed(2)}%
                        </div>
                      </div>
                      <Badge variant={density >= 0.5 && density <= 2.5 ? 'default' : 'secondary'}>
                        {density >= 0.5 && density <= 2.5 ? 'Optimal' : 'Needs Work'}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No focus keyword specified for analysis
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="suggestions" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Content Improvements
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-900">Add Internal Links</h4>
                  <p className="text-sm text-blue-700">Link to related content on your site to improve SEO and user experience.</p>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <h4 className="font-medium text-green-900">Use Alt Text</h4>
                  <p className="text-sm text-green-700">Add descriptive alt text to all images for better accessibility and SEO.</p>
                </div>
                <div className="p-3 bg-purple-50 rounded-lg">
                  <h4 className="font-medium text-purple-900">Add Schema Markup</h4>
                  <p className="text-sm text-purple-700">Implement structured data to help search engines understand your content.</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Performance Tips
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 bg-orange-50 rounded-lg">
                  <h4 className="font-medium text-orange-900">Optimize Images</h4>
                  <p className="text-sm text-orange-700">Compress images and use next-gen formats like WebP for faster loading.</p>
                </div>
                <div className="p-3 bg-teal-50 rounded-lg">
                  <h4 className="font-medium text-teal-900">Mobile-First</h4>
                  <p className="text-sm text-teal-700">Ensure your content looks great on mobile devices for better rankings.</p>
                </div>
                <div className="p-3 bg-red-50 rounded-lg">
                  <h4 className="font-medium text-red-900">Page Speed</h4>
                  <p className="text-sm text-red-700">Optimize loading speed - target under 3 seconds for first contentful paint.</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => analyzeSEO()}
              disabled={isAnalyzing}
            >
              Re-analyze
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => window.open(`https://pagespeed.web.dev/analysis?url=${encodeURIComponent(window.location.href)}`, '_blank')}
            >
              <Eye className="h-4 w-4 mr-1" />
              Check Page Speed
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => window.open(`https://search.google.com/search-console`, '_blank')}
            >
              Open Search Console
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}