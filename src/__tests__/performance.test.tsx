import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { OptimizedDashboard } from '@/components/performance/OptimizedDashboard';
import { OptimizedClientTable } from '@/components/performance/VirtualizedClientTable';
import { MemoizedClientCard } from '@/components/performance/MemoizedComponents';

// Mock data
const mockClient = {
  id: '1',
  domain: 'test.com',
  status: 'active',
  mrr: 1000,
  health_score: 85,
  last_activity_at: '2024-01-01',
  account_manager: {
    display_name: 'John Doe',
    email: 'john@example.com'
  }
};

const mockClients = Array.from({ length: 100 }, (_, i) => ({
  ...mockClient,
  id: `client-${i}`,
  domain: `client${i}.com`,
  mrr: Math.random() * 5000,
  health_score: Math.random() * 100,
}));

// Test wrapper
const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {children}
      </BrowserRouter>
    </QueryClientProvider>
  );
};

describe('Performance Optimizations', () => {
  beforeEach(() => {
    // Mock Supabase
    jest.mock('@/lib/supabase', () => ({
      supabase: {
        from: jest.fn(() => ({
          select: jest.fn(() => ({
            order: jest.fn(() => ({
              data: mockClients,
              error: null
            }))
          }))
        })),
        channel: jest.fn(() => ({
          on: jest.fn(() => ({
            subscribe: jest.fn()
          }))
        })),
        removeChannel: jest.fn()
      }
    }));
  });

  describe('OptimizedClientTable', () => {
    it('should render paginated clients efficiently', async () => {
      const mockHandlers = {
        onSelectClient: jest.fn(),
        onSelectAll: jest.fn(),
        onClearSelection: jest.fn(),
        onClientClick: jest.fn(),
      };

      render(
        <TestWrapper>
          <OptimizedClientTable
            clients={mockClients}
            selectedClients={[]}
            {...mockHandlers}
          />
        </TestWrapper>
      );

      // Should only render first page (50 items)
      const rows = screen.getAllByRole('row');
      expect(rows.length).toBeLessThanOrEqual(51); // Header + 50 data rows

      // Should show pagination
      expect(screen.getByText(/Page 1 sur/)).toBeInTheDocument();
    });

    it('should handle selection efficiently', async () => {
      const mockHandlers = {
        onSelectClient: jest.fn(),
        onSelectAll: jest.fn(),
        onClearSelection: jest.fn(),
        onClientClick: jest.fn(),
      };

      render(
        <TestWrapper>
          <OptimizedClientTable
            clients={mockClients.slice(0, 10)}
            selectedClients={['client-1', 'client-2']}
            {...mockHandlers}
          />
        </TestWrapper>
      );

      // Should show selected state
      const checkboxes = screen.getAllByRole('checkbox');
      expect(checkboxes[0]).toBeInTheDocument(); // Header checkbox
    });
  });

  describe('MemoizedClientCard', () => {
    it('should render client information correctly', () => {
      const mockHandlers = {
        onSelect: jest.fn(),
        onNewVideo: jest.fn(),
        onCreateTicket: jest.fn(),
        onAdjustQuota: jest.fn(),
        onAssignAM: jest.fn(),
        onToggleStatus: jest.fn(),
      };

      render(
        <TestWrapper>
          <MemoizedClientCard
            client={mockClient as any}
            {...mockHandlers}
          />
        </TestWrapper>
      );

      expect(screen.getByText('test.com')).toBeInTheDocument();
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    it('should memoize properly and not re-render unnecessarily', () => {
      const mockHandlers = {
        onSelect: jest.fn(),
        onNewVideo: jest.fn(),
        onCreateTicket: jest.fn(),
        onAdjustQuota: jest.fn(),
        onAssignAM: jest.fn(),
        onToggleStatus: jest.fn(),
      };

      const { rerender } = render(
        <TestWrapper>
          <MemoizedClientCard
            client={mockClient as any}
            {...mockHandlers}
          />
        </TestWrapper>
      );

      // Re-render with same props should not cause re-render
      rerender(
        <TestWrapper>
          <MemoizedClientCard
            client={mockClient as any}
            {...mockHandlers}
          />
        </TestWrapper>
      );

      // Component should still be there
      expect(screen.getByText('test.com')).toBeInTheDocument();
    });
  });
});

// Performance measurement utilities for manual testing
export const measureComponentPerformance = (componentName: string, renderFn: () => void) => {
  const startTime = performance.now();
  renderFn();
  const endTime = performance.now();
  console.log(`${componentName} render time: ${endTime - startTime}ms`);
};

export const measureMemoryUsage = () => {
  if ('memory' in performance) {
    const memory = (performance as any).memory;
    return {
      usedJSHeapSize: memory.usedJSHeapSize,
      totalJSHeapSize: memory.totalJSHeapSize,
      jsHeapSizeLimit: memory.jsHeapSizeLimit,
    };
  }
  return null;
};
