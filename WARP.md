# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

**Master Aesthetics Suite** is a comprehensive single-tenant business management platform specifically designed for LEA Aesthetics Clinical Academy. It combines practice management, client booking, payment processing, and an integrated Learning Management System (LMS) for education and certification.

### System Architecture

This is a **single Next.js application** with the following key characteristics:
- **Single-tenant business suite** for LEA Aesthetics Clinical Academy
- **Integrated platform**: Practice management + Client portal + Student LMS + Business analytics  
- **Technology stack**: Next.js 15, Supabase, Stripe, TypeScript, TailwindCSS, Framer Motion
- **Deployment**: Single unified platform on Vercel

## Development Commands

### Development Server
```bash
# Start the Master Aesthetics Suite platform
pnpm dev

# The platform runs on http://localhost:3000
```

### Database Operations (Supabase)
```bash
# The platform uses Supabase as the primary database
# Database operations are handled via Supabase dashboard
# Connection configured via SUPABASE_URL and SUPABASE_ANON_KEY
```

### Legacy Database Operations (Prisma - Reference only)
```bash
# Generate Prisma client (for legacy schema reference only)
pnpm db:generate

# Run database migrations (for legacy schema reference only)
pnpm db:migrate

# Seed database with sample data (for legacy schema reference only)
pnpm db:seed
```

### Building and Testing
```bash
# Build the platform
pnpm build

# Lint codebase
pnpm lint

# Format code
pnpm format

# Run E2E tests
pnpm test:e2e:playwright
```

## High-Level Architecture

### Single-Tenant Structure
The Master Aesthetics Suite is designed for LEA Aesthetics Clinical Academy as a single-tenant solution with:

1. **Unified Data Model**: All data belongs to LEA Aesthetics - no tenant isolation needed
2. **Role-Based Access Control (RBAC)**: User roles for OWNER, PRACTITIONER, STUDENT, CLIENT access levels
3. **Supabase-Native Authentication**: Row Level Security (RLS) policies for data access control

### Core Domain Models

#### Practice Management
- **Appointments**: Booking system with practitioner availability
- **Clients**: Customer profiles with treatment history
- **Services**: Treatment offerings with pricing and scheduling
- **Payments**: Stripe integration for bookings and course payments
- **Business Settings**: Operational configuration for the academy

#### Learning Management System (LMS)
- **Courses**: Multi-level aesthetics training programs (Level 2, 3, 4)
- **Students**: Student profiles and enrollment tracking
- **Course Enrollments**: Progress tracking and completion status
- **Certificates**: Digital certification for completed courses

#### Content & Communications
- **Templates**: Document templates for legal compliance
- **Documents**: Generated legal documents and agreements
- **Messages**: Internal communication system
- **Campaigns**: Marketing and outreach management

### Authentication & Authorization
- **Supabase Auth**: Primary authentication system
- **Magic Link**: Email-based passwordless authentication
- **Social OAuth**: Google, Apple authentication (planned)
- **Role-based permissions**: Access control based on user roles

### Data Layer (Supabase)
The database schema is designed with:
- **Single-tenant architecture**: All data belongs to LEA Aesthetics
- **Comprehensive business models**: Practice management + LMS domains
- **Row Level Security (RLS)**: Access control via Supabase policies
- **Real-time subscriptions**: Live updates for bookings and progress

### Application Structure
- **Platform App** (`apps/platform`): Single Next.js 15 application containing all functionality
- **Shared UI** (`packages/ui`): Reusable components with LEA brand system
- **Shared Types** (`packages/shared`): TypeScript types and utilities
- **Legacy Packages**: AI, SDK packages (currently unused)

## Package Structure

### Applications (`apps/`)
- `platform/`: Single Next.js 15 application with all Master Aesthetics Suite functionality

### Packages (`packages/`)
- `ui/`: Shared React component library with LEA brand system
- `shared/`: TypeScript types, validation schemas, utilities
- `tsconfig/`: Shared TypeScript configurations
- `db/`: Legacy Prisma schema (reference only)
- `ai/`: AI services (currently unused)
- `sdk/`: Partner SDK (currently unused)

## Application Structure

### Next.js App Router Structure
```
apps/platform/app/
├── (auth)/                 # Authentication routes
│   ├── login/
│   └── register/
├── (practitioner)/         # Practitioner dashboard and management
│   ├── dashboard/
│   ├── clients/
│   ├── appointments/
│   └── business/
├── (student)/              # Student learning portal
│   ├── courses/
│   ├── progress/
│   └── certificates/
├── (client)/               # Client booking and portal
│   ├── book/
│   ├── profile/
│   └── appointments/
├── admin/                  # Admin interface
└── api/                    # API routes
    ├── auth/
    ├── appointments/
    ├── courses/
    ├── stripe/
    └── public/
```

### Component Architecture
```
components/
├── auth/                   # Authentication components
├── layout/                 # Layout and navigation components
├── practitioner/           # Practitioner-specific features
├── academy/                # LMS and student features
├── shared/                 # Shared utility components
└── ui/                     # Base UI components
```

## Configuration Management

### Environment Variables
The platform uses the following key environment variables:
- **Supabase**: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- **Stripe**: `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET`
- **Email**: `RESEND_API_KEY`
- **Storage**: `BLOB_READ_WRITE_TOKEN`
- **AI**: `GOOGLE_API_KEY` (for Google Gemini)

### Database Configuration
**Current Setup**: Supabase PostgreSQL
- **Primary Database**: Supabase hosted PostgreSQL
- **Authentication**: Supabase Auth with RLS policies
- **Real-time**: Supabase real-time subscriptions
- **Storage**: Supabase Storage for file uploads

