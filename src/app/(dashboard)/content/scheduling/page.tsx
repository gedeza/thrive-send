'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ContentSchedulingPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the existing AdvancedContentScheduler
    router.replace('/content/create');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="text-center">
        <h2 className="text-lg font-semibold mb-2">Redirecting to Content Scheduling...</h2>
        <p className="text-muted-foreground">Taking you to our advanced scheduling tools.</p>
      </div>
    </div>
  );
}