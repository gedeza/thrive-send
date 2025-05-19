"use client"

import { useUser } from "@clerk/nextjs";
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MainLayout } from "@/components/layout/main-layout";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, RotateCcw } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { useBeforeUnload } from "@/hooks/use-before-unload";
import { useNavigationWarning } from "@/hooks/use-navigation-warning";

const profileSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
});

const emailSettingsSchema = z.object({
  marketingEmails: z.boolean(),
  socialNotifications: z.boolean(),
  updatesNotifications: z.boolean(),
});

const campaignDefaultsSchema = z.object({
  fromName: z.string().min(2, "From name must be at least 2 characters"),
  replyToEmail: z.string().email("Invalid email address"),
  sendTime: z.enum(["immediate", "scheduled", "best-time"]),
});

const contentLibrarySchema = z.object({
  autoTagging: z.boolean(),
  defaultVisibility: z.enum(["private", "public", "team"]),
  thumbnailSize: z.enum(["small", "medium", "large"]),
});

const defaultEmailSettings = {
  marketingEmails: true,
  socialNotifications: false,
  updatesNotifications: true
} as const;

const defaultCampaignDefaults = {
  fromName: "ThriveSend Marketing",
  replyToEmail: "marketing@example.com",
  sendTime: "immediate" as const
} as const;

const defaultContentLibrarySettings = {
  autoTagging: true,
  defaultVisibility: "private" as const,
  thumbnailSize: "medium" as const
} as const;

