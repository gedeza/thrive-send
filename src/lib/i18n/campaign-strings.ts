/**
 * Campaign module internationalization strings
 * 
 * This file contains all hardcoded text from the campaign module
 * organized for future i18n implementation.
 */

export const campaignStrings = {
  // Page headers and descriptions
  pageTitle: "Campaigns",
  pageDescription: "Create and manage your marketing campaigns across all channels and platforms.",
  
  // Navigation and actions
  createCampaign: "New Campaign",
  editCampaign: "Edit Campaign",
  viewAnalytics: "View Analytics",
  deleteCampaign: "Delete Campaign",
  duplicateCampaign: "Duplicate Campaign",
  pauseCampaign: "Pause Campaign",
  resumeCampaign: "Resume Campaign",
  archiveCampaign: "Archive Campaign",
  sendCampaign: "Send Campaign",
  scheduleCampaign: "Schedule Campaign",
  refresh: "Refresh",
  tryAgain: "Try Again",
  clearFilters: "Clear Filters",
  cancel: "Cancel",
  save: "Save",
  backToCampaigns: "Back to Campaigns",
  
  // Campaign statuses
  statuses: {
    draft: "Draft",
    scheduled: "Scheduled", 
    active: "Active",
    sent: "Sent",
    paused: "Paused",
    archived: "Archived",
    completed: "Completed",
    cancelled: "Cancelled",
    running: "Running"
  },
  
  // Campaign channels
  channels: {
    email: "Email",
    sms: "SMS",
    social: "Social",
    push: "Push",
    web: "Web",
    all: "All Channels"
  },
  
  // Campaign types
  types: {
    newsletter: "Newsletter",
    promotional: "Promotional",
    transactional: "Transactional",
    drip: "Drip Campaign",
    abTest: "A/B Test",
    triggered: "Triggered",
    oneTime: "One-Time",
    recurring: "Recurring"
  },
  
  // Form fields and labels
  name: "Campaign Name",
  description: "Description",
  audience: "Audience",
  channel: "Channel",
  status: "Status",
  type: "Type",
  startDate: "Start Date",
  endDate: "End Date",
  budget: "Budget",
  goal: "Goal",
  priority: "Priority",
  tags: "Tags",
  createdAt: "Created",
  updatedAt: "Last Updated",
  sentDate: "Sent Date",
  
  // Form placeholders
  placeholders: {
    searchCampaigns: "Search campaigns by name, audience, or client...",
    campaignName: "Enter campaign name",
    campaignDescription: "Describe your campaign objectives",
    selectAudience: "Select target audience",
    selectChannel: "Choose campaign channel",
    selectStatus: "Filter by status",
    selectType: "Select campaign type",
    addTags: "Add tags to organize campaigns",
    setBudget: "Set campaign budget",
    defineGoal: "Define campaign goal"
  },
  
  // Metrics and analytics
  metrics: {
    totalCampaigns: "Total Campaigns",
    activeCampaigns: "Active Campaigns",
    draftCampaigns: "Draft Campaigns",
    completedCampaigns: "Completed Campaigns",
    successRate: "Success Rate",
    estimatedReach: "Estimated Reach",
    campaignGrowth: "Campaign Growth",
    activePercentage: "Active Percentage",
    completionRate: "Completion Rate",
    openRate: "Open Rate",
    clickRate: "Click Rate",
    conversionRate: "Conversion Rate",
    bounceRate: "Bounce Rate",
    unsubscribeRate: "Unsubscribe Rate",
    revenue: "Revenue",
    roi: "ROI",
    cpm: "CPM",
    cpc: "CPC",
    cpa: "CPA",
    impressions: "Impressions",
    clicks: "Clicks",
    conversions: "Conversions",
    allCampaigns: "All campaigns",
    totalAudience: "Total audience",
    campaignCompletion: "Campaign completion",
    ofTotal: "of total",
    fromLastMonth: "from last month",
    thisMonth: "this month",
    lastMonth: "last month"
  },
  
  // Filters and views
  filters: {
    allStatus: "All Status",
    allChannels: "All Channels",
    allTypes: "All Types",
    showAll: "Show All",
    active: "Active",
    inactive: "Inactive",
    draft: "Draft",
    scheduled: "Scheduled",
    completed: "Completed"
  },
  
  // View modes
  viewModes: {
    grid: "Grid View",
    list: "List View",
    table: "Table View",
    calendar: "Calendar View"
  },
  
  // Empty states
  emptyStates: {
    noCampaigns: "No campaigns found",
    noCampaignsDescription: "Get started by creating your first campaign to reach your audience.",
    noFilterResults: "No campaigns match your current search criteria",
    tryAdjustingFilters: "Try adjusting your filters or search terms.",
    createFirstCampaign: "Create Your First Campaign",
    addNewCampaign: "Add New Campaign"
  },
  
  // Success messages
  success: {
    campaignCreated: "Campaign created successfully",
    campaignUpdated: "Campaign updated successfully",
    campaignDeleted: "Campaign deleted successfully",
    campaignSent: "Campaign sent successfully",
    campaignScheduled: "Campaign scheduled successfully",
    campaignPaused: "Campaign paused successfully",
    campaignResumed: "Campaign resumed successfully",
    campaignArchived: "Campaign archived successfully",
    campaignDuplicated: "Campaign duplicated successfully",
    settingsSaved: "Campaign settings saved successfully"
  },
  
  // Error messages
  errors: {
    campaignNameRequired: "Campaign name is required",
    audienceRequired: "Please select an audience",
    channelRequired: "Please select a channel",
    invalidDateRange: "End date must be after start date",
    budgetRequired: "Budget is required for paid campaigns",
    loadFailed: "Failed to load campaigns",
    createFailed: "Failed to create campaign",
    updateFailed: "Failed to update campaign",
    deleteFailed: "Failed to delete campaign",
    sendFailed: "Failed to send campaign",
    scheduleFailed: "Failed to schedule campaign",
    invalidData: "Invalid campaign data",
    networkError: "Network error occurred. Please try again.",
    unknownError: "An unknown error occurred",
    unableToLoad: "Unable to load campaign data. Please try again later.",
    serverError: "Server responded with status",
    invalidJson: "API response is not valid JSON",
    invalidFormat: "Invalid data format received from API",
    statsLoadFailed: "Failed to fetch campaign stats"
  },
  
  // Loading states
  loading: {
    loadingCampaigns: "Loading campaigns...",
    loadingStats: "Loading statistics...",
    creating: "Creating campaign...",
    updating: "Updating campaign...",
    deleting: "Deleting campaign...",
    sending: "Sending campaign...",
    scheduling: "Scheduling campaign...",
    processing: "Processing...",
    saving: "Saving...",
    analyzing: "Analyzing performance...",
    calculating: "Calculating metrics..."
  },
  
  // Confirmation dialogs
  confirmations: {
    deleteCampaign: "Delete Campaign",
    deleteCampaignDescription: "Are you sure you want to delete '{name}'? This action cannot be undone.",
    pauseCampaign: "Pause Campaign",
    pauseCampaignDescription: "Are you sure you want to pause '{name}'?",
    archiveCampaign: "Archive Campaign", 
    archiveCampaignDescription: "Are you sure you want to archive '{name}'?",
    sendCampaign: "Send Campaign",
    sendCampaignDescription: "Are you sure you want to send '{name}' immediately?",
    confirmDelete: "Delete",
    confirmPause: "Pause",
    confirmArchive: "Archive",
    confirmSend: "Send Now",
    confirmSchedule: "Schedule"
  },
  
  // A/B Testing
  abTesting: {
    title: "A/B Testing",
    createTest: "Create A/B Test",
    manageTests: "Manage Tests",
    variant: "Variant",
    control: "Control",
    winner: "Winner",
    confidence: "Confidence",
    significance: "Significance",
    testResults: "Test Results",
    trafficAllocation: "Traffic Allocation",
    sampleSize: "Sample Size",
    testDuration: "Test Duration",
    primaryMetric: "Primary Metric",
    autoSelectWinner: "Auto-select Winner",
    statisticalSignificance: "Statistical Significance",
    confidenceLevel: "Confidence Level",
    minimumSampleSize: "Minimum Sample Size",
    testConfiguration: "Test Configuration",
    variantPerformance: "Variant Performance",
    noTestsFound: "No A/B tests found",
    createFirstTest: "Create your first A/B test to optimize campaign performance",
    testRunning: "Test is currently running",
    testCompleted: "Test completed",
    testPaused: "Test paused",
    testDraft: "Test in draft",
    testCancelled: "Test cancelled"
  },
  
  // Campaign templates
  templates: {
    title: "Campaign Templates",
    selectTemplate: "Select Template",
    useTemplate: "Use Template",
    customTemplate: "Custom Template",
    saveAsTemplate: "Save as Template",
    templateLibrary: "Template Library",
    featuredTemplates: "Featured Templates",
    myTemplates: "My Templates",
    sharedTemplates: "Shared Templates",
    noTemplatesFound: "No templates found",
    templatePreview: "Template Preview",
    templateSettings: "Template Settings"
  },
  
  // Scheduling
  scheduling: {
    scheduleNow: "Schedule Now",
    scheduleLater: "Schedule Later",
    sendImmediately: "Send Immediately",
    customSchedule: "Custom Schedule",
    timezone: "Timezone",
    frequency: "Frequency",
    once: "Once",
    daily: "Daily",
    weekly: "Weekly",
    monthly: "Monthly",
    recurring: "Recurring",
    scheduleSettings: "Schedule Settings",
    deliveryTime: "Delivery Time",
    optimizedTiming: "Optimized Timing",
    audienceTimezone: "Audience Timezone"
  },
  
  // Goals and objectives
  goals: {
    engagement: "Engagement",
    conversions: "Conversions",
    revenue: "Revenue",
    brandAwareness: "Brand Awareness",
    leadGeneration: "Lead Generation",
    customerRetention: "Customer Retention",
    trafficGeneration: "Traffic Generation",
    customGoal: "Custom Goal",
    goalType: "Goal Type",
    targetValue: "Target Value",
    successCriteria: "Success Criteria"
  },
  
  // Time periods
  time: {
    justNow: "Just now",
    minutesAgo: "{count}m ago",
    hoursAgo: "{count}h ago",
    daysAgo: "{count}d ago",
    weeksAgo: "{count}w ago",
    monthsAgo: "{count}mo ago",
    today: "Today",
    yesterday: "Yesterday",
    thisWeek: "This week",
    lastWeek: "Last week",
    thisMonth: "This month",
    lastMonth: "Last month",
    thisYear: "This year",
    lastYear: "Last year"
  },
  
  // Units and formatting
  units: {
    campaigns: "campaigns",
    contacts: "contacts",
    subscribers: "subscribers",
    percent: "%",
    currency: "$",
    clicks: "clicks",
    impressions: "impressions",
    conversions: "conversions",
    opens: "opens",
    bounces: "bounces",
    unsubscribes: "unsubscribes"
  },
  
  // Accessibility labels
  a11y: {
    searchInput: "Search campaigns by name, audience, or client",
    statusFilter: "Filter campaigns by status",
    channelFilter: "Filter campaigns by channel",
    typeFilter: "Filter campaigns by type",
    campaignCard: "Campaign card for {name}",
    metricsCard: "Metrics card showing {metric}",
    actionButton: "{action} button for {item}",
    sortButton: "Sort campaigns by {criteria}",
    viewModeButton: "Switch to {mode} view",
    loadingContent: "Loading campaign content",
    errorContent: "Error loading campaign content",
    emptyContent: "No campaigns available"
  }
} as const;

export type CampaignStringKeys = keyof typeof campaignStrings;