/**
 * Display Mode Hook - Inspired by OpenAI Apps SDK
 * Manages layout modes: compact, expanded, fullscreen
 */

import { useState, useCallback } from 'react';

export type DisplayMode = 'compact' | 'expanded' | 'fullscreen';

interface DisplayModeOptions {
  defaultMode?: DisplayMode;
  persistKey?: string;
}

export function useDisplayMode(options: DisplayModeOptions = {}) {
  const { defaultMode = 'compact', persistKey = 'displayMode' } = options;

  // Initialize from localStorage if available
  const [displayMode, setDisplayModeState] = useState<DisplayMode>(() => {
    // Check if we're in a browser environment (not during build)
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      return defaultMode;
    }
    
    try {
      const saved = localStorage.getItem(persistKey);
      return (saved as DisplayMode) || defaultMode;
    } catch {
      return defaultMode;
    }
  });

  // Persist to localStorage when changed
  const setDisplayMode = useCallback((mode: DisplayMode) => {
    setDisplayModeState(mode);
    // Check if we're in a browser environment (not during build)
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      return;
    }
    
    try {
      localStorage.setItem(persistKey, mode);
    } catch (error) {
      console.warn('Failed to persist display mode:', error);
    }
  }, [persistKey]);

  // Request display mode change (mimics window.openai.requestDisplayMode)
  const requestDisplayMode = useCallback(async (mode: DisplayMode) => {
    // On mobile, coerce fullscreen to expanded
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
    const finalMode = isMobile && mode === 'fullscreen' ? 'expanded' : mode;
    
    setDisplayMode(finalMode);
    
    // Return promise to match OpenAI API pattern
    return Promise.resolve({ mode: finalMode });
  }, [setDisplayMode]);

  // Toggle between modes
  const toggleDisplayMode = useCallback(() => {
    const modes: DisplayMode[] = ['compact', 'expanded', 'fullscreen'];
    const currentIndex = modes.indexOf(displayMode);
    const nextIndex = (currentIndex + 1) % modes.length;
    requestDisplayMode(modes[nextIndex]);
  }, [displayMode, requestDisplayMode]);

  // Get max height based on display mode
  const maxHeight = displayMode === 'fullscreen' 
    ? (typeof window !== 'undefined' ? window.innerHeight : 800)
    : displayMode === 'expanded' 
      ? 800 
      : 600;

  return {
    displayMode,
    setDisplayMode,
    requestDisplayMode,
    toggleDisplayMode,
    maxHeight,
    isCompact: displayMode === 'compact',
    isExpanded: displayMode === 'expanded',
    isFullscreen: displayMode === 'fullscreen',
  };
}