export default function SettingsPage() {
  const { user, isLoaded } = useUser();
  const { toast } = useToast();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("profile");
  const [isDirty, setIsDirty] = useState(false);

  // Profile form
  const profileForm = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
    },
  });

  // Email settings form
  const emailForm = useForm({
    resolver: zodResolver(emailSettingsSchema),
    defaultValues: defaultEmailSettings,
  });

  // Campaign defaults form
  const campaignForm = useForm({
    resolver: zodResolver(campaignDefaultsSchema),
    defaultValues: defaultCampaignDefaults,
  });

  // Content library form
  const contentForm = useForm({
    resolver: zodResolver(contentLibrarySchema),
    defaultValues: defaultContentLibrarySettings,
  });

  // Track form changes
  useEffect(() => {
    const subscription = profileForm.watch(() => setIsDirty(true));
    return () => subscription.unsubscribe();
  }, [profileForm]);

  useEffect(() => {
    const subscription = emailForm.watch(() => setIsDirty(true));
    return () => subscription.unsubscribe();
  }, [emailForm]);

  useEffect(() => {
    const subscription = campaignForm.watch(() => setIsDirty(true));
    return () => subscription.unsubscribe();
  }, [campaignForm]);

  useEffect(() => {
    const subscription = contentForm.watch(() => setIsDirty(true));
    return () => subscription.unsubscribe();
  }, [contentForm]);

  // Warn before leaving with unsaved changes
  useBeforeUnload(isDirty);
  useNavigationWarning(isDirty);

  const handleProfileSubmit = async (data: z.infer<typeof profileSchema>) => {
    if (!user) return;
    try {
      await user.update({ firstName: data.firstName, lastName: data.lastName });
      setIsDirty(false);
      toast({
        title: "Success",
        description: "Profile settings updated successfully",
      });
    } catch (error) {
      console.error("Error updating settings:", error);
      toast({
        title: "Error",
        description: "Failed to update profile settings",
        variant: "destructive",
      });
    }
  };

  const handleEmailSubmit = async (data: z.infer<typeof emailSettingsSchema>) => {
    try {
      // TODO: Add API call to save email settings
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulated API call
      setIsDirty(false);
      toast({
        title: "Success",
        description: "Email preferences updated successfully",
      });
    } catch (error) {
      console.error("Error updating email settings:", error);
      toast({
        title: "Error",
        description: "Failed to update email preferences",
        variant: "destructive",
      });
    }
  };

  const handleCampaignSubmit = async (data: z.infer<typeof campaignDefaultsSchema>) => {
    try {
      // TODO: Add API call to save campaign defaults
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulated API call
      setIsDirty(false);
      toast({
        title: "Success",
        description: "Campaign defaults updated successfully",
      });
    } catch (error) {
      console.error("Error updating campaign defaults:", error);
      toast({
        title: "Error",
        description: "Failed to update campaign defaults",
        variant: "destructive",
      });
    }
  };

  const handleContentSubmit = async (data: z.infer<typeof contentLibrarySchema>) => {
    try {
      // TODO: Add API call to save content library settings
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulated API call
      setIsDirty(false);
      toast({
        title: "Success",
        description: "Content library settings updated successfully",
      });
    } catch (error) {
      console.error("Error updating content library settings:", error);
      toast({
        title: "Error",
        description: "Failed to update content library settings",
        variant: "destructive",
      });
    }
  };

  const handleResetDefaults = (form: any, defaultValues: any) => {
    form.reset(defaultValues);
    setIsDirty(false);
    toast({
      title: "Settings Reset",
      description: "Settings have been reset to default values",
    });
  };

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="email">Email Preferences</TabsTrigger>
          <TabsTrigger value="campaign">Campaign Defaults</TabsTrigger>
          <TabsTrigger value="content">Content Library</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Profile Settings</CardTitle>
              <CardDescription>
                Update your personal information and account settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={profileForm.handleSubmit(handleProfileSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    {...profileForm.register("firstName")}
                  />
                  {profileForm.formState.errors.firstName && (
                    <p className="text-sm text-destructive">
                      {profileForm.formState.errors.firstName.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    {...profileForm.register("lastName")}
                  />
                  {profileForm.formState.errors.lastName && (
                    <p className="text-sm text-destructive">
                      {profileForm.formState.errors.lastName.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    value={user?.primaryEmailAddress?.emailAddress || ""}
                    disabled
                  />
                </div>
                <div className="flex justify-between">
                  <Button type="submit" disabled={profileForm.formState.isSubmitting}>
                    {profileForm.formState.isSubmitting && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Save Changes
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleResetDefaults(profileForm, {
                      firstName: user?.firstName || "",
                      lastName: user?.lastName || "",
                    })}
                  >
                    <RotateCcw className="mr-2 h-4 w-4" />
                    Reset to Default
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="email">
          <Card>
            <CardHeader>
              <CardTitle>Email Preferences</CardTitle>
              <CardDescription>
                Manage your email notification preferences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={emailForm.handleSubmit(handleEmailSubmit)} className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Marketing Emails</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive updates about new features and promotions
                    </p>
                  </div>
                  <Switch
                    checked={emailForm.watch("marketingEmails")}
                    onCheckedChange={(checked) => emailForm.setValue("marketingEmails", checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Social Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Get notified about social media interactions
                    </p>
                  </div>
                  <Switch
                    checked={emailForm.watch("socialNotifications")}
                    onCheckedChange={(checked) => emailForm.setValue("socialNotifications", checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Updates Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive notifications about system updates
                    </p>
                  </div>
                  <Switch
                    checked={emailForm.watch("updatesNotifications")}
                    onCheckedChange={(checked) => emailForm.setValue("updatesNotifications", checked)}
                  />
                </div>
                <div className="flex justify-between">
                  <Button type="submit" disabled={emailForm.formState.isSubmitting}>
                    {emailForm.formState.isSubmitting && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Save Changes
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleResetDefaults(emailForm, defaultEmailSettings)}
                  >
                    <RotateCcw className="mr-2 h-4 w-4" />
                    Reset to Default
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="campaign">
          <Card>
            <CardHeader>
              <CardTitle>Campaign Defaults</CardTitle>
              <CardDescription>
                Set default values for new campaigns
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={campaignForm.handleSubmit(handleCampaignSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fromName">Default From Name</Label>
                  <Input
                    id="fromName"
                    {...campaignForm.register("fromName")}
                  />
                  {campaignForm.formState.errors.fromName && (
                    <p className="text-sm text-destructive">
                      {campaignForm.formState.errors.fromName.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="replyToEmail">Default Reply-To Email</Label>
                  <Input
                    id="replyToEmail"
                    type="email"
                    {...campaignForm.register("replyToEmail")}
                  />
                  {campaignForm.formState.errors.replyToEmail && (
                    <p className="text-sm text-destructive">
                      {campaignForm.formState.errors.replyToEmail.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sendTime">Default Send Time</Label>
                  <Select
                    value={campaignForm.watch("sendTime")}
                    onValueChange={(value: "immediate" | "scheduled" | "best-time") => 
                      campaignForm.setValue("sendTime", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select send time" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="immediate">Send Immediately</SelectItem>
                      <SelectItem value="scheduled">Schedule for Later</SelectItem>
                      <SelectItem value="best-time">Best Time to Send</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-between">
                  <Button type="submit" disabled={campaignForm.formState.isSubmitting}>
                    {campaignForm.formState.isSubmitting && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Save Changes
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleResetDefaults(campaignForm, defaultCampaignDefaults)}
                  >
                    <RotateCcw className="mr-2 h-4 w-4" />
                    Reset to Default
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="content">
          <Card>
            <CardHeader>
              <CardTitle>Content Library Settings</CardTitle>
              <CardDescription>
                Configure your content library preferences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={contentForm.handleSubmit(handleContentSubmit)} className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Auto Tagging</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically tag content based on AI analysis
                    </p>
                  </div>
                  <Switch
                    checked={contentForm.watch("autoTagging")}
                    onCheckedChange={(checked) => contentForm.setValue("autoTagging", checked)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="defaultVisibility">Default Visibility</Label>
                  <Select
                    value={contentForm.watch("defaultVisibility")}
                    onValueChange={(value: "private" | "public" | "team") => 
                      contentForm.setValue("defaultVisibility", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select default visibility" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="private">Private</SelectItem>
                      <SelectItem value="public">Public</SelectItem>
                      <SelectItem value="team">Team Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="thumbnailSize">Thumbnail Size</Label>
                  <Select
                    value={contentForm.watch("thumbnailSize")}
                    onValueChange={(value: "small" | "medium" | "large") => 
                      contentForm.setValue("thumbnailSize", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select thumbnail size" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="small">Small</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="large">Large</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-between">
                  <Button type="submit" disabled={contentForm.formState.isSubmitting}>
                    {contentForm.formState.isSubmitting && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Save Changes
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleResetDefaults(contentForm, defaultContentLibrarySettings)}
                  >
                    <RotateCcw className="mr-2 h-4 w-4" />
                    Reset to Default
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
