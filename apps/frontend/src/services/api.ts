// Untuk production: VITE_API_BASE_URL langsung ke Lambda URL (tanpa /api prefix)
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 
  (import.meta.env.DEV ? "/api" : "");

interface FetchOptions extends RequestInit {
  params?: Record<string, string | number>;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private buildUrl(path: string, params?: Record<string, string | number>): string {
    const url = new URL(`${this.baseUrl}${path}`, window.location.origin);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.set(key, String(value));
      });
    }
    return url.toString();
  }

  private getHeaders(isJson = true): HeadersInit {
    const headers: HeadersInit = {};
    if (isJson) {
      headers["Content-Type"] = "application/json";
    }
    // Get token from localStorage as fallback
    const token = localStorage.getItem("auth_token");
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
    return headers;
  }

  async get<T>(path: string, options?: FetchOptions): Promise<T> {
    const url = this.buildUrl(path, options?.params);
    const response = await fetch(url, {
      method: "GET",
      headers: this.getHeaders(),
      credentials: "include",
      ...options,
    });
    return this.handleResponse<T>(response);
  }

  async post<T>(path: string, body?: unknown, options?: FetchOptions): Promise<T> {
    const url = this.buildUrl(path, options?.params);
    const response = await fetch(url, {
      method: "POST",
      headers: this.getHeaders(),
      credentials: "include",
      body: body ? JSON.stringify(body) : undefined,
      ...options,
    });
    return this.handleResponse<T>(response);
  }

  async upload<T>(path: string, formData: FormData, options?: FetchOptions): Promise<T> {
    const url = this.buildUrl(path, options?.params);
    const response = await fetch(url, {
      method: "POST",
      headers: this.getHeaders(false),
      credentials: "include",
      body: formData,
      ...options,
    });
    return this.handleResponse<T>(response);
  }

  async patch<T>(path: string, body?: unknown, options?: FetchOptions): Promise<T> {
    const url = this.buildUrl(path, options?.params);
    const response = await fetch(url, {
      method: "PATCH",
      headers: this.getHeaders(),
      credentials: "include",
      body: body ? JSON.stringify(body) : undefined,
      ...options,
    });
    return this.handleResponse<T>(response);
  }

  async put<T>(path: string, body?: unknown, options?: FetchOptions): Promise<T> {
    const url = this.buildUrl(path, options?.params);
    const response = await fetch(url, {
      method: "PUT",
      headers: this.getHeaders(),
      credentials: "include",
      body: body ? JSON.stringify(body) : undefined,
      ...options,
    });
    return this.handleResponse<T>(response);
  }

  async delete<T>(path: string, options?: FetchOptions): Promise<T> {
    const url = this.buildUrl(path, options?.params);
    const response = await fetch(url, {
      method: "DELETE",
      headers: this.getHeaders(),
      credentials: "include",
      ...options,
    });
    return this.handleResponse<T>(response);
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    const data = await response.json();
    if (!response.ok) {
      throw new ApiError(data.message || "Terjadi kesalahan", response.status, data);
    }
    return data as T;
  }
}

export class ApiError extends Error {
  status: number;
  data: unknown;

  constructor(message: string, status: number, data?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

export const api = new ApiClient(BASE_URL);
