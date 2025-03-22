'use client';

import { useState, useCallback } from 'react';
import { apiClient } from '@/lib/api-client';
import { Client } from '@/types';

export function useClients() {
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch all clients
  const fetchClients = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await apiClient.get<Client[]>('/api/clients');
      setClients(data);
      return data;
    } catch (err: any) {
      setError(err.message || 'Failed to fetch clients');
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch a single client by ID
  const fetchClient = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await apiClient.get<Client>(`/api/clients/${id}`);
      setSelectedClient(data);
      return data;
    } catch (err: any) {
      setError(err.message || 'Failed to fetch client');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Create a new client
  const createClient = useCallback(async (clientData: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await apiClient.post<Client>('/api/clients', clientData);
      setClients(prevClients => [...prevClients, data]);
      return data;
    } catch (err: any) {
      setError(err.message || 'Failed to create client');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Update an existing client
  const updateClient = useCallback(async (id: string, clientData: Partial<Omit<Client, 'id' | 'createdAt' | 'updatedAt'>>) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await apiClient.put<Client>(`/api/clients/${id}`, clientData);
      setClients(prevClients => 
        prevClients.map(client => client.id === id ? data : client)
      );
      if (selectedClient?.id === id) {
        setSelectedClient(data);
      }
      return data;
    } catch (err: any) {
      setError(err.message || 'Failed to update client');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [selectedClient]);

  // Delete a client
  const deleteClient = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await apiClient.delete<{ deleted: boolean }>(`/api/clients/${id}`);
      setClients(prevClients => prevClients.filter(client => client.id !== id));
      if (selectedClient?.id === id) {
        setSelectedClient(null);
      }
      return true;
    } catch (err: any) {
      setError(err.message || 'Failed to delete client');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [selectedClient]);

  return {
    clients,
    selectedClient,
    isLoading,
    error,
    fetchClients,
    fetchClient,
    createClient,
    updateClient,
    deleteClient,
    setSelectedClient,
  };
} 