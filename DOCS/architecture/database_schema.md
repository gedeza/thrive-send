# Database Schema Documentation

## Schema Progress
```progress
Core Models:       [████████████████████] 100%
Relations:         [█████████████░░░░░░░] 67%
Indexes:           [███████████░░░░░░░░░] 53%
Enums:             [████░░░░░░░░░░░░░░░░] 20%
```## Core Models

### User
- Primary model for user authentication and profile management
- Fields: id, email, name, role, etc.
- Relations: Organization, Project, Campaign

### Organization
- Represents a company or business entity
- Fields: id, name, type, status, etc.
- Relations: User, Project, Client

### Project
- Represents a marketing or development project
- Fields: id, name, status, timeline, etc.
- Relations: Organization, User, Campaign

### Campaign
- Represents a marketing campaign
- Fields: id, name, status, metrics, etc.
- Relations: Project, User, Analytics

## Relations
- User ↔ Organization (Many-to-Many)
- User ↔ Project (Many-to-Many)
- Organization ↔ Project (One-to-Many)
- Project ↔ Campaign (One-to-Many)

## Indexes
- User: email, organizationId
- Organization: name, type
- Project: organizationId, status
- Campaign: projectId, status

## Enums
- UserRole: ADMIN, MANAGER, USER
- OrganizationType: AGENCY, CLIENT, PARTNER
- ProjectStatus: PLANNING, ACTIVE, COMPLETED
- CampaignStatus: DRAFT, ACTIVE, PAUSED, COMPLETED

## Analytics
- Campaign performance metrics
- User engagement statistics
- Project progress tracking
- Organization health indicators

## Security
- Role-based access control
- Data encryption
- Audit logging
- Rate limiting

## Maintenance
- Regular backups
- Performance optimization
- Schema versioning
- Migration tracking