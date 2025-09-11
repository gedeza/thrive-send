'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { toast } from '@/components/ui/use-toast';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { 
  CalendarIcon, 
  Loader2, 
  ArrowRight, 
  ArrowLeft, 
  Target, 
  Users,
  DollarSign,
  Settings,
  Check,
  Info,
  Lightbulb,
  Building,
  Globe
} from 'lucide-react';
import { useOrganization } from '@clerk/nextjs';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useRouter } from 'next/navigation';

// Types for multi-client campaigns
const multiClientCampaignSchema = z.object({
  name: z.string().min(1, 'Campaign name is required'),
  description: z.string().optional(),
  selectedClients: z.array(z.string()).min(1, 'Select at least one client'),
  channel: z.string().min(1, 'Channel is required'),
  goalType: z.string().min(1, 'Goal type is required'),
  budget: z.number().min(0, 'Budget must be positive'),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
});

type MultiClientCampaignForm = z.infer<typeof multiClientCampaignSchema>;

// Mock clients data - in real app, this would come from API
const mockClients = [
  { id: '1', name: 'City of Springfield', type: 'Government', status: 'Active', budget: 15000 },
  { id: '2', name: 'TechStart Inc.', type: 'Technology', status: 'Active', budget: 25000 },
  { id: '3', name: 'Local Coffee Co.', type: 'Retail', status: 'Active', budget: 8000 },
  { id: '4', name: 'Green Energy Solutions', type: 'Energy', status: 'Active', budget: 18000 },
  { id: '5', name: 'Metro Healthcare', type: 'Healthcare', status: 'Active', budget: 22000 },
  { id: '6', name: 'Downtown Restaurant Group', type: 'Food & Beverage', status: 'Active', budget: 12000 },
];

const channels = [
  { value: 'email', label: 'Email Marketing' },
  { value: 'social', label: 'Social Media' },
  { value: 'sms', label: 'SMS' },
  { value: 'multi', label: 'Multi-Channel' },
];

const goalTypes = [
  { value: 'awareness', label: 'Brand Awareness' },
  { value: 'engagement', label: 'Engagement' },
  { value: 'conversion', label: 'Conversion' },
  { value: 'retention', label: 'Customer Retention' },
];

