/**
 * Internationalization constants for Marketplace component
 * Centralizes all hardcoded text for consistency and future i18n support
 */

// Main marketplace text constants
export const MARKETPLACE_TEXT = {
  // Main headers and titles
  TITLE: 'Marketplace',
  SUBTITLE: 'Supercharge your clients\' social media performance with premium boosts and track your revenue growth',
  
  // Revenue overview cards
  REVENUE_CARDS: {
    TOTAL_REVENUE: 'Total Revenue',
    MONTHLY_REVENUE: 'Monthly Revenue',
    ACTIVE_BOOSTS: 'Active Boosts',
    AVERAGE_ROI: 'Average ROI',
    TOTAL_PURCHASES: 'total purchases',
    ACROSS_ALL_CLIENTS: 'Across all clients',
    FROM_LAST_MONTH: 'from last month',
  },

  // Tab navigation
  TABS: {
    MARKETPLACE: 'Browse Marketplace',
    PURCHASES: 'Purchase History',
  },

  // Search and filters
  SEARCH: {
    PLACEHOLDER: 'Search boost products...',
    FILTERS: 'Filters:',
    ALL_TYPES: 'All Types',
    ALL_CATEGORIES: 'All Categories',
    SORT_BY: 'Sort by',
    POPULARITY: 'Popularity',
    PRICE_LOW_TO_HIGH: 'Price: Low to High',
    PRICE_HIGH_TO_LOW: 'Price: High to Low',
    HIGHEST_RATED: 'Highest Rated',
  },

  // Boost types
  BOOST_TYPES: {
    ENGAGEMENT: 'Engagement',
    REACH: 'Reach',
    CONVERSION: 'Conversion',
    AWARENESS: 'Awareness',
    PREMIUM: 'Premium',
  },

  // Categories
  CATEGORIES: {
    GOVERNMENT: 'Government',
    BUSINESS: 'Business',
    STARTUP: 'Startup',
    BRANDING: 'Branding',
    SOCIAL_IMPACT: 'Social Impact',
  },

  // Boost card content
  BOOST_CARD: {
    RECOMMENDED: 'Recommended',
    KEY_FEATURES: 'Key Features:',
    MORE_FEATURES: (count: number) => `+${count} more features`,
    REVIEWS: (count: number) => `(${count} reviews)`,
    CLIENTS: (count: number) => `${count} clients`,
    SAVE: (amount: string) => `SAVE ${amount}`,
    AVG_INCREASE: 'Avg Increase',
    SUCCESS_RATE: 'Success Rate',
    EST_ROI: 'Est. ROI',
  },

  // Actions
  ACTIONS: {
    PURCHASE_BOOST: 'Purchase Boost',
    VIEW_DETAILS: 'View Details',
    USE_BOOST: 'Use Boost',
    BROWSE_MARKETPLACE: 'Browse Marketplace',
  },

  // Dialog content
  DIALOG: {
    COMPLETE_DETAILS: 'Complete details and features for this boost package',
    ALL_FEATURES: 'All Features',
    PERFORMANCE_METRICS: 'Performance Metrics',
    AVERAGE_INCREASE: 'Average Increase',
    SUCCESS_RATE: 'Success Rate',
    COMPATIBLE_CLIENT_TYPES: 'Compatible Client Types',
  },

  // Purchase history
  PURCHASE_HISTORY: {
    IMPRESSIONS: 'Impressions',
    ENGAGEMENTS: 'Engagements',
    CONVERSIONS: 'Conversions',
    ROI: 'ROI',
    STATUS: {
      ACTIVE: 'active',
      COMPLETED: 'completed',
      CANCELLED: 'cancelled',
    },
  },

  // Empty states
  EMPTY_STATES: {
    NO_BOOSTS_FOUND: 'No boosts found',
    ADJUST_SEARCH_CRITERIA: 'Try adjusting your search criteria or filters',
    NO_PURCHASES_YET: 'No purchases yet',
    START_BOOSTING: 'Start boosting your clients\' performance with our marketplace products',
  },

  // Popularity indicators
  POPULARITY: {
    HOT: 'hot',
    TRENDING: 'trending',
    NEW: 'new',
    BESTSELLER: 'bestseller',
  },

  // Success messages
  SUCCESS: {
    BOOST_PURCHASED: (boostName: string) => `Using "${boostName}" 🚀`,
    BOOST_LOADED: 'Template loaded for your campaign. Customize and launch!',
  },

  // Error messages
  ERRORS: {
    PURCHASE_FAILED: 'Purchase failed. Please try again.',
    LOADING_FAILED: 'Failed to load marketplace data',
  },

  // Accessibility labels
  ARIA: {
    MARKETPLACE_MAIN: 'Marketplace main content',
    REVENUE_OVERVIEW: 'Revenue overview statistics',
    BOOST_CARD: (boostName: string) => `Boost product: ${boostName}`,
    PURCHASE_BOOST: (boostName: string) => `Purchase ${boostName} boost for clients`,
    VIEW_BOOST_DETAILS: (boostName: string) => `View detailed information for ${boostName}`,
    FILTER_BY_TYPE: 'Filter boost products by type',
    FILTER_BY_CATEGORY: 'Filter boost products by category',
    SORT_PRODUCTS: 'Sort boost products',
    SEARCH_PRODUCTS: 'Search boost products',
    BOOST_FEATURES_LIST: (boostName: string) => `Features list for ${boostName}`,
    PURCHASE_HISTORY: 'Purchase history and performance metrics',
    REVENUE_CARD: (cardType: string) => `${cardType} revenue statistics`,
    BOOST_RATING: (rating: number, reviews: number) => `${rating} out of 5 stars from ${reviews} reviews`,
    BOOST_METRICS: (boostName: string) => `Performance metrics for ${boostName}`,
    POPULARITY_BADGE: (popularity: string) => `${popularity} boost product`,
    ON_SALE_BADGE: 'Product on sale',
    CLIENT_TYPE_COMPATIBILITY: 'Compatible client types',
    TARGET_AUDIENCE_LIST: 'Target audience options',
  },

  // Loading states
  LOADING: {
    LOADING_BOOSTS: 'Loading boost products...',
    LOADING_PURCHASES: 'Loading purchase history...',
    PROCESSING_PURCHASE: 'Processing purchase...',
  },

  // Boost creation text
  CREATE_BOOST: {
    TITLE: 'Create Boost Product',
    SUBTITLE: 'Create a new boost product for the ThriveSend marketplace',
    BACK_TO_MARKETPLACE: 'Back to Marketplace',
    
    // Steps
    STEPS: {
      BASIC_INFO: 'Basic Info',
      FEATURES_TARGETING: 'Features & Targeting',
      PRICING_SEO: 'Pricing & SEO',
      REVIEW_SUBMIT: 'Review & Submit',
    },

    // Form labels and placeholders
    FORM: {
      PRODUCT_NAME: 'Product Name',
      PRODUCT_NAME_PLACEHOLDER: 'Municipal Engagement Pro',
      BOOST_TYPE: 'Boost Type',
      SELECT_BOOST_TYPE: 'Select boost type',
      CATEGORY: 'Category',
      SELECT_CATEGORY: 'Select category',
      DURATION: 'Duration',
      DESCRIPTION: 'Description',
      DESCRIPTION_PLACEHOLDER: 'Detailed description of your boost product, its benefits, and how it works...',
      DESCRIPTION_LENGTH: (current: number, min: number) => `${current}/2000 characters (minimum ${min})`,
      FEATURES: 'Features',
      FEATURE_PLACEHOLDER: 'Feature description',
      TARGET_AUDIENCE: 'Target Audience',
      CLIENT_TYPES: 'Client Types',
      BASE_PRICE: 'Base Price',
      PRICE_PLACEHOLDER: '299.00',
      RECOMMENDED_PRICING: 'Recommended Pricing',
      GET_SUGGESTIONS: 'Get Suggestions',
      SEO_OPTIMIZATION: 'SEO Optimization',
      GENERATE_SEO: 'Generate SEO',
      SEO_TITLE: 'SEO Title',
      SEO_TITLE_PLACEHOLDER: 'Auto-generated or custom SEO title',
      SEO_DESCRIPTION: 'SEO Description',
      SEO_DESCRIPTION_PLACEHOLDER: 'Auto-generated or custom SEO description',
      TAGS: 'Tags',
      TAG_PLACEHOLDER: 'tag-name',
    },

    // Validation messages
    VALIDATION: {
      NAME_REQUIRED: 'Product name is required',
      DESCRIPTION_TOO_SHORT: 'Description must be at least 50 characters',
      FEATURES_REQUIRED: 'At least one feature is required',
      AUDIENCE_REQUIRED: 'Target audience is required',
      PRICE_REQUIRED: 'Base price must be greater than 0',
      ERRORS_TO_FIX: 'Errors to Fix:',
      RECOMMENDATIONS: 'Recommendations:',
    },

    // Actions
    ACTIONS: {
      NEXT_FEATURES: 'Next: Features & Targeting',
      NEXT_PRICING: 'Next: Pricing & SEO',
      NEXT_REVIEW: 'Next: Review & Submit',
      PREVIOUS: 'Previous',
      SAVE_DRAFT: 'Save Draft',
      SUBMIT_FOR_REVIEW: 'Submit for Review',
      ADD_FEATURE: (current: number, max: number) => `Add Feature (${current}/${max})`,
      ADD_TAG: (current: number, max: number) => `Add Tag (${current}/${max})`,
      SAVING: 'Saving...',
      SUBMITTING: 'Submitting...',
    },

    // Summary
    SUMMARY: {
      PRODUCT_SUMMARY: 'Product Summary',
      FEATURES_TARGETING: 'Features & Targeting',
      NAME: 'Name:',
      TYPE: 'Type:',
      CATEGORY: 'Category:',
      PRICE: 'Price:',
      DURATION: 'Duration:',
      FEATURES: 'Features:',
      TARGET_AUDIENCES: 'Target Audiences:',
      CLIENT_TYPES: 'Client Types:',
      TAGS: 'Tags:',
      NOT_SET: 'Not set',
    },

    // Success/Error messages
    MESSAGES: {
      VALIDATION_ERROR: 'Validation Error',
      FIX_ERRORS_BEFORE_SUBMIT: 'Please fix the errors before submitting.',
      SUCCESS: 'Success!',
      DRAFT_SAVED: 'saved as draft',
      SUBMITTED_FOR_REVIEW: 'submitted for review',
      ERROR: 'Error',
      FAILED_TO_CREATE: 'Failed to create boost product. Please try again.',
      PRICING_ERROR: 'Error getting pricing recommendations:',
    },

    // Boost type descriptions
    BOOST_TYPE_DESCRIPTIONS: {
      ENGAGEMENT: 'Increase likes, comments, and interactions',
      REACH: 'Expand audience and visibility',
      CONVERSION: 'Drive sales and actions',
      AWARENESS: 'Build brand recognition',
      PREMIUM: 'Elite targeting and positioning',
    },

    // Duration options
    DURATION_OPTIONS: {
      '7_DAYS': '7 days',
      '14_DAYS': '14 days',
      '30_DAYS': '30 days',
      '45_DAYS': '45 days',
      '60_DAYS': '60 days',
      '90_DAYS': '90 days',
    },

    // Currency and pricing
    PRICING: {
      RECOMMENDED: (price: string) => `Recommended: ${price}`,
      RANGE: (min: string, max: string) => `Range: ${min} - ${max}`,
      SEO_TITLE_LIMIT: (current: number, max: number) => `${current}/${max} characters`,
      SEO_DESC_LIMIT: (current: number, max: number) => `${current}/${max} characters`,
    },
  },
} as const;

