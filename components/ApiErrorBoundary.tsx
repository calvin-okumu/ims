'use client';

import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error; retry: () => void }>;
}

class ApiErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({ error, errorInfo });

    // Log error for debugging
    console.error('API Error Boundary caught an error:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return <FallbackComponent error={this.state.error!} retry={this.handleRetry} />;
      }

      return <DefaultErrorFallback error={this.state.error!} retry={this.handleRetry} />;
    }

    return this.props.children;
  }
}

const DefaultErrorFallback: React.FC<{ error: Error; retry: () => void }> = ({ error, retry }) => {
  const isApiError = error.message.includes('API') || error.message.includes('network') || error.message.includes('fetch');

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg border border-gray-200">
        <div className="p-6">
          <div className="flex items-center mb-4">
            <AlertTriangle className="w-8 h-8 text-red-500 mr-3" />
            <h2 className="text-xl font-semibold text-gray-900">
              {isApiError ? 'API Connection Error' : 'Something went wrong'}
            </h2>
          </div>

          <p className="text-gray-600 mb-6">
            {isApiError
              ? 'Unable to connect to the ZKBio server. Please check your configuration and network connection.'
              : 'An unexpected error occurred. Please try again or contact support if the problem persists.'
            }
          </p>

          {process.env.NODE_ENV === 'development' && (
            <details className="mb-6">
              <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
                Error Details (Development)
              </summary>
              <pre className="mt-2 p-3 bg-gray-100 rounded text-xs overflow-auto max-h-32">
                {error.message}
                {error.stack && `\n\n${error.stack}`}
              </pre>
            </details>
          )}

          <div className="flex space-x-3">
            <button
              onClick={retry}
              className="flex-1 flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </button>

            <button
              onClick={() => window.location.href = '/'}
              className="flex-1 flex items-center justify-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              <Home className="w-4 h-4 mr-2" />
              Go Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Hook for handling API errors in functional components
export const useApiErrorHandler = () => {
  const handleApiError = (error: any) => {
    if (error.response?.status === 401) {
      return {
        type: 'error' as const,
        title: 'Authentication Failed',
        message: 'Your session has expired. Please refresh the page and try again.',
        action: 'refresh'
      };
    } else if (error.response?.status === 403) {
      return {
        type: 'error' as const,
        title: 'Access Denied',
        message: 'You do not have permission to perform this action.',
        action: null
      };
    } else if (error.response?.status >= 500) {
      return {
        type: 'error' as const,
        title: 'Server Error',
        message: 'The server encountered an error. Please try again later.',
        action: 'retry'
      };
    } else if (!error.response) {
      return {
        type: 'error' as const,
        title: 'Connection Error',
        message: 'Unable to connect to the server. Please check your internet connection.',
        action: 'retry'
      };
    } else {
      return {
        type: 'error' as const,
        title: 'Request Failed',
        message: error.message || 'An unexpected error occurred.',
        action: 'retry'
      };
    }
  };

  return { handleApiError };
};

export default ApiErrorBoundary;