### Legacy Infrastructure (Docker)
The `docker-compose.yml` exists for legacy development but is not actively used:
- PostgreSQL 16 (legacy Prisma setup)
- Redis 7 (planned for caching)
- MeiliSearch v1.7 (planned for search)

## Development Patterns

### Single-Tenant Development
When working with the Master Aesthetics Suite:
1. **No tenant scoping needed** - All data belongs to LEA Aesthetics
2. **Use Supabase RLS** - Row Level Security for access control
3. **Role-based UI** - Show/hide features based on user role

### API Development
- **Next.js API Routes**: RESTful endpoints in `app/api/`
- **Supabase Client**: Direct database access with RLS
- **Type Safety**: Full TypeScript integration
- **Zod Validation**: Request/response validation

### Frontend Development
- **Shared UI Components**: Use components from `packages/ui`
- **LEA Brand System**: Consistent styling and components
- **Responsive Design**: Mobile-first approach
- **Next.js 15 Features**: App Router, Server Components, Server Actions

## Critical Implementation Details

### Booking Engine
The appointment system includes:
- **Practitioner availability**: Schedule-based slot generation
- **Service duration**: Automatic time blocking based on treatment
- **Client preferences**: Preferred practitioners and times
- **Payment integration**: Deposit collection at booking

### Learning Management System
The LMS features include:
- **Course progression**: Module and lesson completion tracking
- **Student enrollment**: Registration and payment processing
- **Certificate generation**: Automated certification upon completion
- **Progress analytics**: Student performance tracking

### Payment Processing
Stripe integration supports:
- **Appointment deposits**: 25% deposit at booking
- **Course payments**: Full payment for course enrollment
- **Webhook handling**: Automated payment confirmation
- **Receipt generation**: Email receipts for all transactions

### Brand Implementation (LEA Aesthetics)
The LEA brand system includes:
- **Professional aesthetic**: Clean, medical-grade appearance
- **Color palette**: Medical blues, professional grays, accent colors
- **Typography**: Professional fonts with medical credibility
- **Components**: Specialized UI for aesthetics industry

## Current Development Status

### Implemented (≈45%)
- ✅ Next.js 15 application structure with App Router
- ✅ Supabase integration and authentication
- ✅ Basic page routing and navigation
- ✅ Component library foundation
- ✅ Stripe integration setup
- ✅ Database schema in Supabase

### In Progress (≈30%)
- 🔄 API endpoints completion
- 🔄 Authentication flow refinement
- 🔄 Booking system implementation
- 🔄 Payment processing workflows
- 🔄 LMS functionality

### Planned (≈25%)
- ❌ Advanced booking features
- ❌ Complete LMS implementation
- ❌ Document generation system
- ❌ Advanced analytics and reporting
- ❌ Mobile app optimization

## Common Development Tasks

### Adding New Features
1. **Database**: Create/modify Supabase tables and RLS policies
2. **API**: Add Next.js API routes in `app/api/`
3. **Frontend**: Create pages and components using shared UI
4. **Types**: Update shared types in `packages/shared`

### Testing Components
```bash
# Start development server
pnpm dev

# Test specific pages
# Visit http://localhost:3000/[route]

# Test API endpoints
# Use tools like Postman or curl to test /api/[endpoint]
```

### Working with Supabase
1. **Database changes**: Use Supabase Dashboard for schema updates
2. **RLS policies**: Configure access control via SQL policies
3. **Real-time**: Subscribe to table changes for live updates
4. **Storage**: Upload files via Supabase Storage

## Integration Points

### External Services
- **Supabase**: Database, authentication, storage, real-time
- **Stripe**: Payment processing and webhook handling
- **Resend**: Email notifications and marketing
- **Vercel Blob**: File storage (alternative to Supabase Storage)
- **Google Gemini**: AI-powered features (planned)

### API Endpoints
Current API structure in `app/api/`:
- **Auth**: `/api/auth/*` - Authentication endpoints
- **Public**: `/api/public/*` - Public booking and enrollment endpoints
- **Stripe**: `/api/stripe/*` - Payment webhook handling
- **Business**: `/api/business/*` - Internal business operations

## Security Features

### Authentication Security
- **Supabase Auth**: Industry-standard authentication
- **Row Level Security**: Database-level access control
- **JWT tokens**: Secure session management
- **Magic links**: Passwordless authentication option

### Data Protection
- **RLS policies**: Row-level security for all tables
- **API validation**: Zod schema validation on all endpoints
- **HTTPS encryption**: All data transmitted over HTTPS
- **Audit logging**: Track important business operations

## Brand Guidelines Integration

The LEA Aesthetics brand is integrated throughout:
- **Professional appearance**: Medical-grade UI design
- **Industry-specific components**: Aesthetics-focused interfaces
- **Accessibility compliance**: WCAG 2.1 AA standards
- **Mobile optimization**: Touch-friendly interfaces for tablets

## Known Issues & Current State

### Architecture Decisions
- **Single-tenant focus**: Designed specifically for LEA Aesthetics Clinical Academy
- **Supabase-first**: Primary database and authentication via Supabase
- **Prisma legacy**: Old multi-tenant Prisma schema kept for reference only
- **Unified application**: Single Next.js app instead of multiple microservices

### Development Priority
1. **Complete booking system**: Practitioner scheduling and client booking
2. **Finalize payment flows**: Stripe integration for all payment types  
3. **Build LMS features**: Course management and student progress
4. **Implement document generation**: Legal forms and certificates
5. **Add advanced analytics**: Business intelligence and reporting

This Master Aesthetics Suite is specifically built for LEA Aesthetics Clinical Academy as a comprehensive single-tenant business management platform combining practice management with educational services.