// Semantic color classes for marketplace components
export const MARKETPLACE_COLORS = {
  // Status colors
  STATUS: {
    ACTIVE: 'bg-custom-success-light text-custom-success-dark border-custom-success',
    COMPLETED: 'bg-custom-info-light text-custom-info-dark border-custom-info',
    CANCELLED: 'bg-custom-error-light text-custom-error-dark border-custom-error',
    PENDING: 'bg-custom-warning-light text-custom-warning-dark border-custom-warning',
  },

  // Popularity indicators
  POPULARITY: {
    HOT: 'text-custom-warning-dark',
    TRENDING: 'text-custom-info-dark',
    NEW: 'text-custom-success-dark',
    BESTSELLER: 'text-custom-warning-dark',
    RECOMMENDED: 'bg-custom-primary text-custom-white',
  },

  // Boost type colors
  BOOST_TYPES: {
    ENGAGEMENT: 'text-custom-primary bg-custom-primary-light',
    REACH: 'text-custom-info-dark bg-custom-info-light',
    CONVERSION: 'text-custom-success-dark bg-custom-success-light',
    AWARENESS: 'text-custom-warning-dark bg-custom-warning-light',
    PREMIUM: 'text-custom-warning-dark bg-custom-warning-light',
  },

  // Revenue card colors
  REVENUE_CARDS: {
    TOTAL: {
      TEXT: 'text-custom-primary',
      BACKGROUND: 'bg-custom-primary-light',
      BORDER: 'border-l-custom-primary',
      GRADIENT: 'from-custom-primary-light to-custom-white',
    },
    MONTHLY: {
      TEXT: 'text-custom-success-dark',
      BACKGROUND: 'bg-custom-success-light',
      BORDER: 'border-l-custom-success',
      GRADIENT: 'from-custom-success-light to-custom-white',
    },
    ACTIVE: {
      TEXT: 'text-custom-info-dark',
      BACKGROUND: 'bg-custom-info-light',
      BORDER: 'border-l-custom-info',
      GRADIENT: 'from-custom-info-light to-custom-white',
    },
    ROI: {
      TEXT: 'text-custom-accent-dark',
      BACKGROUND: 'bg-custom-accent-light',
      BORDER: 'border-l-custom-accent',
      GRADIENT: 'from-custom-accent-light to-custom-white',
    },
  },

  // Performance metrics
  METRICS: {
    INCREASE: 'text-custom-success-dark',
    SUCCESS_RATE: 'text-custom-info-dark',
    ROI: 'text-custom-accent-dark',
    CLIENTS: 'text-custom-primary',
  },

  // Interactive elements
  BUTTONS: {
    PRIMARY: 'bg-custom-primary hover:bg-custom-primary-dark text-custom-white',
    SECONDARY: 'bg-custom-secondary hover:bg-custom-secondary-dark text-custom-white',
    SUCCESS: 'bg-custom-success hover:bg-custom-success-dark text-custom-white',
    WARNING: 'bg-custom-warning hover:bg-custom-warning-dark text-custom-white',
    DANGER: 'bg-custom-error hover:bg-custom-error-dark text-custom-white',
  },

  // Form validation
  VALIDATION: {
    ERROR: 'text-custom-error-dark border-custom-error bg-custom-error-light',
    SUCCESS: 'text-custom-success-dark border-custom-success bg-custom-success-light',
    WARNING: 'text-custom-warning-dark border-custom-warning bg-custom-warning-light',
  },

  // Backgrounds and surfaces
  SURFACES: {
    CARD: 'bg-custom-surface border-custom-border',
    MUTED: 'bg-custom-muted',
    ACCENT: 'bg-custom-accent-light',
    HOVER: 'hover:bg-custom-surface-hover',
  },

  // Text colors
  TEXT: {
    PRIMARY: 'text-custom-text-primary',
    SECONDARY: 'text-custom-text-secondary',
    MUTED: 'text-custom-text-muted',
    ERROR: 'text-custom-error-dark',
    SUCCESS: 'text-custom-success-dark',
    WARNING: 'text-custom-warning-dark',
    INFO: 'text-custom-info-dark',
  },

  // Badges and labels
  BADGES: {
    SALE: 'bg-custom-error text-custom-white',
    FEATURED: 'bg-custom-primary text-custom-white',
    NEW: 'bg-custom-success text-custom-white',
    POPULAR: 'bg-custom-warning text-custom-warning-dark',
    PREMIUM: 'bg-custom-accent text-custom-white',
  },

  // Chart colors (for future analytics integration)
  CHARTS: {
    PRIMARY: 'var(--color-chart-primary)',
    SECONDARY: 'var(--color-chart-secondary)',
    SUCCESS: 'var(--color-chart-success)',
    WARNING: 'var(--color-chart-warning)',
    ERROR: 'var(--color-chart-error)',
    INFO: 'var(--color-chart-info)',
  },
} as const;

