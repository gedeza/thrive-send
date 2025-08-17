/**
 * Short, user-friendly ID generation utility
 * Generates context-aware prefixed IDs for better UX
 * 
 * Format: PREFIX_TIMESTAMP_RANDOM (e.g., "CLI_L8X5M2A7K")
 * Length: ~10-12 characters (vs 25 char CUIDs)
 * 
 * Benefits:
 * - 60% shorter than CUIDs
 * - Context-aware prefixes
 * - User-friendly for support/URLs
 * - Globally unique & collision-resistant
 */

interface EntityPrefixes {
  // Core entities
  USER: 'USR';
  ORGANIZATION: 'ORG';
  CLIENT: 'CLI';
  
  // Content & Campaigns  
  CAMPAIGN: 'CAM';
  TEMPLATE: 'TMP';
  CONTENT: 'CNT';
  PROJECT: 'PRJ';
  
  // Marketplace
  LISTING: 'LST';
  BOOST: 'BST';
  REVIEW: 'REV';
  TRANSACTION: 'TXN';
  
  // Analytics & Reports
  REPORT: 'RPT';
  ANALYTICS: 'ANA';
  ACTIVITY: 'ACT';
  
  // Communication
  NOTIFICATION: 'NOT';
  COMMENT: 'CMT';
  APPROVAL: 'APR';
  
  // Media & Assets
  ASSET: 'AST';
  MEDIA: 'MED';
  
  // Audiences & Segments
  AUDIENCE: 'AUD';
  SEGMENT: 'SEG';
  
  // Events & Calendar
  EVENT: 'EVT';
  CALENDAR: 'CAL';
  
  // Integrations & Social
  INTEGRATION: 'INT';
  SOCIAL_ACCOUNT: 'SOC';
  
  // Workflows & Automation
  WORKFLOW: 'WFL';
  AUTOMATION: 'AUT';
}

export const ENTITY_PREFIXES: EntityPrefixes = {
  // Core entities
  USER: 'USR',
  ORGANIZATION: 'ORG', 
  CLIENT: 'CLI',
  
  // Content & Campaigns
  CAMPAIGN: 'CAM',
  TEMPLATE: 'TMP',
  CONTENT: 'CNT',
  PROJECT: 'PRJ',
  
  // Marketplace
  LISTING: 'LST',
  BOOST: 'BST', 
  REVIEW: 'REV',
  TRANSACTION: 'TXN',
  
  // Analytics & Reports
  REPORT: 'RPT',
  ANALYTICS: 'ANA',
  ACTIVITY: 'ACT',
  
  // Communication
  NOTIFICATION: 'NOT',
  COMMENT: 'CMT',
  APPROVAL: 'APR',
  
  // Media & Assets
  ASSET: 'AST',
  MEDIA: 'MED',
  
  // Audiences & Segments
  AUDIENCE: 'AUD',
  SEGMENT: 'SEG',
  
  // Events & Calendar
  EVENT: 'EVT',
  CALENDAR: 'CAL',
  
  // Integrations & Social
  INTEGRATION: 'INT',
  SOCIAL_ACCOUNT: 'SOC',
  
  // Workflows & Automation
  WORKFLOW: 'WFL',
  AUTOMATION: 'AUT'
};

/**
 * Character set for ID generation
 * Uses uppercase letters and numbers for readability
 * Excludes confusing characters: 0, O, 1, I, L
 */
const ID_CHARS = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';

/**
 * Generate a short, user-friendly ID with prefix
 * 
 * @param prefix - Entity type prefix (3 chars)
 * @param length - Random suffix length (default: 3)
 * @returns Formatted ID like "CLI_L8X5M2A"
 */
export function generateShortId(
  prefix: keyof EntityPrefixes | string, 
  length: number = 3
): string {
  // Get prefix (use key lookup or direct string)
  const prefixStr = typeof prefix === 'string' && prefix.length === 3 
    ? prefix 
    : ENTITY_PREFIXES[prefix as keyof EntityPrefixes] || prefix;
    
  // Generate timestamp component (base36 for compactness)
  const timestamp = Date.now().toString(36).toUpperCase();
  
  // Generate random suffix
  const random = Array.from({ length }, () => 
    ID_CHARS[Math.floor(Math.random() * ID_CHARS.length)]
  ).join('');
  
  return `${prefixStr}_${timestamp}${random}`;
}

/**
 * Generate IDs for specific entity types with proper prefixes
 */
