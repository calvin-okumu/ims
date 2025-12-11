import axios from 'axios';
import axiosRetry from 'axios-retry';

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_ZKBIO_API_URL || 'http://localhost:8080', // Replace with actual ZKBio CVSecurity API base URL
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important for session cookies
  // For browser environments, we can't disable SSL validation directly
  // The user will need to accept the certificate warning or use a valid certificate
});

// Authentication interceptor - use access token as URL parameter (ZKBio requirement)
apiClient.interceptors.request.use((config) => {
  const token = process.env.NEXT_PUBLIC_ZKBIO_API_TOKEN;
  if (token) {
    // Add access token as URL parameter (ZKBio requirement)
    const separator = config.url?.includes('?') ? '&' : '?';
    config.url = `${config.url}${separator}access_token=${token}`;
  }
  return config;
});

// Configure retry logic
axiosRetry(apiClient, {
  retries: 3,
  retryDelay: axiosRetry.exponentialDelay,
  retryCondition: (error) => {
    return axiosRetry.isNetworkOrIdempotentRequestError(error) || (error.response?.status ? error.response.status >= 500 : false);
  },
});

// Custom error class
class ApiError extends Error {
  status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.status = status;
    this.name = 'ApiError';
  }
}

// Response interceptor for ZKBio format and error handling
apiClient.interceptors.response.use(
  (response) => {
    // Handle ZKBio response wrapper format
    if (response.data && typeof response.data === 'object') {
      const { code, data, message } = response.data;
      // ZKBio uses code 0 for success, not 200
      if (code === 0) {
        // Return the actual data, not the wrapper
        return { ...response, data };
      } else {
        throw new ApiError(message || 'API Error', code);
      }
    }
    return response;
  },
  (error) => {
    // Handle authentication redirects
    if (error.response?.status === 302) {
      throw new ApiError('Authentication required - please check API settings', 401);
    }
    const errorMessage = error.response?.data?.message || error.message || 'Unknown error';
    console.error('API Error:', {
      status: error.response?.status,
      message: errorMessage,
      url: error.config?.url,
    });

    // Throw a custom error
    return Promise.reject(new ApiError(errorMessage, error.response?.status));
  }
);

export default apiClient;