// Product management specific constants
export const MARKETPLACE_CONSTANTS = {
  // Headers
  HEADERS: {
    MANAGE_PRODUCTS: 'Manage Products',
    CREATE_PRODUCT: 'Create Product',
    EDIT_PRODUCT: 'Edit Product',
  },

  // Success messages
  SUCCESS: {
    PRODUCT_SAVED: 'Product Saved',
    PRODUCT_CREATED: 'Product Created',
    PRODUCT_UPDATED: 'Product Updated',
    PRODUCT_DELETED: 'Product Deleted',
  },

  // Error messages
  ERRORS: {
    GENERIC: 'Error',
    PRODUCT_SAVE_FAILED: 'Failed to save product',
    PRODUCT_DELETE_FAILED: 'Failed to delete product',
    PRODUCT_LOAD_FAILED: 'Failed to load products',
  },

  // Validation messages
  VALIDATION: {
    REQUIRED_FIELD: 'Required Field',
    INVALID_INPUT: 'Invalid Input',
    NAME_REQUIRED: 'Product name is required',
    DESCRIPTION_REQUIRED: 'Description is required',
    FEATURES_REQUIRED: 'At least one feature is required',
    PRICE_REQUIRED: 'Price must be greater than 0',
  },

  // Form labels
  LABELS: {
    PRODUCT_NAME: 'Product Name',
    DESCRIPTION: 'Description',
    TYPE: 'Type',
    CATEGORY: 'Category',
    PRICE: 'Price',
    ORIGINAL_PRICE: 'Original Price',
    DURATION: 'Duration',
    FEATURES: 'Features',
    CLIENT_TYPES: 'Client Types',
    ESTIMATED_ROI: 'Estimated ROI',
    IS_RECOMMENDED: 'Recommended Product',
    IS_ACTIVE: 'Active Product',
  },

  // Placeholders
  PLACEHOLDERS: {
    PRODUCT_NAME: 'Enter product name',
    DESCRIPTION: 'Describe your boost product',
    DURATION: 'e.g. 30 days',
    ESTIMATED_ROI: 'e.g. 200-300%',
    ADD_FEATURE: 'Add a feature',
    ADD_CLIENT_TYPE: 'Add a client type',
  },

  // Actions
  ACTIONS: {
    CREATE: 'Create',
    EDIT: 'Edit',
    DELETE: 'Delete',
    SAVE: 'Save',
    CANCEL: 'Cancel',
    ADD: 'Add',
    UPDATE_PRODUCT: 'Update Product',
    CREATE_PRODUCT: 'Create Product',
    CREATE_YOUR_FIRST_PRODUCT: 'Create Your First Product',
    MANAGE_PRODUCTS: 'Manage Products',
  },

  // Status indicators
  STATUS: {
    ACTIVE: 'Active',
    INACTIVE: 'Inactive',
    DRAFT: 'Draft',
    PUBLISHED: 'Published',
  },

  // Empty states
  EMPTY_STATES: {
    NO_PRODUCTS: 'No products yet',
    CREATE_FIRST_PRODUCT: 'Create your first boost product to start selling in the marketplace.',
  },

  // Loading states
  LOADING: {
    PRODUCTS: 'Loading your products...',
    SAVING: 'Saving...',
    DELETING: 'Deleting...',
    CREATING: 'Creating...',
    UPDATING: 'Updating...',
  },
} as const;

// Export all constants as a single object for easier imports
export const MARKETPLACE_ALL = {
  ...MARKETPLACE_TEXT,
  CONSTANTS: MARKETPLACE_CONSTANTS,
  COLORS: MARKETPLACE_COLORS,
} as const;

// Export type for TypeScript support
export type MarketplaceTextKeys = typeof MARKETPLACE_TEXT;
export type MarketplaceColorKeys = typeof MARKETPLACE_COLORS;
export type MarketplaceConstantsKeys = typeof MARKETPLACE_CONSTANTS;