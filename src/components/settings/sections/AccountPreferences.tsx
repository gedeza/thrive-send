'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Bell, 
  Mail, 
  Shield, 
  Globe, 
  Clock,
  Info,
  Check
} from 'lucide-react';
import { useUserSettings } from '@/contexts/SettingsContext';
import { cn } from '@/lib/utils';

export default function AccountPreferences() {
  const { settings, updateSetting, loading, saving, error } = useUserSettings();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="text-sm text-muted-foreground">Loading preferences...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <Info className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-8">
      {/* Notification Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notification Preferences
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Email notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive important updates and alerts via email
                </p>
              </div>
              <Switch
                checked={settings?.notifications?.email || false}
                onCheckedChange={(checked) => updateSetting('notifications.email', checked)}
                disabled={saving}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Push notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Get browser notifications for real-time updates
                </p>
              </div>
              <Switch
                checked={settings?.notifications?.push || false}
                onCheckedChange={(checked) => updateSetting('notifications.push', checked)}
                disabled={saving}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Marketing emails</Label>
                <p className="text-sm text-muted-foreground">
                  Receive product updates, tips, and promotional content
                </p>
              </div>
              <Switch
                checked={settings?.notifications?.marketing || false}
                onCheckedChange={(checked) => updateSetting('notifications.marketing', checked)}
                disabled={saving}
              />
            </div>

            <Separator />

            <div className="space-y-3">
              <Label className="text-base">Email digest frequency</Label>
              <p className="text-sm text-muted-foreground">
                How often would you like to receive summary emails?
              </p>
              <RadioGroup
                value={settings?.notifications?.digest || 'weekly'}
                onValueChange={(value: 'daily' | 'weekly' | 'monthly' | 'never') => 
                  updateSetting('notifications.digest', value)
                }
                disabled={saving}
              >
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="flex items-center space-x-2 p-3 border rounded-lg">
                    <RadioGroupItem value="daily" id="daily" />
                    <Label htmlFor="daily">Daily</Label>
                  </div>
                  <div className="flex items-center space-x-2 p-3 border rounded-lg">
                    <RadioGroupItem value="weekly" id="weekly" />
                    <Label htmlFor="weekly">Weekly</Label>
                  </div>
                  <div className="flex items-center space-x-2 p-3 border rounded-lg">
                    <RadioGroupItem value="monthly" id="monthly" />
                    <Label htmlFor="monthly">Monthly</Label>
                  </div>
                  <div className="flex items-center space-x-2 p-3 border rounded-lg">
                    <RadioGroupItem value="never" id="never" />
                    <Label htmlFor="never">Never</Label>
                  </div>
                </div>
              </RadioGroup>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Privacy Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Privacy Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-3">
              <Label className="text-base">Profile visibility</Label>
              <p className="text-sm text-muted-foreground">
                Control who can see your profile information
              </p>
              <RadioGroup
                value={settings?.privacy?.profileVisibility || 'connections'}
                onValueChange={(value: 'public' | 'private' | 'connections') => 
                  updateSetting('privacy.profileVisibility', value)
                }
                disabled={saving}
              >
                <div className="space-y-3">
                  <div className="flex items-start space-x-2 p-3 border rounded-lg">
                    <RadioGroupItem value="public" id="public" className="mt-0.5" />
                    <div className="flex-1">
                      <Label htmlFor="public" className="font-medium">Public</Label>
                      <p className="text-sm text-muted-foreground">
                        Anyone can see your profile information
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-2 p-3 border rounded-lg">
                    <RadioGroupItem value="connections" id="connections" className="mt-0.5" />
                    <div className="flex-1">
                      <Label htmlFor="connections" className="font-medium">Connections only</Label>
                      <p className="text-sm text-muted-foreground">
                        Only people in your organization can see your profile
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-2 p-3 border rounded-lg">
                    <RadioGroupItem value="private" id="private" className="mt-0.5" />
                    <div className="flex-1">
                      <Label htmlFor="private" className="font-medium">Private</Label>
                      <p className="text-sm text-muted-foreground">
                        Your profile is hidden from other users
                      </p>
                    </div>
                  </div>
                </div>
              </RadioGroup>
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Show activity status</Label>
                <p className="text-sm text-muted-foreground">
                  Let others see when you're active or recently active
                </p>
              </div>
              <Switch
                checked={settings?.privacy?.showActivity || false}
                onCheckedChange={(checked) => updateSetting('privacy.showActivity', checked)}
                disabled={saving}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Search engine indexing</Label>
                <p className="text-sm text-muted-foreground">
                  Allow search engines to index your public profile
                </p>
              </div>
              <Switch
                checked={settings?.privacy?.allowSearchIndexing || false}
                onCheckedChange={(checked) => updateSetting('privacy.allowSearchIndexing', checked)}
                disabled={saving}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Localization Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Localization
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Timezone</Label>
              <Select
                value={settings?.preferences?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone}
                onValueChange={(value) => updateSetting('preferences.timezone', value)}
                disabled={saving}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select timezone" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="UTC">UTC</SelectItem>
                  <SelectItem value="America/New_York">Eastern Time (EST/EDT)</SelectItem>
                  <SelectItem value="America/Chicago">Central Time (CST/CDT)</SelectItem>
                  <SelectItem value="America/Denver">Mountain Time (MST/MDT)</SelectItem>
                  <SelectItem value="America/Los_Angeles">Pacific Time (PST/PDT)</SelectItem>
                  <SelectItem value="Europe/London">London (GMT/BST)</SelectItem>
                  <SelectItem value="Europe/Paris">Central European Time</SelectItem>
                  <SelectItem value="Europe/Berlin">Berlin Time</SelectItem>
                  <SelectItem value="Asia/Tokyo">Japan Time (JST)</SelectItem>
                  <SelectItem value="Asia/Shanghai">China Time (CST)</SelectItem>
                  <SelectItem value="Asia/Kolkata">India Time (IST)</SelectItem>
                  <SelectItem value="Australia/Sydney">Australian Eastern Time</SelectItem>
                  <SelectItem value="Africa/Johannesburg">South Africa Time (SAST)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Current time: {new Date().toLocaleString('en-US', { 
                  timeZone: settings?.preferences?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone 
                })}
              </p>
            </div>

            <div className="space-y-2">
              <Label>Language</Label>
              <Select
                value={settings?.preferences?.language || 'en'}
                onValueChange={(value) => updateSetting('preferences.language', value)}
                disabled={saving}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="es">Español</SelectItem>
                  <SelectItem value="fr">Français</SelectItem>
                  <SelectItem value="de">Deutsch</SelectItem>
                  <SelectItem value="it">Italiano</SelectItem>
                  <SelectItem value="pt">Português</SelectItem>
                  <SelectItem value="ja">日本語</SelectItem>
                  <SelectItem value="ko">한국어</SelectItem>
                  <SelectItem value="zh">中文</SelectItem>
                  <SelectItem value="ar">العربية</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Date format</Label>
              <Select
                value={settings?.preferences?.dateFormat || 'MM/DD/YYYY'}
                onValueChange={(value) => updateSetting('preferences.dateFormat', value)}
                disabled={saving}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select date format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MM/DD/YYYY">MM/DD/YYYY (US)</SelectItem>
                  <SelectItem value="DD/MM/YYYY">DD/MM/YYYY (UK)</SelectItem>
                  <SelectItem value="YYYY-MM-DD">YYYY-MM-DD (ISO)</SelectItem>
                  <SelectItem value="DD.MM.YYYY">DD.MM.YYYY (German)</SelectItem>
                  <SelectItem value="DD/MM/YY">DD/MM/YY (Short)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Preview: {new Date().toLocaleDateString('en-US', {
                  year: settings?.preferences?.dateFormat?.includes('YYYY') ? 'numeric' : '2-digit',
                  month: settings?.preferences?.dateFormat?.startsWith('MM') ? '2-digit' : '2-digit',
                  day: '2-digit'
                })}
              </p>
            </div>

            <div className="space-y-2">
              <Label>Currency</Label>
              <Select
                value={settings?.preferences?.currency || 'USD'}
                onValueChange={(value) => updateSetting('preferences.currency', value)}
                disabled={saving}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD - US Dollar</SelectItem>
                  <SelectItem value="EUR">EUR - Euro</SelectItem>
                  <SelectItem value="GBP">GBP - British Pound</SelectItem>
                  <SelectItem value="CAD">CAD - Canadian Dollar</SelectItem>
                  <SelectItem value="AUD">AUD - Australian Dollar</SelectItem>
                  <SelectItem value="ZAR">ZAR - South African Rand</SelectItem>
                  <SelectItem value="JPY">JPY - Japanese Yen</SelectItem>
                  <SelectItem value="CNY">CNY - Chinese Yuan</SelectItem>
                  <SelectItem value="INR">INR - Indian Rupee</SelectItem>
                  <SelectItem value="BRL">BRL - Brazilian Real</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Status Indicator */}
      {saving && (
        <Alert>
          <Clock className="h-4 w-4" />
          <AlertDescription>
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
              Saving your preferences...
            </div>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}