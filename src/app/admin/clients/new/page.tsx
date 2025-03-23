'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminDashboardLayout from '@/components/admin/AdminDashboardLayout';
import ClientForm from '@/components/clients/ClientForm';
import { FiArrowLeft } from 'react-icons/fi';
import Link from 'next/link';

export default function NewClientPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleSubmit = async (data: any) => {
    try {
      setIsSubmitting(true);
      
      // Call the API to create a new client
      const response = await fetch('/api/clients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create client');
      }
      
      // Redirect to the admin dashboard after successful creation
      router.push('/admin/dashboard');
      router.refresh();
    } catch (error: any) {
      console.error('Error creating client:', error);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AdminDashboardLayout>
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-6">
            <Link 
              href="/admin/dashboard" 
              className="inline-flex items-center text-sm text-indigo-600 hover:text-indigo-900"
            >
              <FiArrowLeft className="mr-1" />
              Back to Dashboard
            </Link>
            
            <h1 className="mt-4 text-2xl font-semibold">Add New Client</h1>
            <p className="text-gray-500">Create a new client account</p>
          </div>
          
          <div className="bg-white shadow rounded-lg p-6">
            <ClientForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
          </div>
        </div>
      </div>
    </AdminDashboardLayout>
  );
} 