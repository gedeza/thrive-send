"use client";

import { useState, useEffect } from 'react';
import { useOrganization } from '@clerk/nextjs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert } from '@/components/ui/alert';
import { InfoIcon, Sparkles, Zap, Shield } from 'lucide-react';

const AI_PROVIDERS = [
  { id: 'ollama', name: 'Ollama', description: 'Local AI models' },
  { id: 'openai', name: 'OpenAI', description: 'GPT models' },
  { id: 'anthropic', name: 'Anthropic', description: 'Claude models' },
  { id: 'huggingface', name: 'Hugging Face', description: 'Open source models' },
];

const DEFAULT_MODELS = {
  ollama: ['llama2', 'mistral', 'codellama'],
  openai: ['gpt-4', 'gpt-3.5-turbo'],
  anthropic: ['claude-3-opus', 'claude-3-sonnet', 'claude-2'],
  huggingface: ['mistral-7b', 'llama-2-70b', 'falcon-180b'],
};

export default function AISettingsPage() {
  const { organization } = useOrganization();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState({
    provider: 'openai',
    model: 'gpt-3.5-turbo',
    apiKey: '',
    baseUrl: '',
    temperature: 0.7,
    maxTokens: 2000,
  });
  const [usage, setUsage] = useState({
    current: 0,
    limit: 0,
    enabled: false,
  });

  useEffect(() => {
    loadConfig();
  }, [organization?.id]);

  const loadConfig = async () => {
    try {
      const response = await fetch(`/api/settings/ai?organizationId=${organization?.id}`);
      if (!response.ok) throw new Error('Failed to load configuration');
      const data = await response.json();
      setConfig(data.config);
      setUsage(data.usage);
    } catch (error) {
      toast({
        title: 'Unable to load AI settings',
        description: 'Don\'t worry! You can still configure your settings.',
        variant: 'info',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/settings/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          organizationId: organization?.id,
          config,
        }),
      });

      if (!response.ok) throw new Error('Failed to save configuration');

      toast({
        title: 'Settings saved',
        description: 'Your AI configuration has been updated successfully.',
        variant: 'success',
      });
    } catch (error) {
      toast({
        title: 'Unable to save settings',
        description: 'Please try again later.',
        variant: 'info',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleProviderChange = (value: string) => {
    setConfig({
      ...config,
      provider: value,
      model: DEFAULT_MODELS[value as keyof typeof DEFAULT_MODELS][0],
      apiKey: '',
      baseUrl: value === 'ollama' ? 'http://localhost:11434' : '',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">AI Settings</h2>
          <p className="text-muted-foreground">
            Configure your AI provider and model settings
          </p>
        </div>
      </div>

      {!usage.enabled && (
        <Alert>
          <div className="flex items-start gap-2">
            <InfoIcon className="h-4 w-4 mt-0.5" />
            <div>
              <h4 className="font-medium mb-1">AI Features Not Available</h4>
              <p className="text-sm">
                Upgrade your plan to access AI features and enhance your content creation.
              </p>
            </div>
          </div>
        </Alert>
      )}

      {usage.enabled && (
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Usage</CardTitle>
              <CardDescription>Your current AI usage and limits</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Monthly Usage</Label>
                    <p className="text-sm text-muted-foreground">
                      {usage.current} / {usage.limit === -1 ? 'Unlimited' : usage.limit} generations
                    </p>
                  </div>
                  <Badge variant={usage.limit === -1 ? 'default' : 'secondary'}>
                    {usage.limit === -1 ? 'Unlimited' : `${Math.round((usage.current / usage.limit) * 100)}%`}
                  </Badge>
                </div>
                {usage.limit !== -1 && (
                  <Progress value={(usage.current / usage.limit) * 100} className="h-2" />
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Provider Settings</CardTitle>
              <CardDescription>Configure your AI provider and model</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label>AI Provider</Label>
                  <Select
                    value={config.provider}
                    onValueChange={handleProviderChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select provider" />
                    </SelectTrigger>
                    <SelectContent>
                      {AI_PROVIDERS.map((provider) => (
                        <SelectItem key={provider.id} value={provider.id}>
                          <div className="flex items-center gap-2">
                            {provider.name}
                            <span className="text-xs text-muted-foreground">
                              {provider.description}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Model</Label>
                  <Select
                    value={config.model}
                    onValueChange={(value) => setConfig({ ...config, model: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select model" />
                    </SelectTrigger>
                    <SelectContent>
                      {DEFAULT_MODELS[config.provider as keyof typeof DEFAULT_MODELS].map((model) => (
                        <SelectItem key={model} value={model}>
                          {model}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>API Key</Label>
                  <Input
                    type="password"
                    value={config.apiKey}
                    onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
                    placeholder="Enter your API key"
                  />
                </div>

                {config.provider === 'ollama' && (
                  <div className="space-y-2">
                    <Label>Base URL</Label>
                    <Input
                      value={config.baseUrl}
                      onChange={(e) => setConfig({ ...config, baseUrl: e.target.value })}
                      placeholder="http://localhost:11434"
                    />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Temperature</Label>
                    <Input
                      type="number"
                      min="0"
                      max="1"
                      step="0.1"
                      value={config.temperature}
                      onChange={(e) => setConfig({ ...config, temperature: parseFloat(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Max Tokens</Label>
                    <Input
                      type="number"
                      min="1"
                      value={config.maxTokens}
                      onChange={(e) => setConfig({ ...config, maxTokens: parseInt(e.target.value) })}
                    />
                  </div>
                </div>
              </div>

              <Button onClick={handleSave} disabled={saving}>
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Features</CardTitle>
              <CardDescription>Available AI features for your plan</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                <div className="flex items-start gap-4">
                  <Sparkles className="h-5 w-5 text-primary" />
                  <div>
                    <h4 className="font-medium">Content Generation</h4>
                    <p className="text-sm text-muted-foreground">
                      Generate high-quality content for your campaigns
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <Zap className="h-5 w-5 text-primary" />
                  <div>
                    <h4 className="font-medium">Smart Suggestions</h4>
                    <p className="text-sm text-muted-foreground">
                      Get AI-powered suggestions for your content
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <Shield className="h-5 w-5 text-primary" />
                  <div>
                    <h4 className="font-medium">Content Enhancement</h4>
                    <p className="text-sm text-muted-foreground">
                      Improve and optimize your existing content
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
} 