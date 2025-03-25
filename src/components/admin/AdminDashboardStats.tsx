'use client';

import { useState, useEffect } from 'react';
import { FiUsers, FiBriefcase, FiUserCheck, FiClock, FiPlus } from 'react-icons/fi';
import CreateOrganizationModal from './CreateOrganizationModal';

// Define the OrganizationFormData type locally
type OrganizationFormData = {
  name: string;
  email: string;
  phone?: string;
  company: string;
  industry?: string;
  address?: string;
  plan: 'creator' | 'studio';
  notes?: string;
  status: 'active' | 'inactive';
};

type StatsData = {
  totalOrganizations: number;
  totalUsers: number;
  recentRegistrations: number;
};

export default function AdminDashboardStats() {
  const [stats, setStats] = useState<StatsData>({
    totalOrganizations: 0,
    totalUsers: 0,
    recentRegistrations: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await fetch('/api/admin/stats');
        const data = await response.json();

        if (!data.success) {
          throw new Error(data.message || 'Failed to fetch dashboard stats');
        }

        setStats(data.data);
        setIsLoading(false);
      } catch (err: any) {
        console.error('Error fetching stats:', err);
        setError(err.message || 'An error occurred while fetching dashboard statistics');
        setIsLoading(false);
        
        // Set empty stats on error
        setStats({
          totalOrganizations: 0,
          totalUsers: 0,
          recentRegistrations: 0,
        });
      }
    }

    fetchStats();
  }, []);

  const handleCreateOrganization = async (data: OrganizationFormData) => {
    try {
      const response = await fetch('/api/clients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error('Failed to create organization');
      }

      // Update stats to reflect the new organization
      setStats({
        ...stats,
        totalOrganizations: stats.totalOrganizations + 1,
      });
      
      // Show success message
      alert('Organization created successfully!');
    } catch (err: any) {
      console.error('Error creating organization:', err);
      alert('Failed to create organization. Please try again.');
    }
  };

  // Statistics cards to display
  const statCards = [
    {
      title: 'Total Organizations',
      value: stats.totalOrganizations,
      icon: FiBriefcase,
      iconColor: 'bg-blue-100 text-blue-600',
    },
    {
      title: 'Total Users',
      value: stats.totalUsers,
      icon: FiUsers,
      iconColor: 'bg-green-100 text-green-600',
    },
    {
      title: 'Recent Registrations',
      value: stats.recentRegistrations,
      icon: FiUserCheck,
      iconColor: 'bg-purple-100 text-purple-600',
    },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="overflow-hidden rounded-lg bg-white shadow">
            <div className="p-5">
              <div className="animate-pulse flex space-x-4">
                <div className="rounded-full bg-gray-200 h-12 w-12"></div>
                <div className="flex-1 space-y-4 py-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Show empty state with "Create your first client" button if no organizations exist
  if (stats.totalOrganizations === 0) {
    return (
      <div className="text-center py-12">
        <FiBriefcase className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-lg font-medium text-gray-900">No organizations yet</h3>
        <p className="mt-1 text-sm text-gray-500">Get started by creating your first client.</p>
        <div className="mt-6">
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <FiPlus className="-ml-1 mr-2 h-5 w-5" />
            Create your first client
          </button>
        </div>
        
        <CreateOrganizationModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSubmit={handleCreateOrganization}
        />
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card, index) => (
          <div key={index} className="overflow-hidden rounded-lg bg-white shadow">
            <div className="p-5">
              <div className="flex items-center">
                <div className={`flex-shrink-0 rounded-md p-3 ${card.iconColor}`}>
                  <card.icon className="h-6 w-6" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">{card.title}</dt>
                    <dd className="text-3xl font-semibold text-gray-900">{card.value}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <CreateOrganizationModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateOrganization}
      />
    </>
  );
} 