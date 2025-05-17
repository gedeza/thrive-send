"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, useOrganization, useOrganizationList, useClerk } from '@clerk/nextjs';

export default function OrganizationPage() {
  const { isLoaded, userId } = useAuth();
  const { isLoaded: isOrgLoaded, organization } = useOrganization();
  const { isLoaded: isOrgListLoaded, userMemberships, setActive } = useOrganizationList();
  const { signOut } = useClerk();
  const router = useRouter();
  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null);
  const [isSelecting, setIsSelecting] = useState(false);

  // Debug logs
  useEffect(() => {
    console.log('Auth State:', { isLoaded, userId });
    console.log('Org List State:', { isOrgListLoaded, userMemberships });
  }, [isLoaded, userId, isOrgListLoaded, userMemberships]);

  useEffect(() => {
    if (isLoaded && !userId) {
      router.push('/sign-in');
    }
  }, [isLoaded, userId, router]);

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push('/sign-in');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (!isLoaded || !isOrgLoaded || !isOrgListLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Loading...</h1>
          <p className="text-muted-foreground">Please wait while we load your organizations.</p>
        </div>
      </div>
    );
  }

  const handleSelectOrganization = async (orgId: string) => {
    try {
      setIsSelecting(true);
      setSelectedOrgId(orgId);
      
      if (setActive) {
        await setActive({ organization: orgId });
        router.push('/(dashboard)');
      }
    } catch (error) {
      console.error('Failed to set active organization:', error);
      setIsSelecting(false);
      setSelectedOrgId(null);
    }
  };

  // Check if user has any organizations
  const hasOrganizations = userMemberships?.data && userMemberships.data.length > 0;

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center max-w-md mx-auto p-6">
        <div className="flex justify-end mb-4">
          <button
            onClick={handleSignOut}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Sign Out
          </button>
        </div>

        <h1 className="text-2xl font-bold mb-4">Select Organization</h1>
        <p className="text-muted-foreground mb-6">Choose an organization to continue</p>
        
        {hasOrganizations ? (
          <div className="space-y-4">
            {userMemberships.data.map((membership) => (
              <button
                key={membership.organization.id}
                onClick={() => handleSelectOrganization(membership.organization.id)}
                disabled={isSelecting}
                className={`w-full p-4 text-left border rounded-lg transition-all ${
                  selectedOrgId === membership.organization.id
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-accent hover:text-accent-foreground'
                } ${isSelecting ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <div className="flex items-center justify-between">
                  <h2 className="font-semibold">{membership.organization.name}</h2>
                  {selectedOrgId === membership.organization.id && isSelecting && (
                    <span className="text-sm">Selecting...</span>
                  )}
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="mb-6 p-4 bg-muted rounded-lg">
            <p className="text-muted-foreground">You don't have any organizations yet.</p>
            <p className="text-sm text-muted-foreground mt-2">
              Please create an organization to continue.
            </p>
          </div>
        )}

        <button
          onClick={() => router.push('/create-organization')}
          disabled={isSelecting}
          className={`mt-6 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 ${
            isSelecting ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          Create New Organization
        </button>

        {/* Debug Information */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-8 p-4 bg-gray-100 rounded-md text-xs">
            <h3 className="font-bold mb-2">Debug Information:</h3>
            <pre className="whitespace-pre-wrap">
              {JSON.stringify({
                isLoaded,
                userId,
                isOrgListLoaded,
                userMembershipsCount: userMemberships?.data?.length,
                userMemberships: userMemberships?.data
              }, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
} 