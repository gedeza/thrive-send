'use client';
import FeatureAnalyticsTab from "./FeatureAnalyticsTab";
import FeatureAudienceTab from "./FeatureAudienceTab";
import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
// Import Link from Next.js for client-side navigation without full page reloads
// This is the preferred way to handle internal navigation in Next.js applications
import Link from 'next/link';

// Import useRouter for programmatic navigation (when needed)
import { useRouter } from 'next/navigation';

import { 
  Container, 
  Typography, 
  Box, 
  Paper, 
  Grid, 
  Divider, 
  Card as MuiCard,
  CardContent as MuiCardContent,
  CardActions,
  Chip,
  useTheme,
  useMediaQuery,
  Button as MuiButton,
  Tabs as MuiTabs,
  Tab,
  CircularProgress
} from '@mui/material';

// Icons
import AddIcon from '@mui/icons-material/Add';
import EmailIcon from '@mui/icons-material/Email';
import SettingsIcon from '@mui/icons-material/Settings';
import BarChartIcon from '@mui/icons-material/BarChart';
import PeopleIcon from '@mui/icons-material/People';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import CodeIcon from '@mui/icons-material/Code';
import SearchIcon from '@mui/icons-material/Search';
import HomeIcon from '@mui/icons-material/Home';

// Custom UI components
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Input 
} from "@/components/ui/input";
import { 
  Button 
} from "@/components/ui/button";

// Dynamically import larger components for better performance
const CustomTabs = dynamic(() => import('@/components/Tabs/Tabs'), {
  loading: () => (
    <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
      <CircularProgress size={30} />
    </Box>
  ),
  ssr: false
});

const CreateCampaign = dynamic(() => import('@/components/CreateCampaign'), {
  loading: () => (
    <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
      <CircularProgress size={30} />
    </Box>
  ),
  ssr: false
});

const ContentForm = dynamic(() => import('@/components/ContentForm'), {
  loading: () => (
    <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
      <CircularProgress size={30} />
    </Box>
  ),
  ssr: false
});

// Component documentation data
const componentDocs = [
  {
    id: 'button',
    title: 'Button',
    description: 'Interactive button component with various styles and states.',
    usage: `<Button variant="default">Click me</Button>`,
    props: [
      { name: 'variant', type: 'string', default: 'default', description: 'Visual style of the button' },
      { name: 'size', type: 'string', default: 'default', description: 'Size of the button' },
      { name: 'disabled', type: 'boolean', default: 'false', description: 'Whether the button is disabled' }
    ],
    examples: [
      { title: 'Default', code: '<Button>Default Button</Button>' },
      { title: 'Primary', code: '<Button variant="primary">Primary Button</Button>' },
      { title: 'Outline', code: '<Button variant="outline">Outline Button</Button>' }
    ]
  },
  {
    id: 'card',
    title: 'Card',
    description: 'Container for related content and actions.',
    usage: `<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Card Description</CardDescription>
  </CardHeader>
  <CardContent>
    Card Content
  </CardContent>
</Card>`,
    props: [
      { name: 'className', type: 'string', default: '', description: 'Additional CSS classes' }
    ],
    examples: [
      { title: 'Basic Card', code: '<Card><CardContent>Simple Card</CardContent></Card>' },
      { title: 'With Header', code: '<Card><CardHeader><CardTitle>Title</CardTitle></CardHeader><CardContent>Content</CardContent></Card>' }
    ]
  },
  {
    id: 'tabs',
    title: 'Tabs',
    description: 'Switch between different views within the same context.',
    usage: `<Tabs defaultValue="tab1">
  <TabsList>
    <TabsTrigger value="tab1">Tab 1</TabsTrigger>
    <TabsTrigger value="tab2">Tab 2</TabsTrigger>
  </TabsList>
  <TabsContent value="tab1">Content 1</TabsContent>
  <TabsContent value="tab2">Content 2</TabsContent>
</Tabs>`,
    props: [
      { name: 'defaultValue', type: 'string', default: '', description: 'The initial active tab' },
      { name: 'value', type: 'string', default: '', description: 'Controlled value for active tab' },
      { name: 'onValueChange', type: 'function', default: '', description: 'Function called when tab changes' }
    ],
    examples: [
      { title: 'Basic Tabs', code: '<Tabs defaultValue="tab1"><TabsList><TabsTrigger value="tab1">Tab 1</TabsTrigger></TabsList><TabsContent value="tab1">Content</TabsContent></Tabs>' }
    ]
  }
];

