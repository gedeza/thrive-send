---
title: Content Management Guide
description: Learn how to create, edit, and manage content in Thrive Send
---

# Content Management Guide

Learn how to create, organize, and publish content effectively using Thrive Send's content management system.

## Overview

Thrive Send's content management system provides a powerful platform for creating, organizing, and publishing marketing content. The system includes a visual editor, media library, and content calendar to streamline your content workflow.

![Content Management Dashboard](/docs/images/content-dashboard.svg)

## Media Library

The media library helps you organize and manage all your digital assets in one place.

![Media Library Interface](/docs/images/media-library.svg)

### Asset Management

1. **Uploading Assets**
   ```typescript
   // Example: Uploading media files
   const uploadMedia = async (files: File[]) => {
     const formData = new FormData();
     files.forEach(file => formData.append('files', file));
     
     const response = await api.post('/media/upload', formData, {
       headers: { 'Content-Type': 'multipart/form-data' }
     });
     return response.data;
   };
   ```

2. **Organizing Assets**
   - Create folders and collections
   - Add tags and metadata
   - Set usage permissions
   - Track asset usage

### Interactive Tutorial: Managing Media Assets

1. **Step 1: Upload Files**
   - Click "Upload" button
   - Select files or drag-and-drop
   - Set upload options
   - Monitor progress

2. **Step 2: Organize Assets**
   - Create folders
   - Add tags
   - Set permissions
   - Update metadata

3. **Step 3: Optimize Images**
   ```typescript
   // Example: Image optimization
   const optimizeImage = async (imageId: string, options: OptimizationOptions) => {
     const optimized = await api.post(`/media/${imageId}/optimize`, {
       quality: options.quality,
       format: options.format,
       resize: options.resize
     });
     return optimized;
   };
   ```

## Content Creation

### Content Editor

The visual editor provides a user-friendly interface for creating and editing content.

![Content Editor Interface](/docs/images/content-editor.svg)

1. **Editor Features**
   - Rich text formatting
   - Media insertion
   - Code editing
   - Preview mode
   - Version history

2. **Content Types**
   ```typescript
   // Example: Creating content
   const createContent = async (contentData: ContentData) => {
     const content = await api.post('/content', {
       type: contentData.type,
       title: contentData.title,
       body: contentData.body,
       metadata: contentData.metadata
     });
     return content;
   };
   ```

### Interactive Tutorial: Creating Content

1. **Step 1: Choose Content Type**
   - Select template
   - Set content type
   - Configure settings
   - Add metadata

2. **Step 2: Create Content**
   - Write content
   - Add media
   - Format text
   - Preview changes

3. **Step 3: Review and Publish**
   - Check formatting
   - Test links
   - Review metadata
   - Schedule or publish

## Content Calendar

Plan and schedule your content effectively with the content calendar.

![Content Calendar Interface](/docs/images/content-calendar.svg)

### Calendar Features

1. **Planning Tools**
   - Monthly/weekly views
   - Drag-and-drop scheduling
   - Content type filtering
   - Team assignments

2. **Scheduling Options**
   ```typescript
   // Example: Scheduling content
   const scheduleContent = async (contentId: string, schedule: ScheduleData) => {
     const scheduled = await api.post(`/content/${contentId}/schedule`, {
       publishDate: schedule.date,
       channels: schedule.channels,
       status: 'scheduled'
     });
     return scheduled;
   };
   ```

### Interactive Tutorial: Content Planning

1. **Step 1: Create Calendar**
   - Set up views
   - Configure filters
   - Add team members
   - Set permissions

2. **Step 2: Plan Content**
   - Add content items
   - Set schedules
   - Assign team members
   - Add notes

3. **Step 3: Monitor Progress**
   - Track deadlines
   - View status
   - Get notifications
   - Update schedules

## Best Practices

### Content Strategy

1. **Planning**
   - Define goals
   - Research audience
   - Create calendar
   - Set metrics

2. **Creation**
   - Follow guidelines
   - Use templates
   - Optimize content
   - Test variations

### Performance Optimization

1. **Content Quality**
   - SEO optimization
   - Mobile responsiveness
   - Loading speed
   - Accessibility

2. **Analytics**
   ```typescript
   // Example: Content analytics
   const getContentAnalytics = async (contentId: string) => {
     const analytics = await api.get(`/content/${contentId}/analytics`);
     return {
       views: analytics.views,
       engagement: analytics.engagement,
       conversions: analytics.conversions
     };
   };
   ```

## Next Steps

- Explore the [Analytics Guide](/docs/analytics) to measure content performance
- Learn about [Campaign Management](/docs/campaign-management) to distribute content
- Review [User Management](/docs/user-management) to set up team permissions 