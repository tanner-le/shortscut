'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminDashboardLayout from '@/components/admin/AdminDashboardLayout';
import { createBrowserSupabaseClient } from '@/lib/supabase';
import { FiLoader } from 'react-icons/fi';

/**
 * AdminClientsPage checks authentication and redirects to the admin dashboard
 * where the client list is shown
 */
export default function AdminClientsPage() {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      try {
        // Check authentication
        const supabase = createBrowserSupabaseClient();
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
          console.error('Session error:', sessionError);
          router.push('/login');
          return;
        }

        if (!session || !session.user) {
          console.log('No active session, redirecting to login');
          router.push('/login');
          return;
        }

        // Verify admin role
        const role = session.user.user_metadata?.role || session.user.role;
        if (role !== 'admin') {
          console.log('User is not an admin, redirecting to dashboard');
          router.push('/dashboard');
          return;
        }
        
        // If all checks pass, redirect to admin dashboard
        router.push('/admin/dashboard');
      } catch (err) {
        console.error('Auth check error:', err);
        router.push('/login');
      } finally {
        setIsChecking(false);
      }
    }

    checkAuth();
  }, [router]);

  return (
    <AdminDashboardLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-white">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="w-10 h-10 rounded-full border-t-2 border-b-2 border-blue-500 animate-spin mx-auto"></div>
            <p className="mt-4 text-gray-400">
              {isChecking ? 'Checking authorization...' : 'Redirecting to dashboard...'}
            </p>
          </div>
        </div>
      </div>
    </AdminDashboardLayout>
  );
} 