// Demo overview content
const OverviewContent = () => (
  <div className="p-6 bg-neutral-background rounded-lg shadow">
    <h2 className="text-2xl font-semibold text-primary-600 mb-2">
      Marketing Platform Demo
    </h2>
    
    <p className="mb-4 text-neutral-text">
      This demo showcases the key components of our Marketing Platform UI:
    </p>
    
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mt-2">
      {/* Card 1: Uses Gradient */}
      <div className="bg-gradient-to-r from-primary-500 to-gradient-purple text-custom-white p-4 rounded-md shadow h-full flex flex-col">
        <h3 className="text-lg font-semibold mb-1">Enhanced Tabs</h3>
        <p className="mb-3 text-neutral-text-light flex-grow">
          Fully responsive tabs that work in both horizontal and vertical orientations.
          Supports badges, icons, and animations.
        </p>
        <button className="bg-primary-600 hover:bg-primary-700 text-custom-white px-4 py-2 rounded-md self-start">
          Learn More
        </button>
      </div>
      
      {/* Card 2: Secondary/Success */}
      <div className="bg-secondary-50 border border-secondary-200 p-4 rounded-md h-full flex flex-col">
        <h3 className="text-lg font-semibold mb-1 text-secondary-700">
          Campaign Creation
        </h3>
        <p className="mb-3 text-neutral-text-light flex-grow">
          Comprehensive form for creating marketing campaigns with validation and audience selection.
        </p>
        <button className="bg-secondary-500 hover:bg-secondary-600 text-custom-white px-4 py-2 rounded-md self-start">
          Learn More
        </button>
      </div>
      
      {/* Card 3: Accent/Warning */}
      <div className="bg-accent-50 border border-accent-200 p-4 rounded-md h-full flex flex-col">
        <h3 className="text-lg font-semibold mb-1 text-accent-700">
          Content Management
        </h3>
        <p className="mb-3 text-neutral-text-light flex-grow">
          Rich content editor with tagging and media uploads for creating engaging email content.
        </p>
        <button className="bg-accent-500 hover:bg-accent-600 text-custom-white px-4 py-2 rounded-md self-start">
          Learn More
        </button>
      </div>
    </div>
    
    <div className="mt-8">
      <h3 className="text-lg font-semibold mb-2">
        Recent Activity
      </h3>
      
      <div className="pl-4 border-l-4 border-primary-500">
        <p className="text-sm text-neutral-text-light mb-2">
          <strong>Campaign Created:</strong> Summer Sale Announcement - 2 hours ago
        </p>
        <p className="text-sm text-neutral-text-light mb-2">
          <strong>Content Updated:</strong> Monthly Newsletter - 5 hours ago
        </p>
        <p className="text-sm text-neutral-text-light mb-2">
          <strong>Campaign Sent:</strong> Product Launch - Yesterday
        </p>
      </div>
    </div>
  </div>
);

