'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api-client';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface AuthResponse {
  user: User;
  token: string;
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
      const userData = await apiClient.get<{ user: User }>('/api/auth/me');
      setUser(userData.user);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch user:', err);
      logout();
    } finally {
      setIsLoading(false);
    }
  };

  // Login user
  const login = async (credentials: LoginCredentials) => {
    setIsLoading(true);
    setError(null);
    try {
      const authData = await apiClient.post<AuthResponse>('/api/auth/login', credentials);
      localStorage.setItem('token', authData.token);
      setUser(authData.user);
      router.push('/dashboard');
      return true;
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