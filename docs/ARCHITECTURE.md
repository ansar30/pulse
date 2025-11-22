# Architecture Overview

This document provides a high-level overview of the BusinessApp platform architecture.

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Client Layer                         │
├──────────────────────────┬──────────────────────────────────┤
│   Web (Next.js 14)       │   Mobile (React Native/Expo)     │
│   - TailwindCSS          │   - Nativewind                   │
│   - ShadCN UI            │   - Expo Router                  │
│   - Zustand              │   - AsyncStorage                 │
└──────────────────────────┴──────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                      API Gateway / CDN                       │
│                    (Load Balancer)                           │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    Backend API (NestJS)                      │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │   Auth   │  │  Tenants │  │  Users   │  │ Projects │   │
│  │  Module  │  │  Module  │  │  Module  │  │  Module  │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │         Common (Guards, Filters, Interceptors)       │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            │
          ┌─────────────────┼─────────────────┐
          ▼                 ▼                 ▼
┌──────────────────┐ ┌──────────────┐ ┌──────────────┐
│    MongoDB       │ │    Redis     │ │   BullMQ     │
│   (Prisma ORM)   │ │   (Cache)    │ │  (Jobs)      │
└──────────────────┘ └──────────────┘ └──────────────┘
```

## Technology Stack

### Frontend

**Web Application (Next.js 14)**
- **Framework**: Next.js with App Router
- **Styling**: TailwindCSS + ShadCN UI
- **State Management**: Zustand
- **HTTP Client**: Axios
- **Type Safety**: TypeScript

**Mobile Application (Expo)**
- **Framework**: React Native with Expo
- **Navigation**: Expo Router (file-based)
- **Styling**: Nativewind (TailwindCSS for RN)
- **Storage**: AsyncStorage
- **Type Safety**: TypeScript

### Backend

**API (NestJS)**
- **Framework**: NestJS (Node.js)
- **ORM**: Prisma
- **Authentication**: JWT with Passport
- **Validation**: class-validator
- **Documentation**: Auto-generated from decorators

### Database & Storage

- **Primary Database**: MongoDB (via Prisma)
- **Cache**: Redis
- **Queue**: BullMQ (Redis-based)
- **File Storage**: AWS S3 (configurable)

### DevOps

- **Monorepo**: Turborepo
- **Package Manager**: pnpm
- **Containerization**: Docker
- **CI/CD**: GitHub Actions
- **IaC**: Terraform (optional)

## Design Patterns

### Multi-Tenancy

The application uses a **shared database with tenant isolation** approach:

- Each business entity has a `tenantId` field
- Middleware enforces tenant isolation
- Super admins can access all tenants
- Regular users limited to their tenant

**Benefits:**
- Cost-effective for small to medium tenants
- Easy to manage and maintain
- Can migrate to dedicated databases later

### Authentication Flow

```
1. User registers → Creates tenant + user
2. User logs in → Receives JWT access + refresh tokens
3. Client stores tokens → Sends access token with requests
4. API validates token → Extracts user info
5. Guards check permissions → Allow/deny access
```

### API Response Format

All API responses follow a consistent format:

```typescript
{
  success: boolean;
  data?: any;
  errors?: Array<{
    field?: string;
    message: string;
    code?: string;
  }>;
  message?: string;
}
```

## Data Model

### Core Entities

**Tenant**
- Represents a company/organization
- Has many users and projects
- Contains billing and settings

**User**
- Belongs to one tenant
- Has role-based permissions
- Contains profile information

**Project**
- Belongs to one tenant
- Contains resources
- Has custom settings

**Resource**
- Belongs to one project
- Flexible metadata structure
- Type-based categorization

### Entity Relationships

```
Tenant (1) ──< (N) User
Tenant (1) ──< (N) Project
Project (1) ──< (N) Resource
User (1) ──< (N) AuditLog
```

## Security Architecture

### Authentication

- **JWT Tokens**: Stateless authentication
- **Refresh Tokens**: Long-lived for token renewal
- **Password Hashing**: bcrypt with salt rounds
- **Token Expiry**: Configurable expiration

### Authorization

- **Role-Based Access Control (RBAC)**
  - SUPER_ADMIN: Full system access
  - ADMIN: Tenant-level management
  - MEMBER: Standard user access
  - VIEWER: Read-only access

- **Tenant Isolation**: Enforced at middleware level
- **Route Guards**: Protect sensitive endpoints

### Data Protection

- **Encryption at Rest**: MongoDB encryption
- **Encryption in Transit**: HTTPS/TLS
- **Input Validation**: class-validator
- **SQL Injection Prevention**: Prisma ORM
- **XSS Protection**: React auto-escaping

## Scalability Considerations

### Horizontal Scaling

- **Stateless API**: Can run multiple instances
- **Load Balancer**: Distribute traffic
- **Session Storage**: Redis for shared state

### Database Scaling

- **Indexes**: Optimized for common queries
- **Connection Pooling**: Efficient connections
- **Read Replicas**: Separate read/write
- **Sharding**: Future consideration

### Caching Strategy

- **API Level**: Redis for frequently accessed data
- **Client Level**: React Query / SWR
- **CDN**: Static assets and pages

## Monitoring & Observability

### Logging

- **Structured Logs**: JSON format
- **Log Levels**: Error, Warn, Info, Debug
- **Centralized**: ELK stack or cloud service

### Metrics

- **Application Metrics**: Response times, error rates
- **Business Metrics**: User signups, projects created
- **Infrastructure Metrics**: CPU, memory, disk

### Tracing

- **Distributed Tracing**: OpenTelemetry
- **Request Tracking**: Correlation IDs
- **Performance Monitoring**: APM tools

## Folder Structure

### Monorepo Organization

```
business-app/
├── apps/
│   ├── api/                 # Backend API
│   │   ├── src/
│   │   │   ├── modules/     # Feature modules
│   │   │   ├── common/      # Shared utilities
│   │   │   ├── prisma/      # Database service
│   │   │   └── main.ts      # Entry point
│   │   └── prisma/
│   │       └── schema.prisma
│   │
│   ├── web/                 # Web application
│   │   ├── app/             # Next.js app router
│   │   ├── components/      # React components
│   │   ├── lib/             # Utilities
│   │   └── public/          # Static assets
│   │
│   └── mobile/              # Mobile application
│       ├── app/             # Expo router
│       └── src/             # Components & services
│
├── packages/
│   ├── types/               # Shared TypeScript types
│   └── config/              # Shared configurations
│
├── docker/                  # Docker configurations
├── docs/                    # Documentation
└── .github/                 # CI/CD workflows
```

## Development Workflow

### Local Development

1. Clone repository
2. Install dependencies (`pnpm install`)
3. Set up environment variables
4. Generate Prisma client
5. Start development servers

### Code Quality

- **Linting**: ESLint
- **Formatting**: Prettier
- **Type Checking**: TypeScript
- **Testing**: Jest (unit), Playwright (e2e)

### Git Workflow

- **main**: Production-ready code
- **develop**: Integration branch
- **feature/***: Feature branches
- **hotfix/***: Emergency fixes

## Deployment Architecture

### Production Environment

```
┌─────────────────────────────────────────┐
│              CloudFront CDN              │
└─────────────────────────────────────────┘
                    │
        ┌───────────┴───────────┐
        ▼                       ▼
┌───────────────┐      ┌───────────────┐
│  Vercel       │      │  AWS ECS      │
│  (Web App)    │      │  (API)        │
└───────────────┘      └───────────────┘
                              │
                    ┌─────────┴─────────┐
                    ▼                   ▼
            ┌──────────────┐    ┌──────────────┐
            │ MongoDB      │    │ Redis        │
            │ Atlas        │    │ ElastiCache  │
            └──────────────┘    └──────────────┘
```

## Future Enhancements

- **GraphQL API**: For flexible client queries
- **WebSockets**: Real-time features
- **Microservices**: Service decomposition
- **Event Sourcing**: Audit trail
- **CQRS**: Separate read/write models
- **Kubernetes**: Container orchestration

---

**For implementation details, see [GETTING_STARTED.md](./GETTING_STARTED.md)**
