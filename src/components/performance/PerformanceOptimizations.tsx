import React, { Suspense, lazy } from 'react';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { PageLoader } from '@/components/common/PageLoader';

// Advanced lazy loading with preloading
const createOptimizedLazyComponent = (
  importFn: () => Promise<any>,
  preloadCondition?: () => boolean
) => {
  const LazyComponent = lazy(importFn);
  
  // Preload component when condition is met
  if (preloadCondition && preloadCondition()) {
    importFn();
  }
  
  return LazyComponent;
};

// Optimized lazy loaded pages with intelligent preloading
export const OptimizedDashboard = createOptimizedLazyComponent(
  () => import('@/components/performance/OptimizedDashboard'),
  () => window.location.pathname === '/'
);

export const OptimizedClientPage = createOptimizedLazyComponent(
  () => import('@/components/performance/OptimizedClientPage'),
  () => window.location.pathname.includes('/clients')
);

export const OptimizedEOSPage = createOptimizedLazyComponent(
  () => import('@/pages/EOS'),
  () => window.location.pathname.includes('/eos')
);

// Performance wrapper component with error boundaries
interface PerformanceWrapperProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const PerformanceWrapper: React.FC<PerformanceWrapperProps> = ({ 
  children, 
  fallback = <PageLoader variant="minimal" />
}) => {
  return (
    <ErrorBoundary>
      <Suspense fallback={fallback}>
        {children}
      </Suspense>
    </ErrorBoundary>
  );
};

// HOC for performance monitoring
export const withPerformanceMonitoring = <P extends object>(
  Component: React.ComponentType<P>,
  componentName: string
) => {
  return React.memo((props: P) => {
    React.useEffect(() => {
      if (process.env.NODE_ENV === 'development') {
        performance.mark(`${componentName}-start`);
        return () => {
          performance.mark(`${componentName}-end`);
          performance.measure(
            `${componentName}-render`,
            `${componentName}-start`,
            `${componentName}-end`
          );
        };
      }
    });

    return <Component {...props} />;
  });
};

// Intersection Observer for lazy loading images
export const LazyImage: React.FC<{
  src: string;
  alt: string;
  className?: string;
  placeholder?: string;
}> = ({ src, alt, className, placeholder = '/placeholder.svg' }) => {
  const [isLoaded, setIsLoaded] = React.useState(false);
  const [isInView, setIsInView] = React.useState(false);
  const imgRef = React.useRef<HTMLImageElement>(null);

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: '50px' }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <img
      ref={imgRef}
      src={isInView ? src : placeholder}
      alt={alt}
      className={className}
      onLoad={() => setIsLoaded(true)}
      style={{
        opacity: isLoaded ? 1 : 0.5,
        transition: 'opacity 0.3s ease',
      }}
    />
  );
};

// Debounced search input component
interface DebouncedSearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  delay?: number;
}

export const DebouncedSearch: React.FC<DebouncedSearchProps> = ({
  value,
  onChange,
  placeholder = "Rechercher...",
  delay = 300
}) => {
  const [localValue, setLocalValue] = React.useState(value);
  const timeoutRef = React.useRef<NodeJS.Timeout>();

  React.useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setLocalValue(newValue);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      onChange(newValue);
    }, delay);
  }, [onChange, delay]);

  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <input
      type="text"
      value={localValue}
      onChange={handleChange}
      placeholder={placeholder}
      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
    />
  );
};
