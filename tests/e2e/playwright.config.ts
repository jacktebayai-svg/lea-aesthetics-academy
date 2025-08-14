import { defineConfig } from '@playwright/test';

export default defineConfig({
  timeout: 60000,
  retries: 0,
  use: {
    baseURL: process.env.API_BASE_URL || 'http://localhost:3333',
    extraHTTPHeaders: {
      'x-tenant-id': process.env.TEST_TENANT_ID || 'tn_demo',
    },
  },
});
