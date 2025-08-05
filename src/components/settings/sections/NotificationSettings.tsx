'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { 
  Bell, 
  Mail, 
  Smartphone, 
  MessageSquare, 
  Calendar,
  TrendingUp,
  AlertCircle,
  Check,
  Settings,
  Volume,
  VolumeX,
  Clock,
  Users,
  FileText,
  Target
} from 'lucide-react';
import { useUserSettings } from '@/contexts/SettingsContext';
import { cn } from '@/lib/utils';

// Notification types and categories
interface NotificationCategory {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  settings: {
    [key: string]: {
      label: string;
      description: string;
      email: boolean;
      push: boolean;
      inApp: boolean;
    };
  };
}

const NOTIFICATION_CATEGORIES: NotificationCategory[] = [
  {
    id: 'content',
    name: 'Content & Campaigns',
    description: 'Updates about your content creation and campaign activities',
    icon: FileText,
    settings: {
      contentCreated: {
        label: 'Content Created',
        description: 'When new content is created in your organization',
        email: true,
        push: false,
        inApp: true
      },
      contentApproved: {
        label: 'Content Approved',
        description: 'When your content is approved for publishing',
        email: true,
        push: true,
        inApp: true
      },
      contentRejected: {
        label: 'Content Rejected',
        description: 'When your content needs revisions',
        email: true,
        push: true,
        inApp: true
      },
      campaignStarted: {
        label: 'Campaign Started',
        description: 'When a campaign begins',
        email: true,
        push: false,
        inApp: true
      },
      campaignCompleted: {
        label: 'Campaign Completed',
        description: 'When a campaign finishes running',
        email: true,
        push: false,
        inApp: true
      }
    }
  },
  {
    id: 'collaboration',
    name: 'Team & Collaboration',
    description: 'Notifications about team activities and collaboration',
    icon: Users,
    settings: {
      memberJoined: {
        label: 'New Team Member',
        description: 'When someone joins your organization',
        email: true,
        push: false,
        inApp: true
      },
      mentionReceived: {
        label: 'Mentions',
        description: 'When someone mentions you in comments',
        email: true,
        push: true,
        inApp: true
      },
      commentAdded: {
        label: 'New Comments',
        description: 'When someone comments on your content',
        email: true,
        push: false,
        inApp: true
      },
      taskAssigned: {
        label: 'Task Assigned',
        description: 'When a task is assigned to you',
        email: true,
        push: true,
        inApp: true
      }
    }
  },
  {
    id: 'analytics',
    name: 'Analytics & Performance',
    description: 'Reports and insights about your content performance',
    icon: TrendingUp,
    settings: {
      weeklyReport: {
        label: 'Weekly Reports',
        description: 'Weekly performance summary',
        email: true,
        push: false,
        inApp: false
      },
      monthlyReport: {
        label: 'Monthly Reports',
        description: 'Comprehensive monthly analytics',
        email: true,
        push: false,
        inApp: false
      },
      performanceAlert: {
        label: 'Performance Alerts',
        description: 'When content performs exceptionally well or poorly',
        email: true,
        push: false,
        inApp: true
      },
      goalAchieved: {
        label: 'Goals Achieved',
        description: 'When you reach your content goals',
        email: true,
        push: true,
        inApp: true
      }
    }
  },
  {
    id: 'system',
    name: 'System & Security',
    description: 'Important system updates and security notifications',
    icon: Settings,
    settings: {
      securityAlert: {
        label: 'Security Alerts',
        description: 'Important security notifications',
        email: true,
        push: true,
        inApp: true
      },
      systemMaintenance: {
        label: 'Maintenance',
        description: 'Scheduled system maintenance notifications',
        email: true,
        push: false,
        inApp: true
      },
      featureUpdates: {
        label: 'Feature Updates',
        description: 'New features and product updates',
        email: false,
        push: false,
        inApp: true
      },
      billingUpdates: {
        label: 'Billing & Payments',
        description: 'Payment receipts and billing notifications (supports ZAR, USD, EUR)',
        email: true,
        push: false,
        inApp: true
      }
    }
  }
];

// Notification channel component
interface NotificationChannelProps {
  category: NotificationCategory;
  settings: any;
  onUpdate: (path: string, value: boolean) => void;
  disabled?: boolean;
}

