import { env } from '@/config/environment';

const serviceName = env.APP_NAME || 'eos-management';

// Temporarily disable OpenTelemetry due to version conflicts
// TODO: Re-enable once all OTel packages are aligned to compatible versions
if (false && (env.ENABLE_TRACING || env.APP_ENV === 'production')) {
  console.log('OpenTelemetry tracing is temporarily disabled due to package version conflicts');
}

// Type declaration for global trace object
declare global {
  interface Window {
    trace?: {
      startSpan: (name: string, attributes?: Record<string, string>) => any;
      recordEvent: (name: string, attributes?: Record<string, string>) => void;
    };
  }
}

export {};