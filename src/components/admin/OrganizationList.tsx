'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FiPlus, FiEdit2, FiTrash2, FiUsers, FiMail } from 'react-icons/fi';

type Organization = {
  id: string;
  name: string;
  company: string;
  email?: string;
  userCount: number;
  status: 'active' | 'inactive';
  createdAt: string;
};

export default function OrganizationList() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchOrganizations() {
      try {
        // In a real app, fetch from your API
        const response = await fetch('/api/organizations');
        const data = await response.json();

        if (!data.success) {
          throw new Error(data.message || 'Failed to fetch organizations');
        }

        setOrganizations(data.data);
        setIsLoading(false);
      } catch (err: any) {
        console.error('Error fetching organizations:', err);
        setError(err.message || 'An error occurred while fetching organizations');
        setIsLoading(false);
        
        // For demo purposes, set some placeholder data
        setOrganizations([
          {
            id: '1',
            name: 'Acme Corporation',
            company: 'Acme Inc.',
            email: 'contact@acme.com',
            userCount: 3,
            status: 'active',
            createdAt: '2023-06-15',
          },
          {
            id: '2',
            name: 'TechStart Solutions',
            company: 'TechStart LLC',
            email: 'info@techstart.com',
            userCount: 5,
            status: 'active',
            createdAt: '2023-08-22',
          },
          {
            id: '3',
            name: 'Global Designs',
            company: 'Global Designs Co.',
            email: 'hello@globaldesigns.com',
            userCount: 2,
            status: 'inactive',
            createdAt: '2023-09-10',
          },
        ]);
      }
    }

    fetchOrganizations();
  }, []);

  if (isLoading) {
    return (
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
          <div className="animate-pulse h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="animate-pulse h-10 bg-gray-200 rounded w-1/6"></div>
        </div>
        <div className="border-t border-gray-200">
          <div className="animate-pulse p-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="mb-4 h-16 bg-gray-100 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
        <h2 className="text-lg leading-6 font-medium text-gray-900">Organizations</h2>
        <Link
          href="/admin/organizations/create"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <FiPlus className="mr-2 -ml-1 h-5 w-5" />
          New Organization
        </Link>
      </div>
      <div className="border-t border-gray-200">
        {organizations.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No organizations found. Create your first one!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Name
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Company
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Users
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Status
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Created
                  </th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {organizations.map((org) => (
                  <tr key={org.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="text-sm font-medium text-gray-900">{org.name}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{org.company}</div>
                      {org.email && (
                        <div className="text-sm text-gray-500">{org.email}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{org.userCount}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          org.status === 'active'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {org.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(org.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex space-x-2 justify-end">
                        <Link
                          href={`/admin/organizations/${org.id}/invite`}
                          className="text-indigo-600 hover:text-indigo-900"
                          title="Invite Users"
                        >
                          <FiMail className="h-5 w-5" />
                        </Link>
                        <Link
                          href={`/admin/organizations/${org.id}/users`}
                          className="text-blue-600 hover:text-blue-900"
                          title="View Users"
                        >
                          <FiUsers className="h-5 w-5" />
                        </Link>
                        <Link
                          href={`/admin/organizations/${org.id}/edit`}
                          className="text-green-600 hover:text-green-900"
                          title="Edit Organization"
                        >
                          <FiEdit2 className="h-5 w-5" />
                        </Link>
                        <button
                          onClick={() => {
                            if (confirm(`Are you sure you want to delete ${org.name}?`)) {
                              // Handle delete in a real app
                              console.log('Delete organization:', org.id);
                            }
                          }}
                          className="text-red-600 hover:text-red-900"
                          title="Delete Organization"
                        >
                          <FiTrash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
} 