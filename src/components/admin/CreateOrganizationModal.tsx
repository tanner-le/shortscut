'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { FiX } from 'react-icons/fi';
import { Client } from '@/types/client';

// Define validation schema
const organizationSchema = z.object({
  name: z.string().min(1, 'Organization name is required'),
  email: z.string().email('Valid email is required'),
  phone: z.string().optional(),
  company: z.string().min(1, 'Company name is required'),
  industry: z.string().optional(),
  address: z.string().optional(),
  plan: z.enum(['creator', 'studio']),
  notes: z.string().optional(),
  status: z.enum(['active', 'inactive']).default('active'),
});

type OrganizationFormData = z.infer<typeof organizationSchema>;

interface CreateOrganizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: OrganizationFormData) => Promise<void>;
}

export default function CreateOrganizationModal({
  isOpen,
  onClose,
  onSubmit,
}: CreateOrganizationModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<OrganizationFormData>({
    resolver: zodResolver(organizationSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      company: '',
      industry: '',
      address: '',
      plan: 'creator',
      notes: '',
      status: 'active',
    },
  });

  const handleFormSubmit = async (data: OrganizationFormData) => {
    setError(null);
    try {
      setIsSubmitting(true);
      await onSubmit(data);
      reset();
      onClose();
    } catch (err: any) {
      setError('An error occurred while creating the organization. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-[#1a2233] rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b dark:border-[#2a3347]">
          <h2 className="text-xl font-semibold dark:text-white">Create New Organization</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white"
            aria-label="Close"
          >
            <FiX size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-md p-4 text-red-800 dark:text-red-400">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Organization Name */}
            <div className="col-span-2">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Organization Name*
              </label>
              <input
                {...register('name')}
                type="text"
                id="name"
                placeholder="Enter organization name"
                className={`w-full px-3 py-2 border ${
                  errors.name ? 'border-red-500' : 'border-gray-300 dark:border-[#2a3347]'
                } rounded-md bg-white dark:bg-[#2a3347] text-gray-900 dark:text-white`}
              />
              {errors.name && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name.message}</p>}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Primary Email*
              </label>
              <input
                {...register('email')}
                type="email"
                id="email"
                placeholder="Enter primary email"
                className={`w-full px-3 py-2 border ${
                  errors.email ? 'border-red-500' : 'border-gray-300 dark:border-[#2a3347]'
                } rounded-md bg-white dark:bg-[#2a3347] text-gray-900 dark:text-white`}
              />
              {errors.email && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.email.message}</p>}
            </div>

            {/* Phone */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Phone Number
              </label>
              <input
                {...register('phone')}
                type="text"
                id="phone"
                placeholder="Enter phone number"
                className="w-full px-3 py-2 border border-gray-300 dark:border-[#2a3347] rounded-md bg-white dark:bg-[#2a3347] text-gray-900 dark:text-white"
              />
            </div>

            {/* Company */}
            <div className="col-span-2">
              <label htmlFor="company" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Company Name*
              </label>
              <input
                {...register('company')}
                type="text"
                id="company"
                placeholder="Enter legal company name"
                className={`w-full px-3 py-2 border ${
                  errors.company ? 'border-red-500' : 'border-gray-300 dark:border-[#2a3347]'
                } rounded-md bg-white dark:bg-[#2a3347] text-gray-900 dark:text-white`}
              />
              {errors.company && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.company.message}</p>}
            </div>

            {/* Industry */}
            <div>
              <label htmlFor="industry" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Industry
              </label>
              <input
                {...register('industry')}
                type="text"
                id="industry"
                placeholder="Enter industry"
                className="w-full px-3 py-2 border border-gray-300 dark:border-[#2a3347] rounded-md bg-white dark:bg-[#2a3347] text-gray-900 dark:text-white"
              />
            </div>

            {/* Plan */}
            <div>
              <label htmlFor="plan" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Organization Plan*
              </label>
              <select
                {...register('plan')}
                id="plan"
                className={`w-full px-3 py-2 border ${
                  errors.plan ? 'border-red-500' : 'border-gray-300 dark:border-[#2a3347]'
                } rounded-md bg-white dark:bg-[#2a3347] text-gray-900 dark:text-white`}
              >
                <option value="creator">Creator</option>
                <option value="studio">Studio</option>
              </select>
              {errors.plan && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.plan.message}</p>}
            </div>

            {/* Address */}
            <div className="col-span-2">
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Address
              </label>
              <textarea
                {...register('address')}
                id="address"
                rows={3}
                placeholder="Enter physical address"
                className="w-full px-3 py-2 border border-gray-300 dark:border-[#2a3347] rounded-md bg-white dark:bg-[#2a3347] text-gray-900 dark:text-white"
              ></textarea>
            </div>

            {/* Notes */}
            <div className="col-span-2">
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Notes
              </label>
              <textarea
                {...register('notes')}
                id="notes"
                rows={3}
                placeholder="Additional notes"
                className="w-full px-3 py-2 border border-gray-300 dark:border-[#2a3347] rounded-md bg-white dark:bg-[#2a3347] text-gray-900 dark:text-white"
              ></textarea>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t dark:border-[#2a3347]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-[#2a3347] border border-gray-300 dark:border-[#3b4559] rounded-md hover:bg-gray-50 dark:hover:bg-[#151f2e]"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating...' : 'Create Organization'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 