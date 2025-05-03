import React, { useState } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Paper, 
  Grid, 
  Divider, 
  Button,
  Card,
  CardContent,
  CardActions,
  Chip,
  useTheme,
  useMediaQuery
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EmailIcon from '@mui/icons-material/Email';
import SettingsIcon from '@mui/icons-material/Settings';
import BarChartIcon from '@mui/icons-material/BarChart';
import PeopleIcon from '@mui/icons-material/People';

import Tabs, { TabItem } from '../components/Tabs/Tabs';
import CreateCampaign from '../components/CreateCampaign';
import ContentForm from '../components/ContentForm';

// Demo overview content
const OverviewContent = () => (
  <Box sx={{ p: { xs: 2, sm: 3 } }}>
    <Typography variant="h5" gutterBottom fontWeight={600}>
      Marketing Platform Demo
    </Typography>
    
    <Typography variant="body1" paragraph>
      This demo showcases the key components of our Marketing Platform UI:
    </Typography>
    
    <Grid container spacing={3} sx={{ mt: 2 }}>
      <Grid item xs={12} sm={6} md={4}>
        <Card variant="outlined" sx={{ height: '100%' }}>
          <CardContent>
            <Typography variant="h6" color="primary" gutterBottom>
              Enhanced Tabs
            </Typography>
            <Typography variant="body2">
              Fully responsive tabs that work in both horizontal and vertical orientations.
              Supports badges, icons, and animations.
            </Typography>
          </CardContent>
          <CardActions>
            <Button size="small">Learn More</Button>
          </CardActions>
        </Card>
      </Grid>
      
      <Grid item xs={12} sm={6} md={4}>
        <Card variant="outlined" sx={{ height: '100%' }}>
          <CardContent>
            <Typography variant="h6" color="primary" gutterBottom>
              Campaign Creation
            </Typography>
            <Typography variant="body2">
              Comprehensive form for creating marketing campaigns with validation and audience selection.
            </Typography>
          </CardContent>
          <CardActions>
            <Button size="small">Learn More</Button>
          </CardActions>
        </Card>
      </Grid>
      
      <Grid item xs={12} sm={6} md={4}>
        <Card variant="outlined" sx={{ height: '100%' }}>
          <CardContent>
            <Typography variant="h6" color="primary" gutterBottom>
              Content Management
            </Typography>
            <Typography variant="body2">
              Rich content editor with tagging and media uploads for creating engaging email content.
            </Typography>
          </CardContent>
          <CardActions>
            <Button size="small">Learn More</Button>
          </CardActions>
        </Card>
      </Grid>
    </Grid>
    
    <Box sx={{ mt: 4 }}>
      <Typography variant="h6" gutterBottom>
        Recent Activity
      </Typography>
      
      <Box sx={{ pl: 2, borderLeft: '4px solid', borderColor: 'primary.main' }}>
        <Typography variant="body2" color="text.secondary" paragraph>
          <strong>Campaign Created:</strong> Summer Sale Announcement - 2 hours ago
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          <strong>Content Updated:</strong> Monthly Newsletter - 5 hours ago
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          <strong>Campaign Sent:</strong> Product Launch - Yesterday
        </Typography>
      </Box>
    </Box>
  </Box>
);

// Demo analytics content
const AnalyticsContent = () => (
  <Box sx={{ p: { xs: 2, sm: 3 } }}>
    <Typography variant="h5" gutterBottom fontWeight={600}>
      Analytics Dashboard
    </Typography>
    
    <Typography variant="body1" paragraph>
      Analytics functionality will be implemented in future updates.
    </Typography>
    
    <Paper 
      variant="outlined" 
      sx={{ 
        p: 3, 
        textAlign: 'center',
        bgcolor: 'action.hover'
      }}
    >
      <BarChartIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
      <Typography variant="h6" gutterBottom>
        Analytics Coming Soon
      </Typography>
      <Typography variant="body2" color="text.secondary">
        This section will contain charts and data visualizations for campaign performance.
      </Typography>
    </Paper>
  </Box>
);

