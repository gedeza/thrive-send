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

export default function SettingsPage() {
  const { user, isLoaded } = useUser();
  const [firstName, setFirstName] = useState(user?.firstName || "");
  const [lastName, setLastName] = useState(user?.lastName || "");
  const [email, setEmail] = useState(user?.primaryEmailAddress?.emailAddress || "");

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    try {
      await user.update({ firstName, lastName });
      alert("Settings updated successfully!");
    } catch (error) {
      console.error("Error updating settings:", error);
      alert("Failed to update settings.");
    }
  };

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

  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="firstName">First Name</label>
          <Input
            id="firstName"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="lastName">Last Name</label>
          <Input
            id="lastName"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="email">Email</label>
          <Input
            id="email"
            value={email}
            disabled
          />
        </div>
        <Button type="submit">Update Settings</Button>
      </form>
    </div>
  );
}