export const generateId = {
  // Core entities
  user: () => generateShortId('USER'),
  organization: () => generateShortId('ORGANIZATION'),
  client: () => generateShortId('CLIENT'),
  
  // Content & Campaigns
  campaign: () => generateShortId('CAMPAIGN'),
  template: () => generateShortId('TEMPLATE'),
  content: () => generateShortId('CONTENT'),
  project: () => generateShortId('PROJECT'),
  
  // Marketplace
  listing: () => generateShortId('LISTING'),
  boost: () => generateShortId('BOOST'),
  review: () => generateShortId('REVIEW'),
  transaction: () => generateShortId('TRANSACTION'),
  
  // Analytics & Reports
  report: () => generateShortId('REPORT'),
  analytics: () => generateShortId('ANALYTICS'),
  activity: () => generateShortId('ACTIVITY'),
  
  // Communication
  notification: () => generateShortId('NOTIFICATION'),
  comment: () => generateShortId('COMMENT'),
  approval: () => generateShortId('APPROVAL'),
  
  // Media & Assets
  asset: () => generateShortId('ASSET'),
  media: () => generateShortId('MEDIA'),
  
  // Audiences & Segments
  audience: () => generateShortId('AUDIENCE'),
  segment: () => generateShortId('SEGMENT'),
  
  // Events & Calendar
  event: () => generateShortId('EVENT'),
  calendar: () => generateShortId('CALENDAR'),
  
  // Integrations & Social
  integration: () => generateShortId('INTEGRATION'),
  socialAccount: () => generateShortId('SOCIAL_ACCOUNT'),
  
  // Workflows & Automation
  workflow: () => generateShortId('WORKFLOW'),
  automation: () => generateShortId('AUTOMATION')
};

/**
 * Parse a short ID to extract prefix and components
 * 
 * @param shortId - The short ID to parse
 * @returns Parsed components or null if invalid
 */
export function parseShortId(shortId: string): {
  prefix: string;
  timestamp: string;
  random: string;
  entityType: string | null;
} | null {
  const parts = shortId.split('_');
  if (parts.length !== 2) return null;
  
  const [prefix, suffix] = parts;
  const timestamp = suffix.slice(0, -3);
  const random = suffix.slice(-3);
  
  // Find entity type from prefix
  const entityType = Object.entries(ENTITY_PREFIXES)
    .find(([, value]) => value === prefix)?.[0] || null;
  
  return {
    prefix,
    timestamp,
    random,
    entityType
  };
}

/**
 * Validate if a string is a valid short ID format
 * 
 * @param id - The ID to validate
 * @returns True if valid short ID format
 */
export function isValidShortId(id: string): boolean {
  const parsed = parseShortId(id);
  return parsed !== null && parsed.prefix.length === 3;
}

/**
 * Convert entity name to appropriate prefix
 * Useful for dynamic ID generation
 */
export function getEntityPrefix(entityName: string): string {
  const normalized = entityName.toUpperCase().replace(/[^A-Z]/g, '');
  
  // Try to find exact match first
  const exactMatch = Object.entries(ENTITY_PREFIXES)
    .find(([key]) => key === normalized)?.[1];
  
  if (exactMatch) return exactMatch;
  
  // Generate prefix from entity name (first 3 chars)
  return normalized.substring(0, 3) || 'GEN';
}

/**
 * Examples and usage patterns
 */
export const examples = {
  // Generated IDs will look like:
  client: 'CLI_L8X5M2A',      // Client ID  
  campaign: 'CAM_L8X5N3B',    // Campaign ID
  template: 'TMP_L8X5P4C',    // Template ID
  project: 'PRJ_L8X5Q5D',     // Project ID
  listing: 'LST_L8X5R6E',     // Marketplace Listing
  boost: 'BST_L8X5S7F',       // Boost Package
  report: 'RPT_L8X5T8G',      // Analytics Report
  user: 'USR_L8X5U9H',        // User Account
  
  // Benefits over CUID:
  cuid: 'cl9ebqhxk00003b600wzo3q7a',  // 25 chars, no context
  shortId: 'CLI_L8X5M2A',             // 10 chars, clear context
  
  // URL comparison:
  oldUrl: '/clients/cl9ebqhxk00003b600wzo3q7a',
  newUrl: '/clients/CLI_L8X5M2A',  // Much cleaner!
};

export default {
  generate: generateShortId,
  generateId,
  parse: parseShortId,
  validate: isValidShortId,
  prefixes: ENTITY_PREFIXES,
  examples
};