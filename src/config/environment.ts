
// Enhanced environment configuration with validation
interface EnvironmentConfig {
  // App configuration
  APP_ENV: 'development' | 'staging' | 'production';
  APP_NAME: string;
  APP_VERSION: string;
  
  // Supabase configuration
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
  
  // Analytics & monitoring
  POSTHOG_KEY?: string;
  POSTHOG_HOST?: string;
  SENTRY_DSN?: string;
  HONEYCOMB_API_KEY?: string;
  HONEYCOMB_ENDPOINT?: string;
  
  // Feature flags
  ENABLE_ANALYTICS: boolean;
  ENABLE_ERROR_TRACKING: boolean;
  ENABLE_DEBUG: boolean;
  ENABLE_TRACING: boolean;
  
  // API configuration
  API_TIMEOUT: number;
  API_RETRY_ATTEMPTS: number;
}

function validateEnvironment(): EnvironmentConfig {
  const config: EnvironmentConfig = {
    // Required variables
    APP_ENV: import.meta.env.VITE_APP_ENV as EnvironmentConfig['APP_ENV'] || 'development',
    APP_NAME: import.meta.env.VITE_APP_NAME || 'EOS Management',
    APP_VERSION: import.meta.env.VITE_APP_VERSION || '1.0.3',
    
    SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
    SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
    
    // Optional variables with defaults
    POSTHOG_KEY: import.meta.env.VITE_POSTHOG_KEY,
    POSTHOG_HOST: import.meta.env.VITE_POSTHOG_HOST || 'https://app.posthog.com',
    SENTRY_DSN: import.meta.env.VITE_SENTRY_DSN,
    HONEYCOMB_API_KEY: import.meta.env.VITE_HONEYCOMB_API_KEY,
    HONEYCOMB_ENDPOINT: import.meta.env.VITE_HONEYCOMB_ENDPOINT || 'https://api.honeycomb.io/v1/traces',
    
    // Feature flags
    ENABLE_ANALYTICS: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
    ENABLE_ERROR_TRACKING: import.meta.env.VITE_ENABLE_ERROR_TRACKING === 'true',
    ENABLE_DEBUG: import.meta.env.VITE_ENABLE_DEBUG === 'true',
    ENABLE_TRACING: import.meta.env.VITE_ENABLE_TRACING === 'true',
    
    // API configuration
    API_TIMEOUT: parseInt(import.meta.env.VITE_API_TIMEOUT || '30000'),
    API_RETRY_ATTEMPTS: parseInt(import.meta.env.VITE_API_RETRY_ATTEMPTS || '3'),
  };

  // Validate required variables
  const requiredVars: (keyof EnvironmentConfig)[] = ['SUPABASE_URL', 'SUPABASE_ANON_KEY'];
  const missingVars = requiredVars.filter(key => !config[key]);

  if (missingVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
  }

  // Validate environment values
  if (!['development', 'staging', 'production'].includes(config.APP_ENV)) {
    throw new Error(`Invalid APP_ENV: ${config.APP_ENV}. Must be development, staging, or production.`);
  }

  // Validate URLs
  try {
    new URL(config.SUPABASE_URL);
    if (config.POSTHOG_HOST) {
      new URL(config.POSTHOG_HOST);
    }
    if (config.HONEYCOMB_ENDPOINT) {
      new URL(config.HONEYCOMB_ENDPOINT);
    }
  } catch (error) {
    throw new Error(`Invalid URL in environment configuration: ${error}`);
  }

  return config;
}

export const env = validateEnvironment();

// Environment helpers
export const isDevelopment = env.APP_ENV === 'development';
export const isStaging = env.APP_ENV === 'staging';
export const isProduction = env.APP_ENV === 'production';

// Configuration objects for different services
export const supabaseConfig = {
  url: env.SUPABASE_URL,
  anonKey: env.SUPABASE_ANON_KEY,
};

export const posthogConfig = env.ENABLE_ANALYTICS ? {
  apiKey: env.POSTHOG_KEY,
  apiHost: env.POSTHOG_HOST,
  options: {
    debug: env.ENABLE_DEBUG,
    capture_pageview: true,
    capture_pageleave: true,
    persistence: 'localStorage+cookie' as const,
    bootstrap: {
      distinctID: undefined, // Will be set after auth
    },
    loaded: (posthog: any) => {
      if (isDevelopment) {
        console.log('PostHog loaded successfully');
      }
    },
  },
} : null;

export const sentryConfig = env.ENABLE_ERROR_TRACKING ? {
  dsn: env.SENTRY_DSN,
  environment: env.APP_ENV,
  release: `${env.APP_NAME}@${env.APP_VERSION}`,
  integrations: [
    // Will be configured in sentry setup
  ],
  beforeSend: (event: any) => {
    // Filter sensitive data
    if (event.request?.url?.includes('auth')) {
      delete event.request.data;
      delete event.request.headers;
    }
    return event;
  },
  tracesSampleRate: isProduction ? 0.1 : 1.0,
} : null;

// Runtime configuration checks
export function checkConfiguration() {
  const checks = {
    supabase: !!env.SUPABASE_URL && !!env.SUPABASE_ANON_KEY,
    analytics: !env.ENABLE_ANALYTICS || !!env.POSTHOG_KEY,
    errorTracking: !env.ENABLE_ERROR_TRACKING || !!env.SENTRY_DSN,
  };

  const failedChecks = Object.entries(checks)
    .filter(([, passed]) => !passed)
    .map(([check]) => check);

  if (failedChecks.length > 0) {
    console.warn('Configuration checks failed:', failedChecks);
    
    if (isProduction) {
      throw new Error(`Production deployment failed configuration checks: ${failedChecks.join(', ')}`);
    }
  }

  return checks;
}

// Export for use in components
export default env;
