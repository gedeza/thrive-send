# WelcomeFlow Component

## Overview
The WelcomeFlow component provides an interactive onboarding experience for new ThriveSend users. It guides users through essential setup steps including account configuration, content creation, team setup, and integrations using a modal dialog interface with step-by-step navigation.

## Screenshots
![Welcome Flow - Main View](../../images/onboarding/welcome-flow-main.png)
*Main welcome screen with feature overview*

![Account Setup Step](../../images/onboarding/account-setup-step.png)
*Account setup and profile configuration*

![Content Creation Guide](../../images/onboarding/content-creation-step.png)
*First content creation walkthrough*

![Team Setup Interface](../../images/onboarding/team-setup-step.png)
*Team member invitation and role assignment*

## Component Architecture

```mermaid
graph TD
    A[WelcomeFlow] --> B[OnboardingContext]
    A --> C[Dialog Components]
    A --> D[Step Content]
    B --> E[Step Management]
    B --> F[API Integration]
    C --> G[DialogHeader]
    C --> H[DialogContent]
    C --> I[DialogFooter]
    D --> J[Welcome Step]
    D --> K[Account Setup]
    D --> L[First Content]
    D --> M[Team Setup]
    D --> N[Integrations]
    
    style A fill:#f9f,stroke:#333,stroke-width:2px
    style B fill:#bbf,stroke:#333,stroke-width:1px
    style C fill:#bbf,stroke:#333,stroke-width:1px
    style D fill:#bbf,stroke:#333,stroke-width:1px