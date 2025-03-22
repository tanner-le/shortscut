'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Client } from '@/types';

// Validation schema
const clientSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  company: z.string().min(1, 'Company name is required'),
  industry: z.string().optional(),
  address: z.string().optional(),
  notes: z.string().optional(),
  status: z.enum(['active', 'inactive']),
});

type ClientFormValues = z.infer<typeof clientSchema>;

interface ClientFormProps {
  client?: Client;
  onSubmit: (data: ClientFormValues) => Promise<void>;
  isSubmitting?: boolean;
}

export default function ClientForm({ client, onSubmit, isSubmitting = false }: ClientFormProps) {
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Initialize form with default values
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ClientFormValues>({
    resolver: zodResolver(clientSchema),
    defaultValues: client
      ? {
          name: client.name,
          email: client.email,
          phone: client.phone || '',
          company: client.company,
          industry: client.industry || '',
          address: client.address || '',
          notes: client.notes || '',
          status: client.status,
        }
      : {
          name: '',
          email: '',
          phone: '',
          company: '',
          industry: '',
          address: '',
          notes: '',
          status: 'active',
        },
  });

  // Handle form submission
  const handleFormSubmit = async (data: ClientFormValues) => {
    setSubmitError(null);
    try {
      await onSubmit(data);
      if (!client) {
        // Reset form after successful submission for new clients
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
        {/* Name */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Name <span className="text-red-500">*</span>
          </label>
          <input
            id="name"
            type="text"
            {...register('name')}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
              errors.name ? 'border-red-300' : ''
            }`}
          />
          {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email <span className="text-red-500">*</span>
          </label>
          <input
            id="email"
            type="email"
            {...register('email')}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
              errors.email ? 'border-red-300' : ''
            }`}
          />
          {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
        </div>

        {/* Phone */}
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
            Phone
          </label>
          <input
            id="phone"
            type="text"
            {...register('phone')}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
              errors.phone ? 'border-red-300' : ''
            }`}
          />
          {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>}
        </div>

        {/* Company */}
        <div>
          <label htmlFor="company" className="block text-sm font-medium text-gray-700">
            Company <span className="text-red-500">*</span>
          </label>
          <input
            id="company"
            type="text"
            {...register('company')}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
              errors.company ? 'border-red-300' : ''
            }`}
          />
          {errors.company && <p className="mt-1 text-sm text-red-600">{errors.company.message}</p>}
        </div>

        {/* Industry */}
        <div>
          <label htmlFor="industry" className="block text-sm font-medium text-gray-700">
            Industry
          </label>
          <input
            id="industry"
            type="text"
            {...register('industry')}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
              errors.industry ? 'border-red-300' : ''
            }`}
          />
          {errors.industry && <p className="mt-1 text-sm text-red-600">{errors.industry.message}</p>}
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
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          {errors.status && <p className="mt-1 text-sm text-red-600">{errors.status.message}</p>}
        </div>
      </div>

      {/* Address */}
      <div>
        <label htmlFor="address" className="block text-sm font-medium text-gray-700">
          Address
        </label>
        <textarea
          id="address"
          rows={3}
          {...register('address')}
          className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
            errors.address ? 'border-red-300' : ''
          }`}
        />
        {errors.address && <p className="mt-1 text-sm text-red-600">{errors.address.message}</p>}
      </div>

      {/* Notes */}
      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
          Notes
        </label>
        <textarea
          id="notes"
          rows={4}
          {...register('notes')}
          className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
            errors.notes ? 'border-red-300' : ''
          }`}
        />
        {errors.notes && <p className="mt-1 text-sm text-red-600">{errors.notes.message}</p>}
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
          {isSubmitting ? 'Saving...' : client ? 'Update Client' : 'Create Client'}
        </button>
      </div>
    </form>
  );
} 