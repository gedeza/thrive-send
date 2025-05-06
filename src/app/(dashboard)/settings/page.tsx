"use client"

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function SettingsPage() {
  // Add a visible indicator that this is the new version
  useEffect(() => {
    // Create a temporary element to show this is the new settings page
    const indicator = document.createElement('div');
    indicator.innerHTML = 'NEW SETTINGS PAGE LOADED';
    indicator.style.position = 'fixed';
    indicator.style.top = '10px';
    indicator.style.right = '10px';
    indicator.style.backgroundColor = '#22c55e';
    indicator.style.color = 'white';
    indicator.style.padding = '5px 10px';
    indicator.style.borderRadius = '4px';
    indicator.style.zIndex = '9999';
    document.body.appendChild(indicator);
    
    // Remove after 5 seconds
    setTimeout(() => {
      indicator.remove();
    }, 5000);
    
    return () => {
      if (document.body.contains(indicator)) {
        document.body.removeChild(indicator);
      }
    };
  }, []);

  const [user, setUser] = useState({
    name: "John Doe",
    email: "john.doe@example.com"
  });
  
  const [emailSettings, setEmailSettings] = useState({
    marketingEmails: true,
    socialNotifications: false,
    updatesNotifications: true
  });

  const [campaignDefaults, setCampaignDefaults] = useState({
    fromName: "ThriveSend Marketing",
    replyToEmail: "marketing@example.com",
    sendTime: "immediate"
  });

  const [contentLibrarySettings, setContentLibrarySettings] = useState({
    autoTagging: true,
    defaultVisibility: "private",
    thumbnailSize: "medium"
  });

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle profile update logic
    console.log("Profile updated:", user);
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div>
          <h1 className="text-2xl font-bold">Settings</h1>
          <p className="text-muted-foreground">
            Manage your account settings and preferences.
          </p>
        </div>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="w-full max-w-md mb-6 grid grid-cols-5">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="email">Email</TabsTrigger>
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>
          
        {/* Profile Content */}
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
                <div className="space-y-2">
                  <Label htmlFor="avatar">Profile Picture</Label>
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xl">
                      {user.name.split(" ").map(n => n[0]).join("").toUpperCase()}
                    </div>
                    <Button variant="outline" size="sm">Change</Button>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit">Save Changes</Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>
          
        {/* Email Content */}
        <TabsContent value="email">
          <Card>
            <CardHeader>
              <CardTitle>Email Notifications</CardTitle>
              <CardDescription>
                Configure what emails you receive from us.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="marketing-emails">Marketing Emails</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive emails about new features and offerings.
                  </p>
                </div>
                <Switch 
                  id="marketing-emails"
                  checked={emailSettings.marketingEmails}
                  onCheckedChange={(checked) => setEmailSettings({...emailSettings, marketingEmails: checked})}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="social-emails">Social Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive emails for social activity related to your content.
                  </p>
                </div>
                <Switch 
                  id="social-emails"
                  checked={emailSettings.socialNotifications}
                  onCheckedChange={(checked) => setEmailSettings({...emailSettings, socialNotifications: checked})}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="update-emails">Updates & Security</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive important updates about your account and security.
                  </p>
                </div>
                <Switch 
                  id="update-emails"
                  checked={emailSettings.updatesNotifications}
                  onCheckedChange={(checked) => setEmailSettings({...emailSettings, updatesNotifications: checked})}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button>Save Email Preferences</Button>
            </CardFooter>
          </Card>
        </TabsContent>
          
        {/* Campaigns Content */}
        <TabsContent value="campaigns">
          <Card>
            <CardHeader>
              <CardTitle>Campaign Defaults</CardTitle>
              <CardDescription>
                Set default values for new campaigns.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="from-name">Default From Name</Label>
                <Input 
                  id="from-name" 
                  value={campaignDefaults.fromName}
                  onChange={(e) => setCampaignDefaults({...campaignDefaults, fromName: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reply-to">Default Reply-To Email</Label>
                <Input 
                  id="reply-to" 
                  type="email" 
                  value={campaignDefaults.replyToEmail}
                  onChange={(e) => setCampaignDefaults({...campaignDefaults, replyToEmail: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="send-time">Default Send Time</Label>
                <Select 
                  value={campaignDefaults.sendTime}
                  onValueChange={(value) => setCampaignDefaults({...campaignDefaults, sendTime: value})}
                >
                  <SelectTrigger id="send-time">
                    <SelectValue placeholder="Select send time" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="immediate">Immediate</SelectItem>
                    <SelectItem value="morning">Morning (9:00 AM)</SelectItem>
                    <SelectItem value="afternoon">Afternoon (2:00 PM)</SelectItem>
                    <SelectItem value="evening">Evening (7:00 PM)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Analytics Tracking</Label>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    Automatically enable click tracking for new campaigns
                  </p>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between mt-2">
                  <p className="text-sm text-muted-foreground">
                    Automatically enable open tracking for new campaigns
                  </p>
                  <Switch defaultChecked />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button>Save Campaign Settings</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        {/* Content Library Settings */}
        <TabsContent value="content">
          <Card>
            <CardHeader>
              <CardTitle>Content Library Settings</CardTitle>
              <CardDescription>
                Configure how your content library works.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Automatic Content Tagging</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically tag content based on analysis
                  </p>
                </div>
                <Switch 
                  checked={contentLibrarySettings.autoTagging}
                  onCheckedChange={(checked) => setContentLibrarySettings({...contentLibrarySettings, autoTagging: checked})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="content-visibility">Default Content Visibility</Label>
                <Select 
                  value={contentLibrarySettings.defaultVisibility}
                  onValueChange={(value) => setContentLibrarySettings({...contentLibrarySettings, defaultVisibility: value})}
                >
                  <SelectTrigger id="content-visibility">
                    <SelectValue placeholder="Select default visibility" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="private">Private (Only you)</SelectItem>
                    <SelectItem value="team">Team (All team members)</SelectItem>
                    <SelectItem value="public">Public (Anyone in organization)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="thumbnail-size">Content Thumbnail Size</Label>
                <Select 
                  value={contentLibrarySettings.thumbnailSize}
                  onValueChange={(value) => setContentLibrarySettings({...contentLibrarySettings, thumbnailSize: value})}
                >
                  <SelectTrigger id="thumbnail-size">
                    <SelectValue placeholder="Select thumbnail size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="small">Small</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="large">Large</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
            <CardFooter>
              <Button>Save Content Settings</Button>
            </CardFooter>
          </Card>
        </TabsContent>
          
        {/* Advanced Content */}
        <TabsContent value="advanced">
          <Card>
            <CardHeader>
              <CardTitle>Advanced Settings</CardTitle>
              <CardDescription>
                Configure advanced options for your account.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
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
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Developer Mode</Label>
                  <p className="text-sm text-muted-foreground">
                    Enable advanced features for development and testing.
                  </p>
                </div>
                <Switch onChange={(checked) => console.log("Developer mode:", checked)} />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>API Access</Label>
                  <p className="text-sm text-muted-foreground">
                    Enable API access for integrations.
                  </p>
                </div>
                <Switch onChange={(checked) => console.log("API access:", checked)} />
              </div>
              
              <div className="space-y-2">
                <Label>API Keys</Label>
                <div className="flex items-center space-x-2">
                  <Input value="••••••••••••••••••••••••" readOnly className="font-mono" />
                  <Button variant="outline" size="sm">Regenerate</Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Use this API key to authenticate your requests
                </p>
              </div>
            </CardContent>
            <CardFooter className="flex-col items-start space-y-2">
              <Button className="w-full">Save Advanced Settings</Button>
              <Button variant="destructive" className="w-full">Delete Account</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