// Component Knowledge Base component
const ComponentKnowledgeBase = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredComponents, setFilteredComponents] = useState(componentDocs);
  const [selectedComponent, setSelectedComponent] = useState(componentDocs[0]);
  const [activeTab, setActiveTab] = useState('documentation');

  // Filter components when search term changes
  useEffect(() => {
    if (searchTerm === '') {
      setFilteredComponents(componentDocs);
    } else {
      const filtered = componentDocs.filter(comp => 
        comp.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        comp.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredComponents(filtered);
    }
  }, [searchTerm]);

  // Set the selected component when filtered list changes
  useEffect(() => {
    if (filteredComponents.length > 0) {
      setSelectedComponent(filteredComponents[0]);
    }
  }, [filteredComponents]);

  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      <Typography variant="h5" gutterBottom fontWeight={600}>
        UI Component Knowledge Base
      </Typography>
      <Typography variant="body1" paragraph>
        Explore our UI components, view documentation, and see examples.
      </Typography>

      {/* Search and component browser */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="md:col-span-1">
          <div className="mb-4">
            <Input
              type="text"
              placeholder="Search components..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>
          <div className="space-y-2">
            {filteredComponents.map((component) => (
              <Button
                key={component.id}
                variant={selectedComponent?.id === component.id ? "default" : "outline"}
                className="w-full justify-start"
                onClick={() => setSelectedComponent(component)}
              >
                {component.title}
              </Button>
            ))}
          </div>
        </div>

        <div className="md:col-span-3">
          {selectedComponent ? (
            <Card>
              <CardHeader>
                <CardTitle>{selectedComponent.title}</CardTitle>
                <CardDescription>{selectedComponent.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="documentation">Documentation</TabsTrigger>
                    <TabsTrigger value="examples">Examples</TabsTrigger>
                    <TabsTrigger value="code">Code</TabsTrigger>
                  </TabsList>

                  <TabsContent value="documentation" className="space-y-4">
                    <h3 className="text-lg font-semibold mt-4">Props</h3>
                    <div className="border rounded-md">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left p-2">Name</th>
                            <th className="text-left p-2">Type</th>
                            <th className="text-left p-2">Default</th>
                            <th className="text-left p-2">Description</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedComponent.props.map((prop, index) => (
                            <tr key={index} className="border-b">
                              <td className="p-2 font-mono text-sm">{prop.name}</td>
                              <td className="p-2 font-mono text-sm">{prop.type}</td>
                              <td className="p-2 font-mono text-sm">{prop.default}</td>
                              <td className="p-2">{prop.description}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </TabsContent>

                  <TabsContent value="examples" className="space-y-4">
                    {selectedComponent.examples.map((example, index) => (
                      <Card key={index}>
                        <CardHeader>
                          <CardTitle className="text-md">{example.title}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="mb-4 p-4 border rounded-md flex items-center justify-center">
                            {/* In a real implementation, you would dynamically render the example */}
                            <div className="text-gray-500">[Component Example Rendering]</div>
                          </div>
                          <pre className="bg-gray-100 p-4 rounded-md overflow-x-auto">
                            <code>{example.code}</code>
                          </pre>
                        </CardContent>
                      </Card>
                    ))}
                  </TabsContent>

                  <TabsContent value="code">
                    <pre className="bg-gray-100 p-4 rounded-md overflow-x-auto">
                      <code>{selectedComponent.usage}</code>
                    </pre>
                    <div className="mt-4 flex justify-end">
                      <Button variant="outline" size="sm">Copy Code</Button>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <p>No component selected or found. Try adjusting your search.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </Box>
  );
};

// Feature demos component with TabItem type
type TabItem = {
  label: string;
  content: React.ReactNode;
  icon?: React.ReactNode;
  badge?: string;
};

// Feature demos component
const FeatureDemos = () => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));
  const [activeTab, setActiveTab] = useState(0);
  
  // Define the main horizontal tabs (demo features)
  const mainTabs: TabItem[] = [
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
      content: <FeatureAnalyticsTab />,
      badge: "New",
    },
    {
      label: "Audience",
      content: <FeatureAudienceTab />,
    }
  ];
  
  // Campaign detail tabs for vertical demo
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
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2">Audience</Typography>
                <Typography variant="body2" sx={{ mb: 2 }}>All Subscribers</Typography>
                
                <Typography variant="subtitle2">Sent</Typography>
                <Typography variant="body2" sx={{ mb: 2 }}>5,432</Typography>
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
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      <Typography variant="h5" gutterBottom fontWeight={600}>
        Application Features Demo
      </Typography>
      <Typography variant="body1" paragraph>
        Explore the key functional features of our marketing platform.
      </Typography>
      
      {/* Main tabs section */}
      <Paper elevation={2} sx={{ mb: 4 }}>
        <CustomTabs 
          tabs={mainTabs} 
          defaultTab={activeTab}
          onChange={(index) => setActiveTab(index)}
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
          <CustomTabs 
            tabs={campaignDetailTabs} 
            orientation={isSmallScreen ? "horizontal" : "vertical"}
            variant={isSmallScreen ? "scrollable" : "standard"}
            showAnimation={true}
            color="primary"
            ariaLabel="campaign details sections"
          />
        </Paper>
      </Box>
    </Box>
  );
};

