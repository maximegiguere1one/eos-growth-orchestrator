
import { z } from 'zod';

const envSchema = z.object({
  VITE_SUPABASE_URL: z.string().url(),
  VITE_SUPABASE_PUBLISHABLE_KEY: z.string().min(1),
  VITE_SUPABASE_PROJECT_ID: z.string().min(1),
  VITE_POSTHOG_KEY: z.string().optional(),
  VITE_POSTHOG_HOST: z.string().url().optional(),
  VITE_SENTRY_DSN: z.string().url().optional(),
  VITE_APP_ENV: z.enum(['development', 'staging', 'production']).default('development'),
  VITE_APP_VERSION: z.string().default('1.0.0'),
  VITE_APP_BASE_URL: z.string().url().default('http://localhost:5173'),
  VITE_OTEL_EXPORTER_OTLP_ENDPOINT: z.string().url().optional(),
  VITE_OTEL_SERVICE_NAME: z.string().default('eos-app'),
});

function validateEnv() {
  try {
    return envSchema.parse(import.meta.env);
  } catch (error) {
    console.error('❌ Invalid environment variables:', error);
    throw new Error('Invalid environment configuration');
  }
}

export const env = validateEnv();

export const isProduction = env.VITE_APP_ENV === 'production';
export const isStaging = env.VITE_APP_ENV === 'staging';
export const isDevelopment = env.VITE_APP_ENV === 'development';
