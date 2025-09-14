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
  Sparkles
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

  const handleTemplateClick = (template: CampaignTemplate) => {
    setSelectedTemplate(template);
    onTemplateSelect(template);
  };

  const handleStartFromScratch = () => {
    setSelectedTemplate(null);
    onTemplateSelect(null);
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
      case 'healthcare':
        return <Users className="h-5 w-5" />;
      case 'technology':
        return <BarChart3 className="h-5 w-5" />;
      default:
        return <Lightbulb className="h-5 w-5" />;
    }
  };

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

      {/* Featured Template - Director Liability */}
      <div className="relative">
        <div className="absolute -top-3 left-6 z-10">
          <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-lg">
            <Crown className="h-3 w-3 mr-1" />
            MOST POPULAR
          </Badge>
        </div>

        <Card
          className={`cursor-pointer transition-all duration-300 hover:shadow-lg border-2 ${
            selectedTemplate?.id === 'director-liability-awareness'
              ? 'border-primary ring-2 ring-primary/20'
              : 'border-border hover:border-primary/50'
          }`}
          onClick={() => handleTemplateClick(CAMPAIGN_TEMPLATES[0])}
          onMouseEnter={() => setHoveredTemplate('director-liability-awareness')}
          onMouseLeave={() => setHoveredTemplate(null)}
        >
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                {getIndustryIcon(CAMPAIGN_TEMPLATES[0].industry)}
                <div>
                  <CardTitle className="text-lg">{CAMPAIGN_TEMPLATES[0].name}</CardTitle>
                  <CardDescription className="text-sm">
                    {CAMPAIGN_TEMPLATES[0].industry} • {CAMPAIGN_TEMPLATES[0].duration}
                  </CardDescription>
                </div>
              </div>
              <Badge className={getDifficultyColor(CAMPAIGN_TEMPLATES[0].difficulty)}>
                {CAMPAIGN_TEMPLATES[0].difficulty}
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {CAMPAIGN_TEMPLATES[0].description}
            </p>

            {/* Results Preview */}
            <div className="grid grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {CAMPAIGN_TEMPLATES[0].estimatedResults.leads}+
                </div>
                <div className="text-xs text-muted-foreground">Qualified Leads</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {CAMPAIGN_TEMPLATES[0].estimatedResults.consultations}+
                </div>
                <div className="text-xs text-muted-foreground">Consultations</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">400%</div>
                <div className="text-xs text-muted-foreground">ROI</div>
              </div>
            </div>

            {/* What's Included */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium">What's Included:</h4>
              <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                  {CAMPAIGN_TEMPLATES[0].contentAssets.length} Content pieces
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                  {CAMPAIGN_TEMPLATES[0].emailSequences.length} Email sequences
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                  {CAMPAIGN_TEMPLATES[0].socialPosts.length} Social posts
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                  Complete targeting setup
                </div>
              </div>
            </div>

            {/* Quick Timeline */}
            {hoveredTemplate === 'director-liability-awareness' && (
              <div className="mt-4 p-3 bg-primary/5 rounded-lg border border-primary/20">
                <div className="flex items-center gap-2 text-sm font-medium text-primary mb-2">
                  <Clock className="h-4 w-4" />
                  Campaign Timeline
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                  <div>Week 1-2: Awareness Phase</div>
                  <div>Week 3-6: Nurturing Phase</div>
                  <div>Setup Time: ~2 hours</div>
                  <div>Results: 2-4 weeks</div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Other Templates */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {CAMPAIGN_TEMPLATES.slice(1).map((template) => (
          <Card
            key={template.id}
            className={`cursor-pointer transition-all duration-200 hover:shadow-md border ${
              selectedTemplate?.id === template.id
                ? 'border-primary ring-1 ring-primary/20'
                : 'border-border hover:border-primary/30'
            }`}
            onClick={() => handleTemplateClick(template)}
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
                    {template.estimatedResults.roi}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Start from Scratch Option */}
        <Card
          className={`cursor-pointer transition-all duration-200 hover:shadow-md border-dashed ${
            selectedTemplate === null
              ? 'border-primary ring-1 ring-primary/20 bg-primary/5'
              : 'border-border hover:border-primary/30'
          }`}
          onClick={handleStartFromScratch}
        >
          <CardContent className="flex flex-col items-center justify-center h-full py-8 text-center space-y-3">
            <div className="p-3 bg-muted rounded-full">
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