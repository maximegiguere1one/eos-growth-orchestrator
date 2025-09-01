
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

// Import production configurations
import { setDevelopmentCSP } from '../infrastructure/csp.config'

async function bootstrap() {
  try {
    const { env, checkConfiguration } = await import('@/config/environment');

    // Only load OpenTelemetry if explicitly enabled
    if (env.ENABLE_TRACING === true) {
      import('../infrastructure/opentelemetry.config').catch((e) =>
        console.warn('Tracing init failed (lazy):', e)
      );
    }

    // Initialize Sentry for error tracking
    if (env.ENABLE_ERROR_TRACKING && env.SENTRY_DSN) {
      import('@sentry/react').then(({ init, browserTracingIntegration }) => {
        init({
          dsn: env.SENTRY_DSN,
          environment: env.APP_ENV,
          release: `${env.APP_NAME}@${env.APP_VERSION}`,
          integrations: [browserTracingIntegration()],
          tracesSampleRate: env.APP_ENV === 'production' ? 0.1 : 1.0,
          beforeSend: (
            event: { request?: { url?: string; data?: unknown; headers?: unknown } },
          ) => {
            // Filter sensitive data from Sentry reports
            if (event.request?.url?.includes('auth')) {
              delete event.request.data;
              delete event.request.headers;
            }
            return event;
          },
        });
      });
    }

    // Check configuration on startup
    try {
      checkConfiguration();
    } catch (error) {
      console.error('Configuration error:', error);
      if (env.APP_ENV === 'production') {
        throw error; // Fail fast in production
      }
    }

    // Set CSP in development
    setDevelopmentCSP();

    const queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
          refetchOnWindowFocus: false,
        },
        mutations: {
          // Intentionally empty; configure per-mutation as needed
        },
      },

      // Optional: React Query error handling
      // https://tanstack.com/query/latest/docs/framework/react/error-handling

      // global error handler
      // onError: (error) => {
      //   console.error("global error handler", error)
      // },
    });

    ReactDOM.createRoot(document.getElementById('root')!).render(
      <React.StrictMode>
        <QueryClientProvider client={queryClient}>
          <App />
          <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
      </React.StrictMode>,
    );
  } catch (error) {
    console.error('Fatal configuration error:', error);
    const root = document.getElementById('root');
    if (root) {
      root.innerHTML =
        '<div style="padding:1rem;font-family:sans-serif;">Failed to load configuration. Check environment variables.</div>';
    }
  }
}

bootstrap();
