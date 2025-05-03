import React from 'react';
import { Box, Container, Typography, Paper, Divider } from '@mui/material';
import Tabs, { TabItem } from '../components/Tabs/Tabs';
import CreateCampaign from '../components/CreateCampaign';
import ContentForm from '../components/ContentForm';

const DemoPage: React.FC = () => {
  // Demo content for the first tab
  const overviewContent = (
    <Box>
      <Typography variant="h6" gutterBottom>
        Welcome to the Marketing Dashboard
      </Typography>
      <Typography paragraph>
        This dashboard provides tools to create and manage your marketing campaigns,
        content, and analytics. Use the tabs above to navigate between different sections.
      </Typography>
      <Typography paragraph>
        <strong>Key Features:</strong>
      </Typography>
      <ul>
        <li>Create and manage marketing campaigns</li>
        <li>Develop content for various channels</li>
        <li>Track performance metrics</li>
        <li>Collaborate with team members</li>
      </ul>
    </Box>
  );

  // Define the tabs
  const tabs: TabItem[] = [
    {
      label: 'Overview',
      content: overviewContent,
    },
    {
      label: 'Create Campaign',
      content: <CreateCampaign />,
    },
    {
      label: 'Content Creation',
      content: <ContentForm />,
    },
    {
      label: 'Analytics',
      content: (
        <Box sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Analytics Dashboard
          </Typography>
          <Typography>
            Analytics functionality will be implemented in future updates.
          </Typography>
        </Box>
      ),
    },
    {
      label: 'Settings',
      content: (
        <Box sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Account Settings
          </Typography>
          <Typography>
            Settings functionality will be implemented in future updates.
          </Typography>
        </Box>
      ),
    },
  ];

  // Example of tabs with vertical orientation
  const verticalTabs: TabItem[] = [
    {
      label: 'Campaign Info',
      content: (
        <Box>
          <Typography variant="h6">Campaign Details</Typography>
          <Typography paragraph>
            View and edit basic campaign information.
          </Typography>
        </Box>
      ),
    },
    {
      label: 'Audience',
      content: (
        <Box>
          <Typography variant="h6">Target Audience</Typography>
          <Typography paragraph>
            Define and segment your target audience.
          </Typography>
        </Box>
      ),
    },
    {
      label: 'Budget',
      content: (
        <Box>
          <Typography variant="h6">Budget Management</Typography>
          <Typography paragraph>
            Plan and track your campaign budget.
          </Typography>
        </Box>
      ),
    },
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Marketing Platform Demo
      </Typography>
      
      <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h5" gutterBottom>
          Horizontal Tabs Example
        </Typography>
        <Tabs tabs={tabs} />
      </Paper>
      
      <Divider sx={{ my: 4 }} />
      
      <Paper elevation={2} sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Vertical Tabs Example
        </Typography>
        <Tabs 
          tabs={verticalTabs} 
          orientation="vertical" 
        />
      </Paper>
    </Container>
  );
};

export default DemoPage;