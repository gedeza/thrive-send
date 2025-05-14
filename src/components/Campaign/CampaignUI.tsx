import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Button, 
  Typography, 
  Paper, 
  Divider, 
  Alert, 
  CircularProgress,
  Tabs,
  Tab,
  Card,
  CardContent,
  CardActions,
  Grid,
  Chip,
  IconButton,
  InputAdornment,
  TextField,
  Menu,
  MenuItem,
  Badge
} from '@mui/material';
import { styled } from '@mui/material/styles';
import CreateCampaign from './CreateCampaign';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import SortIcon from '@mui/icons-material/Sort';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import AddIcon from '@mui/icons-material/Add';
import { format } from 'date-fns';

// Styled components for enhanced UI
const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  boxShadow: theme.shadows[2],
  borderRadius: theme.shape.borderRadius * 2,
}));

const StyledCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[4],
  },
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius * 1.5,
}));

const StyledBadge = styled(Badge)(({ theme }) => ({
  '& .MuiBadge-badge': {
    right: -3,
    top: 13,
    border: `2px solid ${theme.palette.background.paper}`,
    padding: '0 4px',
  },
}));

type Campaign = {
  id: string;
  name: string;
  description?: string;
  type?: string;
  startDate: string;
  endDate: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  audience?: string[];
};

type CampaignTabValue = 'all' | 'active' | 'draft' | 'completed';

// Status to color mapping
const statusColors: Record<string, string> = {
  active: 'success',
  draft: 'default',
  scheduled: 'info',
  completed: 'secondary',
  paused: 'warning',
};

