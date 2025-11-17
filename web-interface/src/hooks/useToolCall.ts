/**
 * Tool Call Hook - Inspired by OpenAI Apps SDK
 * Handles API calls to the backend with proper state management
 */

import { useState, useCallback } from 'react';

interface ToolCallState<T = unknown> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

interface ToolCallOptions {
  onSuccess?: (data: unknown) => void;
  onError?: (error: Error) => void;
}

export function useToolCall<TInput = unknown, TOutput = unknown>(
  toolName: string,
  options: ToolCallOptions = {}
) {
  const [state, setState] = useState<ToolCallState<TOutput>>({
    data: null,
    loading: false,
    error: null,
  });

  const callTool = useCallback(async (input: TInput): Promise<TOutput | null> => {
    setState({ data: null, loading: true, error: null });

    try {
      const response = await fetch(`http://localhost:5000/api/${toolName}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });

      if (!response.ok) {
        throw new Error(`Tool call failed: ${response.statusText}`);
      }

      const data = await response.json() as TOutput;
      
      setState({ data, loading: false, error: null });
      options.onSuccess?.(data);
      
      return data;
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Unknown error');
      setState({ data: null, loading: false, error: err });
      options.onError?.(err);
      return null;
    }
  }, [toolName, options]);

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null });
  }, []);

  return {
    ...state,
    callTool,
    reset,
    isLoading: state.loading,
    isError: !!state.error,
    isSuccess: !!state.data && !state.loading && !state.error,
  };
}

