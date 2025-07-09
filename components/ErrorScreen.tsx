import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { errorHandler } from '../utils/ErrorHandler';

interface ErrorScreenProps {
  error: Error;
  errorInfo?: any;
  onRetry?: () => void;
  onReport?: () => void;
  onGoBack?: () => void;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  context?: string;
}

export const ErrorScreen: React.FC<ErrorScreenProps> = ({
  error,
  errorInfo,
  onRetry,
  onReport,
  onGoBack,
  severity = 'medium',
  context,
}) => {
  const getSeverityColor = () => {
    switch (severity) {
      case 'low':
        return '#ffa726';
      case 'medium':
        return '#ff9800';
      case 'high':
        return '#f44336';
      case 'critical':
        return '#d32f2f';
      default:
        return '#ff9800';
    }
  };

  const getSeverityIcon = () => {
    switch (severity) {
      case 'low':
        return '⚠️';
      case 'medium':
        return '🚨';
      case 'high':
        return '💥';
      case 'critical':
        return '🔥';
      default:
        return '🚨';
    }
  };

  const getSeverityTitle = () => {
    switch (severity) {
      case 'low':
        return 'Minor Issue';
      case 'medium':
        return 'Something went wrong';
      case 'high':
        return 'Serious Error';
      case 'critical':
        return 'Critical Error';
      default:
        return 'Error';
    }
  };

  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    } else {
      // Default retry behavior
      console.log('Retrying...');
    }
  };

  const handleReport = () => {
    if (onReport) {
      onReport();
    } else {
      // Default report behavior
      errorHandler.logError('User Reported Error', error.message, severity, {
        errorInfo,
        context,
        userReported: true,
      });
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={[styles.errorCard, { borderLeftColor: getSeverityColor() }]}>
          <Text style={styles.errorIcon}>{getSeverityIcon()}</Text>
          <Text style={styles.errorTitle}>{getSeverityTitle()}</Text>
          
          <Text style={styles.errorMessage}>
            {error.message || 'An unexpected error occurred'}
          </Text>

          {context && (
            <View style={styles.contextContainer}>
              <Text style={styles.contextLabel}>Context:</Text>
              <Text style={styles.contextText}>{context}</Text>
            </View>
          )}

          {__DEV__ && (
            <View style={styles.debugContainer}>
              <Text style={styles.debugTitle}>Debug Information</Text>
              <Text style={styles.debugText}>Error: {error.message}</Text>
              {error.stack && (
                <Text style={styles.debugText}>Stack: {error.stack}</Text>
              )}
              {errorInfo && (
                <Text style={styles.debugText}>
                  Info: {JSON.stringify(errorInfo, null, 2)}
                </Text>
              )}
            </View>
          )}

          <View style={styles.actionContainer}>
            {onRetry && (
              <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
                <Text style={styles.retryButtonText}>Try Again</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity style={styles.reportButton} onPress={handleReport}>
              <Text style={styles.reportButtonText}>Report Issue</Text>
            </TouchableOpacity>

            {onGoBack && (
              <TouchableOpacity style={styles.backButton} onPress={onGoBack}>
                <Text style={styles.backButtonText}>Go Back</Text>
              </TouchableOpacity>
            )}
          </View>

          {severity === 'critical' && (
            <View style={styles.criticalWarning}>
              <Text style={styles.criticalWarningText}>
                ⚠️ This is a critical error. The app may need to restart.
              </Text>
            </View>
          )}
        </View>

        <View style={styles.helpSection}>
          <Text style={styles.helpTitle}>What you can do:</Text>
          <View style={styles.helpList}>
            <Text style={styles.helpItem}>• Try the action again</Text>
            <Text style={styles.helpItem}>• Check your internet connection</Text>
            <Text style={styles.helpItem}>• Restart the app if the problem persists</Text>
            <Text style={styles.helpItem}>• Report the issue to help us improve</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
    justifyContent: 'center',
  },
  errorCard: {
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    padding: 24,
    marginBottom: 20,
    borderLeftWidth: 4,
  },
  errorIcon: {
    fontSize: 48,
    textAlign: 'center',
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 12,
  },
  errorMessage: {
    fontSize: 16,
    color: '#cccccc',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
  contextContainer: {
    backgroundColor: '#333333',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
  },
  contextLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ff4444',
    marginBottom: 4,
  },
  contextText: {
    fontSize: 14,
    color: '#cccccc',
  },
  debugContainer: {
    backgroundColor: '#333333',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
  },
  debugTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ff4444',
    marginBottom: 8,
  },
  debugText: {
    fontSize: 12,
    color: '#999999',
    fontFamily: 'monospace',
    marginBottom: 4,
  },
  actionContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#ff4444',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 100,
  },
  retryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  reportButton: {
    backgroundColor: 'transparent',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#666666',
    minWidth: 100,
  },
  reportButtonText: {
    color: '#cccccc',
    fontSize: 16,
    textAlign: 'center',
  },
  backButton: {
    backgroundColor: 'transparent',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#666666',
    minWidth: 100,
  },
  backButtonText: {
    color: '#cccccc',
    fontSize: 16,
    textAlign: 'center',
  },
  criticalWarning: {
    backgroundColor: '#d32f2f',
    borderRadius: 8,
    padding: 12,
    marginTop: 12,
  },
  criticalWarningText: {
    color: '#ffffff',
    fontSize: 14,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  helpSection: {
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    padding: 20,
  },
  helpTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 12,
  },
  helpList: {
    gap: 8,
  },
  helpItem: {
    fontSize: 14,
    color: '#cccccc',
    lineHeight: 20,
  },
}); 