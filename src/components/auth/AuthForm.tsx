'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { createBrowserSupabaseClient } from '@/lib/supabase';

export default function AuthForm({ mode = 'login' }: { mode?: 'login' | 'register' }) {
  const [isLogin] = useState(mode === 'login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect');
  const registered = searchParams.get('registered');

  // Show registration success message if coming from registration
  useEffect(() => {
    if (registered) {
      setError(null);
    }
  }, [registered]);

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Validate form data
  const validateForm = () => {
    const errors = [];
    
    if (!formData.email) {
      errors.push('Email is required');
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.push('Email is invalid');
    }
    
    if (!formData.password) {
      errors.push('Password is required');
    }
    
    return errors;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      setError(validationErrors.join('. '));
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const supabase = createBrowserSupabaseClient();
      
      // Handle login
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });
      
      if (error) throw new Error(error.message);
      
      // Debugging session
      console.log('Auth form - Login successful');
      console.log('Auth form - User:', data.user?.id);
      console.log('Auth form - Role:', data.user?.user_metadata?.role);
      
      // Determine redirect based on user role and ensure we await the session establishment
      const { user } = data.session;
      
      // No need to manually store the session - Supabase handles this
      
      if (user.user_metadata?.role === 'admin') {
        console.log('Auth form - Admin user, redirecting to admin dashboard');
        // Give time for the session to be established before redirect
        setTimeout(() => {
          router.push(redirect || '/admin/dashboard');
        }, 1000); // Increased delay for better session establishment
      } else {
        console.log('Auth form - Non-admin user, redirecting to dashboard');
        setTimeout(() => {
          router.push(redirect || '/dashboard');
        }, 1000);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">
        {isLogin ? 'Login to your account' : 'Request an account'}
      </h2>
      
      {registered && (
        <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md text-sm">
          Registration completed successfully! You can now login with your credentials.
        </div>
      )}
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm">
          {error}
        </div>
      )}
      
      {isLogin ? (
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium mb-1">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-md"
              disabled={loading}
              required
            />
          </div>
          
          <div className="mb-4">
            <label htmlFor="password" className="block text-sm font-medium mb-1">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-md"
              disabled={loading}
              required
            />
            <div className="mt-1 text-right">
              <Link href="/forgot-password" className="text-sm text-blue-600 hover:underline">
                Forgot password?
              </Link>
            </div>
          </div>
          
          <button
            type="submit"
            className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      ) : (
        <div className="text-center py-4">
          <p className="text-gray-700 mb-4">
            Registration is by invitation only. Please contact your administrator to request an account.
          </p>
          <p className="text-gray-700">
            If you have received an invitation email, please click the link in the email to complete your registration.
          </p>
        </div>
      )}
      
      {isLogin ? (
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600">
            Don't have an account?{' '}
            <Link href="/register" className="text-blue-600 hover:underline">
              Request access
            </Link>
          </p>
          <p className="mt-2 text-sm text-gray-600">
            Need to set up admin access?{' '}
            <Link href="/admin-setup" className="text-blue-600 hover:underline">
              Admin setup
            </Link>
          </p>
        </div>
      ) : (
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <Link href="/login" className="text-blue-600 hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      )}
    </div>
  );
} 