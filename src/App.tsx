import { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/contexts/AuthProvider';
import { ProtectedLayout } from '@/components/layout/ProtectedLayout';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { SkipToContent } from '@/components/common/SkipToContent';
import { PageLoader } from '@/components/common/PageLoader';

import { analytics } from '@/analytics/posthog';
import { logger } from '@/lib/observability';


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
const Clients = lazy(() => import('@/pages/Clients'));
const Ads = lazy(() => import('@/pages/Ads'));
const Videos = lazy(() => import('@/pages/Videos'));
const NotFound = lazy(() => import('@/pages/NotFound'));

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-background">
            <SkipToContent />
            <Suspense fallback={<PageLoader variant="minimal" />}>
              <Routes>
                <Route path="/auth" element={<AuthPage />} />
                <Route path="/" element={<ProtectedLayout><Dashboard /></ProtectedLayout>} />
                <Route path="/scorecard" element={<ProtectedLayout><Scorecard /></ProtectedLayout>} />
                <Route path="/eos" element={<ProtectedLayout><EOS /></ProtectedLayout>} />
                <Route path="/eos/issues" element={<ProtectedLayout><EOSIssues /></ProtectedLayout>} />
                <Route path="/eos/rocks" element={<ProtectedLayout><EOSRocks /></ProtectedLayout>} />
                <Route path="/eos/meetings" element={<ProtectedLayout><EOSMeetings /></ProtectedLayout>} />
                <Route path="/clients" element={<ProtectedLayout><Clients /></ProtectedLayout>} />
                <Route path="/ads" element={<ProtectedLayout><Ads /></ProtectedLayout>} />
                <Route path="/videos" element={<ProtectedLayout><Videos /></ProtectedLayout>} />
                <Route path="/404" element={<NotFound />} />
                <Route path="*" element={<Navigate to="/404" replace />} />
              </Routes>
            </Suspense>
          </div>
        </Router>
      </AuthProvider>
      <Toaster />
    </ErrorBoundary>
  );
}

export default App;