function NotificationChannelCard({ category, settings, onUpdate, disabled }: NotificationChannelProps) {
  const Icon = category.icon;
  
  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Icon className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-base">{category.name}</CardTitle>
            <p className="text-sm text-muted-foreground">{category.description}</p>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {Object.entries(category.settings).map(([key, setting]) => (
          <div key={key} className="space-y-3">
            <div>
              <Label className="text-sm font-medium">{setting.label}</Label>
              <p className="text-xs text-muted-foreground">{setting.description}</p>
            </div>
            
            <div className="grid grid-cols-3 gap-4 pl-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Email</span>
                </div>
                <Switch
                  checked={settings?.notifications?.[category.id]?.[key]?.email ?? setting.email}
                  onCheckedChange={(checked) => onUpdate(`notifications.${category.id}.${key}.email`, checked)}
                  disabled={disabled}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Smartphone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Push</span>
                </div>
                <Switch
                  checked={settings?.notifications?.[category.id]?.[key]?.push ?? setting.push}
                  onCheckedChange={(checked) => onUpdate(`notifications.${category.id}.${key}.push`, checked)}
                  disabled={disabled}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bell className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">In-App</span>
                </div>
                <Switch
                  checked={settings?.notifications?.[category.id]?.[key]?.inApp ?? setting.inApp}
                  onCheckedChange={(checked) => onUpdate(`notifications.${category.id}.${key}.inApp`, checked)}
                  disabled={disabled}
                />
              </div>
            </div>
            
            <Separator />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

// Quick actions component
function QuickActions({ onUpdate, disabled }: {
  onUpdate: (path: string, value: boolean) => void;
  disabled?: boolean;
}) {
  const handleEnableAll = () => {
    NOTIFICATION_CATEGORIES.forEach(category => {
      Object.keys(category.settings).forEach(key => {
        onUpdate(`notifications.${category.id}.${key}.email`, true);
        onUpdate(`notifications.${category.id}.${key}.push`, true);
        onUpdate(`notifications.${category.id}.${key}.inApp`, true);
      });
    });
  };
  
  const handleDisableAll = () => {
    NOTIFICATION_CATEGORIES.forEach(category => {
      Object.keys(category.settings).forEach(key => {
        onUpdate(`notifications.${category.id}.${key}.email`, false);
        onUpdate(`notifications.${category.id}.${key}.push`, false);
        onUpdate(`notifications.${category.id}.${key}.inApp`, false);
      });
    });
  };
  
  const handleEmailOnly = () => {
    NOTIFICATION_CATEGORIES.forEach(category => {
      Object.entries(category.settings).forEach(([key, setting]) => {
        onUpdate(`notifications.${category.id}.${key}.email`, setting.email);
        onUpdate(`notifications.${category.id}.${key}.push`, false);
        onUpdate(`notifications.${category.id}.${key}.inApp`, setting.inApp);
      });
    });
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={handleEnableAll} disabled={disabled}>
            <Volume className="h-4 w-4 mr-2" />
            Enable All
          </Button>
          <Button variant="outline" size="sm" onClick={handleDisableAll} disabled={disabled}>
            <VolumeX className="h-4 w-4 mr-2" />
            Disable All
          </Button>
          <Button variant="outline" size="sm" onClick={handleEmailOnly} disabled={disabled}>
            <Mail className="h-4 w-4 mr-2" />
            Email Only
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// Do not disturb settings
function DoNotDisturbSettings({ settings, onUpdate, disabled }: {
  settings: any;
  onUpdate: (path: string, value: any) => void;
  disabled?: boolean;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Do Not Disturb
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label className="text-base">Enable Do Not Disturb</Label>
            <p className="text-sm text-muted-foreground">
              Pause non-critical notifications during specified hours
            </p>
          </div>
          <Switch
            checked={settings?.doNotDisturb?.enabled || false}
            onCheckedChange={(checked) => onUpdate('doNotDisturb.enabled', checked)}
            disabled={disabled}
          />
        </div>
        
        {settings?.doNotDisturb?.enabled && (
          <div className="space-y-4 pl-4 border-l-2 border-muted">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Time</Label>
                <Select
                  value={settings?.doNotDisturb?.startTime || '22:00'}
                  onValueChange={(value) => onUpdate('doNotDisturb.startTime', value)}
                  disabled={disabled}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 24 }, (_, i) => {
                      const hour = i.toString().padStart(2, '0');
                      return (
                        <SelectItem key={hour} value={`${hour}:00`}>
                          {`${hour}:00`}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>End Time</Label>
                <Select
                  value={settings?.doNotDisturb?.endTime || '08:00'}
                  onValueChange={(value) => onUpdate('doNotDisturb.endTime', value)}
                  disabled={disabled}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 24 }, (_, i) => {
                      const hour = i.toString().padStart(2, '0');
                      return (
                        <SelectItem key={hour} value={`${hour}:00`}>
                          {`${hour}:00`}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-3">
              <Label>Days</Label>
              <div className="grid grid-cols-7 gap-2">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => (
                  <Button
                    key={day}
                    variant={settings?.doNotDisturb?.days?.includes(index) ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => {
                      const currentDays = settings?.doNotDisturb?.days || [];
                      const newDays = currentDays.includes(index)
                        ? currentDays.filter((d: number) => d !== index)
                        : [...currentDays, index];
                      onUpdate('doNotDisturb.days', newDays);
                    }}
                    disabled={disabled}
                    className="text-xs"
                  >
                    {day}
                  </Button>
                ))}
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-sm">Allow urgent notifications</Label>
                <p className="text-xs text-muted-foreground">
                  Security alerts and critical system notifications
                </p>
              </div>
              <Switch
                checked={settings?.doNotDisturb?.allowUrgent ?? true}
                onCheckedChange={(checked) => onUpdate('doNotDisturb.allowUrgent', checked)}
                disabled={disabled}
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Main component
export default function NotificationSettings() {
  const { settings, updateSetting, loading, saving, error } = useUserSettings();
  const [testingNotification, setTestingNotification] = useState<string | null>(null);
  
  const handleTestNotification = async (type: 'email' | 'push' | 'inApp') => {
    setTestingNotification(type);
    
    try {
      // Simulate API call for testing notification
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Show success message
      if (type === 'inApp') {
        // This would trigger an actual in-app notification
        alert('Test in-app notification sent!');
      } else {
        alert(`Test ${type} notification sent! Check your ${type === 'email' ? 'email' : 'device'}.`);
      }
      
    } catch (error) {
      console.error('Failed to send test notification:', error);
      alert('Failed to send test notification. Please try again.');
    } finally {
      setTestingNotification(null);
    }
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="text-sm text-muted-foreground">Loading notification settings...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-8">
      {/* Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notification Preferences
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-blue-600 mb-1">
                {NOTIFICATION_CATEGORIES.reduce((total, category) => 
                  total + Object.keys(category.settings).length, 0
                )}
              </div>
              <div className="text-sm text-muted-foreground">Notification Types</div>
            </div>
            
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-green-600 mb-1">
                3
              </div>
              <div className="text-sm text-muted-foreground">Delivery Channels</div>
            </div>
            
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-purple-600 mb-1">
                {settings?.doNotDisturb?.enabled ? 'On' : 'Off'}
              </div>
              <div className="text-sm text-muted-foreground">Do Not Disturb</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <QuickActions onUpdate={updateSetting} disabled={saving} />

      {/* Do Not Disturb */}
      <DoNotDisturbSettings 
        settings={settings} 
        onUpdate={updateSetting} 
        disabled={saving} 
      />

      {/* Test Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Test Notifications
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button
              variant="outline"
              onClick={() => handleTestNotification('email')}
              disabled={testingNotification === 'email'}
            >
              {testingNotification === 'email' ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                  Sending...
                </>
              ) : (
                <>
                  <Mail className="h-4 w-4 mr-2" />
                  Test Email
                </>
              )}
            </Button>
            
            <Button
              variant="outline"
              onClick={() => handleTestNotification('push')}
              disabled={testingNotification === 'push'}
            >
              {testingNotification === 'push' ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                  Sending...
                </>
              ) : (
                <>
                  <Smartphone className="h-4 w-4 mr-2" />
                  Test Push
                </>
              )}
            </Button>
            
            <Button
              variant="outline"
              onClick={() => handleTestNotification('inApp')}
              disabled={testingNotification === 'inApp'}
            >
              {testingNotification === 'inApp' ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                  Sending...
                </>
              ) : (
                <>
                  <Bell className="h-4 w-4 mr-2" />
                  Test In-App
                </>
              )}
            </Button>
          </div>
          
          <Alert className="mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Use test notifications to verify your delivery preferences are working correctly.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Notification Categories */}
      <div className="space-y-6">
        {NOTIFICATION_CATEGORIES.map((category) => (
          <NotificationChannelCard
            key={category.id}
            category={category}
            settings={settings}
            onUpdate={updateSetting}
            disabled={saving}
          />
        ))}
      </div>

      {/* Status Indicator */}
      {saving && (
        <Alert>
          <Clock className="h-4 w-4" />
          <AlertDescription>
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
              Saving notification preferences...
            </div>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}