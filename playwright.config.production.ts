
import { defineConfig } from '@playwright/test';
import baseConfig from './playwright.config';

export default defineConfig({
  ...baseConfig,
  use: {
    ...baseConfig.use,
    baseURL: process.env.PRODUCTION_URL || 'https://eos-management.com',
  },
  webServer: undefined, // Don't start dev server for production tests
  retries: 1, // Minimal retries for production
  projects: [
    {
      name: 'production-critical',
      testMatch: /.*critical.*\.spec\.ts/,
      use: { ...baseConfig.use },
    },
  ],
});
