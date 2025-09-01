
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Skeleton } from "@/components/ui/skeleton";
import { PerformanceProvider } from "@/components/performance/PerformanceProvider";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Suspense, lazy } from "react";

// Lazy load pages for better performance
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Clients = lazy(() => import("./pages/Clients"));
const Videos = lazy(() => import("./pages/Videos"));
const Ads = lazy(() => import("./pages/Ads"));
const EOS = lazy(() => import("./pages/EOS"));
const EOSIssues = lazy(() => import("./pages/EOSIssues"));
const EOSRocks = lazy(() => import("./pages/EOSRocks"));
const EOSMeetings = lazy(() => import("./pages/EOSMeetings"));
const Scorecard = lazy(() => import("./pages/Scorecard"));
const Auth = lazy(() => import("./pages/Auth"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Optimized QueryClient configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30 * 1000, // 30 seconds default
      gcTime: 5 * 60 * 1000, // 5 minutes default
      refetchOnWindowFocus: false, // Reduce unnecessary refetches
      retry: (failureCount, error: any) => {
        // Smart retry logic
        if (error?.status === 404) return false;
        return failureCount < 2;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
    mutations: {
      retry: 1,
    },
  },
});

// Page loading skeleton
const PageSkeleton = () => (
  <div className="space-y-6">
    <div className="space-y-2">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-4 w-96" />
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className="h-32" />
      ))}
    </div>
    <Skeleton className="h-64 w-full" />
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/auth" element={
              <Suspense fallback={<PageSkeleton />}>
                <Auth />
              </Suspense>
            } />
            <Route path="/*" element={
              <PerformanceProvider>
                <AppLayout>
                  <Suspense fallback={<PageSkeleton />}>
                    <Routes>
                      <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                      <Route path="/clients" element={<ProtectedRoute><Clients /></ProtectedRoute>} />
                      <Route path="/videos" element={<ProtectedRoute><Videos /></ProtectedRoute>} />
                      <Route path="/ads" element={<ProtectedRoute><Ads /></ProtectedRoute>} />
                      <Route path="/eos" element={<ProtectedRoute><EOS /></ProtectedRoute>} />
                      <Route path="/eos/issues" element={<ProtectedRoute><EOSIssues /></ProtectedRoute>} />
                      <Route path="/eos/rocks" element={<ProtectedRoute><EOSRocks /></ProtectedRoute>} />
                      <Route path="/eos/meetings" element={<ProtectedRoute><EOSMeetings /></ProtectedRoute>} />
                      <Route path="/eos/scorecard" element={<ProtectedRoute><Scorecard /></ProtectedRoute>} />
                      {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </Suspense>
                </AppLayout>
              </PerformanceProvider>
            } />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
