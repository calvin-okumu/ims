import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, Loader2 } from 'lucide-react';
import apiClient from '../lib/apiClient';

interface ApiTestResult {
  status: 'idle' | 'testing' | 'success' | 'error';
  message: string;
  details?: any;
}

const ApiConnectivityTest: React.FC = () => {
  const [testResult, setTestResult] = useState<ApiTestResult>({
    status: 'idle',
    message: ''
  });

  const [envInfo, setEnvInfo] = useState({
    apiUrl: process.env.NEXT_PUBLIC_ZKBIO_API_URL || 'Not set',
    hasToken: !!process.env.NEXT_PUBLIC_ZKBIO_API_TOKEN,
    tokenLength: process.env.NEXT_PUBLIC_ZKBIO_API_TOKEN?.length || 0
  });

  const testApiConnectivity = async () => {
    setTestResult({ status: 'testing', message: 'Testing API connectivity...' });

    try {
      // Test basic connectivity with a simple GET request
      const response = await apiClient.get('/person', { 
        timeout: 5000 // Shorter timeout for testing
      });
      
      setTestResult({
        status: 'success',
        message: 'API is accessible and responding correctly',
        details: {
          responseTime: 'Fast',
          dataReceived: !!response.data,
          endpoint: '/person'
        }
      });
    } catch (error: any) {
      let errorMessage = 'API connection failed';
      let details = {};

      if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
        errorMessage = 'API server is not reachable';
        details = { 
          error: 'Network connection failed',
          suggestion: 'Check if the API server is running and the URL is correct'
        };
      } else if (error.response?.status === 401) {
        errorMessage = 'API is accessible but authentication failed';
        details = { 
          error: 'Invalid API token',
          suggestion: 'Check your NEXT_PUBLIC_ZKBIO_API_TOKEN environment variable'
        };
      } else if (error.response?.status === 404) {
        errorMessage = 'API is accessible but endpoint not found';
        details = { 
          error: 'Endpoint not available',
          suggestion: 'The API server may be running a different version'
        };
      } else {
        errorMessage = error.message || 'Unknown error occurred';
        details = { 
          error: error.code,
          status: error.response?.status
        };
      }

      setTestResult({
        status: 'error',
        message: errorMessage,
        details
      });
    }
  };

  const testEnvironmentVariables = () => {
    const issues = [];
    
    if (!process.env.NEXT_PUBLIC_ZKBIO_API_URL) {
      issues.push('NEXT_PUBLIC_ZKBIO_API_URL is not set');
    }
    
    if (!process.env.NEXT_PUBLIC_ZKBIO_API_TOKEN) {
      issues.push('NEXT_PUBLIC_ZKBIO_API_TOKEN is not set');
    } else if (process.env.NEXT_PUBLIC_ZKBIO_API_TOKEN === 'your_api_token_here') {
      issues.push('NEXT_PUBLIC_ZKBIO_API_TOKEN is using the default placeholder value');
    }

    if (issues.length > 0) {
      setTestResult({
        status: 'error',
        message: 'Environment configuration issues found',
        details: { issues }
      });
    } else {
      setTestResult({
        status: 'success',
        message: 'Environment variables are properly configured',
        details: envInfo
      });
    }
  };

  useEffect(() => {
    setEnvInfo({
      apiUrl: process.env.NEXT_PUBLIC_ZKBIO_API_URL || 'Not set',
      hasToken: !!process.env.NEXT_PUBLIC_ZKBIO_API_TOKEN,
      tokenLength: process.env.NEXT_PUBLIC_ZKBIO_API_TOKEN?.length || 0
    });
  }, []);

  const getStatusIcon = () => {
    switch (testResult.status) {
      case 'testing':
        return <Loader2 className="w-5 h-5 animate-spin" />;
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
    }
  };

  const getStatusColor = () => {
    switch (testResult.status) {
      case 'testing':
        return 'text-blue-600';
      case 'success':
        return 'text-green-600';
      case 'error':
        return 'text-red-600';
      default:
        return 'text-yellow-600';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
        API Connectivity Test
      </h3>

      {/* Environment Information */}
      <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
        <h4 className="font-medium text-gray-900 dark:text-white mb-3">Environment Configuration</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">API URL:</span>
            <span className={`font-mono ${envInfo.apiUrl === 'Not set' ? 'text-red-600' : 'text-green-600'}`}>
              {envInfo.apiUrl}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">API Token:</span>
            <span className={envInfo.hasToken ? 'text-green-600' : 'text-red-600'}>
              {envInfo.hasToken ? `Set (${envInfo.tokenLength} chars)` : 'Not set'}
            </span>
          </div>
        </div>
      </div>

      {/* Test Buttons */}
      <div className="flex gap-3 mb-6">
        <button
          onClick={testEnvironmentVariables}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <AlertCircle className="w-4 h-4" />
          Check Environment
        </button>
        <button
          onClick={testApiConnectivity}
          disabled={testResult.status === 'testing'}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 disabled:opacity-50"
        >
          {testResult.status === 'testing' ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <CheckCircle className="w-4 h-4" />
          )}
          Test API Connection
        </button>
      </div>

      {/* Test Results */}
      {testResult.status !== 'idle' && (
        <div className={`p-4 rounded-lg border ${
          testResult.status === 'success' 
            ? 'bg-green-50 border-green-200' 
            : testResult.status === 'error'
            ? 'bg-red-50 border-red-200'
            : 'bg-blue-50 border-blue-200'
        }`}>
          <div className="flex items-center gap-3 mb-2">
            {getStatusIcon()}
            <h4 className={`font-medium ${getStatusColor()}`}>
              {testResult.message}
            </h4>
          </div>
          
          {testResult.details && (
            <div className="text-sm text-gray-600 space-y-1">
              {testResult.details.issues && (
                <div>
                  <strong>Issues:</strong>
                  <ul className="ml-4 mt-1 list-disc">
                    {testResult.details.issues.map((issue: string, index: number) => (
                      <li key={index}>{issue}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {testResult.details.error && (
                <div>
                  <strong>Error:</strong> {testResult.details.error}
                </div>
              )}
              
              {testResult.details.suggestion && (
                <div>
                  <strong>Suggestion:</strong> {testResult.details.suggestion}
                </div>
              )}
              
              {testResult.details.responseTime && (
                <div>
                  <strong>Response Time:</strong> {testResult.details.responseTime}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Instructions */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <h4 className="font-medium text-blue-900 mb-2">Setup Instructions</h4>
        <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
          <li>Copy <code className="bg-blue-100 px-1 rounded">.env.local.example</code> to <code className="bg-blue-100 px-1 rounded">.env.local</code></li>
          <li>Update <code className="bg-blue-100 px-1 rounded">NEXT_PUBLIC_ZKBIO_API_URL</code> with your ZKBio server URL</li>
          <li>Update <code className="bg-blue-100 px-1 rounded">NEXT_PUBLIC_ZKBIO_API_TOKEN</code> with your API token</li>
          <li>Restart the development server</li>
        </ol>
      </div>
    </div>
  );
};

export default ApiConnectivityTest;