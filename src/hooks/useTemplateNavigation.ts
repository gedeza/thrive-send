'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { CAMPAIGN_TEMPLATES } from '@/data/campaign-templates';
import { CampaignTemplate } from '@/types/campaign';
import { fetchTemplates } from '@/lib/api/templates-service';

/**
 * Hybrid Template Navigation Hook
 * Phase 1: Efficient navigation system for 10+ templates
 */
interface TemplateFilters {
  industry?: string[];
  difficulty?: string[];
  type?: string[];
  searchQuery?: string;
  showFavorites?: boolean;
}

interface TemplateCategory {
  id: string;
  name: string;
  description: string;
  templates: CampaignTemplate[];
  icon: string;
}

interface UseTemplateNavigationOptions {
  pageSize?: number;
  enableVirtualization?: boolean;
  defaultFilters?: TemplateFilters;
  favoriteTemplateIds?: string[];
}

export function useTemplateNavigation(options: UseTemplateNavigationOptions = {}) {
  const {
    pageSize = 6,
    enableVirtualization = true,
    defaultFilters = {},
    favoriteTemplateIds = []
  } = options;

  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<TemplateFilters>(defaultFilters);
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'category'>('grid');
  const [isLoading, setIsLoading] = useState(false);
  const [apiTemplates, setApiTemplates] = useState<any[]>([]);
  const [hasLoadedApi, setHasLoadedApi] = useState(false);

  // Fetch templates from API
  useEffect(() => {
    async function loadTemplates() {
      setIsLoading(true);
      try {
        const templates = await fetchTemplates();
        setApiTemplates(templates);
        setHasLoadedApi(true);
      } catch (error) {
        console.warn('Failed to load API templates, using static templates:', error);
        setHasLoadedApi(false);
      }
      setIsLoading(false);
    }
    loadTemplates();
  }, []);

  // Choose template source based on API availability
  const activeTemplates = useMemo(() => {
    if (hasLoadedApi && apiTemplates.length > 0) {
      // Transform API templates to match expected format
      return apiTemplates.map(template => ({
        ...template,
        industry: template.category || 'General',
        difficulty: 'beginner', // Default value
        targetAudience: { industries: [template.category || 'General'] },
        estimatedResults: { leads: 0, roi: 'TBD' }
      }));
    }
    return CAMPAIGN_TEMPLATES;
  }, [hasLoadedApi, apiTemplates]);

  // Categorize templates for hybrid navigation (memoized once)
  const templateCategories = useMemo((): TemplateCategory[] => {
    const categoryMap = new Map<string, CampaignTemplate[]>();

    activeTemplates.forEach(template => {
      const industry = template.industry || 'General';
      if (!categoryMap.has(industry)) {
        categoryMap.set(industry, []);
      }
      categoryMap.get(industry)!.push(template);
    });

    return Array.from(categoryMap.entries()).map(([industry, templates]) => ({
      id: industry.toLowerCase().replace(/\s+/g, '-'),
      name: industry,
      description: `${templates.length} templates for ${industry}`,
      templates,
      icon: getIndustryIcon(industry)
    }));
  }, [activeTemplates]); // Dependencies: activeTemplates

  // Apply filters and search
  const filteredTemplates = useMemo(() => {
    let filtered = [...activeTemplates];

    // Search query filter
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      filtered = filtered.filter(template =>
        template.name.toLowerCase().includes(query) ||
        (template.description && template.description.toLowerCase().includes(query)) ||
        template.industry.toLowerCase().includes(query) ||
        template.targetAudience.industries.some(ind =>
          ind.toLowerCase().includes(query)
        )
      );
    }

    // Industry filter
    if (filters.industry && filters.industry.length > 0) {
      filtered = filtered.filter(template =>
        filters.industry!.some(industry =>
          template.industry.toLowerCase().includes(industry.toLowerCase())
        )
      );
    }

    // Difficulty filter
    if (filters.difficulty && filters.difficulty.length > 0) {
      filtered = filtered.filter(template =>
        filters.difficulty!.includes(template.difficulty)
      );
    }

    // Type filter (based on template properties)
    if (filters.type && filters.type.length > 0) {
      filtered = filtered.filter(template => {
        const templateType = determineTemplateType(template);
        return filters.type!.includes(templateType);
      });
    }

    // Favorites filter
    if (filters.showFavorites) {
      filtered = filtered.filter(template =>
        favoriteTemplateIds.includes(template.id)
      );
    }

    return filtered;
  }, [filters, favoriteTemplateIds, activeTemplates]);

  // Pagination logic (optimized)
  const paginatedTemplates = useMemo(() => {
    if (viewMode === 'category') {
      // For category view, return categories with filtered templates
      const filteredIds = new Set(filteredTemplates.map(t => t.id));
      return templateCategories.map(category => ({
        ...category,
        templates: category.templates.filter(template =>
          filteredIds.has(template.id)
        )
      })).filter(category => category.templates.length > 0);
    }

    // For grid/list view, use pagination
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredTemplates.slice(startIndex, endIndex);
  }, [filteredTemplates, currentPage, pageSize, viewMode, templateCategories]);

  // Navigation metadata (optimized)
  const navigationMetadata = useMemo(() => {
    const totalTemplates = filteredTemplates.length;
    const totalPages = Math.ceil(totalTemplates / pageSize);

    return {
      totalTemplates,
      totalPages,
      currentPage,
      hasNextPage: currentPage < totalPages,
      hasPreviousPage: currentPage > 1,
      templatesPerPage: pageSize,
      filteredTemplates: totalTemplates,
      allTemplates: activeTemplates.length,
      categories: templateCategories.length
    };
  }, [filteredTemplates.length, currentPage, pageSize, activeTemplates.length, templateCategories.length]);

  // Performance metrics for virtualization
  const performanceMetrics = useMemo(() => {
    return {
      shouldVirtualize: enableVirtualization && filteredTemplates.length > 20,
      estimatedHeight: filteredTemplates.length * (viewMode === 'list' ? 120 : 280),
      chunkSize: Math.min(pageSize, 10),
      renderThreshold: 15
    };
  }, [enableVirtualization, filteredTemplates.length, viewMode, pageSize]);

  // Filter update with loading state (optimized with useCallback)
  const updateFilters = useCallback(async (newFilters: Partial<TemplateFilters>) => {
    setIsLoading(true);
    setFilters(prev => ({ ...prev, ...newFilters }));
    setCurrentPage(1); // Reset to first page when filters change

    // Reduced delay for better performance
    await new Promise(resolve => setTimeout(resolve, 50));
    setIsLoading(false);
  }, []);

  // Quick search function (debounced)
  const searchTemplates = useCallback((query: string) => {
    updateFilters({ searchQuery: query });
  }, [updateFilters]);

  // Category navigation (optimized with useCallback)
  const navigateToCategory = useCallback((categoryId: string) => {
    const category = templateCategories.find(cat => cat.id === categoryId);
    if (category) {
      updateFilters({
        industry: [category.name],
        searchQuery: undefined
      });
      setViewMode('grid');
    }
  }, [templateCategories, updateFilters]);

  // Popular/trending templates (memoized for performance)
  const getPopularTemplates = useMemo(() => {
    const sortedTemplates = [...activeTemplates]
      .sort((a, b) => {
        // Sort by ROI potential and lead generation
        const aScore = parseROI(a.estimatedResults.roi) + a.estimatedResults.leads;
        const bScore = parseROI(b.estimatedResults.roi) + b.estimatedResults.leads;
        return bScore - aScore;
      });

    return (limit: number = 5) => sortedTemplates.slice(0, limit);
  }, [activeTemplates]);

  // Recently viewed (memoized)
  const getRecentTemplates = useCallback((limit: number = 3) => {
    // Placeholder for recently viewed logic
    return activeTemplates.slice(0, limit);
  }, [activeTemplates]);

  return {
    // Core data
    templates: paginatedTemplates,
    categories: templateCategories,

    // Navigation state
    currentPage,
    viewMode,
    filters,
    isLoading,

    // Metadata
    metadata: navigationMetadata,
    performance: performanceMetrics,

    // Actions
    setCurrentPage,
    setViewMode,
    updateFilters,
    searchTemplates,
    navigateToCategory,

    // Convenience getters
    getPopularTemplates,
    getRecentTemplates,

    // Reset function
    resetFilters: () => updateFilters(defaultFilters),
    resetPagination: () => setCurrentPage(1)
  };
}

