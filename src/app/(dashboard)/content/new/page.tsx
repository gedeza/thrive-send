"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import Link from "next/link";
import { Box, Typography, Container, Card, CardContent, TextField, Button, Alert } from '@mui/material';
import ContentForm from '../../../../components/ContentForm';

// Dynamically import the markdown editor to avoid SSR issues
const MdEditor = dynamic(() => import("react-markdown-editor-lite"), { ssr: false });
import "react-markdown-editor-lite/lib/index.css";

export default function NewContentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialDate = searchParams?.get("date") || "";
  const [scheduledDate, setScheduledDate] = useState(initialDate);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Controlled markdown editor for ContentForm
  const RichEditor = ({
    value,
    onChange
  }: {
    value: string;
    onChange(v: string): void;
  }) => (
    <MdEditor
      value={value}
      style={{ height: "280px" }}
      renderHTML={text => <div>{text}</div>}
      onChange={({ text }) => onChange(text)}
      view={{ menu: true, md: true, html: true }}
      placeholder="Write your content using Markdown for formatting!"
    />
  );

  const handleSubmit = async (values: any) => {
    setSuccess(null);
    setError(null);

    try {
      await new Promise(r => setTimeout(r, 800));
      setSuccess("Content created successfully! Redirecting to calendar…");
      setTimeout(() => router.push("/calendar"), 1500);
    } catch (err) {
      setError("There was an error creating your content. Please try again.");
    }
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Create Feature-Rich Content
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Author content with <strong>Markdown</strong>, optionally schedule for later.
          Formatting, code, images, and links are all supported!
        </Typography>
        
        <Card sx={{ mt: 3 }}>
          <CardContent>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
            )}
            {success && (
              <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>
            )}

            <ContentForm 
              onSubmit={handleSubmit}
              Editor={RichEditor}
            />

            <Box sx={{ mt: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="subtitle2">Schedule for:</Typography>
              <TextField
                type="date"
                size="small"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                sx={{ width: 200 }}
              />
              <Typography variant="caption" color="text.secondary">
                (Optional: leave blank to publish immediately)
              </Typography>
            </Box>

            <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between' }}>
              <Button 
                component={Link} 
                href="/calendar" 
                variant="text"
              >
                &larr; Back to Calendar
              </Button>
              <Button
                variant="outlined"
                onClick={() => router.push("/calendar")}
              >
                Cancel
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
}
