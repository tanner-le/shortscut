'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { User } from '@supabase/supabase-js';

export default function GeneralDashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getUser() {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || !supabaseAnonKey) {
        console.error('Supabase credentials not found');
        setLoading(false);
        return;
      }
      
      const supabase = createClient(supabaseUrl, supabaseAnonKey);
      
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (session && !error) {
        setUser(session.user);
      }
      
      setLoading(false);
    }
    
    getUser();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        <h1 className="text-2xl font-semibold mb-6">General Dashboard</h1>
        <p>Welcome to the general dashboard!</p>
        
        {user && (
          <div className="mt-4 p-4 bg-white rounded shadow">
            <h2 className="text-lg font-medium">User Information</h2>
            <pre className="mt-2 p-2 bg-gray-100 rounded overflow-auto">
              {JSON.stringify(user, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
} 