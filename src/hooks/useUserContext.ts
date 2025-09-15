'use client';

import { useOrganization, useUser } from '@clerk/nextjs';
import { useState, useEffect } from 'react';

/**
 * Basic user context detection hook
 * Stage 1: Safe, minimal implementation with comprehensive error handling
 */
export interface UserContext {
  isServiceProvider: boolean;
  hasMultipleClients: boolean;
  organizationType: 'individual' | 'service_provider' | 'enterprise';
  clientCount: number;
  isLoading: boolean;
  error: string | null;
}

/**
 * Hook to detect user context - Stage 1 implementation
 * Features:
 * - Safe error handling with fallbacks
 * - No breaking changes to existing flows
 * - Conservative detection logic
 */
export function useUserContext(): UserContext {
  const { organization, isLoaded: orgLoaded } = useOrganization();
  const { user, isLoaded: userLoaded } = useUser();

  const [context, setContext] = useState<UserContext>({
    isServiceProvider: false,
    hasMultipleClients: false,
    organizationType: 'individual',
    clientCount: 0,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    // Only proceed when both organization and user are loaded
    if (!orgLoaded || !userLoaded) {
      return;
    }

    const detectContext = async () => {
      try {
        // Safe metadata extraction with fallbacks
        const orgMetadata = organization?.publicMetadata || {};
        const userMetadata = user?.publicMetadata || {};

        // Conservative service provider detection
        const isServiceProviderOrg =
          orgMetadata.type === 'service_provider' ||
          orgMetadata.accountType === 'agency' ||
          orgMetadata.businessType === 'marketing_agency';

        const isServiceProviderUser =
          userMetadata.role === 'service_provider' ||
          userMetadata.accountType === 'agency_owner';

        // Basic client count detection (with error handling)
        let clientCount = 0;
        let hasMultipleClients = false;

        if (organization?.id) {
          try {
            // Use conservative timeout and error handling
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 3000); // 3s timeout

            const response = await fetch(
              `/api/clients?organizationId=${organization.id}&limit=1`,
              {
                signal: controller.signal,
                headers: { 'Content-Type': 'application/json' }
              }
            );

            clearTimeout(timeoutId);

            if (response.ok) {
              const data = await response.json();
              clientCount = data.total || 0;
              hasMultipleClients = clientCount > 1;
            }
          } catch (fetchError) {
            // Silently handle API errors - don't break the experience
            console.warn('Client count detection failed:', fetchError);
          }
        }

        // Conservative organization type detection
        let organizationType: 'individual' | 'service_provider' | 'enterprise' = 'individual';

        if (isServiceProviderOrg || isServiceProviderUser || hasMultipleClients) {
          organizationType = 'service_provider';
        } else if (organization?.membersCount && organization.membersCount > 10) {
          organizationType = 'enterprise';
        }

        // Update context with detected values
        setContext({
          isServiceProvider: isServiceProviderOrg || isServiceProviderUser || hasMultipleClients,
          hasMultipleClients,
          organizationType,
          clientCount,
          isLoading: false,
          error: null,
        });

      } catch (error) {
        // Comprehensive error handling with fallback
        console.error('User context detection failed:', error);
        setContext(prev => ({
          ...prev,
          isLoading: false,
          error: error instanceof Error ? error.message : 'Context detection failed',
        }));
      }
    };

    detectContext();
  }, [organization?.id, user?.id, orgLoaded, userLoaded]);

  return context;
}

/**
 * Utility function to get campaign route based on context
 * Stage 1: Simple, safe routing logic
 */
export function getCampaignRoute(context: UserContext): '/campaigns' | '/campaigns/multi-client' {
  // Conservative routing - default to individual campaigns
  if (context.error || context.isLoading) {
    return '/campaigns';
  }

  // Only route to multi-client if we're confident
  if (context.isServiceProvider && context.hasMultipleClients) {
    return '/campaigns/multi-client';
  }

  return '/campaigns';
}

/**
 * Utility function to check if multi-client features should be shown
 * Stage 1: Conservative feature detection
 */
export function shouldShowMultiClientFeatures(context: UserContext): boolean {
  return !context.error && !context.isLoading && context.isServiceProvider;
}