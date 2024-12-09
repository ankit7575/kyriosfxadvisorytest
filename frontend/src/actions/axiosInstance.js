import axios from 'axios';
import axiosRetry from 'axios-retry';

// Retrieve the base URL from the environment or default to '/api/v1'
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || '/api/v1';

// Create an axios instance with default configurations
const axiosInstance = axios.create({
  baseURL: API_BASE_URL, // Set base URL for all requests
  headers: {
    'Content-Type': 'application/json', // Default header for JSON requests
  },
});

// Log a warning if the base URL is not set explicitly, only in development mode
if (!process.env.REACT_APP_API_BASE_URL && process.env.NODE_ENV === 'development') {
  console.warn('No API base URL provided. Using the default "/api/v1" base URL.');
}

// Configure retry logic for the axios instance
axiosRetry(axiosInstance, {
  retries: 3, // Retry up to 3 times before failing
  retryDelay: axiosRetry.exponentialDelay, // Use exponential backoff strategy
  shouldRetry: (error) => {
    // Retry for specific status codes or network errors
    if (error.response) {
      return [429, 500].includes(error.response.status); // Retry for 429 and 500
    }
    return !error.response; // Retry for network errors
  },
  onRetry: (retryCount, error) => {
    // Log retry attempts only in development mode
    if (process.env.NODE_ENV === 'development') {
      console.log(`Retry attempt #${retryCount} for ${error.config?.url || 'unknown URL'}`);
    }
  },
});

// Export the configured axios instance for use in the application
export default axiosInstance;