/**
 * Helper functions
 */
function getIndustryIcon(industry: string): string {
  const iconMap: Record<string, string> = {
    'Healthcare': 'activity',
    'Technology': 'cpu',
    'Education': 'graduation-cap',
    'Real Estate': 'home',
    'Finance': 'dollar-sign',
    'Retail': 'shopping-bag',
    'Food & Beverage': 'utensils',
    'Fitness': 'dumbbell',
    'Consulting': 'briefcase',
    'Legal': 'scale',
    'Marketing': 'megaphone',
    'Construction': 'hammer'
  };

  return iconMap[industry] || 'folder';
}

function determineTemplateType(template: CampaignTemplate): string {
  // Determine template type based on properties
  if (template.estimatedResults.leads >= 100) return 'high-conversion';
  if (template.estimatedResults.consultations >= 10) return 'consultation-focused';
  if (template.difficulty === 'beginner') return 'beginner-friendly';
  if (template.duration.includes('1 week')) return 'quick-launch';
  return 'standard';
}

function parseROI(roiString: string): number {
  const match = roiString.match(/(\d+)%/);
  return match ? parseInt(match[1]) : 0;
}

// Available filter options
export const TEMPLATE_FILTER_OPTIONS = {
  industries: [
    'Healthcare', 'Technology', 'Education', 'Real Estate',
    'Finance', 'Retail', 'Food & Beverage', 'Fitness',
    'Consulting', 'Legal', 'Marketing', 'Construction'
  ],
  difficulties: ['beginner', 'intermediate', 'advanced'],
  types: [
    'high-conversion', 'consultation-focused',
    'beginner-friendly', 'quick-launch', 'standard'
  ]
} as const;