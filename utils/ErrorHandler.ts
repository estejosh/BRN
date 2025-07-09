import { Alert, Platform } from 'react-native';
import { storageManager } from './StorageManager';

export interface ErrorLog {
  id: string;
  timestamp: number;
  error: string;
  stack?: string;
  component?: string;
  screen?: string;
  userAction?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  resolved: boolean;
  metadata?: any;
}

export interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: any;
}

export class ErrorHandler {
  private static instance: ErrorHandler;
  private errorLogs: ErrorLog[] = [];
  private isInitialized = false;

  private constructor() {}

  static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Load existing error logs
      const cached = await storageManager.getItem<ErrorLog[]>('error_logs');
      if (cached) {
        this.errorLogs = cached;
      }

      // Set up global error handlers
      this.setupGlobalErrorHandlers();
      
      this.isInitialized = true;
      console.log('ErrorHandler initialized successfully');
    } catch (error) {
      console.error('Failed to initialize ErrorHandler:', error);
    }
  }

  private setupGlobalErrorHandlers(): void {
    // Handle unhandled promise rejections
    const originalHandler = global.ErrorUtils?.setGlobalHandler;
    if (originalHandler) {
      global.ErrorUtils.setGlobalHandler((error: Error, isFatal?: boolean) => {
        this.handleGlobalError(error, isFatal);
      });
    }

    // Handle console errors
    const originalConsoleError = console.error;
    console.error = (...args: any[]) => {
      this.logError('Console Error', args.join(' '), 'medium');
      originalConsoleError.apply(console, args);
    };

    // Handle console warnings
    const originalConsoleWarn = console.warn;
    console.warn = (...args: any[]) => {
      this.logError('Console Warning', args.join(' '), 'low');
      originalConsoleWarn.apply(console, args);
    };
  }

  private handleGlobalError(error: Error, isFatal?: boolean): void {
    const severity = isFatal ? 'critical' : 'high';
    this.logError('Global Error', error.message, severity, {
      stack: error.stack,
      isFatal,
    });

    if (isFatal) {
      this.showFatalErrorAlert(error);
    }
  }

  private showFatalErrorAlert(error: Error): void {
    Alert.alert(
      'App Error',
      'A critical error occurred. The app will restart.',
      [
        {
          text: 'Restart',
          onPress: () => {
            // In a real app, you might want to restart the app
            console.log('App restart requested');
          },
        },
      ]
    );
  }

  async logError(
    message: string,
    error: string,
    severity: ErrorLog['severity'] = 'medium',
    metadata?: any,
    component?: string,
    screen?: string
  ): Promise<string> {
    const errorLog: ErrorLog = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      timestamp: Date.now(),
      error: `${message}: ${error}`,
      stack: metadata?.stack,
      component,
      screen,
      severity,
      resolved: false,
      metadata,
    };

    this.errorLogs.unshift(errorLog);

    // Keep only the last 100 error logs
    if (this.errorLogs.length > 100) {
      this.errorLogs = this.errorLogs.slice(0, 100);
    }

    // Save to storage
    try {
      await storageManager.setItem('error_logs', this.errorLogs);
    } catch (storageError) {
      console.error('Failed to save error log:', storageError);
    }

    // Log to console in development
    if (__DEV__) {
      console.group(`🚨 Error (${severity}): ${message}`);
      console.error(error);
      if (metadata) console.log('Metadata:', metadata);
      console.groupEnd();
    }

    // Show user-friendly alert for critical errors
    if (severity === 'critical') {
      this.showUserFriendlyError(message, error);
    }

    return errorLog.id;
  }

  private showUserFriendlyError(message: string, error: string): void {
    Alert.alert(
      'Something went wrong',
      'We encountered an error. Please try again or restart the app if the problem persists.',
      [
        { text: 'OK' },
        {
          text: 'Report Issue',
          onPress: () => this.reportError(message, error),
        },
      ]
    );
  }

  private reportError(message: string, error: string): void {
    // In a real app, you would send this to your error reporting service
    console.log('Error reported:', { message, error });
    Alert.alert('Thank you', 'Your error report has been submitted.');
  }

  async getErrorLogs(): Promise<ErrorLog[]> {
    return [...this.errorLogs];
  }

  async getUnresolvedErrors(): Promise<ErrorLog[]> {
    return this.errorLogs.filter(log => !log.resolve);
  }

  async markErrorResolved(errorId: string): Promise<void> {
    const errorLog = this.errorLogs.find(log => log.id === errorId);
    if (errorLog) {
      errorLog.resolved = true;
      await storageManager.setItem('error_logs', this.errorLogs);
    }
  }

  async clearErrorLogs(): Promise<void> {
    this.errorLogs = [];
    await storageManager.removeItem('error_logs');
  }

  // Network error handling
  handleNetworkError(error: any, context?: string): void {
    const message = error?.message || 'Network request failed';
    this.logError('Network Error', message, 'medium', {
      url: error?.config?.url,
      method: error?.config?.method,
      status: error?.response?.status,
      context,
    });

    Alert.alert(
      'Connection Error',
      'Please check your internet connection and try again.',
      [{ text: 'OK' }]
    );
  }

  // Storage error handling
  handleStorageError(error: any, operation: string): void {
    this.logError('Storage Error', `${operation} failed: ${error?.message || error}`, 'medium', {
      operation,
      error,
    });
  }

  // Component error handling
  handleComponentError(error: Error, componentName: string, screenName?: string): void {
    this.logError(
      'Component Error',
      error.message,
      'medium',
      {
        stack: error.stack,
        componentName,
        screenName,
      },
      componentName,
      screenName
    );
  }

  // Validation error handling
  handleValidationError(field: string, message: string): void {
    this.logError('Validation Error', `${field}: ${message}`, 'low', {
      field,
      message,
    });
  }

  // Performance monitoring
  handlePerformanceIssue(operation: string, duration: number, threshold: number): void {
    if (duration > threshold) {
      this.logError(
        'Performance Issue',
        `${operation} took ${duration}ms (threshold: ${threshold}ms)`,
        'low',
        {
          operation,
          duration,
          threshold,
        }
      );
    }
  }
}

// Export singleton instance
export const errorHandler = ErrorHandler.getInstance(); 