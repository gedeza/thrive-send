"use client";

import { useEffect, useState, useMemo } from 'react';
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
  const [dbOrganizations, setDbOrganizations] = useState<any[]>([]);
  const [isLoadingDb, setIsLoadingDb] = useState(true);

  // Fetch organizations from database
  useEffect(() => {
    const fetchDbOrganizations = async () => {
      if (!userId) return;
      
      try {
        const response = await fetch('/api/organizations');
        if (response.ok) {
          const data = await response.json();
          setDbOrganizations(data);
        }
      } catch (error) {
        console.error('Error fetching organizations:', error);
      } finally {
        setIsLoadingDb(false);
      }
    };

    if (isLoaded && userId) {
      fetchDbOrganizations();
    }
  }, [isLoaded, userId]);

  // Get unique organizations, preferring database entries
  const uniqueOrganizations = useMemo(() => {
    if (!isLoaded || !isOrgListLoaded || isLoadingDb) {
      return [];
    }

    // Create a map to store unique organizations by name
    const orgMap = new Map();
    
    // First add database organizations
    dbOrganizations.forEach(org => {
      // Use the organization name as the key to prevent duplicates
      if (!orgMap.has(org.name)) {
        orgMap.set(org.name, {
          id: org.id,
          name: org.name,
          clerkId: org.clerkOrganizationId || org.id, // Fallback to org.id if no clerkId
          source: 'db'
        });
      }
    });

    // Then add Clerk organizations that don't exist in database
    userMemberships?.data?.forEach(membership => {
      if (!orgMap.has(membership.organization.name)) {
        orgMap.set(membership.organization.name, {
          id: membership.organization.id,
          name: membership.organization.name,
          clerkId: membership.organization.id,
          source: 'clerk'
        });
      }
    });

    return Array.from(orgMap.values());
  }, [isLoaded, isOrgListLoaded, isLoadingDb, dbOrganizations, userMemberships?.data]);

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

  const handleSelectOrganization = async (orgId: string) => {
    try {
      setIsSelecting(true);
      setSelectedOrgId(orgId);
      
      if (setActive) {
        await setActive({ organization: orgId });
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('Failed to set active organization:', error);
      setIsSelecting(false);
      setSelectedOrgId(null);
    }
  };

  // Check if we're still loading any data
  const isLoading = !isLoaded || !isOrgLoaded || !isOrgListLoaded || isLoadingDb;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Loading...</h1>
          <p className="text-muted-foreground">Please wait while we load your organizations.</p>
        </div>
      </div>
    );
  }

  // Only check for organizations after all data is loaded
  const hasOrganizations = uniqueOrganizations.length > 0;

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
            {uniqueOrganizations.map((org) => (
              <button
                key={org.id}
                onClick={() => handleSelectOrganization(org.clerkId)}
                disabled={isSelecting}
                className={`w-full p-4 text-left border rounded-lg transition-all ${
                  selectedOrgId === org.clerkId
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-accent hover:text-accent-foreground'
                } ${isSelecting ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <div className="flex items-center justify-between">
                  <h2 className="font-semibold">{org.name}</h2>
                  {selectedOrgId === org.clerkId && isSelecting && (
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
      </div>
    </div>
  );
} 