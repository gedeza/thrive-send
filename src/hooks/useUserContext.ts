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
  // TEMPORARY: Return static context to isolate React hook violations
  return {
    isServiceProvider: false,
    hasMultipleClients: false,
    organizationType: 'individual',
    clientCount: 0,
    isLoading: false,
    error: null,
  };
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