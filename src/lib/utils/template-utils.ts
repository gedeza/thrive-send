/**
 * Shared Template Utilities
 * Centralized functions for template operations to eliminate code duplication
 */

import type { 
  Template, 
  CampaignTemplate, 
  TemplateFilters, 
  TemplateStats,
  TemplateContent,
  TemplateVariable
} from '@/types/template';

// Icon mapping for template types
export const getTypeIcon = (type: string) => {
  const iconMap: Record<string, string> = {
    'email': '📧',
    'social': '📱',
    'blog': '📝',
    'multi-channel': '🎯',
    'report': '📊',
    'marketing': '🎯',
    'sales': '💼',
    'support': '🤝'
  };
  return iconMap[type] || '📄';
};

// Status badge styling
export const getStatusBadgeConfig = (status: string) => {
  const configs = {
    PUBLISHED: { className: "bg-green-100 text-green-800", variant: "default" as const },
    DRAFT: { className: "bg-yellow-100 text-yellow-900", variant: "secondary" as const },
    PENDING_APPROVAL: { className: "bg-blue-100 text-blue-800", variant: "default" as const },
    ARCHIVED: { className: "bg-gray-100 text-gray-600", variant: "outline" as const }
  };
  return configs[status as keyof typeof configs] || configs.DRAFT;
};

// Category badge styling
export const getCategoryBadgeColor = (category: string) => {
  const colorMap: Record<string, string> = {
    email: "bg-blue-100 text-blue-800",
    social: "bg-indigo-100 text-indigo-800",
    blog: "bg-orange-100 text-orange-800",
    marketing: "bg-purple-100 text-purple-800",
    sales: "bg-emerald-100 text-emerald-800",
    support: "bg-pink-100 text-pink-800"
  };
  return colorMap[category] || "bg-gray-100 text-gray-800";
};

// Campaign goal badge styling
export const getGoalColor = (goal: string) => {
  const colors = {
    awareness: 'bg-blue-100 text-blue-800',
    engagement: 'bg-purple-100 text-purple-800',
    conversion: 'bg-green-100 text-green-800',
    retention: 'bg-orange-100 text-orange-800'
  };
  return colors[goal as keyof typeof colors] || 'bg-gray-100 text-gray-800';
};

// Difficulty badge styling
export const getDifficultyColor = (difficulty: string) => {
  const colors = {
    beginner: 'bg-green-100 text-green-700',
    intermediate: 'bg-yellow-100 text-yellow-700',
    advanced: 'bg-red-100 text-red-700'
  };
  return colors[difficulty as keyof typeof colors] || 'bg-gray-100 text-gray-800';
};

// Template filtering logic
export const filterTemplates = <T extends Template>(
  templates: T[], 
  filters: TemplateFilters
): T[] => {
  return templates.filter(template => {
    const matchesSearch = !filters.searchQuery || 
      template.name.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
      template.tags?.some(tag => tag.toLowerCase().includes(filters.searchQuery.toLowerCase()));

    const matchesType = !filters.type || filters.type === 'all' || template.type === filters.type;
    const matchesCategory = !filters.category || filters.category === 'all' || template.category === filters.category;
    const matchesStatus = !filters.status || filters.status === 'all' || template.status === filters.status;

    // Campaign-specific filtering
    if ('campaignGoal' in template && filters.campaignGoal && filters.campaignGoal !== 'all') {
      const campaignTemplate = template as CampaignTemplate;
      if (campaignTemplate.campaignGoal !== filters.campaignGoal) return false;
    }

    if ('difficulty' in template && filters.difficulty && filters.difficulty !== 'all') {
      const campaignTemplate = template as CampaignTemplate;
      if (campaignTemplate.difficulty !== filters.difficulty) return false;
    }

    return matchesSearch && matchesType && matchesCategory && matchesStatus;
  });
};

// Calculate template statistics
export const calculateTemplateStats = <T extends Template>(templates: T[] = []): TemplateStats => {
  const stats: TemplateStats = {
    total: templates.length,
    published: templates.filter(t => t.status === 'PUBLISHED').length,
    draft: templates.filter(t => t.status === 'DRAFT').length,
    archived: templates.filter(t => t.status === 'ARCHIVED').length,
    recommended: 0,
    totalUsage: 0,
    avgPerformance: 0,
    byType: {},
    byCategory: {}
  };

  // Count by type
  templates.forEach(template => {
    stats.byType![template.type] = (stats.byType![template.type] || 0) + 1;
    stats.byCategory![template.category] = (stats.byCategory![template.category] || 0) + 1;
  });

  // Campaign-specific stats
  const campaignTemplates = templates.filter(t => 'isRecommended' in t) as CampaignTemplate[];
  if (campaignTemplates.length > 0) {
    stats.recommended = campaignTemplates.filter(t => t.isRecommended).length;
    stats.totalUsage = campaignTemplates.reduce((sum, t) => sum + (t.usageCount || 0), 0);
    
    const performanceScores = campaignTemplates
      .map(t => t.performanceScore || 0)
      .filter(score => score > 0);
    
    if (performanceScores.length > 0) {
      stats.avgPerformance = Math.round(
        (performanceScores.reduce((sum, score) => sum + score, 0) / performanceScores.length) * 100
      );
    }
  }

  return stats;
};

