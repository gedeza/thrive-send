/**
 * Audience module internationalization strings
 * 
 * This file contains all hardcoded text from the audience module
 * organized for future i18n implementation.
 */

export const audienceStrings = {
  // Page headers and descriptions
  pageTitle: "Audience Management",
  pageDescription: "Manage audience segments, track engagement, and optimize targeting",
  createPageTitle: "Create Audience",
  createPageDescription: "Build a custom audience segment with advanced targeting criteria",
  sharedSegmentsTitle: "Shared Segments",
  sharedSegmentsDescription: "Manage audience segments shared across multiple campaigns and audiences",
  
  // Navigation and actions
  createAudience: "Create Audience",
  sharedSegments: "Shared Segments",
  importContacts: "Import Contacts",
  backToAudiences: "Back to Audiences",
  createSharedSegment: "Create Shared Segment",
  saveAudience: "Save Audience",
  saveChanges: "Save Changes",
  cancel: "Cancel",
  clearFilters: "Clear Filters",
  tryAgain: "Try Again",
  refresh: "Refresh",
  
  // Import flow
  import: {
    title: "Import Contacts",
    description: "Import contacts from CSV file or add them manually to create a new audience",
    audienceName: "Audience Name",
    audienceNamePlaceholder: "Enter audience name",
    importMethod: "Import Method",
    csvFile: "CSV File",
    manualEntry: "Manual Entry",
    csvFileLabel: "CSV File",
    clickToUpload: "Click to upload CSV file",
    dragAndDrop: "or drag and drop",
    csvFormat: "CSV should have columns: name, email, phone (optional)",
    contactInformation: "Contact Information",
    contactsPlaceholder: "Enter contacts (one per line)\\nFormat: Name, Email, Phone\\n\\nJohn Doe, john@example.com, +1234567890\\nJane Smith, jane@example.com",
    contactsFormat: "Enter contacts one per line in format: Name, Email, Phone (optional)",
    importing: "Importing...",
    importContactsButton: "Import Contacts",
    changeFile: "Click to change file",
  },
  
  // Form fields and labels
  name: "Name",
  description: "Description",
  type: "Type",
  tags: "Tags",
  audienceSize: "Audience Size",
  status: "Status",
  createdAt: "Created",
  lastUpdated: "Last Updated",
  source: "Source",
  
  // Types
  types: {
    custom: "Custom",
    imported: "Imported", 
    dynamic: "Dynamic",
  },
  
  // Statuses
  statuses: {
    active: "Active",
    inactive: "Inactive",
    processing: "Processing",
  },
  
  // Form placeholders
  placeholders: {
    searchAudiences: "Search audiences...",
    filterByStatus: "Filter by status",
    filterByType: "Filter by type",
    audienceName: "Enter audience name",
    audienceDescription: "Describe your audience (optional)",
    addTags: "Add tags to organize your audiences",
  },
  
  // Metrics and stats
  metrics: {
    totalAudiences: "Total Audiences",
    totalContacts: "Total Contacts",
    activeSegments: "Active Segments",
    avgEngagement: "Avg. Engagement",
    acrossAllSegments: "Across all segments",
    fromLastMonth: "+12% from last month",
    acrossAllAudiences: "Across all audiences",
    avgEngagementFull: "Avg. Engagement Rate",
    contactsCount: "contacts",
    created: "Created",
    updated: "Updated",
  },
  
  // Shared segments specific
  sharedSegments: {
    totalSharedSegments: "Total Shared Segments",
    totalReach: "Total Reach",
    avgUsage: "Avg. Usage",
    highEfficiency: "High Efficiency",
    combinedContacts: "Combined contacts",
    audiencesPerSegment: "Audiences per segment",
    highPerformingSegments: "High performing segments",
    searchSharedSegments: "Search shared segments...",
    filterByEfficiency: "Filter by efficiency",
    allTypes: "All Types",
    allEfficiency: "All Efficiency",
    usedInAudiences: "Used in Audiences",
    totalReachLabel: "total reach",
    usedInCount: "Used in {count} audiences",
    efficiency: "Efficiency",
    high: "High",
    medium: "Medium",
    low: "Low",
  },
  
  // Segment types
  segmentTypes: {
    behavioral: "Behavioral",
    demographic: "Demographic", 
    geographic: "Geographic",
    custom: "Custom",
    lookalike: "Lookalike",
  },
  
  // Performance metrics
  performance: {
    engagementRate: "Engagement Rate",
    conversionRate: "Conversion Rate",
    monthlyGrowth: "Monthly Growth",
    segments: "Segments",
    totalEngagement: "Total Engagement",
    avgEngagement: "Avg. Engagement",
    thisMonth: "this month",
    efficiency: "Efficiency",
    audiences: "Audiences",
  },
  
  // Actions
  actions: {
    view: "View",
    edit: "Edit",
    delete: "Delete",
    duplicate: "Duplicate",
    analytics: "Analytics",
    settings: "Settings",
    copy: "Copy",
  },
  
  // Filter options
  filters: {
    allStatus: "All Status",
    allTypes: "All Types",
    active: "Active",
    inactive: "Inactive",
    processing: "Processing",
    custom: "Custom",
    imported: "Imported",
    dynamic: "Dynamic",
  },
  
  // Empty states
  emptyStates: {
    noAudiences: "No audiences found",
    noAudiencesDescription: "Create your first audience to start targeting customers",
    noFilterResults: "No audiences match your current search criteria",
    tryAdjustingFilters: "Try adjusting your filters",
    noSharedSegments: "No shared segments found",
    noSharedSegmentsDescription: "Create your first shared segment to reuse targeting across audiences",
    noSharedFilterResults: "No segments match your current search criteria",
  },
  
  // Success messages
  success: {
    audienceCreated: "Audience created successfully",
    audienceUpdated: "Audience updated successfully",
    audienceDeleted: "Audience deleted successfully",
    contactsImported: "Imported {count} contacts into \"{name}\" audience",
    segmentCreated: "Audience segment created successfully",
    segmentUpdated: "Segment updated successfully",
    importSuccess: "Success!",
  },
  
  // Error messages
  errors: {
    audienceNameRequired: "Please enter an audience name",
    selectCsvFile: "Please select a CSV file",
    enterContactInfo: "Please enter contact information",
    invalidFile: "Invalid file",
    selectValidCsv: "Please select a valid CSV file",
    importFailed: "Import failed",
    importErrorDescription: "There was an error importing your contacts. Please try again.",
    createFailed: "Failed to create audience",
    updateFailed: "Failed to update audience",
    deleteFailed: "Failed to delete audience",
    loadFailed: "Failed to load audiences",
    loadSharedSegmentsFailed: "Failed to load shared segments",
    networkError: "Network error occurred. Please try again.",
    unknownError: "Unknown error occurred",
    organizationMissing: "Organization Context Missing",
    organizationMissingDescription: "Unable to load organization context. Please refresh the page or contact support.",
    segmentSaveFailed: "Failed to save segment",
    segmentCalculationFailed: "Error calculating segment size",
  },
  
  // Loading states
  loading: {
    loadingAudiences: "Loading audiences...",
    loadingSharedSegments: "Loading shared segments...",
    creating: "Creating...",
    saving: "Saving...",
    importing: "Importing...",
    calculating: "Calculating...",
  },
  
  // Confirmation dialogs
  confirmations: {
    deleteAudience: "Delete Audience",
    deleteAudienceDescription: "Are you sure you want to delete \"{name}\"? This action cannot be undone.",
    deleteSegment: "Delete Segment", 
    deleteSegmentDescription: "Are you sure you want to delete this segment? This action cannot be undone.",
    confirmDelete: "Delete",
    confirmSave: "Save",
  },
  
  // Advanced features
  advanced: {
    bulkOperations: "Bulk Operations",
    selectAll: "Select All",
    selectNone: "Select None",
    selectedCount: "{count} selected",
    bulkDelete: "Delete Selected",
    bulkExport: "Export Selected",
    bulkEdit: "Edit Selected",
    exportCsv: "Export as CSV",
    exportJson: "Export as JSON",
    virtualScrolling: "Loading more...",
    pagination: "Page {current} of {total}",
    itemsPerPage: "Items per page",
    showingItems: "Showing {start}-{end} of {total} items",
  },
  
  // Audience builder
  builder: {
    segmentBuilder: "Segment Builder",
    addCondition: "Add Condition",
    removeCondition: "Remove Condition",
    conditionType: "Condition Type",
    field: "Field",
    operator: "Operator",
    value: "Value",
    and: "AND",
    or: "OR",
    estimatedSize: "Estimated Size",
    calculating: "Calculating...",
    preview: "Preview",
    targetingRules: "Targeting Rules",
    demographics: "Demographics",
    behavior: "Behavior", 
    custom: "Custom",
    geography: "Geography",
  },
  
  // Time periods
  time: {
    justNow: "Just now",
    minutesAgo: "{count}m ago",
    hoursAgo: "{count}h ago", 
    daysAgo: "{count}d ago",
    weeksAgo: "{count}w ago",
    monthsAgo: "{count}mo ago",
    daily: "Daily",
    weekly: "Weekly",
    monthly: "Monthly",
    quarterly: "Quarterly",
  },
  
  // Units and formatting
  units: {
    contacts: "contacts",
    segments: "segments", 
    audiences: "audiences",
    percent: "%",
    growth: "growth",
    reach: "reach",
    engagement: "engagement",
    conversion: "conversion",
  },
  
  // Accessibility labels
  a11y: {
    searchInput: "Search audiences by name, description, or tags",
    statusFilter: "Filter audiences by status",
    typeFilter: "Filter audiences by type",
    audienceCard: "Audience card for {name}",
    metricsCard: "Metrics card showing {metric}",
    loadingContent: "Loading content",
    errorContent: "Error loading content",
    emptyContent: "No content available",
    actionButton: "{action} button for {item}",
  }
} as const;

export type AudienceStringKeys = keyof typeof audienceStrings;