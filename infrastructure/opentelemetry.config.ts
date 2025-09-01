
import { WebTracerProvider } from '@opentelemetry/sdk-trace-web';
import { Resource } from '@opentelemetry/resources';
import { SEMRESATTRS_SERVICE_NAME, SEMRESATTRS_SERVICE_VERSION, SEMRESATTRS_DEPLOYMENT_ENVIRONMENT } from '@opentelemetry/semantic-conventions';
import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { OTLPTraceExporter } from '@opentelemetry/exporter-otlp-http';
import { registerInstrumentations } from '@opentelemetry/instrumentation';
import { FetchInstrumentation } from '@opentelemetry/instrumentation-fetch';
import { UserInteractionInstrumentation } from '@opentelemetry/instrumentation-user-interaction';
import { env } from '@/config/environment';

const isProduction = env.APP_ENV === 'production';
const serviceName = env.APP_NAME || 'eos-management';
const serviceVersion = env.APP_VERSION || '1.0.0';

// Only initialize in production or when explicitly enabled
if (isProduction || env.ENABLE_TRACING) {
  try {
    const provider = new WebTracerProvider({
      resource: Resource.default().merge(
        new Resource({
          [SEMRESATTRS_SERVICE_NAME]: serviceName,
          [SEMRESATTRS_SERVICE_VERSION]: serviceVersion,
          [SEMRESATTRS_DEPLOYMENT_ENVIRONMENT]: env.APP_ENV,
        })
      ),
    });

    // Configure OTLP exporter (adjust endpoint as needed)
    const exporter = new OTLPTraceExporter({
      url: env.HONEYCOMB_ENDPOINT || 'https://api.honeycomb.io/v1/traces',
      headers: {
        'x-honeycomb-team': env.HONEYCOMB_API_KEY || '',
      },
    });

    const processor = new BatchSpanProcessor(exporter);
    provider.addSpanProcessor(processor);

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
            let url: string | undefined;
            
            if (typeof request === 'string') {
              url = request;
            } else if (request && typeof request === 'object' && 'url' in request) {
              url = (request as any).url;
            }
            
            if (url && url.includes('supabase.co')) {
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

    console.log('OpenTelemetry initialized successfully');
  } catch (error) {
    console.warn('Failed to initialize OpenTelemetry:', error);
  }
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
