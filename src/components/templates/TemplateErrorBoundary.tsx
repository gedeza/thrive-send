"use client";

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw, Plus } from 'lucide-react';
import Link from 'next/link';

interface TemplateErrorBoundaryProps {
  children: React.ReactNode;
  fallbackTitle?: string;
  fallbackDescription?: string;
  showCreateButton?: boolean;
  onRetry?: () => void;
}

interface TemplateErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class TemplateErrorBoundary extends React.Component<
  TemplateErrorBoundaryProps,
  TemplateErrorBoundaryState
> {
  constructor(props: TemplateErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): TemplateErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Template Error Boundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Card className="border-destructive/20 bg-destructive/5">
          <CardContent className="p-8 text-center">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-destructive/10 rounded-full">
                <AlertTriangle className="h-8 w-8 text-destructive" />
              </div>
            </div>
            <h3 className="text-lg font-semibold mb-2">
              {this.props.fallbackTitle || "Something went wrong with templates"}
            </h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              {this.props.fallbackDescription || 
               "We encountered an error while loading your templates. Don't worry - your data is safe."}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button 
                variant="outline" 
                onClick={() => {
                  this.setState({ hasError: false, error: undefined });
                  this.props.onRetry?.();
                }}
                className="flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Try Again
              </Button>
              {this.props.showCreateButton !== false && (
                <Button asChild>
                  <Link href="/templates/new">
                    <Plus className="h-4 w-4 mr-2" />
                    Create New Template
                  </Link>
                </Button>
              )}
            </div>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-4 text-left max-w-md mx-auto">
                <summary className="text-sm font-medium text-muted-foreground cursor-pointer">
                  Error Details (Development)
                </summary>
                <pre className="mt-2 text-xs bg-muted p-3 rounded overflow-auto max-h-32">
                  {this.state.error.stack}
                </pre>
              </details>
            )}
          </CardContent>
        </Card>
      );
    }

    return this.props.children;
  }
}

// Hook version for functional components
export function useTemplateErrorHandler() {
  const handleTemplateError = (error: Error, operation: string) => {
    console.error("", _error);
    
    // You could extend this to send to error reporting service
    // Example: Sentry, LogRocket, etc.
    
    return {
      title: "Template Operation Failed",
      description: `Failed to ${operation}. Please try again or contact support if the issue persists.`,
    };
  };

  return { handleTemplateError };
}