// Implementation guide component
const ImplementationGuide = () => (
  <Box sx={{ p: { xs: 2, sm: 3 } }}>
    <Typography variant="h5" gutterBottom fontWeight={600}>
      Implementation Guide
    </Typography>
    
    <Typography variant="body1" paragraph>
      Learn how to implement the components and features demonstrated in this demo.
    </Typography>
    
    <Grid container spacing={3} sx={{ mt: 2 }}>
      <Grid item xs={12} md={4}>
        <MuiCard variant="outlined">
          <MuiCardContent>
            <Typography variant="h6" color="primary" gutterBottom>
              Component Integration
            </Typography>
            <Typography variant="body2">
              Step-by-step guide for integrating UI components into your application.
            </Typography>
          </MuiCardContent>
          <CardActions>
            <MuiButton size="small" variant="outlined">View Guide</MuiButton>
          </CardActions>
        </MuiCard>
      </Grid>
      
      <Grid item xs={12} md={4}>
        <MuiCard variant="outlined">
          <MuiCardContent>
            <Typography variant="h6" color="primary" gutterBottom>
              Application Setup
            </Typography>
            <Typography variant="body2">
              Instructions for setting up the marketing platform in your environment.
            </Typography>
          </MuiCardContent>
          <CardActions>
            <MuiButton size="small" variant="outlined">View Guide</MuiButton>
          </CardActions>
        </MuiCard>
      </Grid>
      
      <Grid item xs={12} md={4}>
        <MuiCard variant="outlined">
          <MuiCardContent>
            <Typography variant="h6" color="primary" gutterBottom>
              API Documentation
            </Typography>
            <Typography variant="body2">
              Reference for all available API endpoints and data structures.
            </Typography>
          </MuiCardContent>
          <CardActions>
            <MuiButton size="small" variant="outlined">View Guide</MuiButton>
          </CardActions>
        </MuiCard>
      </Grid>
    </Grid>
    
    <Box sx={{ mt: 5, mb: 3 }}>
      <Typography variant="h5" gutterBottom fontWeight={600}>
        Code Examples
      </Typography>
      
      <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
        <Typography variant="body2" component="pre" sx={{ 
          fontFamily: 'monospace',
          whiteSpace: 'pre-wrap',
          overflowX: 'auto'
        }}>
{`// Import components
import { Tabs } from "@/components/ui/tabs";
import CreateCampaign from '@/components/CreateCampaign';

// Use in your component
<Tabs defaultValue="tab1">
  <TabsList>
    <TabsTrigger value="tab1">Tab 1</TabsTrigger>
  </TabsList>
  <TabsContent value="tab1">Content</TabsContent>
</Tabs>`}
        </Typography>
      </Paper>
    </Box>
  </Box>
);

