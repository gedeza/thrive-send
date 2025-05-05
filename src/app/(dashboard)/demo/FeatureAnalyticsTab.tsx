import React from "react";
import { Typography, Box, Paper, Grid } from "@mui/material";
import BarChartIcon from "@mui/icons-material/BarChart";
// For a real chart, install recharts or chart.js and replace this placeholder

export default function FeatureAnalyticsTab() {
  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      <Typography variant="h5" gutterBottom fontWeight={600}>
        Analytics Dashboard
      </Typography>
      <Typography variant="body1" paragraph>
        Get insights on your campaign performance. The chart and statistics below are sample data for demo purposes.
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
        {/* Replace this icon with a real chart component if available */}
        <BarChartIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
        <Typography variant="h6" gutterBottom>
          Open & Click Rates (Sample)
        </Typography>
        <Box 
          sx={{ display: "flex", justifyContent: "center", gap: 6, mt: 2 }}
        >
          <Box>
            <Typography variant="subtitle2" color="text.secondary">Open Rate</Typography>
            <Typography variant="h4" color="primary">45.2%</Typography>
          </Box>
          <Box>
            <Typography variant="subtitle2" color="text.secondary">Click Rate</Typography>
            <Typography variant="h4" color="primary">12.8%</Typography>
          </Box>
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 3 }}>
          Upgrade to premium for advanced analytics and segmentation reports.
        </Typography>
      </Paper>
      {/* Add motivation for full analytics later */}
      <Typography variant="caption" color="text.secondary">
        More analytics features coming soon (visual trends, deeper insights).
      </Typography>
    </Box>
  );
}