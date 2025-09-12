'use client';

import React from 'react';
import { Users, BarChart3, Target, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CrossClientAnalytics } from '@/components/analytics/CrossClientAnalytics';

/**
 * Cross-Client Analytics Page
 * 
 * Purpose: Enable service providers to compare performance across their entire client portfolio
 * and identify trends, opportunities, and issues.
 * 
 * TDD Requirement: Multi-client performance comparison with statistical analysis
 * Business Context: Service providers managing 10-500+ clients in B2B2G model
 * Performance: < 500ms load time for comparative analysis
 */
export default function CrossClientAnalyticsPage() {
  return (
    <div className="container mx-auto px-6 py-4">
      {/* Header */}
      <div className="mb-8">
        <Card className="card-enhanced border-l-2 border-primary/20 hover:shadow-professional transition-shadow duration-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-lg border border-primary/20">
                  <BarChart3 className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-foreground">Cross-Client Analytics</h1>
                  <p className="text-muted-foreground mt-1">
                    Compare audience performance and insights across all your clients
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge className="bg-success/10 text-success border border-success/20">
                  <Target className="h-3 w-3 mr-1" />
                  Multi-Client
                </Badge>
                <Badge className="bg-primary/10 text-primary border border-primary/20">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  Real-Time
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Key Features Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="card-enhanced border-l-2 border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded border border-primary/20">
                <BarChart3 className="h-4 w-4 text-primary" />
              </div>
              <div>
                <h3 className="font-medium text-sm">Performance Comparison</h3>
                <p className="text-xs text-muted-foreground">Statistical analysis</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="card-enhanced border-l-2 border-success/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-success/10 rounded border border-success/20">
                <Target className="h-4 w-4 text-success" />
              </div>
              <div>
                <h3 className="font-medium text-sm">Client Rankings</h3>
                <p className="text-xs text-muted-foreground">By engagement & growth</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="card-enhanced border-l-2 border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded border border-primary/20">
                <TrendingUp className="h-4 w-4 text-primary" />
              </div>
              <div>
                <h3 className="font-medium text-sm">Revenue Analytics</h3>
                <p className="text-xs text-muted-foreground">Portfolio-wide metrics</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="card-enhanced border-l-2 border-muted/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-muted/10 rounded border border-muted/20">
                <Users className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <h3 className="font-medium text-sm">Health Scoring</h3>
                <p className="text-xs text-muted-foreground">Client performance</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cross Client Analytics Component */}
      <CrossClientAnalytics />
    </div>
  );
}