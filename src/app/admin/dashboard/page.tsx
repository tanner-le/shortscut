'use client';

import { useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import SessionDebugger from '@/components/debug/SessionDebugger';
import { createBrowserSupabaseClient } from '@/lib/supabase';
import AdminDashboardLayout from '@/components/admin/AdminDashboardLayout';
import ClientList from '@/components/admin/ClientList';
import { FiAlertCircle, FiUsers, FiBriefcase, FiCalendar, FiLogIn } from 'react-icons/fi';

/**
 * AdminDashboardPage displays the main admin dashboard with
 * overview statistics and client management functionality.
 * 
 * Features:
 * - Authentication checks to ensure only admin users can access
 * - Overview statistics (clients, projects, team members)
 * - Client management through ClientList component
 * - Development information when in development mode
 * 
 * @returns {JSX.Element} The rendered admin dashboard page
 */
export default function AdminDashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    /**
     * Authenticates the user and verifies admin permissions
     * Redirects non-admin users to appropriate pages
     */
    async function getUser() {
      try {
        // Initialize Supabase client
        const supabase = createBrowserSupabaseClient();
        
        // Get the current session without refreshing
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          throw new Error(`Authentication error: ${sessionError.message}`);
        }
        
        if (!session) {
          // Redirect to login if no session exists
          router.push('/login');
          return;
        }
        
        const currentUser = session.user;
        
        // Check if user has admin role
        const role = currentUser.user_metadata?.role || currentUser.role;
        
        if (role !== 'admin') {
          // Redirect non-admin users to regular dashboard
          router.push('/dashboard');
          return;
        }
        
        // Set authenticated admin user
        setUser(currentUser);
      } catch (err: any) {
        const errorMessage = err.message || 'An error occurred during authentication';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    }
    
    getUser();
  }, [router]);

  // Show loading state while authenticating
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-[#111827]">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 rounded-full border-t-2 border-b-2 border-blue-500 animate-spin"></div>
          <p className="mt-4 text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Show error message if authentication fails
  if (error) {
    return (
      <AdminDashboardLayout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-6 bg-[#1a2233] rounded-xl border border-red-500/30 shadow-lg">
            <div className="flex items-start">
              <div className="flex-shrink-0 bg-red-500/20 p-3 rounded-full">
                <FiAlertCircle className="h-6 w-6 text-red-500" aria-hidden="true" />
              </div>
              <div className="ml-5">
                <h2 className="text-xl font-medium text-white">Authentication Error</h2>
                <p className="mt-2 text-gray-400">{error}</p>
                <button 
                  onClick={() => router.push('/login')}
                  className="mt-4 inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium shadow-sm text-white bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-200"
                >
                  <FiLogIn className="mr-2 -ml-1 h-4 w-4" aria-hidden="true" />
                  Go to Login
                </button>
              </div>
            </div>
          </div>
        </div>
      </AdminDashboardLayout>
    );
  }

  // Dashboard stats data
  const stats = [
    { name: 'Total Clients', value: '12', icon: FiBriefcase, color: 'from-blue-500 to-blue-600' },
    { name: 'Active Projects', value: '8', icon: FiCalendar, color: 'from-emerald-500 to-emerald-600' },
    { name: 'Team Members', value: '24', icon: FiUsers, color: 'from-purple-500 to-purple-600' },
  ];

  return (
    <AdminDashboardLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-white">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">Welcome, {user?.user_metadata?.name || 'Admin'}</h1>
            <p className="text-gray-400">Here's what's happening across your client projects.</p>
          </div>
          <div className="mt-3 sm:mt-0">
            <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-900/30 text-blue-400">
              <span className="mr-1.5 inline-block h-2 w-2 rounded-full bg-blue-400" aria-hidden="true"></span>
              Admin Portal
            </div>
          </div>
        </div>
        
        {/* Stats overview */}
        <div className="mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {stats.map((stat) => (
              <div key={stat.name} className="bg-[#1a2233] rounded-lg p-5 border border-[#2a3347] shadow-md">
                <div className="flex items-center">
                  <div className={`flex-shrink-0 bg-gradient-to-r ${stat.color} p-2.5 rounded-lg`}>
                    <stat.icon className="h-5 w-5 text-white" aria-hidden="true" />
                  </div>
                  <div className="ml-4">
                    <p className="text-xs font-medium text-gray-400">{stat.name}</p>
                    <p className="text-xl font-semibold text-white">{stat.value}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Client Management Section */}
        <div className="space-y-6">
          <ClientList />
        </div>
        
        {/* Development information - only shown in development environment */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-8 pt-6 border-t border-[#2a3347]">
            <h2 className="text-lg font-medium mb-4 text-white">Development Information</h2>
            {user && (
              <div className="p-5 bg-[#1a2233] rounded-lg border border-[#2a3347] shadow-md mb-4">
                <h3 className="text-md font-medium text-white mb-2">Admin User</h3>
                <pre className="p-3 bg-[#111827] rounded-md overflow-auto text-xs text-gray-300 max-h-48">
                  {JSON.stringify({
                    userId: user.id,
                    email: user.email,
                    role: user.user_metadata?.role || user.role,
                    metadata: user.user_metadata
                  }, null, 2)}
                </pre>
              </div>
            )}
            
            <div className="bg-[#1a2233] rounded-lg border border-[#2a3347] shadow-md overflow-hidden">
              <div className="p-3 bg-[#2a3347]/50 border-b border-[#2a3347]">
                <h3 className="text-md font-medium text-white">Session Debugger</h3>
              </div>
              <div className="p-4">
                <SessionDebugger />
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminDashboardLayout>
  );
} 