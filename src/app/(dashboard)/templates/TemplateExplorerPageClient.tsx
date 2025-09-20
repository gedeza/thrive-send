'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronRight, BookOpen, Sparkles } from 'lucide-react';
import { HybridTemplateExplorer } from '@/components/templates/HybridTemplateExplorer';
import { SmartCampaignHint } from '@/components/campaigns/SmartCampaignHint';
import { useUserContext } from '@/hooks/useUserContext';

export function TemplateExplorerPageClient() {
  const router = useRouter();
  const userContext = useUserContext();

  const handleTemplateSelect = (templateId: string) => {
    // Navigate to campaign creation with selected template
    router.push(`/campaigns/new?template=${templateId}`);
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <nav className="flex items-center text-sm text-muted-foreground mb-6">
        <Link href="/dashboard" className="hover:text-foreground">
          Dashboard
        </Link>
        <ChevronRight className="h-4 w-4 mx-2" />
        <span className="text-foreground">Campaign Templates</span>
      </nav>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg border border-primary/20">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            Campaign Templates
          </h1>
          <p className="text-muted-foreground mt-2">
            {userContext.isServiceProvider 
              ? 'Discover templates optimized for service providers managing multiple clients'
              : 'Choose from professionally designed templates tailored to your business'
            }
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <BookOpen className="h-4 w-4" />
          <Link href="/docs/templates" className="hover:text-foreground">
            Template Guide
          </Link>
        </div>
      </div>

      {/* Smart Navigation Hint */}
      <div className="max-w-4xl">
        <SmartCampaignHint 
          currentPath="/templates" 
          variant="banner"
          showDismiss={true}
        />
      </div>

      {/* Hybrid Template Explorer */}
      <HybridTemplateExplorer
        onTemplateSelect={handleTemplateSelect}
        showRecommendations={true}
        compactMode={false}
        className="max-w-7xl"
      />
    </div>
  );
}
