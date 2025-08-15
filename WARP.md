# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

**Lea's Aesthetics Clinical Academy (LACA)** is a comprehensive multitenant SaaS platform that combines aesthetics practice management with a learning management system (LMS). The platform serves both the clinical operations of aesthetic practices and educational services for practitioners.

### System Architecture

This is a **Turborepo monorepo** with the following key characteristics:
- **Multi-tenant SaaS** for aesthetics clinics and solo practitioners
- **Dual-purpose platform**: Clinical practice management + Learning management system
- **Technology stack**: Next.js 15, NestJS, Prisma, PostgreSQL, Redis, MeiliSearch
- **Deployment**: Vercel (frontend) + Railway (API)

## Development Commands

### Environment Setup
```bash
# Start infrastructure services
pnpm stack:up

# Stop infrastructure services  
pnpm stack:down

# Generate Prisma client
pnpm db:generate

# Run database migrations
pnpm db:migrate

# Seed database with sample data
pnpm db:seed
```

### Development Servers
```bash
# Start all applications in development mode
pnpm dev

# Start specific applications
pnpm --filter api start:dev     # API server (http://localhost:3333)
pnpm --filter web dev           # Web app (http://localhost:3000) 
pnpm --filter admin dev         # Admin app (http://localhost:3001)

# Start with specific ports for admin
PORT=3001 pnpm --filter admin dev
```

### Building and Testing
```bash
# Build all applications
pnpm build

# Lint codebase
pnpm lint

# Format code
pnpm format

# Run E2E tests
pnpm test:e2e:playwright
```

## High-Level Architecture

### Multi-Tenant Structure
The system is designed around **tenant isolation** with the following key concepts:

1. **Tenant-Scoped Data**: Most models include `tenantId` for row-level isolation
2. **Role-Based Access Control (RBAC)**: Comprehensive permission system with roles like OWNER, MANAGER, PRACTITIONER, FRONTDESK, FINANCE, SUPPORT, CLIENT
3. **Middleware-Based Isolation**: Automatic tenant scoping via Prisma middleware and NestJS guards

### Core Domain Models

#### Practice Management
- **Appointments**: Booking system with availability engine
- **Clients**: Customer profiles with medical history
- **Practitioners**: Provider profiles with specialties and availability
- **Services**: Treatment offerings with pricing and duration
- **Payments**: Stripe integration for deposits and full payments
- **Documents**: Legal document generation with e-signature support

#### Learning Management System (LMS)
- **Courses**: Multi-level training programs (Level 2, 3, 4)
- **Modules & Lessons**: Structured educational content
- **Assessments**: Quizzes and examinations with grading
- **Enrollments**: Student progress tracking
- **Certificates**: Digital certification issuance

### Authentication & Authorization
- **JWT-based authentication** with refresh tokens
- **External auth providers** (Auth0/Clerk) planned
- **Comprehensive RBAC** with permission matrices
- **Multi-tenant user management** with role assignments per tenant

### Data Layer (Prisma Schema)
The database schema is comprehensive and production-ready with:
- **Multi-tenant isolation** (tenantId fields)
- **Comprehensive business models** for both domains
- **Proper relationships** and constraints
- **Audit trails** and versioning for critical data

### API Structure (NestJS)
- **Domain-driven design** with separate modules
- **Swagger documentation** auto-generated
- **Global middleware** for tenant scoping and authentication
- **Rate limiting** and security headers configured
- **Comprehensive error handling** with global exception filters

### Frontend Applications
- **Web App** (`apps/web`): Tenant websites, booking portal, client portal
- **Admin App** (`apps/admin`): Backoffice management for tenants
- **Shared UI** (`packages/ui`): Design system components
- **Maerose Brand System**: Luxury aesthetic theme with precise design tokens

## Package Structure

### Applications (`apps/`)
- `api/`: NestJS backend API with comprehensive business logic
- `web/`: Next.js 15 tenant-facing application with booking system
- `admin/`: Next.js 15 admin dashboard for practice management
- `worker/`: Background job processing (BullMQ)

### Packages (`packages/`)
- `ui/`: Shared React component library with Maerose design system
- `db/`: Prisma schema and database utilities
- `shared/`: TypeScript types, validation schemas, utilities
- `ai/`: AI orchestration and content generation services
- `sdk/`: Partner/third-party SDK
- `tsconfig/`: Shared TypeScript configurations

## Configuration Management

### Environment Variables
The system uses environment-specific configuration:
- **Development**: `.env.local` files in each app
- **Production**: Environment variables via deployment platforms

### Database Configuration
**Current Setup**: PostgreSQL with the following services:
- **Database**: `postgresql://irwell_user:irwell_secure_password_2024@localhost:55433/irwell_hospitality`
- **Redis**: `localhost:6379` for caching and job queues
- **MeiliSearch**: `localhost:7700` for search functionality

### Docker Services
The `docker-compose.yml` defines development infrastructure:
- PostgreSQL 16 (port 55433)
- Redis 7 (port 6379) 
- MeiliSearch v1.7 (port 7700)

## Development Patterns

