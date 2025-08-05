'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { 
  Link2, 
  Facebook, 
  Instagram, 
  Linkedin, 
  Twitter,
  Youtube,
  Key,
  Webhook,
  Check,
  X,
  AlertCircle,
  RefreshCw,
  ExternalLink,
  Copy,
  Plus,
  Settings,
  Activity,
  Calendar,
  BarChart3
} from 'lucide-react';
import { useSettings } from '@/contexts/SettingsContext';
import { cn } from '@/lib/utils';

// Social platform configuration
interface SocialPlatform {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  description: string;
  features: string[];
  isConnected: boolean;
  accountInfo?: {
    handle: string;
    followers: number;
    lastSync: string;
  };
}

const SOCIAL_PLATFORMS: SocialPlatform[] = [
  {
    id: 'facebook',
    name: 'Facebook',
    icon: Facebook,
    color: 'bg-blue-600',
    description: 'Connect your Facebook pages to schedule posts and track engagement',
    features: ['Post scheduling', 'Analytics', 'Page management'],
    isConnected: true,
    accountInfo: {
      handle: '@acmecorp',
      followers: 5240,
      lastSync: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
    }
  },
  {
    id: 'instagram',
    name: 'Instagram',
    icon: Instagram,
    color: 'bg-gradient-to-br from-purple-600 to-pink-600',
    description: 'Share photos and stories, track performance metrics',
    features: ['Photo/video posts', 'Stories', 'Reels', 'Analytics'],
    isConnected: true,
    accountInfo: {
      handle: '@acme_corp',
      followers: 12150,
      lastSync: new Date(Date.now() - 30 * 60 * 1000).toISOString()
    }
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    icon: Linkedin,
    color: 'bg-blue-700',
    description: 'Share professional content and company updates',
    features: ['Company posts', 'Professional networking', 'Lead generation'],
    isConnected: false
  },
  {
    id: 'twitter',
    name: 'Twitter',
    icon: Twitter,
    color: 'bg-sky-500',
    description: 'Share quick updates and engage with your audience',
    features: ['Tweets', 'Threads', 'Spaces', 'Analytics'],
    isConnected: false
  },
  {
    id: 'youtube',
    name: 'YouTube',
    icon: Youtube,
    color: 'bg-red-600',
    description: 'Upload and manage video content',
    features: ['Video uploads', 'Community posts', 'Analytics'],
    isConnected: false
  }
];

// API Key interface
interface APIKey {
  id: string;
  name: string;
  key: string;
  permissions: string[];
  lastUsed?: string;
  expiresAt?: string;
  createdAt: string;
}

// Webhook interface
interface WebhookConfig {
  id: string;
  name: string;
  url: string;
  events: string[];
  status: 'active' | 'inactive' | 'error';
  lastTriggered?: string;
  createdAt: string;
}

