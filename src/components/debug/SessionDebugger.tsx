'use client';

import { useState } from 'react';
import { createBrowserSupabaseClient } from '@/lib/supabase';

export default function SessionDebugger() {
  const [sessionData, setSessionData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkSession = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // First try direct Supabase check
      const supabase = createBrowserSupabaseClient();
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        throw new Error(sessionError.message);
      }
      
      if (session) {
        setSessionData({
          id: session.user.id,
          email: session.user.email,
          roleFromMetadata: session.user.user_metadata?.role || null,
          roleFromUser: session.user.role || null,
          metadata: session.user.user_metadata,
          app_metadata: session.user.app_metadata,
          fullUser: session.user
        });
        return;
      }
      
      // If no session found directly, try the API as fallback
      const response = await fetch('/api/auth/check-session');
      const data = await response.json();
      
      if (data.success) {
        setSessionData(data.data);
      } else {
        setError(data.message || 'Failed to get session data');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 border rounded-lg bg-gray-50 mt-4">
      <h2 className="text-lg font-medium mb-3">Session Debugger</h2>
      
      <button
        onClick={checkSession}
        disabled={loading}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
      >
        {loading ? 'Checking...' : 'Check Session'}
      </button>
      
      {error && (
        <div className="mt-3 p-3 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}
      
      {sessionData && (
        <div className="mt-4">
          <h3 className="font-medium">User Information:</h3>
          <div className="mt-2 bg-white p-3 rounded border overflow-auto">
            <div><strong>ID:</strong> {sessionData.id}</div>
            <div><strong>Email:</strong> {sessionData.email}</div>
            <div><strong>Role from metadata:</strong> {sessionData.roleFromMetadata || 'Not set'}</div>
            <div><strong>Role from user:</strong> {sessionData.roleFromUser || 'Not set'}</div>
            
            <h4 className="font-medium mt-3">Metadata:</h4>
            <pre className="bg-gray-100 p-2 rounded text-sm mt-1">
              {JSON.stringify(sessionData.metadata, null, 2)}
            </pre>
            
            <h4 className="font-medium mt-3">App Metadata:</h4>
            <pre className="bg-gray-100 p-2 rounded text-sm mt-1">
              {JSON.stringify(sessionData.app_metadata, null, 2)}
            </pre>
            
            <h4 className="font-medium mt-3">Full User Object:</h4>
            <pre className="bg-gray-100 p-2 rounded text-sm mt-1">
              {JSON.stringify(sessionData.fullUser, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
} 