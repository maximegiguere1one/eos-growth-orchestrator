import { createContext, useContext, ReactNode, useMemo } from 'react';
import { useEOSIssues } from '@/features/eos/issues/hooks';
import { useEOSRocks } from '@/features/eos/rocks/hooks';
import { useEOSKPIs } from '@/features/eos/kpis/hooks';
import { useEOSTodos } from '@/hooks/useEOS';

interface PerformanceContextType {
  issuesCount: number;
  rocksProgress: number;
  activeTodosCount: number;
  kpisCount: number;
  isLoading: boolean;
}

const PerformanceContext = createContext<PerformanceContextType | undefined>(undefined);

export function PerformanceProvider({ children }: { children: ReactNode }) {
  const { data: issues = [], isLoading: issuesLoading } = useEOSIssues();
  const { data: rocks = [], isLoading: rocksLoading } = useEOSRocks();
  const { data: todos = [], isLoading: todosLoading } = useEOSTodos();
  const { data: kpis = [], isLoading: kpisLoading } = useEOSKPIs();

  const contextValue = useMemo(() => ({
    issuesCount: issues.filter(i => i.status === 'open').length,
    rocksProgress: rocks.length === 0 ? 0 : Math.round(rocks.reduce((sum, rock) => sum + rock.progress, 0) / rocks.length),
    activeTodosCount: todos.length,
    kpisCount: kpis.length,
    isLoading: issuesLoading || rocksLoading || todosLoading || kpisLoading,
  }), [issues, rocks, todos, kpis, issuesLoading, rocksLoading, todosLoading, kpisLoading]);

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