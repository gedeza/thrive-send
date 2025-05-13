# ThriveSend Social Suite Platform

[![# ThriveSend Social Suite Platform

---

## 🚦 Build & Progress Status

| CI Pipeline | Tests | Deploy | Docs Version |
|:---:|:---:|:---:|:---:|
| [![ThriveSend CI](https://github.com/gedeza/thrive-send/actions/workflows/ci.yml/badge.svg)](https://github.com/gedeza/thrive-send/actions/workflows/ci.yml) | [![ThriveSend Tests](https://github.com/gedeza/thrive-send/actions/workflows/test.yml/badge.svg)](https://github.com/gedeza/thrive-send/actions/workflows/test.yml) | [![ThriveSend Deploy](https://github.com/gedeza/thrive-send/actions/workflows/deploy.yml/badge.svg)](https://github.com/gedeza/thrive-send/actions/workflows/deploy.yml) | [![Documentation Version](https://img.shields.io/badge/documentation-v1.0.0-blue)](documentation_versions.md) |

---ation Version](https://img.shields.io/badge/documentation-v1.0.0-blue)](documentation_versions.md)

ThriveSend is a comprehensive social media management platform designed for digital agencies, consultants, and service providers who want to deliver exceptional social media services to their diverse client base. Whether your clients are government agencies, private businesses, startups, influencers, or content creators, ThriveSend gives you the tools to manage and scale your social media services effectively.

## Key Features

- **Multi-Client Management**: Handle multiple clients and accounts from one powerful dashboard
- **White-Label Capabilities**: Deliver services under your own brand
- **Flexible Workflows**: Adapt to different client needs and requirements
- **Advanced Analytics**: Demonstrate clear ROI to any type of client
- **Boost Marketplace**: Create additional revenue streams
- **Compliance-Ready**: Built-in features for government and regulated industries
- **Scalable Infrastructure**: Grow your business without technical limitations

## Key Features
...

## 🎨 Design Tokens & Color Scheme

ThriveSend enforces a centralized, token-based color system for all UI development.

- All UI colors must be referenced via semantic tokens defined in [`colour_scheme.md`](DOCS/colour_scheme.md).
- Raw hex codes, `text-white`/`text-black`, and generic Tailwind color classes are strictly prohibited in production code.
- All UI contributions must pass the [color scheme compliance audit](DOCS/color_scheme_compliance_audit.md) before merging.
- This ensures brand consistency, robust dark/light support, rapid theme changes, and easy maintainability.

...

## Technology Stack
- **Design Tokens:** Strict, semantic token-based system ([`colour_scheme.md`](DOCS/colour_scheme.md))
- **Authentication:** Clerk (see `DOCS/guides/clerk-setup-guide.md` for full integration steps)

## Development Guidelines
  - **Centralized Color Scheme:**  
  - All UI colors are now managed as semantic tokens in [`colour_scheme.md`](colour_scheme.md). No more raw hex/Tailwind overrides; design consistency enforced by audit.
  - Tailwind & UI Library Integration: Core theme and light/dark support are centralized and easy to maintain.
  - Color Audit and Enforcement: All new and updated code passes the [color scheme compliance audit](color_scheme_compliance_audit.md).
  - Documentation: README and design/implementation specs updated to reflect the color policy and compliance process.
  - Only reference colors via semantic tokens in [`colour_scheme.md`](DOCS/colour_scheme.md).
  - No raw hex, `text-white`, `text-black`, or Tailwind default classes in application code.
  - Every UI PR must pass the [color scheme compliance audit](DOCS/color_scheme_compliance_audit.md).

## Documentation

For detailed information about the platform, please refer to:
- [Product Requirements Document](PRD.md) - Complete feature specifications
- [MVP Specification](MVP_Specification.md) - Minimum viable product scope
- [Platform Positioning](Platform_Positioning.md) - Business strategy and market positioning
- [Database Schema](database_schema.md) - Technical implementation details
- [Wireframe Description](wireframe_description.md) - UI/UX specifications
- [System Architecture](architecture/system-overview.md) - Technical architecture overview
- [Terminology Glossary](terminology_glossary.md) - Standard terminology definitions
- [Authentication Setup Guide](DOCS/guides/clerk-setup-guide.md) - Setup and best practices for Clerk Auth

## Prototypes & Demos

The `Prototypes` directory contains experimental implementations and isolated demo components for visualization, UI concepts, or integration feasibility studies. These are intended for internal development reference and are not part of the production application.

### ChartjsTwoToneBarDemo

- **File:** `Prototypes/ChartjsTwoToneBarDemo.tsx`
- **Purpose:** Demonstrates the use of Chart.js and `react-chartjs-2` for advanced chart rendering in React.
    - Features two bar charts: a vertical bar for Monthly UVs and a horizontal bar for Feature Usage, each with two-tone alternating color schemes.
- **Dependencies:**
    - `chart.js`
    - `react-chartjs-2`
- **Usage:**  
    Import and use `<ChartjsTwoToneBarDemo />` in any React component/page for a showcase of customizable chart components.
- **Customization:**  
    - Easily adjust color schemes by modifying the `BLUE` and `GREEN` constants in the component.
    - Update data arrays to visualize different datasets.
- See inline file documentation for further details.

**Note:**  
Prototypes are provided to speed up UI research and are not guaranteed to align with all design token restrictions, linting standards, or code review policies applicable to the `/src` production code. Use them as references or starting points for new feature work.

## Project Overview

ThriveSend follows a B2B2G (Business to Business to Government) model, primarily selling to service providers who serve municipalities and other organizations. The platform combines features inspired by Beehiiv's successful newsletter platform with specialized tools for traffic amplification and audience engagement.

## Core Features

- **Newsletter Creation & Management**: Create, edit, and distribute professional newsletters
- **Recommendation Network**: Gain 200-300 new subscribers weekly through passive network effects
- **Boost Marketplace**: Two-sided marketplace for newsletter promotion and monetization
- **Growth Model**: Based on Beehiiv's co-founder and CEO, Tyler Denk's "Big Energy" newsletter that generates $20-30K monthly
- **Analytics Dashboard**: Track engagement, growth, and content performance
- **Content Calendar**: Plan and schedule social media content across multiple platforms
- **Creator Marketplace**: Connect with specialized content creators

## Technology Stack

- **Frontend**: React.js with Next.js 14+ (App Router)
- **Package Manager**: PNPM for efficient dependency management
- **Database**: Neon serverless Postgres for cost-effectiveness
- **Authentication**: Clerk for secure, scalable, and robust user management
- **UI Component Library**: Tailwind CSS
- **Icons**: Lucide React
- **Deployment**: Vercel for seamless deployment and scaling

## Platform Structure

```
thrivesend/
├── .memorybank/                # Development memory bank for knowledge persistence
│   ├── architecture/           # Architectural decisions
│   ├── configurations/         # Configuration decisions
│   ├── implementations/        # Implementation details
│   ├── integrations/           # Third-party integrations
│   ├── security/               # Security measures
│   └── tasks/                  # Task tracking
│
├── docs/                       # Documentation
│   ├── MVP_Specification.md    # MVP specification
│   ├── PRD.md                  # Product Requirements Document
│   ├── Platform_Positioning.md # Business strategy
│   ├── database_schema.md      # Database structure
│   ├── wireframe_description.md # UI/UX specifications
│   └── architecture/           # System architecture
│
├── public/                     # Static assets
│
├── src/                        # Source code
│   ├── app/                    # Next.js App Router
│   │   ├── (dashboard)/        # Dashboard routes
│   │   │   ├── analytics/      # Analytics pages
│   │   │   ├── calendar/       # Calendar pages
│   │   │   ├── content/        # Content pages
│   │   │   ├── creators/       # Creators pages
│   │   │   ├── projects/       # Projects pages
│   │   │   └── settings/       # Settings pages
│   │   ├── api/                # API endpoints
│   │   └── layout.tsx          # Root layout
│   │
│   ├── components/             # React components
│   │   ├── analytics/          # Analytics components
│   │   ├── content/            # Content creation components
│   │   ├── layout/             # Layout components (Header, Sidebar)
│   │   ├── marketplace/        # Marketplace components
│   │   └── ui/                 # UI components
│   │
│   ├── hooks/                  # Custom React hooks
│   ├── lib/                    # Library code
│   │   ├── api/                # API client functions
│   │   ├── data/               # Data utilities
│   │   ├── types/              # TypeScript types
│   │   └── utils/              # Utility functions
│   │
│   └── styles/                 # Global styles
│
└── [configuration files]       # Various config files
```

## Setup Instructions

1. Clone the repository
2. Install dependencies with `pnpm install`
3. Set up environment variables for Neon database and Clerk authentication (see [`clerk-setup-guide.md`](DOCS/guides/clerk-setup-guide.md))
4. Run the development server with `pnpm dev`
5. Build for production with `pnpm build`

> **Note:** The platform standardizes on Clerk for authentication. If you find references to BetterAuth or Supabase in older documentation, treat those as outdated.

## Development Guidelines

- **App Router Architecture**: Utilize Next.js App Router for improved routing and layouts
- **Server Components**: Use React Server Components for data-fetching and static content
- **Client Components**: Apply 'use client' directive only for interactive elements
- **TypeScript**: Maintain strict TypeScript typing throughout the codebase
- **Memory Bank**: Document architectural decisions and implementations in the memory bank
- **Component Structure**: Follow the established component organization
- Implement responsive design for all screen sizes
- Ensure accessibility compliance (WCAG 2.1)
- Write unit tests for critical functionality

## Deployment

The platform can be deployed to Vercel with the following steps:

1. Connect your GitHub repository to Vercel
2. Configure environment variables for production
3. Deploy the application
4. Set up custom domain if needed

## Business Model

ThriveSend follows a B2B2G model where:

1. ThriveSend (platform) sells to businesses and service providers
2. These businesses use ThriveSend to serve their clients (municipalities, etc.)
3. End users benefit from improved social media engagement and content

Revenue streams include subscription fees, marketplace transaction fees, and premium features.

## Contributing

Please refer to our [Contributing Guidelines](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
