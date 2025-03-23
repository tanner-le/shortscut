import { createClient } from '@supabase/supabase-js'

// Get environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// Create a Supabase client for browser-side usage
export const createBrowserSupabaseClient = () => {
  if (typeof window === 'undefined') {
    // Return SSR-compatible client when running on server
    return createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      }
    });
  }
  
  // Return browser client when running in browser
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: false,
      flowType: 'implicit'
    }
  });
}

// Create a single Supabase client for direct usage (e.g., in server components without cookies)
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,  // We don't want to persist in SSR context
    autoRefreshToken: false
  }
})

export default supabase 