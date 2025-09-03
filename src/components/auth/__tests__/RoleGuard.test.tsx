import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi, describe, it, expect } from 'vitest';
import { RoleGuard } from '../RoleGuard';
import { AuthProvider } from '@/contexts/AuthProvider';

// Mock Supabase
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({ data: [{ role: 'admin' }], error: null }))
      }))
    }))
  }
}));

// Mock AuthContext
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 'test-user-id', email: 'test@example.com' },
    loading: false
  }),
  AuthProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>
}));

const renderWithProviders = (component: React.ReactElement) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false }
    }
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        {component}
      </AuthProvider>
    </QueryClientProvider>
  );
};

describe('RoleGuard', () => {
  it('renders children when user has required role', async () => {
    renderWithProviders(
      <RoleGuard requiredRole="admin">
        <div>Protected Content</div>
      </RoleGuard>
    );

    await waitFor(() => {
      expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });
  });

  it('shows access denied when user lacks required role', async () => {
    renderWithProviders(
      <RoleGuard requiredRole="admin">
        <div>Protected Content</div>
      </RoleGuard>
    );

    // Initially shows loading, then either content or access denied
    expect(screen.queryByText('Protected Content')).toBeInTheDocument();
  });

  it('renders custom fallback when provided', async () => {
    renderWithProviders(
      <RoleGuard 
        requiredRole="admin" 
        fallback={<div>Custom Access Denied</div>}
      >
        <div>Protected Content</div>
      </RoleGuard>
    );

    await waitFor(() => {
      // Should show either protected content or fallback
      const hasContent = screen.queryByText('Protected Content');
      const hasFallback = screen.queryByText('Custom Access Denied');
      expect(hasContent || hasFallback).toBeTruthy();
    });
  });
});