'use client';

import React, { useState, useMemo, useCallback, memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Search,
  Grid3X3,
  List,
  Layers,
  Filter,
  Star,
  ChevronRight,
  Clock,
  Users,
  TrendingUp,
  Sparkles,
  ArrowRight,
  Sliders
} from 'lucide-react';
import { useTemplateNavigation, TEMPLATE_FILTER_OPTIONS } from '@/hooks/useTemplateNavigation';
import { useUserContext } from '@/hooks/useUserContext';
import { CampaignTemplate } from '@/types/campaign';

/**
 * Hybrid Template Explorer
 * Phase 1: Scalable template navigation system for 10+ templates
 */
interface HybridTemplateExplorerProps {
  onTemplateSelect?: (templateId: string) => void;
  showRecommendations?: boolean;
  compactMode?: boolean;
  className?: string;
}

export const HybridTemplateExplorer = memo(function HybridTemplateExplorer({
  onTemplateSelect,
  showRecommendations = true,
  compactMode = false,
  className = ''
}: HybridTemplateExplorerProps) {
  const userContext = useUserContext();
  const [showFilters, setShowFilters] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState({
    industry: [] as string[],
    difficulty: [] as string[],
    type: [] as string[]
  });

  const {
    templates,
    categories,
    currentPage,
    viewMode,
    filters,
    isLoading,
    metadata,
    setCurrentPage,
    setViewMode,
    updateFilters,
    searchTemplates,
    navigateToCategory,
    getPopularTemplates,
    resetFilters
  } = useTemplateNavigation({
    pageSize: compactMode ? 4 : 8,
    favoriteTemplateIds: [], // Would come from user preferences
    defaultFilters: {}
  });

  const popularTemplates = useMemo(() => getPopularTemplates(3), [getPopularTemplates]);

  // Optimize filter handlers with useCallback
  const handleFilterChange = useCallback((filterType: keyof typeof selectedFilters, value: string) => {
    const newFilters = { ...selectedFilters };
    const currentValues = newFilters[filterType];

    if (currentValues.includes(value)) {
      newFilters[filterType] = currentValues.filter(v => v !== value);
    } else {
      newFilters[filterType] = [...currentValues, value];
    }

    setSelectedFilters(newFilters);
    updateFilters(newFilters);
  }, [selectedFilters, updateFilters]);

  const clearAllFilters = useCallback(() => {
    setSelectedFilters({ industry: [], difficulty: [], type: [] });
    resetFilters();
  }, [resetFilters]);

  // Render template card
  const renderTemplateCard = (template: CampaignTemplate, size: 'small' | 'medium' | 'large' = 'medium') => {
    const isSmall = size === 'small';
    const isLarge = size === 'large';

    return (
      <Card
        key={template.id}
        className={`
          cursor-pointer transition-all duration-200 hover:shadow-lg border-border/50
          ${isSmall ? 'p-3' : 'p-4'}
          ${isLarge ? 'col-span-2' : ''}
        `}
        onClick={() => onTemplateSelect?.(template.id)}
      >
        <CardHeader className={`pb-2 ${isSmall ? 'p-2' : 'p-4'}`}>
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <CardTitle className={`${isSmall ? 'text-sm' : 'text-base'} truncate`}>
                {template.name}
              </CardTitle>
              <p className={`text-muted-foreground mt-1 ${isSmall ? 'text-xs' : 'text-sm'} line-clamp-2`}>
                {template.description}
              </p>
            </div>
            <ChevronRight className={`${isSmall ? 'h-3 w-3' : 'h-4 w-4'} text-muted-foreground flex-shrink-0 ml-2`} />
          </div>
        </CardHeader>

        <CardContent className={`pt-0 ${isSmall ? 'p-2' : 'p-4'}`}>
          <div className="space-y-3">
            {/* Template metrics */}
            <div className="flex items-center gap-3">
              <Badge variant="outline" className={`${isSmall ? 'text-xs px-1' : 'text-xs'}`}>
                {template.difficulty}
              </Badge>
              <div className="flex items-center gap-1 text-muted-foreground">
                <Clock className={`${isSmall ? 'h-3 w-3' : 'h-3 w-3'}`} />
                <span className={`${isSmall ? 'text-xs' : 'text-xs'}`}>{template.duration}</span>
              </div>
            </div>

            {/* Results preview */}
            <div className="grid grid-cols-2 gap-2">
              <div className="text-center p-2 bg-primary/5 rounded">
                <div className={`font-semibold text-primary ${isSmall ? 'text-xs' : 'text-sm'}`}>
                  {template.estimatedResults.leads}+
                </div>
                <div className={`text-muted-foreground ${isSmall ? 'text-xs' : 'text-xs'}`}>leads</div>
              </div>
              <div className="text-center p-2 bg-green-50 rounded">
                <div className={`font-semibold text-green-600 ${isSmall ? 'text-xs' : 'text-sm'}`}>
                  {template.estimatedResults.roi.split(' ')[0]}
                </div>
                <div className={`text-muted-foreground ${isSmall ? 'text-xs' : 'text-xs'}`}>ROI</div>
              </div>
            </div>

            {/* Service provider indicator */}
            {userContext.isServiceProvider && template.estimatedResults.consultations > 5 && (
              <Badge className="w-full justify-center bg-blue-50 text-blue-700 border-blue-200">
                <Users className="h-3 w-3 mr-1" />
                Multi-client ready
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  // Render category view
  const renderCategoryView = () => (
    <div className="space-y-6">
      {categories.map(category => (
        <Card key={category.id} className="border-border/50">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <span>{category.name}</span>
                  <Badge variant="outline">{category.templates.length}</Badge>
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  {category.description}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateToCategory(category.id)}
              >
                View All
                <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {category.templates.slice(0, 3).map(template =>
                renderTemplateCard(template, 'small')
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  if (compactMode) {
    return (
      <Card className={`border-border/50 ${className}`}>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">Choose Template</CardTitle>
          <div className="relative">
            <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search templates..."
              className="pl-9"
              onChange={(e) => searchTemplates(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {templates.slice(0, 4).map(template =>
              renderTemplateCard(template, 'small')
            )}
          </div>
          {metadata.totalTemplates > 4 && (
            <div className="text-center mt-4">
              <Button variant="outline" size="sm">
                View All {metadata.totalTemplates} Templates
                <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header with search and controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Campaign Templates</h2>
          <p className="text-muted-foreground">
            {metadata.totalTemplates} templates available • {metadata.categories} categories
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* View mode toggle */}
          <div className="flex items-center border rounded-lg p-1">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'category' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('category')}
            >
              <Layers className="h-4 w-4" />
            </Button>
          </div>

          {/* Filters toggle */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
        </div>
      </div>

      {/* Search and recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="relative">
            <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search templates by name, industry, or description..."
              className="pl-9"
              onChange={(e) => searchTemplates(e.target.value)}
            />
          </div>
        </div>

        {showRecommendations && (
          <Card className="border-l-2 border-primary/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                Popular Templates
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {popularTemplates.map((template, idx) => (
                <div
                  key={template.id}
                  className="flex items-center gap-2 p-2 rounded cursor-pointer hover:bg-muted/50"
                  onClick={() => onTemplateSelect?.(template.id)}
                >
                  <div className="w-6 h-6 bg-primary/10 rounded text-xs flex items-center justify-center font-semibold text-primary">
                    {idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{template.name}</div>
                    <div className="text-xs text-muted-foreground">{template.industry}</div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Filters panel */}
      {showFilters && (
        <Card className="border-border/50">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Filters</CardTitle>
              <Button variant="ghost" size="sm" onClick={clearAllFilters}>
                Clear All
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Industry filter */}
              <div>
                <h4 className="font-medium mb-2">Industry</h4>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {TEMPLATE_FILTER_OPTIONS.industries.map(industry => (
                    <label key={industry} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={selectedFilters.industry.includes(industry)}
                        onChange={() => handleFilterChange('industry', industry)}
                        className="rounded border-border"
                      />
                      <span className="text-sm">{industry}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Difficulty filter */}
              <div>
                <h4 className="font-medium mb-2">Difficulty</h4>
                <div className="space-y-2">
                  {TEMPLATE_FILTER_OPTIONS.difficulties.map(difficulty => (
                    <label key={difficulty} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={selectedFilters.difficulty.includes(difficulty)}
                        onChange={() => handleFilterChange('difficulty', difficulty)}
                        className="rounded border-border"
                      />
                      <span className="text-sm capitalize">{difficulty}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Type filter */}
              <div>
                <h4 className="font-medium mb-2">Type</h4>
                <div className="space-y-2">
                  {TEMPLATE_FILTER_OPTIONS.types.map(type => (
                    <label key={type} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={selectedFilters.type.includes(type)}
                        onChange={() => handleFilterChange('type', type)}
                        className="rounded border-border"
                      />
                      <span className="text-sm">{type.replace('-', ' ')}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Templates display */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="animate-pulse">
                <div className="bg-muted rounded-lg h-64"></div>
              </div>
            ))}
          </div>
        ) : viewMode === 'category' ? (
          renderCategoryView()
        ) : (
          <div className={`
            grid gap-4
            ${viewMode === 'list'
              ? 'grid-cols-1'
              : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
            }
          `}>
            {templates.map(template =>
              renderTemplateCard(template, viewMode === 'list' ? 'large' : 'medium')
            )}
          </div>
        )}

        {/* Pagination */}
        {viewMode !== 'category' && metadata.totalPages > 1 && (
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Showing {((currentPage - 1) * metadata.templatesPerPage) + 1} to{' '}
              {Math.min(currentPage * metadata.templatesPerPage, metadata.totalTemplates)} of{' '}
              {metadata.totalTemplates} templates
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={!metadata.hasPreviousPage}
                onClick={() => setCurrentPage(currentPage - 1)}
              >
                Previous
              </Button>
              <span className="text-sm px-2">
                {currentPage} of {metadata.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={!metadata.hasNextPage}
                onClick={() => setCurrentPage(currentPage + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
});