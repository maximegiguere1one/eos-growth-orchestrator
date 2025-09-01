
import { defineConfig } from '@playwright/test';
import baseConfig from './playwright.config';

export default defineConfig({
  ...baseConfig,
  use: {
    ...baseConfig.use,
    baseURL: process.env.STAGING_URL || 'https://staging.eos-management.com',
  },
  webServer: undefined, // Don't start dev server for staging tests
  retries: 3, // More retries for staging environment
  projects: [
    {
      name: 'staging-smoke',
      testMatch: /.*smoke.*\.spec\.ts/,
      use: { ...baseConfig.use },
    },
  ],
});
