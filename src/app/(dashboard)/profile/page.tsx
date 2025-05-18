"use client"

import React, { useState, useEffect } from 'react';
import { ProfileCard } from '@/components/user/profile-card';
import { useUser } from '@clerk/nextjs';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Activity, Briefcase, Globe, MapPin, Twitter, Linkedin, Github } from 'lucide-react';
import { ActivityFeed } from '@/components/activity/ActivityFeed';
import { profileFormSchema, type ProfileFormData } from '@/lib/validations/profile';
import { activityService } from '@/lib/services/activity';

export default function ProfilePage() {
  const { user, isLoaded } = useUser();
  const [isUpdating, setIsUpdating] = useState(false);
  const [activities, setActivities] = useState<any[]>([]);

  useEffect(() => {
    if (user?.id) {
      loadActivities();
    }
  }, [user?.id]);

  const loadActivities = async () => {
    try {
      const userActivities = await activityService.getUserActivities(user!.id);
      setActivities(userActivities);
    } catch (error) {
      console.error('Failed to load activities:', error);
    }
  };

  if (!isLoaded) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 w-48 bg-neutral-200 rounded mb-6"></div>
          <div className="h-96 bg-neutral-200 rounded"></div>
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

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      // Record the activity
      await activityService.recordActivity(user.id, {
        type: 'PROFILE_UPDATE',
        description: 'Updated profile information',
        metadata: {
          updatedFields: Object.keys(validatedData),
        },
      });

      // Reload activities
      await loadActivities();

      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Profile update error:', error);
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('Failed to update profile');
      }
    } finally {
      setIsUpdating(false);
    }
  };

  const metadata = user.publicMetadata as {
    bio?: string;
    role?: string;
    company?: string;
    location?: string;
    website?: string;
    socialLinks?: {
      twitter?: string;
      linkedin?: string;
      github?: string;
    };
  };

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
            onEdit={handleProfileUpdate}
            isUpdating={isUpdating}
          />
        </div>

        {/* Additional Profile Information */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="overview" className="space-y-4">
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
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-center h-32 text-neutral-text-light">
                    <span>Account settings coming soon</span>
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