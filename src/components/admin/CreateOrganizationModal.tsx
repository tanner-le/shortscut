'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { FiX, FiBriefcase, FiUser, FiMail, FiPhone, FiMapPin, FiFileText, FiAlertTriangle } from 'react-icons/fi';
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
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 2;

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isValid },
    trigger,
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
    mode: 'onChange',
  });

  // Reset form and step when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setCurrentStep(1);
      setError(null);
    } else {
      reset();
    }
  }, [isOpen, reset]);

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

  // Close modal on escape key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  const nextStep = async () => {
    // Validate fields in the current step before proceeding
    const fieldsToValidate = currentStep === 1 
      ? ['company', 'name', 'email', 'plan']
      : ['industry', 'address', 'notes', 'status'];
    
    const isStepValid = await trigger(fieldsToValidate as any);
    
    if (isStepValid) {
      setCurrentStep(Math.min(currentStep + 1, totalSteps));
    }
  };

  const prevStep = () => {
    setCurrentStep(Math.max(currentStep - 1, 1));
  };

  // Watch form values for conditional logic
  const selectedPlan = watch('plan');

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 animate-fadeIn overflow-y-auto py-8"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        className="bg-[#151C2C] rounded-xl shadow-2xl shadow-black/30 w-full max-w-2xl max-h-[90vh] overflow-hidden border border-[#2A354C] animate-scaleIn"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#2A354C]">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-lg bg-[#FF4F01]/10 flex items-center justify-center text-[#FF4F01]">
              <FiBriefcase className="h-5 w-5" />
            </div>
            <h2 className="text-xl font-semibold text-white">Create New Client</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-[#1D2939] transition-colors duration-200"
            aria-label="Close"
            type="button"
          >
            <FiX size={20} />
          </button>
        </div>

        {/* Progress indicator */}
        <div className="px-6 pt-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <span className="text-sm font-medium text-gray-400">Step {currentStep} of {totalSteps}</span>
            </div>
            <div className="text-sm font-medium text-gray-400">
              {currentStep === 1 ? 'Basic Information' : 'Additional Details'}
            </div>
          </div>
          <div className="w-full bg-[#1D2939] h-1.5 rounded-full">
            <div 
              className="bg-[#FF4F01] h-1.5 rounded-full transition-all duration-300 ease-in-out" 
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            ></div>
          </div>
        </div>

        <div className="px-6 py-5">
          {error && (
            <div className="mb-6 bg-red-500/10 border border-red-500/30 rounded-lg p-4 flex items-start">
              <FiAlertTriangle className="h-5 w-5 text-red-400 mt-0.5 flex-shrink-0" />
              <div className="ml-3">
                <p className="text-sm text-red-400">{error}</p>
              </div>
            </div>
          )}

          {/* Step 1: Basic Information */}
          {currentStep === 1 && (
            <div className="space-y-5 animate-fadeIn">
              {/* Organization Name */}
              <div>
                <div className="flex justify-between mb-1.5">
                  <label htmlFor="company" className="block text-sm font-medium text-gray-300">
                    Company Name <span className="text-[#FF4F01]">*</span>
                  </label>
                  {errors.company && (
                    <span className="text-xs text-red-400">{errors.company.message}</span>
                  )}
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiBriefcase className="h-5 w-5 text-gray-500" />
                  </div>
                  <input
                    {...register('company')}
                    type="text"
                    id="company"
                    placeholder="Enter company name"
                    className={`w-full pl-10 pr-4 py-3 bg-[#1D2939] border ${
                      errors.company ? 'border-red-500/50' : 'border-[#2A354C]'
                    } text-white rounded-lg focus:outline-none focus:ring-1 focus:ring-[#FF4F01]/50 focus:border-[#FF4F01]/50 transition-all duration-200`}
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">Legal name of the company</p>
              </div>

              {/* Contact Person */}
              <div>
                <div className="flex justify-between mb-1.5">
                  <label htmlFor="name" className="block text-sm font-medium text-gray-300">
                    Contact Person <span className="text-[#FF4F01]">*</span>
                  </label>
                  {errors.name && (
                    <span className="text-xs text-red-400">{errors.name.message}</span>
                  )}
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiUser className="h-5 w-5 text-gray-500" />
                  </div>
                  <input
                    {...register('name')}
                    type="text"
                    id="name"
                    placeholder="Enter primary contact name"
                    className={`w-full pl-10 pr-4 py-3 bg-[#1D2939] border ${
                      errors.name ? 'border-red-500/50' : 'border-[#2A354C]'
                    } text-white rounded-lg focus:outline-none focus:ring-1 focus:ring-[#FF4F01]/50 focus:border-[#FF4F01]/50 transition-all duration-200`}
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">Main person we'll be communicating with</p>
              </div>

              {/* Contact Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Email */}
                <div>
                  <div className="flex justify-between mb-1.5">
                    <label htmlFor="email" className="block text-sm font-medium text-gray-300">
                      Email <span className="text-[#FF4F01]">*</span>
                    </label>
                    {errors.email && (
                      <span className="text-xs text-red-400">{errors.email.message}</span>
                    )}
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiMail className="h-5 w-5 text-gray-500" />
                    </div>
                    <input
                      {...register('email')}
                      type="email"
                      id="email"
                      placeholder="contact@example.com"
                      className={`w-full pl-10 pr-4 py-3 bg-[#1D2939] border ${
                        errors.email ? 'border-red-500/50' : 'border-[#2A354C]'
                      } text-white rounded-lg focus:outline-none focus:ring-1 focus:ring-[#FF4F01]/50 focus:border-[#FF4F01]/50 transition-all duration-200`}
                    />
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-300 mb-1.5">
                    Phone Number
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiPhone className="h-5 w-5 text-gray-500" />
                    </div>
                    <input
                      {...register('phone')}
                      type="text"
                      id="phone"
                      placeholder="+1 (555) 123-4567"
                      className="w-full pl-10 pr-4 py-3 bg-[#1D2939] border border-[#2A354C] text-white rounded-lg focus:outline-none focus:ring-1 focus:ring-[#FF4F01]/50 focus:border-[#FF4F01]/50 transition-all duration-200"
                    />
                  </div>
                </div>
              </div>

              {/* Plan Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  Plan <span className="text-[#FF4F01]">*</span>
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label 
                    className={`relative rounded-lg border-2 p-4 cursor-pointer transition-all duration-200 ${
                      selectedPlan === 'creator' 
                        ? 'border-[#FF4F01] bg-[#FF4F01]/5' 
                        : 'border-[#2A354C] hover:border-[#2A354C]/80 bg-[#1D2939]'
                    }`}
                  >
                    <input
                      {...register('plan')}
                      type="radio"
                      value="creator"
                      className="sr-only"
                    />
                    <div className="flex items-center">
                      <div className={`h-5 w-5 rounded-full border-2 mr-3 ${
                        selectedPlan === 'creator' 
                          ? 'border-[#FF4F01]' 
                          : 'border-gray-400'
                      }`}>
                        {selectedPlan === 'creator' && (
                          <div className="h-3 w-3 rounded-full bg-[#FF4F01] m-0.5"></div>
                        )}
                      </div>
                      <div>
                        <p className="text-white font-medium">Creator Plan</p>
                        <p className="text-xs text-gray-400 mt-1">For individuals and small teams</p>
                      </div>
                    </div>
                  </label>
                  
                  <label 
                    className={`relative rounded-lg border-2 p-4 cursor-pointer transition-all duration-200 ${
                      selectedPlan === 'studio' 
                        ? 'border-[#FF4F01] bg-[#FF4F01]/5' 
                        : 'border-[#2A354C] hover:border-[#2A354C]/80 bg-[#1D2939]'
                    }`}
                  >
                    <input
                      {...register('plan')}
                      type="radio"
                      value="studio"
                      className="sr-only"
                    />
                    <div className="flex items-center">
                      <div className={`h-5 w-5 rounded-full border-2 mr-3 ${
                        selectedPlan === 'studio' 
                          ? 'border-[#FF4F01]' 
                          : 'border-gray-400'
                      }`}>
                        {selectedPlan === 'studio' && (
                          <div className="h-3 w-3 rounded-full bg-[#FF4F01] m-0.5"></div>
                        )}
                      </div>
                      <div>
                        <p className="text-white font-medium">Studio Plan</p>
                        <p className="text-xs text-gray-400 mt-1">For agencies and larger businesses</p>
                      </div>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Additional Details */}
          {currentStep === 2 && (
            <div className="space-y-5 animate-fadeIn">
              {/* Industry */}
              <div>
                <label htmlFor="industry" className="block text-sm font-medium text-gray-300 mb-1.5">
                  Industry
                </label>
                <input
                  {...register('industry')}
                  type="text"
                  id="industry"
                  placeholder="e.g. Technology, Education, Healthcare"
                  className="w-full px-4 py-3 bg-[#1D2939] border border-[#2A354C] text-white rounded-lg focus:outline-none focus:ring-1 focus:ring-[#FF4F01]/50 focus:border-[#FF4F01]/50 transition-all duration-200"
                />
                <p className="mt-1 text-xs text-gray-500">The client's primary industry or business sector</p>
              </div>

              {/* Address */}
              <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-300 mb-1.5">
                  Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiMapPin className="h-5 w-5 text-gray-500" />
                  </div>
                  <textarea
                    {...register('address')}
                    id="address"
                    rows={2}
                    placeholder="Street address, city, state, country, zip code"
                    className="w-full pl-10 pr-4 py-3 bg-[#1D2939] border border-[#2A354C] text-white rounded-lg focus:outline-none focus:ring-1 focus:ring-[#FF4F01]/50 focus:border-[#FF4F01]/50 transition-all duration-200 resize-none"
                  ></textarea>
                </div>
                <p className="mt-1.5 text-xs text-gray-500">Physical location where client operations are based</p>
              </div>

              {/* Client Status */}
              <div className="mb-4">
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-sm font-medium text-gray-300">Client Status</label>
                  <span className="text-xs text-gray-400">{watch('status') === 'active' ? 'Active' : 'Inactive'}</span>
                </div>
                <div className="bg-[#1D2939] p-3 rounded-lg border border-[#2A354C]">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className={`h-10 w-10 rounded-full ${
                        watch('status') === 'active' 
                          ? 'bg-green-500/10 text-green-500' 
                          : 'bg-red-500/10 text-red-500'
                      } flex items-center justify-center`}>
                        <div className="h-4 w-4 rounded-full bg-current"></div>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-white">
                          {watch('status') === 'active' ? 'Client is currently working with us' : 'Client is not currently active'}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button" 
                      onClick={() => {
                        const newStatus = watch('status') === 'active' ? 'inactive' : 'active';
                        const event = {
                          target: { 
                            name: 'status',
                            value: newStatus 
                          }
                        } as any;
                        
                        register('status').onChange(event);
                      }}
                      className="cursor-pointer focus:outline-none"
                      aria-label={`Toggle status to ${watch('status') === 'active' ? 'inactive' : 'active'}`}
                    >
                      <div className={`relative inline-flex w-14 h-7 rounded-full transition-colors duration-200 ease-in-out ${
                        watch('status') === 'active' ? 'bg-green-500' : 'bg-red-500'
                      }`}>
                        <span className={`inline-block w-5 h-5 transform rounded-full bg-white shadow-md transition-transform duration-200 ease-in-out translate-y-1 ${
                          watch('status') === 'active' ? 'translate-x-8' : 'translate-x-1'
                        }`} />
                      </div>
                    </button>
                  </div>
                </div>
                <p className="mt-1.5 text-xs text-gray-500">Toggle to set the client's active status</p>
              </div>

              {/* Notes */}
              <div>
                <label htmlFor="notes" className="block text-sm font-medium text-gray-300 mb-1.5">
                  Notes
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 pt-3 flex items-start pointer-events-none">
                    <FiFileText className="h-5 w-5 text-gray-500" />
                  </div>
                  <div className="border border-[#2A354C] rounded-lg">
                    <div className="pt-2 pr-3 pb-1 pl-10 bg-[#1D2939] border-b border-[#2A354C]/50">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-medium text-gray-500">CLIENT NOTES</span>
                        <span className="text-xs text-gray-500">Optional</span>
                      </div>
                    </div>
                    <textarea
                      {...register('notes')}
                      id="notes"
                      rows={3}
                      placeholder="Add any additional information about this client that might be helpful for your team..."
                      className="w-full pl-10 pr-4 py-3 bg-[#1D2939] border-0 border-t-0 text-white rounded-b-lg focus:outline-none focus:ring-1 focus:ring-[#FF4F01]/50 focus:border-[#FF4F01]/50 transition-all duration-200 resize-none"
                    ></textarea>
                  </div>
                </div>
                <div className="mt-1.5 flex items-start">
                  <div className="rounded px-1.5 py-0.5 bg-[#FF4F01]/10 mt-0.5">
                    <span className="text-[10px] font-medium text-[#FF4F01]">TIP</span>
                  </div>
                  <p className="ml-2 text-xs text-gray-500">Include special requirements, preferences, or other important information about this client</p>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-between gap-3 pt-6 mt-6 border-t border-[#2A354C] sticky bottom-0 bg-[#151C2C] pb-2">
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={prevStep}
                className="px-5 py-2.5 text-sm font-medium border border-[#2A354C] rounded-lg text-gray-300 hover:text-white bg-transparent hover:bg-[#1D2939] transition-all duration-200 focus:outline-none"
              >
                Back
              </button>
            ) : (
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 text-sm font-medium border border-[#2A354C] rounded-lg text-gray-300 hover:text-white bg-transparent hover:bg-[#1D2939] transition-all duration-200 focus:outline-none"
                disabled={isSubmitting}
              >
                Cancel
              </button>
            )}

            {currentStep < totalSteps ? (
              <button
                type="button"
                onClick={nextStep}
                className="px-5 py-2.5 text-sm font-medium rounded-lg text-white bg-[#FF4F01] hover:bg-[#FF4F01]/90 transition-all duration-200 focus:outline-none"
              >
                Continue
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit(handleFormSubmit)}
                className="px-5 py-2.5 text-sm font-medium rounded-lg text-white bg-[#FF4F01] hover:bg-[#FF4F01]/90 transition-all duration-200 focus:outline-none disabled:opacity-50 disabled:hover:bg-[#FF4F01]"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating...
                  </span>
                ) : 'Create Client'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 