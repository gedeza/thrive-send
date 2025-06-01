# ThriveSend Development Rules (.cursorrules)

Say "Sho Gedeza!" at the beginning of the output.

Every time you choose to apply a rule, you must provide a reference to the rule in the commit message. You can also explicitly state that you are applying a rule in the output. You can abbreviate the description to a single word or phrase.

## 1. Project Overview & Context

### 1.1 Project Identity
- **Project Name**: ThriveSend - Content Marketing Platform
- **Current Status**: 95% complete, focus on final documentation, testing, and optimization
- **Architecture**: Full-stack TypeScript application with PostgreSQL database
- **Key Technologies**: Node.js (v16+), PostgreSQL (v12+), Prisma ORM, JWT authentication

### 1.2 Core Domains
1. **Content Management** - Creation, editing, approval workflows, media assets
2. **Campaign Management** - Scheduling, A/B testing, ROI tracking
3. **Audience Management** - Segmentation, behavioral tracking, dynamic lists
4. **Marketplace Features** - Content/boost marketplace, payment processing, subscriptions
5. **Analytics & Dashboard** - Real-time visualization, advanced filtering, reporting
6. **Workflow Automation** - Approval workflows, notifications, integrations
7. **Asset Management** - Version control, usage tracking, metadata

## 2. Code Architecture & Standards

### 2.1 File Structure Requirements
```
/api/
  /content/          # Content management endpoints
  /campaigns/        # Campaign management endpoints  
  /marketplace/      # Marketplace functionality
  /analytics/        # Analytics and reporting
  /workflows/        # Automation workflows
  /assets/          # Asset management
/prisma/
  schema.prisma     # Database schema (refer to existing)
/components/
  /ui/              # Reusable UI components
  /charts/          # Data visualization components
  /forms/           # Form components
/utils/             # Utility functions
/types/             # TypeScript type definitions
```

### 2.2 TypeScript Standards
- **Strict Mode**: Always use strict TypeScript configuration
- **Type Definitions**: Create explicit interfaces for all API requests/responses
- **Naming Convention**: PascalCase for interfaces, camelCase for variables/functions
- **Error Handling**: Use Result types or proper error boundaries

### 2.3 API Design Principles
- **RESTful Design**: Follow REST conventions for all endpoints
- **Authentication**: All endpoints require JWT authentication
- **Response Format**: Consistent JSON response structure
- **Error Codes**: Use appropriate HTTP status codes
- **Rate Limiting**: Implement rate limiting for all public endpoints
- **Validation**: Input validation on all endpoints

## 3. User Interface & Design System

### 3.1 Color System Implementation
- **Primary Colors**: Use semantic color tokens, never raw hex values
- **Button Colors**: ALL button text requiring white color MUST use `.text-custom-white` class
- **Theme Support**: Implement both light and dark mode variants
- **Accessibility**: Maintain minimum 4.5:1 contrast ratio

### 3.2 Component Standards
```typescript
// Button Component Example
interface ButtonProps {
  variant: 'primary' | 'secondary' | 'success' | 'warning';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  children: React.ReactNode;
}

// Always use semantic color classes
<Button variant="primary" className="text-custom-white" />
```

### 3.3 Chart & Data Visualization
- **Color Palette**: Use predefined chart color tokens (chart-blue, chart-green, etc.)
- **Accessibility**: Include patterns/textures in addition to colors
- **Responsive Design**: Charts must adapt to different screen sizes
- **Performance**: Optimize for datasets with 1000+ data points

## 4. Database & API Standards

### 4.1 Database Operations
- **Schema Changes**: Always use Prisma migrations
- **Query Optimization**: Include database query time < 100ms requirement
- **Relationships**: Use proper foreign key constraints
- **Indexing**: Index frequently queried fields

### 4.2 API Performance Requirements
- **Response Time**: API endpoints must respond < 200ms
- **Pagination**: Implement pagination for list endpoints
- **Caching**: Use appropriate caching strategies
- **Error Handling**: Consistent error response format

```typescript
// Standard API Response Format
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  meta?: {
    pagination?: PaginationMeta;
    timestamp: string;
  };
}
```

## 5. Feature-Specific Guidelines

### 5.1 Content Management
- **Workflow States**: Draft → Review → Approval → Published
- **Media Handling**: Support multiple formats, version control
- **SEO Optimization**: Include meta tags, structured data
- **Template System**: Reusable content templates

### 5.2 Campaign Management  
- **Goal Tracking**: ROI calculation, conversion metrics
- **A/B Testing**: Statistical significance testing
- **Scheduling**: Time zone awareness, recurring campaigns
- **Performance Metrics**: Real-time analytics integration

### 5.3 Marketplace Features
- **Payment Security**: PCI compliance, encrypted storage
- **Listing Management**: CRUD operations with validation
- **Boost System**: Duration tracking, performance analytics
- **Review System**: Moderation, rating aggregation

