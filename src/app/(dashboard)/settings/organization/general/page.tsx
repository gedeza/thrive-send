"use client"

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { useOrganization } from "@clerk/nextjs";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Loader2 } from "lucide-react";

const organizationSchema = z.object({
  name: z.string().min(2, "Organization name must be at least 2 characters"),
  slug: z.string().min(2, "Slug must be at least 2 characters").regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers, and hyphens"),
  website: z.string().url().optional().or(z.literal("")),
  logoUrl: z.string().url().optional().or(z.literal("")),
});

export default function GeneralOrganizationSettingsPage() {
  const { organization, isLoaded } = useOrganization();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof organizationSchema>>({
    resolver: zodResolver(organizationSchema),
    defaultValues: {
      name: "",
      slug: "",
      website: "",
      logoUrl: "",
    },
  });

  useEffect(() => {
    if (organization) {
      form.reset({
        name: organization.name || "",
        slug: organization.slug || "",
        website: organization.publicMetadata.website as string || "",
        logoUrl: organization.publicMetadata.logoUrl as string || "",
      });
    }
  }, [organization, form]);

  const onSubmit = async (data: z.infer<typeof organizationSchema>) => {
    if (!organization) return;

    setIsSubmitting(true);
    try {
      // Update organization name and slug
      await organization.update({
        name: data.name,
        slug: data.slug,
      });

      // Update public metadata
      await organization.update({
        publicMetadata: {
          ...organization.publicMetadata,
          website: data.website,
          logoUrl: data.logoUrl,
        },
      });

      toast({
        title: "Success",
        description: "Organization settings updated successfully",
      });
    } catch (_error) {
      console.error("", _error);
      toast({
        title: "Error",
        description: "Failed to update organization settings",
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>General Settings</CardTitle>
        <CardDescription>
          Manage your organization's basic information
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Organization Name</Label>
            <Input
              id="name"
              {...form.register("name")}
              placeholder="Your organization name"
              disabled={isSubmitting}
            />
            {form.formState.errors.name && (
              <p className="text-sm text-destructive">
                {form.formState.errors.name.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="slug">Organization Slug</Label>
            <Input
              id="slug"
              {...form.register("slug")}
              placeholder="your-organization"
              disabled={isSubmitting}
            />
            <p className="text-sm text-muted-foreground">
              This will be used in your organization's URL
            </p>
            {form.formState.errors.slug && (
              <p className="text-sm text-destructive">
                {form.formState.errors.slug.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="website">Website</Label>
            <Input
              id="website"
              {...form.register("website")}
              placeholder="https://example.com"
              disabled={isSubmitting}
            />
            {form.formState.errors.website && (
              <p className="text-sm text-destructive">
                {form.formState.errors.website.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="logoUrl">Logo URL</Label>
            <Input
              id="logoUrl"
              {...form.register("logoUrl")}
              placeholder="https://example.com/logo.png"
              disabled={isSubmitting}
            />
            {form.formState.errors.logoUrl && (
              <p className="text-sm text-destructive">
                {form.formState.errors.logoUrl.message}
              </p>
            )}
          </div>

          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
} 