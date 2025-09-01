
import { z } from 'zod';
import { env } from '@/config/environment';

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export interface RequestConfig extends RequestInit {
  timeout?: number;
  retries?: number;
  retryDelay?: number;
}

const defaultConfig: RequestConfig = {
  timeout: 10000,
  retries: 3,
  retryDelay: 1000,
  headers: {
    'Content-Type': 'application/json',
  },
};

async function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function apiRequest<T = unknown>(
  url: string,
  config: RequestConfig = {}
): Promise<T> {
  const mergedConfig = { ...defaultConfig, ...config };
  const { timeout, retries, retryDelay, ...fetchConfig } = mergedConfig;

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= (retries || 0); attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(url, {
        ...fetchConfig,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new ApiError(
          errorData.message || `HTTP ${response.status}`,
          response.status,
          errorData.code
        );
      }

      const data = await response.json();
      return data as T;
    } catch (error) {
      lastError = error as Error;

      // Don't retry on 4xx errors (client errors)
      if (error instanceof ApiError && error.status >= 400 && error.status < 500) {
        throw error;
      }

      // Retry on network errors and 5xx errors
      if (attempt < (retries || 0)) {
        await sleep((retryDelay || 1000) * Math.pow(2, attempt)); // Exponential backoff
        continue;
      }
    }
  }

  throw lastError || new Error('Request failed');
}

// Typed API helpers with Zod validation
export function createApiEndpoint<TInput, TOutput>(
  endpoint: string,
  outputSchema: z.ZodSchema<TOutput>,
  inputSchema?: z.ZodSchema<TInput>
) {
  return async (input?: TInput, config?: RequestConfig): Promise<TOutput> => {
    // Validate input if schema provided
    if (inputSchema && input !== undefined) {
      inputSchema.parse(input);
    }

    const url = endpoint.startsWith('http') ? endpoint : `${env.VITE_APP_BASE_URL}/api${endpoint}`;
    
    const response = await apiRequest<unknown>(url, {
      method: input ? 'POST' : 'GET',
      body: input ? JSON.stringify(input) : undefined,
      ...config,
    });

    // Validate output
    return outputSchema.parse(response);
  };
}
