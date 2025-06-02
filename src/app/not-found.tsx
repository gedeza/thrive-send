'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="flex items-center justify-center h-screen bg-background">
      <div className="text-center space-y-6 max-w-md mx-auto p-6">
        <h1 className="text-4xl font-bold">404</h1>
        <h2 className="text-2xl font-semibold">Page Not Found</h2>
        <p className="text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="flex justify-center gap-4 pt-4">
          <Button asChild>
            <Link href="/dashboard">Dashboard</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/content">Content Library</Link>
          </Button>
        </div>
      </div>
    </div>
  );
} 