// Infer campaign goal from template content
export const inferCampaignGoal = (category: string, name: string): CampaignTemplate['campaignGoal'] => {
  const text = `${category} ${name}`.toLowerCase();
  if (text.includes('retention') || text.includes('loyalty') || text.includes('reactivation')) return 'retention';
  if (text.includes('conversion') || text.includes('sales') || text.includes('purchase')) return 'conversion';
  if (text.includes('engagement') || text.includes('social') || text.includes('community')) return 'engagement';
  return 'awareness';
};

// Generate template tags based on category and type
export const generateTemplateTags = (category: string, type: string): string[] => {
  const baseTags = [category, type];
  const additionalTags = ['responsive', 'mobile-friendly', 'customizable'];
  return [...baseTags, ...additionalTags.slice(0, Math.floor(Math.random() * 2) + 1)];
};

// Infer difficulty level
export const inferDifficulty = (category: string): CampaignTemplate['difficulty'] => {
  if (category.includes('sales') || category.includes('conversion')) return 'advanced';
  if (category.includes('marketing')) return 'intermediate';
  return 'beginner';
};

// Generate estimated setup time
export const generateEstimatedTime = (): string => {
  const times = ['10 minutes', '15 minutes', '20 minutes', '30 minutes', '45 minutes'];
  return times[Math.floor(Math.random() * times.length)];
};

// Template validation
export const validateTemplate = (template: Partial<Template>): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!template.name || template.name.trim().length === 0) {
    errors.push('Template name is required');
  }

  if (!template.description || template.description.trim().length === 0) {
    errors.push('Template description is required');
  }

  if (!template.type || !['email', 'social', 'blog', 'multi-channel'].includes(template.type)) {
    errors.push('Valid template type is required');
  }

  if (!template.category || template.category.trim().length === 0) {
    errors.push('Template category is required');
  }

  if (!template.status || !['DRAFT', 'PUBLISHED', 'ARCHIVED', 'PENDING_APPROVAL'].includes(template.status)) {
    errors.push('Valid template status is required');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Template transformation utilities
export const transformToEnhancedTemplate = (template: any): CampaignTemplate => {
  return {
    id: template.id,
    name: template.name,
    description: template.description || 'Professional campaign template',
    type: template.type || 'email',
    category: template.category || 'marketing',
    status: template.status || 'PUBLISHED',
    campaignGoal: inferCampaignGoal(template.category || 'marketing', template.name || ''),
    performanceScore: template.performanceScore || Math.random() * 0.3 + 0.6, // 60-90%
    usageCount: template.usageCount || Math.floor(Math.random() * 100) + 5,
    estimatedROI: template.estimatedROI || Math.floor(Math.random() * 500) + 150,
    conversionRate: template.conversionRate || Math.random() * 0.15 + 0.05, // 5-20%
    createdAt: template.createdAt || new Date().toISOString(),
    lastUpdated: template.lastUpdated || new Date().toISOString(),
    tags: generateTemplateTags(template.category || 'marketing', template.type || 'email'),
    isRecommended: template.aiRecommended || Math.random() > 0.7,
    difficulty: inferDifficulty(template.category || 'marketing'),
    estimatedTime: generateEstimatedTime(),
    authorId: template.authorId || '',
    organizationId: template.organizationId || '',
    content: template.content
  };
};

// Sort templates by various criteria
export const sortTemplates = <T extends Template>(
  templates: T[], 
  sortBy: 'name' | 'created' | 'updated' | 'status' | 'performance'
): T[] => {
  return [...templates].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'created':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case 'updated':
        return new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime();
      case 'status':
        const statusOrder = { PUBLISHED: 0, PENDING_APPROVAL: 1, DRAFT: 2, ARCHIVED: 3 };
        return statusOrder[a.status as keyof typeof statusOrder] - statusOrder[b.status as keyof typeof statusOrder];
      case 'performance':
        const aPerf = ('performanceScore' in a) ? (a as CampaignTemplate).performanceScore || 0 : 0;
        const bPerf = ('performanceScore' in b) ? (b as CampaignTemplate).performanceScore || 0 : 0;
        return bPerf - aPerf;
      default:
        return 0;
    }
  });
};

// Get template content variables
export const extractTemplateVariables = (content: string): TemplateVariable[] => {
  const variableRegex = /\{\{([^}]+)\}\}/g;
  const variables: TemplateVariable[] = [];
  let match;

  while ((match = variableRegex.exec(content)) !== null) {
    const variableName = match[1].trim();
    if (!variables.find(v => v.name === variableName)) {
      variables.push({
        id: `var_${variables.length + 1}`,
        name: variableName,
        type: 'text',
        required: true,
        description: `Variable for ${variableName}`
      });
    }
  }

  return variables;
};

// Format template content for display
export const formatTemplateContent = (content: string, variables?: Record<string, any>): string => {
  if (!variables) return content;

  let formattedContent = content;
  Object.entries(variables).forEach(([key, value]) => {
    const regex = new RegExp(`\\{\\{\\s*${key}\\s*\\}\\}`, 'g');
    formattedContent = formattedContent.replace(regex, String(value || ''));
  });

  return formattedContent;
};