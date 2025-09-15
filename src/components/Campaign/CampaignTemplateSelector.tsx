'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Lightbulb,
  Target,
  TrendingUp,
  Users,
  Calendar,
  DollarSign,
  Crown,
  ArrowRight,
  Clock,
  BarChart3,
  Sparkles,
  ChevronDown,
  ChevronRight,
  Home,
  Building,
  Stethoscope,
  Monitor,
  ShoppingBag
} from 'lucide-react';
import { CAMPAIGN_TEMPLATES, TEMPLATE_CATEGORIES } from '@/data/campaign-templates';
import { CampaignTemplate } from '@/types/campaign';

interface CampaignTemplateSelectorProps {
  onTemplateSelect: (template: CampaignTemplate | null) => void;
  onContinue: () => void;
}

const CampaignTemplateSelector: React.FC<CampaignTemplateSelectorProps> = ({
  onTemplateSelect,
  onContinue
}) => {
  const [selectedTemplate, setSelectedTemplate] = useState<CampaignTemplate | null>(null);
  const [hoveredTemplate, setHoveredTemplate] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    'LEGAL_COMPLIANCE': true, // Keep most popular section expanded by default
    'FINANCIAL_SERVICES': false,
    'REAL_ESTATE': false,
    'RETAIL_ECOMMERCE': false,
    'PUBLIC_SECTOR': false
  });

  const handleTemplateClick = (template: CampaignTemplate) => {
    setSelectedTemplate(template);
    onTemplateSelect(template);
  };

  const handleStartFromScratch = () => {
    setSelectedTemplate(null);
    onTemplateSelect(null);
  };

  const toggleSection = (sectionKey: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionKey]: !prev[sectionKey]
    }));
  };

  const getCategoryIcon = (categoryKey: string) => {
    switch (categoryKey) {
      case 'LEGAL_COMPLIANCE':
        return <Target className="h-5 w-5" />;
      case 'FINANCIAL_SERVICES':
        return <DollarSign className="h-5 w-5" />;
      case 'REAL_ESTATE':
        return <Home className="h-5 w-5" />;
      case 'RETAIL_ECOMMERCE':
        return <ShoppingBag className="h-5 w-5" />;
      case 'PUBLIC_SECTOR':
        return <Building className="h-5 w-5" />;
      default:
        return <Lightbulb className="h-5 w-5" />;
    }
  };

  const getTemplatesByCategory = () => {
    const categorizedTemplates: Record<string, CampaignTemplate[]> = {};

    // Group templates by category
    Object.keys(TEMPLATE_CATEGORIES).forEach(categoryKey => {
      const category = TEMPLATE_CATEGORIES[categoryKey as keyof typeof TEMPLATE_CATEGORIES];
      categorizedTemplates[categoryKey] = CAMPAIGN_TEMPLATES.filter(
        template => category.templates.includes(template.id)
      );
    });

    return categorizedTemplates;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'advanced':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getIndustryIcon = (industry: string) => {
    switch (industry.toLowerCase()) {
      case 'legal & compliance':
        return <Target className="h-5 w-5" />;
      case 'financial services':
        return <DollarSign className="h-5 w-5" />;
      case 'real estate':
        return <Home className="h-5 w-5" />;
      case 'retail & e-commerce':
        return <ShoppingBag className="h-5 w-5" />;
      case 'public sector':
        return <Building className="h-5 w-5" />;
      case 'healthcare':
        return <Users className="h-5 w-5" />;
      case 'technology':
        return <BarChart3 className="h-5 w-5" />;
      default:
        return <Lightbulb className="h-5 w-5" />;
    }
  };

  const categorizedTemplates = getTemplatesByCategory();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="flex justify-center">
          <div className="p-3 bg-primary/10 rounded-full">
            <Sparkles className="h-8 w-8 text-primary" />
          </div>
        </div>
        <h2 className="text-2xl font-bold">Start with a Proven Template</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Skip the guesswork and start with campaigns that have already generated real results.
          Each template includes everything you need: content, email sequences, and targeting strategies.
        </p>
      </div>

      {/* Industry Categories */}
      <div className="space-y-4">
        {Object.keys(TEMPLATE_CATEGORIES).map((categoryKey) => {
          const category = TEMPLATE_CATEGORIES[categoryKey as keyof typeof TEMPLATE_CATEGORIES];
          const categoryTemplates = categorizedTemplates[categoryKey] || [];
          const isExpanded = expandedSections[categoryKey];
          const isMostPopular = categoryKey === 'LEGAL_COMPLIANCE';

          if (categoryTemplates.length === 0) return null;

          return (
            <div key={categoryKey} className="space-y-3">
              {/* Category Header */}
              <div
                className="flex items-center justify-between p-4 bg-muted/30 hover:bg-muted/50 rounded-lg cursor-pointer transition-colors"
                onClick={() => toggleSection(categoryKey)}
              >
                <div className="flex items-center gap-3">
                  {getCategoryIcon(categoryKey)}
                  <div>
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      {category.name}
                      {isMostPopular && (
                        <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
                          <Crown className="h-3 w-3 mr-1" />
                          MOST POPULAR
                        </Badge>
                      )}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {category.description} • {categoryTemplates.length} template{categoryTemplates.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {categoryTemplates.length} template{categoryTemplates.length !== 1 ? 's' : ''}
                  </Badge>
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </div>
              </div>

              {/* Category Templates */}
              {isExpanded && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-4">
                  {categoryTemplates.map((template, index) => (
                    <Card
                      key={template.id}
                      className={`cursor-pointer transition-all duration-200 hover:shadow-md border ${
                        selectedTemplate?.id === template.id
                          ? 'border-primary ring-2 ring-primary/20'
                          : 'border-border hover:border-primary/30'
                      } ${isMostPopular && index === 0 ? 'ring-1 ring-yellow-200' : ''}`}
                      onClick={() => handleTemplateClick(template)}
                      onMouseEnter={() => setHoveredTemplate(template.id)}
                      onMouseLeave={() => setHoveredTemplate(null)}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            {getIndustryIcon(template.industry)}
                            <div>
                              <CardTitle className="text-base">{template.name}</CardTitle>
                              <CardDescription className="text-xs">
                                {template.industry} • {template.duration}
                              </CardDescription>
                            </div>
                          </div>
                          <Badge className={getDifficultyColor(template.difficulty)} variant="outline">
                            {template.difficulty}
                          </Badge>
                        </div>
                      </CardHeader>

                      <CardContent className="pt-0 space-y-3">
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {template.description}
                        </p>

                        {/* Results Preview */}
                        <div className="grid grid-cols-3 gap-2 text-center">
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
                              {template.estimatedResults.roi.includes('%')
                                ? template.estimatedResults.roi.split(' ')[0]
                                : template.estimatedResults.roi}
                            </div>
                          </div>
                        </div>

                        {/* What's Included - Show for most popular template */}
                        {isMostPopular && index === 0 && (
                          <div className="space-y-2 pt-2 border-t border-border/50">
                            <h4 className="text-xs font-medium">What's Included:</h4>
                            <div className="grid grid-cols-2 gap-1 text-xs text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <div className="w-1 h-1 bg-primary rounded-full"></div>
                                {template.contentAssets.length} Content pieces
                              </div>
                              <div className="flex items-center gap-1">
                                <div className="w-1 h-1 bg-primary rounded-full"></div>
                                {template.emailSequences.length} Email sequences
                              </div>
                              <div className="flex items-center gap-1">
                                <div className="w-1 h-1 bg-primary rounded-full"></div>
                                {template.socialPosts.length} Social posts
                              </div>
                              <div className="flex items-center gap-1">
                                <div className="w-1 h-1 bg-primary rounded-full"></div>
                                Complete setup
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Quick Timeline for hovered templates */}
                        {hoveredTemplate === template.id && (
                          <div className="mt-3 p-2 bg-primary/5 rounded-lg border border-primary/20">
                            <div className="flex items-center gap-2 text-xs font-medium text-primary mb-1">
                              <Clock className="h-3 w-3" />
                              Quick Info
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Setup: ~2 hours • Results: {template.estimatedResults.timeToResults}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {/* Start from Scratch Option */}
        <div className="pt-4 border-t border-border/50">
          <Card
            className={`cursor-pointer transition-all duration-200 hover:shadow-md border-dashed max-w-md mx-auto ${
              selectedTemplate === null
                ? 'border-primary ring-1 ring-primary/20 bg-primary/5'
                : 'border-border hover:border-primary/30'
            }`}
            onClick={handleStartFromScratch}
          >
            <CardContent className="flex items-center gap-4 py-6">
              <div className="p-3 bg-muted rounded-full flex-shrink-0">
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
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between pt-6">
        <div></div> {/* Spacer for alignment */}
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
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
          <div className="flex items-start gap-3">
            <div className="p-1 bg-blue-100 rounded-full">
              <Lightbulb className="h-4 w-4 text-blue-600" />
            </div>
            <div className="text-sm">
              <p className="font-medium text-blue-900 mb-1">
                Great choice! Here's what happens next:
              </p>
              <ul className="text-blue-700 space-y-1">
                <li>• We'll pre-fill all campaign details using the template</li>
                <li>• You can customize everything to match your business</li>
                <li>• All content, emails, and social posts are included</li>
                <li>• Expected setup time: ~2 hours</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CampaignTemplateSelector;