// Main Demo component
export default function Demo() {
  const theme = useTheme();
  const router = useRouter(); // Initialize Next.js router for programmatic navigation
  const [activeMainTab, setActiveMainTab] = useState(0);
  
  // HYDRATION FIX: Date is set client-side only to avoid mismatch!
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  useEffect(() => {
    setLastUpdated(new Date().toLocaleDateString());
  }, []);

  // Main sections of the demo page
  const mainSections = [
    { label: "Overview", icon: <HomeIcon />, content: <OverviewContent /> },
    { label: "Features", icon: <EmailIcon />, content: <FeatureDemos /> },
    { label: "Components", icon: <CodeIcon />, content: <ComponentKnowledgeBase /> },
    { label: "Implementation", icon: <LibraryBooksIcon />, content: <ImplementationGuide /> }
  ];

  const handleMainTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveMainTab(newValue);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Page header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" fontWeight={700} gutterBottom>
          Thrive Send Demo
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Explore our UI components, application features, and implementation guides.
        </Typography>
      </Box>
      
      {/* Main navigation tabs */}
      <Paper elevation={2} sx={{ mb: 4 }}>
        <MuiTabs
          value={activeMainTab}
          onChange={handleMainTabChange}
          variant="scrollable"
          scrollButtons="auto"
          aria-label="demo sections"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          {mainSections.map((section, index) => (
            <Tab
              key={index}
              label={section.label}
              icon={section.icon}
              iconPosition="start"
              id={`demo-tab-${index}`}
              aria-controls={`demo-tabpanel-${index}`}
            />
          ))}
        </MuiTabs>
        
        {/* Tab content */}
        {mainSections.map((section, index) => (
          <div
            key={index}
            role="tabpanel"
            hidden={activeMainTab !== index}
            id={`demo-tabpanel-${index}`}
            aria-labelledby={`demo-tab-${index}`}
          >
            {activeMainTab === index && section.content}
          </div>
        ))}
      </Paper>
      
      {/* Navigation section with Next.js best practices */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", p: 2 }}>
        <Typography variant="body2" color="text.secondary">
          ThriveSend UI Components
        </Typography>
        
        {/* 
          Next.js Navigation Best Practices:
          1. Use Link component for internal navigation
          2. href="/" points to the root page (src/app/page.tsx or src/app/(dashboard)/page.tsx)
          3. The (dashboard) part is ignored in the URL because it's a route group
          4. MuiButton uses component={Link} to maintain button styling with Next.js navigation
          5. This approach prevents full page reloads, preserving state and improving performance
        */}
        <MuiButton 
          component={Link} 
          href="/" 
          variant="outlined" 
          size="small"
        >
          Back to Dashboard
        </MuiButton>
      </Box>
      
      {/* Footer with navigation examples */}
      <Box sx={{ mt: 8, pt: 3, borderTop: 1, borderColor: 'divider' }}>
        <Typography variant="body2" color="text.secondary" align="center">
          Demo Version 1.0.0 | Last Updated: {lastUpdated || ""}
        </Typography>
        
        {/* Navigation menu example */}
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 3, mt: 2 }}>
          {/* 
            Next.js Link component examples:
            - Wrapping plain text
            - With passHref when needed for custom components
            - With proper relative paths based on the file system
          */}
          <Link href="/" style={{ color: theme.palette.primary.main, textDecoration: 'none' }}>
            Home
          </Link>
          <Link href="/settings" style={{ color: theme.palette.primary.main, textDecoration: 'none' }}>
            Settings
          </Link>
          <Link href="/help" style={{ color: theme.palette.primary.main, textDecoration: 'none' }}>
            Help
          </Link>
          
          {/* Example of a button that could use programmatic navigation */}
          <MuiButton 
            size="small" 
            variant="text" 
            onClick={() => router.push('/dashboard')}
          >
            Dashboard
          </MuiButton>
        </Box>
        
        <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 2 }}>
          Thrive Send Marketing Platform - All rights reserved
        </Typography>
      </Box>
    </Container>
  );
}
