/**
 * Hook for accessing campaign internationalization strings
 * 
 * This provides a consistent interface for accessing translated strings
 * and can be easily extended to support multiple languages in the future.
 */

import { campaignStrings } from './campaign-strings';

/**
 * Hook to get campaign-related translated strings
 * 
 * @example
 * const t = useCampaignStrings();
 * console.log(t.pageTitle); // "Campaigns"
 * console.log(t.statuses.draft); // "Draft"
 * console.log(t.success.campaignCreated); // "Campaign created successfully"
 */
export function useCampaignStrings() {
  // In the future, this can be extended to:
  // 1. Accept a locale parameter
  // 2. Load strings dynamically based on user preference
  // 3. Support interpolation for dynamic values
  // 4. Integrate with i18n libraries like react-i18next
  
  return campaignStrings;
}

/**
 * Utility function to get a specific string by path
 * 
 * @example
 * const title = getCampaignString('pageTitle');
 * const draftStatus = getCampaignString('statuses.draft');
 * const successMsg = getCampaignString('success.campaignCreated');
 */
export function getCampaignString(path: string): string {
  const keys = path.split('.');
  let current: Record<string, unknown> = campaignStrings;
  
  for (const key of keys) {
    if (current && typeof current === 'object' && key in current) {
      current = current[key];
    } else {
      console.warn(`Translation key not found: ${path}`);
      return path; // Return the key as fallback
    }
  }
  
  return typeof current === 'string' ? current : path;
}

/**
 * Type-safe string accessor for nested paths
 */
export type CampaignStringPath = 
  | 'pageTitle'
  | 'pageDescription'
  | 'createCampaign'
  | 'statuses.draft'
  | 'statuses.scheduled'
  | 'channels.email'
  | 'success.campaignCreated'
  | 'errors.campaignNameRequired'
  | 'emptyStates.noCampaigns'
  // Add more paths as needed
  ;

/**
 * String interpolation function with parameter replacement
 * 
 * @example
 * const message = formatCampaignString('success.campaignCreated', { 
 *   name: 'Summer Sale Campaign'
 * });
 * // Result: "Campaign 'Summer Sale Campaign' created successfully"
 */
export function formatCampaignString(path: string, params?: Record<string, string | number>): string {
  let text = getCampaignString(path);
  
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      // Support both {key} and {{key}} interpolation patterns
      text = text.replace(new RegExp(`\\{${key}\\}`, 'g'), String(value));
      text = text.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), String(value));
    });
  }
  
  return text;
}

/**
 * Helper function for status-specific translations
 */
export function getStatusString(status: string): string {
  const normalizedStatus = status.toLowerCase();
  const statusMap: Record<string, string> = {
    'draft': getCampaignString('statuses.draft'),
    'scheduled': getCampaignString('statuses.scheduled'),
    'active': getCampaignString('statuses.active'),
    'sent': getCampaignString('statuses.sent'),
    'paused': getCampaignString('statuses.paused'),
    'archived': getCampaignString('statuses.archived'),
    'completed': getCampaignString('statuses.completed'),
    'cancelled': getCampaignString('statuses.cancelled'),
    'running': getCampaignString('statuses.running'),
  };
  
  return statusMap[normalizedStatus] || status;
}

/**
 * Helper function for channel-specific translations
 */
export function getChannelString(channel: string): string {
  const normalizedChannel = channel.toLowerCase();
  const channelMap: Record<string, string> = {
    'email': getCampaignString('channels.email'),
    'sms': getCampaignString('channels.sms'),
    'social': getCampaignString('channels.social'),
    'push': getCampaignString('channels.push'),
    'web': getCampaignString('channels.web'),
  };
  
  return channelMap[normalizedChannel] || channel;
}

/**
 * Helper function for goal type translations
 */
export function getGoalTypeString(goalType: string): string {
  const normalizedGoalType = goalType.toLowerCase();
  const goalMap: Record<string, string> = {
    'engagement': getCampaignString('goals.engagement'),
    'conversions': getCampaignString('goals.conversions'),
    'revenue': getCampaignString('goals.revenue'),
    'brandawareness': getCampaignString('goals.brandAwareness'),
    'leadgeneration': getCampaignString('goals.leadGeneration'),
    'customerretention': getCampaignString('goals.customerRetention'),
    'trafficgeneration': getCampaignString('goals.trafficGeneration'),
    'custom': getCampaignString('goals.customGoal'),
  };
  
  return goalMap[normalizedGoalType] || goalType;
}

/**
 * Helper function for time-relative formatting
 */
export function getTimeString(date: Date | string | number): string {
  const now = new Date();
  const past = new Date(date);
  const diffMs = now.getTime() - past.getTime();
  
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);
  
  if (diffMinutes < 1) return getCampaignString('time.justNow');
  if (diffMinutes < 60) return formatCampaignString('time.minutesAgo', { count: diffMinutes });
  if (diffHours < 24) return formatCampaignString('time.hoursAgo', { count: diffHours });
  if (diffDays < 7) return formatCampaignString('time.daysAgo', { count: diffDays });
  if (diffWeeks < 4) return formatCampaignString('time.weeksAgo', { count: diffWeeks });
  return formatCampaignString('time.monthsAgo', { count: diffMonths });
}

/**
 * Helper function for pluralization
 */
export function getPluralString(count: number, singular: string, plural?: string): string {
  if (count === 1) return singular;
  return plural || `${singular}s`;
}

/**
 * Helper function for number formatting with units
 */
export function formatNumberWithUnit(count: number, unit: string): string {
  const formattedCount = count.toLocaleString();
  const unitString = getPluralString(count, unit);
  return `${formattedCount} ${unitString}`;
}

/**
 * Helper function for formatting campaign metrics
 */
export function formatMetricValue(value: number | string, type: 'currency' | 'percentage' | 'number' | 'rate'): string {
  if (typeof value === 'string') return value;
  
  switch (type) {
    case 'currency':
      return `$${value.toLocaleString()}`;
    case 'percentage':
      return `${value.toFixed(1)}%`;
    case 'rate':
      return `${value.toFixed(2)}%`;
    case 'number':
    default:
      return value.toLocaleString();
  }
}