// Demo settings content
const SettingsContent = () => (
  <Box sx={{ p: { xs: 2, sm: 3 } }}>
    <Typography variant="h5" gutterBottom fontWeight={600}>
      Account Settings
    </Typography>
    
    <Typography variant="body1" paragraph>
      Settings functionality will be implemented in future updates.
    </Typography>
    
    <Paper 
      variant="outlined" 
      sx={{ 
        p: 3, 
        textAlign: 'center',
        bgcolor: 'action.hover'
      }}
    >
      <SettingsIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
      <Typography variant="h6" gutterBottom>
        Settings Coming Soon
      </Typography>
      <Typography variant="body2" color="text.secondary">
        This section will contain account and application settings.
      </Typography>
    </Paper>
  </Box>
);

// Demo audience content
const AudienceContent = () => (
  <Box sx={{ p: { xs: 2, sm: 3 } }}>
    <Typography variant="h5" gutterBottom fontWeight={600}>
      Audience Management
    </Typography>
    
    <Typography variant="body1" paragraph>
      Audience management functionality will be implemented in future updates.
    </Typography>
    
    <Paper 
      variant="outlined" 
      sx={{ 
        p: 3, 
        textAlign: 'center',
        bgcolor: 'action.hover'
      }}
    >
      <PeopleIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
      <Typography variant="h6" gutterBottom>
        Audience Management Coming Soon
      </Typography>
      <Typography variant="body2" color="text.secondary">
        This section will allow you to manage your subscribers and audience segments.
      </Typography>
    </Paper>
  </Box>
);

