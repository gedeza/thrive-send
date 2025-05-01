"use client";

import * as React from "react";
import { ArrowDown, ArrowUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { cn } from "@/lib/utils";

export interface AnalyticsCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  trendText?: string;
  className?: string;
}

export function AnalyticsCard({
  title,
  value,
  description,
  icon,
  trend,
  trendText,
  className,
}: AnalyticsCardProps) {
  return (
    <Card className={cn("overflow-hidden", className)} data-testid="analytics-card">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon && <div className="h-5 w-5 text-muted-foreground">{icon}</div>}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold" data-testid="analytics-card-value">{value}</div>
        <p className="text-xs text-muted-foreground mt-1">
          {description}
          {trend && (
            <span 
              className={cn(
                "ml-2 flex items-center gap-1", 
                trend.isPositive ? "text-green-600" : "text-red-600"
              )}
              data-testid="analytics-card-trend"
            >
              {trend.isPositive ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
              {Math.abs(trend.value)}%
            </span>
          )}
          {trendText && (
            <span className="text-muted-foreground ml-1">{trendText}</span>
          )}
        </p>
      </CardContent>
    </Card>
  );
}

export default AnalyticsCard;
