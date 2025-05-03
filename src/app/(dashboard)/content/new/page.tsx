'use client';

import React from 'react';
import { Box, Typography, Container } from '@mui/material';
import ContentForm from '../../../../components/ContentForm';

export default function NewContentPage() {
  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Create New Content
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Create content for your email campaigns.
        </Typography>
        
        <ContentForm />
      </Box>
    </Container>
  );
}