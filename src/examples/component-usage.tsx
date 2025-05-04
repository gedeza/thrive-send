/**
 * Component Usage Examples
 * 
 * This file demonstrates how to correctly use the ThriveSend components
 * according to the documentation. Copy and adapt these examples when
 * implementing components in your application.
 */

import React from 'react';
import { ROUTES } from '@/lib/routes';

// Dynamic imports for larger components
import dynamic from 'next/dynamic';
import { CircularProgress } from '@mui/material';

// Example of correctly importing and using the Tabs component
import Tabs, { TabItem } from '@/components/Tabs/Tabs';

// Example of dynamically importing components
const CreateCampaign = dynamic(() => import('@/components/CreateCampaign'), {
  loading: () => <CircularProgress size={24} />,
  ssr: false
});

const ContentForm = dynamic(() => import('@/components/ContentForm'), {
  loading: () => <CircularProgress size={24} />,
  ssr: false
});

// Example component demonstrating correct usage
export default function ComponentExamples() {
  // Example tabs as per documentation
  const exampleTabs: TabItem[] = [
    { 
      label: "Overview", 
      content: <div>Overview content here</div>,
      icon: <span>📊</span> // Replace with proper icon
    },
    { 
      label: "Analytics", 
      content: <div>Analytics content here</div>,
      badge: "New"
    }
  ];

  return (
    <div className="p-6 space-y-8">
      <h1 className="text-2xl font-bold">Component Usage Examples</h1>
      
      <section>
        <h2 className="text-xl font-semibold mb-4">Tabs Component</h2>
        <p className="mb-4">Use the Tabs component as shown below:</p>
        
        <div className="border p-4 rounded-md">
          <Tabs 
            tabs={exampleTabs}
            orientation="horizontal"
            variant="scrollable"
            color="primary"
          />
        </div>
      </section>
      
      <section>
        <h2 className="text-xl font-semibold mb-4">Create Campaign Component</h2>
        <p className="mb-4">Use the CreateCampaign component as shown below:</p>
        
        <div className="border p-4 rounded-md">
          <CreateCampaign />
        </div>
      </section>
      
      <section>
        <h2 className="text-xl font-semibold mb-4">Content Form Component</h2>
        <p className="mb-4">Use the ContentForm component as shown below:</p>
        
        <div className="border p-4 rounded-md">
          <ContentForm />
        </div>
      </section>
      
      <section>
        <h2 className="text-xl font-semibold mb-4">Routing Best Practices</h2>
        <p className="mb-4">Always use the centralized ROUTES for navigation:</p>
        
        <div className="border p-4 rounded-md">
          <pre className="bg-gray-100 p-2 rounded text-sm">
{`// Correct usage
import { ROUTES } from '@/lib/routes';

// In your component
<Link href={ROUTES.DASHBOARD}>Dashboard</Link>
<Link href={ROUTES.CALENDAR}>Calendar</Link>

// For dynamic routes
<Link href={ROUTES.CLIENT_DETAILS('123')}>Client Details</Link>`}
          </pre>
        </div>
      </section>
    </div>
  );
}