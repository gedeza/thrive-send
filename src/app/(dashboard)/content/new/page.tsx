import React from 'react';
import { Metadata } from 'next';
import { Box, Typography, Breadcrumbs, Link as MuiLink } from '@mui/material';
import Link from 'next/link';
import ContentForm from '@/components/content/ContentForm';

export const metadata: Metadata = {
  title: 'Create New Content | ThriveSend',
  description: 'Create and schedule new content for your email marketing campaigns'
};

export default function NewContentPage() {
  return (
    <Box sx={{ padding: { xs: 2, md: 4 } }}>
      {/* Breadcrumbs */}
      <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 3 }}>
        <Link href="/dashboard" passHref>
          <MuiLink underline="hover" color="inherit">
            Dashboard
          </MuiLink>
        </Link>
        <Link href="/content" passHref>
          <MuiLink underline="hover" color="inherit">
            Content
          </MuiLink>
        </Link>
        <Typography color="text.primary">New Content</Typography>
      </Breadcrumbs>

      {/* Page Heading */}
      <Typography 
        variant="h4" 
        component="h1" 
        gutterBottom
        sx={{ 
          fontWeight: 700,
          mb: 4
        }}
      >
        Create New Content
      </Typography>

      {/* Content Creation Form */}
      <ContentForm />
    </Box>
  );
}
