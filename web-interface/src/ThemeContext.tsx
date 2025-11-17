import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';

interface ThemeContextType {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

export const ThemeContext = createContext<ThemeContextType>({
  isDarkMode: false,
  toggleDarkMode: () => {},
});

// Custom hook for easier consumption
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

const THEME_STORAGE_KEY = 'eyeq_theme_preference';

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  // Initialize theme from localStorage or system preference
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Check if we're in a browser environment (not during build)
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      return false; // Default to light mode during build
    }
    
    // Check localStorage first
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
    if (savedTheme !== null) {
      return savedTheme === 'dark';
    }
    
    // Fall back to system preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return true;
    }
    
    // Default to light mode
    return false;
  });

  // Apply theme class to document and save to localStorage
  useEffect(() => {
    // Check if we're in a browser environment (not during build)
    if (typeof window === 'undefined' || typeof document === 'undefined' || typeof localStorage === 'undefined') {
      return;
    }
    
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem(THEME_STORAGE_KEY, 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem(THEME_STORAGE_KEY, 'light');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode(prev => !prev);
  };

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
};
