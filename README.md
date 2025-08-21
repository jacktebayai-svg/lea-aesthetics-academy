# Master Aesthetics Suite

**Master Aesthetics Suite** is a comprehensive single-tenant business management platform specifically designed for LEA Aesthetics Clinical Academy. It combines practice management, client booking, payment processing, and an integrated Learning Management System (LMS) for education and certification.

## 🏗️ Architecture

This is a **single Next.js application** monorepo with the following structure:
- **Single-tenant platform** for LEA Aesthetics Clinical Academy
- **Integrated functionality**: Practice management + Client portal + Student LMS + Business analytics
- **Technology stack**: Next.js 15, Supabase, Stripe, TypeScript, TailwindCSS, Framer Motion
- **Deployment**: Unified platform on Vercel

## 📁 Project Structure

```
master-aesthetics-suite/
├── apps/
│   └── platform/           # Single Next.js 15 application (all functionality)
├── packages/
│   ├── ui/                 # Shared React components (LEA brand system)
│   ├── shared/             # TypeScript types, validation schemas, utilities
│   ├── tsconfig/           # Shared TypeScript configurations
│   ├── db/                 # Legacy Prisma schema (reference only)
│   ├── ai/                 # AI services (currently unused)
│   └── sdk/                # Partner SDK (currently unused)
└── docs/
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18.17.0+
- pnpm 9.4.0
- Supabase account (database & auth)
- Stripe account (payments)

### Installation

1. **Clone and install dependencies:**
   ```bash
   git clone <repository-url>
   cd master-aesthetics-suite
   pnpm install
   ```

2. **Set up environment variables:**
   ```bash
   cp apps/platform/.env.example apps/platform/.env.local
   ```
   
   Configure your `.env.local` with:
   ```env
   # Supabase
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_key
   
   # Stripe
   STRIPE_SECRET_KEY=your_stripe_secret_key
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
   STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
   
   # Email & Storage
   RESEND_API_KEY=your_resend_api_key
   BLOB_READ_WRITE_TOKEN=your_vercel_blob_token
   
   # AI (optional)
   GOOGLE_API_KEY=your_google_gemini_key
   ```

3. **Set up the database:**
   - Create a Supabase project
   - Run the SQL scripts in `apps/platform/supabase/` to set up tables and RLS policies
   - Verify setup with: `node apps/platform/scripts/verify-supabase-setup.js`

4. **Start the development server:**
   ```bash
   pnpm dev
   ```
   
   The Master Aesthetics Suite will be available at `http://localhost:3000`

## 🔧 Development Commands

### Primary Development
```bash
# Start the Master Aesthetics Suite platform
pnpm dev

# Build for production
pnpm build

# Run linting
pnpm lint

# Format code
pnpm format
```

### Legacy Database (Prisma - Reference Only)
```bash
# Generate Prisma client (legacy schema reference)
pnpm db:generate

# Run legacy migrations
pnpm db:migrate

# Seed legacy database
pnpm db:seed
```

### Testing
```bash
# Run E2E tests
pnpm test:e2e:playwright
```

## 🏢 Business Features

### Practice Management
- **Client Management**: Profile management, medical history, treatment tracking
- **Appointment Booking**: Availability-based scheduling with practitioner assignment
- **Service Management**: Treatment offerings with pricing and duration
- **Payment Processing**: Stripe integration for deposits and full payments
- **Business Settings**: Operational configuration and customization

### Learning Management System (LMS)
- **Course Management**: Multi-level aesthetics training programs (Level 2, 3, 4)
- **Student Portal**: Enrollment, progress tracking, and certification
- **Content Delivery**: Structured educational content with assessments
- **Certificate Generation**: Automated digital certification upon completion
- **Progress Analytics**: Student performance tracking and reporting

### Client & Student Portals
- **Client Portal**: Booking management, appointment history, profile management
- **Student Portal**: Course access, progress tracking, certificate management
- **Responsive Design**: Mobile-optimized for tablets and smartphones
- **Real-time Updates**: Live booking and progress updates via Supabase

## 🛠️ Technical Details

### Application Routes
```
apps/platform/app/
├── (auth)/                 # Authentication (login, register)
├── (practitioner)/         # Practitioner dashboard & management
├── (student)/              # Student learning portal
├── (client)/               # Client booking & portal
├── admin/                  # Admin interface
└── api/                    # API endpoints
    ├── auth/               # Authentication
    ├── appointments/       # Booking system
    ├── courses/            # LMS functionality
    ├── stripe/             # Payment processing
    └── public/             # Public booking endpoints
```

### Database (Supabase)
- **Single-tenant architecture**: All data belongs to LEA Aesthetics
- **Row Level Security (RLS)**: Access control via policies
- **Real-time subscriptions**: Live updates for bookings and progress
- **Comprehensive schema**: Practice management + LMS domains

### Authentication & Authorization
- **Supabase Auth**: Primary authentication system
- **Role-based access**: OWNER, PRACTITIONER, STUDENT, CLIENT roles
- **Magic links**: Passwordless authentication option
- **JWT tokens**: Secure session management

## 🎨 Brand System

The Master Aesthetics Suite implements the LEA Aesthetics brand system:
- **Professional aesthetic**: Clean, medical-grade appearance
- **Color palette**: Medical blues, professional grays, accent colors
- **Typography**: Professional fonts with medical credibility
- **Components**: Specialized UI for aesthetics industry
- **Accessibility**: WCAG 2.1 AA compliant

## 🚢 Deployment

### Vercel (Recommended)
1. **Connect repository** to Vercel
2. **Configure project**:
   - Framework: Next.js
   - Root Directory: `apps/platform`
   - Build Command: `cd ../.. && pnpm build --filter=platform`
   - Install Command: `cd ../.. && pnpm install`

3. **Set environment variables** in Vercel dashboard
4. **Deploy** - automatic deployments on push to main

### Environment Variables for Production
Ensure all environment variables from `.env.local` are configured in your deployment platform.

## 🧪 Development Status

### ✅ Completed (≈45%)
- Next.js 15 application structure with App Router
- Supabase integration and authentication
- Basic page routing and navigation  
- Component library foundation
- Stripe integration setup
- Database schema in Supabase

### 🔄 In Progress (≈30%)
- API endpoints completion
- Authentication flow refinement
- Booking system implementation
- Payment processing workflows
- LMS functionality

### 📋 Planned (≈25%)
- Advanced booking features
- Complete LMS implementation
- Document generation system
- Advanced analytics and reporting
- Mobile app optimization

## 🤝 Contributing

1. Create feature branch from `main`
2. Make changes following existing patterns
3. Test thoroughly
4. Submit pull request with clear description

### Code Style
- **TypeScript strict mode** enforced
- **ESLint + Prettier** for consistent formatting
- **Component patterns** follow established conventions
- **Supabase RLS** for all data access

## 📚 Documentation

- **WARP.md**: Complete development guide for WARP AI
- **IMPLEMENTATION_STATUS.md**: Detailed feature implementation status
- **apps/platform/docs/**: Architecture decisions and migration progress

## 🆘 Support

For development support:
1. Check existing documentation in `/docs/`
2. Review implementation status in `IMPLEMENTATION_STATUS.md`
3. Test database setup with verification scripts
4. Consult WARP.md for comprehensive development guidance

## 📄 License

Proprietary - LEA Aesthetics Clinical Academy

---

**Master Aesthetics Suite** - Empowering aesthetics professionals with comprehensive business management and education tools.
