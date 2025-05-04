'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';

// Import lightweight components directly
import { 
  Box, 
  Typography, 
  Container, 
  Paper,
  Tabs,
  Tab,
  Button,
  CircularProgress,
  Divider
} from '@mui/material';

// Simple header component
const SimpleHeader = () => (
  <Box sx={{ mb: 3 }}>
    <Typography variant="h4" component="h1" gutterBottom>
      UI Components Demo
    </Typography>
    <Typography variant="body1" color="text.secondary" mb={2}>
      Explore essential UI components for the marketing platform
    </Typography>
  </Box>
);

// Lightweight loading component
const LoadingIndicator = () => (
  <Box sx={{ 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    height: '200px' 
  }}>
    <CircularProgress size={30} thickness={4} />
  </Box>
);

// Dynamically import the components with reduced loading UI
const DemoPage = dynamic(
  () => import('../../../pages/DemoPage'),
  {
    loading: () => <LoadingIndicator />,
    ssr: false
  }
);

const TabsComponentDemo = dynamic(
  () => import('../../../components/Tabs/Tabs'),
  {
    loading: () => <LoadingIndicator />,
    ssr: false
  }
);

const CreateCampaignDemo = dynamic(
  () => import('../../../components/CreateCampaign'),
  {
    loading: () => <LoadingIndicator />,
    ssr: false
  }
);

const ContentFormDemo = dynamic(
  () => import('../../../components/ContentForm'),
  {
    loading: () => <LoadingIndicator />,
    ssr: false
  }
);

export default function Demo() {
  const [tabIndex, setTabIndex] = useState(0);
  
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabIndex(newValue);
  };
  
  // Simple tab content renderer with minimal overhead
  const renderTabContent = () => {
    switch(tabIndex) {
      case 0:
        return (
          <Box>
            <Typography variant="h5" gutterBottom>All Components</Typography>
            <Typography variant="body2" paragraph>
              This view demonstrates all components together in a cohesive interface.
            </Typography>
            <DemoPage />
          </Box>
        );
      case 1:
        // Simple demo tabs
        const tabItems = [
          { label: "First Tab", content: <Box p={2}>Content for the first tab</Box> },
          { label: "Second Tab", content: <Box p={2}>Content for the second tab</Box> },
          { label: "Third Tab", content: <Box p={2}>Content for the third tab</Box> },
        ];
        return (
          <Box>
            <Typography variant="h5" gutterBottom>Tabs Component</Typography>
            <Typography variant="body2" paragraph>
              A flexible tabs component that works in both horizontal and vertical orientations.
            </Typography>
            <Paper sx={{ p: 2, mb: 3 }}>
              <TabsComponentDemo tabs={tabItems} />
            </Paper>
          </Box>
        );
      case 2:
        return (
          <Box>
            <Typography variant="h5" gutterBottom>Create Campaign</Typography>
            <Typography variant="body2" paragraph>
              Form for creating marketing campaigns with validation.
            </Typography>
            <CreateCampaignDemo />
          </Box>
        );
      case 3:
        return (
          <Box>
            <Typography variant="h5" gutterBottom>Content Form</Typography>
            <Typography variant="body2" paragraph>
              Content management form with media uploads and tagging.
            </Typography>
            <ContentFormDemo />
          </Box>
        );
      default:
        return <DemoPage />;
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <SimpleHeader />
      
      {/* Simple navigation with minimal styling */}
      <Paper sx={{ mb: 4 }}>
        <Tabs 
          value={tabIndex} 
          onChange={handleTabChange} 
          aria-label="component tabs"
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="All Components" />
          <Tab label="Tabs Component" />
          <Tab label="Create Campaign" />
          <Tab label="Content Form" />
        </Tabs>
      </Paper>
      
      {/* Main content area */}
      <Box sx={{ mb: 4 }}>
        {renderTabContent()}
      </Box>
      
      {/* Simple footer */}
      <Divider sx={{ my: 4 }} />
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2 }}>
        <Typography variant="body2" color="text.secondary">
          ThriveSend UI Components
        </Typography>
        <Button component={Link} href="/dashboard" variant="outlined" size="small">
          Back to Dashboard
        </Button>
      </Box>
    </Container>
  );
}