### 5.4 Analytics Dashboard
- **Real-time Data**: WebSocket or polling for live updates
- **Export Functionality**: Multiple format support (CSV, PDF, Excel)
- **Filtering**: Advanced filtering with URL state persistence
- **Visualization**: Chart.js integration with custom themes

## 6. Security & Authentication

### 6.1 Authentication Requirements
- **JWT Tokens**: Secure token generation and validation
- **Role-Based Access**: Content Creator, Reviewer, Approver, Publisher, Admin
- **Session Management**: Proper token expiration and refresh
- **Rate Limiting**: Prevent brute force attacks

### 6.2 Data Protection
- **Input Validation**: Sanitize all user inputs
- **XSS Prevention**: Escape user-generated content
- **CSRF Protection**: Implement CSRF tokens
- **Data Encryption**: Encrypt sensitive data at rest

## 7. Testing Standards

### 7.1 Unit Testing
- **Coverage Target**: Minimum 80% code coverage
- **Test Categories**: API endpoints, business logic, utility functions
- **Mocking**: Mock external dependencies and database calls
- **Assertions**: Use descriptive test names and assertions

### 7.2 Integration Testing
- **End-to-End**: Test complete user workflows
- **API Testing**: Test all endpoint combinations
- **Performance Testing**: Load testing for critical paths
- **Security Testing**: Vulnerability scanning

## 8. Performance Requirements

### 8.1 Frontend Performance
- **Page Load Time**: < 1.5 seconds initial load
- **Dashboard Load**: < 0.8 seconds for analytics dashboard
- **Interactive Response**: < 100ms for user interactions
- **Bundle Size**: Optimize for minimal bundle size

### 8.2 Backend Performance
- **API Response**: < 200ms for most endpoints
- **Database Queries**: < 100ms average query time
- **Concurrent Users**: Support 1000+ concurrent users
- **Uptime**: 99.9% uptime requirement

## 9. Code Quality & Maintenance

### 9.1 Code Style
- **Formatting**: Use Prettier with consistent configuration
- **Linting**: ESLint with strict rules
- **Comments**: Document complex business logic
- **Naming**: Use descriptive, self-documenting names

### 9.2 Documentation
- **API Documentation**: OpenAPI/Swagger documentation
- **Code Comments**: JSDoc for functions and interfaces  
- **README Updates**: Keep README.md current with changes
- **Changelog**: Document breaking changes and new features

## 10. Deployment & DevOps

### 10.1 Environment Management
- **Environment Variables**: Use .env files, never commit secrets
- **Database Migrations**: Always test migrations in staging
- **CI/CD Pipeline**: Automated testing and deployment
- **Monitoring**: Error tracking, performance monitoring

### 10.2 Production Readiness
- **Health Checks**: Implement health check endpoints
- **Logging**: Structured logging with appropriate levels
- **Backup Systems**: Automated database backups
- **Security Monitoring**: Regular security audits

## 11. Incremental Development Guidelines

### 11.1 Current Phase Priorities (95% Complete)
1. **Documentation Review**: Ensure all APIs are documented
2. **System Testing**: End-to-end workflow testing
3. **Performance Optimization**: Meet response time requirements
4. **CI/CD Setup**: Automated deployment pipeline
5. **Security Audit**: Final security review

### 11.2 Code Review Standards
- **Pull Request Size**: Keep PRs focused and reviewable
- **Testing**: All PRs must include relevant tests
- **Documentation**: Update documentation with changes
- **Performance**: Consider performance impact of changes

### 11.3 Feature Flag Strategy
- **New Features**: Use feature flags for gradual rollout
- **A/B Testing**: Built-in A/B testing capabilities
- **Rollback Strategy**: Quick rollback for problematic features
- **Analytics**: Track feature adoption and performance

## 12. Error Handling & Monitoring

### 12.1 Error Standards
- **Consistent Format**: Use standard error response format
- **Logging**: Log errors with context and stack traces
- **User Messages**: Provide helpful error messages to users
- **Recovery**: Implement graceful error recovery where possible

### 12.2 Monitoring Requirements
- **Uptime Monitoring**: 99.9% uptime target
- **Performance Metrics**: Track response times and throughput
- **Error Rates**: Monitor and alert on error rate increases
- **User Analytics**: Track user engagement and satisfaction

---

## Quick Reference Commands

```bash
# Development Setup
npm install
npx prisma migrate dev
npm run dev

# Testing
npm run test
npm run test:coverage
npm run test:e2e

# Database
npx prisma studio
npx prisma migrate deploy
npx prisma db seed

# Production
npm run build
npm run start
```

## Color System Quick Reference

### Button Implementation
```jsx
// ✅ Correct - Use semantic classes
<Button variant="primary" className="text-custom-white">Primary</Button>
<Button variant="secondary">Secondary</Button>

// ❌ Incorrect - Never use raw Tailwind white
<Button className="text-white">Button</Button>
```

