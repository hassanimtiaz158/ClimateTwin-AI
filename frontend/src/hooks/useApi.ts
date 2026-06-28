import { useState, useEffect, useCallback, useRef } from 'react';
import { ApiError } from '../services/api';

interface UseApiOptions<T> {
  immediate?: boolean;
  retries?: number;
  retryDelay?: number;
  onSuccess?: (data: T) => void;
  onError?: (error: ApiError) => void;
}

interface UseApiReturn<T> {
  data: T | null;
  loading: boolean;
  error: ApiError | null;
  execute: (...args: unknown[]) => Promise<T | undefined>;
  retry: () => Promise<T | undefined>;
  clearError: () => void;
}

export function useApi<T>(
  apiFunction: (...args: unknown[]) => Promise<T>,
  options: UseApiOptions<T> = {}
): UseApiReturn<T> {
  const {
    immediate = false,
    retries = 0,
    retryDelay = 1000,
    onSuccess,
    onError,
  } = options;

  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const lastArgsRef = useRef<unknown[]>([]);
  const mountedRef = useRef(true);

  useEffect(() => {
    return () => { mountedRef.current = false; };
  }, []);

  const execute = useCallback(
    async (...args: unknown[]): Promise<T | undefined> => {
      lastArgsRef.current = args;
      setLoading(true);
      setError(null);

      let lastError: ApiError | null = null;

      for (let attempt = 0; attempt <= retries; attempt++) {
        try {
          const result = await apiFunction(...args);
          if (mountedRef.current) {
            setData(result);
            setError(null);
            onSuccess?.(result);
          }
          return result;
        } catch (err) {
          const apiErr = err instanceof ApiError
            ? err
            : new ApiError(0, err instanceof Error ? err.message : 'Unknown error');
          lastError = apiErr;

          // Retry with delay if we have retries left
          if (attempt < retries) {
            await new Promise((resolve) => setTimeout(resolve, retryDelay * (attempt + 1)));
          }
        }
      }

      if (mountedRef.current && lastError) {
        setError(lastError);
        onError?.(lastError);
      }
      return undefined;
    },
    [apiFunction, retries, retryDelay, onSuccess, onError]
  );

  const retry = useCallback(async (): Promise<T | undefined> => {
    return execute(...lastArgsRef.current);
  }, [execute]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [immediate, execute]);

  return { data, loading, error, execute, retry, clearError };
}
