import React, { lazy } from 'react';
import { 
  LazyWrapper, 
  AnalyticsSkeleton, 
  CalendarSkeleton, 
  FormSkeleton, 
  ChartSkeleton 
} from './LazyWrapper';

// Lazy load heavy analytics components
export const LazyConversionFunnel = lazy(() => 
  import('@/components/analytics/ConversionFunnel').then(module => ({
    default: module.ConversionFunnel
  }))
);

export const LazyFunnelManager = lazy(() => 
  import('@/components/analytics/FunnelManager').then(module => ({
    default: module.FunnelManager
  }))
);

// Lazy load chart components - using Chart.js optimized components
export const LazyOptimizedBarChart = lazy(() => 
  import('@/components/analytics/OptimizedChartComponents').then(module => ({
    default: module.OptimizedBarChart
  }))
);

export const LazyOptimizedPieChart = lazy(() => 
  import('@/components/analytics/OptimizedChartComponents').then(module => ({
    default: module.OptimizedPieChart
  }))
);

export const LazyOptimizedLineChart = lazy(() => 
  import('@/components/analytics/OptimizedChartComponents').then(module => ({
    default: module.OptimizedLineChart
  }))
);

export const LazyHeatMapWidget = lazy(() => 
  import('@/components/analytics/HeatMapWidget').then(module => ({
    default: module.default
  }))
);

// Backward compatibility exports for existing analytics page
export const RechartsBarChartLazy = LazyOptimizedBarChart;
export const RechartsPieChartLazy = LazyOptimizedPieChart;  
export const RechartsLineChartLazy = LazyOptimizedLineChart;
export const RechartsHeatMapLazy = LazyHeatMapWidget;

// Lazy load content components
export const LazyContentCalendar = lazy(() => 
  import('@/components/content/content-calendar').then(module => ({
    default: module.ContentCalendar
  }))
);

export const LazyRichTextEditor = lazy(() => 
  import('@/components/content/RichTextEditor').then(module => ({
    default: module.RichTextEditor
  }))
);

// Lazy load form components
export const LazyCreateCampaign = lazy(() => 
  import('@/components/Campaign/CreateCampaign').then(module => ({
    default: module.CreateCampaign
  }))
);

export const LazyEditCampaign = lazy(() => 
  import('@/components/Campaign/EditCampaign').then(module => ({
    default: module.EditCampaign
  }))
);

export const LazySegmentBuilder = lazy(() => 
  import('@/components/audiences/SegmentBuilder').then(module => ({
    default: module.SegmentBuilder
  }))
);

// Wrapped components with appropriate skeletons
export function ConversionFunnelLazy(props: any) {
  return (
    <LazyWrapper fallback={<AnalyticsSkeleton />}>
      <LazyConversionFunnel {...props} />
    </LazyWrapper>
  );
}

export function FunnelManagerLazy(props: any) {
  return (
    <LazyWrapper fallback={<FormSkeleton />}>
      <LazyFunnelManager {...props} />
    </LazyWrapper>
  );
}

export function RechartsBarChartLazy(props: any) {
  return (
    <LazyWrapper fallback={<ChartSkeleton />}>
      <LazyRechartsBarChart {...props} />
    </LazyWrapper>
  );
}

export function RechartsPieChartLazy(props: any) {
  return (
    <LazyWrapper fallback={<ChartSkeleton />}>
      <LazyRechartsPieChart {...props} />
    </LazyWrapper>
  );
}

export function RechartsLineChartLazy(props: any) {
  return (
    <LazyWrapper fallback={<ChartSkeleton />}>
      <LazyRechartsLineChart {...props} />
    </LazyWrapper>
  );
}

export function RechartsHeatMapLazy(props: any) {
  return (
    <LazyWrapper fallback={<ChartSkeleton />}>
      <LazyRechartsHeatMap {...props} />
    </LazyWrapper>
  );
}

export function ContentCalendarLazy(props: any) {
  return (
    <LazyWrapper fallback={<CalendarSkeleton />}>
      <LazyContentCalendar {...props} />
    </LazyWrapper>
  );
}

export function RichTextEditorLazy(props: any) {
  return (
    <LazyWrapper fallback={<FormSkeleton />}>
      <LazyRichTextEditor {...props} />
    </LazyWrapper>
  );
}

export function CreateCampaignLazy(props: any) {
  return (
    <LazyWrapper fallback={<FormSkeleton />}>
      <LazyCreateCampaign {...props} />
    </LazyWrapper>
  );
}

export function EditCampaignLazy(props: any) {
  return (
    <LazyWrapper fallback={<FormSkeleton />}>
      <LazyEditCampaign {...props} />
    </LazyWrapper>
  );
}

export function SegmentBuilderLazy(props: any) {
  return (
    <LazyWrapper fallback={<FormSkeleton />}>
      <LazySegmentBuilder {...props} />
    </LazyWrapper>
  );
}