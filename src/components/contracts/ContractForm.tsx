'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Contract, Client } from '@/types';
import { useClients } from '@/hooks/useClients';

// Validation schema
const contractSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  clientId: z.string().min(1, 'Client is required'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().optional(),
  value: z.coerce.number().min(0, 'Value must be a positive number'),
  status: z.enum(['draft', 'sent', 'signed', 'active', 'completed', 'cancelled']),
  description: z.string().optional(),
  terms: z.string().optional(),
});

type ContractFormValues = z.infer<typeof contractSchema>;

interface ContractFormProps {
  contract?: Contract;
  onSubmit: (data: ContractFormValues) => Promise<void>;
  isSubmitting?: boolean;
}

export default function ContractForm({ contract, onSubmit, isSubmitting = false }: ContractFormProps) {
  const [submitError, setSubmitError] = useState<string | null>(null);
  const { fetchClients, clients, isLoading: isLoadingClients } = useClients();

  // Fetch clients on component mount
  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  // Format date for form input (YYYY-MM-DD)
  const formatDateForInput = (date: Date | string | undefined) => {
    if (!date) return '';
    const d = new Date(date);
    return d.toISOString().split('T')[0];
  };

  // Initialize form with default values
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ContractFormValues>({
    resolver: zodResolver(contractSchema),
    defaultValues: contract
      ? {
          title: contract.title,
          clientId: contract.clientId,
          startDate: formatDateForInput(contract.startDate),
          endDate: formatDateForInput(contract.endDate),
          value: contract.value,
          status: contract.status,
          description: contract.description || '',
          terms: contract.terms || '',
        }
      : {
          title: '',
          clientId: '',
          startDate: '',
          endDate: '',
          value: 0,
          status: 'draft',
          description: '',
          terms: '',
        },
  });

  // Handle form submission
  const handleFormSubmit = async (data: ContractFormValues) => {
    setSubmitError(null);
    try {
      await onSubmit(data);
      if (!contract) {
        // Reset form after successful submission for new contracts
        reset();
      }
    } catch (error: any) {
      setSubmitError(error.message || 'An error occurred. Please try again.');
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {submitError && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{submitError}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Title */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">
            Contract Title <span className="text-red-500">*</span>
          </label>
          <input
            id="title"
            type="text"
            {...register('title')}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
              errors.title ? 'border-red-300' : ''
            }`}
          />
          {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>}
        </div>

        {/* Client */}
        <div>
          <label htmlFor="clientId" className="block text-sm font-medium text-gray-700">
            Client <span className="text-red-500">*</span>
          </label>
          <select
            id="clientId"
            {...register('clientId')}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
              errors.clientId ? 'border-red-300' : ''
            }`}
            disabled={isLoadingClients}
          >
            <option value="">Select a client</option>
            {clients.map((client) => (
              <option key={client.id} value={client.id}>
                {client.name} ({client.company})
              </option>
            ))}
          </select>
          {errors.clientId && <p className="mt-1 text-sm text-red-600">{errors.clientId.message}</p>}
        </div>

        {/* Start Date */}
        <div>
          <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
            Start Date <span className="text-red-500">*</span>
          </label>
          <input
            id="startDate"
            type="date"
            {...register('startDate')}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
              errors.startDate ? 'border-red-300' : ''
            }`}
          />
          {errors.startDate && <p className="mt-1 text-sm text-red-600">{errors.startDate.message}</p>}
        </div>

        {/* End Date */}
        <div>
          <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">
            End Date
          </label>
          <input
            id="endDate"
            type="date"
            {...register('endDate')}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
              errors.endDate ? 'border-red-300' : ''
            }`}
          />
          {errors.endDate && <p className="mt-1 text-sm text-red-600">{errors.endDate.message}</p>}
        </div>

        {/* Value */}
        <div>
          <label htmlFor="value" className="block text-sm font-medium text-gray-700">
            Contract Value <span className="text-red-500">*</span>
          </label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-500 sm:text-sm">$</span>
            </div>
            <input
              id="value"
              type="number"
              step="0.01"
              min="0"
              {...register('value')}
              className={`pl-7 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
                errors.value ? 'border-red-300' : ''
              }`}
            />
          </div>
          {errors.value && <p className="mt-1 text-sm text-red-600">{errors.value.message}</p>}
        </div>

        {/* Status */}
        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700">
            Status <span className="text-red-500">*</span>
          </label>
          <select
            id="status"
            {...register('status')}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
              errors.status ? 'border-red-300' : ''
            }`}
          >
            <option value="draft">Draft</option>
            <option value="sent">Sent</option>
            <option value="signed">Signed</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          {errors.status && <p className="mt-1 text-sm text-red-600">{errors.status.message}</p>}
        </div>
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Description
        </label>
        <textarea
          id="description"
          rows={3}
          {...register('description')}
          className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
            errors.description ? 'border-red-300' : ''
          }`}
        />
        {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>}
      </div>

      {/* Terms */}
      <div>
        <label htmlFor="terms" className="block text-sm font-medium text-gray-700">
          Terms & Conditions
        </label>
        <textarea
          id="terms"
          rows={4}
          {...register('terms')}
          className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
            errors.terms ? 'border-red-300' : ''
          }`}
        />
        {errors.terms && <p className="mt-1 text-sm text-red-600">{errors.terms.message}</p>}
      </div>

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={() => reset()}
          className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          disabled={isSubmitting}
        >
          Reset
        </button>
        <button
          type="submit"
          className="inline-flex items-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Saving...' : contract ? 'Update Contract' : 'Create Contract'}
        </button>
      </div>
    </form>
  );
} 