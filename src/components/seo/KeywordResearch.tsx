'use client';

import React, { useState } from 'react';
import { Search, TrendingUp, Users, Zap, ArrowRight, Star, Target, BookOpen } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface KeywordData {
  keyword: string;
  searchVolume: number;
  difficulty: number;
  cpc: number;
  competition: 'Low' | 'Medium' | 'High';
  trend: 'up' | 'down' | 'stable';
  relatedKeywords: string[];
}

interface KeywordResearchProps {
  onKeywordSelect?: (keyword: string) => void;
}

const mockKeywordData: KeywordData[] = [
  {
    keyword: 'content marketing',
    searchVolume: 40500,
    difficulty: 72,
    cpc: 3.45,
    competition: 'High',
    trend: 'up',
    relatedKeywords: ['content strategy', 'digital marketing', 'content creation']
  },
  {
    keyword: 'content marketing strategy',
    searchVolume: 12100,
    difficulty: 65,
    cpc: 4.12,
    competition: 'Medium',
    trend: 'up',
    relatedKeywords: ['marketing strategy', 'content planning', 'content calendar']
  },
  {
    keyword: 'content marketing tools',
    searchVolume: 8900,
    difficulty: 58,
    cpc: 5.23,
    competition: 'Medium',
    trend: 'stable',
    relatedKeywords: ['marketing automation', 'content management', 'social media tools']
  },
  {
    keyword: 'content marketing tips',
    searchVolume: 6700,
    difficulty: 45,
    cpc: 2.89,
    competition: 'Low',
    trend: 'up',
    relatedKeywords: ['marketing tips', 'content best practices', 'content optimization']
  },
  {
    keyword: 'email marketing automation',
    searchVolume: 15200,
    difficulty: 69,
    cpc: 6.78,
    competition: 'High',
    trend: 'up',
    relatedKeywords: ['email automation', 'drip campaigns', 'marketing automation']
  }
];

const mockRelatedKeywords = [
  'content marketing platform',
  'content marketing software',
  'content marketing analytics',
  'content marketing ROI',
  'content marketing metrics',
  'content marketing trends',
  'B2B content marketing',
  'content marketing examples',
  'content marketing case studies',
  'content marketing calendar'
];

