'use client';

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useServiceProvider } from '@/context/ServiceProviderContext';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from '@/components/ui/use-toast';
import { Users, Target, Loader2, CheckCircle } from 'lucide-react';
import { SegmentBuilder } from './SegmentBuilder';

interface SharedSegmentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingSegment?: SharedSegment | null;
}

interface SharedSegment {
  id: string;
  name: string;
  description: string;
  type: string;
  targetingRules: any[];
  audiences: Array<{
    id: string;
    name: string;
    type: string;
  }>;
}

interface Audience {
  id: string;
  name: string;
  type: string;
  size: number;
  status: string;
}

interface SegmentFormData {
  name: string;
  description?: string;
  type: 'DEMOGRAPHIC' | 'BEHAVIORAL' | 'CUSTOM' | 'LOOKALIKE';
  conditions: Array<{
    field: string;
    operator: string;
    value: string | number | string[];
    logic?: 'AND' | 'OR';
  }>;
  isDynamic: boolean;
}

async function fetchAudiences(organizationId: string): Promise<Audience[]> {
  const response = await fetch(`/api/service-provider/audiences?organizationId=${organizationId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch audiences');
  }
  return response.json();
}

async function createSharedSegment(data: {
  name: string;
  description?: string;
  type: string;
  organizationId: string;
  targetingRules: any[];
  audienceIds: string[];
}) {
  const response = await fetch('/api/service-provider/audiences/shared-segments', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to create shared segment');
  }

  return response.json();
}

export function SharedSegmentModal({ open, onOpenChange, editingSegment }: SharedSegmentModalProps) {
  const { state: { organizationId } } = useServiceProvider();
  const queryClient = useQueryClient();
  const [currentStep, setCurrentStep] = useState<'builder' | 'audiences'>('builder');
  const [segmentData, setSegmentData] = useState<SegmentFormData | null>(null);
  const [selectedAudiences, setSelectedAudiences] = useState<string[]>([]);

  console.log('SharedSegmentModal render:', { open, organizationId });

  // Reset state when modal opens/closes
  useEffect(() => {
    if (open) {
      setCurrentStep('builder');
      setSegmentData(null);
      setSelectedAudiences([]);

      // If editing, populate with existing data
      if (editingSegment) {
        setSegmentData({
          name: editingSegment.name,
          description: editingSegment.description,
          type: editingSegment.type as any,
          conditions: editingSegment.targetingRules.map(rule => ({
            field: rule.type || 'age',
            operator: rule.operator || 'equals',
            value: rule.value || '',
            logic: 'AND' as const,
          })),
          isDynamic: true,
        });
        setSelectedAudiences(editingSegment.audiences.map(a => a.id));
      }
    }
  }, [open, editingSegment]);

  // Fetch available audiences
  const { data: audiences = [], isLoading: audiencesLoading } = useQuery({
    queryKey: ['audiences', organizationId],
    queryFn: () => fetchAudiences(organizationId!),
    enabled: !!organizationId && open,
  });

  // Create shared segment mutation
  const createMutation = useMutation({
    mutationFn: createSharedSegment,
    onSuccess: () => {
      toast({
        title: 'Success!',
        description: 'Shared segment created successfully',
      });
      queryClient.invalidateQueries({ queryKey: ['shared-segments'] });
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleSegmentSave = (data: SegmentFormData) => {
    setSegmentData(data);
    setCurrentStep('audiences');
  };

  const handleCreateSharedSegment = () => {
    if (!segmentData || !organizationId || selectedAudiences.length === 0) {
      toast({
        title: 'Missing Information',
        description: 'Please complete the segment configuration and select at least one audience',
        variant: 'destructive',
      });
      return;
    }

    createMutation.mutate({
      name: segmentData.name,
      description: segmentData.description,
      type: segmentData.type,
      organizationId,
      targetingRules: segmentData.conditions.map(condition => ({
        type: condition.field,
        operator: condition.operator,
        value: condition.value,
        field: condition.field,
        conditions: {
          type: condition.field,
          field: condition.field,
          operator: condition.operator,
          value: condition.value,
        },
      })),
      audienceIds: selectedAudiences,
    });
  };

  const toggleAudience = (audienceId: string) => {
    setSelectedAudiences(prev =>
      prev.includes(audienceId)
        ? prev.filter(id => id !== audienceId)
        : [...prev, audienceId]
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            {editingSegment ? 'Edit Shared Segment' : 'Create Shared Segment'}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          {currentStep === 'builder' ? (
            <div className="h-full overflow-auto">
              <div className="max-h-[600px] overflow-y-auto pr-2">
                <SegmentBuilder
                  onSave={handleSegmentSave}
                  onCancel={() => onOpenChange(false)}
                  initialData={segmentData || undefined}
                />
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Segment Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-success" />
                    Segment Configuration Complete
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{segmentData?.type}</Badge>
                      <span className="font-medium">{segmentData?.name}</span>
                    </div>
                    {segmentData?.description && (
                      <p className="text-sm text-muted-foreground">{segmentData.description}</p>
                    )}
                    <div className="text-sm text-muted-foreground">
                      {segmentData?.conditions.length || 0} targeting conditions defined
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Audience Selection */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Select Audiences ({selectedAudiences.length} selected)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {audiencesLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin" />
                    </div>
                  ) : (
                    <ScrollArea className="h-64">
                      <div className="space-y-2">
                        {audiences.map(audience => (
                          <div
                            key={audience.id}
                            className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer"
                            onClick={() => toggleAudience(audience.id)}
                          >
                            <Checkbox
                              checked={selectedAudiences.includes(audience.id)}
                              onChange={() => toggleAudience(audience.id)}
                            />
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <Label className="font-medium cursor-pointer">
                                  {audience.name}
                                </Label>
                                <Badge variant="secondary" className="text-xs">
                                  {audience.type}
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                  {audience.size.toLocaleString()} contacts
                                </Badge>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  )}

                  {selectedAudiences.length === 0 && (
                    <div className="text-center py-4 text-muted-foreground">
                      Select at least one audience to apply this segment to
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Actions */}
              <div className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep('builder')}
                >
                  Back to Segment Builder
                </Button>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => onOpenChange(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCreateSharedSegment}
                    disabled={selectedAudiences.length === 0 || createMutation.isPending}
                  >
                    {createMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Target className="h-4 w-4 mr-2" />
                        Create Shared Segment
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}