'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { 
  Shield, 
  Eye, 
  Download, 
  Trash2,
  Clock,
  Globe,
  Lock,
  FileText,
  Settings,
  AlertTriangle,
  Check,
  Info,
  ExternalLink,
  Database,
  Cookie,
  UserCheck,
  Share
} from 'lucide-react';
import { useUserSettings } from '@/contexts/SettingsContext';
import { cn } from '@/lib/utils';

// Data categories for privacy controls
interface DataCategory {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  required: boolean;
  settings: {
    collect: boolean;
    share: boolean;
    retain: 'indefinite' | '1year' | '2years' | '5years';
  };
}

const DATA_CATEGORIES: DataCategory[] = [
  {
    id: 'profile',
    name: 'Profile Information',
    description: 'Basic account information like name, email, and profile picture',
    icon: UserCheck,
    required: true,
    settings: {
      collect: true,
      share: false,
      retain: 'indefinite'
    }
  },
  {
    id: 'content',
    name: 'Content Data',
    description: 'Your posts, campaigns, and creative content',
    icon: FileText,
    required: true,
    settings: {
      collect: true,
      share: false,
      retain: 'indefinite'
    }
  },
  {
    id: 'analytics',
    name: 'Analytics & Performance',
    description: 'Content performance metrics and audience insights',
    icon: Database,
    required: false,
    settings: {
      collect: true,
      share: false,
      retain: '2years'
    }
  },
  {
    id: 'usage',
    name: 'Usage Patterns',
    description: 'How you interact with our platform and features',
    icon: Eye,
    required: false,
    settings: {
      collect: true,
      share: false,
      retain: '1year'
    }
  },
  {
    id: 'integrations',
    name: 'Third-party Integrations',
    description: 'Data from connected social media accounts and tools',
    icon: Share,
    required: false,
    settings: {
      collect: true,
      share: true,
      retain: '2years'
    }
  },
  {
    id: 'cookies',
    name: 'Cookies & Tracking',
    description: 'Browser cookies and tracking data for personalization',
    icon: Cookie,
    required: false,
    settings: {
      collect: true,
      share: false,
      retain: '1year'
    }
  }
];

// Privacy rights and actions
interface PrivacyRight {
  id: string;
  title: string;
  description: string;
  action: string;
  icon: React.ComponentType<{ className?: string }>;
  available: boolean;
}

const PRIVACY_RIGHTS: PrivacyRight[] = [
  {
    id: 'access',
    title: 'Access Your Data',
    description: 'Download a copy of all data we have about you',
    action: 'Request Data Export',
    icon: Download,
    available: true
  },
  {
    id: 'rectification',
    title: 'Correct Your Data',
    description: 'Update or correct inaccurate personal information',
    action: 'Update Profile',
    icon: Settings,
    available: true
  },
  {
    id: 'erasure',
    title: 'Delete Your Data',
    description: 'Request permanent deletion of your personal data',
    action: 'Request Deletion',
    icon: Trash2,
    available: true
  },
  {
    id: 'portability',
    title: 'Data Portability',
    description: 'Export your data in a machine-readable format',
    action: 'Export Data',
    icon: FileText,
    available: true
  },
  {
    id: 'restriction',
    title: 'Restrict Processing',
    description: 'Limit how we process your personal data',
    action: 'Manage Restrictions',
    icon: Lock,
    available: false
  },
  {
    id: 'objection',
    title: 'Object to Processing',
    description: 'Object to certain types of data processing',
    action: 'File Objection',
    icon: AlertTriangle,
    available: false
  }
];