const DemoPage: React.FC = () => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));
  const [activeTab, setActiveTab] = useState(0);
  
  // Handler for tab changes
  const handleTabChange = (index: number) => {
    setActiveTab(index);
  };
  
  // Define the main horizontal tabs
  const mainTabs: TabItem[] = [
    {
      label: "Overview",
      content: <OverviewContent />,
      icon: <EmailIcon fontSize="small" sx={{ mr: 0.5 }} />,
    },
    {
      label: "Create Campaign",
      content: <CreateCampaign />,
      icon: <AddIcon fontSize="small" sx={{ mr: 0.5 }} />,
    },
    {
      label: "Create Content",
      content: <ContentForm />,
    },
    {
      label: "Analytics",
      content: <AnalyticsContent />,
      badge: "New",
    },
    {
      label: "Audience",
      content: <AudienceContent />,
    }
  ];
  
  // Example of vertical tabs for campaign detail view
  const campaignDetailTabs: TabItem[] = [
    {
      label: "Campaign Details",
      content: (
        <Box sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>Campaign Information</Typography>
          <Typography variant="body2" paragraph>
            This tab would show detailed information about the selected campaign.
          </Typography>
          <Box sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2">Campaign Name</Typography>
                <Typography variant="body2" sx={{ mb: 2 }}>Summer Sale Promotion</Typography>
                
                <Typography variant="subtitle2">Status</Typography>
                <Chip size="small" label="Active" color="success" sx={{ mb: 2 }} />
                
                <Typography variant="subtitle2">Created On</Typography>
                <Typography variant="body2" sx={{ mb: 2 }}>June 15, 2023</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2">Audience</Typography>
                <Typography variant="body2" sx={{ mb: 2 }}>All Subscribers</Typography>
                
                <Typography variant="subtitle2">Sent</Typography>
                <Typography variant="body2" sx={{ mb: 2 }}>5,432</Typography>
                
                <Typography variant="subtitle2">Schedule</Typography>
                <Typography variant="body2" sx={{ mb: 2 }}>One-time send</Typography>
              </Grid>
            </Grid>
          </Box>
        </Box>
      )
    },
    {
      label: "Performance",
      content: (
        <Box sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>Performance Metrics</Typography>
          <Typography variant="body2" paragraph>
            This tab would show performance metrics for the campaign.
          </Typography>
          
          <Grid container spacing={2} sx={{ mt: 2 }}>
            <Grid item xs={6} md={3}>
              <Paper variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="h5" color="primary">45.2%</Typography>
                <Typography variant="body2" color="text.secondary">Open Rate</Typography>
              </Paper>
            </Grid>
            <Grid item xs={6} md={3}>
              <Paper variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="h5" color="primary">12.8%</Typography>
                <Typography variant="body2" color="text.secondary">Click Rate</Typography>
              </Paper>
            </Grid>
            <Grid item xs={6} md={3}>
              <Paper variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="h5" color="error">0.9%</Typography>
                <Typography variant="body2" color="text.secondary">Bounce Rate</Typography>
              </Paper>
            </Grid>
            <Grid item xs={6} md={3}>
              <Paper variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="h5" color="primary">$1,245</Typography>
                <Typography variant="body2" color="text.secondary">Revenue</Typography>
              </Paper>
            </Grid>
          </Grid>
        </Box>
      )
    },
    {
      label: "Recipients",
      content: (
        <Box sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>Recipients List</Typography>
          <Typography variant="body2" paragraph>
            This tab would show the list of recipients and their engagement status.
          </Typography>
        </Box>
      )
    },
    {
      label: "Settings",
      content: (
        <Box sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>Campaign Settings</Typography>
          <Typography variant="body2" paragraph>
            This tab would allow editing of campaign settings.
          </Typography>
        </Box>
      )
    },
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Page header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" fontWeight={700} gutterBottom>
          Marketing Platform UI
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Explore the components and functionality of our marketing platform.
        </Typography>
      </Box>
      
      {/* Main tabs section */}
      <Paper elevation={2} sx={{ mb: 4 }}>
        <Tabs 
          tabs={mainTabs} 
          defaultTab={activeTab}
          onChange={handleTabChange}
          variant="scrollable"
          showAnimation={true}
          color="primary"
          ariaLabel="marketing platform sections"
        />
      </Paper>
      
      <Divider sx={{ my: 4 }} />
      
      {/* Vertical tabs example */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" gutterBottom fontWeight={600}>
          Vertical Tabs Example - Campaign Detail View
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          An example of how tabs can be used in vertical orientation for detailed views.
        </Typography>
        
        <Paper elevation={2} sx={{ mt: 2 }}>
          <Tabs 
            tabs={campaignDetailTabs} 
            orientation={isSmallScreen ? "horizontal" : "vertical"}
            variant={isSmallScreen ? "scrollable" : "standard"}
            showAnimation={true}
            color="primary"
            ariaLabel="campaign details sections"
          />
        </Paper>
      </Box>
      
      {/* Additional examples section */}
      <Box sx={{ mt: 5 }}>
        <Typography variant="h5" gutterBottom fontWeight={600}>
          Next Steps
        </Typography>
        
        <Typography variant="body2" paragraph>
          Now that you've seen the core components in action, here are some suggested next steps:
        </Typography>
        
        <Grid container spacing={2} sx={{ mt: 2 }}>
          <Grid item xs={12} md={4}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" color="primary" gutterBottom>
                  Add Analytics Dashboard
                </Typography>
                <Typography variant="body2">
                  Implement data visualization components for campaign analytics and reporting.
                </Typography>
              </CardContent>
              <CardActions>
                <Button size="small" variant="outlined">Start Implementation</Button>
              </CardActions>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" color="primary" gutterBottom>
                  Implement User Management
                </Typography>
                <Typography variant="body2">
                  Build user authentication, roles and permissions for team collaboration.
                </Typography>
              </CardContent>
              <CardActions>
                <Button size="small" variant="outlined">Start Implementation</Button>
              </CardActions>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" color="primary" gutterBottom>
                  Enable Template Library
                </Typography>
                <Typography variant="body2">
                  Add a template system for reusable email templates and campaign designs.
                </Typography>
              </CardContent>
              <CardActions>
                <Button size="small" variant="outlined">Start Implementation</Button>
              </CardActions>
            </Card>
          </Grid>
        </Grid>
      </Box>
      
      {/* Code Sample Section */}
      <Box sx={{ mt: 5, mb: 3 }}>
        <Typography variant="h5" gutterBottom fontWeight={600}>
          Implementation Guide
        </Typography>
        
        <Typography variant="body2" paragraph>
          To add this demo page to your application, follow these steps:
        </Typography>
        
        <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
          <Typography variant="body2" component="pre" sx={{ 
            fontFamily: 'monospace',
            whiteSpace: 'pre-wrap',
            overflowX: 'auto'
          }}>
{`// 1. Import the components
import Tabs from '../components/Tabs/Tabs';
import CreateCampaign from '../components/CreateCampaign';
import ContentForm from '../components/ContentForm';

// 2. Add the DemoPage to your router
// In your router configuration:
{
  path: '/demo',
  element: <DemoPage />
}

// 3. Link to the demo page from your navigation
<Button component={Link} to="/demo">
  View Demo
</Button>`}
          </Typography>
        </Paper>
      </Box>
    </Container>
  );
};

export default DemoPage;