// Social platform connection component
function SocialPlatformCard({ platform, onConnect, onDisconnect, onSync }: {
  platform: SocialPlatform;
  onConnect: (platformId: string) => void;
  onDisconnect: (platformId: string) => void;
  onSync: (platformId: string) => void;
}) {
  const Icon = platform.icon;
  
  const formatFollowers = (count: number) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };
  
  const formatLastSync = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    return `${Math.floor(diffInHours / 24)} days ago`;
  };

  return (
    <Card className={cn(
      'transition-all duration-200',
      platform.isConnected ? 'border-green-200 bg-green-50/50' : 'hover:shadow-md'
    )}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={cn('p-2 rounded-lg text-white', platform.color)}>
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-base">{platform.name}</CardTitle>
              {platform.isConnected && platform.accountInfo && (
                <p className="text-sm text-muted-foreground">
                  {platform.accountInfo.handle} • {formatFollowers(platform.accountInfo.followers)} followers
                </p>
              )}
            </div>
          </div>
          
          {platform.isConnected ? (
            <Badge variant="default" className="bg-green-100 text-green-800">
              <Check className="h-3 w-3 mr-1" />
              Connected
            </Badge>
          ) : (
            <Badge variant="outline">Not connected</Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          {platform.description}
        </p>
        
        <div className="flex flex-wrap gap-1">
          {platform.features.map((feature) => (
            <Badge key={feature} variant="secondary" className="text-xs">
              {feature}
            </Badge>
          ))}
        </div>
        
        {platform.isConnected && platform.accountInfo && (
          <div className="flex items-center justify-between text-xs text-muted-foreground p-2 bg-muted/50 rounded">
            <span>Last sync: {formatLastSync(platform.accountInfo.lastSync)}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onSync(platform.id)}
              className="h-6 px-2"
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              Sync
            </Button>
          </div>
        )}
        
        <div className="flex gap-2">
          {platform.isConnected ? (
            <>
              <Button variant="outline" size="sm" onClick={() => onDisconnect(platform.id)}>
                <X className="h-4 w-4 mr-1" />
                Disconnect
              </Button>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-1" />
                Settings
              </Button>
            </>
          ) : (
            <Button size="sm" onClick={() => onConnect(platform.id)}>
              <Link2 className="h-4 w-4 mr-1" />
              Connect
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// API Key management component
function APIKeyManager() {
  const [apiKeys, setApiKeys] = useState<APIKey[]>([
    {
      id: '1',
      name: 'Analytics API',
      key: 'sk_live_abcd1234...wxyz',
      permissions: ['read:analytics', 'write:campaigns'],
      lastUsed: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: '2',
      name: 'Webhook Handler',
      key: 'sk_live_efgh5678...stuv',
      permissions: ['read:events', 'write:webhooks'],
      lastUsed: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
    }
  ]);
  
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  
  const handleCreateKey = () => {
    const newKey: APIKey = {
      id: Date.now().toString(),
      name: newKeyName,
      key: `sk_live_${Math.random().toString(36).substring(2)}`,
      permissions: ['read:basic'],
      createdAt: new Date().toISOString()
    };
    
    setApiKeys([...apiKeys, newKey]);
    setNewKeyName('');
    setShowCreateForm(false);
  };
  
  const handleRevokeKey = (keyId: string) => {
    setApiKeys(apiKeys.filter(key => key.id !== keyId));
  };
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">API Keys</h3>
          <p className="text-sm text-muted-foreground">
            Manage API keys for external integrations
          </p>
        </div>
        <Button size="sm" onClick={() => setShowCreateForm(true)}>
          <Plus className="h-4 w-4 mr-1" />
          Create API Key
        </Button>
      </div>
      
      {showCreateForm && (
        <Card className="border-blue-200">
          <CardContent className="p-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>API Key Name</Label>
                <Input
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  placeholder="Enter a descriptive name"
                />
              </div>
              
              <div className="flex gap-2">
                <Button onClick={handleCreateKey} disabled={!newKeyName.trim()}>
                  Create Key
                </Button>
                <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      <div className="space-y-3">
        {apiKeys.map((apiKey) => (
          <Card key={apiKey.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{apiKey.name}</span>
                    <Badge variant="default" className="bg-green-100 text-green-800">
                      <Activity className="h-3 w-3 mr-1" />
                      Active
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-2 font-mono text-sm">
                    <span className="bg-muted px-2 py-1 rounded">{apiKey.key}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigator.clipboard.writeText(apiKey.key)}
                      className="h-6 w-6 p-0"
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                  
                  <div className="flex flex-wrap gap-1">
                    {apiKey.permissions.map((permission) => (
                      <Badge key={permission} variant="outline" className="text-xs">
                        {permission}
                      </Badge>
                    ))}
                  </div>
                  
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>Created: {formatDate(apiKey.createdAt)}</span>
                    {apiKey.lastUsed && (
                      <span>Last used: {formatDate(apiKey.lastUsed)}</span>
                    )}
                    {apiKey.expiresAt && (
                      <span>Expires: {formatDate(apiKey.expiresAt)}</span>
                    )}
                  </div>
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleRevokeKey(apiKey.id)}
                  className="text-destructive hover:text-destructive"
                >
                  Revoke
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// Webhook management component
function WebhookManager() {
  const [webhooks, setWebhooks] = useState<WebhookConfig[]>([
    {
      id: '1',
      name: 'Analytics Webhook',
      url: 'https://api.acmecorp.com/webhooks/thrivesend',
      events: ['content.published', 'campaign.completed'],
      status: 'active',
      lastTriggered: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
    }
  ]);
  
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newWebhook, setNewWebhook] = useState({
    name: '',
    url: '',
    events: [] as string[]
  });
  
  const availableEvents = [
    'content.created',
    'content.published',
    'content.updated',
    'campaign.started',
    'campaign.completed',
    'user.registered',
    'integration.connected'
  ];
  
  const handleCreateWebhook = () => {
    const webhook: WebhookConfig = {
      id: Date.now().toString(),
      name: newWebhook.name,
      url: newWebhook.url,
      events: newWebhook.events,
      status: 'active',
      createdAt: new Date().toISOString()
    };
    
    setWebhooks([...webhooks, webhook]);
    setNewWebhook({ name: '', url: '', events: [] });
    setShowCreateForm(false);
  };
  
  const handleDeleteWebhook = (webhookId: string) => {
    setWebhooks(webhooks.filter(w => w.id !== webhookId));
  };
  
  const handleToggleEvent = (event: string) => {
    setNewWebhook(prev => ({
      ...prev,
      events: prev.events.includes(event)
        ? prev.events.filter(e => e !== event)
        : [...prev.events, event]
    }));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Webhooks</h3>
          <p className="text-sm text-muted-foreground">
            Configure webhook endpoints for real-time notifications
          </p>
        </div>
        <Button size="sm" onClick={() => setShowCreateForm(true)}>
          <Plus className="h-4 w-4 mr-1" />
          Add Webhook
        </Button>
      </div>
      
      {showCreateForm && (
        <Card className="border-blue-200">
          <CardContent className="p-4">
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Webhook Name</Label>
                  <Input
                    value={newWebhook.name}
                    onChange={(e) => setNewWebhook(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter webhook name"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Endpoint URL</Label>
                  <Input
                    value={newWebhook.url}
                    onChange={(e) => setNewWebhook(prev => ({ ...prev, url: e.target.value }))}
                    placeholder="https://your-domain.com/webhook"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Events</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {availableEvents.map((event) => (
                    <div key={event} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={event}
                        checked={newWebhook.events.includes(event)}
                        onChange={() => handleToggleEvent(event)}
                        className="rounded border-gray-300"
                      />
                      <Label htmlFor={event} className="text-sm">{event}</Label>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button 
                  onClick={handleCreateWebhook}
                  disabled={!newWebhook.name || !newWebhook.url || newWebhook.events.length === 0}
                >
                  Create Webhook
                </Button>
                <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      <div className="space-y-3">
        {webhooks.map((webhook) => (
          <Card key={webhook.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{webhook.name}</span>
                    <Badge 
                      variant={webhook.status === 'active' ? 'default' : 'secondary'}
                      className={cn(
                        webhook.status === 'active' && 'bg-green-100 text-green-800',
                        webhook.status === 'error' && 'bg-red-100 text-red-800'
                      )}
                    >
                      {webhook.status === 'active' && <Check className="h-3 w-3 mr-1" />}
                      {webhook.status === 'error' && <AlertCircle className="h-3 w-3 mr-1" />}
                      {webhook.status}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <code className="bg-muted px-2 py-1 rounded text-sm">{webhook.url}</code>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(webhook.url, '_blank')}
                      className="h-6 w-6 p-0"
                    >
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                  </div>
                  
                  <div className="flex flex-wrap gap-1">
                    {webhook.events.map((event) => (
                      <Badge key={event} variant="outline" className="text-xs">
                        {event}
                      </Badge>
                    ))}
                  </div>
                  
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>Created: {new Date(webhook.createdAt).toLocaleDateString()}</span>
                    {webhook.lastTriggered && (
                      <span>Last triggered: {new Date(webhook.lastTriggered).toLocaleDateString()}</span>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    Test
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteWebhook(webhook.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// Main component
export default function IntegrationSettings() {
  const { state, hasPermission } = useSettings();
  
  const handleConnectPlatform = (platformId: string) => {
    // In production, this would initiate OAuth flow
    console.log('Connecting to platform:', platformId);
    alert(`Connecting to ${platformId}... (OAuth flow would start here)`);
  };
  
  const handleDisconnectPlatform = (platformId: string) => {
    console.log('Disconnecting from platform:', platformId);
    alert(`Disconnected from ${platformId}`);
  };
  
  const handleSyncPlatform = (platformId: string) => {
    console.log('Syncing platform:', platformId);
    alert(`Syncing ${platformId} data...`);
  };

  if (!hasPermission('manage_integrations')) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          You don't have permission to manage integrations. Please contact an administrator.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-8">
      {/* Social Media Platforms */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Link2 className="h-5 w-5" />
            Social Media Platforms
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {SOCIAL_PLATFORMS.map((platform) => (
              <SocialPlatformCard
                key={platform.id}
                platform={platform}
                onConnect={handleConnectPlatform}
                onDisconnect={handleDisconnectPlatform}
                onSync={handleSyncPlatform}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* API Keys */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            API Keys & Tokens
          </CardTitle>
        </CardHeader>
        <CardContent>
          <APIKeyManager />
        </CardContent>
      </Card>

      {/* Webhooks */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Webhook className="h-5 w-5" />
            Webhooks
          </CardTitle>
        </CardHeader>
        <CardContent>
          <WebhookManager />
        </CardContent>
      </Card>

      {/* Integration Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Integration Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-green-600 mb-1">
                {SOCIAL_PLATFORMS.filter(p => p.isConnected).length}
              </div>
              <div className="text-sm text-muted-foreground">Connected Platforms</div>
            </div>
            
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-blue-600 mb-1">
                2
              </div>
              <div className="text-sm text-muted-foreground">Active API Keys</div>
            </div>
            
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-purple-600 mb-1">
                1
              </div>
              <div className="text-sm text-muted-foreground">Active Webhooks</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}