'use client';

import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
}

// Calendar Event Skeleton
export const CalendarEventSkeleton: React.FC<SkeletonProps> = ({ className }) => (
  <div className={cn("p-3 border rounded-lg space-y-2", className)}>
    <div className="flex items-center justify-between">
      <Skeleton className="h-4 w-16" />
      <Skeleton className="h-4 w-12" />
    </div>
    <Skeleton className="h-4 w-full" />
    <Skeleton className="h-3 w-3/4" />
  </div>
);

// Calendar Grid Skeleton
export const CalendarGridSkeleton: React.FC<SkeletonProps> = ({ className }) => (
  <div className={cn("grid grid-cols-7 gap-2", className)}>
    {/* Day headers */}
    {Array.from({ length: 7 }).map((_, i) => (
      <div key={i} className="p-2 text-center">
        <Skeleton className="h-4 w-8 mx-auto" />
      </div>
    ))}
    
    {/* Calendar cells */}
    {Array.from({ length: 42 }).map((_, i) => (
      <div key={i} className="aspect-square p-2 border rounded-lg">
        <Skeleton className="h-4 w-6 mb-2" />
        <div className="space-y-1">
          {Math.random() > 0.7 && <Skeleton className="h-2 w-full" />}
          {Math.random() > 0.8 && <Skeleton className="h-2 w-3/4" />}
        </div>
      </div>
    ))}
  </div>
);

// Event List Skeleton
export const EventListSkeleton: React.FC<SkeletonProps> = ({ className }) => (
  <div className={cn("space-y-4", className)}>
    {Array.from({ length: 8 }).map((_, i) => (
      <div key={i} className="p-4 border rounded-lg">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-20" />
            </div>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-3 w-3/4" />
            <div className="flex gap-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-20" />
            </div>
          </div>
          <div className="flex gap-1">
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-8 w-8" />
          </div>
        </div>
      </div>
    ))}
  </div>
);

// Week View Skeleton
export const WeekViewSkeleton: React.FC<SkeletonProps> = ({ className }) => (
  <div className={cn("space-y-4", className)}>
    {/* Week header */}
    <div className="grid grid-cols-7 gap-2">
      {Array.from({ length: 7 }).map((_, i) => (
        <div key={i} className="p-2 text-center border rounded-lg">
          <Skeleton className="h-4 w-8 mx-auto mb-1" />
          <Skeleton className="h-6 w-6 mx-auto" />
        </div>
      ))}
    </div>
    
    {/* Time slots */}
    <div className="grid grid-cols-8 gap-2">
      <div className="space-y-4">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="h-12 flex items-center">
            <Skeleton className="h-3 w-12" />
          </div>
        ))}
      </div>
      
      {Array.from({ length: 7 }).map((_, dayIndex) => (
        <div key={dayIndex} className="space-y-4">
          {Array.from({ length: 12 }).map((_, hourIndex) => (
            <div key={hourIndex} className="h-12 border rounded p-1">
              {Math.random() > 0.8 && (
                <Skeleton className="h-full w-full" />
              )}
            </div>
          ))}
        </div>
      ))}
    </div>
  </div>
);

// Day View Skeleton
export const DayViewSkeleton: React.FC<SkeletonProps> = ({ className }) => (
  <div className={cn("space-y-4", className)}>
    {/* Day header */}
    <div className="text-center p-4 border rounded-lg">
      <Skeleton className="h-6 w-40 mx-auto mb-2" />
      <Skeleton className="h-4 w-24 mx-auto" />
    </div>
    
    {/* Time slots */}
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2">
        {Array.from({ length: 24 }).map((_, i) => (
          <div key={i} className="flex items-center gap-2">
            <Skeleton className="h-4 w-12" />
            <div className="flex-1 border rounded p-2">
              {Math.random() > 0.7 && (
                <Skeleton className="h-8 w-full" />
              )}
            </div>
          </div>
        ))}
      </div>
      
      <div className="space-y-4">
        <h3 className="font-semibold">
          <Skeleton className="h-5 w-32" />
        </h3>
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="p-3 border rounded-lg">
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-3 w-3/4" />
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

// Calendar Header Skeleton
export const CalendarHeaderSkeleton: React.FC<SkeletonProps> = ({ className }) => (
  <div className={cn("flex items-center justify-between p-4 border rounded-lg", className)}>
    <div className="flex items-center gap-4">
      <Skeleton className="h-8 w-8" />
      <Skeleton className="h-6 w-32" />
      <Skeleton className="h-8 w-8" />
    </div>
    
    <div className="flex items-center gap-2">
      <Skeleton className="h-8 w-24" />
      <Skeleton className="h-8 w-24" />
      <Skeleton className="h-8 w-24" />
      <Skeleton className="h-8 w-24" />
    </div>
  </div>
);

// Template Card Skeleton
export const TemplateCardSkeleton: React.FC<SkeletonProps> = ({ className }) => (
  <Card className={cn("", className)}>
    <CardHeader>
      <div className="flex items-center gap-2">
        <Skeleton className="h-8 w-8" />
        <div className="flex-1">
          <Skeleton className="h-5 w-32 mb-1" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>
    </CardHeader>
    <CardContent>
      <Skeleton className="h-16 w-full mb-3" />
      <div className="flex gap-2">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-14" />
      </div>
    </CardContent>
  </Card>
);

// Analytics Card Skeleton
export const AnalyticsCardSkeleton: React.FC<SkeletonProps> = ({ className }) => (
  <Card className={cn("", className)}>
    <CardHeader>
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-5 w-24 mb-1" />
          <Skeleton className="h-4 w-32" />
        </div>
        <Skeleton className="h-8 w-8" />
      </div>
    </CardHeader>
    <CardContent>
      <div className="space-y-4">
        <div>
          <Skeleton className="h-8 w-20 mb-2" />
          <Skeleton className="h-4 w-16" />
        </div>
        <div className="h-32 w-full">
          <Skeleton className="h-full w-full" />
        </div>
      </div>
    </CardContent>
  </Card>
);

// Form Skeleton
export const FormSkeleton: React.FC<SkeletonProps> = ({ className }) => (
  <div className={cn("space-y-6", className)}>
    <div className="space-y-2">
      <Skeleton className="h-4 w-16" />
      <Skeleton className="h-10 w-full" />
    </div>
    
    <div className="space-y-2">
      <Skeleton className="h-4 w-20" />
      <Skeleton className="h-24 w-full" />
    </div>
    
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-10 w-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-14" />
        <Skeleton className="h-10 w-full" />
      </div>
    </div>
    
    <div className="space-y-2">
      <Skeleton className="h-4 w-12" />
      <Skeleton className="h-10 w-full" />
    </div>
    
    <div className="flex justify-end gap-2">
      <Skeleton className="h-10 w-20" />
      <Skeleton className="h-10 w-24" />
    </div>
  </div>
);

// Page Loading Skeleton
export const PageLoadingSkeleton: React.FC<SkeletonProps> = ({ className }) => (
  <div className={cn("container mx-auto p-6 space-y-6", className)}>
    {/* Header */}
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-6 w-px" />
        <Skeleton className="h-8 w-32" />
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-8 w-24" />
        <Skeleton className="h-8 w-24" />
        <Skeleton className="h-8 w-24" />
      </div>
    </div>
    
    {/* Calendar header */}
    <CalendarHeaderSkeleton />
    
    {/* Calendar content */}
    <div className="border rounded-xl p-4">
      <CalendarGridSkeleton />
    </div>
  </div>
);