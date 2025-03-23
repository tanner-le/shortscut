import { createClient } from '@supabase/supabase-js'

// Ensure environment variables are available
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// Create a single Supabase client for the entire app
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export default supabase 