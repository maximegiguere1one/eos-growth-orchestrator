import { createContext, useContext, ReactNode, useMemo } from 'react';
import { useEOSSummary } from '@/hooks/useEOSSummary';

interface PerformanceContextType {
  issuesCount: number;
  rocksProgress: number;
  activeTodosCount: number;
  kpisCount: number;
  isLoading: boolean;
}

const PerformanceContext = createContext<PerformanceContextType | undefined>(undefined);

export function PerformanceProvider({ children }: { children: ReactNode }) {
  const { data: summary, isLoading } = useEOSSummary();

  const contextValue = useMemo(() => {
    if (!summary) {
      return {
        issuesCount: 0,
        rocksProgress: 0,
        activeTodosCount: 0,
        kpisCount: 0,
        isLoading: true,
      };
    }

    return {
      issuesCount: summary.activeIssuesCount,
      rocksProgress: summary.averageRocksProgress,
      activeTodosCount: summary.todosCount,
      kpisCount: summary.kpisCount,
      isLoading,
    };
  }, [summary, isLoading]);

  return (
    <PerformanceContext.Provider value={contextValue}>
      {children}
    </PerformanceContext.Provider>
  );
}

export function usePerformance() {
  const context = useContext(PerformanceContext);
  if (context === undefined) {
    throw new Error('usePerformance must be used within a PerformanceProvider');
  }
  return context;
}