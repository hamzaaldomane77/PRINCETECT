// Simplified API Client with Authentication
export class ApiClient {
  private baseURL: string;
  
  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }
  
  // Get authentication headers
  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('auth-token');
    
    return {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    };
  }

  // Generic GET request
  async get<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const headers = this.getAuthHeaders();
    
    const response = await fetch(url, {
      method: 'GET',
      headers,
      ...options,
    });
    
    if (!response.ok) {
      await this.handleError(response);
    }
    
    return response.json();
  }
  
  // Generic POST request
  async post<T>(endpoint: string, data?: any, options?: RequestInit): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const headers = this.getAuthHeaders();
    
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: data ? JSON.stringify(data) : undefined,
      ...options,
    });
    
    if (!response.ok) {
      await this.handleError(response);
    }
    
    return response.json();
  }
  
  // Generic PUT request
  async put<T>(endpoint: string, data?: any, options?: RequestInit): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const headers = this.getAuthHeaders();
    
    const response = await fetch(url, {
      method: 'PUT',
      headers,
      body: data ? JSON.stringify(data) : undefined,
      ...options,
    });
    
    if (!response.ok) {
      await this.handleError(response);
    }
    
    return response.json();
  }
  
  // Generic PATCH request
  async patch<T>(endpoint: string, data?: any, options?: RequestInit): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const headers = this.getAuthHeaders();
    
    const response = await fetch(url, {
      method: 'PATCH',
      headers,
      body: data ? JSON.stringify(data) : undefined,
      ...options,
    });
    
    if (!response.ok) {
      await this.handleError(response);
    }
    
    return response.json();
  }
  
  // Generic DELETE request
  async delete<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const headers = this.getAuthHeaders();
    
    const response = await fetch(url, {
      method: 'DELETE',
      headers,
      ...options,
    });
    
    if (!response.ok) {
      await this.handleError(response);
    }
    
    return response.json();
  }
  
  // Handle API errors
  private async handleError(response: Response): Promise<never> {
    let errorMessage = 'An error occurred';
    
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorData.error || errorMessage;
    } catch {
      // If we can't parse the error response, use status text
      errorMessage = response.statusText || errorMessage;
    }
    
    console.error(`API Error ${response.status}:`, errorMessage);
    
    // Handle specific HTTP status codes
    switch (response.status) {
      case 401:
        // Unauthorized - clear auth and redirect to login
        localStorage.removeItem('auth-token');
        localStorage.removeItem('auth-user');
        window.location.href = '/';
        throw new Error('Authentication required. Please log in.');
        
      case 403:
        throw new Error('Access denied. Insufficient permissions.');
        
      case 404:
        throw new Error('API endpoint not found. Please check the URL.');
        
      case 422:
        throw new Error(`Validation failed: ${errorMessage}`);
        
      case 500:
        throw new Error('Server error. Please try again later.');
        
      default:
        throw new Error(`Request failed: ${response.status} ${errorMessage}`);
    }
  }
  
  // Check if user is authenticated
  isAuthenticated(): boolean {
    const token = localStorage.getItem('auth-token');
    return !!token;
  }
  
  // Get current auth token
  getAuthToken(): string | null {
    return localStorage.getItem('auth-token');
  }
}

// Create and export a default instance
export const apiClient = new ApiClient('https://princetect.peaklink.pro');