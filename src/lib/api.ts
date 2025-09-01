
import { logger } from './observability';
import { validateData, ValidationSchema } from './validation';

// API configuration
const API_TIMEOUT = parseInt(import.meta.env.VITE_API_TIMEOUT || '30000');
const MAX_RETRIES = parseInt(import.meta.env.VITE_API_RETRY_ATTEMPTS || '3');

// Enhanced fetch with retry, timeout, and validation
export class ApiClient {
  private baseURL: string;
  private defaultHeaders: Record<string, string>;

  constructor(baseURL = '', headers: Record<string, string> = {}) {
    this.baseURL = baseURL;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      ...headers,
    };
  }

  async request<T>(
    endpoint: string,
    options: RequestInit & {
      timeout?: number;
      retries?: number;
      validateResponse?: ValidationSchema<T>;
    } = {}
  ): Promise<T> {
    const {
      timeout = API_TIMEOUT,
      retries = MAX_RETRIES,
      validateResponse,
      ...fetchOptions
    } = options;

    const url = this.baseURL + endpoint;
    const requestId = this.generateRequestId();
    
    // Add correlation ID for tracing
    const headers = {
      ...this.defaultHeaders,
      ...fetchOptions.headers,
      'X-Request-ID': requestId,
    };

    // Start trace
    const span = window.trace?.startSpan('api_request', {
      'http.method': fetchOptions.method || 'GET',
      'http.url': url,
      'request.id': requestId,
    });

    try {
      const response = await this.fetchWithRetry(url, {
        ...fetchOptions,
        headers,
      }, timeout, retries);

      const data = await this.parseResponse<T>(response);

      // Validate response if schema provided
      if (validateResponse) {
        return validateData(validateResponse, data);
      }

      span?.setAttributes({
        'http.status_code': response.status,
        'response.success': true,
      });

      return data;
    } catch (error) {
      span?.setAttributes({
        'response.success': false,
        'error.message': error instanceof Error ? error.message : 'Unknown error',
      });

      logger.error('API request failed', {
        url,
        method: fetchOptions.method || 'GET',
        requestId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      throw error;
    } finally {
      span?.end();
    }
  }

  private async fetchWithRetry(
    url: string,
    options: RequestInit,
    timeout: number,
    maxRetries: number
  ): Promise<Response> {
    let lastError: Error;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        const response = await fetch(url, {
          ...options,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        // Don't retry on client errors (4xx) except 429 (rate limit)
        if (!response.ok) {
          if (response.status >= 400 && response.status < 500 && response.status !== 429) {
            throw new ApiError(`HTTP ${response.status}: ${response.statusText}`, response.status);
          }
          throw new ApiError(`HTTP ${response.status}: ${response.statusText}`, response.status);
        }

        return response;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error');
        
        // Don't retry on certain errors
        if (error instanceof ApiError && !this.shouldRetry(error.status)) {
          throw error;
        }

        if (attempt < maxRetries) {
          // Exponential backoff with jitter
          const delay = Math.min(1000 * Math.pow(2, attempt) + Math.random() * 1000, 10000);
          await new Promise(resolve => setTimeout(resolve, delay));
          
          logger.warn('API request retry', {
            url,
            attempt: attempt + 1,
            maxRetries,
            delay,
            error: lastError.message,
          });
        }
      }
    }

    throw lastError!;
  }

  private async parseResponse<T>(response: Response): Promise<T> {
    const contentType = response.headers.get('Content-Type') || '';
    
    if (contentType.includes('application/json')) {
      return response.json();
    }
    
    if (contentType.includes('text/')) {
      return response.text() as unknown as T;
    }
    
    return response.blob() as unknown as T;
  }

  private shouldRetry(status?: number): boolean {
    if (!status) return true; // Network errors, timeouts etc.
    
    // Retry on server errors and rate limits
    return status >= 500 || status === 429;
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Convenience methods
  async get<T>(endpoint: string, options: Omit<Parameters<typeof this.request>[1], 'method'> = {}) {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  async post<T>(endpoint: string, data?: any, options: Omit<Parameters<typeof this.request>[1], 'method' | 'body'> = {}) {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: any, options: Omit<Parameters<typeof this.request>[1], 'method' | 'body'> = {}) {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async patch<T>(endpoint: string, data?: any, options: Omit<Parameters<typeof this.request>[1], 'method' | 'body'> = {}) {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string, options: Omit<Parameters<typeof this.request>[1], 'method'> = {}) {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }
}

// Custom API error class
export class ApiError extends Error {
  constructor(message: string, public status?: number, public code?: string) {
    super(message);
    this.name = 'ApiError';
  }
}

// Global API client instance
export const apiClient = new ApiClient();

// Rate limiting helper
export class RateLimiter {
  private requests: Map<string, number[]> = new Map();

  isAllowed(key: string, limit: number, windowMs: number): boolean {
    const now = Date.now();
    const requests = this.requests.get(key) || [];
    
    // Remove old requests outside the window
    const validRequests = requests.filter(time => now - time < windowMs);
    
    if (validRequests.length >= limit) {
      return false;
    }
    
    validRequests.push(now);
    this.requests.set(key, validRequests);
    return true;
  }

  getRemainingRequests(key: string, limit: number, windowMs: number): number {
    const now = Date.now();
    const requests = this.requests.get(key) || [];
    const validRequests = requests.filter(time => now - time < windowMs);
    
    return Math.max(0, limit - validRequests.length);
  }

  getResetTime(key: string, windowMs: number): number {
    const requests = this.requests.get(key) || [];
    if (requests.length === 0) return 0;
    
    const oldestRequest = Math.min(...requests);
    return oldestRequest + windowMs;
  }
}

// Export a global rate limiter instance
export const rateLimiter = new RateLimiter();

// Helper for handling API errors in React components
export function handleApiError(error: unknown): string {
  if (error instanceof ApiError) {
    return error.message;
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  return 'An unexpected error occurred';
}
