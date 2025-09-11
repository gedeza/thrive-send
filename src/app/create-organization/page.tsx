"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, useOrganizationList } from '@clerk/nextjs';
import { toast } from 'sonner';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

const organizationSchema = z.object({
  name: z.string().min(2, "Organization name must be at least 2 characters"),
  slug: z.string().min(2, "Slug must be at least 2 characters")
    .regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers, and hyphens"),
  website: z.string().url().optional().or(z.literal("")),
});

type OrganizationFormData = z.infer<typeof organizationSchema>;

export default function CreateOrganizationPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isLoaded, userId } = useAuth();
  const { createOrganization, setActive, isLoaded: isOrgListLoaded } = useOrganizationList();
  const router = useRouter();

  const form = useForm<OrganizationFormData>({
    resolver: zodResolver(organizationSchema),
    defaultValues: {
      name: "",
      slug: "",
      website: "",
    },
  });

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

  const handleSubmit = async (data: OrganizationFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      if (!createOrganization) {
        throw new Error('Organization creation is not available');
      }

      // Create organization in Clerk
      const org = await createOrganization({ 
        name: data.name.trim(),
        slug: data.slug.trim(),
      });

      if (!org) {
        throw new Error('Failed to create organization in Clerk');
      }

      // Create organization in our database with Clerk's ID
      const response = await fetch('/api/organizations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: data.name.trim(),
          slug: data.slug.trim(),
          website: data.website ? data.website.trim() : "",
          clerkId: userId,
          clerkOrganizationId: org.id,
        }),
      });

      const responseData = await response.json();

      if (!response.ok) {
        console.error('API Error Response:', responseData);
        if (responseData.details) {
          // Format validation errors
          const errorMessages = responseData.details.map((err: any) => {
            const field = err.path.join('.');
            return `${field}: ${err.message}`;
          }).join('\n');
          throw new Error(errorMessages);
        }
        throw new Error(responseData.error || 'Failed to create organization in database');
      }

      // Set as active organization
      if (setActive) {
        await setActive({ organization: org });
        toast.success('Organization created successfully!', {
          description: 'Your organization has been created successfully. Redirecting to settings...',
          duration: 5000,
        });
        // Redirect to organization settings to complete setup
        router.push('/settings/organization');
      } else {
        throw new Error('Failed to set active organization');
      }
    } catch (_error) {
      console.error("", _error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to create organization';
      
      if (errorMessage.includes('not enabled')) {
        setError(
          'Organizations feature is not enabled. Please contact your administrator to enable organizations in the Clerk dashboard.'
        );
        toast.error('Organization creation failed', {
          description: 'Organizations feature is not enabled. Please contact your administrator.',
          duration: 5000,
        });
      } else if (errorMessage.includes('maximum number')) {
        setError(
          'You have reached the maximum number of organizations allowed. Please contact support if you need to create more organizations.'
        );
        toast.error('Organization limit reached', {
          description: 'You have reached the maximum number of organizations allowed.',
          duration: 5000,
        });
      } else {
        setError(errorMessage);
        toast.error('Organization creation failed', {
          description: errorMessage,
          duration: 5000,
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-full max-w-md p-6">
        <h1 className="text-2xl font-bold mb-4 text-center">Create Organization</h1>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Organization Name</Label>
            <Input
              id="name"
              {...form.register("name")}
              placeholder="Enter organization name"
              disabled={isLoading}
            />
            {form.formState.errors.name && (
              <p className="text-sm text-red-500">{form.formState.errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="slug">Organization Slug</Label>
            <Input
              id="slug"
              {...form.register("slug")}
              placeholder="your-organization"
              disabled={isLoading}
            />
            <p className="text-sm text-muted-foreground">
              This will be used in your organization's URL
            </p>
            {form.formState.errors.slug && (
              <p className="text-sm text-red-500">{form.formState.errors.slug.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="website">Website (Optional)</Label>
            <Input
              id="website"
              {...form.register("website")}
              placeholder="https://example.com"
              disabled={isLoading}
            />
            {form.formState.errors.website && (
              <p className="text-sm text-red-500">{form.formState.errors.website.message}</p>
            )}
          </div>

          {error && (
            <div className="text-red-500 text-sm bg-red-50 p-4 rounded-md whitespace-pre-line">
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
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/organization')}
              disabled={isLoading}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Organization'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
} 