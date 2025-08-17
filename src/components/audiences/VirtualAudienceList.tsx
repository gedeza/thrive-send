'use client';

import React, { useMemo, useState, useCallback } from 'react';
import { FixedSizeList as List } from 'react-window';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Users, 
  Calendar, 
  Eye, 
  Edit, 
  BarChart3,
  Trash2
} from 'lucide-react';
import type { Audience } from '@/hooks/use-audience-data';

interface VirtualAudienceListProps {
  audiences: Audience[];
  isLoading?: boolean;
  onView?: (audience: Audience) => void;
  onEdit?: (audience: Audience) => void;
  onDelete?: (audience: Audience) => void;
  onAnalytics?: (audience: Audience) => void;
  selectedIds?: Set<string>;
  onSelectionChange?: (audienceId: string, selected: boolean) => void;
  height?: number;
}

const ITEM_HEIGHT = 280; // Height of each audience card

const getStatusConfig = (status: string) => {
  const configs = {
    ACTIVE: { color: 'bg-green-500', variant: 'default', label: 'Active' },
    INACTIVE: { color: 'bg-gray-500', variant: 'secondary', label: 'Inactive' },
    PROCESSING: { color: 'bg-yellow-500', variant: 'warning', label: 'Processing' }
  };
  return configs[status as keyof typeof configs] || configs.ACTIVE;
};

