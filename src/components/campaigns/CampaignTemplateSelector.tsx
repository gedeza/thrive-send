"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Sparkles, 
  TrendingUp, 
  Mail, 
  MessageSquare, 
  Target,
  Zap,
  Award,
  BarChart3,
  Users,
  Clock,
  CheckCircle
} from 'lucide-react';
import { TemplateQuickPicker, useTemplateSelection } from '@/components/templates/TemplateQuickPicker';
import { useToast } from '@/components/ui/use-toast';

interface Template {
  id: string;
  name: string;
  description: string;
  type: 'email' | 'social' | 'blog';
  category: string;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  performanceScore?: number;
  usageCount?: number;
  estimatedROI?: number;
  conversionRate?: number;
}

interface CampaignTemplateSelectorProps {
  campaignType: 'email' | 'social' | 'multi-channel';
  campaignGoal: 'awareness' | 'engagement' | 'conversion' | 'retention';
  onTemplateSelect: (template: Template) => void;
  onTemplateCollectionSelect: (templates: Template[]) => void;
}

// Template collections for different campaign strategies
const TEMPLATE_COLLECTIONS = {
  'email-nurture-sequence': {
    name: 'Email Nurture Sequence',
    description: '5-part welcome email series to convert new subscribers',
    templates: ['welcome', 'value-proposition', 'social-proof', 'limited-offer', 'final-cta'],
    estimatedConversion: '15-25%',
    duration: '7 days',
    color: 'bg-blue-100 text-blue-800 border-blue-200'
  },
  'product-launch-campaign': {
    name: 'Product Launch Campaign',
    description: 'Complete launch sequence across email and social',
    templates: ['teaser', 'announcement', 'feature-highlight', 'social-proof', 'launch-day'],
    estimatedConversion: '20-35%',
    duration: '14 days',
    color: 'bg-purple-100 text-purple-800 border-purple-200'
  },
  'seasonal-promotion': {
    name: 'Seasonal Promotion',
    description: 'Holiday/seasonal marketing campaign templates',
    templates: ['announcement', 'early-bird', 'urgency', 'last-chance'],
    estimatedConversion: '12-20%',
    duration: '21 days',
    color: 'bg-orange-100 text-orange-800 border-orange-200'
  },
  'retention-campaign': {
    name: 'Customer Retention',
    description: 'Win back inactive customers with targeted messaging',
    templates: ['we-miss-you', 'special-offer', 'feedback-request', 'loyalty-reward'],
    estimatedConversion: '8-15%',
    duration: '30 days',
    color: 'bg-green-100 text-green-800 border-green-200'
  }
};

