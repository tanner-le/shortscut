'use client';

import { useState, useCallback } from 'react';
import { apiClient } from '@/lib/api-client';
import { Contract } from '@/types';

export function useContracts() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch all contracts with optional filters
  const fetchContracts = useCallback(async (filters?: { clientId?: string; status?: string }) => {
    setIsLoading(true);
    setError(null);
    try {
      let url = '/api/contracts';
      
      // Add query parameters if filters are provided
      if (filters) {
        const params = new URLSearchParams();
        if (filters.clientId) params.append('clientId', filters.clientId);
        if (filters.status) params.append('status', filters.status);
        
        if (params.toString()) {
          url += `?${params.toString()}`;
        }
      }
      
      const data = await apiClient.get<Contract[]>(url);
      setContracts(data);
      return data;
    } catch (err: any) {
      setError(err.message || 'Failed to fetch contracts');
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch a single contract by ID
  const fetchContract = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await apiClient.get<Contract>(`/api/contracts/${id}`);
      setSelectedContract(data);
      return data;
    } catch (err: any) {
      setError(err.message || 'Failed to fetch contract');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Create a new contract
  const createContract = useCallback(async (contractData: Omit<Contract, 'id' | 'createdAt' | 'updatedAt'>) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await apiClient.post<Contract>('/api/contracts', contractData);
      setContracts(prevContracts => [...prevContracts, data]);
      return data;
    } catch (err: any) {
      setError(err.message || 'Failed to create contract');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Update an existing contract
  const updateContract = useCallback(async (id: string, contractData: Partial<Omit<Contract, 'id' | 'createdAt' | 'updatedAt'>>) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await apiClient.put<Contract>(`/api/contracts/${id}`, contractData);
      setContracts(prevContracts => 
        prevContracts.map(contract => contract.id === id ? data : contract)
      );
      if (selectedContract?.id === id) {
        setSelectedContract(data);
      }
      return data;
    } catch (err: any) {
      setError(err.message || 'Failed to update contract');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [selectedContract]);

  // Delete a contract
  const deleteContract = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await apiClient.delete<{ deleted: boolean }>(`/api/contracts/${id}`);
      setContracts(prevContracts => prevContracts.filter(contract => contract.id !== id));
      if (selectedContract?.id === id) {
        setSelectedContract(null);
      }
      return true;
    } catch (err: any) {
      setError(err.message || 'Failed to delete contract');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [selectedContract]);

  return {
    contracts,
    selectedContract,
    isLoading,
    error,
    fetchContracts,
    fetchContract,
    createContract,
    updateContract,
    deleteContract,
    setSelectedContract,
  };
} 