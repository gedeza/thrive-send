"use client"

import React from "react";
import { ServiceProviderDashboard } from '@/components/dashboard/ServiceProviderDashboard';
import { useServiceProvider } from '@/context/ServiceProviderContext';
import { DashboardOverview } from '@/components/dashboard/DashboardOverview';

// Main Dashboard Component - Routes to appropriate dashboard based on organization type

export default function DashboardHomePage() {
  // Check organization type for conditional dashboard rendering
  try {
    const { state } = useServiceProvider();
    
    // If this is a service provider organization, render ServiceProviderDashboard
    if (state.organizationType === 'service_provider' && !state.isLoading) {
      return <ServiceProviderDashboard />;
    }
    
    // If still loading, show loading state
    if (state.isLoading) {
      return (
        <div className="flex-1 space-y-8 p-8 pt-6 bg-neutral-background">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-24 bg-gray-200 rounded"></div>
              ))}
            </div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      );
    }
  } catch (error) {
    // ServiceProvider context not available, fall back to enterprise dashboard
    console.log('ServiceProvider context not available, using enterprise dashboard');
  }

  // Enterprise/Legacy Dashboard (simplified fallback)
  return (
    <div className="flex-1 space-y-8 p-8 pt-6 bg-neutral-background">
      <h1 className="text-2xl font-bold text-gray-900">Enterprise Dashboard</h1>
      <DashboardOverview dateRange="7d" />
    </div>
  );
}