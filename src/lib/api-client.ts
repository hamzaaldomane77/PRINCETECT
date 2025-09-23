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
  async post<T>(endpoint: string, data?: Record<string, unknown> | FormData, options?: RequestInit): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const defaultHeaders = this.getAuthHeaders();
    
    // Handle FormData vs JSON
    let body: BodyInit | undefined;
    let headers: HeadersInit;
    
    if (data instanceof FormData) {
      body = data;
      // For FormData, merge headers but don't set Content-Type (let browser set it with boundary)
      headers = {
        ...defaultHeaders,
        ...options?.headers,
      };
      // Remove Content-Type for FormData to let browser set it properly
      delete (headers as any)['Content-Type'];
    } else {
      body = data ? JSON.stringify(data) : undefined;
      // For JSON, merge headers including Content-Type
      headers = {
        ...defaultHeaders,
        ...options?.headers,
      };
    }
    
    const response = await fetch(url, {
      method: 'POST',
      body,
      ...options,
      headers, // Ensure our merged headers take precedence
    });
    
    if (!response.ok) {
      await this.handleError(response);
    }
    
    return response.json();
  }
  
  // Generic PUT request
  async put<T>(endpoint: string, data?: Record<string, unknown> | FormData, options?: RequestInit): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const defaultHeaders = this.getAuthHeaders();
    
    // Handle FormData vs JSON
    let body: BodyInit | undefined;
    let headers: HeadersInit;
    
    if (data instanceof FormData) {
      body = data;
      headers = {
        ...defaultHeaders,
        ...options?.headers,
      };
      delete (headers as any)['Content-Type'];
    } else {
      body = data ? JSON.stringify(data) : undefined;
      headers = {
        ...defaultHeaders,
        ...options?.headers,
      };
    }
    
    const response = await fetch(url, {
      method: 'PUT',
      body,
      ...options,
      headers,
    });
    
    if (!response.ok) {
      await this.handleError(response);
    }
    
    return response.json();
  }
  
  // Generic PATCH request
  async patch<T>(endpoint: string, data?: Record<string, unknown> | FormData, options?: RequestInit): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const defaultHeaders = this.getAuthHeaders();
    
    // Handle FormData vs JSON
    let body: BodyInit | undefined;
    let headers: HeadersInit;
    
    if (data instanceof FormData) {
      body = data;
      headers = {
        ...defaultHeaders,
        ...options?.headers,
      };
      delete (headers as any)['Content-Type'];
    } else {
      body = data ? JSON.stringify(data) : undefined;
      headers = {
        ...defaultHeaders,
        ...options?.headers,
      };
    }
    
    const response = await fetch(url, {
      method: 'PATCH',
      body,
      ...options,
      headers,
    });
    
    if (!response.ok) {
      await this.handleError(response);
    }
    
    return response.json();
  }
  
  // Generic DELETE request
  async delete<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const defaultHeaders = this.getAuthHeaders();
    
    // Merge headers
    const headers = {
      ...defaultHeaders,
      ...options?.headers,
    };
    
    const response = await fetch(url, {
      method: 'DELETE',
      ...options,
      headers,
    });
    
    if (!response.ok) {
      await this.handleError(response);
    }
    
    return response.json();
  }

  // POST request specifically for FormData
  async postFormData<T>(endpoint: string, formData: FormData, options?: RequestInit): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const token = localStorage.getItem('auth-token');
    
    const headers: HeadersInit = {
      'Accept': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options?.headers,
    };
    // Don't set Content-Type for FormData - let browser set it with boundary
    
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: formData,
      ...options,
    });
    
    if (!response.ok) {
      await this.handleError(response);
    }
    
    return response.json();
  }
  
  // Handle API errors
  private async handleError(response: Response): Promise<never> {
    let errorData: any = null;
    let errorMessage = 'An error occurred';
    
    try {
      errorData = await response.json();
      errorMessage = errorData.message || errorData.error || errorMessage;
    } catch {
      // If we can't parse the error response, use status text
      errorMessage = response.statusText || errorMessage;
    }
    
    console.error(`API Error ${response.status}:`, errorMessage);
    console.log('Full error data:', errorData);
    
    // Create error object that preserves original response data
    const error = new Error(errorMessage) as any;
    error.status = response.status;
    error.statusText = response.statusText;
    error.response = {
      status: response.status,
      statusText: response.statusText,
      data: errorData
    };
    
    // Handle specific HTTP status codes
    switch (response.status) {
      case 401:
        // Unauthorized - clear auth and redirect to login
        localStorage.removeItem('auth-token');
        localStorage.removeItem('auth-user');
        window.location.href = '/';
        error.message = 'Authentication required. Please log in.';
        break;
        
      case 403:
        error.message = 'Access denied. Insufficient permissions.';
        break;
        
      case 404:
        error.message = 'API endpoint not found. Please check the URL.';
        break;
        
      case 422:
        // For validation errors, keep the original message and data
        error.message = errorMessage;
        break;
        
      case 500:
        error.message = 'Server error. Please try again later.';
        break;
        
      default:
        error.message = `Request failed: ${response.status} ${errorMessage}`;
    }
    
    throw error;
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