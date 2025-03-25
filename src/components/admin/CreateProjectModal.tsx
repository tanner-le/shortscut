'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { 
  FiX, FiEdit3, FiCalendar, FiClock, FiBarChart2, 
  FiAlertTriangle, FiBriefcase, FiFileText, FiCheckCircle
} from 'react-icons/fi';
import { ProjectStatus } from '@/types/project';

// Date validation helper
const isValidDate = (date: Date) => !isNaN(date.getTime());

// Define validation schema
const projectSchema = z.object({
  title: z.string().min(1, 'Project title is required'),
  organizationId: z.string().min(1, 'Client organization is required'),
  description: z.string().optional(),
  startDate: z.string().refine(val => {
    const date = new Date(val);
    return isValidDate(date);
  }, 'Valid start date is required'),
  dueDate: z.string().optional()
    .refine(val => !val || isValidDate(new Date(val)), 'Due date must be valid if provided'),
  status: z.enum(['not_started', 'writing', 'filming', 'editing', 'revising', 'delivered'])
    .default('not_started'),
});

type ProjectFormData = z.infer<typeof projectSchema>;

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ProjectFormData) => Promise<void>;
  organizations: { id: string; name: string; plan: string }[];
}

export default function CreateProjectModal({
  isOpen,
  onClose,
  onSubmit,
  organizations,
}: CreateProjectModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 2;
  const [orgSearchTerm, setOrgSearchTerm] = useState('');
  const [showOrgDropdown, setShowOrgDropdown] = useState(false);
  const today = new Date().toISOString().split('T')[0];

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
    trigger,
    clearErrors,
  } = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      title: '',
      organizationId: '',
      description: '',
      startDate: today,
      dueDate: '',
      status: 'not_started',
    },
    mode: 'onChange',
  });

  // Reset form and step when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setCurrentStep(1);
      setError(null);
      setOrgSearchTerm('');
    } else {
      reset();
    }
  }, [isOpen, reset]);

  const handleFormSubmit = async (data: ProjectFormData) => {
    setError(null);
    try {
      setIsSubmitting(true);
      
      // Create proper formatted data for API submission
      // Dates will be properly converted to timestamps in the API
      const submitData = {
        ...data,
        // Ensure startDate is set
        startDate: data.startDate || new Date().toISOString().split('T')[0],
        // Don't send empty due date strings
        dueDate: data.dueDate && data.dueDate.trim() ? data.dueDate : undefined,
      };
      
      await onSubmit(submitData);
      reset();
      onClose();
    } catch (err: any) {
      console.error('Error creating project:', err);
      setError('An error occurred while creating the project. Please try again.');
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

  // Handle organization selection
  const selectOrganization = (orgId: string, orgName: string) => {
    setValue('organizationId', orgId);
    clearErrors('organizationId');
    setOrgSearchTerm(orgName);
    setShowOrgDropdown(false);
  };

  // Filter organizations based on search term
  const filteredOrganizations = organizations.filter(org => 
    org.name.toLowerCase().includes(orgSearchTerm.toLowerCase())
  );

  const nextStep = async () => {
    // Validate fields in the current step before proceeding
    const fieldsToValidate = currentStep === 1 
      ? ['title', 'organizationId']
      : ['startDate', 'status'];
    
    const isStepValid = await trigger(fieldsToValidate as any);
    
    if (isStepValid) {
      setCurrentStep(Math.min(currentStep + 1, totalSteps));
    }
  };

  const prevStep = () => {
    setCurrentStep(Math.max(currentStep - 1, 1));
  };

  // Watch form values
  const selectedStatus = watch('status');

  // Helper for status style
  const getStatusStyle = (status: ProjectStatus) => {
    switch (status) {
      case 'not_started': return 'bg-gray-500/10 border-gray-500/20 text-gray-300';
      case 'writing': return 'bg-blue-500/10 border-blue-500/20 text-blue-300';
      case 'filming': return 'bg-yellow-500/10 border-yellow-500/20 text-yellow-300';
      case 'editing': return 'bg-purple-500/10 border-purple-500/20 text-purple-300';
      case 'revising': return 'bg-orange-500/10 border-orange-500/20 text-orange-300';
      case 'delivered': return 'bg-green-500/10 border-green-500/20 text-green-300';
      default: return 'bg-gray-500/10 border-gray-500/20 text-gray-300';
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn overflow-y-auto py-8"
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
              <FiEdit3 className="h-5 w-5" />
            </div>
            <h2 className="text-xl font-semibold text-white">Create New Project</h2>
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
              {currentStep === 1 ? 'Project Details' : 'Schedule & Status'}
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

          {/* Step 1: Project Details */}
          {currentStep === 1 && (
            <div className="space-y-5 animate-fadeIn">
              {/* Project Title */}
              <div>
                <div className="flex justify-between mb-1.5">
                  <label htmlFor="title" className="block text-sm font-medium text-gray-300">
                    Project Title <span className="text-[#FF4F01]">*</span>
                  </label>
                  {errors.title && (
                    <span className="text-xs text-red-400">{errors.title.message}</span>
                  )}
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiEdit3 className="h-5 w-5 text-gray-500" />
                  </div>
                  <input
                    {...register('title')}
                    type="text"
                    id="title"
                    placeholder="Enter project title"
                    className={`w-full pl-10 pr-4 py-3 bg-[#1D2939] border ${
                      errors.title ? 'border-red-500/50' : 'border-[#2A354C]'
                    } text-white rounded-lg focus:outline-none focus:ring-1 focus:ring-[#FF4F01]/50 focus:border-[#FF4F01]/50 transition-all duration-200`}
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">Choose a clear, descriptive name for this project</p>
              </div>

              {/* Client Organization */}
              <div>
                <div className="flex justify-between mb-1.5">
                  <label htmlFor="organization" className="block text-sm font-medium text-gray-300">
                    Client <span className="text-[#FF4F01]">*</span>
                  </label>
                  {errors.organizationId && (
                    <span className="text-xs text-red-400">{errors.organizationId.message}</span>
                  )}
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiBriefcase className="h-5 w-5 text-gray-500" />
                  </div>
                  <input
                    type="text"
                    id="organization"
                    placeholder="Select client organization"
                    value={orgSearchTerm}
                    onChange={(e) => {
                      setOrgSearchTerm(e.target.value);
                      setShowOrgDropdown(true);
                      if (!e.target.value) {
                        setValue('organizationId', '');
                      }
                    }}
                    onFocus={() => setShowOrgDropdown(true)}
                    className={`w-full pl-10 pr-4 py-3 bg-[#1D2939] border ${
                      errors.organizationId ? 'border-red-500/50' : 'border-[#2A354C]'
                    } text-white rounded-lg focus:outline-none focus:ring-1 focus:ring-[#FF4F01]/50 focus:border-[#FF4F01]/50 transition-all duration-200`}
                  />
                  
                  {showOrgDropdown && (
                    <div className="absolute z-10 mt-1 w-full bg-[#1D2939] rounded-lg shadow-lg border border-[#2A354C] max-h-60 overflow-auto">
                      {filteredOrganizations.length === 0 ? (
                        <div className="p-3 text-sm text-gray-400">No matching clients found</div>
                      ) : (
                        filteredOrganizations.map(org => (
                          <div 
                            key={org.id}
                            onClick={() => selectOrganization(org.id, org.name)}
                            className="flex items-center px-4 py-3 cursor-pointer hover:bg-[#2A354C]/50 transition-colors"
                          >
                            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm mr-3">
                              {org.name.charAt(0)}
                            </div>
                            <div>
                              <p className="text-white font-medium text-sm">{org.name}</p>
                              <p className="text-xs text-gray-400">{org.plan} plan</p>
                            </div>
                            {watch('organizationId') === org.id && (
                              <FiCheckCircle className="ml-auto text-green-400 h-4 w-4" />
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
                <p className="mt-1 text-xs text-gray-500">Select the client this project belongs to</p>
              </div>

              {/* Project Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-1.5">
                  Description
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 pt-3 flex items-start pointer-events-none">
                    <FiFileText className="h-5 w-5 text-gray-500" />
                  </div>
                  <textarea
                    {...register('description')}
                    id="description"
                    rows={4}
                    placeholder="Enter project description and details..."
                    className="w-full pl-10 pr-4 py-3 bg-[#1D2939] border border-[#2A354C] text-white rounded-lg focus:outline-none focus:ring-1 focus:ring-[#FF4F01]/50 focus:border-[#FF4F01]/50 transition-all duration-200 resize-none"
                  ></textarea>
                </div>
                <p className="mt-1 text-xs text-gray-500">Brief overview of the project scope and goals</p>
              </div>
            </div>
          )}

          {/* Step 2: Schedule & Status */}
          {currentStep === 2 && (
            <div className="space-y-5 animate-fadeIn">
              {/* Timeline */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Start Date */}
                <div>
                  <div className="flex justify-between mb-1.5">
                    <label htmlFor="startDate" className="block text-sm font-medium text-gray-300">
                      Start Date <span className="text-[#FF4F01]">*</span>
                    </label>
                    {errors.startDate && (
                      <span className="text-xs text-red-400">{errors.startDate.message}</span>
                    )}
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiCalendar className="h-5 w-5 text-gray-500" />
                    </div>
                    <input
                      {...register('startDate')}
                      type="date"
                      id="startDate"
                      className={`w-full pl-10 pr-4 py-3 bg-[#1D2939] border ${
                        errors.startDate ? 'border-red-500/50' : 'border-[#2A354C]'
                      } text-white rounded-lg focus:outline-none focus:ring-1 focus:ring-[#FF4F01]/50 focus:border-[#FF4F01]/50 transition-all duration-200`}
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500">When the project will commence</p>
                </div>

                {/* Due Date */}
                <div>
                  <div className="flex justify-between mb-1.5">
                    <label htmlFor="dueDate" className="block text-sm font-medium text-gray-300">
                      Due Date
                    </label>
                    {errors.dueDate && (
                      <span className="text-xs text-red-400">{errors.dueDate.message}</span>
                    )}
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiClock className="h-5 w-5 text-gray-500" />
                    </div>
                    <input
                      {...register('dueDate')}
                      type="date"
                      id="dueDate"
                      className="w-full pl-10 pr-4 py-3 bg-[#1D2939] border border-[#2A354C] text-white rounded-lg focus:outline-none focus:ring-1 focus:ring-[#FF4F01]/50 focus:border-[#FF4F01]/50 transition-all duration-200"
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500">Expected completion date (optional)</p>
                </div>
              </div>

              {/* Project Status */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  Initial Status <span className="text-[#FF4F01]">*</span>
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {(['not_started', 'writing', 'filming', 'editing', 'revising', 'delivered'] as ProjectStatus[]).map((status) => (
                    <label
                      key={status}
                      className={`flex flex-col items-center p-3 rounded-lg border cursor-pointer transition-all duration-200 ${
                        selectedStatus === status
                          ? `${getStatusStyle(status)} ring-2 ring-[#FF4F01]`
                          : 'border-[#2A354C] bg-[#1D2939] hover:bg-[#2A354C]/30'
                      }`}
                    >
                      <input
                        {...register('status')}
                        type="radio"
                        value={status}
                        className="sr-only"
                      />
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#151C2C]">
                        <FiBarChart2 className={`h-4 w-4 ${selectedStatus === status ? 'text-[#FF4F01]' : 'text-gray-400'}`} />
                      </div>
                      <span className={`mt-2 text-sm font-medium ${selectedStatus === status ? 'text-white' : 'text-gray-400'}`}>
                        {status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </span>
                    </label>
                  ))}
                </div>
                <p className="mt-2 text-xs text-gray-500">Current project phase or status</p>
              </div>
            </div>
          )}

          <div className="flex justify-between gap-3 pt-6 mt-6 border-t border-[#2A354C]">
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
                ) : 'Create Project'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 