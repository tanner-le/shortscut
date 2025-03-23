'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';

export default function DashboardRouter() {
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function routeUser() {
      try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
        
        if (!supabaseUrl || !supabaseAnonKey) {
          console.error('Supabase credentials not found');
          router.push('/login');
          return;
        }
        
        const supabase = createClient(supabaseUrl, supabaseAnonKey);
        
        // Get the session
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error || !session) {
          // If no session or error, redirect to login
          console.log('No session, redirecting to login');
          router.push('/login');
          return;
        }

        // Get the user from the session
        const user = session.user;
        
        // Route based on user role - check both possible locations for role
        const role = user.user_metadata?.role || user.role;
        
        console.log('Dashboard router - User:', user.id);
        console.log('Dashboard router - Role:', role);
        
        if (role === 'admin') {
          console.log('Admin role detected, routing to admin dashboard');
          router.push('/admin/dashboard');
        } else if (role === 'client') {
          console.log('Client role detected, routing to client dashboard');
          router.push('/dashboard/client');
        } else if (role === 'teamMember') {
          console.log('Team member role detected, routing to team member dashboard');
          router.push('/dashboard/team-member');
        } else {
          // Default case - generic dashboard
          console.log('No valid role found, routing to general dashboard');
          router.push('/dashboard/general');
        }
      } catch (err) {
        console.error('Error in dashboard router:', err);
        router.push('/login');
      } finally {
        setLoading(false);
      }
    }
    
    routeUser();
  }, [router]);

  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mx-auto"></div>
        <p className="mt-4 text-gray-600">Redirecting to your dashboard...</p>
      </div>
    </div>
  );
} 