'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { createBrowserSupabaseClient } from '@/lib/supabase';

export default function CompleteRegistrationForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [invitation, setInvitation] = useState<any>(null);
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
    phoneNumber: '',
    enablePhoneVerification: false,
  });

  // Check token validity on component mount
  useEffect(() => {
    if (!token) {
      setError('Invalid invitation link. No token provided.');
      setIsLoading(false);
      return;
    }

    async function validateToken() {
      try {
        const response = await fetch(`/api/invitations/validate?token=${token}`);
        const data = await response.json();

        if (!data.success) {
          setError(data.message || 'Invalid or expired invitation link.');
          setIsLoading(false);
          return;
        }

        setInvitation(data.data);
        setIsLoading(false);
      } catch (err) {
        console.error('Error validating token:', err);
        setError('An error occurred while validating your invitation.');
        setIsLoading(false);
      }
    }

    validateToken();
  }, [token]);

  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  // Validate form data
  const validateForm = () => {
    const errors = [];
    
    if (formData.password.length < 8) {
      errors.push('Password must be at least 8 characters');
    }
    
    if (formData.password !== formData.confirmPassword) {
      errors.push('Passwords do not match');
    }
    
    if (formData.enablePhoneVerification && !formData.phoneNumber) {
      errors.push('Phone number is required when enabling phone verification');
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
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Submit the form data to complete registration
      const response = await fetch('/api/invitations/complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          password: formData.password,
          phoneNumber: formData.enablePhoneVerification ? formData.phoneNumber : null,
        }),
      });
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to complete registration');
      }
      
      // Registration successful - redirect to login
      router.push('/login?registered=true');
    } catch (err: any) {
      setError(err.message || 'An error occurred during registration');
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="w-full max-w-md mx-auto p-6 bg-white rounded-lg shadow-md text-center">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-3/4 mx-auto mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto mb-8"></div>
          <div className="h-10 bg-gray-200 rounded mb-4"></div>
          <div className="h-10 bg-gray-200 rounded mb-4"></div>
          <div className="h-10 bg-gray-200 rounded mb-6"></div>
          <div className="h-12 bg-blue-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error && !invitation) {
    return (
      <div className="w-full max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
        <div className="text-red-500 mb-4">
          <h2 className="text-xl font-semibold mb-2">Invalid Invitation</h2>
          <p>{error}</p>
        </div>
        <p className="mt-4">
          Please contact your administrator for a new invitation or{' '}
          <Link href="/login" className="text-blue-600 hover:underline">
            login
          </Link>{' '}
          if you already have an account.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-2 text-center">Complete Your Registration</h2>
      
      {invitation && (
        <div className="mb-4 p-3 bg-blue-50 text-blue-700 rounded-md text-sm">
          <p>Hello <span className="font-semibold">{invitation.name}</span>,</p>
          <p>You've been invited to join {invitation.organization?.name || 'Shortscut'} as a{invitation.role === 'client' ? ' client' : ' team member'}.</p>
        </div>
      )}
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
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
            disabled={isLoading}
            required
            minLength={8}
          />
          <p className="text-xs text-gray-500 mt-1">
            Must be at least 8 characters
          </p>
        </div>
        
        <div className="mb-4">
          <label htmlFor="confirmPassword" className="block text-sm font-medium mb-1">
            Confirm Password
          </label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            value={formData.confirmPassword}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-md"
            disabled={isLoading}
            required
          />
        </div>
        
        <div className="mb-2">
          <div className="flex items-center">
            <input
              id="enablePhoneVerification"
              name="enablePhoneVerification"
              type="checkbox"
              checked={formData.enablePhoneVerification}
              onChange={handleChange}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded"
              disabled={isLoading}
            />
            <label htmlFor="enablePhoneVerification" className="ml-2 block text-sm text-gray-700">
              Add phone number for additional security (optional)
            </label>
          </div>
        </div>
        
        {formData.enablePhoneVerification && (
          <div className="mb-4 ml-6">
            <label htmlFor="phoneNumber" className="block text-sm font-medium mb-1">
              Phone Number
            </label>
            <input
              id="phoneNumber"
              name="phoneNumber"
              type="tel"
              value={formData.phoneNumber}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-md"
              disabled={isLoading}
              placeholder="+1 (555) 123-4567"
            />
            <p className="text-xs text-gray-500 mt-1">
              Used for two-factor authentication
            </p>
          </div>
        )}
        
        <button
          type="submit"
          className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
          disabled={isLoading}
        >
          {isLoading ? 'Completing Registration...' : 'Complete Registration'}
        </button>
      </form>
    </div>
  );
} 