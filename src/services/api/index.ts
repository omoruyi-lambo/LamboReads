// Centralized API Service Layer: Fetch with retries, timeouts, error handling, logging
import type { RequestInit } from 'next/dist/server/web/spec-extension/request'

export class ApiError extends Error {
  constructor(public status: number, message: string, public cause?: unknown) {
    super(message);
    this.name = "ApiError";
  }
}

// Helper function: Fetch with timeout, retries
export async function fetchWithRetry(
  url: string,
  options: RequestInit = {},
  retries: number = 3,
  timeout: number = 10000,
): Promise<Response> {
  let lastError: unknown;
  
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);
      
      try {
        const response = await fetch(url, {
          ...options,
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          throw new ApiError(
            response.status,
            `Request failed with status ${response.status}: ${response.statusText}`,
          );
        }
        
        return response;
        
      } finally {
        clearTimeout(timeoutId);
      }
    } catch (error) {
      lastError = error;
      
      if (attempt < retries) {
        // Exponential backoff
        const delay = Math.min(1000 * Math.pow(2, attempt - 1));
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }
  
  // All retries failed
  if (lastError instanceof Error) {
    throw new ApiError(
      500,
      `Failed after ${retries} attempts`,
      lastError
    );
  }
  throw new ApiError(500, `Failed after ${retries} attempts`);
}

// Logging helper
export const logApi = {
  info: (message: string, data?: unknown) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[API INFO] ${message}`, data || '');
    }
  },
  error: (message: string, error?: unknown) => {
    console.error(`[API ERROR] ${message}`, error || '');
  },
  warn: (message: string) => {
    console.warn(`[API WARN] ${message}`);
  }
};
