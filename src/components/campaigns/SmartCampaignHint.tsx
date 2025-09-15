'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useUserContext, getCampaignRoute } from '@/hooks/useUserContext';
import {
  Users,
  Target,
  ArrowRight,
  X,
  Lightbulb,
  Building,
  Sparkles
} from 'lucide-react';

/**
 * Smart Campaign Hint Component
 * Stage 2A: Non-intrusive navigation suggestions based on user context
 */
interface SmartCampaignHintProps {
  currentPath?: string;
  variant?: 'banner' | 'card' | 'inline';
  showDismiss?: boolean;
}

export function SmartCampaignHint({
  currentPath = '',
  variant = 'card',
  showDismiss = true
}: SmartCampaignHintProps) {
  const [isDismissed, setIsDismissed] = useState(false);
  const context = useUserContext();
  const recommendedRoute = getCampaignRoute(context);

  // Don't show if loading, error, or dismissed
  if (context.isLoading || context.error || isDismissed) {
    return null;
  }

  // Don't show if user is already on the recommended path
  if (currentPath.includes(recommendedRoute)) {
    return null;
  }

  // Only show hints for service providers who might benefit from multi-client features
  if (!context.isServiceProvider && !context.hasMultipleClients) {
    return null;
  }

  const getHintContent = () => {
    if (context.isServiceProvider && context.hasMultipleClients) {
      return {
        title: 'Multi-Client Campaign Features Available',
        description: `Manage campaigns across ${context.clientCount} clients with unified analytics and cross-client insights.`,
        cta: 'Explore Multi-Client Campaigns',
        icon: <Users className="h-5 w-5" />,
        route: '/campaigns/multi-client',
        badge: 'Service Provider',
        variant: 'primary' as const
      };
    }

    if (context.isServiceProvider) {
      return {
        title: 'Service Provider Features',
        description: 'Access advanced campaign management tools designed for agencies and service providers.',
        cta: 'View Service Provider Dashboard',
        icon: <Building className="h-5 w-5" />,
        route: '/campaigns/multi-client',
        badge: 'Pro Features',
        variant: 'secondary' as const
      };
    }

    return null;
  };

  const hintContent = getHintContent();
  if (!hintContent) return null;

  // Banner variant for prominent placement
  if (variant === 'banner') {
    return (
      <div className="card-enhanced border-l-2 border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg border border-primary/20">
                {hintContent.icon}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-sm font-medium text-foreground">
                    {hintContent.title}
                  </h3>
                  <Badge variant="outline" className="text-xs">
                    <Sparkles className="h-3 w-3 mr-1" />
                    {hintContent.badge}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  {hintContent.description}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" asChild>
                <Link href={hintContent.route} className="flex items-center gap-1">
                  {hintContent.cta}
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </Button>
              {showDismiss && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsDismissed(true)}
                  className="h-8 w-8 p-0"
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </div>
    );
  }

  // Inline variant for subtle suggestions
  if (variant === 'inline') {
    return (
      <div className="flex items-center gap-2 p-2 bg-primary/5 rounded-lg border border-primary/10">
        <Lightbulb className="h-4 w-4 text-primary" />
        <span className="text-xs text-muted-foreground">
          {hintContent.description}
        </span>
        <Button variant="link" size="sm" asChild className="h-auto p-0 text-xs">
          <Link href={hintContent.route}>
            {hintContent.cta} →
          </Link>
        </Button>
        {showDismiss && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsDismissed(true)}
            className="h-6 w-6 p-0 ml-auto"
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>
    );
  }

  // Default card variant
  return (
    <Card className="card-enhanced border-l-2 border-primary/20">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-primary/10 rounded-lg border border-primary/20">
              {hintContent.icon}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-sm font-medium text-foreground">
                  {hintContent.title}
                </h3>
                <Badge variant="outline" className="text-xs">
                  <Sparkles className="h-3 w-3 mr-1" />
                  {hintContent.badge}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mb-3">
                {hintContent.description}
              </p>
              <Button size="sm" asChild>
                <Link href={hintContent.route} className="flex items-center gap-1">
                  {hintContent.cta}
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </Button>
            </div>
          </div>
          {showDismiss && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsDismissed(true)}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Context-aware campaign route suggestion
 * Stage 2A: Helper component for navigation hints
 */
export function CampaignRouteSuggestion({ className }: { className?: string }) {
  const context = useUserContext();
  const recommendedRoute = getCampaignRoute(context);

  if (context.isLoading || context.error) {
    return null;
  }

  const isOnRecommendedRoute = typeof window !== 'undefined' &&
    window.location.pathname.includes(recommendedRoute);

  if (isOnRecommendedRoute) {
    return null;
  }

  return (
    <div className={className}>
      <SmartCampaignHint variant="inline" showDismiss={false} />
    </div>
  );
}