const getTypeConfig = (type: string) => {
  const configs = {
    CUSTOM: { label: 'Custom', color: 'text-blue-600' },
    IMPORTED: { label: 'Imported', color: 'text-purple-600' },
    DYNAMIC: { label: 'Dynamic', color: 'text-green-600' }
  };
  return configs[type as keyof typeof configs] || configs.CUSTOM;
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

interface AudienceRowProps {
  index: number;
  style: React.CSSProperties;
  data: {
    audiences: Audience[];
    onView?: (audience: Audience) => void;
    onEdit?: (audience: Audience) => void;
    onDelete?: (audience: Audience) => void;
    onAnalytics?: (audience: Audience) => void;
    selectedIds?: Set<string>;
    onSelectionChange?: (audienceId: string, selected: boolean) => void;
  };
}

const AudienceRow: React.FC<AudienceRowProps> = ({ index, style, data }) => {
  const { 
    audiences, 
    onView, 
    onEdit, 
    onDelete, 
    onAnalytics,
    selectedIds,
    onSelectionChange
  } = data;
  
  const audience = audiences[index];
  
  if (!audience) {
    return (
      <div style={style} className="px-4 py-2">
        <Card>
          <CardContent className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-6 w-48" />
                  <Skeleton className="h-4 w-96" />
                </div>
                <div className="flex gap-2">
                  <Skeleton className="h-8 w-16" />
                  <Skeleton className="h-8 w-16" />
                </div>
              </div>
              <div className="grid grid-cols-4 gap-4">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const statusConfig = getStatusConfig(audience.status);
  const typeConfig = getTypeConfig(audience.type);
  const isSelected = selectedIds?.has(audience.id) || false;

  return (
    <div style={style} className="px-4 py-2">
      <Card className={`hover:shadow-lg transition-shadow ${isSelected ? 'ring-2 ring-primary' : ''}`}>
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-start gap-3 flex-1">
              {onSelectionChange && (
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={(e) => onSelectionChange(audience.id, e.target.checked)}
                  className="mt-1"
                />
              )}
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-lg">{audience.name}</h3>
                  <Badge variant={statusConfig.variant as any}>
                    {statusConfig.label}
                  </Badge>
                  <Badge variant="outline" className={typeConfig.color}>
                    {typeConfig.label}
                  </Badge>
                </div>
                {audience.description && (
                  <p className="text-sm text-muted-foreground">{audience.description}</p>
                )}
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>{audience.size.toLocaleString()} contacts</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>Created {formatDate(audience.createdAt)}</span>
                  </div>
                  {audience.lastUpdated && (
                    <div className="flex items-center gap-1">
                      <span>Updated {formatDate(audience.lastUpdated)}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              {onView && (
                <Button variant="outline" size="sm" onClick={() => onView(audience)}>
                  <Eye className="h-4 w-4 mr-1" />
                  View
                </Button>
              )}
              {onEdit && (
                <Button variant="outline" size="sm" onClick={() => onEdit(audience)}>
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Button>
              )}
              {onAnalytics && (
                <Button variant="outline" size="sm" onClick={() => onAnalytics(audience)}>
                  <BarChart3 className="h-4 w-4 mr-1" />
                  Analytics
                </Button>
              )}
              {onDelete && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => onDelete(audience)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete
                </Button>
              )}
            </div>
          </div>

          {/* Tags */}
          {audience.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-4">
              {audience.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          {/* Performance Metrics */}
          {audience.analytics && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="text-center">
                <div className="text-lg font-bold text-blue-600">
                  {audience.analytics.avgEngagementRate.toFixed(1)}%
                </div>
                <p className="text-xs text-muted-foreground">Avg. Engagement</p>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-green-600">
                  +{audience.analytics.growth.monthly.toFixed(1)}%
                </div>
                <p className="text-xs text-muted-foreground">Monthly Growth</p>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-purple-600">
                  {audience.segments.length}
                </div>
                <p className="text-xs text-muted-foreground">Segments</p>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-orange-600">
                  {audience.analytics.totalEngagement.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">Total Engagement</p>
              </div>
            </div>
          )}

          {/* Segments Preview */}
          {audience.segments.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-medium">Segments ({audience.segments.length})</h4>
              <div className="space-y-2">
                {audience.segments.slice(0, 2).map((segment) => (
                  <div key={segment.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h5 className="font-medium text-sm">{segment.name}</h5>
                        <Badge variant="outline" className="text-xs">
                          {segment.type}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>{segment.size.toLocaleString()} contacts</span>
                        {segment.performance && (
                          <>
                            <span>{segment.performance.engagementRate.toFixed(1)}% engagement</span>
                            <span>{segment.performance.conversionRate.toFixed(1)}% conversion</span>
                          </>
                        )}
                      </div>
                    </div>
                    {segment.growth && (
                      <div className="text-right">
                        <div className={`text-sm font-medium ${
                          segment.growth.thisMonth > 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {segment.growth.thisMonth > 0 ? '+' : ''}{segment.growth.thisMonth.toFixed(1)}%
                        </div>
                        <p className="text-xs text-muted-foreground">this month</p>
                      </div>
                    )}
                  </div>
                ))}
                {audience.segments.length > 2 && (
                  <p className="text-sm text-muted-foreground text-center">
                    +{audience.segments.length - 2} more segments
                  </p>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default function VirtualAudienceList({
  audiences,
  isLoading = false,
  onView,
  onEdit,
  onDelete,
  onAnalytics,
  selectedIds,
  onSelectionChange,
  height = 600
}: VirtualAudienceListProps) {
  const itemData = useMemo(() => ({
    audiences,
    onView,
    onEdit,
    onDelete,
    onAnalytics,
    selectedIds,
    onSelectionChange
  }), [audiences, onView, onEdit, onDelete, onAnalytics, selectedIds, onSelectionChange]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-4 w-96" />
                  </div>
                  <div className="flex gap-2">
                    <Skeleton className="h-8 w-16" />
                    <Skeleton className="h-8 w-16" />
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-4">
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (audiences.length === 0) {
    return null; // Let parent handle empty state
  }

  return (
    <div className="w-full">
      <List
        height={height}
        itemCount={audiences.length}
        itemSize={ITEM_HEIGHT}
        itemData={itemData}
        overscanCount={2} // Render 2 extra items outside viewport for smoother scrolling
      >
        {AudienceRow}
      </List>
    </div>
  );
}