import React, { Component, ReactNode } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { checkNetworkConnectivity } from '@/lib/networkUtils';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  isNetworkError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, isNetworkError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    const isNetworkError = error.message?.includes('network') || 
                          error.message?.includes('connection') || 
                          error.message?.includes('internet') ||
                          error.message?.includes('fetch');
    
    return { hasError: true, error, isNetworkError };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReset = async () => {
    // Check network connectivity before resetting
    if (this.state.isNetworkError) {
      const isConnected = await checkNetworkConnectivity();
      if (!isConnected) {
        // Still offline, don't reset yet
        return;
      }
    }
    
    this.setState({ hasError: false, error: undefined, isNetworkError: false });
  };

  render() {
    if (this.state.hasError) {
      const { isNetworkError, error } = this.state;
      
      return (
        <View style={styles.container}>
          <Text style={styles.emoji}>
            {isNetworkError ? '📡' : '⚠️'}
          </Text>
          <Text style={styles.title}>
            {isNetworkError ? 'No internet connection' : 'Something went wrong'}
          </Text>
          <Text style={styles.message}>
            {isNetworkError 
              ? 'Please check your connection and try again.'
              : 'We\'re sorry, but something unexpected happened.'
            }
          </Text>
          {error && !isNetworkError && (
            <Text style={styles.errorDetails}>
              {error.message}
            </Text>
          )}
          <TouchableOpacity style={styles.button} onPress={this.handleReset}>
            <Text style={styles.buttonText}>
              {isNetworkError ? 'Retry' : 'Try Again'}
            </Text>
          </TouchableOpacity>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f8fffe',
  },
  emoji: {
    fontSize: 48,
    marginBottom: 16,
    textAlign: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  errorDetails: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
    marginBottom: 24,
    fontFamily: 'monospace',
  },
  button: {
    backgroundColor: '#22c55e',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});