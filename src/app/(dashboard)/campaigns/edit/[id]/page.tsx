"use client";

import { useRouter } from "next/navigation";
import { CampaignForm } from "../CampaignForm";
import { campaigns } from "../campaigns.mock-data";
import React, { useState } from "react";
import { notFound } from "next/navigation";

// Simple find by id (replace with API in real app)
function getCampaignById(id: string) {
  return campaigns.find(c => c.id === id);
}

export default function CampaignEditPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const campaign = getCampaignById(params.id);
  const [submitting, setSubmitting] = useState(false);

  if (!campaign) return notFound();

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: 24 }}>
      <CampaignForm
        initialData={campaign}
        onSubmit={async (values) => {
          setSubmitting(true);
          // Simulate save
          await new Promise(res => setTimeout(res, 1200));
          // In a real app, update the mock or database here
          setSubmitting(false);
          router.push("/campaigns"); // After save, go back to list
        }}
        submitting={submitting}
        submitLabel="Save Changes"
      />
    </div>
  );
}