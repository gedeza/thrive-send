'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { Box, Typography, CircularProgress } from '@mui/material';

// Use dynamic imports to load the MUI components
const DemoPage = dynamic(
  () => import('../../../pages/DemoPage'),
  {
    loading: () => (
      <div className="flex items-center justify-center h-[500px]">
        <CircularProgress />
        <Typography variant="body1" sx={{ ml: 2 }}>
          Loading demo components...
        </Typography>
      </div>
    ),
    ssr: false // Disable server-side rendering for these components to avoid hydration issues
  }
);

export default function Demo() {
  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h4" component="h1" sx={{ mb: 4 }}>
        UI Components Demo
      </Typography>
      <DemoPage />
    </Box>
  );
}
