"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from "@/components/ui/use-toast";
import { 
  FileText, 
  Target, 
  Sparkles, 
  TrendingUp, 
  Mail, 
  MessageSquare, 
  Users, 
  BarChart3,
  Plus,
  Search,
  Filter,
  RefreshCw,
  Zap,
  Award,
  CheckCircle,
  Clock,
  Copy,
  Play,
  Edit,
  Eye,
  ArrowRight,
  Star,
  Bookmark
} from "lucide-react";
import Link from "next/link";
import type { CampaignTemplate, TemplateCollection, TemplateFilters, TemplateStats } from '@/types';
import { 
  getTypeIcon,
  getGoalColor,
  getDifficultyColor,
  filterTemplates,
  calculateTemplateStats,
  transformToEnhancedTemplate
} from '@/lib/utils/template-utils';

// Enhanced template collections with real campaign data
const CAMPAIGN_TEMPLATE_COLLECTIONS: TemplateCollection[] = [
  {
    id: 'email-nurture-sequence',
    name: 'Email Nurture Sequence',
    description: '5-part welcome email series to convert new subscribers',
    templates: [],
    estimatedConversion: '15-25%',
    duration: '7 days',
    goal: 'conversion',
    color: 'bg-blue-100 text-blue-800 border-blue-200'
  },
  {
    id: 'product-launch-campaign',
    name: 'Product Launch Campaign',
    description: 'Complete launch sequence across email and social channels',
    templates: [],
    estimatedConversion: '20-35%',
    duration: '14 days',
    goal: 'awareness',
    color: 'bg-purple-100 text-purple-800 border-purple-200'
  },
  {
    id: 'seasonal-promotion',
    name: 'Seasonal Promotion Suite',
    description: 'Holiday and seasonal marketing campaign templates',
    templates: [],
    estimatedConversion: '12-20%',
    duration: '21 days',
    goal: 'conversion',
    color: 'bg-orange-100 text-orange-800 border-orange-200'
  },
  {
    id: 'retention-campaign',
    name: 'Customer Retention Program',
    description: 'Win back inactive customers with targeted messaging',
    templates: [],
    estimatedConversion: '8-15%',
    duration: '30 days',
    goal: 'retention',
    color: 'bg-green-100 text-green-800 border-green-200'
  },
  {
    id: 'social-engagement-series',
    name: 'Social Engagement Series',
    description: 'Multi-platform social media campaign templates',
    templates: [],
    estimatedConversion: '5-12%',
    duration: '14 days',
    goal: 'engagement',
    color: 'bg-indigo-100 text-indigo-800 border-indigo-200'
  }
];

