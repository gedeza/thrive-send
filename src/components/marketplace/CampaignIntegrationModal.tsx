'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { 
  Calendar,
  Target,
  TrendingUp,
  Users,
  Clock,
  CheckCircle2,
  AlertCircle,
  Link,
  Unlink
} from 'lucide-react';
import { MARKETPLACE_CONSTANTS } from '@/constants/marketplace-text';

interface Campaign {
  id: string;
  name: string;
  status: 'draft' | 'active' | 'paused' | 'completed';
  startDate: string;
  endDate?: string;
  clientId: string;
  description?: string;
}

interface BoostPurchase {
  id: string;
  productName: string;
  clientId: string;
  clientName: string;
  expiresAt: string;
  status: 'active' | 'expired' | 'cancelled';
  performance?: {
    impressions: number;
    engagements: number;
    conversions: number;
    roi: number;
  };
}

interface CampaignIntegrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  boostPurchase: BoostPurchase | null;
  organizationId: string;
}

interface IntegrationSettings {
  applyToExistingContent: boolean;
  boostDuration: string;
  targetMetrics: {
    impressions?: number;
    engagements?: number;
    conversions?: number;
  };
  schedulingPreference: 'immediate' | 'scheduled' | 'campaign_aligned';
}

export function CampaignIntegrationModal({
  isOpen,
  onClose,
  boostPurchase,
  organizationId
}: CampaignIntegrationModalProps) {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>('');
  const [integrationSettings, setIntegrationSettings] = useState<IntegrationSettings>({
    applyToExistingContent: false,
    boostDuration: '30 days',
    targetMetrics: {},
    schedulingPreference: 'campaign_aligned'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingCampaigns, setIsFetchingCampaigns] = useState(false);

  // Fetch campaigns for the client when modal opens
  useEffect(() => {
    if (isOpen && boostPurchase?.clientId) {
      fetchCampaigns();
    }
  }, [isOpen, boostPurchase?.clientId]);

  const fetchCampaigns = async () => {
    if (!boostPurchase?.clientId) return;
    
    setIsFetchingCampaigns(true);
    try {
      const response = await fetch(
        `/api/campaigns?organizationId=${organizationId}&clientId=${boostPurchase.clientId}`
      );
      
      if (response.ok) {
        const data = await response.json();
        setCampaigns(data.campaigns || []);
      } else {
        console.error('Failed to fetch campaigns');
        toast.error('Failed to load campaigns');
      }
    } catch (error) {
      console.error('Error fetching campaigns:', error);
      toast.error('Error loading campaigns');
    } finally {
      setIsFetchingCampaigns(false);
    }
  };

  const handleIntegrate = async () => {
    if (!selectedCampaignId || !boostPurchase) {
      toast.error('Please select a campaign');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/marketplace/campaigns/integration', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          boostPurchaseId: boostPurchase.id,
          campaignId: selectedCampaignId,
          integrationSettings
        }),
      });

      if (response.ok) {
        const data = await response.json();
        toast.success('Boost successfully integrated with campaign!');
        onClose();
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Failed to integrate boost with campaign');
      }
    } catch (error) {
      console.error('Error integrating boost with campaign:', error);
      toast.error('Failed to integrate boost with campaign');
    } finally {
      setIsLoading(false);
    }
  };

  const selectedCampaign = campaigns.find(c => c.id === selectedCampaignId);
  const statusColor = {
    draft: 'bg-gray-100 text-gray-800',
    active: 'bg-green-100 text-green-800', 
    paused: 'bg-yellow-100 text-yellow-800',
    completed: 'bg-blue-100 text-blue-800'
  };

  if (!boostPurchase) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Link className="h-5 w-5 text-brand-primary" />
            {MARKETPLACE_CONSTANTS.HEADERS.INTEGRATE_CAMPAIGN}
          </DialogTitle>
          <DialogDescription>
            Link your boost purchase to an existing campaign to track performance and optimize results.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Boost Purchase Info */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base">Boost Purchase Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-neutral-600">Product:</span>
                <span className="font-medium">{boostPurchase.productName}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-neutral-600">Client:</span>
                <span className="font-medium">{boostPurchase.clientName}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-neutral-600">Status:</span>
                <Badge 
                  variant={boostPurchase.status === 'active' ? 'default' : 'secondary'}
                  className="text-xs"
                >
                  {boostPurchase.status}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-neutral-600">Expires:</span>
                <span className="text-sm">
                  {new Date(boostPurchase.expiresAt).toLocaleDateString()}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Campaign Selection */}
          <div className="space-y-3">
            <Label htmlFor="campaign-select" className="text-sm font-medium">
              Select Campaign
            </Label>
            <Select
              value={selectedCampaignId}
              onValueChange={setSelectedCampaignId}
              disabled={isFetchingCampaigns}
            >
              <SelectTrigger id="campaign-select">
                <SelectValue 
                  placeholder={
                    isFetchingCampaigns 
                      ? "Loading campaigns..." 
                      : "Choose a campaign to integrate with"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {campaigns.map((campaign) => (
                  <SelectItem key={campaign.id} value={campaign.id}>
                    <div className="flex items-center justify-between w-full">
                      <span>{campaign.name}</span>
                      <Badge 
                        className={`ml-2 text-xs ${statusColor[campaign.status]}`}
                        variant="secondary"
                      >
                        {campaign.status}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {campaigns.length === 0 && !isFetchingCampaigns && (
              <p className="text-sm text-neutral-500 flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                No campaigns found for this client. Create a campaign first to enable integration.
              </p>
            )}
          </div>

          {/* Selected Campaign Details */}
          {selectedCampaign && (
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-base">Campaign Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-neutral-600">Name:</span>
                  <span className="font-medium">{selectedCampaign.name}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-neutral-600">Status:</span>
                  <Badge className={`text-xs ${statusColor[selectedCampaign.status]}`}>
                    {selectedCampaign.status}
                  </Badge>
                </div>
                {selectedCampaign.startDate && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-neutral-600">Start Date:</span>
                    <span className="text-sm">
                      {new Date(selectedCampaign.startDate).toLocaleDateString()}
                    </span>
                  </div>
                )}
                {selectedCampaign.description && (
                  <div className="space-y-1">
                    <span className="text-sm text-neutral-600">Description:</span>
                    <p className="text-sm text-neutral-800">{selectedCampaign.description}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Integration Settings */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base">Integration Settings</CardTitle>
              <CardDescription>
                Configure how the boost will be applied to your campaign
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-sm font-medium">Apply to Existing Content</Label>
                  <p className="text-xs text-neutral-500">
                    Boost content that's already published in this campaign
                  </p>
                </div>
                <Switch
                  checked={integrationSettings.applyToExistingContent}
                  onCheckedChange={(checked) =>
                    setIntegrationSettings(prev => ({
                      ...prev,
                      applyToExistingContent: checked
                    }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Scheduling Preference</Label>
                <Select
                  value={integrationSettings.schedulingPreference}
                  onValueChange={(value: 'immediate' | 'scheduled' | 'campaign_aligned') =>
                    setIntegrationSettings(prev => ({
                      ...prev,
                      schedulingPreference: value
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="immediate">Start Immediately</SelectItem>
                    <SelectItem value="campaign_aligned">Align with Campaign Schedule</SelectItem>
                    <SelectItem value="scheduled">Custom Schedule</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-2">
                  <Label className="text-xs font-medium">Target Impressions</Label>
                  <Input
                    type="number"
                    placeholder="10,000"
                    value={integrationSettings.targetMetrics.impressions || ''}
                    onChange={(e) =>
                      setIntegrationSettings(prev => ({
                        ...prev,
                        targetMetrics: {
                          ...prev.targetMetrics,
                          impressions: parseInt(e.target.value) || undefined
                        }
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-medium">Target Engagements</Label>
                  <Input
                    type="number"
                    placeholder="500"
                    value={integrationSettings.targetMetrics.engagements || ''}
                    onChange={(e) =>
                      setIntegrationSettings(prev => ({
                        ...prev,
                        targetMetrics: {
                          ...prev.targetMetrics,
                          engagements: parseInt(e.target.value) || undefined
                        }
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-medium">Target Conversions</Label>
                  <Input
                    type="number"
                    placeholder="50"
                    value={integrationSettings.targetMetrics.conversions || ''}
                    onChange={(e) =>
                      setIntegrationSettings(prev => ({
                        ...prev,
                        targetMetrics: {
                          ...prev.targetMetrics,
                          conversions: parseInt(e.target.value) || undefined
                        }
                      }))
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <DialogFooter className="flex items-center justify-between">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleIntegrate}
            disabled={!selectedCampaignId || isLoading}
            className="bg-brand-primary hover:bg-brand-primary/90"
          >
            {isLoading ? 'Integrating...' : 'Integrate with Campaign'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}