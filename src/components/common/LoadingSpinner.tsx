"use client";

import React from "react";
import { Loader2, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg" | "xl";
  variant?: "spinner" | "dots" | "pulse" | "refresh";
  className?: string;
  text?: string;
}

export function LoadingSpinner({
  size = "md",
  variant = "spinner",
  className,
  text,
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6", 
    lg: "h-8 w-8",
    xl: "h-12 w-12",
  };

  const textSizeClasses = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
    xl: "text-lg",
  };

  if (variant === "dots") {
    return (
      <div className={cn("flex items-center justify-center", className)}>
        <div className="flex space-x-1">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className={cn(
                "bg-primary rounded-full animate-pulse",
                size === "sm" ? "h-1 w-1" : "h-2 w-2"
              )}
              style={{
                animationDelay: `${i * 0.2}s`,
                animationDuration: "1s",
              }}
            />
          ))}
        </div>
        {text && (
          <span className={cn("ml-2 text-muted-foreground", textSizeClasses[size])}>
            {text}
          </span>
        )}
      </div>
    );
  }

  if (variant === "pulse") {
    return (
      <div className={cn("flex items-center justify-center", className)}>
        <div
          className={cn(
            "bg-primary rounded-full animate-pulse",
            sizeClasses[size]
          )}
        />
        {text && (
          <span className={cn("ml-2 text-muted-foreground", textSizeClasses[size])}>
            {text}
          </span>
        )}
      </div>
    );
  }

  if (variant === "refresh") {
    return (
      <div className={cn("flex items-center justify-center", className)}>
        <RefreshCw className={cn("animate-spin text-primary", sizeClasses[size])} />
        {text && (
          <span className={cn("ml-2 text-muted-foreground", textSizeClasses[size])}>
            {text}
          </span>
        )}
      </div>
    );
  }

  // Default spinner variant
  return (
    <div className={cn("flex items-center justify-center", className)}>
      <Loader2 className={cn("animate-spin text-primary", sizeClasses[size])} />
      {text && (
        <span className={cn("ml-2 text-muted-foreground", textSizeClasses[size])}>
          {text}
        </span>
      )}
    </div>
  );
}

// Full page loading component
interface LoadingPageProps {
  title?: string;
  description?: string;
  size?: "sm" | "md" | "lg" | "xl";
}

export function LoadingPage({ 
  title = "Loading...", 
  description,
  size = "lg" 
}: LoadingPageProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
      <LoadingSpinner size={size} />
      <div className="text-center space-y-2">
        <h3 className="text-lg font-semibold">{title}</h3>
        {description && (
          <p className="text-sm text-muted-foreground max-w-md">
            {description}
          </p>
        )}
      </div>
    </div>
  );
}

// Card loading skeleton
interface LoadingSkeletonProps {
  rows?: number;
  className?: string;
  showAvatar?: boolean;
}

export function LoadingSkeleton({ 
  rows = 3, 
  className,
  showAvatar = false 
}: LoadingSkeletonProps) {
  return (
    <div className={cn("space-y-3", className)}>
      {showAvatar && (
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 bg-gray-200 rounded-full animate-pulse" />
          <div className="space-y-2 flex-1">
            <div className="h-4 bg-gray-200 rounded animate-pulse w-1/4" />
            <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2" />
          </div>
        </div>
      )}
      
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="space-y-2">
          <div className="h-4 bg-gray-200 rounded animate-pulse" />
          <div className="h-4 bg-gray-200 rounded animate-pulse w-5/6" />
          {i === 0 && <div className="h-4 bg-gray-200 rounded animate-pulse w-4/6" />}
        </div>
      ))}
    </div>
  );
}

// Table loading skeleton
interface LoadingTableProps {
  columns?: number;
  rows?: number;
  className?: string;
}

export function LoadingTable({ 
  columns = 4, 
  rows = 5, 
  className 
}: LoadingTableProps) {
  return (
    <div className={cn("space-y-3", className)}>
      {/* Header */}
      <div className="flex space-x-4">
        {Array.from({ length: columns }).map((_, i) => (
          <div
            key={i}
            className="h-4 bg-gray-200 rounded animate-pulse flex-1"
          />
        ))}
      </div>
      
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex space-x-4">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <div
              key={colIndex}
              className="h-4 bg-gray-200 rounded animate-pulse flex-1"
              style={{
                width: colIndex === 0 ? "20%" : colIndex === 1 ? "30%" : "25%",
              }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}