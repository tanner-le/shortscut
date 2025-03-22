'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api-client';
import { mockApi, User } from '@/lib/mock-api';

// Determine if we should use the mock API
const USE_MOCK_API = process.env.NEXT_PUBLIC_API_URL ? false : true;

interface LoginCredentials {
  email: string;
  password: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Check if user is authenticated on component mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchUser();
    } else {
      setIsLoading(false);
    }
  }, []);

  // Fetch current user data
  const fetchUser = async () => {
    setIsLoading(true);
    try {
      let userData: User;
      
      if (USE_MOCK_API) {
        userData = await mockApi.getCurrentUser();
      } else {
        const response = await apiClient.get<{ user: User }>('/api/auth/me');
        userData = response.user;
      }
      
      setUser(userData);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch user:', err);
      logout();
    } finally {
      setIsLoading(false);
    }
  };

  // Login user
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      if (USE_MOCK_API) {
        const authData = await mockApi.login(email, password);
        localStorage.setItem('token', authData.token);
        setUser(authData.user);
        return true;
      } else {
        const authData = await apiClient.post('/api/auth/login', { email, password });
        localStorage.setItem('token', authData.token);
        setUser(authData.user);
        return true;
      }
    } catch (err: any) {
      setError(err.message || 'Login failed');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout user
  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    router.push('/auth/login');
  };

  return {
    user,
    isLoading,
    error,
    login,
    logout,
    isAuthenticated: !!user,
  };
} 