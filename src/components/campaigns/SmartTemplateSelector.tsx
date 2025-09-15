'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useUserContext, shouldShowMultiClientFeatures } from '@/hooks/useUserContext';
import { useSmartTemplateRecommendations } from '@/hooks/useSmartTemplateRecommendations';
import {
  Sparkles,
  Target,
  Users,
  Crown,
  ArrowRight,
  Clock,
  TrendingUp,
  Heart,
  Lightbulb,
  Building,
  DollarSign,
  Home,
  ShoppingBag,
  Zap,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { CampaignTemplate } from '@/types/campaign';

/**
 * Smart Template Selector Component
 * Stage 2B: Context-aware template selection with intelligent recommendations
 */
interface SmartTemplateSelectorProps {
  onTemplateSelect: (template: CampaignTemplate | null) => void;
  onContinue: () => void;
  industry?: string;
  businessModel?: 'individual' | 'service_provider' | 'enterprise';
}

export function SmartTemplateSelector({
  onTemplateSelect,
  onContinue,
  industry,
  businessModel
}: SmartTemplateSelectorProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<CampaignTemplate | null>(null);
  const [activeTab, setActiveTab] = useState<string>('recommended');
  const userContext = useUserContext();
  const showMultiClient = shouldShowMultiClientFeatures(userContext);

  const {
    recommendations,
    isLoading,
    error,
    userProfile,
    getRecommendationsByCategory,
    getServiceProviderTemplates,
    getBeginnerFriendlyTemplates
  } = useSmartTemplateRecommendations({
    industry,
    businessModel: businessModel || userContext.organizationType,
    limit: 8
  });

  // Organize recommendations by categories
  const perfectMatches = getRecommendationsByCategory('perfect_match');
  const highlyRecommended = getRecommendationsByCategory('highly_recommended');
  const goodFits = getRecommendationsByCategory('good_fit');
  const serviceProviderTemplates = getServiceProviderTemplates();
  const beginnerTemplates = getBeginnerFriendlyTemplates();

  const handleTemplateClick = (template: CampaignTemplate) => {
    setSelectedTemplate(template);
    onTemplateSelect(template);
  };

  const handleStartFromScratch = () => {
    setSelectedTemplate(null);
    onTemplateSelect(null);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'perfect_match': return <Crown className="h-4 w-4" />;
      case 'highly_recommended': return <Sparkles className="h-4 w-4" />;
      case 'good_fit': return <Heart className="h-4 w-4" />;
      case 'service_provider': return <Users className="h-4 w-4" />;
      case 'beginner': return <Target className="h-4 w-4" />;
      default: return <Lightbulb className="h-4 w-4" />;
    }
  };

  const getIndustryIcon = (industry: string) => {
    switch (industry.toLowerCase()) {
      case 'legal & compliance': return <Target className="h-5 w-5" />;
      case 'financial services': return <DollarSign className="h-5 w-5" />;
      case 'real estate & property': return <Home className="h-5 w-5" />;
      case 'retail & e-commerce': return <ShoppingBag className="h-5 w-5" />;
      case 'government & public sector': return <Building className="h-5 w-5" />;
      default: return <Lightbulb className="h-5 w-5" />;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 0.8) return 'text-green-600 bg-green-50 border-green-200';
    if (score >= 0.7) return 'text-blue-600 bg-blue-50 border-blue-200';
    if (score >= 0.6) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-gray-600 bg-gray-50 border-gray-200';
  };

  const renderTemplateCard = (recommendation: any, showScore = true) => {
    const { template, score, reasons, category } = recommendation;
    const isSelected = selectedTemplate?.id === template.id;

    return (
      <Card
        key={template.id}
        className={`cursor-pointer transition-all duration-200 hover:shadow-lg card-enhanced ${
          isSelected
            ? 'border-primary ring-2 ring-primary/20 bg-primary/5'
            : 'hover:border-primary/30'
        }`}
        onClick={() => handleTemplateClick(template)}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg border border-primary/20">
                {getIndustryIcon(template.industry)}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <CardTitle className="text-base">{template.name}</CardTitle>
                  {showScore && (
                    <Badge className={`text-xs ${getScoreColor(score)}`} variant="outline">
                      {Math.round(score * 100)}% match
                    </Badge>
                  )}
                </div>
                <CardDescription className="text-xs">
                  {template.industry} • {template.duration} • {template.difficulty}
                </CardDescription>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-0 space-y-3">
          <p className="text-xs text-muted-foreground line-clamp-2">
            {template.description}
          </p>

          {/* Smart Reasons - Stage 2B Feature */}
          {reasons.length > 0 && (
            <div className="space-y-1">
              <h4 className="text-xs font-medium text-primary flex items-center gap-1">
                <Zap className="h-3 w-3" />
                Why this works for you:
              </h4>
              <div className="space-y-1">
                {reasons.slice(0, 2).map((reason, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs text-muted-foreground">
                    <CheckCircle className="h-3 w-3 text-green-600 flex-shrink-0" />
                    <span>{reason}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Results Preview */}
          <div className="grid grid-cols-3 gap-2 text-center pt-2 border-t border-border/30">
            <div>
              <div className="text-sm font-semibold text-primary">
                {template.estimatedResults.leads}+
              </div>
              <div className="text-xs text-muted-foreground">Leads</div>
            </div>
            <div>
              <div className="text-sm font-semibold text-green-600">
                {template.estimatedResults.consultations}+
              </div>
              <div className="text-xs text-muted-foreground">Calls</div>
            </div>
            <div>
              <div className="text-xs font-semibold text-blue-600">
                {template.estimatedResults.roi.split(' ')[0]}
              </div>
              <div className="text-xs text-muted-foreground">ROI</div>
            </div>
          </div>

          {/* Service Provider Context - Stage 2B Feature */}
          {showMultiClient && category === 'highly_recommended' && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-2">
              <div className="flex items-center gap-2 text-xs font-medium text-blue-900">
                <Users className="h-3 w-3" />
                Service Provider Optimized
              </div>
              <p className="text-xs text-blue-700 mt-1">
                High lead generation potential, suitable for multiple client types
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="text-center space-y-3">
          <div className="p-3 bg-primary/10 rounded-full w-fit mx-auto animate-pulse">
            <Sparkles className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-2xl font-bold">Analyzing Your Needs...</h2>
          <p className="text-muted-foreground">
            Finding the perfect templates for your business context
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map(i => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-3 bg-muted rounded"></div>
                  <div className="h-3 bg-muted rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center space-y-3">
        <AlertCircle className="h-8 w-8 text-red-500 mx-auto" />
        <h3 className="text-lg font-semibold">Unable to Load Templates</h3>
        <p className="text-muted-foreground">{error}</p>
        <Button onClick={() => window.location.reload()} variant="outline">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Context Information */}
      <div className="text-center space-y-3">
        <div className="flex justify-center">
          <div className="p-3 bg-primary/10 rounded-full border border-primary/20">
            <Sparkles className="h-8 w-8 text-primary" />
          </div>
        </div>
        <h2 className="text-2xl font-bold">Smart Template Recommendations</h2>
        <div className="max-w-2xl mx-auto space-y-2">
          <p className="text-muted-foreground">
            Based on your {userProfile.businessModel === 'service_provider' ? 'service provider' : 'individual'} profile
            {userProfile.industry && ` in ${userProfile.industry}`},
            here are the templates that will work best for you.
          </p>

          {/* Context Indicators */}
          <div className="flex flex-wrap justify-center gap-2">
            <Badge variant="outline" className="text-xs">
              {userProfile.businessModel === 'service_provider' ? 'Service Provider' : 'Individual Organization'}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {userProfile.experienceLevel} Level
            </Badge>
            {showMultiClient && (
              <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                <Users className="h-3 w-3 mr-1" />
                {userContext.clientCount} Clients
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Smart Template Categories */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 lg:grid-cols-5">
          <TabsTrigger value="recommended" className="text-xs">
            <Sparkles className="h-3 w-3 mr-1" />
            Recommended
          </TabsTrigger>
          <TabsTrigger value="perfect" className="text-xs">
            <Crown className="h-3 w-3 mr-1" />
            Perfect Match
          </TabsTrigger>
          {showMultiClient && (
            <TabsTrigger value="service-provider" className="text-xs">
              <Users className="h-3 w-3 mr-1" />
              Multi-Client
            </TabsTrigger>
          )}
          <TabsTrigger value="beginner" className="text-xs">
            <Target className="h-3 w-3 mr-1" />
            Beginner
          </TabsTrigger>
          <TabsTrigger value="all" className="text-xs">
            All Templates
          </TabsTrigger>
        </TabsList>

        {/* Recommended Templates */}
        <TabsContent value="recommended" className="space-y-4">
          <div className="text-center py-2">
            <Badge className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
              <TrendingUp className="h-3 w-3 mr-1" />
              Tailored for You
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...highlyRecommended, ...goodFits].slice(0, 6).map(rec => renderTemplateCard(rec))}
          </div>

          {recommendations.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Lightbulb className="h-8 w-8 mx-auto mb-2" />
              <p>No specific recommendations yet. Try the "All Templates" tab.</p>
            </div>
          )}
        </TabsContent>

        {/* Perfect Match Templates */}
        <TabsContent value="perfect" className="space-y-4">
          <div className="text-center py-2">
            <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
              <Crown className="h-3 w-3 mr-1" />
              Perfect Match
            </Badge>
            <p className="text-xs text-muted-foreground mt-1">
              These templates are highly aligned with your business context
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {perfectMatches.map(rec => renderTemplateCard(rec))}
          </div>

          {perfectMatches.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <p>No perfect matches found. Check "Recommended" for good alternatives.</p>
            </div>
          )}
        </TabsContent>

        {/* Service Provider Templates */}
        {showMultiClient && (
          <TabsContent value="service-provider" className="space-y-4">
            <div className="text-center py-2">
              <Badge className="bg-gradient-to-r from-green-500 to-teal-600 text-white">
                <Users className="h-3 w-3 mr-1" />
                Service Provider Optimized
              </Badge>
              <p className="text-xs text-muted-foreground mt-1">
                High lead generation and multi-client suitability
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {serviceProviderTemplates.map(rec => renderTemplateCard(rec))}
            </div>
          </TabsContent>
        )}

        {/* Beginner Templates */}
        <TabsContent value="beginner" className="space-y-4">
          <div className="text-center py-2">
            <Badge variant="outline" className="border-green-300 text-green-700 bg-green-50">
              <Target className="h-3 w-3 mr-1" />
              Beginner Friendly
            </Badge>
            <p className="text-xs text-muted-foreground mt-1">
              Easy to set up and proven to work
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {beginnerTemplates.map(rec => renderTemplateCard(rec))}
          </div>
        </TabsContent>

        {/* All Templates */}
        <TabsContent value="all" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recommendations.map(rec => renderTemplateCard(rec, false))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Start from Scratch Option */}
      <div className="pt-4 border-t border-border/50">
        <Card
          className={`cursor-pointer transition-all duration-200 hover:shadow-md border-dashed max-w-md mx-auto card-enhanced ${
            selectedTemplate === null
              ? 'border-primary ring-1 ring-primary/20 bg-primary/5'
              : 'border-border hover:border-primary/30'
          }`}
          onClick={handleStartFromScratch}
        >
          <CardContent className="flex items-center gap-4 py-6">
            <div className="p-3 bg-muted/50 rounded-lg flex-shrink-0">
              <Lightbulb className="h-6 w-6 text-muted-foreground" />
            </div>
            <div>
              <h3 className="font-medium">Start from Scratch</h3>
              <p className="text-sm text-muted-foreground">
                Create a completely custom campaign
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between pt-6">
        <div></div>
        <Button
          onClick={onContinue}
          disabled={selectedTemplate === undefined}
          className="min-w-32"
        >
          {selectedTemplate ? 'Use Template' : 'Continue'}
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>

      {/* Help Text */}
      {selectedTemplate && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="p-1 bg-blue-100 rounded-full">
              <Lightbulb className="h-4 w-4 text-blue-600" />
            </div>
            <div className="text-sm">
              <p className="font-medium text-blue-900 mb-1">
                Excellent choice! Here's what happens next:
              </p>
              <ul className="text-blue-700 space-y-1">
                <li>• We'll pre-fill all campaign details using this proven template</li>
                <li>• You can customize everything to match your business</li>
                <li>• All content, emails, and targeting strategies are included</li>
                <li>• Expected results: {selectedTemplate.estimatedResults.timeToResults}</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}