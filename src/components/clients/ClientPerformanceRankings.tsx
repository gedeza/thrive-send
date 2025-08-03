"use client"

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TrendingUp, TrendingDown, Minus, Trophy, Medal, Award, Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ClientPerformanceRankingsProps {
  clients: Array<{
    id: string;
    name: string;
    performanceScore: number;
    logoUrl?: string;
    type: string;
    status: string;
    monthlyBudget?: number;
    lastActivity: string;
  }>;
  onClientSelect?: (clientId: string) => void;
  isLoading?: boolean;
}

export function ClientPerformanceRankings({ 
  clients, 
  onClientSelect, 
  isLoading = false 
}: ClientPerformanceRankingsProps) {
  // Sort clients by performance score
  const rankedClients = [...clients]
    .filter(client => client.performanceScore !== undefined)
    .sort((a, b) => b.performanceScore - a.performanceScore)
    .slice(0, 10); // Top 10 performers

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-4 w-4 text-yellow-500" />;
      case 2:
        return <Medal className="h-4 w-4 text-gray-400" />;
      case 3:
        return <Award className="h-4 w-4 text-amber-600" />;
      default:
        return <Star className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getPerformanceColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getPerformanceBadgeColor = (score: number) => {
    if (score >= 90) return 'bg-green-100 text-green-800';
    if (score >= 70) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const getTrendIcon = (score: number) => {
    // Mock trend based on score (in real implementation, would compare with previous period)
    const trend = score >= 85 ? 'up' : score >= 70 ? 'neutral' : 'down';
    
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-3 w-3 text-green-600" />;
      case 'down':
        return <TrendingDown className="h-3 w-3 text-red-600" />;
      default:
        return <Minus className="h-3 w-3 text-muted-foreground" />;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Client Performance Rankings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-lg border animate-pulse">
                <div className="w-6 h-6 bg-muted rounded" />
                <div className="w-8 h-8 bg-muted rounded-full" />
                <div className="flex-1">
                  <div className="w-32 h-4 bg-muted rounded mb-1" />
                  <div className="w-24 h-3 bg-muted rounded" />
                </div>
                <div className="w-16 h-6 bg-muted rounded" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (rankedClients.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Client Performance Rankings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No performance data available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5" />
          Client Performance Rankings
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {rankedClients.map((client, index) => (
            <div
              key={client.id}
              className={cn(
                "flex items-center gap-3 p-3 rounded-lg border transition-all duration-200",
                "hover:shadow-md hover:bg-muted/50 cursor-pointer",
                index === 0 && "bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200",
                index === 1 && "bg-gradient-to-r from-gray-50 to-slate-50 border-gray-200",
                index === 2 && "bg-gradient-to-r from-amber-50 to-yellow-50 border-amber-200"
              )}
              onClick={() => onClientSelect?.(client.id)}
            >
              {/* Rank & Icon */}
              <div className="flex items-center gap-2 min-w-[2rem]">
                <span className={cn(
                  "text-sm font-bold",
                  index < 3 ? "text-primary" : "text-muted-foreground"
                )}>
                  #{index + 1}
                </span>
                {getRankIcon(index + 1)}
              </div>

              {/* Client Avatar */}
              <div className="flex-shrink-0">
                {client.logoUrl ? (
                  <img
                    src={client.logoUrl}
                    alt={`${client.name} logo`}
                    className="w-8 h-8 rounded-full object-cover border"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full flex items-center justify-center bg-primary/10 text-primary border font-semibold text-xs">
                    {client.name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2)}
                  </div>
                )}
              </div>

              {/* Client Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-medium truncate">{client.name}</h4>
                  {getTrendIcon(client.performanceScore)}
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{client.type}</span>
                  {client.monthlyBudget && (
                    <>
                      <span>•</span>
                      <span>${client.monthlyBudget.toLocaleString()}/mo</span>
                    </>
                  )}
                </div>
              </div>

              {/* Performance Score */}
              <div className="flex flex-col items-end gap-1">
                <Badge className={cn(
                  "text-xs px-2 py-1 font-semibold",
                  getPerformanceBadgeColor(client.performanceScore)
                )}>
                  {client.performanceScore}%
                </Badge>
                <span className={cn(
                  "text-xs font-medium",
                  getPerformanceColor(client.performanceScore)
                )}>
                  {client.performanceScore >= 90 ? 'Excellent' :
                   client.performanceScore >= 70 ? 'Good' : 'Needs Attention'}
                </span>
              </div>
            </div>
          ))}
        </div>

        {rankedClients.length >= 10 && (
          <div className="mt-4 text-center">
            <Button variant="outline" size="sm">
              View All Rankings
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}