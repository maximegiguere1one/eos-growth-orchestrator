import { render, screen } from '@testing-library/react';
import { vi, describe, it, beforeEach, afterEach, expect } from 'vitest';
import { useAnalytics, AnalyticsProvider } from '../AnalyticsProvider';

// Test component that uses analytics
function TestComponent() {
  const { track, identify, page } = useAnalytics();
  
  return (
    <div>
      <button onClick={() => track('test_event', { prop: 'value' })}>
        Track Event
      </button>
      <button onClick={() => identify('user123', { name: 'Test User' })}>
        Identify User
      </button>
      <button onClick={() => page('test_page', { section: 'analytics' })}>
        Track Page
      </button>
    </div>
  );
}

describe('AnalyticsProvider', () => {
  beforeEach(() => {
    // Mock console.log to avoid noise in tests
    vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('provides analytics context to children', () => {
    render(
      <AnalyticsProvider>
        <TestComponent />
      </AnalyticsProvider>
    );

    expect(screen.getByText('Track Event')).toBeInTheDocument();
    expect(screen.getByText('Identify User')).toBeInTheDocument();
    expect(screen.getByText('Track Page')).toBeInTheDocument();
  });

  it('throws error when used outside provider', () => {
    // Suppress console.error for this test
    vi.spyOn(console, 'error').mockImplementation(() => {});
    
    expect(() => {
      render(<TestComponent />);
    }).toThrow('useAnalytics must be used within an AnalyticsProvider');
    
    vi.restoreAllMocks();
  });

  it('logs events in development mode', () => {
    const consoleSpy = vi.spyOn(console, 'log');
    
    render(
      <AnalyticsProvider>
        <TestComponent />
      </AnalyticsProvider>
    );

    // Simulate clicking the track event button
    const trackButton = screen.getByText('Track Event');
    trackButton.click();

    expect(consoleSpy).toHaveBeenCalledWith(
      'Analytics Event:',
      expect.objectContaining({
        event: 'test_event',
        properties: { prop: 'value' },
        timestamp: expect.any(String)
      })
    );
  });
});