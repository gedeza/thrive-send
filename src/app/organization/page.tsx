"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, useOrganization, useOrganizationList } from '@clerk/nextjs';

export default function OrganizationPage() {
  const { isLoaded, userId } = useAuth();
  const { isLoaded: isOrgLoaded, organization } = useOrganization();
  const { isLoaded: isOrgListLoaded, userMemberships, setActive } = useOrganizationList();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && !userId) {
      router.push('/sign-in');
    }
  }, [isLoaded, userId, router]);

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
      if (setActive) {
        await setActive({ organization: orgId });
        router.push('/(dashboard)');
      }
    } catch (error) {
      console.error('Failed to set active organization:', error);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center max-w-md mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4">Select Organization</h1>
        <p className="text-muted-foreground mb-6">Choose an organization to continue</p>
        
        <div className="space-y-4">
          {userMemberships?.data?.map((membership) => (
            <button
              key={membership.organization.id}
              onClick={() => handleSelectOrganization(membership.organization.id)}
              className="w-full p-4 text-left border rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              <h2 className="font-semibold">{membership.organization.name}</h2>
              <p className="text-sm text-muted-foreground">{membership.organization.id}</p>
            </button>
          ))}
        </div>

        <button
          onClick={() => router.push('/create-organization')}
          className="mt-6 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
        >
          Create New Organization
        </button>
      </div>
    </div>
  );
} 