
import { WebTracerProvider } from '@opentelemetry/sdk-trace-web';
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { OTLPTraceExporter } from '@opentelemetry/exporter-otlp-http';
import { registerInstrumentations } from '@opentelemetry/instrumentation';
import { FetchInstrumentation } from '@opentelemetry/instrumentation-fetch';
import { UserInteractionInstrumentation } from '@opentelemetry/instrumentation-user-interaction';

const isProduction = import.meta.env.VITE_APP_ENV === 'production';
const serviceName = import.meta.env.VITE_APP_NAME || 'eos-management';
const serviceVersion = import.meta.env.VITE_APP_VERSION || '1.0.0';

// Only initialize in production or when explicitly enabled
if (isProduction || import.meta.env.VITE_ENABLE_TRACING === 'true') {
  const provider = new WebTracerProvider({
    resource: new Resource({
      [SemanticResourceAttributes.SERVICE_NAME]: serviceName,
      [SemanticResourceAttributes.SERVICE_VERSION]: serviceVersion,
      [SemanticResourceAttributes.DEPLOYMENT_ENVIRONMENT]: import.meta.env.VITE_APP_ENV,
    }),
  });

  // Configure OTLP exporter (adjust endpoint as needed)
  const exporter = new OTLPTraceExporter({
    url: 'https://api.honeycomb.io/v1/traces', // Example endpoint
    headers: {
      'x-honeycomb-team': import.meta.env.VITE_HONEYCOMB_API_KEY || '',
    },
  });

  provider.addSpanProcessor(new BatchSpanProcessor(exporter));

  // Register instrumentations
  registerInstrumentations({
    instrumentations: [
      new FetchInstrumentation({
        propagateTraceHeaderCorsUrls: [
          /^https:\/\/.*\.supabase\.co\/.*/,
          /^https:\/\/app\.posthog\.com\/.*/,
        ],
        clearTimingResources: true,
        applyCustomAttributesOnSpan: (span, request) => {
          // Add custom attributes for API calls
          if (request.url.includes('supabase.co')) {
            span.setAttributes({
              'http.client.name': 'supabase',
              'service.name': 'supabase-api',
            });
          }
        },
      }),
      new UserInteractionInstrumentation({
        eventNames: ['click', 'submit', 'keydown'],
      }),
    ],
  });

  provider.register();

  // Custom trace helper functions
  window.trace = {
    startSpan: (name: string, attributes?: Record<string, string>) => {
      const tracer = provider.getTracer(serviceName);
      return tracer.startSpan(name, { attributes });
    },
    
    recordEvent: (name: string, attributes?: Record<string, string>) => {
      const tracer = provider.getTracer(serviceName);
      const span = tracer.startSpan(name, { attributes });
      span.end();
    },
  };
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