// Data category component
function DataCategoryCard({ 
  category, 
  settings, 
  onUpdate, 
  disabled 
}: {
  category: DataCategory;
  settings: any;
  onUpdate: (path: string, value: any) => void;
  disabled?: boolean;
}) {
  const Icon = category.icon;
  
  return (
    <Card className={cn(category.required && 'border-amber-200 bg-amber-50/50')}>
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Icon className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                {category.name}
                {category.required && (
                  <Badge variant="secondary" className="bg-amber-100 text-amber-800">
                    Required
                  </Badge>
                )}
              </CardTitle>
              <p className="text-sm text-muted-foreground">{category.description}</p>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm font-medium">Collection</Label>
              <p className="text-xs text-muted-foreground">Allow data collection</p>
            </div>
            <Switch
              checked={settings?.privacy?.[category.id]?.collect ?? category.settings.collect}
              onCheckedChange={(checked) => onUpdate(`privacy.${category.id}.collect`, checked)}
              disabled={disabled || category.required}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm font-medium">Sharing</Label>
              <p className="text-xs text-muted-foreground">Share with partners</p>
            </div>
            <Switch
              checked={settings?.privacy?.[category.id]?.share ?? category.settings.share}
              onCheckedChange={(checked) => onUpdate(`privacy.${category.id}.share`, checked)}
              disabled={disabled || !settings?.privacy?.[category.id]?.collect}
            />
          </div>
          
          <div>
            <Label className="text-sm font-medium">Retention</Label>
            <Select
              value={settings?.privacy?.[category.id]?.retain ?? category.settings.retain}
              onValueChange={(value) => onUpdate(`privacy.${category.id}.retain`, value)}
              disabled={disabled || category.required}
            >
              <SelectTrigger className="h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="indefinite">Indefinite</SelectItem>
                <SelectItem value="1year">1 Year</SelectItem>
                <SelectItem value="2years">2 Years</SelectItem>
                <SelectItem value="5years">5 Years</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {category.required && (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription className="text-xs">
              This data is required for core platform functionality and cannot be disabled.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}

// Privacy rights component
function PrivacyRightsCard({ 
  onAction 
}: {
  onAction: (rightId: string) => void;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Your Privacy Rights
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {PRIVACY_RIGHTS.map((right) => (
          <div key={right.id} className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <right.icon className="h-4 w-4 text-primary" />
              </div>
              <div>
                <div className="font-medium">{right.title}</div>
                <p className="text-sm text-muted-foreground">{right.description}</p>
              </div>
            </div>
            
            <Button
              variant={right.available ? "outline" : "ghost"}
              size="sm"
              onClick={() => onAction(right.id)}
              disabled={!right.available}
            >
              {right.action}
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

// Consent management
function ConsentManagement({ 
  settings, 
  onUpdate, 
  disabled 
}: {
  settings: any;
  onUpdate: (path: string, value: any) => void;
  disabled?: boolean;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserCheck className="h-5 w-5" />
          Consent Management
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Marketing Communications</Label>
              <p className="text-sm text-muted-foreground">
                Receive product updates, tips, and promotional content
              </p>
            </div>
            <Switch
              checked={settings?.consent?.marketing ?? false}
              onCheckedChange={(checked) => onUpdate('consent.marketing', checked)}
              disabled={disabled}
            />
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Analytics & Performance</Label>
              <p className="text-sm text-muted-foreground">
                Help us improve by sharing usage analytics
              </p>
            </div>
            <Switch
              checked={settings?.consent?.analytics ?? true}
              onCheckedChange={(checked) => onUpdate('consent.analytics', checked)}
              disabled={disabled}
            />
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Personalization</Label>
              <p className="text-sm text-muted-foreground">
                Use your data to personalize your experience
              </p>
            </div>
            <Switch
              checked={settings?.consent?.personalization ?? true}
              onCheckedChange={(checked) => onUpdate('consent.personalization', checked)}
              disabled={disabled}
            />
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Third-party Integrations</Label>
              <p className="text-sm text-muted-foreground">
                Share data with connected third-party services
              </p>
            </div>
            <Switch
              checked={settings?.consent?.integrations ?? true}
              onCheckedChange={(checked) => onUpdate('consent.integrations', checked)}
              disabled={disabled}
            />
          </div>
        </div>
        
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            You can withdraw your consent at any time. Some features may not work properly if consent is withdrawn.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}

// Main component
export default function DataPrivacySettings() {
  const { settings, updateSetting, loading, saving, error } = useUserSettings();
  const [exportRequested, setExportRequested] = useState(false);
  const [deletionRequested, setDeletionRequested] = useState(false);
  
  const handlePrivacyAction = async (actionId: string) => {
    switch (actionId) {
      case 'access':
      case 'portability':
        setExportRequested(true);
        // Simulate API call
        setTimeout(() => {
          alert('Data export has been requested. You will receive an email with download links within 24 hours.');
          setExportRequested(false);
        }, 2000);
        break;
        
      case 'rectification':
        // Navigate to profile settings
        window.location.hash = '#profile';
        break;
        
      case 'erasure':
        if (confirm('Are you sure you want to request deletion of all your data? This action cannot be undone.')) {
          setDeletionRequested(true);
          setTimeout(() => {
            alert('Deletion request submitted. We will process this within 30 days and send you a confirmation.');
            setDeletionRequested(false);
          }, 2000);
        }
        break;
        
      default:
        alert(`${actionId} functionality coming soon.`);
    }
  };
  
  const getDataSummary = () => {
    const totalCategories = DATA_CATEGORIES.length;
    const enabledCategories = DATA_CATEGORIES.filter(category => 
      settings?.privacy?.[category.id]?.collect ?? category.settings.collect
    ).length;
    
    return {
      totalCategories,
      enabledCategories,
      sharedCategories: DATA_CATEGORIES.filter(category =>
        settings?.privacy?.[category.id]?.share ?? category.settings.share
      ).length
    };
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="text-sm text-muted-foreground">Loading privacy settings...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }
  
  const dataSummary = getDataSummary();

  return (
    <div className="space-y-8">
      {/* Privacy Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Privacy Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-blue-600 mb-1">
                {dataSummary.enabledCategories}/{dataSummary.totalCategories}
              </div>
              <div className="text-sm text-muted-foreground">Data Categories Active</div>
            </div>
            
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-green-600 mb-1">
                {settings?.consent ? Object.values(settings.consent).filter(Boolean).length : 0}
              </div>
              <div className="text-sm text-muted-foreground">Consents Given</div>
            </div>
            
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-amber-600 mb-1">
                {dataSummary.sharedCategories}
              </div>
              <div className="text-sm text-muted-foreground">Categories Shared</div>
            </div>
            
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-purple-600 mb-1">
                GDPR
              </div>
              <div className="text-sm text-muted-foreground">Compliance Level</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Collection Categories */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Data Collection Categories</h2>
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <Check className="h-3 w-3 mr-1" />
            GDPR Compliant
          </Badge>
        </div>
        
        <div className="space-y-4">
          {DATA_CATEGORIES.map((category) => (
            <DataCategoryCard
              key={category.id}
              category={category}
              settings={settings}
              onUpdate={updateSetting}
              disabled={saving}
            />
          ))}
        </div>
      </div>

      {/* Consent Management */}
      <ConsentManagement 
        settings={settings} 
        onUpdate={updateSetting} 
        disabled={saving} 
      />

      {/* Privacy Rights */}
      <PrivacyRightsCard onAction={handlePrivacyAction} />

      {/* Data Retention Policy */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Data Retention Policy
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              We retain your data only as long as necessary to provide our services and comply with legal obligations.
            </AlertDescription>
          </Alert>
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <UserCheck className="h-4 w-4 text-primary" />
                  <span className="font-medium">Account Data</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Retained for the lifetime of your account, deleted within 30 days of account closure
                </p>
              </div>
              
              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="h-4 w-4 text-primary" />
                  <span className="font-medium">Content Data</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Retained indefinitely unless you choose to delete specific content
                </p>
              </div>
              
              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Database className="h-4 w-4 text-primary" />
                  <span className="font-medium">Analytics Data</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Aggregated data retained for up to 2 years, individual data for 1 year
                </p>
              </div>
              
              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Cookie className="h-4 w-4 text-primary" />
                  <span className="font-medium">Cookies & Tracking</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Most cookies expire after 1 year, essential cookies after 2 years
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Legal Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Legal Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button variant="outline" className="justify-start">
              <FileText className="h-4 w-4 mr-2" />
              Privacy Policy
              <ExternalLink className="h-3 w-3 ml-auto" />
            </Button>
            
            <Button variant="outline" className="justify-start">
              <FileText className="h-4 w-4 mr-2" />
              Terms of Service
              <ExternalLink className="h-3 w-3 ml-auto" />
            </Button>
            
            <Button variant="outline" className="justify-start">
              <Cookie className="h-4 w-4 mr-2" />
              Cookie Policy
              <ExternalLink className="h-3 w-3 ml-auto" />
            </Button>
            
            <Button variant="outline" className="justify-start">
              <Shield className="h-4 w-4 mr-2" />
              Data Processing Agreement
              <ExternalLink className="h-3 w-3 ml-auto" />
            </Button>
          </div>
          
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-2">
                <p className="font-medium">Last updated: March 15, 2024</p>
                <p className="text-sm">
                  We are committed to protecting your privacy and being transparent about how we collect, 
                  use, and share your information. If you have any questions about our privacy practices, 
                  please contact our Data Protection Officer at privacy@thrivesend.com.
                </p>
              </div>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Status Indicators */}
      {(exportRequested || deletionRequested || saving) && (
        <Alert>
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2"></div>
          <AlertDescription>
            {saving && 'Saving privacy preferences...'}
            {exportRequested && 'Processing data export request...'}
            {deletionRequested && 'Processing deletion request...'}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}