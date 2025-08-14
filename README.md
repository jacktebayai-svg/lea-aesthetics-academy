# Lea's Aesthetics Master Suite

This is the monorepo for the Master Aesthetics Suite for Lea's Clinical Academy. It contains the web application for clients and students, as well as shared packages for UI, types, and utilities.

## Project Structure

This repository is a monorepo managed by [Turborepo](https://turbo.build/repo).

- `apps/web`: The main Next.js application for the tenant websites, booking, and client/student portals.
- `packages/ui`: A shared package of React UI components used across the applications.
- `packages/shared`: Shared TypeScript types, validation schemas, and utility functions.
- `packages/tsconfig`: Shared TypeScript configurations.

## Getting Started

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
