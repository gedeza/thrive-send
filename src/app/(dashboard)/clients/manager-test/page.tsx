"use client"

import React from "react";
import { ClientsManager } from '@/components/clients/ClientsManager';

export default function ClientsManagerTestPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">ClientsManager Component Test</h1>
        <p className="text-muted-foreground">
          Testing the new unified ClientsManager component implementation.
        </p>
      </div>

      {/* Full Mode Test */}
      <div className="mb-12">
        <h2 className="text-xl font-semibold mb-4">Full Mode</h2>
        <ClientsManager 
          mode="full"
          showMetrics={true}
          showRankings={true}
          showFilters={true}
          headerText="Client Management Dashboard"
        />
      </div>

      {/* Embedded Mode Test */}
      <div className="mb-12">
        <h2 className="text-xl font-semibold mb-4">Embedded Mode</h2>
        <ClientsManager 
          mode="embedded"
          maxClients={6}
          showMetrics={true}
          showRankings={false}
          showFilters={false}
          headerText="Quick Client Access"
        />
      </div>
    </div>
  );
}