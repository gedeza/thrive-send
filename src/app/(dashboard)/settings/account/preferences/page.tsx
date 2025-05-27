"use client"

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { useUser } from "@clerk/nextjs";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Loader2 } from "lucide-react";
import { TIMEZONES, DEFAULT_TIMEZONE } from "@/config/timezone";

interface UserMetadata {
  [key: string]: any;
  notifications?: {
    email?: boolean;
    marketing?: boolean;
    updates?: boolean;
    activity?: boolean;
  };
  privacy?: {
    profileVisibility?: "public" | "private" | "connections";
    activityVisibility?: "public" | "private" | "connections";
  };
  timezone?: string;
}

const preferencesSchema = z.object({
  notifications: z.object({
    email: z.boolean(),
    marketing: z.boolean(),
    updates: z.boolean(),
    activity: z.boolean(),
  }),
  privacy: z.object({
    profileVisibility: z.enum(["public", "private", "connections"]),
    activityVisibility: z.enum(["public", "private", "connections"]),
  }),
  timezone: z.string(),
});

type PreferencesFormData = z.infer<typeof preferencesSchema>;

const defaultPreferences: PreferencesFormData = {
  notifications: {
    email: true,
    marketing: false,
    updates: true,
    activity: true,
  },
  privacy: {
    profileVisibility: "public",
    activityVisibility: "public",
  },
  timezone: DEFAULT_TIMEZONE,
};

export default function PreferencesSettingsPage() {
  const { user, isLoaded } = useUser();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<PreferencesFormData>({
    resolver: zodResolver(preferencesSchema),
    defaultValues: defaultPreferences,
  });

  useEffect(() => {
    if (user) {
      const metadata = user.unsafeMetadata as UserMetadata;
      form.reset({
        notifications: {
          email: metadata.notifications?.email ?? defaultPreferences.notifications.email,
          marketing: metadata.notifications?.marketing ?? defaultPreferences.notifications.marketing,
          updates: metadata.notifications?.updates ?? defaultPreferences.notifications.updates,
          activity: metadata.notifications?.activity ?? defaultPreferences.notifications.activity,
        },
        privacy: {
          profileVisibility: metadata.privacy?.profileVisibility ?? defaultPreferences.privacy.profileVisibility,
          activityVisibility: metadata.privacy?.activityVisibility ?? defaultPreferences.privacy.activityVisibility,
        },
        timezone: metadata.timezone ?? defaultPreferences.timezone,
      });
    }
  }, [user, form]);

  const onSubmit = async (data: PreferencesFormData) => {
    if (!user) return;
    
    setIsSubmitting(true);
    try {
      await user.update({
        unsafeMetadata: {
          notifications: data.notifications,
          privacy: data.privacy,
          timezone: data.timezone,
        } as UserMetadata,
      });
      
      toast({
        title: "Success",
        description: "Preferences updated successfully",
      });
    } catch (error) {
      console.error("Error updating preferences:", error);
      toast({
        title: "Error",
        description: "Failed to update preferences",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Preferences</CardTitle>
        <CardDescription>
          Manage your notification and privacy settings
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Notifications</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive notifications via email
                  </p>
                </div>
                <Switch
                  checked={form.watch("notifications.email")}
                  onCheckedChange={(checked) => form.setValue("notifications.email", checked)}
                  disabled={isSubmitting}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Marketing Updates</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive marketing and promotional updates
                  </p>
                </div>
                <Switch
                  checked={form.watch("notifications.marketing")}
                  onCheckedChange={(checked) => form.setValue("notifications.marketing", checked)}
                  disabled={isSubmitting}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>System Updates</Label>
                  <p className="text-sm text-muted-foreground">
                    Get notified about system updates and maintenance
                  </p>
                </div>
                <Switch
                  checked={form.watch("notifications.updates")}
                  onCheckedChange={(checked) => form.setValue("notifications.updates", checked)}
                  disabled={isSubmitting}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Activity Digest</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive a weekly summary of your activity
                  </p>
                </div>
                <Switch
                  checked={form.watch("notifications.activity")}
                  onCheckedChange={(checked) => form.setValue("notifications.activity", checked)}
                  disabled={isSubmitting}
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium">Privacy</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Profile Visibility</Label>
                <Select
                  value={form.watch("privacy.profileVisibility")}
                  onValueChange={(value) => form.setValue("privacy.profileVisibility", value as "public" | "private" | "connections")}
                  disabled={isSubmitting}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select visibility" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">Public</SelectItem>
                    <SelectItem value="private">Private</SelectItem>
                    <SelectItem value="connections">Connections Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Activity Visibility</Label>
                <Select
                  value={form.watch("privacy.activityVisibility")}
                  onValueChange={(value) => form.setValue("privacy.activityVisibility", value as "public" | "private" | "connections")}
                  disabled={isSubmitting}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select visibility" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">Public</SelectItem>
                    <SelectItem value="private">Private</SelectItem>
                    <SelectItem value="connections">Connections Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium">Timezone</h3>
            <div className="space-y-2">
              <Label>Local Timezone</Label>
              <Select
                value={form.watch("timezone")}
                onValueChange={(value) => form.setValue("timezone", value)}
                disabled={isSubmitting}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select timezone" />
                </SelectTrigger>
                <SelectContent>
                  {TIMEZONES.map((tz) => (
                    <SelectItem key={tz.value} value={tz.value}>
                      {tz.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                Set your local timezone for accurate date and time display
              </p>
            </div>
          </div>

          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </form>
      </CardContent>
    </Card>
  );
} 