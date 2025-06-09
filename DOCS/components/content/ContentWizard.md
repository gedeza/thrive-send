# ContentWizard Component

## Overview
The ContentWizard is a comprehensive multi-step wizard component that guides users through the content creation process in the Thrive Send platform. It provides a structured workflow for creating, configuring, and scheduling various types of content including social media posts, blog articles, and marketing campaigns. The component features advanced validation, real-time analytics tracking, accessibility compliance, and seamless integration with the content calendar system.

## Screenshots

![ContentWizard Step 1 - Type Selection](../../../images/content/content-wizard-type-selection.png)
*Step 1: Content type selection with visual content type cards*

![ContentWizard Step 2 - Content Creation](../../../images/content/content-wizard-content-creation.png)
*Step 2: Content creation with rich text editor and media upload*

![ContentWizard Step 3 - Scheduling](../../../images/content/content-wizard-scheduling.png)
*Step 3: Content scheduling with calendar picker and time selection*

![ContentWizard Step 4 - Preview](../../../images/content/content-wizard-preview.png)
*Step 4: Content preview with platform-specific formatting*

## Component Architecture

```mermaid
graph TD
    A[ContentWizard] --> B[EventForm]
    A --> C[ContentGuidance]
    A --> D[EventDetails]
    A --> E[Progress Component]
    A --> F[Card Components]
    
    B --> G[MediaUploader]
    B --> H[PlatformSelector]
    B --> I[DateTimePicker]
    
    A --> J[Analytics Service]
    A --> K[Validation Engine]
    A --> L[Error Handler]
    
    style A fill:#f9f,stroke:#333,stroke-width:2px
    style B fill:#bbf,stroke:#333,stroke-width:1px
    style C fill:#bbf,stroke:#333,stroke-width:1px
    style D fill:#bbf,stroke:#333,stroke-width:1px