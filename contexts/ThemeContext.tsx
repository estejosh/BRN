import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { errorHandler } from '../utils/ErrorHandler';
import { storageManager } from '../utils/StorageManager';

export type ThemeMode = 'light' | 'dark' | 'high-contrast';

export interface Theme {
  background: string;
  surface: string;
  primary: string;
  secondary: string;
  text: string;
  textSecondary: string;
  textTertiary: string;
  onPrimary: string;
  onSecondary: string;
  iconPrimary: string;
  iconSecondary: string;
  border: string;
  shadow: string;
  error: string;
  warning: string;
  success: string;
  info: string;
}

interface ThemeContextType {
  theme: Theme;
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
  isDark: boolean;
  isHighContrast: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Theme definitions
const themes: Record<ThemeMode, Theme> = {
  light: {
    background: '#ffffff',
    surface: '#f5f5f5',
    primary: '#ff4444',
    secondary: '#666666',
    text: '#000000',
    textSecondary: '#666666',
    textTertiary: '#999999',
    onPrimary: '#ffffff',
    onSecondary: '#ffffff',
    iconPrimary: '#000000',
    iconSecondary: '#666666',
    border: '#e0e0e0',
    shadow: 'rgba(0, 0, 0, 0.1)',
    error: '#f44336',
    warning: '#ff9800',
    success: '#4caf50',
    info: '#2196f3',
  },
  dark: {
    background: '#1a1a1a',
    surface: '#2a2a2a',
    primary: '#ff4444',
    secondary: '#666666',
    text: '#ffffff',
    textSecondary: '#cccccc',
    textTertiary: '#999999',
    onPrimary: '#ffffff',
    onSecondary: '#ffffff',
    iconPrimary: '#ffffff',
    iconSecondary: '#cccccc',
    border: '#333333',
    shadow: 'rgba(0, 0, 0, 0.3)',
    error: '#f44336',
    warning: '#ff9800',
    success: '#4caf50',
    info: '#2196f3',
  },
  'high-contrast': {
    background: '#000000',
    surface: '#1a1a1a',
    primary: '#ffffff',
    secondary: '#ffffff',
    text: '#ffffff',
    textSecondary: '#ffffff',
    textTertiary: '#ffffff',
    onPrimary: '#000000',
    onSecondary: '#000000',
    iconPrimary: '#ffffff',
    iconSecondary: '#ffffff',
    border: '#ffffff',
    shadow: 'rgba(255, 255, 255, 0.2)',
    error: '#ff0000',
    warning: '#ffff00',
    success: '#00ff00',
    info: '#00ffff',
  },
};

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [themeMode, setThemeModeState] = useState<ThemeMode>('dark');
  const [isInitialized, setIsInitialized] = useState(false);

  const theme = themes[themeMode];
  const isDark = themeMode === 'dark';
  const isHighContrast = themeMode === 'high-contrast';

  // Load saved theme on initialization
  useEffect(() => {
    const loadSavedTheme = async () => {
      try {
        const savedTheme = await storageManager.getItem<ThemeMode>('theme_mode');
        if (savedTheme && themes[savedTheme]) {
          setThemeModeState(savedTheme);
        }
        setIsInitialized(true);
      } catch (error) {
        errorHandler.logError(
          'Theme Loading Error',
          'Failed to load saved theme',
          'low',
          { error: error.message },
          'ThemeContext'
        );
        // Fallback to dark theme
        setThemeModeState('dark');
        setIsInitialized(true);
      }
    };

    loadSavedTheme();
  }, []);

  const setThemeMode = async (mode: ThemeMode) => {
    try {
      if (!themes[mode]) {
        throw new Error(`Invalid theme mode: ${mode}`);
      }

      setThemeModeState(mode);
      
      // Save theme preference
      await storageManager.setItem('theme_mode', mode);
      
      console.log(`Theme changed to: ${mode}`);
    } catch (error) {
      errorHandler.logError(
        'Theme Change Error',
        `Failed to change theme to ${mode}`,
        'medium',
        { 
          requestedMode: mode,
          currentMode: themeMode,
          error: error.message 
        },
        'ThemeContext'
      );
      
      // Fallback to current theme
      console.log('Theme change failed, keeping current theme');
    }
  };

  const toggleTheme = () => {
    try {
      const nextTheme: ThemeMode = isDark ? 'light' : 'dark';
      setThemeMode(nextTheme);
    } catch (error) {
      errorHandler.logError(
        'Theme Toggle Error',
        'Failed to toggle theme',
        'low',
        { 
          currentMode: themeMode,
          error: error.message 
        },
        'ThemeContext'
      );
    }
  };

  // Don't render until theme is loaded
  if (!isInitialized) {
    return null;
  }

  const contextValue: ThemeContextType = {
    theme,
    themeMode,
    setThemeMode,
    toggleTheme,
    isDark,
    isHighContrast,
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    errorHandler.logError(
      'Theme Context Error',
      'useTheme must be used within a ThemeProvider',
      'high',
      {},
      'ThemeContext'
    );
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}; 