import { errorHandler } from './ErrorHandler';

export interface ApiResponse<T = any> {
  data: T;
  status: number;
  message?: string;
}

export interface ApiError {
  message: string;
  status?: number;
  code?: string;
  details?: any;
}

export interface RequestConfig {
  timeout?: number;
  retries?: number;
  retryDelay?: number;
  headers?: Record<string, string>;
}

class NetworkManager {
  private static instance: NetworkManager;
  private baseUrl: string = '';
  private defaultConfig: RequestConfig = {
    timeout: 10000,
    retries: 3,
    retryDelay: 1000,
    headers: {
      'Content-Type': 'application/json',
    },
  };

  private constructor() {}

  static getInstance(): NetworkManager {
    if (!NetworkManager.instance) {
      NetworkManager.instance = new NetworkManager();
    }
    return NetworkManager.instance;
  }

  setBaseUrl(url: string): void {
    this.baseUrl = url;
  }

  setDefaultConfig(config: Partial<RequestConfig>): void {
    this.defaultConfig = { ...this.defaultConfig, ...config };
  }

  private async makeRequest<T>(
    url: string,
    options: RequestInit,
    config: RequestConfig = {}
  ): Promise<ApiResponse<T>> {
    const finalConfig = { ...this.defaultConfig, ...config };
    const fullUrl = url.startsWith('http') ? url : `${this.baseUrl}${url}`;

    let lastError: ApiError | null = null;

    for (let attempt = 0; attempt <= finalConfig.retries!; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), finalConfig.timeout);

        const response = await fetch(fullUrl, {
          ...options,
          headers: {
            ...finalConfig.headers,
            ...options.headers,
          },
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw {
            message: errorData.message || `HTTP ${response.status}`,
            status: response.status,
            code: errorData.code,
            details: errorData,
          } as ApiError;
        }

        const data = await response.json();
        return {
          data,
          status: response.status,
        };
      } catch (error: any) {
        lastError = {
          message: error.message || 'Network request failed',
          status: error.status,
          code: error.code,
          details: error,
        };

        // Don't retry on certain errors
        if (error.name === 'AbortError' || error.status === 401 || error.status === 403) {
          break;
        }

        // Wait before retrying (except on last attempt)
        if (attempt < finalConfig.retries!) {
          await this.delay(finalConfig.retryDelay!);
        }
      }
    }

    // Log the error
    errorHandler.handleNetworkError(lastError, fullUrl);
    throw lastError;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async get<T>(url: string, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(url, { method: 'GET' }, config);
  }

  async post<T>(url: string, data?: any, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(url, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    }, config);
  }

  async put<T>(url: string, data?: any, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(url, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    }, config);
  }

  async delete<T>(url: string, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(url, { method: 'DELETE' }, config);
  }

  async patch<T>(url: string, data?: any, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(url, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    }, config);
  }

  // Upload file with progress tracking
  async uploadFile<T>(
    url: string,
    file: File | Blob,
    onProgress?: (progress: number) => void,
    config?: RequestConfig
  ): Promise<ApiResponse<T>> {
    const formData = new FormData();
    formData.append('file', file);

    const finalConfig = { ...this.defaultConfig, ...config };

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), finalConfig.timeout);

      const xhr = new XMLHttpRequest();
      
      return new Promise((resolve, reject) => {
        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable && onProgress) {
            const progress = (event.loaded / event.total) * 100;
            onProgress(progress);
          }
        });

        xhr.addEventListener('load', () => {
          clearTimeout(timeoutId);
          
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const data = JSON.parse(xhr.responseText);
              resolve({ data, status: xhr.status });
            } catch (error) {
              reject({
                message: 'Invalid JSON response',
                status: xhr.status,
                details: error,
              });
            }
          } else {
            reject({
              message: `HTTP ${xhr.status}`,
              status: xhr.status,
            });
          }
        });

        xhr.addEventListener('error', () => {
          clearTimeout(timeoutId);
          reject({
            message: 'Network error',
            status: xhr.status,
          });
        });

        xhr.addEventListener('abort', () => {
          clearTimeout(timeoutId);
          reject({
            message: 'Request aborted',
            code: 'ABORTED',
          });
        });

        xhr.open('POST', url.startsWith('http') ? url : `${this.baseUrl}${url}`);
        
        // Set headers
        Object.entries(finalConfig.headers || {}).forEach(([key, value]) => {
          if (key.toLowerCase() !== 'content-type') {
            xhr.setRequestHeader(key, value);
          }
        });

        xhr.send(formData);
      });
    } catch (error: any) {
      errorHandler.handleNetworkError(error, url);
      throw error;
    }
  }

  // Check network connectivity
  async checkConnectivity(): Promise<boolean> {
    try {
      const response = await fetch('https://www.google.com', {
        method: 'HEAD',
        mode: 'no-cors',
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  // Cancel ongoing requests
  cancelRequest(requestId: string): void {
    // Implementation would depend on how you track requests
    console.log(`Cancelling request: ${requestId}`);
  }
}

// Export singleton instance
export const networkManager = NetworkManager.getInstance(); 