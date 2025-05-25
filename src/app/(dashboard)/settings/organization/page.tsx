"use client"

import { useState } from "react";
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

const organizationSchema = z.object({
  name: z.string().min(2, "Organization name must be at least 2 characters"),
  domain: z.string().optional(),
  timezone: z.string(),
  logo: z.string().optional(),
});

const defaultOrganizationSettings = {
  name: "",
  domain: "",
  timezone: "UTC",
  logo: "",
} as const;

const tabs = [
  { id: 'general', label: 'General' },
  { id: 'members', label: 'Members & Roles' },
  { id: 'billing', label: 'Billing & Subscription' },
];

export default function OrganizationSettingsPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("general");
  const [isDirty, setIsDirty] = useState(false);

  // Organization settings form
  const organizationForm = useForm({
    resolver: zodResolver(organizationSchema),
    defaultValues: defaultOrganizationSettings,
  });

  // Track form changes
  const subscription = organizationForm.watch(() => setIsDirty(true));

  const handleOrganizationSubmit = async (data: z.infer<typeof organizationSchema>) => {
    try {
      // TODO: Add API call to save organization settings
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulated API call
      setIsDirty(false);
      toast({
        title: "Success",
        description: "Organization settings updated successfully",
      });
    } catch (error) {
      console.error("Error updating organization settings:", error);
      toast({
        title: "Error",
        description: "Failed to update organization settings",
        variant: "destructive",
      });
    }
  };

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
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="domain">Organization Domain</Label>
                  <Input
                    id="domain"
                    {...organizationForm.register("domain")}
                    placeholder="example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timezone">Default Timezone</Label>
                  <Input
                    id="timezone"
                    {...organizationForm.register("timezone")}
                    placeholder="UTC"
                  />
                </div>
                <Button type="submit" disabled={!isDirty}>
                  Save Changes
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