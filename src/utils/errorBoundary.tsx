import React, { Component, ErrorInfo, ReactNode } from 'react';
import { debugLogger } from './debugLogger';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
  errorId: string;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { 
      hasError: false,
      errorId: ''
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    const errorId = `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    return { 
      hasError: true, 
      error,
      errorId
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Enhanced error logging with full context
    debugLogger.critical('ERROR_BOUNDARY', 'Component error boundary triggered', {
      errorId: this.state.errorId,
      errorName: error.name,
      errorMessage: error.message,
      errorStack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      systemInfo: debugLogger.getSystemInfo()
    }, error);

    // Store error info in state for display
    this.setState({ errorInfo });

    // Call optional error handler
    if (this.props.onError) {
      try {
        this.props.onError(error, errorInfo);
      } catch (handlerError) {
        debugLogger.error('ERROR_BOUNDARY', 'Error in error handler', {
          originalError: error.message,
          handlerError: handlerError
        });
      }
    }

    // Store error details in localStorage for debugging
    try {
      const errorDetails = {
        errorId: this.state.errorId,
        timestamp: new Date().toISOString(),
        error: {
          name: error.name,
          message: error.message,
          stack: error.stack
        },
        errorInfo: {
          componentStack: errorInfo.componentStack
        },
        systemInfo: debugLogger.getSystemInfo()
      };
      
      const existingErrors = JSON.parse(localStorage.getItem('virtualLab_errors') || '[]');
      existingErrors.push(errorDetails);
      
      // Keep only last 10 errors
      const recentErrors = existingErrors.slice(-10);
      localStorage.setItem('virtualLab_errors', JSON.stringify(recentErrors));
    } catch (storageError) {
      debugLogger.warn('ERROR_BOUNDARY', 'Failed to store error in localStorage', {
        storageError: storageError
      });
    }
  }

  private handleRefresh = () => {
    debugLogger.info('ERROR_BOUNDARY', 'User initiated page refresh from error boundary');
    window.location.reload();
  };

  private handleRetry = () => {
    debugLogger.info('ERROR_BOUNDARY', 'User initiated retry from error boundary');
    this.setState({ 
      hasError: false, 
      error: undefined, 
      errorInfo: undefined,
      errorId: ''
    });
  };

  private handleReportError = () => {
    debugLogger.info('ERROR_BOUNDARY', 'User initiated error report');
    
    const errorReport = {
      errorId: this.state.errorId,
      timestamp: new Date().toISOString(),
      error: this.state.error ? {
        name: this.state.error.name,
        message: this.state.error.message,
        stack: this.state.error.stack
      } : null,
      componentStack: this.state.errorInfo?.componentStack,
      systemInfo: debugLogger.getSystemInfo(),
      recentLogs: debugLogger.getLogs().slice(-20)
    };

    // Copy error report to clipboard
    navigator.clipboard.writeText(JSON.stringify(errorReport, null, 2)).then(() => {
      alert('Error report copied to clipboard! You can paste this in a bug report.');
    }).catch(() => {
      // Fallback: show error report in console
      console.log('Error Report:', errorReport);
      alert('Error report logged to console. Please check browser developer tools.');
    });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Something went wrong</h2>
              <p className="text-gray-600 mb-4">
                We encountered an unexpected error. Don't worry, your data is safe.
              </p>
              
              {import.meta.env.DEV && this.state.error && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded text-left">
                  <p className="text-sm font-medium text-red-800 mb-1">Debug Info:</p>
                  <p className="text-xs text-red-700 font-mono break-all">
                    {this.state.error.name}: {this.state.error.message}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    Error ID: {this.state.errorId}
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <button
                onClick={this.handleRetry}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Try Again
              </button>
              
              <button
                onClick={this.handleRefresh}
                className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
              >
                Refresh Page
              </button>

              <button
                onClick={this.handleReportError}
                className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
              >
                Report Error
              </button>

              <div className="pt-2 border-t border-gray-200">
                <p className="text-xs text-gray-500 text-center">
                  If this problem persists, please contact support with Error ID: {this.state.errorId}
                </p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
