'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import AppLayout from '@/components/Layout/AppLayout';
import ClientForm from '@/components/clients/ClientForm';
import { useClients } from '@/hooks/useClients';
import LoadingState from '@/components/ui/LoadingState';

export default function EditClientPage() {
  const params = useParams();
  const router = useRouter();
  const clientId = params.id as string;
  const { fetchClient, updateClient } = useClients();
  const [isLoading, setIsLoading] = useState(true);
  const [client, setClient] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadClient = async () => {
      try {
        const data = await fetchClient(clientId);
        setClient(data);
      } catch (err) {
        setError(err);
      } finally {
        setIsLoading(false);
      }
    };

    loadClient();
  }, [clientId, fetchClient]);

  const handleSubmit = async (data) => {
    try {
      await updateClient(clientId, data);
      router.push(`/clients/${clientId}`);
    } catch (err) {
      setError(err);
    }
  };

  if (isLoading) {
    return (
      <AppLayout>
        <LoadingState message="Loading client..." />
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout>
        <div className="rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error.message}</p>
              </div>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Edit Client</h1>
          <p className="mt-2 text-sm text-gray-700">
            Update client information.
          </p>
        </div>
      </div>

      <div className="mt-6">
        <ClientForm 
          initialData={client} 
          onSubmit={handleSubmit} 
          onCancel={() => router.push(`/clients/${clientId}`)}
        />
      </div>
    </AppLayout>
  );
} 