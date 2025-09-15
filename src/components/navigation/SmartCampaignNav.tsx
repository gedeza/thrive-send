'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useUserContext, shouldShowMultiClientFeatures } from '@/hooks/useUserContext';
import {
  Target,
  Users,
  BarChart3,
  Plus,
  Building,
  Sparkles,
  Settings
} from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Smart Campaign Navigation
 * Stage 2A: Context-aware navigation that adapts to user type
 */
interface SmartCampaignNavProps {
  className?: string;
  variant?: 'sidebar' | 'header' | 'tabs';
  showLabels?: boolean;
}

export function SmartCampaignNav({
  className,
  variant = 'sidebar',
  showLabels = true
}: SmartCampaignNavProps) {
  const pathname = usePathname();
  const context = useUserContext();
  const showMultiClient = shouldShowMultiClientFeatures(context);

  // Base navigation items available to all users
  const baseNavItems = [
    {
      href: '/campaigns',
      label: 'My Campaigns',
      icon: Target,
      description: 'Individual campaign management',
      isActive: pathname === '/campaigns'
    },
    {
      href: '/campaigns/new',
      label: 'Create Campaign',
      icon: Plus,
      description: 'Start a new campaign',
      isActive: pathname.startsWith('/campaigns/new')
    },
    {
      href: '/campaigns/analytics',
      label: 'Analytics',
      icon: BarChart3,
      description: 'Campaign performance insights',
      isActive: pathname.includes('/campaigns/analytics') && !pathname.includes('/multi-client/')
    }
  ];

  // Enhanced navigation items for service providers
  const multiClientNavItems = [
    {
      href: '/campaigns/multi-client',
      label: 'Multi-Client Campaigns',
      icon: Users,
      description: 'Manage campaigns across multiple clients',
      isActive: pathname === '/campaigns/multi-client',
      badge: 'Pro',
      highlight: true
    },
    {
      href: '/campaigns/multi-client/create',
      label: 'Create Multi-Client',
      icon: Building,
      description: 'Cross-client campaign creation',
      isActive: pathname.startsWith('/campaigns/multi-client/create'),
      badge: 'New'
    },
    {
      href: '/campaigns/multi-client/analytics',
      label: 'Cross-Client Analytics',
      icon: BarChart3,
      description: 'Unified analytics across all clients',
      isActive: pathname.includes('/campaigns/multi-client/analytics'),
      badge: 'Pro'
    }
  ];

  // Combine navigation items based on user context
  const navItems = showMultiClient
    ? [...baseNavItems, ...multiClientNavItems]
    : baseNavItems;

  // Loading state
  if (context.isLoading) {
    return (
      <div className={cn("space-y-2", className)}>
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-3 p-2">
            <div className="w-5 h-5 bg-muted animate-pulse rounded" />
            {showLabels && <div className="w-24 h-4 bg-muted animate-pulse rounded" />}
          </div>
        ))}
      </div>
    );
  }

  const renderNavItem = (item: typeof navItems[0]) => {
    const Icon = item.icon;
    const isActive = item.isActive;

    const content = (
      <>
        <div className={cn(
          "p-2 rounded-lg transition-colors",
          isActive
            ? "bg-primary text-primary-foreground"
            : "bg-muted/10 hover:bg-muted/20"
        )}>
          <Icon className="h-4 w-4" />
        </div>

        {showLabels && (
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className={cn(
                "text-sm font-medium",
                isActive ? "text-foreground" : "text-muted-foreground"
              )}>
                {item.label}
              </span>

              {item.badge && (
                <Badge
                  variant={item.highlight ? "default" : "secondary"}
                  className="text-xs"
                >
                  {item.badge === 'Pro' && <Sparkles className="h-3 w-3 mr-1" />}
                  {item.badge}
                </Badge>
              )}
            </div>

            {item.description && variant === 'sidebar' && (
              <p className="text-xs text-muted-foreground mt-1">
                {item.description}
              </p>
            )}
          </div>
        )}
      </>
    );

    if (variant === 'header') {
      return (
        <Button
          key={item.href}
          variant={isActive ? "default" : "ghost"}
          size="sm"
          asChild
          className="flex items-center gap-2"
        >
          <Link href={item.href}>
            {content}
          </Link>
        </Button>
      );
    }

    if (variant === 'tabs') {
      return (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            "flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors",
            isActive
              ? "bg-primary text-primary-foreground"
              : "hover:bg-muted text-muted-foreground hover:text-foreground"
          )}
        >
          {content}
        </Link>
      );
    }

    // Default sidebar variant
    return (
      <Link
        key={item.href}
        href={item.href}
        className={cn(
          "flex items-center gap-3 p-3 rounded-lg transition-colors",
          isActive
            ? "bg-primary/10 text-primary border border-primary/20"
            : "hover:bg-muted/50 text-muted-foreground hover:text-foreground",
          item.highlight && !isActive && "ring-1 ring-primary/20"
        )}
        title={item.description}
      >
        {content}
      </Link>
    );
  };

  const containerClass = cn(
    variant === 'header' && "flex items-center gap-2",
    variant === 'tabs' && "flex flex-wrap gap-1",
    variant === 'sidebar' && "space-y-1",
    className
  );

  return (
    <nav className={containerClass}>
      {navItems.map(renderNavItem)}

      {/* Service Provider Context Indicator */}
      {showMultiClient && variant === 'sidebar' && (
        <div className="mt-4 p-3 bg-primary/5 rounded-lg border border-primary/10">
          <div className="flex items-center gap-2 mb-1">
            <Settings className="h-4 w-4 text-primary" />
            <span className="text-xs font-medium text-primary">
              Service Provider Mode
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            Managing {context.clientCount} client{context.clientCount !== 1 ? 's' : ''}
          </p>
        </div>
      )}
    </nav>
  );
}

/**
 * Quick Campaign Actions based on context
 * Stage 2A: Context-aware action shortcuts
 */
export function QuickCampaignActions({ className }: { className?: string }) {
  const context = useUserContext();
  const showMultiClient = shouldShowMultiClientFeatures(context);

  if (context.isLoading) {
    return null;
  }

  return (
    <div className={cn("flex gap-2", className)}>
      <Button size="sm" asChild>
        <Link href="/campaigns/new">
          <Plus className="h-4 w-4 mr-2" />
          New Campaign
        </Link>
      </Button>

      {showMultiClient && (
        <Button size="sm" variant="outline" asChild>
          <Link href="/campaigns/multi-client/create">
            <Users className="h-4 w-4 mr-2" />
            Multi-Client
          </Link>
        </Button>
      )}
    </div>
  );
}