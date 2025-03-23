declare module '@supabase/ssr' {
  import { SupabaseClient } from '@supabase/supabase-js';
  
  export interface CookieOptions {
    domain?: string;
    expires?: Date;
    httpOnly?: boolean;
    maxAge?: number;
    path?: string;
    sameSite?: 'lax' | 'strict' | 'none';
    secure?: boolean;
  }

  export interface SupabaseClientOptions {
    cookies: {
      get: (name: string) => string | undefined;
      set: (name: string, value: string, options: CookieOptions) => void;
      remove: (name: string, options: CookieOptions) => void;
    };
  }

  export function createServerClient(
    supabaseUrl: string,
    supabaseKey: string,
    options: SupabaseClientOptions
  ): SupabaseClient;
} 