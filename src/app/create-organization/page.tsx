"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, useOrganizationList } from '@clerk/nextjs';

export default function CreateOrganizationPage() {
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const { isLoaded, userId } = useAuth();
  const { createOrganization, setActive, isLoaded: isOrgListLoaded } = useOrganizationList();
  const router = useRouter();

  useEffect(() => {
    // Debug information
    setDebugInfo({
      isLoaded,
      userId,
      isOrgListLoaded,
      hasCreateOrg: !!createOrganization,
      hasSetActive: !!setActive,
    });
  }, [isLoaded, userId, isOrgListLoaded, createOrganization, setActive]);

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Loading...</h1>
          <p className="text-muted-foreground">Please wait while we verify your authentication.</p>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      if (!createOrganization) {
        throw new Error('Organization creation is not available');
      }

      console.log('Attempting to create organization:', { name: name.trim() });
      const org = await createOrganization({ name: name.trim() });
      console.log('Organization created:', org);

      if (org && setActive) {
        console.log('Setting active organization:', org);
        await setActive({ organization: org });
        router.push('/(dashboard)');
      } else {
        throw new Error('Failed to set active organization');
      }
    } catch (error) {
      console.error('Failed to create organization:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to create organization';
      
      if (errorMessage.includes('not enabled')) {
        setError(
          'Organizations feature is not enabled. Please contact your administrator to enable organizations in the Clerk dashboard.'
        );
      } else {
        setError(errorMessage);
      }
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-full max-w-md p-6">
        <h1 className="text-2xl font-bold mb-4 text-center">Create Organization</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-2">
              Organization Name
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2 border rounded-md"
              placeholder="Enter organization name"
              required
            />
          </div>
          {error && (
            <div className="text-red-500 text-sm bg-red-50 p-4 rounded-md">
              {error}
              {error.includes('not enabled') && (
                <div className="mt-2">
                  <a 
                    href="https://dashboard.clerk.com" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    Go to Clerk Dashboard
                  </a>
                </div>
              )}
            </div>
          )}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => router.push('/organization')}
              className="flex-1 px-4 py-2 border rounded-md hover:bg-accent hover:text-accent-foreground"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !name.trim()}
              className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50"
            >
              {isLoading ? 'Creating...' : 'Create Organization'}
            </button>
          </div>
        </form>

        {/* Debug Information */}
        {process.env.NODE_ENV === 'development' && debugInfo && (
          <div className="mt-8 p-4 bg-gray-100 rounded-md text-xs">
            <h3 className="font-bold mb-2">Debug Information:</h3>
            <pre className="whitespace-pre-wrap">
              {JSON.stringify(debugInfo, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
} 