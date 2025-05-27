"use client"

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { OrganizationMembers } from "@/components/organization/organization-members";
import { OrganizationBilling } from "@/components/organization/organization-billing";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useOrganization } from "@clerk/nextjs";

const organizationSchema = z.object({
  name: z.string().min(2, "Organization name must be at least 2 characters"),
  website: z.string().optional(),
  logoUrl: z.string().url().optional(),
});

const defaultOrganizationSettings = {
  name: "",
  website: "",
  logoUrl: "",
} as const;

const tabs = [
  { id: 'general', label: 'General' },
  { id: 'members', label: 'Members & Roles' },
  { id: 'billing', label: 'Billing & Subscription' },
];

export default function OrganizationSettingsPage() {
  const { toast } = useToast();
  const router = useRouter();
  const { organization, isLoaded } = useOrganization();
  const [activeTab, setActiveTab] = useState("general");
  const [isDirty, setIsDirty] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [organizationId, setOrganizationId] = useState<string | null>(null);

  // Organization settings form
  const organizationForm = useForm({
    resolver: zodResolver(organizationSchema),
    defaultValues: defaultOrganizationSettings,
  });

  // Track form changes
  const subscription = organizationForm.watch(() => setIsDirty(true));

  // Check if user has an organization and redirect if not
  useEffect(() => {
    if (isLoaded && !organization) {
      router.push('/create-organization');
    }
  }, [isLoaded, organization, router]);

  // Fetch organization data on mount
  useEffect(() => {
    const fetchOrganizationData = async () => {
      try {
        const response = await fetch('/api/organizations/current');
        if (!response.ok) {
          throw new Error('Failed to fetch organization data');
        }
        const data = await response.json();
        setOrganizationId(data.id);
        organizationForm.reset({
          name: data.name || '',
          website: data.website || '',
          logoUrl: data.logoUrl || '',
        });
      } catch (error) {
        console.error('Error fetching organization data:', error);
        toast({
          title: "Error",
          description: "Failed to load organization settings",
          variant: "destructive",
        });
      }
    };

    if (organization) {
      fetchOrganizationData();
    }
  }, [organization, organizationForm, toast]);

  const handleOrganizationSubmit = async (data: z.infer<typeof organizationSchema>) => {
    if (!organizationId) {
      toast({
        title: "Error",
        description: "Organization ID not found",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/organizations/${organizationId}/settings`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update organization settings");
      }

      const result = await response.json();
      setIsDirty(false);
      toast({
        title: "Success",
        description: "Organization settings updated successfully",
      });
      console.log("Organization updated:", result);
    } catch (error) {
      console.error("Error updating organization settings:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update organization settings",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!organization) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Organization Settings</h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Manage your organization's settings, members, and billing.
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          {tabs.map((tab) => (
            <TabsTrigger key={tab.id} value={tab.id}>
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>
                Update your organization's basic information and preferences.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={organizationForm.handleSubmit(handleOrganizationSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Organization Name</Label>
                  <Input
                    id="name"
                    {...organizationForm.register("name")}
                    placeholder="Enter organization name"
                    disabled={isSubmitting}
                  />
                  {organizationForm.formState.errors.name && (
                    <p className="text-sm text-red-500">
                      {organizationForm.formState.errors.name.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website">Organization Website</Label>
                  <Input
                    id="website"
                    {...organizationForm.register("website")}
                    placeholder="example.com"
                    disabled={isSubmitting}
                  />
                  {organizationForm.formState.errors.website && (
                    <p className="text-sm text-red-500">
                      {organizationForm.formState.errors.website.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="logoUrl">Logo URL</Label>
                  <Input
                    id="logoUrl"
                    {...organizationForm.register("logoUrl")}
                    placeholder="https://example.com/logo.png"
                    disabled={isSubmitting}
                  />
                  {organizationForm.formState.errors.logoUrl && (
                    <p className="text-sm text-red-500">
                      {organizationForm.formState.errors.logoUrl.message}
                    </p>
                  )}
                </div>
                <Button 
                  type="submit" 
                  disabled={!isDirty || isSubmitting}
                  className="w-full"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="members">
          <OrganizationMembers />
        </TabsContent>

        <TabsContent value="billing">
          <OrganizationBilling />
        </TabsContent>
      </Tabs>
    </div>
  );
} 