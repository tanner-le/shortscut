'use client';

import { useState, useEffect } from 'react';
import { FiPlus, FiEdit2, FiEye, FiUsers, FiRefreshCw, FiFilter, FiChevronDown, FiSliders, FiBriefcase, FiAlertCircle } from 'react-icons/fi';
import Link from 'next/link';
import { Client } from '@/types/client';
import CreateOrganizationModal from './CreateOrganizationModal';

/**
 * ClientList component displays a list of clients with filtering and management capabilities.
 * 
 * Features:
 * - Status filtering (all, active, inactive)
 * - Loading states with spinners
 * - Error handling with retry options
 * - Empty state with call-to-action
 * - Action buttons for each client (team management, view, edit)
 * 
 * @returns {JSX.Element} The rendered client list component
 */
export default function ClientList() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  /**
   * Fetches clients from the API with optional status filtering
   * Handles loading states and error scenarios
   */
  async function fetchClients() {
    try {
      setLoading(true);
      setError(null);
      const queryParams = statusFilter !== 'all' ? `?status=${statusFilter}` : '';
      const response = await fetch(`/api/clients${queryParams}`);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || 'Failed to fetch clients');
      }
      
      const data = await response.json();
      setClients(data.data || []);
    } catch (err: any) {
      console.error('Error fetching clients:', err);
      setError(err.message || 'An unexpected error occurred while fetching clients');
    } finally {
      setLoading(false);
    }
  }
  
  // Fetch clients when component mounts or filter changes
  useEffect(() => {
    fetchClients();
  }, [statusFilter]);

  // Handle organization creation
  const handleCreateOrganization = async (data: any) => {
    try {
      const response = await fetch('/api/clients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to create organization');
      }

      const result = await response.json();
      
      // Add the new organization to the list
      setClients([result.data, ...clients]);
      
      // Close the modal
      setIsCreateModalOpen(false);
      
      // Show success notification
      alert('Organization created successfully!');
    } catch (error: any) {
      console.error('Error creating organization:', error);
      throw new Error('Unable to create organization. Please try again.');
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="bg-[#1a2233] rounded-lg shadow-md p-5 border border-[#2a3347]" aria-live="polite" aria-busy="true">
        <div className="flex justify-center items-center py-14">
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 rounded-full border-t-2 border-b-2 border-blue-500 animate-spin" aria-hidden="true"></div>
            <p className="mt-3 text-gray-400 text-sm">Loading clients...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-[#1a2233] rounded-lg shadow-md border border-[#2a3347] overflow-hidden" role="alert" aria-live="assertive">
        <div className="p-5 border-b border-[#2a3347]">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-medium text-white">Clients</h3>
              <p className="text-sm text-gray-400">
                Manage your clients and their team members
              </p>
            </div>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none"
              aria-label="Add new client"
            >
              <FiPlus className="mr-1.5 -ml-0.5 h-4 w-4" aria-hidden="true" />
              Add Client
            </button>
          </div>
        </div>
        
        <div className="p-5">
          <div className="bg-[#151f2e]/80 p-5 rounded-md mb-5 border border-red-500/30">
            <div className="flex items-start">
              <div className="flex-shrink-0 bg-red-500/10 p-2 rounded-full">
                <FiAlertCircle className="h-5 w-5 text-red-500" aria-hidden="true" />
              </div>
              <div className="ml-3">
                <h3 className="text-base font-medium text-red-400">Error Loading Clients</h3>
                <div className="mt-1 text-sm text-gray-400">
                  <p>Unable to load clients. Please try again.</p>
                </div>
                <div className="mt-3">
                  <button
                    type="button"
                    onClick={() => fetchClients()}
                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm rounded-md shadow-sm text-white bg-red-500/60 hover:bg-red-500/80 focus:outline-none"
                    aria-label="Retry fetching clients"
                  >
                    <FiRefreshCw className="mr-1.5 -ml-0.5 h-4 w-4" aria-hidden="true" />
                    Retry
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          <div className="text-center p-6 bg-[#151f2e]/50 rounded-md border border-[#2a3347]">
            <div className="w-16 h-16 mx-auto rounded-full bg-blue-500/10 flex items-center justify-center mb-3">
              <FiUsers className="h-8 w-8 text-blue-400" aria-hidden="true" />
            </div>
            <h3 className="text-lg font-medium text-white mb-2">No Clients Available</h3>
            <p className="text-sm text-gray-400 mb-5 max-w-md mx-auto">
              You can add clients using the button below.
            </p>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none"
              aria-label="Create your first client"
            >
              <FiPlus className="mr-1.5 -ml-0.5 h-4 w-4" aria-hidden="true" />
              Create your first client
            </button>
          </div>
        </div>

        {/* Organization Creation Modal */}
        <CreateOrganizationModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSubmit={handleCreateOrganization}
        />
      </div>
    );
  }

  // Main component with client list
  return (
    <div className="bg-[#1a2233] rounded-lg shadow-md border border-[#2a3347] overflow-hidden">
      <div className="p-5 border-b border-[#2a3347]">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h3 className="text-lg font-medium text-white">Clients</h3>
            <p className="text-sm text-gray-400">
              Manage your clients and their team members
            </p>
          </div>
          <div className="flex flex-wrap sm:flex-nowrap gap-2">
            <div className="relative">
              <div className="flex items-center">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiFilter className="h-3.5 w-3.5 text-gray-400" aria-hidden="true" />
                </div>
                <select
                  id="status-filter"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="bg-[#2a3347] pl-9 pr-8 py-1.5 text-sm text-gray-200 rounded-md border border-[#3b4559] appearance-none focus:outline-none"
                  aria-label="Filter clients by status"
                >
                  <option value="all">All Clients</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <FiChevronDown className="h-3.5 w-3.5 text-gray-400" aria-hidden="true" />
                </div>
              </div>
            </div>
            <button 
              className="p-1.5 rounded-md bg-[#2a3347] border border-[#3b4559] text-gray-300 hover:text-white focus:outline-none"
              aria-label="Advanced filters"
            >
              <FiSliders className="h-4 w-4" aria-hidden="true" />
            </button>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none"
              aria-label="Add new client"
            >
              <FiPlus className="mr-1.5 -ml-0.5 h-4 w-4" aria-hidden="true" />
              Add Client
            </button>
          </div>
        </div>
      </div>

      {/* Empty state */}
      {clients.length === 0 ? (
        <div className="text-center p-12" aria-live="polite">
          <div className="w-16 h-16 mx-auto rounded-full bg-blue-500/10 flex items-center justify-center mb-3">
            <FiBriefcase className="h-8 w-8 text-blue-400" aria-hidden="true" />
          </div>
          <h3 className="text-lg font-medium text-white mb-2">No clients yet</h3>
          <p className="text-sm text-gray-400 mb-5 max-w-md mx-auto">
            Start by adding your first client to begin managing projects and team members.
          </p>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none"
            aria-label="Create your first client"
          >
            <FiPlus className="mr-1.5 -ml-0.5 h-4 w-4" aria-hidden="true" />
            Create your first client
          </button>
        </div>
      ) : (
        /* Client table */
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-[#2a3347]" aria-label="Client list">
            <thead className="bg-[#151f2e]">
              <tr>
                <th
                  scope="col"
                  className="px-5 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider"
                >
                  Company
                </th>
                <th
                  scope="col"
                  className="px-5 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider"
                >
                  Contact
                </th>
                <th
                  scope="col"
                  className="px-5 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider"
                >
                  Industry
                </th>
                <th
                  scope="col"
                  className="px-5 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider"
                >
                  Plan
                </th>
                <th
                  scope="col"
                  className="px-5 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider"
                >
                  Status
                </th>
                <th scope="col" className="relative px-5 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2a3347]">
              {clients.map((client) => (
                <tr key={client.id} className="hover:bg-[#151f2e] transition-colors duration-150">
                  <td className="px-5 py-3 whitespace-nowrap">
                    <div className="text-sm font-medium text-white">{client.company}</div>
                    <div className="text-xs text-gray-400">Code: {client.code}</div>
                  </td>
                  <td className="px-5 py-3 whitespace-nowrap">
                    <div className="text-sm text-white">{client.name}</div>
                    <div className="text-xs text-gray-400">{client.email}</div>
                  </td>
                  <td className="px-5 py-3 whitespace-nowrap">
                    <div className="text-sm text-gray-300">{client.industry || 'N/A'}</div>
                  </td>
                  <td className="px-5 py-3 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${
                      client.plan === 'creator'
                        ? 'bg-blue-500/10 text-blue-400'
                        : 'bg-purple-500/10 text-purple-400'
                    }`}>
                      {client.plan === 'creator' ? 'Creator' : 'Studio'}
                    </span>
                  </td>
                  <td className="px-5 py-3 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${
                        client.status === 'active'
                          ? 'bg-green-500/10 text-green-400'
                          : 'bg-red-500/10 text-red-400'
                      }`}
                    >
                      {client.status}
                    </span>
                  </td>
                  <td className="px-5 py-3 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end">
                      <Link
                        href={`/admin/clients/${client.id}/team`}
                        className="p-1.5 rounded-md text-indigo-400 hover:text-white hover:bg-indigo-500/20 transition-colors"
                        title="Manage Team Members"
                        aria-label={`Manage team members for ${client.company}`}
                      >
                        <FiUsers className="h-4 w-4" aria-hidden="true" />
                      </Link>
                      <Link
                        href={`/admin/clients/${client.id}`}
                        className="p-1.5 rounded-md text-gray-400 hover:text-white hover:bg-gray-500/20 transition-colors"
                        title="View Client"
                        aria-label={`View details for ${client.company}`}
                      >
                        <FiEye className="h-4 w-4" aria-hidden="true" />
                      </Link>
                      <Link
                        href={`/admin/clients/${client.id}/edit`}
                        className="p-1.5 rounded-md text-blue-400 hover:text-white hover:bg-blue-500/20 transition-colors"
                        title="Edit Client"
                        aria-label={`Edit ${client.company}`}
                      >
                        <FiEdit2 className="h-4 w-4" aria-hidden="true" />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Organization Creation Modal */}
      <CreateOrganizationModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateOrganization}
      />
    </div>
  );
} 