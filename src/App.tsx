import { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/contexts/AuthProvider';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { AppLayout } from '@/components/layout/AppLayout';

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

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-background">
            <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-pulse">Loading...</div></div>}>
              <Routes>
                <Route path="/auth" element={<AuthPage />} />
                <Route
                  path="/"
                  element={
                    <ProtectedRoute>
                      <AppLayout>
                        <Dashboard />
                      </AppLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/eos"
                  element={
                    <ProtectedRoute>
                      <AppLayout>
                        <EOS />
                      </AppLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/eos/issues"
                  element={
                    <ProtectedRoute>
                      <AppLayout>
                        <EOSIssues />
                      </AppLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/eos/rocks"
                  element={
                    <ProtectedRoute>
                      <AppLayout>
                        <EOSRocks />
                      </AppLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/eos/meetings"
                  element={
                    <ProtectedRoute>
                      <AppLayout>
                        <EOSMeetings />
                      </AppLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/scorecard"
                  element={
                    <ProtectedRoute>
                      <AppLayout>
                        <Scorecard />
                      </AppLayout>
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
    </ErrorBoundary>
  );
}

export default App;