export default function CreateMultiClientCampaign() {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { organization } = useOrganization();

  const form = useForm<MultiClientCampaignForm>({
    resolver: zodResolver(multiClientCampaignSchema),
    defaultValues: {
      name: '',
      description: '',
      selectedClients: [],
      channel: '',
      goalType: '',
      budget: 0,
    },
  });

  const selectedClients = form.watch('selectedClients') || [];
  const totalBudget = selectedClients.reduce((sum, clientId) => {
    const client = mockClients.find(c => c.id === clientId);
    return sum + (client?.budget || 0);
  }, 0);

  const onSubmit = async (data: MultiClientCampaignForm) => {
    setIsSubmitting(true);
    
    try {
      // Mock API call - replace with actual implementation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Multi-Client Campaign Created",
        description: `Campaign "${data.name}" has been created for ${data.selectedClients.length} clients.`,
      });
      
      router.push('/campaigns/multi-client');
    } catch (_error) {
      toast({
        title: "Error",
        description: "Failed to create multi-client campaign. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleClient = (clientId: string) => {
    const current = form.getValues('selectedClients');
    const updated = current.includes(clientId)
      ? current.filter(id => id !== clientId)
      : [...current, clientId];
    form.setValue('selectedClients', updated);
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5" />
                Campaign Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Campaign Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter campaign name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (Optional)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Describe your multi-client campaign..." 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="channel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Channel</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select channel" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {channels.map((channel) => (
                            <SelectItem key={channel.value} value={channel.value}>
                              {channel.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="goalType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Goal Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select goal" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {goalTypes.map((goal) => (
                            <SelectItem key={goal.value} value={goal.value}>
                              {goal.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>
        );

      case 2:
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Select Clients
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Choose which clients to include in this multi-client campaign:
                </p>
                
                <div className="grid gap-3">
                  {mockClients.map((client) => (
                    <div
                      key={client.id}
                      className={cn(
                        "flex items-center space-x-3 p-4 border rounded-lg cursor-pointer transition-colors",
                        selectedClients.includes(client.id)
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      )}
                      onClick={() => toggleClient(client.id)}
                    >
                      <Checkbox
                        checked={selectedClients.includes(client.id)}
                        onChange={() => toggleClient(client.id)}
                      />
                      <Building className="h-4 w-4 text-muted-foreground" />
                      <div className="flex-1">
                        <p className="font-medium">{client.name}</p>
                        <p className="text-sm text-muted-foreground">{client.type}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">${client.budget.toLocaleString()}</p>
                        <Badge variant="outline" className="text-xs">
                          {client.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>

                {selectedClients.length > 0 && (
                  <div className="mt-6 p-4 bg-muted rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Selected Clients:</span>
                      <Badge variant="secondary">{selectedClients.length}</Badge>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-sm text-muted-foreground">Combined Budget:</span>
                      <span className="font-medium">${totalBudget.toLocaleString()}</span>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        );

      case 3:
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Review & Launch
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4">
                <div>
                  <Label className="text-sm font-medium">Campaign Name</Label>
                  <p className="text-sm text-muted-foreground">{form.getValues('name') || 'Not specified'}</p>
                </div>
                
                <div>
                  <Label className="text-sm font-medium">Description</Label>
                  <p className="text-sm text-muted-foreground">
                    {form.getValues('description') || 'No description provided'}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Channel</Label>
                    <p className="text-sm text-muted-foreground">
                      {channels.find(c => c.value === form.getValues('channel'))?.label || 'Not selected'}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Goal Type</Label>
                    <p className="text-sm text-muted-foreground">
                      {goalTypes.find(g => g.value === form.getValues('goalType'))?.label || 'Not selected'}
                    </p>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium">Selected Clients ({selectedClients.length})</Label>
                  <div className="mt-2 space-y-2">
                    {selectedClients.map(clientId => {
                      const client = mockClients.find(c => c.id === clientId);
                      return client ? (
                        <div key={clientId} className="flex items-center justify-between text-sm">
                          <span>{client.name}</span>
                          <span className="text-muted-foreground">${client.budget.toLocaleString()}</span>
                        </div>
                      ) : null;
                    })}
                  </div>
                  <div className="mt-3 pt-3 border-t flex items-center justify-between font-medium">
                    <span>Total Budget:</span>
                    <span>${totalBudget.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 p-4 bg-blue-50 rounded-lg">
                <Lightbulb className="h-4 w-4 text-blue-600" />
                <p className="text-sm text-blue-800">
                  This campaign will be created across all selected clients with unified tracking and reporting.
                </p>
              </div>
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Progress Bar */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium">Step {step} of 3</span>
              <span className="text-sm text-muted-foreground">{Math.round((step / 3) * 100)}% Complete</span>
            </div>
            <Progress value={(step / 3) * 100} className="w-full" />
          </CardContent>
        </Card>

        {/* Current Step Content */}
        {renderStep()}

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => setStep(Math.max(1, step - 1))}
            disabled={step === 1}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>

          {step < 3 ? (
            <Button 
              type="button" 
              onClick={() => setStep(Math.min(3, step + 1))}
              disabled={
                (step === 1 && (!form.getValues('name') || !form.getValues('channel') || !form.getValues('goalType'))) ||
                (step === 2 && selectedClients.length === 0)
              }
            >
              Next
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button 
              type="submit" 
              disabled={isSubmitting || selectedClients.length === 0}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating Campaign...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Create Multi-Client Campaign
                </>
              )}
            </Button>
          )}
        </div>
      </form>
    </Form>
  );
}