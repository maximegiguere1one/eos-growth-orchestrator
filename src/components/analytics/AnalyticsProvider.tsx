import { createContext, useContext, ReactNode } from 'react';

interface AnalyticsEvent {
  event: string;
  properties?: Record<string, any>;
  userId?: string;
}

interface AnalyticsContextType {
  track: (event: string, properties?: Record<string, any>) => void;
  identify: (userId: string, traits?: Record<string, any>) => void;
  page: (name: string, properties?: Record<string, any>) => void;
}

const AnalyticsContext = createContext<AnalyticsContextType | undefined>(undefined);

export function AnalyticsProvider({ children }: { children: ReactNode }) {
  const track = (event: string, properties?: Record<string, any>) => {
    // Future implementation: Send to analytics service
    if (process.env.NODE_ENV === 'development') {
      console.log('Analytics Event:', { event, properties, timestamp: new Date().toISOString() });
    }
  };

  const identify = (userId: string, traits?: Record<string, any>) => {
    // Future implementation: Identify user in analytics service
    if (process.env.NODE_ENV === 'development') {
      console.log('Analytics Identify:', { userId, traits, timestamp: new Date().toISOString() });
    }
  };

  const page = (name: string, properties?: Record<string, any>) => {
    // Future implementation: Track page views
    if (process.env.NODE_ENV === 'development') {
      console.log('Analytics Page:', { page: name, properties, timestamp: new Date().toISOString() });
    }
  };

  const value = {
    track,
    identify,
    page,
  };

  return (
    <AnalyticsContext.Provider value={value}>
      {children}
    </AnalyticsContext.Provider>
  );
}

export function useAnalytics() {
  const context = useContext(AnalyticsContext);
  if (context === undefined) {
    throw new Error('useAnalytics must be used within an AnalyticsProvider');
  }
  return context;
}