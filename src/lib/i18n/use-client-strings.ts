/**
 * Hook for accessing client internationalization strings
 * 
 * This provides a consistent interface for accessing translated strings
 * and can be easily extended to support multiple languages in the future.
 */

import { clientStrings } from './client-strings';

/**
 * Hook to get client-related translated strings
 * 
 * @example
 * const t = useClientStrings();
 * console.log(t.pageTitle); // "Client Management"
 * console.log(t.validation.emailRequired); // "Email is required"
 */
export function useClientStrings() {
  // In the future, this can be extended to:
  // 1. Accept a locale parameter
  // 2. Load strings dynamically based on user preference
  // 3. Support interpolation for dynamic values
  // 4. Integrate with i18n libraries like react-i18next
  
  return clientStrings;
}

/**
 * Utility function to get a specific string by path
 * 
 * @example
 * const title = getClientString('pageTitle');
 * const emailError = getClientString('validation.emailRequired');
 */
export function getClientString(path: string): string {
  const keys = path.split('.');
  let current: Record<string, unknown> = clientStrings;
  
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
export type ClientStringPath = 
  | 'pageTitle'
  | 'pageDescription'
  | 'newClient'
  | 'clientName'
  | 'validation.emailRequired'
  | 'errors.clientNotFound'
  | 'success.clientCreated'
  // Add more paths as needed
  ;

/**
 * Future enhancement: Support for string interpolation
 * 
 * @example
 * const message = formatClientString('success.clientCreatedWithName', { name: 'John Doe' });
 */
export function formatClientString(path: string, params?: Record<string, string | number>): string {
  let text = getClientString(path);
  
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      text = text.replace(new RegExp(`{{${key}}}`, 'g'), String(value));
    });
  }
  
  return text;
}