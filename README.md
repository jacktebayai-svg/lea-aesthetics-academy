# Lea's Aesthetics Master Suite

This is the monorepo for the Master Aesthetics Suite for Lea's Clinical Academy. It contains the web application for clients and students, as well as shared packages for UI, types, and utilities.

## Project Structure

This repository is a monorepo managed by [Turborepo](https://turbo.build/repo).

- `apps/web`: The main Next.js application for the tenant websites, booking, and client/student portals.
- `packages/ui`: A shared package of React UI components used across the applications.
- `packages/shared`: Shared TypeScript types, validation schemas, and utility functions.
- `packages/tsconfig`: Shared TypeScript configurations.

## Getting Started

### Vercel Dev via GitHub (Monorepo)

#### API Deployment to Railway (CI/CD)

- Create a Railway project and service for the API
- Add GitHub repo in Railway, or use the provided GitHub Action
- Configure GitHub secrets on your repo:
  - RAILWAY_TOKEN: Railway account token
  - RAILWAY_SERVICE_ID: Service ID for the API service
- Configure Railway environment variables:
  - DATABASE_URL, REDIS_URL, JWT_SECRET, STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET
  - STORAGE_PROVIDER=vercel-blob, BLOB_READ_WRITE_TOKEN, BLOB_PUBLIC_BASE_URL
  - WEB_ORIGIN: comma-separated Vercel preview domains
- On Vercel (web/admin), set NEXT_PUBLIC_API_BASE to the Railway API URL

- Push main to GitHub (already configured). In Vercel, import the repo.
- Create two projects from the monorepo:
  - Project 1: apps/web (Framework: Next.js)
    - Root Directory: apps/web
    - Build command: pnpm --filter web build
    - Install command: pnpm install --frozen-lockfile
    - Output directory: .next
    - Env: NEXT_PUBLIC_API_BASE=https://api.dev.yourdomain.com (or Railway/Fly API)
  - Project 2: apps/admin (Framework: Next.js)
    - Root Directory: apps/admin
    - Build command: pnpm --filter admin build
    - Install command: pnpm install --frozen-lockfile
    - Output directory: .next
    - Env: NEXT_PUBLIC_API_BASE=https://api.dev.yourdomain.com

- For local Vercel dev:
  - Install Vercel CLI: npm i -g vercel
  - vercel link (in repo root)
  - vercel dev (with pnpm installed)

- API: host on Railway/Fly/Render. Set NEXT_PUBLIC_API_BASE in both web/admin to your API URL.

Local development quickstart

- Start stack: `pnpm stack:up`
- DB migrate: `pnpm db:migrate`
- DB seed: `pnpm db:seed`
- API: `pnpm --filter api start:dev` (http://localhost:3333)
- Web: `pnpm --filter web dev` (http://localhost:3000)
- Admin: `pnpm --filter admin dev` (http://localhost:3001) [set PORT]

Demo flow

- Visit web `/demo-booking`, pick a slot, enter email, book. Redirects to `/demo-booking/confirmed`.
- Worker logs BookingCreated notifications.

Env

- Copy apps/api/.env.example and apps/web/.env.example to `.env.local` respectively.

1.  **Install dependencies:**

    ```bash
    pnpm install
    ```

2.  **Set up environment variables:**
    Create a `.env.local` file in `apps/web` and add your Gemini API key:

    ```
    API_KEY="your_gemini_api_key"
    ```

3.  **Run the development server:**
    ```bash
    pnpm dev
    ```

This will start the Next.js web application on `http://localhost:3000`.
