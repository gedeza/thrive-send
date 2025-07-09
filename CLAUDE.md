# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Package Management
**IMPORTANT**: Always use `pnpm` as the package manager for this project:
```bash
pnpm install              # Install dependencies
pnpm add [package]        # Add new package
pnpm dev                  # Start development server
pnpm build                # Build for production
pnpm start                # Start production server
```

### Testing
```bash
pnpm test                 # Run Jest unit tests
pnpm test:watch           # Run tests in watch mode
pnpm test:coverage        # Run tests with coverage report
pnpm test:e2e             # Run Playwright end-to-end tests
pnpm test:e2e:ui          # Run E2E tests with UI
pnpm test:all             # Run all tests (unit + e2e)
```

### Database Operations
```bash
pnpm db:generate          # Generate Prisma client
npx prisma migrate dev    # Run database migrations in development
npx prisma studio         # Open Prisma Studio for database management
npx prisma db seed        # Seed the database
```

### Code Quality
```bash
pnpm lint                 # Run ESLint
```

### Development Server
```bash
pnpm server:dev           # Run development server with nodemon
```

## Architecture Overview

### Tech Stack
- **Frontend**: Next.js 14 with App Router
- **Backend**: Node.js with TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: Clerk
- **UI**: Tailwind CSS with Radix UI components
- **Rich Text**: TipTap editor
- **Charts**: Chart.js and Recharts
- **Testing**: Jest + Playwright

### Core Architecture Patterns

#### Database-First Design
- Uses Prisma as the ORM with schema-first approach
- Complex multi-tenant architecture with Organizations
- Extensive relationship modeling for content management workflows

#### Authentication & Authorization
- Clerk integration for user management
- Role-based access control (RBAC) with roles: CONTENT_CREATOR, REVIEWER, APPROVER, PUBLISHER, ADMIN
- Organization-based multi-tenancy

#### Content Management System
- Approval workflow system (Draft → Review → Approval → Published)
- Rich media asset management with version control
- Template-based content creation
- Multi-format content support (Blog, Social, Email, etc.)

#### Layout System
- `ClientLayout` component handles authenticated vs unauthenticated states
- Sidebar navigation with role-based menu items
- Theme provider for dark/light mode support

### Key Directories

```
src/
├── app/                 # Next.js App Router pages
│   ├── (dashboard)/     # Dashboard routes (grouped)
│   └── api/             # API routes
├── components/          # React components
│   ├── ui/              # Reusable UI components (Radix-based)
│   ├── layout/          # Layout components (header, sidebar)
│   ├── content/         # Content management components
│   └── analytics/       # Analytics dashboard components
├── lib/                 # Utility libraries
│   ├── api/            # API service layers
│   └── utils.ts        # Common utilities
├── context/            # React contexts
├── hooks/              # Custom React hooks
└── types/              # TypeScript type definitions
```

### Design System

#### Color System
- **CRITICAL**: Use semantic color classes, never raw Tailwind colors
- Button text requiring white color MUST use `.text-custom-white` class
- Chart colors use CSS custom properties (--color-chart-blue, etc.)

#### Component Standards
- All UI components extend Radix UI primitives
- Consistent props interfaces with TypeScript
- Support for both light and dark themes

### Data Models

The application uses a complex Prisma schema with key entities:
- **User**: Multi-role users with Clerk integration
- **Organization**: Multi-tenant architecture
- **Content**: Core content entities with approval workflows
- **Campaign**: Marketing campaign management
- **Analytics**: Performance tracking and reporting
- **Marketplace**: Content and boost marketplace features

### Performance Requirements
- API response time < 200ms
- Page load time < 1.5 seconds
- Dashboard load time < 0.8 seconds
- Database query time < 100ms

### Testing Strategy
- Unit tests with Jest (80% coverage target)
- Component tests with React Testing Library
- E2E tests with Playwright
- API integration tests

## Development Guidelines

### Code Style
- Follow the comprehensive `.cursorrules` file for all development standards
- Use TypeScript strict mode
- Implement proper error boundaries
- Follow RESTful API design principles

### Security
- All API endpoints require JWT authentication
- Input validation on all endpoints
- Rate limiting implementation
- PCI compliance for payment features

### Performance
- Implement proper caching strategies
- Use React Query for data fetching
- Optimize bundle sizes
- Database query optimization

### Project Status
This is a mature project at 95% completion, focusing on:
- Final documentation review
- System-wide testing and optimization
- CI/CD pipeline setup
- Security audits

When working on this codebase, prioritize maintaining existing patterns and architectural decisions. The project has extensive documentation in the `DOCS/` directory for reference.

### Optimization Gatekeeper Commands

```bash
# Analyze files for optimization violations
./optimize <file>                    # Quick analysis
./scripts/optimization-gatekeeper.sh analyze <file>  # Full analysis

# Git hooks and project validation
./scripts/optimization-gatekeeper.sh check-commit    # Pre-commit check
./scripts/optimization-gatekeeper.sh validate-project # Full project check

# Configuration and status
./scripts/optimization-gatekeeper.sh status         # System status
./scripts/optimization-gatekeeper.sh config         # View/edit config
```
