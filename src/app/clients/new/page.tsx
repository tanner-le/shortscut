'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import AppLayout from '@/components/Layout/AppLayout';
import ClientForm from '@/components/clients/ClientForm';
import { useClients } from '@/hooks/useClients';

export default function NewClientPage() {
  const router = useRouter();
  const { createClient } = useClients();
  const [error, setError] = useState(null);

  const handleSubmit = async (data) => {
    try {
      const newClient = await createClient(data);
      router.push(`/clients/${newClient.id}`);
    } catch (err) {
      setError(err);
    }
  };

  return (
    <AppLayout>
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">New Client</h1>
          <p className="mt-2 text-sm text-gray-700">
            Add a new client to your account.
          </p>
        </div>
      </div>

      {error && (
        <div className="mt-4 rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error.message}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="mt-6">
        <ClientForm 
          onSubmit={handleSubmit} 
          onCancel={() => router.push('/clients')}
        />
      </div>
    </AppLayout>
  );
} 