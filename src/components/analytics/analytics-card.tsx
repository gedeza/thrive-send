"use client";

import * as React from "react";
import { ArrowDown, ArrowUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { cn } from "@/lib/utils";

interface AnalyticsCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: React.ReactNode;
  trend?: number;
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
  const isTrendPositive = trend && trend > 0;
  const isTrendNegative = trend && trend < 0;
  const trendColor = isTrendPositive 
    ? "text-green-600" 
    : isTrendNegative 
      ? "text-red-600" 
      : "text-muted-foreground";

  return (
    <Card className={cn(className)}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon && <div className="h-5 w-5 text-muted-foreground">{icon}</div>}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {(trend || trendText) && (
          <p className="flex items-center mt-1 text-xs">
            {trend ? (
              <span className={cn("flex items-center gap-1", trendColor)}>
                {isTrendPositive ? <ArrowUp className="h-3 w-3" /> : null}
                {isTrendNegative ? <ArrowDown className="h-3 w-3" /> : null}
                {Math.abs(trend)}%
              </span>
            ) : null}
            {trendText && (
              <span className="text-muted-foreground ml-1">{trendText}</span>
            )}
          </p>
        )}
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
      </CardContent>
    </Card>
  );
}