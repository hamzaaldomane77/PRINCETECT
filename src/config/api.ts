// API Configuration
export const API_CONFIG = {
  BASE_URL: 'https://princetect.peaklink.pro',
  // You can add more API-related configuration here
  TIMEOUT: 30000, // 30 seconds
  HEADERS: {
    'Content-Type': 'application/json',
  },
} as const;

// Helper function to build full API URLs
export const buildApiUrl = (endpoint: string): string => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};

// Export the base URL directly for convenience
export const BASE_URL = API_CONFIG.BASE_URL;
