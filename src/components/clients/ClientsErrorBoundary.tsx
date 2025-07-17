'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ClientsErrorBoundaryProps {
  children: React.ReactNode;
}

interface ClientsErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ClientsErrorBoundary extends React.Component<
  ClientsErrorBoundaryProps,
  ClientsErrorBoundaryState
> {
  constructor(props: ClientsErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ClientsErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Clients page error:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
    // Force a page reload to reset state
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="space-y-6 p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Clients</h1>
              <p className="text-muted-foreground">
                Manage your client relationships and track performance
              </p>
            </div>
          </div>

          <Card>
            <CardContent className="p-12 text-center">
              <div className="flex justify-center mb-4">
                <AlertTriangle className="h-12 w-12 text-destructive" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Something went wrong</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                We encountered an error while loading your clients. This might be a temporary issue.
              </p>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Error: {this.state.error?.message || 'Unknown error occurred'}
                </p>
                <Button onClick={this.handleRetry} className="flex items-center gap-2">
                  <RefreshCw className="h-4 w-4" />
                  Try Again
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}