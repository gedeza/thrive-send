import React from "react";
import { Typography, Box, Paper, Grid, Chip, Button as MuiButton, List, ListItem, ListItemText } from "@mui/material";
import PeopleIcon from "@mui/icons-material/People";
import AddIcon from "@mui/icons-material/Add";
import GroupWorkIcon from "@mui/icons-material/GroupWork";

export default function FeatureAudienceTab() {
  // Placeholder data
  const audienceSegments = [
    { name: "All Subscribers", count: 5432 },
    { name: "Active Members", count: 2321 },
    { name: "Recent Signups", count: 120 },
    { name: "VIP Customers", count: 18 }
  ];

  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      <Typography variant="h5" gutterBottom fontWeight={600}>
        Audience Management
      </Typography>
      <Typography variant="body1" paragraph>
        Segment and understand your audience. Build targeted groups to maximize campaign performance.
      </Typography>

      <Paper 
        variant="outlined" 
        sx={{ 
          p: 3, 
          textAlign: 'center',
          bgcolor: 'action.hover',
          mb: 3
        }}
      >
        <PeopleIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
        <Typography variant="h6" gutterBottom>
          Total Subscribers: <span style={{ color: "#1976d2" }}>5,432</span>
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Grow your audience by adding signup forms, importing contacts, and using referral campaigns.
        </Typography>
        <MuiButton
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          sx={{ mt: 3 }}
          disabled
        >
          Add New Segment (Coming Soon)
        </MuiButton>
      </Paper>

      <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
        <Typography variant="subtitle1" gutterBottom>
          Audience Segments
        </Typography>
        <List>
          {audienceSegments.map((segment, idx) => (
            <ListItem key={idx} disableGutters>
              <GroupWorkIcon sx={{ color: 'text.secondary', mr: 2 }} />
              <ListItemText
                primary={segment.name}
                secondary={`${segment.count} members`}
                primaryTypographyProps={{ fontWeight: 500 }}
              />
              <Chip label="View" color="default" size="small" sx={{ ml: 2 }} disabled />
            </ListItem>
          ))}
        </List>
      </Paper>
      
      <Typography variant="caption" color="text.secondary">
        More audience features coming soon: engagement scoring, advanced filters, integrations.
      </Typography>
    </Box>
  );
}