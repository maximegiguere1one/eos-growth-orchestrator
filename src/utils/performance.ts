// Performance utilities for React optimization

import React, { useCallback, useRef } from 'react';

/**
 * Debounce hook for expensive operations
 */
export const useDebounce = <T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T => {
  const timeoutRef = useRef<NodeJS.Timeout>();

  return useCallback(
    ((...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => callback(...args), delay);
    }) as T,
    [callback, delay]
  );
};

/**
 * Throttle hook for high-frequency events
 */
export const useThrottle = <T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T => {
  const lastRun = useRef(Date.now());

  return useCallback(
    ((...args: Parameters<T>) => {
      if (Date.now() - lastRun.current >= delay) {
        callback(...args);
        lastRun.current = Date.now();
      }
    }) as T,
    [callback, delay]
  );
};

/**
 * Lazy loading utility for components
 */
export const createLazyComponent = (importFn: () => Promise<any>) => {
  return React.lazy(() => 
    importFn().catch(() => ({
      default: () => <div>Erreur de chargement du composant</div>
    }))
  );
};

/**
 * Intersection Observer hook for lazy loading
 */
export const useIntersectionObserver = (
  callback: (entries: IntersectionObserverEntry[]) => void,
  options?: IntersectionObserverInit
) => {
  const targetRef = useRef<HTMLElement>(null);

  React.useEffect(() => {
    const target = targetRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(callback, {
      threshold: 0.1,
      rootMargin: '50px',
      ...options,
    });

    observer.observe(target);

    return () => {
      observer.unobserve(target);
      observer.disconnect();
    };
  }, [callback, options]);

  return targetRef;
};

/**
 * Performance monitoring utilities
 */
export const performanceMonitor = {
  mark: (name: string) => {
    if (typeof performance !== 'undefined' && performance.mark) {
      performance.mark(name);
    }
  },

  measure: (name: string, startMark: string, endMark?: string) => {
    if (typeof performance !== 'undefined' && performance.measure) {
      try {
        performance.measure(name, startMark, endMark);
        const measure = performance.getEntriesByName(name, 'measure')[0];
        return measure?.duration || 0;
      } catch (error) {
        console.warn('Performance measurement failed:', error);
        return 0;
      }
    }
    return 0;
  },

  clearMarks: (name?: string) => {
    if (typeof performance !== 'undefined' && performance.clearMarks) {
      performance.clearMarks(name);
    }
  },

  clearMeasures: (name?: string) => {
    if (typeof performance !== 'undefined' && performance.clearMeasures) {
      performance.clearMeasures(name);
    }
  },
};

/**
 * Memory usage monitoring (for development)
 */
export const memoryMonitor = {
  getUsage: () => {
    if (typeof performance !== 'undefined' && (performance as any).memory) {
      const memory = (performance as any).memory;
      return {
        used: Math.round(memory.usedJSHeapSize / 1048576), // MB
        total: Math.round(memory.totalJSHeapSize / 1048576), // MB
        limit: Math.round(memory.jsHeapSizeLimit / 1048576), // MB
      };
    }
    return null;
  },

  logUsage: (label?: string) => {
    const usage = memoryMonitor.getUsage();
    if (usage) {
      console.log(`${label || 'Memory'}: ${usage.used}MB / ${usage.total}MB (limit: ${usage.limit}MB)`);
    }
  },
};

/**
 * Bundle size analyzer helper
 */
export const bundleAnalyzer = {
  logChunkSizes: () => {
    if (typeof window !== 'undefined' && window.performance) {
      const entries = performance.getEntriesByType('navigation');
      entries.forEach((entry: any) => {
        console.log('Navigation timing:', {
          domContentLoaded: entry.domContentLoadedEventEnd - entry.domContentLoadedEventStart,
          load: entry.loadEventEnd - entry.loadEventStart,
          total: entry.loadEventEnd - entry.fetchStart,
        });
      });
    }
  },
};

/**
 * React DevTools profiler helper
 */
export const profilerHelper = {
  onRender: (
    id: string,
    phase: 'mount' | 'update',
    actualDuration: number,
    baseDuration: number,
    startTime: number,
    commitTime: number
  ) => {
    if (process.env.NODE_ENV === 'development') {
      console.log('Profiler:', {
        id,
        phase,
        actualDuration: Math.round(actualDuration * 100) / 100,
        baseDuration: Math.round(baseDuration * 100) / 100,
        startTime: Math.round(startTime),
        commitTime: Math.round(commitTime),
      });
    }
  },
};

/**
 * Image optimization utilities
 */
export const imageOptimizer = {
  createWebPSrc: (src: string, width?: number, height?: number) => {
    const params = new URLSearchParams();
    if (width) params.set('w', width.toString());
    if (height) params.set('h', height.toString());
    params.set('f', 'webp');
    params.set('q', '80');
    
    return `${src}?${params.toString()}`;
  },

  createSrcSet: (src: string, sizes: number[]) => {
    return sizes
      .map(size => `${imageOptimizer.createWebPSrc(src, size)} ${size}w`)
      .join(', ');
  },
};

/**
 * Service Worker utilities for caching
 */
export const serviceWorkerHelper = {
  register: async () => {
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        console.log('SW registered:', registration);
        return registration;
      } catch (error) {
        console.error('SW registration failed:', error);
      }
    }
  },

  update: async () => {
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration) {
        registration.update();
      }
    }
  },
};
