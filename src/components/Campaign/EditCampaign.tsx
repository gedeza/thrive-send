'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';
import { CampaignStatus } from '@prisma/client';
import { useOrganization } from '@clerk/nextjs';

interface Client {
  id: string;
  name: string;
  status: string;
}

interface EditCampaignProps {
  campaignId: string;
  initialData?: any;
  onSave?: (data: any) => void;
  onCancel?: () => void;
}

export default function EditCampaign({ 
  campaignId, 
  initialData, 
  onSave, 
  onCancel 
}: EditCampaignProps) {
  const { organization } = useOrganization();
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    description: initialData?.description || '',
    status: initialData?.status || 'DRAFT',
    clientId: initialData?.clientId || '',
    ...initialData
  });
  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoadingClients, setIsLoadingClients] = useState(false);

  // Fetch clients for the organization
  useEffect(() => {
    const fetchClients = async () => {
      if (!organization?.id) return;
      
      setIsLoadingClients(true);
      try {
        const response = await fetch(`/api/clients?organizationId=${organization.id}&limit=100`);
        if (response.ok) {
          const data = await response.json();
          setClients(data.data || []);
        } else {
          console.error('Failed to fetch clients');
        }
      } catch (error) {
        console.error('Error fetching clients:', error);
      } finally {
        setIsLoadingClients(false);
      }
    };

    fetchClients();
  }, [organization?.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`/api/campaigns/${campaignId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          status: formData.status,
          clientId: formData.clientId && formData.clientId !== '' ? formData.clientId : null,
        }),
      });

      if (!response.ok) {
        let errorMessage = 'Failed to update campaign';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
          console.error('API Error Response:', errorData);
        } catch (parseError) {
          console.error('Failed to parse error response:', parseError);
          errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      const updatedCampaign = await response.json();
      
      toast({
        title: "Campaign Updated",
        description: "Campaign has been successfully updated.",
      });

      // Call onSave callback with the updated data
      onSave?.(updatedCampaign);
    } catch (error) {
      console.error('Error updating campaign:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update campaign. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Edit Campaign</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Campaign Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="Enter campaign name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Enter campaign description"
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="client">Client (Optional)</Label>
            <Select 
              value={formData.clientId || ''} 
              onValueChange={(value) => handleChange('clientId', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a client (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">No client selected</SelectItem>
                {isLoadingClients ? (
                  <SelectItem value="" disabled>
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Loading clients...
                    </div>
                  </SelectItem>
                ) : (
                  clients.map(client => (
                    <SelectItem key={client.id} value={client.id}>
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${
                          client.status === 'ACTIVE' ? 'bg-green-500' : 
                          client.status === 'INACTIVE' ? 'bg-gray-400' : 
                          'bg-yellow-500'
                        }`}></div>
                        <span>{client.name}</span>
                      </div>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select 
              value={formData.status} 
              onValueChange={(value) => handleChange('status', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="DRAFT">Draft</SelectItem>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="PAUSED">Paused</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
                <SelectItem value="ARCHIVED">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-4 pt-4">
            <Button 
              type="submit" 
              disabled={loading}
              className="flex-1"
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={onCancel}
              disabled={loading}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}