### Multi-Tenant Development
When working with tenant-scoped features:
1. **Always use tenant context** - Data should be automatically scoped by middleware
2. **Respect role permissions** - Check RBAC before operations
3. **Use Prisma middleware** - Automatic tenant filtering is configured

### API Development
- **Use NestJS decorators** for routing and validation
- **Implement proper DTOs** with class-validator
- **Add Swagger documentation** using decorators
- **Follow domain-driven structure** - group related functionality

### Frontend Development
- **Use shared UI components** from `packages/ui`
- **Follow Maerose design system** - luxury aesthetic with specific color palette
- **Implement responsive design** - mobile-first approach
- **Use Next.js 15 features** - App Router and React Server Components

## Critical Implementation Details

### Booking Engine
The availability system is sophisticated with:
- **Multi-practitioner support** with individual schedules
- **Service-specific buffers** (prep/cleanup time)
- **Location-based availability** across multiple sites
- **Real-time conflict detection** and slot calculation

### Document Management
Legal compliance features include:
- **Template versioning** with jurisdiction-specific content
- **Mandatory block validation** for legal requirements
- **Cryptographic stamping** for document integrity
- **E-signature workflow** integration planned

### Payment Processing
Stripe integration supports:
- **Deposit workflows** with final payment collection
- **Webhook handling** with idempotency
- **Multi-tenant payment isolation**
- **Refund and dispute management**

### Brand Implementation (Maerose)
The luxury aesthetic follows strict brand guidelines:
- **Color palette**: Primary Noir (#1A1A1A), Champagne Gold (#C5A880), Ivory White (#FFFFFF)
- **Typography**: Inter font family with specific sizing scales
- **Animation**: Smooth, deliberate interactions (300ms standard)
- **Spacing**: Generous whitespace with systematic spacing scale

## Current Development Status

### Implemented (≈50%)
- ✅ Monorepo structure with proper tooling
- ✅ Comprehensive database schema
- ✅ Basic API controllers and services
- ✅ Authentication system foundation
- ✅ Frontend applications scaffolded
- ✅ Docker development environment

### In Progress
- 🔄 Multi-tenant middleware completion
- 🔄 Production-ready booking engine
- 🔄 Payment integration finalization
- 🔄 Document generation system
- 🔄 LMS content delivery

### Planned
- ❌ Production deployment infrastructure
- ❌ Comprehensive testing coverage
- ❌ Performance optimization
- ❌ AI-powered features
- ❌ Advanced search integration

## Common Development Tasks

### Adding New Features
1. **API**: Create controller/service in appropriate domain module
2. **Database**: Add Prisma model updates with proper tenant scoping
3. **Frontend**: Use shared UI components and follow Maerose design system
4. **Types**: Update shared types in `packages/shared`

### Testing Individual Components
```bash
# Test specific API endpoints
pnpm --filter api test

# Test database operations
pnpm db:migrate && pnpm db:seed

# Test frontend components  
pnpm --filter web dev
```

### Debugging Multi-Tenant Issues
1. Check tenant middleware is properly configured
2. Verify JWT token contains correct tenant claims
3. Ensure Prisma queries include tenant scoping
4. Review role-based permission checks

## Integration Points

### External Services
- **Stripe**: Payment processing and webhook handling
- **Auth0/Clerk**: External authentication (planned)
- **SendGrid**: Email notifications
- **Vercel Blob**: File storage
- **Railway**: API deployment

### API Documentation
- **Swagger UI**: Available at `http://localhost:3333/api/docs` in development
- **Comprehensive tags**: Authentication, Users, Services, Appointments, Payments, Documents

## Performance Considerations

### Database Optimization
- **Tenant-scoped indexes** for performance
- **Proper foreign key relationships** with cascade deletes
- **Connection pooling** configured via Prisma

### Frontend Performance
- **Next.js 15 optimizations** with App Router
- **Shared component caching** via Turborepo
- **Image optimization** for luxury brand assets

## Security Features

### API Security
- **Helmet.js** for security headers
- **Rate limiting** via Throttler
- **CORS** configuration for allowed origins
- **Input validation** with class-validator
- **JWT authentication** with refresh tokens

### Data Protection
- **Row-level security** for tenant isolation
- **Encrypted sensitive data** via Prisma
- **Audit trails** for critical operations
- **GDPR compliance** considerations

## Brand Guidelines Integration

The Maerose aesthetic is deeply integrated into the codebase:
- **Design tokens** defined in Tailwind configuration
- **Component library** follows strict brand standards
- **Animation guidelines** ensure luxury feel
- **Accessibility compliance** (WCAG 2.2 AA)

When developing UI components, always reference the technical implementation guide in `Maerose/TECHNICAL_IMPLEMENTATION_GUIDE.md` for precise specifications.

## Known Issues & Workarounds

### Development Environment
- **Port conflicts**: Ensure Docker services are running on correct ports
- **Database connection**: Verify connection string matches docker-compose configuration
- **PNPM caching**: Use `pnpm install --frozen-lockfile=false` if lockfile issues arise

### Build Issues
- **TypeScript strict mode**: Project uses strict TypeScript configuration
- **Workspace dependencies**: Use `workspace:*` for internal package references
- **Turborepo caching**: May need to clear cache with `pnpm turbo clean` if builds fail
