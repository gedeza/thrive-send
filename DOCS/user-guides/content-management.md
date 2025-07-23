---
title: Content Management Guide
description: Learn how to create, edit, and manage content in Thrive Send
---

# Content Management Guide

Learn how to create, organize, and publish content effectively using Thrive Send's advanced content management system with integrated analytics and performance tracking.

## Overview

Thrive Send's content management system provides a comprehensive platform for creating, organizing, and publishing marketing content. The system includes a visual editor, media library, content calendar, and advanced analytics dashboard to optimize your content strategy and track performance in real-time.

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

## Content Performance Analytics

### Real-time Analytics Dashboard

Monitor your content performance with comprehensive analytics that update in real-time.

![Analytics Dashboard](/docs/images/content-analytics-dashboard.svg)

#### Key Performance Metrics

1. **Performance Score (0-100)**
   - Algorithmic rating based on views, engagement, and conversions
   - Color-coded indicators (green: excellent, blue: good, yellow: average, red: poor)
   - Trending detection for high-performing content

2. **Engagement Tracking**
   - Views, likes, shares, and comments
   - Engagement rate calculations
   - Real-time update indicators

3. **Content Analytics Integration**
   ```typescript
   // Example: Viewing content analytics
   const viewContentAnalytics = (contentId: string) => {
     const analytics = await api.get(`/content/${contentId}/analytics`);
     
     return {
       performanceScore: calculatePerformanceScore(analytics),
       trendingStatus: isTrendingContent(analytics),
       realTimeUpdates: analytics.lastUpdated
     };
   };
   ```

### Performance Dashboard Features

1. **Overview Tab**
   - Total content performance metrics
   - Performance distribution charts
   - Recent activity timeline
   - Quick statistics and insights

2. **Top Performers Analysis**
   - Best and worst performing content
   - Performance comparison tools
   - Content type performance breakdown
   - Optimization recommendations

3. **AI-Generated Insights**
   - Automated performance analysis
   - Trend identification and patterns
   - Actionable optimization suggestions
   - Benchmark comparisons

4. **Data Export Capabilities**
   - CSV, PDF, and JSON export formats
   - Custom report generation
   - Scheduled reporting options
   - Advanced filtering and date ranges

### Real-time Features

#### Connection Status Monitoring
The system provides real-time connection indicators showing:
- WebSocket connection status
- Last update timestamp
- Manual refresh capabilities
- Update counters and notifications

#### Interactive Tutorial: Using Analytics

1. **Step 1: Access Analytics Dashboard**
   - Navigate to Content → Analytics
   - Select date range and filters
   - Choose dashboard tab (Overview, Performers, Insights, Trends)

2. **Step 2: Analyze Performance**
   - Review performance scores and trends
   - Identify top and bottom performers
   - Read AI-generated insights and recommendations
   - Export data for deeper analysis

3. **Step 3: Optimize Content Strategy**
   ```typescript
   // Example: Implementing insights
   const optimizeContent = async (insights: PerformanceInsights) => {
     for (const insight of insights.recommendations) {
       switch (insight.type) {
         case 'optimize_content':
           await updateContentOptimizations(insight.contentId);
           break;
         case 'boost_promotion':
           await createPromotionCampaign(insight.contentId);
           break;
         case 'analyze_audience':
           await generateAudienceReport(insight.contentId);
           break;
       }
     }
   };
   ```

### Advanced Content Library Features

#### Enhanced Grid and List Views
- Analytics-integrated content cards
- Performance indicators and trending badges
- Real-time metric updates
- Interactive tooltips with detailed information

#### Bulk Operations with Analytics
- Multi-select content items
- Bulk analytics processing
- Performance-based filtering
- Advanced search with analytics criteria

#### Performance-Based Sorting
- Sort by performance score
- Sort by views and engagement
- Sort by trending status
- Custom analytics-based ordering

## Best Practices for Content Analytics

### Performance Optimization

1. **Regular Monitoring**
   - Check performance dashboard daily
   - Monitor real-time connection status
   - Review trending content opportunities
   - Act on AI-generated insights

2. **Content Strategy Optimization**
   - Focus on high-performing content patterns
   - Optimize low-performing content
   - Leverage trending content for promotion
   - Use analytics for content calendar planning

3. **Data-Driven Decision Making**
   ```typescript
   // Example: Analytics-driven content strategy
   const optimizeContentStrategy = async () => {
     const analytics = await fetchBulkAnalytics(contentIds);
     const insights = generateInsights(analytics);
     
     // Focus on successful patterns
     const successPatterns = identifySuccessPatterns(analytics);
     
     // Optimize underperforming content
     const improvementOpportunities = findImprovementOpportunities(analytics);
     
     return {
       recommendations: insights.recommendations,
       patterns: successPatterns,
       optimizations: improvementOpportunities
     };
   };
   ```

## Next Steps

- Explore the [Analytics Dashboard Guide](/docs/analytics/dashboard) for advanced features
- Learn about [Performance Optimization](/docs/content/optimization) strategies
- Review [Real-time Analytics Setup](/docs/analytics/real-time) for WebSocket configuration
- Check out [Campaign Management](/docs/campaign-management) to distribute high-performing content
- Review [User Management](/docs/user-management) to set up team permissions and analytics access