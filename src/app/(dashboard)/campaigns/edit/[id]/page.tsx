"use client";

import { useRouter, notFound } from "next/navigation";
import React, { useState } from "react";

// This page previously used CampaignForm and campaigns.mock-data, which are now removed.
// You should implement your own form or API integration here.

export default function CampaignEditPage({ params }: { params: { id: string } }) {
  // Placeholder: always show notFound for now
  return notFound();
}