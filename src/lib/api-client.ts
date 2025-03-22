'use client';

import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';

// API client for making requests to our backend
const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Redirect to login on 401 Unauthorized
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/auth/login';
    }
    return Promise.reject(error);
  }
);

// API Response type
export type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
};

// Generic API client methods
export const apiClient = {
  // GET request
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<ApiResponse<T>> = await api.get(url, config);
    if (!response.data.success) {
      throw new Error(response.data.error || 'Unknown error');
    }
    return response.data.data as T;
  },

  // POST request
  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<ApiResponse<T>> = await api.post(url, data, config);
    if (!response.data.success) {
      throw new Error(response.data.error || 'Unknown error');
    }
    return response.data.data as T;
  },

  // PUT request
  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<ApiResponse<T>> = await api.put(url, data, config);
    if (!response.data.success) {
      throw new Error(response.data.error || 'Unknown error');
    }
    return response.data.data as T;
  },

  // DELETE request
  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<ApiResponse<T>> = await api.delete(url, config);
    if (!response.data.success) {
      throw new Error(response.data.error || 'Unknown error');
    }
    return response.data.data as T;
  },
}; 