// Loading component
function CampaignTemplateStatsLoading() {
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
  
  // State
  const [templates, setTemplates] = useState<CampaignTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedGoal, setSelectedGoal] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [activeTab, setActiveTab] = useState('individual');

  // Fetch templates with campaign context
  const fetchCampaignTemplates = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch templates with enhanced mode for performance data
      const response = await fetch("/api/templates?enhanced=true&context=campaign&limit=100");
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || `API Error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Transform general templates to campaign templates with enhanced data
      const campaignTemplates: CampaignTemplate[] = data.map(transformToEnhancedTemplate);
      
      setTemplates(campaignTemplates);
      setError(null);
    } catch (err) {
      const error = err as Error;
      console.error("Failed to fetch campaign templates:", error);
      setError(error.message);
      
      toast({
        title: "Failed to Load Campaign Templates",
        description: "Unable to fetch templates. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaignTemplates();
  }, []);


  // Filter templates using centralized utility
  const filteredTemplates = useMemo(() => {
    const filters: TemplateFilters = {
      searchQuery,
      type: selectedType === 'all' ? undefined : selectedType as any,
      campaignGoal: selectedGoal === 'all' ? undefined : selectedGoal as any,
      difficulty: selectedDifficulty === 'all' ? undefined : selectedDifficulty as any
    };
    return filterTemplates(templates, filters);
  }, [templates, searchQuery, selectedType, selectedGoal, selectedDifficulty]);

  // Calculate stats using centralized utility
  const templateStats = useMemo(() => calculateTemplateStats(templates), [templates]);

  // Handle template actions
  const handleTemplateUse = (template: CampaignTemplate) => {
    toast({
      title: `Using "${template.name}" 🚀`,
      description: "Template loaded for your campaign. Customize and launch!",
    });
    // In real app: navigate to campaign editor with template
  };

  const handleTemplateDuplicate = async (templateId: string, templateName: string) => {
    try {
      const response = await fetch(`/api/templates/${templateId}/duplicate`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to duplicate template');
      }

      toast({
        title: "Template Duplicated! 📋",
        description: `"${templateName}" copied successfully`,
      });

      // Refresh templates
      fetchCampaignTemplates();
    } catch (error) {
      toast({
        title: "Duplication Failed",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  const getTypeIconComponent = (type: string) => {
    switch (type) {
      case 'email': return <Mail className="h-4 w-4" />;
      case 'social': return <MessageSquare className="h-4 w-4" />;
      case 'blog': return <FileText className="h-4 w-4" />;
      case 'multi-channel': return <Target className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  if (error && templates.length === 0 && !loading) {
    return (
      <div className="space-y-6 p-6">
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
                <Target className="h-8 w-8 text-destructive" />
              </div>
            </div>
            <h3 className="text-lg font-semibold mb-2">Unable to Load Campaign Templates</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">{error}</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button variant="outline" onClick={fetchCampaignTemplates}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
              <Button asChild>
                <Link href="/service-provider/templates">
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
    <div className="space-y-6 p-6">
      {/* Enhanced Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="p-3 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full">
            <Target className="h-8 w-8 text-blue-600" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Campaign Templates
          </h1>
        </div>
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto mb-4">
          <strong>Launch high-converting campaigns faster</strong> with battle-tested templates optimized for specific goals and channels.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span>Goal-optimized templates</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>Performance-tracked</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
            <span>Multi-channel ready</span>
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <Button asChild size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
            <Link href="/service-provider/templates">
              <Sparkles className="mr-2 h-4 w-4" />
              Create Campaign Template
            </Link>
          </Button>
          <Button variant="outline" size="lg">
            <Award className="mr-2 h-4 w-4" />
            Browse Collections
          </Button>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <TrendingUp className="h-4 w-4" />
          <span>Templates boost campaign performance by <strong>3.2x on average</strong></span>
        </div>
      </div>

      {/* Enhanced Statistics */}
      {loading ? (
        <CampaignTemplateStatsLoading />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-blue-500 bg-gradient-to-br from-blue-50/50 to-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-blue-700">Campaign Templates</p>
                  <p className="text-3xl font-bold text-blue-600">{templateStats.total}</p>
                  <p className="text-xs text-blue-600/70">{templateStats.published} ready to use</p>
                </div>
                <div className="p-3 bg-blue-500/10 rounded-full">
                  <Target className="h-6 w-6 text-blue-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-purple-500 bg-gradient-to-br from-purple-50/50 to-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-purple-700">AI Recommended</p>
                  <p className="text-3xl font-bold text-purple-600">{templateStats.recommended}</p>
                  <p className="text-xs text-purple-600/70">High-performance picks</p>
                </div>
                <div className="p-3 bg-purple-500/10 rounded-full">
                  <Sparkles className="h-6 w-6 text-purple-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-green-500 bg-gradient-to-br from-green-50/50 to-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-green-700">Avg Performance</p>
                  <p className="text-3xl font-bold text-green-600">{templateStats.avgPerformance}%</p>
                  <p className="text-xs text-green-600/70">Success rate</p>
                </div>
                <div className="p-3 bg-green-500/10 rounded-full">
                  <TrendingUp className="h-6 w-6 text-green-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-orange-500 bg-gradient-to-br from-orange-50/50 to-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-orange-700">Total Usage</p>
                  <p className="text-3xl font-bold text-orange-600">{templateStats.totalUsage.toLocaleString()}</p>
                  <p className="text-xs text-orange-600/70">Times used across campaigns</p>
                </div>
                <div className="p-3 bg-orange-500/10 rounded-full">
                  <BarChart3 className="h-6 w-6 text-orange-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Enhanced Search and Filters */}
      <Card className="border-2 border-muted/50 bg-gradient-to-r from-slate-50/50 to-blue-50/30">
        <CardContent className="p-4">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Search className="h-4 w-4 text-blue-600" />
              </div>
              <Input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search campaign templates... (e.g., 'product launch', 'email sequence', 'retention')"
                className="flex-1 h-10 border-0 bg-white shadow-sm"
              />
            </div>
            
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium text-muted-foreground">Filters:</span>
              </div>
              
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="w-36 h-9 bg-white shadow-sm">
                  <SelectValue placeholder="Channel" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Channels</SelectItem>
                  <SelectItem value="email">📧 Email</SelectItem>
                  <SelectItem value="social">📱 Social</SelectItem>
                  <SelectItem value="multi-channel">🎯 Multi-Channel</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedGoal} onValueChange={setSelectedGoal}>
                <SelectTrigger className="w-36 h-9 bg-white shadow-sm">
                  <SelectValue placeholder="Goal" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Goals</SelectItem>
                  <SelectItem value="awareness">🌟 Awareness</SelectItem>
                  <SelectItem value="engagement">💬 Engagement</SelectItem>
                  <SelectItem value="conversion">💰 Conversion</SelectItem>
                  <SelectItem value="retention">🔄 Retention</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                <SelectTrigger className="w-36 h-9 bg-white shadow-sm">
                  <SelectValue placeholder="Difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="beginner">🌱 Beginner</SelectItem>
                  <SelectItem value="intermediate">⭐ Intermediate</SelectItem>
                  <SelectItem value="advanced">🚀 Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="individual" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">
            <FileText className="h-4 w-4 mr-1" />
            Individual Templates
          </TabsTrigger>
          <TabsTrigger value="collections" className="data-[state=active]:bg-purple-500 data-[state=active]:text-white">
            <Award className="h-4 w-4 mr-1" />
            Template Collections
          </TabsTrigger>
          <TabsTrigger value="recommended" className="data-[state=active]:bg-green-500 data-[state=active]:text-white">
            <Star className="h-4 w-4 mr-1" />
            AI Recommended
          </TabsTrigger>
        </TabsList>

        {/* Individual Templates */}
        <TabsContent value="individual" className="space-y-6">
          {filteredTemplates.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="p-8 text-center">
                <div className="flex justify-center mb-4">
                  <div className="p-4 bg-blue-100 rounded-full">
                    <Target className="h-12 w-12 text-blue-600" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold mb-3">No Templates Found</h3>
                <p className="text-muted-foreground mb-6">
                  {loading ? "Loading campaign templates..." : 
                   searchQuery ? "Try different search terms or clear filters" : 
                   "Create your first campaign template to get started"}
                </p>
                <div className="flex gap-3 justify-center">
                  <Button variant="outline" onClick={() => {
                    setSearchQuery('');
                    setSelectedType('all');
                    setSelectedGoal('all');
                    setSelectedDifficulty('all');
                  }}>
                    Clear Filters
                  </Button>
                  <Button asChild>
                    <Link href="/service-provider/templates">
                      <Plus className="h-4 w-4 mr-2" />
                      Create Template
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredTemplates.map((template) => (
                <Card key={template.id} className="hover:shadow-lg transition-all duration-200 group">
                  <CardHeader className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                          {getTypeIconComponent(template.type)}
                          <span className="ml-1 text-xs font-medium">{template.type}</span>
                        </div>
                        {template.isRecommended && (
                          <Badge className="bg-yellow-100 text-yellow-800 text-xs">
                            <Star className="h-3 w-3 mr-1" />
                            AI Pick
                          </Badge>
                        )}
                      </div>
                    </div>
                    <CardTitle className="text-base font-bold line-clamp-2">{template.name}</CardTitle>
                    <p className="text-sm text-muted-foreground line-clamp-2">{template.description}</p>
                  </CardHeader>

                  <CardContent className="p-4 pt-0 space-y-3">
                    <div className="flex flex-wrap gap-1">
                      <Badge variant="outline" className={`text-xs ${getGoalColor(template.campaignGoal)}`}>
                        {template.campaignGoal}
                      </Badge>
                      <Badge variant="outline" className={`text-xs ${getDifficultyColor(template.difficulty)}`}>
                        {template.difficulty}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <div className="font-medium text-green-600">
                          {template.performanceScore ? Math.round(template.performanceScore * 100) : 0}%
                        </div>
                        <div className="text-muted-foreground">Success Rate</div>
                      </div>
                      <div>
                        <div className="font-medium text-blue-600">{template.estimatedTime}</div>
                        <div className="text-muted-foreground">Setup Time</div>
                      </div>
                    </div>

                    <div className="flex gap-1 pt-2">
                      <Button 
                        size="sm" 
                        onClick={() => handleTemplateUse(template)}
                        className="h-7 px-2 text-xs flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                      >
                        <Play className="h-3 w-3 mr-1" />
                        Use Template
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleTemplateDuplicate(template.id, template.name)}
                        className="h-7 px-2 text-xs"
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Template Collections */}
        <TabsContent value="collections" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {CAMPAIGN_TEMPLATE_COLLECTIONS.map((collection) => (
              <Card key={collection.id} className="hover:shadow-lg transition-all duration-200 cursor-pointer group">
                <CardHeader className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <CardTitle className="text-lg">{collection.name}</CardTitle>
                    <Badge variant="outline" className={`${collection.color}`}>
                      {collection.goal}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground">{collection.description}</p>
                </CardHeader>

                <CardContent className="p-6 pt-0 space-y-4">
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div className="text-center">
                      <div className="font-bold text-blue-600">{collection.estimatedConversion}</div>
                      <div className="text-muted-foreground text-xs">Conversion Rate</div>
                    </div>
                    <div className="text-center">
                      <div className="font-bold text-purple-600">{collection.duration}</div>
                      <div className="text-muted-foreground text-xs">Duration</div>
                    </div>
                    <div className="text-center">
                      <div className="font-bold text-green-600">5</div>
                      <div className="text-muted-foreground text-xs">Templates</div>
                    </div>
                  </div>

                  <Button className="w-full group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <ArrowRight className="h-4 w-4 mr-2" />
                    Use Collection
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* AI Recommended */}
        <TabsContent value="recommended" className="space-y-6">
          <Card className="border-yellow-200 bg-gradient-to-r from-yellow-50/80 to-orange-50/80">
            <CardContent className="p-6 text-center">
              <div className="space-y-4">
                <div className="p-4 bg-yellow-100 rounded-full w-fit mx-auto">
                  <Sparkles className="h-8 w-8 text-yellow-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-yellow-900 mb-2">
                    AI-Powered Template Recommendations
                  </h3>
                  <p className="text-yellow-700 mb-4">
                    Based on your campaign history and industry performance data, these templates 
                    are most likely to drive results for your goals.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {templates.filter(t => t.isRecommended).slice(0, 6).map((template) => (
              <Card key={template.id} className="hover:shadow-lg transition-all duration-200 border-yellow-200 bg-yellow-50/30">
                <CardHeader className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className="bg-yellow-100 text-yellow-800 text-xs">
                      <Star className="h-3 w-3 mr-1" />
                      AI Recommended
                    </Badge>
                  </div>
                  <CardTitle className="text-base font-bold line-clamp-2">{template.name}</CardTitle>
                  <p className="text-sm text-muted-foreground line-clamp-2">{template.description}</p>
                </CardHeader>

                <CardContent className="p-4 pt-0">
                  <div className="space-y-3">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {Math.round((template.performanceScore || 0) * 100)}%
                      </div>
                      <div className="text-xs text-muted-foreground">Expected Success Rate</div>
                    </div>

                    <Button 
                      size="sm" 
                      onClick={() => handleTemplateUse(template)}
                      className="w-full bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700"
                    >
                      <Star className="h-3 w-3 mr-1" />
                      Use Recommended Template
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {templates.filter(t => t.isRecommended).length === 0 && (
            <Card>
              <CardContent className="p-8 text-center">
                <div className="flex justify-center mb-4">
                  <div className="p-3 bg-muted rounded-full">
                    <Sparkles className="h-8 w-8 text-muted-foreground" />
                  </div>
                </div>
                <h3 className="text-lg font-semibold mb-2">No AI Recommendations Yet</h3>
                <p className="text-muted-foreground">
                  Use more templates to help our AI learn your preferences and provide personalized recommendations.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}