import { useQuery } from '@tanstack/react-query';
import { queryConfig } from '@/lib/react-query-config';

interface DashboardData {
  analytics: any;
  campaigns: any[];
  content: any[];
}

// Custom hook to manage dashboard data with proper caching
export function useDashboardData(dateRange?: string, customRange?: { from: string; to: string } | null) {
  const queryKey = ['dashboard-data', dateRange, customRange];

  return useQuery({
    queryKey,
    queryFn: async (): Promise<DashboardData> => {
      // Use Promise.allSettled to handle API failures gracefully
      const [analyticsResult, campaignsResult, contentResult] = await Promise.allSettled([
        fetch('/api/analytics').then(res => res.ok ? res.json() : null).catch(() => null),
        fetch('/api/campaigns').then(res => res.ok ? res.json() : null).catch(() => null),
        fetch('/api/content?limit=5&status=PUBLISHED,APPROVED&sortBy=updatedAt&sortOrder=desc').then(res => res.ok ? res.json() : null).catch(() => null)
      ]);

      return {
        analytics: analyticsResult.status === 'fulfilled' ? analyticsResult.value : null,
        campaigns: campaignsResult.status === 'fulfilled' && Array.isArray(campaignsResult.value) 
          ? campaignsResult.value.slice(0, 3) : [],
        content: contentResult.status === 'fulfilled' && contentResult.value?.content 
          ? contentResult.value.content.slice(0, 3) : []
      };
    },
    ...queryConfig.dashboard, // Use centralized dashboard configuration
  });
}