/**
 * Hook for accessing audience internationalization strings
 * 
 * This provides a consistent interface for accessing translated strings
 * and can be easily extended to support multiple languages in the future.
 */

import { audienceStrings } from './audience-strings';

/**
 * Hook to get audience-related translated strings
 * 
 * @example
 * const t = useAudienceStrings();
 * console.log(t.pageTitle); // "Audience Management"
 * console.log(t.types.custom); // "Custom"
 * console.log(t.success.audienceCreated); // "Audience created successfully"
 */
export function useAudienceStrings() {
  // In the future, this can be extended to:
  // 1. Accept a locale parameter
  // 2. Load strings dynamically based on user preference
  // 3. Support interpolation for dynamic values
  // 4. Integrate with i18n libraries like react-i18next
  
  return audienceStrings;
}

/**
 * Utility function to get a specific string by path
 * 
 * @example
 * const title = getAudienceString('pageTitle');
 * const customType = getAudienceString('types.custom');
 * const successMsg = getAudienceString('success.audienceCreated');
 */
export function getAudienceString(path: string): string {
  const keys = path.split('.');
  let current: Record<string, unknown> = audienceStrings;
  
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
export type AudienceStringPath = 
  | 'pageTitle'
  | 'pageDescription'
  | 'createAudience'
  | 'importContacts'
  | 'types.custom'
  | 'types.imported'
  | 'statuses.active'
  | 'success.audienceCreated'
  | 'errors.audienceNameRequired'
  | 'emptyStates.noAudiences'
  // Add more paths as needed
  ;

/**
 * String interpolation function with parameter replacement
 * 
 * @example
 * const message = formatAudienceString('success.contactsImported', { 
 *   count: 150,
 *   name: 'Marketing Leads' 
 * });
 * // Result: "Imported 150 contacts into "Marketing Leads" audience"
 */
export function formatAudienceString(path: string, params?: Record<string, string | number>): string {
  let text = getAudienceString(path);
  
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
 * Helper function for type-specific translations
 */
export function getTypeString(type: string): string {
  const normalizedType = type.toLowerCase();
  const typeMap: Record<string, string> = {
    'custom': getAudienceString('types.custom'),
    'imported': getAudienceString('types.imported'),
    'dynamic': getAudienceString('types.dynamic'),
  };
  
  return typeMap[normalizedType] || type;
}

/**
 * Helper function for status-specific translations
 */
export function getStatusString(status: string): string {
  const normalizedStatus = status.toLowerCase();
  const statusMap: Record<string, string> = {
    'active': getAudienceString('statuses.active'),
    'inactive': getAudienceString('statuses.inactive'),
    'processing': getAudienceString('statuses.processing'),
  };
  
  return statusMap[normalizedStatus] || status;
}

/**
 * Helper function for segment type translations
 */
export function getSegmentTypeString(type: string): string {
  const normalizedType = type.toLowerCase();
  const typeMap: Record<string, string> = {
    'behavioral': getAudienceString('segmentTypes.behavioral'),
    'demographic': getAudienceString('segmentTypes.demographic'),
    'geographic': getAudienceString('segmentTypes.geographic'),
    'custom': getAudienceString('segmentTypes.custom'),
    'lookalike': getAudienceString('segmentTypes.lookalike'),
  };
  
  return typeMap[normalizedType] || type;
}

/**
 * Helper function for efficiency level translations
 */
export function getEfficiencyString(efficiency: string): string {
  const normalizedEfficiency = efficiency.toLowerCase();
  const efficiencyMap: Record<string, string> = {
    'high': getAudienceString('sharedSegments.high'),
    'medium': getAudienceString('sharedSegments.medium'),
    'low': getAudienceString('sharedSegments.low'),
  };
  
  return efficiencyMap[normalizedEfficiency] || efficiency;
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
  
  if (diffMinutes < 1) return getAudienceString('time.justNow');
  if (diffMinutes < 60) return formatAudienceString('time.minutesAgo', { count: diffMinutes });
  if (diffHours < 24) return formatAudienceString('time.hoursAgo', { count: diffHours });
  if (diffDays < 7) return formatAudienceString('time.daysAgo', { count: diffDays });
  if (diffWeeks < 4) return formatAudienceString('time.weeksAgo', { count: diffWeeks });
  return formatAudienceString('time.monthsAgo', { count: diffMonths });
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