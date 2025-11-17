/**
 * Globals Hook - Inspired by OpenAI Apps SDK
 * Provides access to app-wide settings: theme, locale, viewport
 */

import { useState, useEffect } from 'react';
import { useTheme } from '../ThemeContext';

export interface AppGlobals {
  theme: 'light' | 'dark';
  locale: string;
  maxHeight: number;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
}

export function useGlobals(): AppGlobals {
  const { isDarkMode } = useTheme();
  
  const [viewport, setViewport] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  // Listen for viewport changes
  useEffect(() => {
    const handleResize = () => {
      setViewport({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Get browser locale
  const locale = navigator.language || 'en-US';

  // Calculate breakpoints
  const isMobile = viewport.width < 768;
  const isTablet = viewport.width >= 768 && viewport.width < 1024;
  const isDesktop = viewport.width >= 1024;

  return {
    theme: isDarkMode ? 'dark' : 'light',
    locale,
    maxHeight: viewport.height,
    isMobile,
    isTablet,
    isDesktop,
  };
}