const CampaignList: React.FC = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [filteredCampaigns, setFilteredCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [tabValue, setTabValue] = useState<CampaignTabValue>('all');
  
  // Menu states
  const [sortAnchorEl, setSortAnchorEl] = useState<null | HTMLElement>(null);
  const [filterAnchorEl, setFilterAnchorEl] = useState<null | HTMLElement>(null);
  const [actionAnchorEl, setActionAnchorEl] = useState<null | {el: HTMLElement, id: string}>(null);

  useEffect(() => {
    async function fetchCampaigns() {
      setLoading(true);
      try {
        // Replace with actual API endpoint
        const res = await fetch('/api/campaigns');
        if (!res.ok) throw new Error('Failed to fetch campaigns');
        const data = await res.json();
        setCampaigns(data);
        setFilteredCampaigns(data);
      } catch (err: any) {
        setError(err.message || 'Unknown error');
      } finally {
        setLoading(false);
      }
    }
    fetchCampaigns();
  }, []);

  // Filter campaigns based on search and tab
  useEffect(() => {
    let result = campaigns;
    
    // Filter by tab
    if (tabValue !== 'all') {
      result = result.filter(campaign => campaign.status.toLowerCase() === tabValue);
    }
    
    // Filter by search
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(campaign => 
        campaign.name.toLowerCase().includes(term) || 
        (campaign.description?.toLowerCase().includes(term))
      );
    }
    
    setFilteredCampaigns(result);
  }, [campaigns, searchTerm, tabValue]);

  // Tab change handler
  const handleTabChange = (_event: React.SyntheticEvent, newValue: CampaignTabValue) => {
    setTabValue(newValue);
  };

  // Handle sort menu
  const handleSortClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setSortAnchorEl(event.currentTarget);
  };

  const handleSortClose = () => {
    setSortAnchorEl(null);
  };

  // Handle filter menu
  const handleFilterClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setFilterAnchorEl(event.currentTarget);
  };

  const handleFilterClose = () => {
    setFilterAnchorEl(null);
  };

  // Handle action menu
  const handleActionClick = (event: React.MouseEvent<HTMLButtonElement>, id: string) => {
    setActionAnchorEl({ el: event.currentTarget, id });
  };

  const handleActionClose = () => {
    setActionAnchorEl(null);
  };

  // Sort campaigns
  const sortCampaigns = (type: 'name' | 'date' | 'status') => {
    let sorted = [...filteredCampaigns];
    if (type === 'name') {
      sorted.sort((a, b) => a.name.localeCompare(b.name));
    } else if (type === 'date') {
      sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else if (type === 'status') {
      sorted.sort((a, b) => a.status.localeCompare(b.status));
    }
    setFilteredCampaigns(sorted);
    handleSortClose();
  };

  if (loading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
      <CircularProgress />
    </Box>
  );
  
  if (error) return (
    <Alert severity="error" sx={{ mb: 2 }}>
      {error}
    </Alert>
  );

  return (
    <StyledPaper>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" fontWeight={600}>
          Campaign Manager
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<AddIcon />}
          href="#create-campaign"
        >
          Create Campaign
        </Button>
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange}
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="All Campaigns" value="all" />
          <Tab 
            label={
              <StyledBadge badgeContent={campaigns.filter(c => c.status.toLowerCase() === 'active').length} 
              color="primary">
                Active
              </StyledBadge>
            } 
            value="active" 
          />
          <Tab label="Drafts" value="draft" />
          <Tab label="Completed" value="completed" />
        </Tabs>

        <Box sx={{ display: 'flex', gap: 1 }}>
          <TextField
            size="small"
            placeholder="Search campaigns..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
            sx={{ width: 220 }}
          />
          
          <IconButton onClick={handleFilterClick}>
            <FilterListIcon />
          </IconButton>
          
          <IconButton onClick={handleSortClick}>
            <SortIcon />
          </IconButton>
        </Box>
      </Box>

      {filteredCampaigns.length === 0 ? (
        <Box sx={{ p: 4, textAlign: 'center' }}>
          <Typography color="text.secondary">No campaigns found.</Typography>
          <Button 
            variant="outlined" 
            sx={{ mt: 2 }}
            href="#create-campaign"
          >
            Create your first campaign
          </Button>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {filteredCampaigns.map((campaign) => (
            <Grid item xs={12} sm={6} md={4} key={campaign.id}>
              <StyledCard>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Typography variant="h6" component="div" fontWeight={500} noWrap>
                      {campaign.name}
                    </Typography>
                    <IconButton 
                      size="small"
                      onClick={(e) => handleActionClick(e, campaign.id)}
                    >
                      <MoreVertIcon fontSize="small" />
                    </IconButton>
                  </Box>
                  
                  <Chip 
                    label={campaign.status} 
                    size="small" 
                    color={statusColors[campaign.status.toLowerCase()] as any || "default"}
                    sx={{ mt: 1, mb: 1 }}
                  />

                  <Typography variant="body2" color="text.secondary" sx={{ 
                    mt: 1, 
                    mb: 1,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: '2',
                    WebkitBoxOrient: 'vertical',
                    height: '40px'
                  }}>
                    {campaign.description || 'No description provided.'}
                  </Typography>

                  <Typography variant="caption" color="text.secondary" display="block">
                    Type: {campaign.type || 'Not specified'}
                  </Typography>
                  
                  <Typography variant="caption" color="text.secondary" display="block">
                    Schedule: {campaign.startDate ? format(new Date(campaign.startDate), 'MMM d, yyyy') : 'Not scheduled'}
                  </Typography>
                  
                  {campaign.audience && campaign.audience.length > 0 && (
                    <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {campaign.audience.slice(0, 2).map((aud, i) => (
                        <Chip key={i} label={aud} size="small" variant="outlined" sx={{ fontSize: '0.7rem' }} />
                      ))}
                      {campaign.audience.length > 2 && (
                        <Chip label={`+${campaign.audience.length - 2} more`} size="small" variant="outlined" sx={{ fontSize: '0.7rem' }} />
                      )}
                    </Box>
                  )}
                </CardContent>
                <Divider />
                <CardActions>
                  <Button size="small" color="primary">View</Button>
                  <Button size="small">Edit</Button>
                  <Button size="small" color="secondary">Analytics</Button>
                </CardActions>
              </StyledCard>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Sort Menu */}
      <Menu
        anchorEl={sortAnchorEl}
        open={Boolean(sortAnchorEl)}
        onClose={handleSortClose}
      >
        <MenuItem onClick={() => sortCampaigns('name')}>Sort by Name</MenuItem>
        <MenuItem onClick={() => sortCampaigns('date')}>Sort by Date</MenuItem>
        <MenuItem onClick={() => sortCampaigns('status')}>Sort by Status</MenuItem>
      </Menu>

      {/* Filter Menu */}
      <Menu
        anchorEl={filterAnchorEl}
        open={Boolean(filterAnchorEl)}
        onClose={handleFilterClose}
      >
        <MenuItem onClick={handleFilterClose}>All Types</MenuItem>
        <MenuItem onClick={handleFilterClose}>Newsletter</MenuItem>
        <MenuItem onClick={handleFilterClose}>Promotional</MenuItem>
        <MenuItem onClick={handleFilterClose}>Announcement</MenuItem>
        <MenuItem onClick={handleFilterClose}>Event Invitation</MenuItem>
      </Menu>

      {/* Action Menu */}
      <Menu
        anchorEl={actionAnchorEl?.el}
        open={Boolean(actionAnchorEl)}
        onClose={handleActionClose}
      >
        <MenuItem onClick={handleActionClose}>View Details</MenuItem>
        <MenuItem onClick={handleActionClose}>Duplicate</MenuItem>
        <MenuItem onClick={handleActionClose}>Archive</MenuItem>
        <MenuItem onClick={handleActionClose} sx={{ color: 'error.main' }}>Delete</MenuItem>
      </Menu>
    </StyledPaper>
  );
};

// Campaign Dashboard with enhanced UI
const CampaignDashboard: React.FC = () => {
  const [activeView, setActiveView] = useState<'list' | 'create'>('list');

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', px: 2 }}>
      {activeView === 'list' ? (
        <>
          <CampaignList />
          <Box sx={{ mt: 4 }} id="create-campaign">
            <CreateCampaign />
          </Box>
        </>
      ) : (
        <Box sx={{ mt: 2 }}>
          <Button 
            variant="text" 
            onClick={() => setActiveView('list')}
            sx={{ mb: 2 }}
          >
            ← Back to campaigns
          </Button>
          <CreateCampaign />
        </Box>
      )}
    </Box>
  );
};

export { CampaignList, CampaignDashboard };
