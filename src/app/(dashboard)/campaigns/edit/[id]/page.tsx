"use client";

import { useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { ChevronLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import EditCampaign from '@/components/Campaign/EditCampaign';
import DeleteCampaign from '@/components/Campaign/DeleteCampaign';

// For now, let's implement a simple placeholder that doesn't return 404
export default function CampaignEditPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [campaign, setCampaign] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    async function fetchCampaign() {
      try {
        // Fetch campaign data
        const response = await fetch(`/api/campaigns/${params.id}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            toast({
              title: "Campaign Not Found",
              description: "The campaign you're trying to edit doesn't exist.",
              variant: "destructive",
            });
            router.push('/campaigns');
            return;
          }
          
          toast({
            title: "Error",
            description: "Failed to load campaign data. Please try again later.",
            variant: "destructive",
          });
          return;
        }
        
        const data = await response.json();
        setCampaign(data);
      } catch (_error) {
        console.error("", _error);
        toast({
          title: "Error",
          description: "Failed to load campaign data. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }
    
    fetchCampaign();
  }, [params.id, router, toast]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center justify-between mb-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/campaigns">
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to Campaigns
          </Link>
        </Button>
        
        {campaign && (
          <DeleteCampaign
            campaignId={params.id}
            campaignName={campaign.name}
            buttonVariant="destructive"
            buttonSize="sm"
            onDeleteSuccess={() => router.push('/campaigns')}
          />
        )}
      </div>
      
      {campaign ? (
        <EditCampaign 
          campaignId={params.id} 
          initialData={campaign}
          onSave={() => {
            toast({
              title: "Success",
              description: "Campaign updated successfully. Redirecting...",
            });
            setTimeout(() => router.push('/campaigns'), 1000);
          }}
          onCancel={() => router.push('/campaigns')}
        />
      ) : (
        <div className="text-center p-8">
          <p className="text-lg text-muted-foreground">Campaign not found or you don't have permission to edit it.</p>
          <Button onClick={() => router.push('/campaigns')} className="mt-4">
            Return to Campaigns
          </Button>
        </div>
      )}
    </div>
  );
}