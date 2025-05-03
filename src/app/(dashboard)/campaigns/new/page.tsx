"use client"

import { MainLayout } from "@/components/layout/main-layout";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import CreateCampaign from "@/components/CreateCampaign";

export default function NewCampaignPage() {

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Link href="/dashboard" className="flex items-center text-muted-foreground hover:text-foreground">
            <ChevronLeft className="h-4 w-4" />
            <span>Back to Dashboard</span>
          </Link>
        </div>
        
        <div>
          <h1 className="text-3xl font-bold">Create New Campaign</h1>
          <p className="text-muted-foreground">
            Set up your campaign details and schedule content.
          </p>
        </div>

        <CreateCampaign />
      </div>
    </MainLayout>
  );
}
