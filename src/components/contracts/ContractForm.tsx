'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Contract, Client } from '@/types';
import { useClients } from '@/hooks/useClients';
import { PACKAGES, PackageType } from '@/types/package';

// Validation schema
const contractSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  clientId: z.string().min(1, 'Client is required'),
  packageType: z.enum(['creator', 'studio'] as const).refine((val) => val === 'creator' || val === 'studio', {
    message: 'Package type is required',
  }),
  totalMonths: z.coerce.number().min(1, 'Contract duration is required'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().optional(),
  syncCallDay: z.coerce.number().min(1, 'Sync call day is required').max(28, 'Sync call day must be between 1 and 28'),
  status: z.enum(['draft', 'sent', 'signed', 'active', 'completed', 'cancelled']),
  description: z.string().optional(),
  terms: z.string().optional(),
  notes: z.string().optional(),
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
  const [selectedPackage, setSelectedPackage] = useState<PackageType>(contract?.packageType || 'creator');

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

  // Get package details
  const getPackageDetails = (type: PackageType) => {
    return PACKAGES.find(pkg => pkg.type === type);
  };

  // Initialize form with default values
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<ContractFormValues>({
    resolver: zodResolver(contractSchema),
    defaultValues: contract
      ? {
          title: contract.title,
          clientId: contract.clientId,
          packageType: contract.packageType,
          totalMonths: contract.totalMonths,
          startDate: formatDateForInput(contract.startDate),
          endDate: formatDateForInput(contract.endDate),
          syncCallDay: contract.syncCallDay || 15,
          status: contract.status,
          description: contract.description || '',
          terms: contract.terms || '',
          notes: contract.notes || '',
        }
      : {
          title: '',
          clientId: '',
          packageType: 'creator',
          totalMonths: 6,
          startDate: '',
          endDate: '',
          syncCallDay: 15,
          status: 'draft',
          description: '',
          terms: '',
          notes: '',
        },
  });

  // Watch package type to update the UI
  const watchPackageType = watch('packageType');
  
  // Update selected package when package type changes
  useEffect(() => {
    if (watchPackageType) {
      setSelectedPackage(watchPackageType as PackageType);
    }
  }, [watchPackageType]);

  // Calculate end date based on start date and contract duration
  const watchStartDate = watch('startDate');
  const watchTotalMonths = watch('totalMonths');
  
  useEffect(() => {
    if (watchStartDate && watchTotalMonths) {
      const startDate = new Date(watchStartDate);
      const endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + Number(watchTotalMonths));
      setValue('endDate', formatDateForInput(endDate));
    }
  }, [watchStartDate, watchTotalMonths, setValue]);

  // Handle form submission
  const handleFormSubmit = async (data: ContractFormValues) => {
    setSubmitError(null);
    
    try {
      // Get package details
      const packageDetails = getPackageDetails(data.packageType);
      
      // Add package details to the form data
      const enhancedData = {
        ...data,
        pricePerMonth: packageDetails?.pricePerMonth || 0,
        videosPerMonth: packageDetails?.videosPerMonth || 0,
      };
      
      await onSubmit(enhancedData);
      if (!contract) {
        // Reset form after successful submission for new contracts
        reset();
      }
    } catch (error: any) {
      setSubmitError(error.message || 'An error occurred. Please try again.');
    }
  };

  // Get current package details
  const currentPackage = getPackageDetails(selectedPackage);

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

        {/* Package Type */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Package Selection <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {PACKAGES.map((pkg) => (
              <div 
                key={pkg.id}
                className={`relative border rounded-lg p-4 cursor-pointer transition-all ${
                  selectedPackage === pkg.type 
                    ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-500' 
                    : 'border-gray-300 hover:border-blue-300'
                }`}
                onClick={() => setValue('packageType', pkg.type)}
              >
                <input
                  type="radio"
                  id={pkg.id}
                  value={pkg.type}
                  {...register('packageType')}
                  className="sr-only"
                />
                <div className="flex justify-between">
                  <label htmlFor={pkg.id} className="font-medium text-gray-900 cursor-pointer">
                    {pkg.name}
                  </label>
                  <span className="text-blue-600 font-bold">${pkg.pricePerMonth}/mo</span>
                </div>
                <p className="mt-1 text-sm text-gray-500">{pkg.description}</p>
                <ul className="mt-2 space-y-1">
                  <li className="flex items-center text-sm text-gray-700">
                    <span className="mr-2 text-blue-500">✓</span>
                    {pkg.videosPerMonth} videos per month
                  </li>
                  {pkg.features.map((feature, index) => (
                    <li key={index} className="flex items-center text-sm text-gray-700">
                      <span className="mr-2 text-blue-500">✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          {errors.packageType && (
            <p className="mt-1 text-sm text-red-600">{errors.packageType.message}</p>
          )}
        </div>

        {/* Contract Duration */}
        <div>
          <label htmlFor="totalMonths" className="block text-sm font-medium text-gray-700">
            Contract Duration (months) <span className="text-red-500">*</span>
          </label>
          <select
            id="totalMonths"
            {...register('totalMonths')}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
              errors.totalMonths ? 'border-red-300' : ''
            }`}
          >
            <option value="3">3 months</option>
            <option value="6">6 months</option>
            <option value="12">12 months</option>
            <option value="24">24 months</option>
          </select>
          {errors.totalMonths && <p className="mt-1 text-sm text-red-600">{errors.totalMonths.message}</p>}
          {selectedPackage && (
            <p className="mt-1 text-sm text-gray-500">
              Total contract value: ${(currentPackage?.pricePerMonth || 0) * Number(watchTotalMonths || 0)}.00
            </p>
          )}
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
        
        {/* Sync Call Day */}
        <div>
          <label htmlFor="syncCallDay" className="block text-sm font-medium text-gray-700">
            Monthly Sync Call Day <span className="text-red-500">*</span>
          </label>
          <input
            id="syncCallDay"
            type="number"
            min="1"
            max="28"
            {...register('syncCallDay')}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
              errors.syncCallDay ? 'border-red-300' : ''
            }`}
          />
          <p className="mt-1 text-xs text-gray-500">
            Day of the month for the recurring sync call (1-28)
          </p>
          {errors.syncCallDay && <p className="mt-1 text-sm text-red-600">{errors.syncCallDay.message}</p>}
        </div>

        {/* End Date (Calculated automatically) */}
        <div>
          <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">
            End Date (Calculated)
          </label>
          <input
            id="endDate"
            type="date"
            {...register('endDate')}
            className="mt-1 block w-full rounded-md border-gray-300 bg-gray-100 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            readOnly
          />
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
          placeholder="Standard terms will be applied if left blank"
        />
        {errors.terms && <p className="mt-1 text-sm text-red-600">{errors.terms.message}</p>}
      </div>

      {/* Notes */}
      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
          Notes
        </label>
        <textarea
          id="notes"
          rows={2}
          {...register('notes')}
          className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
            errors.notes ? 'border-red-300' : ''
          }`}
        />
        {errors.notes && <p className="mt-1 text-sm text-red-600">{errors.notes.message}</p>}
      </div>

      {/* Submit Button */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-75"
        >
          {isSubmitting ? 'Saving...' : contract ? 'Update Contract' : 'Create Contract'}
        </button>
      </div>
    </form>
  );
} 