export function KeywordResearch({ onKeywordSelect }: KeywordResearchProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [keywordData, setKeywordData] = useState<KeywordData[]>(mockKeywordData);
  const [selectedKeyword, setSelectedKeyword] = useState<KeywordData | null>(null);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Filter mock data based on search query
    const filtered = mockKeywordData.filter(item => 
      item.keyword.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.relatedKeywords.some(related => 
        related.toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
    
    setKeywordData(filtered.length > 0 ? filtered : mockKeywordData);
    setIsSearching(false);
  };

  const getDifficultyColor = (difficulty: number) => {
    if (difficulty >= 70) return 'text-red-600';
    if (difficulty >= 50) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getDifficultyLabel = (difficulty: number) => {
    if (difficulty >= 70) return 'Hard';
    if (difficulty >= 50) return 'Medium';
    return 'Easy';
  };

  const getCompetitionColor = (competition: string) => {
    switch (competition) {
      case 'High': return 'bg-red-100 text-red-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down': return <TrendingUp className="h-4 w-4 text-red-500 transform rotate-180" />;
      default: return <div className="h-4 w-4 bg-gray-400 rounded-full" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Search Interface */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Keyword Research
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <div className="flex-1">
              <Input
                placeholder="Enter a keyword or topic to research..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <Button onClick={handleSearch} disabled={isSearching}>
              {isSearching ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Search className="h-4 w-4" />
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="keywords" className="space-y-4">
        <TabsList>
          <TabsTrigger value="keywords" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Keywords ({keywordData.length})
          </TabsTrigger>
          <TabsTrigger value="related" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Related Keywords
          </TabsTrigger>
          <TabsTrigger value="analysis" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Analysis
          </TabsTrigger>
        </TabsList>

        <TabsContent value="keywords" className="space-y-4">
          {keywordData.map((keyword, index) => (
            <Card 
              key={index} 
              className={`cursor-pointer transition-all hover:shadow-md ${
                selectedKeyword?.keyword === keyword.keyword ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => setSelectedKeyword(keyword)}
            >
              <CardContent className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-6 gap-4 items-center">
                  <div className="lg:col-span-2">
                    <h3 className="font-semibold text-lg mb-2">{keyword.keyword}</h3>
                    <div className="flex items-center gap-2">
                      {getTrendIcon(keyword.trend)}
                      <Badge className={getCompetitionColor(keyword.competition)}>
                        {keyword.competition}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {keyword.searchVolume.toLocaleString()}
                    </div>
                    <div className="text-sm text-muted-foreground">Monthly Searches</div>
                  </div>
                  
                  <div className="text-center">
                    <div className={`text-2xl font-bold ${getDifficultyColor(keyword.difficulty)}`}>
                      {keyword.difficulty}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {getDifficultyLabel(keyword.difficulty)}
                    </div>
                    <Progress value={keyword.difficulty} className="mt-2 h-2" />
                  </div>
                  
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      ${keyword.cpc.toFixed(2)}
                    </div>
                    <div className="text-sm text-muted-foreground">CPC</div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedKeyword(keyword);
                      }}
                    >
                      View Details
                    </Button>
                    <Button 
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onKeywordSelect?.(keyword.keyword);
                      }}
                    >
                      Use Keyword
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="related" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Related Keywords</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {mockRelatedKeywords.map((keyword, index) => (
                  <div 
                    key={index}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 cursor-pointer"
                    onClick={() => onKeywordSelect?.(keyword)}
                  >
                    <span className="font-medium">{keyword}</span>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analysis" className="space-y-4">
          {selectedKeyword ? (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="h-5 w-5" />
                    Keyword Analysis: {selectedKeyword.keyword}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-blue-600">
                        {selectedKeyword.searchVolume.toLocaleString()}
                      </div>
                      <div className="text-sm text-blue-700">Monthly Searches</div>
                    </div>
                    
                    <div className="text-center p-4 bg-red-50 rounded-lg">
                      <Target className="h-8 w-8 text-red-600 mx-auto mb-2" />
                      <div className={`text-2xl font-bold ${getDifficultyColor(selectedKeyword.difficulty)}`}>
                        {selectedKeyword.difficulty}
                      </div>
                      <div className="text-sm text-red-700">Difficulty Score</div>
                    </div>
                    
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        ${selectedKeyword.cpc.toFixed(2)}
                      </div>
                      <div className="text-sm text-green-700">Cost Per Click</div>
                    </div>
                    
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">
                        {selectedKeyword.competition}
                      </div>
                      <div className="text-sm text-purple-700">Competition</div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-3">Related Keywords</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedKeyword.relatedKeywords.map((related, index) => (
                        <Badge 
                          key={index} 
                          variant="outline" 
                          className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                          onClick={() => onKeywordSelect?.(related)}
                        >
                          {related}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="p-4 bg-muted rounded-lg">
                    <h4 className="font-semibold mb-2">Optimization Suggestions</h4>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                        <span>Use this keyword in your title tag and H1 heading</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                        <span>Include related keywords naturally throughout your content</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                        <span>Create comprehensive content (1500+ words) to compete effectively</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                        <span>Build high-quality backlinks to improve ranking potential</span>
                      </li>
                    </ul>
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={() => onKeywordSelect?.(selectedKeyword.keyword)}>
                      Use as Focus Keyword
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => setSearchQuery(selectedKeyword.keyword)}
                    >
                      Research Similar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Select a Keyword</h3>
                <p className="text-muted-foreground">
                  Choose a keyword from the list to see detailed analysis and optimization suggestions.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}