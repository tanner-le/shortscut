import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { FiX, FiCalendar, FiClock, FiSave, FiChevronDown, FiAlertTriangle, FiInfo, FiCheckCircle } from 'react-icons/fi';
import { Project, ProjectStatus } from '@/types/project';

interface EditProjectModalProps {
  project: Project;
  isOpen: boolean;
  onClose: () => void;
  onSuccessfulEdit?: () => void;
  organizations: any[];
}

export default function EditProjectModal({ 
  project: initialProject,
  isOpen, 
  onClose,
  onSuccessfulEdit,
  organizations = []
}: EditProjectModalProps) {
  // Form state
  const [title, setTitle] = useState(initialProject.title);
  const [description, setDescription] = useState(initialProject.description || '');
  const [organizationId, setOrganizationId] = useState(initialProject.organizationId);
  const [status, setStatus] = useState<ProjectStatus>(initialProject.status);
  const [startDate, setStartDate] = useState(initialProject.startDate);
  const [dueDate, setDueDate] = useState(initialProject.dueDate || '');
  
  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showClientDropdown, setShowClientDropdown] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isDirty, setIsDirty] = useState(false);

  // Log organizations for debugging
  useEffect(() => {
    console.log('Organizations in EditProjectModal:', organizations);
    console.log('Current organizationId:', organizationId);
  }, [organizations, organizationId]);

  // Reset form when project changes
  useEffect(() => {
    if (initialProject) {
      setTitle(initialProject.title);
      setDescription(initialProject.description || '');
      setOrganizationId(initialProject.organizationId);
      setStatus(initialProject.status);
      setStartDate(initialProject.startDate);
      setDueDate(initialProject.dueDate || '');
      setError(null);
      setIsDirty(false);
    }
  }, [initialProject, isOpen]);

  // Helper function to ensure valid date formatting
  const formatDateForAPI = (dateString: string | Date) => {
    try {
      // Create a new Date object from the input string or date
      const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
      // Check if the date is valid
      if (isNaN(date.getTime())) {
        throw new Error('Invalid date');
      }
      // Return ISO string
      return date.toISOString();
    } catch (e) {
      console.error('Date formatting error:', e);
      throw new Error('Invalid date format');
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!title.trim()) {
      setError('Project title is required');
      return;
    }
    
    if (!organizationId) {
      setError('Please select a client');
      return;
    }
    
    if (!startDate) {
      setError('Start date is required');
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);
    
    try {
      // Format dates properly to ISO string with error handling
      let formattedStartDate, formattedDueDate;
      
      try {
        formattedStartDate = formatDateForAPI(startDate);
      } catch (e) {
        setError('Invalid start date format');
        setIsSubmitting(false);
        return;
      }
      
      // Only format dueDate if it exists
      if (dueDate) {
        try {
          formattedDueDate = formatDateForAPI(dueDate);
        } catch (e) {
          setError('Invalid due date format');
          setIsSubmitting(false);
          return;
        }
      }
      
      // Prepare project data
      const updatedProject = {
        title: title.trim(),
        description: description.trim(),
        organizationId,
        status,
        startDate: formattedStartDate,
        ...(formattedDueDate ? { dueDate: formattedDueDate } : {})
      };
      
      console.log('Updating project with data:', updatedProject);
      
      // Submit to API
      const response = await fetch(`/api/projects/${initialProject.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedProject),
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to update project');
      }
      
      // Show success message
      setSuccess('Project updated successfully!');
      setIsDirty(false);
      
      // Close the modal after a brief delay to show the success message
      setTimeout(() => {
        // Success - call callback and close modal
        if (onSuccessfulEdit) {
          onSuccessfulEdit();
        }
      }, 1000);
    } catch (err) {
      console.error('Error updating project:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Close modal if escape key is pressed
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        if (isDirty) {
          // Maybe show a confirmation dialog
          const confirmed = window.confirm('You have unsaved changes. Are you sure you want to close?');
          if (confirmed) {
            onClose();
          }
        } else {
          onClose();
        }
      }
    };

    window.addEventListener('keydown', handleEscKey);
    return () => {
      window.removeEventListener('keydown', handleEscKey);
    };
  }, [isOpen, onClose, isDirty]);

  // If modal is not open, render an empty fragment instead of null
  if (!isOpen) {
    console.log('EditProjectModal isOpen is false, returning empty fragment');
    return <></>;
  }

  // Helper to format status for display
  const formatStatus = (projectStatus: ProjectStatus) => {
    return projectStatus.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  // Helper to get status color
  const getStatusColor = (projectStatus: ProjectStatus) => {
    switch (projectStatus) {
      case 'not_started': return 'bg-gray-400';
      case 'writing': return 'bg-blue-400';
      case 'filming': return 'bg-yellow-400';
      case 'editing': return 'bg-purple-400';
      case 'revising': return 'bg-orange-400';
      case 'delivered': return 'bg-green-400';
      default: return 'bg-gray-400';
    }
  };

  console.log('Rendering EditProjectModal contents, isOpen:', isOpen);

  return (
    <div className="fixed inset-0 z-[60] overflow-y-auto flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity" 
        onClick={() => {
          if (isDirty) {
            const confirmed = window.confirm('You have unsaved changes. Are you sure you want to close?');
            if (confirmed) {
              onClose();
            }
          } else {
            onClose();
          }
        }}
        aria-hidden="true" 
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-3xl mx-auto flex flex-col max-h-[90vh] bg-gradient-to-b from-[#1a2233] to-[#111827] rounded-xl shadow-2xl border border-gray-700/50 overflow-hidden transform transition-all">
        {/* Header with title */}
        <div className="px-6 py-4 flex items-center justify-between border-b border-gray-700/50 bg-[#111827]">
          <h2 className="text-xl font-bold text-white">Edit Project</h2>
          
          {/* Close button */}
          <button
            onClick={() => {
              if (isDirty) {
                const confirmed = window.confirm('You have unsaved changes. Are you sure you want to close?');
                if (confirmed) {
                  onClose();
                }
              } else {
                onClose();
              }
            }}
            className="p-1.5 rounded-full text-gray-400 hover:text-white hover:bg-gray-700/50 transition-colors"
            aria-label="Close modal"
          >
            <FiX className="h-5 w-5" />
          </button>
        </div>
        
        {/* Display error message if there is one */}
        {error && (
          <div className="mx-6 mt-4 p-3 bg-red-900/20 border border-red-700/30 rounded-lg">
            <div className="flex items-start">
              <FiAlertTriangle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-300">{error}</p>
            </div>
          </div>
        )}
        
        {/* Display success message if there is one */}
        {success && (
          <div className="mx-6 mt-4 p-3 bg-green-900/20 border border-green-700/30 rounded-lg">
            <div className="flex items-start">
              <FiCheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-green-300">{success}</p>
            </div>
          </div>
        )}
        
        {/* Form */}
        <form onSubmit={handleSubmit} className="overflow-y-auto px-6 py-4">
          <div className="space-y-5">
            {/* Project Name */}
            <div>
              <label htmlFor="project-title" className="block text-sm font-medium text-gray-300 mb-1">
                Project Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="project-title"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  setIsDirty(true);
                }}
                placeholder="Enter project title"
                className="w-full px-4 py-2.5 bg-[#111827] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            
            {/* Client selection */}
            <div>
              <label htmlFor="client" className="block text-sm font-medium text-gray-300 mb-1">
                Client <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <button
                  type="button"
                  className="w-full px-4 py-2.5 bg-[#111827] border border-gray-700 rounded-lg text-left text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent flex items-center justify-between"
                  onClick={() => setShowClientDropdown(!showClientDropdown)}
                >
                  <span>
                    {organizations.find(org => org.id === organizationId)?.name || 'Select a client'}
                  </span>
                  <FiChevronDown className="h-4 w-4 text-gray-400" />
                </button>
                
                {/* Client dropdown */}
                {showClientDropdown && (
                  <div className="absolute z-10 mt-1 w-full bg-[#151f2e] border border-gray-700 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {organizations.map(org => (
                      <button
                        key={org.id}
                        type="button"
                        className={`w-full px-4 py-2.5 text-left text-sm hover:bg-gray-700/30 flex items-center ${
                          org.id === organizationId ? 'bg-gray-700/20 font-medium' : ''
                        }`}
                        onClick={() => {
                          setOrganizationId(org.id);
                          setShowClientDropdown(false);
                          setIsDirty(true);
                        }}
                      >
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm mr-3">
                          {org.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-white font-medium">{org.name}</p>
                          <p className="text-xs text-gray-400">
                            {org.plan === 'studio' ? 'Studio Plan' : 'Creator Plan'}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            {/* Status selection */}
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-300 mb-1">
                Status <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <button
                  type="button"
                  className="w-full px-4 py-2.5 bg-[#111827] border border-gray-700 rounded-lg text-left text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent flex items-center"
                  onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                >
                  <span className={`w-3 h-3 rounded-full ${getStatusColor(status)} mr-2`}></span>
                  <span>{formatStatus(status)}</span>
                  <FiChevronDown className="ml-auto h-4 w-4 text-gray-400" />
                </button>
                
                {/* Status dropdown */}
                {showStatusDropdown && (
                  <div className="absolute z-10 mt-1 w-full bg-[#151f2e] border border-gray-700 rounded-lg shadow-lg">
                    {(['not_started', 'writing', 'filming', 'editing', 'revising', 'delivered'] as ProjectStatus[]).map((statusOption) => (
                      <button
                        key={statusOption}
                        type="button"
                        className={`w-full px-4 py-2.5 text-left text-sm hover:bg-gray-700/30 flex items-center ${
                          status === statusOption ? 'bg-gray-700/20 font-medium' : ''
                        }`}
                        onClick={() => {
                          setStatus(statusOption);
                          setShowStatusDropdown(false);
                          setIsDirty(true);
                        }}
                      >
                        <span className={`w-3 h-3 rounded-full ${getStatusColor(statusOption)} mr-2`}></span>
                        {formatStatus(statusOption)}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            {/* Dates row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Start Date */}
              <div>
                <label htmlFor="start-date" className="block text-sm font-medium text-gray-300 mb-1">
                  Start Date <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiCalendar className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="date"
                    id="start-date"
                    value={startDate ? new Date(startDate).toISOString().split('T')[0] : ''}
                    onChange={(e) => {
                      setStartDate(e.target.value);
                      setIsDirty(true);
                    }}
                    className="w-full pl-10 pr-4 py-2.5 bg-[#111827] border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-auto cursor-pointer"
                    required
                  />
                </div>
              </div>
              
              {/* Due Date (optional) */}
              <div>
                <label htmlFor="due-date" className="block text-sm font-medium text-gray-300 mb-1">
                  Due Date <span className="text-gray-500">(optional)</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiClock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="date"
                    id="due-date"
                    value={dueDate ? new Date(dueDate).toISOString().split('T')[0] : ''}
                    onChange={(e) => {
                      setDueDate(e.target.value);
                      setIsDirty(true);
                    }}
                    className="w-full pl-10 pr-4 py-2.5 bg-[#111827] border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-auto cursor-pointer"
                  />
                </div>
              </div>
            </div>
            
            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-1">
                Description <span className="text-gray-500">(optional)</span>
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value);
                  setIsDirty(true);
                }}
                rows={4}
                placeholder="Enter project description"
                className="w-full px-4 py-2.5 bg-[#111827] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
            </div>
            
            {/* Project information note */}
            <div className="bg-blue-900/20 border border-blue-700/30 rounded-lg p-3">
              <div className="flex items-start">
                <FiInfo className="h-5 w-5 text-blue-400 mr-2 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-blue-300">
                  Project team members can be managed separately after editing the project.
                </p>
              </div>
            </div>
          </div>
        </form>
        
        {/* Footer with actions */}
        <div className="px-6 py-4 border-t border-gray-700/50 bg-[#111827] flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm font-medium rounded-md transition-colors"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting || !isDirty}
            className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-md ${
              isSubmitting 
                ? 'bg-blue-700/70 cursor-not-allowed text-white/70' 
                : !isDirty
                  ? 'bg-blue-600/50 cursor-not-allowed text-white/70'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
            } transition-colors`}
          >
            <FiSave className="mr-1.5 -ml-0.5 h-4 w-4" />
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
} 