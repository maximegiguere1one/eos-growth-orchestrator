
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// Import production configurations
import { env, checkConfiguration } from '@/config/environment'
import { setDevelopmentCSP } from '../infrastructure/csp.config'

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
      integrations: [
        browserTracingIntegration(),
      ],
      tracesSampleRate: env.APP_ENV === 'production' ? 0.1 : 1.0,
      beforeSend: (event) => {
        // Filter sensitive data from Sentry reports
        if (event.request?.url?.includes('auth')) {
          delete (event as any).request.data;
          delete (event as any).request.headers;
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

// Conditionally load React Query Devtools only in development
const isDevelopment = import.meta.env.DEV;

const root = ReactDOM.createRoot(document.getElementById('root')!);

root.render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
      {isDevelopment && <DevtoolsLoader />}
    </QueryClientProvider>
  </React.StrictMode>,
);

// Lazy load devtools component only in development
function DevtoolsLoader() {
  const [Devtools, setDevtools] = React.useState<React.ComponentType<any> | null>(null);

  React.useEffect(() => {
    if (isDevelopment) {
      import('@tanstack/react-query-devtools').then(({ ReactQueryDevtools }) => {
        setDevtools(() => ReactQueryDevtools);
      });
    }
  }, []);

  return Devtools ? <Devtools initialIsOpen={false} /> : null;
}
