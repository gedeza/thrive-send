"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, FileText, ArrowRight } from 'lucide-react';
import { TemplateErrorBoundary } from '@/components/templates/TemplateErrorBoundary';

function TemplateRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to Service Provider Templates (the functional version)
    router.replace('/service-provider/templates');
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
      <Card className="w-full max-w-md">
        <CardContent className="flex flex-col items-center justify-center p-8 text-center">
          <div className="p-4 bg-primary/10 rounded-full mb-4">
            <FileText className="h-8 w-8 text-primary" />
          </div>
          
          <h2 className="text-xl font-semibold mb-2">Templates</h2>
          <p className="text-muted-foreground text-sm mb-4">
            Redirecting you to the Template Library...
          </p>
          
          <div className="flex items-center space-x-2 text-primary">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm">Loading templates</span>
            <ArrowRight className="h-4 w-4" />
          </div>
        </CardContent>
      </Card>
      
      <div className="text-xs text-muted-foreground">
        If you are not redirected automatically, <a href="/service-provider/templates" className="text-primary hover:underline">click here</a>.
      </div>
    </div>
  );
}

// Main component with error boundary
export default function TemplatesPage() {
  return (
    <TemplateErrorBoundary 
      fallbackTitle="Templates Redirect Error"
      fallbackDescription="Unable to redirect to the Template Library. Please try navigating manually."
      onRetry={() => window.location.reload()}
    >
      <TemplateRedirectPage />
    </TemplateErrorBoundary>
  );
}
