'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useUserContext, shouldShowMultiClientFeatures } from '@/hooks/useUserContext';
import { useSmartTemplateRecommendations } from '@/hooks/useSmartTemplateRecommendations';
import {
  Sparkles,
  ArrowRight,
  Crown,
  Users,
  TrendingUp,
  Lightbulb,
  X,
  ChevronRight
} from 'lucide-react';
import Link from 'next/link';

/**
 * Contextual Template Recommendation Widget
 * Stage 2B: Smart template suggestions that appear contextually throughout the app
 */
interface ContextualTemplateWidgetProps {
  context?: 'dashboard' | 'campaigns' | 'content' | 'sidebar';
  limit?: number;
  showDismiss?: boolean;
  className?: string;
  onTemplateSelect?: (templateId: string) => void;
}

export function ContextualTemplateWidget({
  context = 'dashboard',
  limit = 3,
  showDismiss = true,
  className = '',
  onTemplateSelect
}: ContextualTemplateWidgetProps) {
  const [isDismissed, setIsDismissed] = useState(false);
  const userContext = useUserContext();
  const showMultiClient = shouldShowMultiClientFeatures(userContext);

  const { recommendations, isLoading, error } = useSmartTemplateRecommendations({
    limit: limit + 2 // Get a few extra to account for filtering
  });

  // Don't show if dismissed or still loading user context
  if (isDismissed || userContext.isLoading || error) {
    return null;
  }

  // Filter recommendations based on context
  const contextualRecommendations = recommendations
    .filter(rec => {
      switch (context) {
        case 'dashboard':
          // Show high-scoring templates for dashboard
          return rec.score >= 0.7;
        case 'campaigns':
          // Show all recommendations for campaigns page
          return true;
        case 'content':
          // Show templates with good content assets
          return rec.template.contentAssets.length > 0;
        case 'sidebar':
          // Show only perfect matches for sidebar
          return rec.category === 'perfect_match' || rec.score >= 0.8;
        default:
          return true;
      }
    })
    .slice(0, limit);

  if (contextualRecommendations.length === 0 && !isLoading) {
    return null;
  }

  const getContextTitle = () => {
    switch (context) {
      case 'dashboard':
        return userContext.isServiceProvider
          ? 'Recommended for Service Providers'
          : 'Recommended Campaign Templates';
      case 'campaigns':
        return 'Smart Template Suggestions';
      case 'content':
        return 'Content-Ready Templates';
      case 'sidebar':
        return 'Perfect Match';
      default:
        return 'Recommended Templates';
    }
  };

  const getContextDescription = () => {
    if (userContext.isServiceProvider) {
      return `Based on your ${userContext.clientCount} clients, these templates will maximize your lead generation.`;
    }
    return 'Templates tailored to your business profile and goals.';
  };

  // Compact layout for sidebar context
  if (context === 'sidebar') {
    return (
      <Card className={`card-enhanced border-l-2 border-primary/20 ${className}`}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <CardTitle className="text-sm">Template Match</CardTitle>
            </div>
            {showDismiss && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={() => setIsDismissed(true)}
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent className="pt-0 space-y-2">
          {isLoading ? (
            <div className="space-y-2">
              {[1, 2].map(i => (
                <div key={i} className="animate-pulse">
                  <div className="h-4 bg-muted rounded w-3/4 mb-1"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : (
            contextualRecommendations.slice(0, 2).map((rec, idx) => (
              <div key={rec.template.id} className="space-y-1">
                <div className="flex items-center gap-2">
                  <Badge className="text-xs bg-primary/10 text-primary border-primary/20">
                    {Math.round(rec.score * 100)}%
                  </Badge>
                  <span className="text-xs font-medium truncate">{rec.template.name}</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {rec.reasons[0]}
                </p>
                {idx === 0 && contextualRecommendations.length > 1 && (
                  <hr className="border-border/50" />
                )}
              </div>
            ))
          )}

          <Button asChild variant="ghost" size="sm" className="w-full mt-2">
            <Link href="/campaigns/new" className="flex items-center justify-center gap-1">
              <span className="text-xs">View All Templates</span>
              <ChevronRight className="h-3 w-3" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Full layout for other contexts
  return (
    <Card className={`card-enhanced border-l-2 border-primary/20 ${className}`}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg border border-primary/20">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">{getContextTitle()}</CardTitle>
              <p className="text-sm text-muted-foreground">
                {getContextDescription()}
              </p>
            </div>
          </div>
          {showDismiss && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => setIsDismissed(true)}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-0 space-y-4">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="animate-pulse border rounded-lg p-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-muted rounded"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-muted rounded w-3/4 mb-1"></div>
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {contextualRecommendations.map((rec, idx) => {
              const { template, score, reasons, category } = rec;

              return (
                <div
                  key={template.id}
                  className="border rounded-lg p-3 hover:shadow-sm transition-shadow cursor-pointer"
                  onClick={() => onTemplateSelect?.(template.id)}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0">
                      {category === 'perfect_match' && <Crown className="h-4 w-4 text-yellow-600" />}
                      {category === 'highly_recommended' && <Sparkles className="h-4 w-4 text-blue-600" />}
                      {category === 'good_fit' && <TrendingUp className="h-4 w-4 text-green-600" />}
                      {category === 'alternative' && <Lightbulb className="h-4 w-4 text-gray-600" />}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-sm truncate">{template.name}</h4>
                        <Badge className="text-xs bg-primary/10 text-primary border-primary/20 flex-shrink-0">
                          {Math.round(score * 100)}% match
                        </Badge>
                      </div>

                      <p className="text-xs text-muted-foreground line-clamp-1 mb-2">
                        {template.description}
                      </p>

                      {/* Smart reason */}
                      {reasons[0] && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <TrendingUp className="h-3 w-3 text-green-600" />
                          <span>{reasons[0]}</span>
                        </div>
                      )}

                      {/* Results preview */}
                      <div className="flex items-center gap-4 mt-2 text-xs">
                        <span className="text-primary font-medium">
                          {template.estimatedResults.leads}+ leads
                        </span>
                        <span className="text-green-600 font-medium">
                          {template.estimatedResults.roi.split(' ')[0]} ROI
                        </span>
                        {showMultiClient && template.estimatedResults.consultations > 5 && (
                          <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                            <Users className="h-3 w-3 mr-1" />
                            Multi-client ready
                          </Badge>
                        )}
                      </div>
                    </div>

                    <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Action Button */}
        <div className="flex items-center justify-between pt-2 border-t border-border/50">
          <div className="text-xs text-muted-foreground">
            {contextualRecommendations.length} of {recommendations.length} templates shown
          </div>
          <Button asChild variant="outline" size="sm">
            <Link href="/campaigns/new" className="flex items-center gap-2">
              View All Templates
              <ArrowRight className="h-3 w-3" />
            </Link>
          </Button>
        </div>

        {/* Service Provider Context Hint */}
        {showMultiClient && context === 'dashboard' && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Users className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-900">Service Provider Tip</span>
            </div>
            <p className="text-xs text-blue-700">
              These templates are optimized for agencies managing multiple clients.
              Higher lead generation and consultation booking rates.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}