'use client';

import { useState, useEffect } from 'react';
import { FiUsers, FiBriefcase, FiUserCheck, FiClock } from 'react-icons/fi';

type StatsData = {
  totalOrganizations: number;
  totalUsers: number;
  activeInvitations: number;
  recentRegistrations: number;
};

export default function AdminDashboardStats() {
  const [stats, setStats] = useState<StatsData>({
    totalOrganizations: 0,
    totalUsers: 0,
    activeInvitations: 0,
    recentRegistrations: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStats() {
      try {
        // In a real app, you would fetch this data from your API
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
        
        // For demo purposes, set some placeholder stats
        setStats({
          totalOrganizations: 5,
          totalUsers: 12,
          activeInvitations: 3,
          recentRegistrations: 2,
        });
      }
    }

    fetchStats();
  }, []);

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
      title: 'Active Invitations',
      value: stats.activeInvitations,
      icon: FiClock,
      iconColor: 'bg-yellow-100 text-yellow-600',
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

  return (
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
  );
} 