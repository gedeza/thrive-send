"use client"

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { MainLayout } from "@/components/layout/main-layout";

export default function SettingsPage() {
  const [user, setUser] = useState({
    name: "John Doe",
    email: "john.doe@example.com"
  });
  
  const [emailSettings, setEmailSettings] = useState({
    marketingEmails: true,
    socialNotifications: false,
    updatesNotifications: true
  });

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle profile update logic
    console.log("Profile updated:", user);
  };

  const handleEmailSettingsChange = (setting: keyof typeof emailSettings) => {
    setEmailSettings({
      ...emailSettings,
      [setting]: !emailSettings[setting]
    });
  };

  return (
    <MainLayout
      headerProps={{
        user: { name: user.name },
        onSearch: (query) => console.log("Search:", query)
      }}
    >
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">
            Manage your account settings and preferences.
          </p>
        </div>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="email">Email</TabsTrigger>
            <TabsTrigger value="appearance">Appearance</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
          </TabsList>
          
          <TabsContent value="profile">
            <Card>
              <form onSubmit={handleProfileSubmit}>
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription>
                    Update your account information and profile details.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input 
                      id="name" 
                      value={user.name}
                      onChange={(e) => setUser({...user, name: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      value={user.email}
                      onChange={(e) => setUser({...user, email: e.target.value})}
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit">Save Changes</Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>
          
          <TabsContent value="email">
            <Card>
              <CardHeader>
                <CardTitle>Email Notifications</CardTitle>
                <CardDescription>
                  Configure what emails you receive from us.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="marketing-emails">Marketing Emails</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive emails about new features and offerings.
                    </p>
                  </div>
                  <Switch 
                    id="marketing-emails" 
                    checked={emailSettings.marketingEmails}
                    onCheckedChange={() => handleEmailSettingsChange('marketingEmails')}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="social-emails">Social Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive emails for social activity related to your content.
                    </p>
                  </div>
                  <Switch 
                    id="social-emails" 
                    checked={emailSettings.socialNotifications}
                    onCheckedChange={() => handleEmailSettingsChange('socialNotifications')}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="update-emails">Updates & Security</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive important updates about your account and security.
                    </p>
                  </div>
                  <Switch 
                    id="update-emails" 
                    checked={emailSettings.updatesNotifications}
                    onCheckedChange={() => handleEmailSettingsChange('updatesNotifications')}
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">
                  Save Email Preferences
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="appearance">
            <Card>
              <CardHeader>
                <CardTitle>Appearance</CardTitle>
                <CardDescription>
                  Customize how ThriveSend looks for you.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Theme</Label>
                  <div className="grid grid-cols-3 gap-2">
                    <Button variant="outline" className="justify-start">
                      <span className="w-4 h-4 rounded-full bg-background border mr-2"></span>
                      Light
                    </Button>
                    <Button variant="outline" className="justify-start">
                      <span className="w-4 h-4 rounded-full bg-slate-900 mr-2"></span>
                      Dark
                    </Button>
                    <Button variant="outline" className="justify-start">
                      <span className="w-4 h-4 rounded-full bg-background border mr-2 relative overflow-hidden">
                        <span className="absolute inset-0 bg-slate-900 w-1/2"></span>
                      </span>
                      System
                    </Button>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">
                  Save Appearance Settings
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="advanced">
            <Card>
              <CardHeader>
                <CardTitle>Advanced Settings</CardTitle>
                <CardDescription>
                  Configure advanced options for your account.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Developer Mode</Label>
                    <p className="text-sm text-muted-foreground">
                      Enable advanced features for development and testing.
                    </p>
                  </div>
                  <Switch />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>API Access</Label>
                    <p className="text-sm text-muted-foreground">
                      Enable API access for integrations.
                    </p>
                  </div>
                  <Switch />
                </div>
              </CardContent>
              <CardFooter>
                <div className="space-y-2 w-full">
                  <Button variant="outline" className="w-full">
                    Save Advanced Settings
                  </Button>
                  <Button variant="destructive" className="w-full">
                    Delete Account
                  </Button>
                </div>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}