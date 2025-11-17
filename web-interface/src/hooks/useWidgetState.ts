/**
 * Widget State Hook - Inspired by OpenAI Apps SDK
 * Persists component state across renders using localStorage
 */

import { useState, useCallback } from 'react';

interface WidgetStateOptions<T> {
  key: string;
  initialState: T;
  version?: number; // For state migration
}

export function useWidgetState<T>(options: WidgetStateOptions<T>) {
  const { key, initialState, version = 1 } = options;

  // Initialize from localStorage or use initial state
  const [state, setStateInternal] = useState<T>(() => {
    // Check if we're in a browser environment (not during build)
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      return initialState;
    }
    
    try {
      const saved = localStorage.getItem(`widget_state_${key}`);
      if (!saved) return initialState;

      const parsed = JSON.parse(saved);
      
      // Version check for migration
      if (parsed.__v !== version) {
        console.warn(`Widget state version mismatch for ${key}. Resetting.`);
        return initialState;
      }

      return parsed.state;
    } catch (error) {
      console.warn(`Failed to load widget state for ${key}:`, error);
      return initialState;
    }
  });

  // Persist to localStorage when state changes
  const setWidgetState = useCallback((newState: T | ((prev: T) => T)) => {
    setStateInternal((prev) => {
      const next = typeof newState === 'function' 
        ? (newState as (prev: T) => T)(prev) 
        : newState;

      // Check if we're in a browser environment (not during build)
      if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
        try {
          const toSave = {
            __v: version,
            state: next,
            updatedAt: new Date().toISOString(),
          };
          localStorage.setItem(`widget_state_${key}`, JSON.stringify(toSave));
        } catch (error) {
          console.warn(`Failed to persist widget state for ${key}:`, error);
        }
      }

      return next;
    });
  }, [key, version]);

  // Clear state
  const clearWidgetState = useCallback(() => {
    // Check if we're in a browser environment (not during build)
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      try {
        localStorage.removeItem(`widget_state_${key}`);
      } catch (error) {
        console.warn(`Failed to clear widget state for ${key}:`, error);
      }
    }
    setStateInternal(initialState);
  }, [key, initialState]);

  return {
    state,
    setState: setWidgetState,
    clearState: clearWidgetState,
  };
}

