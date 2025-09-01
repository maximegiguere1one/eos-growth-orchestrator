
import { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/contexts/AuthProvider';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { LoadingSkeleton } from '@/components/common/LoadingSkeleton';
import { analytics } from '@/analytics/posthog';
import { logger } from '@/lib/observability';
import { isDevelopment } from '@/config/environment';

// Defer analytics initialization to not block startup
setTimeout(() => {
  analytics.init();
}, 100);

// Lazy load pages for better performance
const Dashboard = lazy(() => import('@/pages/Dashboard'));
const AuthPage = lazy(() => import('@/pages/AuthPage'));
const EOS = lazy(() => import('@/pages/EOS'));
const EOSIssues = lazy(() => import('@/pages/EOSIssues'));
const EOSRocks = lazy(() => import('@/pages/EOSRocks'));
const EOSMeetings = lazy(() => import('@/pages/EOSMeetings'));
const Scorecard = lazy(() => import('@/pages/Scorecard'));
const NotFound = lazy(() => import('@/pages/NotFound'));

// Create React Query client with production-ready config
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes - standardized across app
      gcTime: 10 * 60 * 1000, // 10 minutes
      retry: (failureCount, error: any) => {
        // Don't retry on 4xx errors except 429 (rate limit)
        if (error?.status >= 400 && error?.status < 500 && error?.status !== 429) {
          return false;
        }
        return failureCount < 3;
      },
      refetchOnWindowFocus: false, // Reduce unnecessary network calls
    },
    mutations: {
      retry: 1,
    },
  },
});

// Global error handler for React Query - correct event handling
queryClient.getQueryCache().subscribe((event) => {
  if (event.type === 'updated' && event.query.state.status === 'error') {
    logger.error('React Query error', { 
      error: event.query.state.error, 
      queryKey: event.query.queryKey 
    });
  }
});

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <Router>
            <div className="min-h-screen bg-background">
              <Suspense fallback={<LoadingSkeleton />}>
                <Routes>
                  <Route path="/auth" element={<AuthPage />} />
                  <Route
                    path="/"
                    element={
                      <ProtectedRoute>
                        <Dashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/eos"
                    element={
                      <ProtectedRoute>
                        <EOS />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/eos/issues"
                    element={
                      <ProtectedRoute>
                        <EOSIssues />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/eos/rocks"
                    element={
                      <ProtectedRoute>
                        <EOSRocks />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/eos/meetings"
                    element={
                      <ProtectedRoute>
                        <EOSMeetings />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/scorecard"
                    element={
                      <ProtectedRoute>
                        <Scorecard />
                      </ProtectedRoute>
                    }
                  />
                  <Route path="/404" element={<NotFound />} />
                  <Route path="*" element={<Navigate to="/404" replace />} />
                </Routes>
              </Suspense>
            </div>
          </Router>
        </AuthProvider>
        <Toaster />
        {isDevelopment && <ReactQueryDevtools initialIsOpen={false} />}
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
