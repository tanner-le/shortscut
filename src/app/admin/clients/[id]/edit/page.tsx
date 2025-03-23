'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminDashboardLayout from '@/components/admin/AdminDashboardLayout';
import ClientForm from '@/components/clients/ClientForm';
import { FiArrowLeft } from 'react-icons/fi';
import Link from 'next/link';
import { Client } from '@/types';

export default function EditClientPage({ params }: { params: { id: string } }) {
  const [client, setClient] = useState<Client | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { id } = params;

  // Fetch client data
  useEffect(() => {
    async function fetchClient() {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/clients/${id}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch client');
        }
        
        const data = await response.json();
        setClient(data.data);
      } catch (err: any) {
        console.error('Error fetching client:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchClient();
  }, [id]);

  const handleSubmit = async (data: any) => {
    try {
      setIsSubmitting(true);
      
      // Call the API to update the client
      const response = await fetch(`/api/clients/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update client');
      }
      
      // Redirect to the admin dashboard after successful update
      router.push('/admin/dashboard');
      router.refresh();
    } catch (error: any) {
      console.error('Error updating client:', error);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <AdminDashboardLayout>
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="flex justify-center items-center py-16">
              <div className="animate-pulse text-gray-500">Loading client data...</div>
            </div>
          </div>
        </div>
      </AdminDashboardLayout>
    );
  }

  if (error || !client) {
    return (
      <AdminDashboardLayout>
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="bg-red-50 p-4 rounded-md">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Error</h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>{error || 'Client not found'}</p>
                  </div>
                  <div className="mt-4">
                    <Link
                      href="/admin/dashboard"
                      className="inline-flex items-center text-sm font-medium text-red-600 hover:text-red-500"
                    >
                      <FiArrowLeft className="mr-1" />
                      Back to Dashboard
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </AdminDashboardLayout>
    );
  }

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
            
            <h1 className="mt-4 text-2xl font-semibold">Edit Client</h1>
            <p className="text-gray-500">Update client information</p>
          </div>
          
          <div className="bg-white shadow rounded-lg p-6">
            <ClientForm 
              client={client} 
              onSubmit={handleSubmit} 
              isSubmitting={isSubmitting} 
            />
          </div>
        </div>
      </div>
    </AdminDashboardLayout>
  );
} 