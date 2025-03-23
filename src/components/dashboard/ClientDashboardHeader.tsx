'use client';

import { Session, User } from '@supabase/supabase-js';
import { useState, useEffect } from 'react';

type ClientDashboardHeaderProps = {
  user: User;
};

export default function ClientDashboardHeader({ user }: ClientDashboardHeaderProps) {
  const [organizationName, setOrganizationName] = useState<string>('Your Organization');
  
  useEffect(() => {
    // In a real app, we would fetch the organization details from an API
    // For now, we'll just use a placeholder or get from user metadata if available
    const orgName = user.user_metadata?.organizationName || 'Your Organization';
    setOrganizationName(orgName);
  }, [user]);

  return (
    <div className="bg-white shadow">
      <div className="px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{organizationName}</h1>
            <p className="mt-1 text-sm text-gray-500">
              Welcome, {user.user_metadata?.name || user.email}
            </p>
          </div>
          <div className="mt-4 sm:mt-0">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
              Client
            </span>
          </div>
        </div>
      </div>
    </div>
  );
} 