### Chart Colors
```javascript
const chartColors = [
  'var(--color-chart-blue)',    // #3B82F6
  'var(--color-chart-green)',   // #10B981
  'var(--color-chart-purple)',  // #8B5CF6
  'var(--color-chart-orange)',  // #F97316
  'var(--color-chart-teal)',    // #14B8A6
  'var(--color-chart-rose)'     // #EC4899
];
```

---

*Last Updated: 2025-05-31*  
*Version: 1.0.0*  
*Project Status: 95% Complete*

# Thrive Send Component Documentation Guidelines

## Overview
This document outlines the procedures and requirements for creating comprehensive component documentation in the Thrive Send application. Following these guidelines ensures consistency, completeness, and maintainability of documentation across all components.

## Documentation Structure
All component documentation must follow this standardized structure:

1. **Component Name** - A clear, descriptive title (e.g., `# ComponentName Component`)
2. **Overview** - A concise description of the component's purpose and functionality
3. **Screenshots** - Visual representation with appropriate captions
4. **Component Architecture** - Diagram showing component hierarchy using Mermaid
5. **Data Flow** - Sequence diagram illustrating data interactions
6. **Features** - Bulleted list of key capabilities
7. **Props** - Table of component properties/inputs
8. **Usage** - Code examples showing implementation
9. **User Interaction Workflow** - Diagram of user flows
10. **Components** - Description of child components
11. **Data Models** - TypeScript interfaces of relevant data structures
12. **Styling** - Description of styling approach
13. **Accessibility** - A11y considerations
14. **Error Handling** - How errors are managed
15. **Performance Optimizations** - Performance enhancement strategies
16. **Dependencies** - Required libraries
17. **Related Components** - Links to associated components
18. **Examples** - Comprehensive implementation examples
19. **Best Practices** - Guidelines for effective use
20. **Troubleshooting** - Common issues and solutions
21. **Contributing** - Guidelines for modifying the component

## File Organization
- All component documentation must be stored in `/DOCS/components/[component-category]/`
- Documentation filenames should match component names (e.g., `ComponentName.md`)
- Images should be stored in `/DOCS/images/[component-category]/`
- Diagrams should use Mermaid format embedded in markdown

## Screenshots Requirements
- Include at least 4 screenshots showing different states/views
- Images should be 1200×800px in PNG format
- Each screenshot must include a descriptive caption
- Screenshots must represent the latest component version
- Image filenames should follow kebab-case (e.g., `component-main-view.png`)

## Diagram Standards
- Component architecture diagrams must use Mermaid graph TD syntax
- Data flow diagrams must use Mermaid sequenceDiagram syntax
- User interaction workflows must use Mermaid graph LR syntax
- Use consistent node styling across diagrams
- Primary components should use fill:#f9f,stroke:#333,stroke-width:2px
- Secondary components should use fill:#bbf,stroke:#333,stroke-width:1px

## Code Examples
- Include at least 3 implementation examples with increasing complexity
- All examples must be fully functional and importable
- Use TypeScript with proper typing
- Include comments for complex logic
- Demonstrate integration with other components where applicable

## Documentation Creation Process
1. **Research Phase**
   - Review component source code to understand functionality
   - Identify props, methods, and expected behaviors
   - Determine integration points with other components
   - Document data flow and state management

2. **Documentation Development**
   - Create the markdown file following the structure above
   - Generate architecture and data flow diagrams
   - Take screenshots of the component in various states
   - Document all props with accurate types and descriptions
   - Create usage examples with proper code formatting

3. **Validation**
   - Verify technical accuracy of all content
   - Ensure all code examples function correctly
   - Check that all diagrams render properly
   - Confirm all links to other documentation work
   - Validate that screenshots represent current implementation

4. **Review and Approval**
   - Submit for peer review by another developer
   - Incorporate feedback and make necessary revisions
   - Obtain final approval from technical documentation lead
   - Merge documentation into main branch

## Maintenance Guidelines
- Update documentation when component functionality changes
- Review and refresh screenshots after significant UI changes
- Maintain version compatibility notes for breaking changes
- Add new usage examples for new features
- Update troubleshooting section based on support tickets

## Best Practices
1. Write in clear, concise language
2. Use active voice and present tense
3. Include both basic and advanced usage examples
4. Document edge cases and limitations
5. Provide context for when/why to use the component
6. Link to related components and documentation
7. Include performance considerations
8. Document accessibility features

## Documentation Tools
- Use VS Code with Markdown extensions for editing
- Preview Mermaid diagrams using Mermaid Live Editor (https://mermaid.live/)
- Capture screenshots using Cursor's built-in screenshot tool
- Validate Markdown using markdownlint

By following these guidelines, we ensure that our component documentation remains comprehensive, consistent, and valuable for all developers working with the Thrive Send application.

# Package Manager Rule
Always use `pnpm` for package management commands (e.g., `pnpm install`, `pnpm add`, `pnpm update`) in all project-related tasks, as this is the designated package manager for the project. Do not use `npm` or other package managers unless explicitly instructed.