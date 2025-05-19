"use client"

import React, { useState, useEffect } from 'react';
import { ProfileCard } from '@/components/user/profile-card';
import { useUser } from '@clerk/nextjs';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Activity, Briefcase, Globe, MapPin, Twitter, Linkedin, Github, Settings, Bell, Shield } from 'lucide-react';
import { ActivityFeed } from '@/components/activity/ActivityFeed';
import { profileFormSchema, type ProfileFormData } from '@/lib/validations/profile';
import { activityService } from '@/lib/services/activity';
import { Skeleton } from '@/components/ui/skeleton';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useBeforeUnload } from '@/hooks/use-before-unload';
import { useNavigationWarning } from '@/hooks/use-navigation-warning';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';

export default function ProfilePage() {
  const { user, isLoaded } = useUser();
  const [isUpdating, setIsUpdating] = useState(false);
  const [activities, setActivities] = useState<any[]>([]);
  const [isDirty, setIsDirty] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: user?.fullName || '',
      bio: '',
      role: '',
      company: '',
      location: '',
      website: '',
      socialLinks: {
        twitter: '',
        linkedin: '',
        github: '',
      },
    },
  });

  // Track form changes
  useEffect(() => {
    const subscription = form.watch(() => setIsDirty(true));
    return () => subscription.unsubscribe();
  }, [form]);

  // Warn before leaving with unsaved changes
  useBeforeUnload(isDirty);
  useNavigationWarning(isDirty);

  useEffect(() => {
    if (user?.id) {
      loadActivities();
      // Load user metadata
      const metadata = user.publicMetadata as ProfileFormData;
      form.reset({
        name: user.fullName || '',
        bio: metadata.bio || '',
        role: metadata.role || '',
        company: metadata.company || '',
        location: metadata.location || '',
        website: metadata.website || '',
        socialLinks: metadata.socialLinks || {
          twitter: '',
          linkedin: '',
          github: '',
        },
      });
    }
  }, [user?.id, form]);

  const loadActivities = async () => {
    try {
      const response = await fetch('/api/activity');
      if (!response.ok) {
        throw new Error('Failed to load activities');
      }
      const data = await response.json();
      setActivities(data);
    } catch (error) {
      console.error('Failed to load activities:', error);
      toast.error('Unable to load recent activities');
    }
  };

  if (!isLoaded) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-8 w-48 mb-6" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-[400px] lg:col-span-1" />
          <Skeleton className="h-[400px] lg:col-span-2" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-neutral-text mb-6">Profile</h1>
        <div className="max-w-2xl">
          <p>Please sign in to view your profile.</p>
        </div>
      </div>
    );
  }

  const handleProfileUpdate = async (data: ProfileFormData) => {
    setIsUpdating(true);
    try {
      // Validate the form data
      const validatedData = profileFormSchema.parse(data);

      const response = await fetch('/api/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(validatedData),
      });

      const responseData = await response.json();

      if (!response.ok) {
        // Handle validation errors
        if (response.status === 400) {
          const errorMessage = responseData.message || 'Please check your input and try again';
          throw new Error(errorMessage);
        }
        // Handle other errors
        throw new Error(responseData.message || 'Failed to update profile');
      }

      // Record the activity through the API
      const activityResponse = await fetch('/api/activity', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'PROFILE_UPDATE',
          description: 'Updated profile information',
          metadata: {
            updatedFields: Object.keys(validatedData),
          },
        }),
      });

      if (!activityResponse.ok) {
        console.error('Failed to record activity');
      }

      // Reload activities
      await loadActivities();

      setIsDirty(false);
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Profile update error:', error);
      if (error instanceof Error) {
        // Format the error message to be more user-friendly
        const errorMessage = error.message
          .replace(/^ZodError: /, '')
          .replace(/^Error: /, '')
          .replace(/^Failed to update profile: /, '')
          .replace(/^Validation error: /, '');
        
        toast.error(errorMessage || 'Please check your input and try again');
      } else {
        toast.error('Failed to update profile. Please try again.');
      }
      throw error; // Re-throw to let ProfileCard handle the error
    } finally {
      setIsUpdating(false);
    }
  };

  const metadata = user.publicMetadata as ProfileFormData;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-neutral-text mb-6">Profile</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Profile Card */}
        <div className="lg:col-span-1">
          <ProfileCard 
            name={user.fullName || user.username || 'User'}
            avatarUrl={user.imageUrl}
            bio={metadata.bio}
            role={metadata.role}
            company={metadata.company}
            location={metadata.location}
            website={metadata.website}
            socialLinks={metadata.socialLinks}
            onEdit={handleProfileUpdate}
            isUpdating={isUpdating}
          />
        </div>

        {/* Additional Profile Information */}
        <div className="lg:col-span-2">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Professional Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {metadata.company && (
                    <div className="flex items-center space-x-2">
                      <Briefcase className="h-4 w-4 text-neutral-text-light" />
                      <span>{metadata.company}</span>
                    </div>
                  )}
                  {metadata.location && (
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4 text-neutral-text-light" />
                      <span>{metadata.location}</span>
                    </div>
                  )}
                  {metadata.website && (
                    <div className="flex items-center space-x-2">
                      <Globe className="h-4 w-4 text-neutral-text-light" />
                      <a 
                        href={metadata.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary-500 hover:text-primary-600"
                      >
                        {metadata.website}
                      </a>
                    </div>
                  )}
                </CardContent>
              </Card>

              {metadata.socialLinks && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Social Links</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {metadata.socialLinks.twitter && (
                      <div className="flex items-center space-x-2">
                        <Twitter className="h-4 w-4 text-neutral-text-light" />
                        <a 
                          href={`https://twitter.com/${metadata.socialLinks.twitter}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary-500 hover:text-primary-600"
                        >
                          @{metadata.socialLinks.twitter}
                        </a>
                      </div>
                    )}
                    {metadata.socialLinks.linkedin && (
                      <div className="flex items-center space-x-2">
                        <Linkedin className="h-4 w-4 text-neutral-text-light" />
                        <a 
                          href={metadata.socialLinks.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary-500 hover:text-primary-600"
                        >
                          LinkedIn Profile
                        </a>
                      </div>
                    )}
                    {metadata.socialLinks.github && (
                      <div className="flex items-center space-x-2">
                        <Github className="h-4 w-4 text-neutral-text-light" />
                        <a 
                          href={`https://github.com/${metadata.socialLinks.github}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary-500 hover:text-primary-600"
                        >
                          @{metadata.socialLinks.github}
                        </a>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="activity">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Recent Activity</CardTitle>
                  <CardDescription>
                    Track your recent actions and updates
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ActivityFeed activities={activities} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="settings">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Account Settings</CardTitle>
                  <CardDescription>
                    Manage your account preferences and notifications
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Email Notifications</Label>
                        <p className="text-sm text-muted-foreground">
                          Receive email notifications about your account
                        </p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Activity Digest</Label>
                        <p className="text-sm text-muted-foreground">
                          Get a weekly summary of your activity
                        </p>
                      </div>
                      <Switch />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Marketing Emails</Label>
                        <p className="text-sm text-muted-foreground">
                          Receive updates about new features and promotions
                        </p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Privacy Settings</h3>
                    <div className="space-y-2">
                      <Label>Profile Visibility</Label>
                      <Select defaultValue="public">
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
                      <Select defaultValue="public">
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

                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Security</h3>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Two-Factor Authentication</Label>
                        <p className="text-sm text-muted-foreground">
                          Add an extra layer of security to your account
                        </p>
                      </div>
                      <Button variant="outline">Enable</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
} 