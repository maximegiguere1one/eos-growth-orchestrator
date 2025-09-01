
import { env, isDevelopment } from '@/config/environment';

interface LogContext {
  userId?: string;
  sessionId?: string;
  feature?: string;
  action?: string;
  [key: string]: any;
}

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface ILogger {
  setContext(context: Partial<LogContext>): void;
  debug(message: string, data?: any): void;
  info(message: string, data?: any): void;
  warn(message: string, data?: any): void;
  error(message: string, error?: Error | any): void;
}

class Logger implements ILogger {
  private sessionId: string;
  private context: LogContext = {};

  constructor() {
    try {
      // Use crypto.randomUUID() if available, fallback for older browsers
      this.sessionId = typeof crypto !== 'undefined' && crypto.randomUUID 
        ? crypto.randomUUID() 
        : `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    } catch (error) {
      // Fallback if crypto is not available
      this.sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
  }

  setContext(context: Partial<LogContext>) {
    this.context = { ...this.context, ...context };
  }

  private formatMessage(level: LogLevel, message: string, data?: any) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      message,
      sessionId: this.sessionId,
      environment: env.APP_ENV,
      version: env.APP_VERSION,
      ...this.context,
      ...(data && { data }),
    };

    // In development, also log to console for debugging
    if (isDevelopment) {
      const consoleMethod = level === 'debug' ? 'log' : level;
      console[consoleMethod](`[${level.toUpperCase()}]`, message, data || '');
    }

    return logEntry;
  }

  debug(message: string, data?: any) {
    if (!isDevelopment) return;
    const entry = this.formatMessage('debug', message, data);
    this.sendToObservability(entry);
  }

  info(message: string, data?: any) {
    const entry = this.formatMessage('info', message, data);
    this.sendToObservability(entry);
  }

  warn(message: string, data?: any) {
    const entry = this.formatMessage('warn', message, data);
    this.sendToObservability(entry);
  }

  error(message: string, error?: Error | any) {
    const entry = this.formatMessage('error', message, {
      error: error instanceof Error ? {
        name: error.name,
        message: error.message,
        stack: error.stack,
      } : error,
    });
    this.sendToObservability(entry);
  }

  private sendToObservability(entry: any) {
    // In production, send to your observability platform
    // For now, we'll just queue them (could send to Sentry, DataDog, etc.)
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('app:log', { detail: entry }));
    }
  }
}

// Safe logger initialization
let logger: ILogger;
try {
  logger = new Logger();
} catch (error) {
  console.warn('Logger initialization failed, using fallback:', error);
  // Create a minimal fallback logger
  logger = {
    setContext: () => {},
    debug: (msg: string) => console.log('[DEBUG]', msg),
    info: (msg: string) => console.log('[INFO]', msg),
    warn: (msg: string) => console.warn('[WARN]', msg),
    error: (msg: string, err?: any) => console.error('[ERROR]', msg, err),
  };
}

export { logger };

// Performance monitoring
export class PerformanceMonitor {
  private static instance: PerformanceMonitor;

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  startTimer(name: string): () => number {
    const startTime = performance.now();
    return () => {
      const duration = performance.now() - startTime;
      logger.info(`Performance: ${name}`, { duration, metric: 'timer' });
      return duration;
    };
  }

  recordMetric(name: string, value: number, unit = 'ms') {
    logger.info(`Metric: ${name}`, { value, unit, metric: 'custom' });
  }

  recordPageView(route: string) {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    if (navigation) {
      logger.info('Page view', {
        route,
        loadTime: navigation.loadEventEnd - navigation.fetchStart,
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.fetchStart,
        metric: 'pageview',
      });
    }
  }
}

export const performance_monitor = PerformanceMonitor.getInstance();