export function CampaignTemplateSelector({
  campaignType,
  campaignGoal,
  onTemplateSelect,
  onTemplateCollectionSelect
}: CampaignTemplateSelectorProps) {
  const { toast } = useToast();
  const { selectedTemplate, selectTemplate, clearSelection } = useTemplateSelection('campaign');
  const [selectedCollection, setSelectedCollection] = useState<string | null>(null);

  // Get recommended collections based on campaign goal
  const getRecommendedCollections = () => {
    const recommendations = {
      'awareness': ['product-launch-campaign', 'seasonal-promotion'],
      'engagement': ['email-nurture-sequence', 'retention-campaign'],
      'conversion': ['product-launch-campaign', 'seasonal-promotion'],
      'retention': ['retention-campaign', 'email-nurture-sequence']
    };
    
    return recommendations[campaignGoal] || [];
  };

  const handleTemplateSelect = (template: Template) => {
    selectTemplate(template);
    onTemplateSelect(template);
    
    toast({
      title: "Campaign Template Selected! 🎯",
      description: `"${template.name}" ready for your ${campaignType} campaign`,
    });
  };

  const handleCollectionSelect = (collectionId: string) => {
    setSelectedCollection(collectionId);
    const collection = TEMPLATE_COLLECTIONS[collectionId as keyof typeof TEMPLATE_COLLECTIONS];
    
    // Mock template data - in real app, fetch from API
    const mockTemplates: Template[] = collection.templates.map((templateName, index) => ({
      id: `${collectionId}-${index}`,
      name: templateName.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()),
      description: `Professional ${templateName} template optimized for ${campaignGoal}`,
      type: campaignType as 'email' | 'social' | 'blog',
      category: campaignGoal,
      status: 'PUBLISHED' as const,
      performanceScore: 0.75 + (Math.random() * 0.2), // 75-95%
      usageCount: Math.floor(Math.random() * 100) + 10,
      estimatedROI: Math.floor(Math.random() * 500) + 200,
      conversionRate: Math.random() * 0.15 + 0.05 // 5-20%
    }));
    
    onTemplateCollectionSelect(mockTemplates);
    
    toast({
      title: `${collection.name} Collection Selected! 🚀`,
      description: `${collection.templates.length} templates ready for your campaign`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Campaign Context Header */}
      <Card className="bg-gradient-to-r from-blue-50/80 to-purple-50/80 border-blue-200">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-blue-900">
            <Target className="h-5 w-5" />
            Campaign Template Strategy
          </CardTitle>
          <div className="flex items-center gap-4 text-sm text-blue-700">
            <div className="flex items-center gap-1">
              <span className="font-medium">Type:</span>
              <Badge variant="outline" className="bg-blue-100 text-blue-800">{campaignType}</Badge>
            </div>
            <div className="flex items-center gap-1">
              <span className="font-medium">Goal:</span>
              <Badge variant="outline" className="bg-purple-100 text-purple-800">{campaignGoal}</Badge>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Tabs defaultValue="individual" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="individual" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">
            <Sparkles className="h-4 w-4 mr-1" />
            Individual Templates
          </TabsTrigger>
          <TabsTrigger value="collections" className="data-[state=active]:bg-purple-500 data-[state=active]:text-white">
            <Award className="h-4 w-4 mr-1" />
            Template Collections
          </TabsTrigger>
          <TabsTrigger value="ai-generate" className="data-[state=active]:bg-green-500 data-[state=active]:text-white">
            <Zap className="h-4 w-4 mr-1" />
            AI Generate
          </TabsTrigger>
        </TabsList>

        {/* Individual Templates */}
        <TabsContent value="individual" className="space-y-4">
          <Card>
            <CardContent className="p-4">
              <TemplateQuickPicker
                context="campaign"
                onSelect={handleTemplateSelect}
                filters={{
                  type: campaignType === 'multi-channel' ? undefined : campaignType as 'email' | 'social',
                  status: 'PUBLISHED'
                }}
                showAIRecommendations={true}
                maxTemplates={20}
              />
            </CardContent>
          </Card>

          {/* Performance Insights */}
          {selectedTemplate && (
            <Card className="border-green-200 bg-green-50/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-green-900 flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Template Performance Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {selectedTemplate.performanceScore ? Math.round(selectedTemplate.performanceScore * 100) : 'N/A'}%
                    </div>
                    <div className="text-xs text-green-700">Performance Score</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {selectedTemplate.usageCount || 0}
                    </div>
                    <div className="text-xs text-blue-700">Times Used</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      ${selectedTemplate.estimatedROI || 0}
                    </div>
                    <div className="text-xs text-purple-700">Est. ROI</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">
                      {selectedTemplate.conversionRate ? (selectedTemplate.conversionRate * 100).toFixed(1) : 'N/A'}%
                    </div>
                    <div className="text-xs text-orange-700">Conversion Rate</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Template Collections */}
        <TabsContent value="collections" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {Object.entries(TEMPLATE_COLLECTIONS).map(([id, collection]) => {
              const isRecommended = getRecommendedCollections().includes(id);
              const isSelected = selectedCollection === id;
              
              return (
                <Card 
                  key={id}
                  className={`cursor-pointer transition-all duration-200 ${
                    isSelected ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:shadow-md'
                  } ${isRecommended ? 'border-green-300 bg-green-50/30' : ''}`}
                  onClick={() => handleCollectionSelect(id)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-base">{collection.name}</CardTitle>
                        {isRecommended && (
                          <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300">
                            <Target className="h-3 w-3 mr-1" />
                            Recommended
                          </Badge>
                        )}
                      </div>
                      {isSelected && <CheckCircle className="h-5 w-5 text-blue-500" />}
                    </div>
                    <p className="text-sm text-muted-foreground">{collection.description}</p>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1">
                            <Mail className="h-3 w-3 text-blue-500" />
                            <span>{collection.templates.length} templates</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3 text-purple-500" />
                            <span>{collection.duration}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">Expected Conversion</span>
                          <span className="font-medium">{collection.estimatedConversion}</span>
                        </div>
                        <Progress value={75} className="h-2" />
                      </div>
                      
                      <div className="flex flex-wrap gap-1 mt-2">
                        {collection.templates.slice(0, 3).map((template, index) => (
                          <Badge 
                            key={index}
                            variant="outline" 
                            className={`text-xs ${collection.color}`}
                          >
                            {template.replace('-', ' ')}
                          </Badge>
                        ))}
                        {collection.templates.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{collection.templates.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* AI Generation */}
        <TabsContent value="ai-generate" className="space-y-4">
          <Card className="border-purple-200 bg-gradient-to-r from-purple-50/80 to-pink-50/80">
            <CardContent className="p-6 text-center">
              <div className="space-y-4">
                <div className="p-4 bg-purple-100 rounded-full w-fit mx-auto">
                  <Zap className="h-8 w-8 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-purple-900 mb-2">
                    AI Campaign Template Generator
                  </h3>
                  <p className="text-purple-700 mb-4">
                    Generate custom campaign templates using GPT-4 based on your specific goals, 
                    audience, and industry best practices.
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center gap-2 justify-center">
                    <Users className="h-4 w-4 text-purple-500" />
                    <span>Audience-optimized</span>
                  </div>
                  <div className="flex items-center gap-2 justify-center">
                    <TrendingUp className="h-4 w-4 text-purple-500" />
                    <span>Performance-focused</span>
                  </div>
                  <div className="flex items-center gap-2 justify-center">
                    <Target className="h-4 w-4 text-purple-500" />
                    <span>Goal-aligned</span>
                  </div>
                </div>
                
                <Button 
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                  onClick={() => {
                    toast({
                      title: "AI Template Generator Coming Soon! 🤖",
                      description: "Advanced AI campaign generation will be available in the next update",
                    });
                  }}
                >
                  <Zap className="h-4 w-4 mr-2" />
                  Generate AI Campaign
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}