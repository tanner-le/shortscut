import { NextRequest } from 'next/server';
import { successResponse, errorResponse, HTTP_STATUS } from '@/lib/api-utils';
import { createBrowserSupabaseClient } from '@/lib/supabase';

// GET /api/auth/check-session - Get current user's session and role information
export async function GET(request: NextRequest) {
  try {
    // Create Supabase client with browser config
    const supabase = createBrowserSupabaseClient();
    
    // Get the session
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('Session error:', error);
      return errorResponse(error.message, HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
    
    if (!session) {
      return errorResponse('No active session found', HTTP_STATUS.UNAUTHORIZED);
    }
    
    // Return user information with roles for debugging
    const user = session.user;
    const roleFromMetadata = user.user_metadata?.role || null;
    const roleFromUser = user.role || null;
    
    return successResponse({
      id: user.id,
      email: user.email,
      roleFromMetadata,
      roleFromUser,
      metadata: user.user_metadata,
      app_metadata: user.app_metadata,
      fullUser: {
        ...user,
        // Safely extract specific properties we want
        roles: [roleFromMetadata, roleFromUser].filter(Boolean)
      }
    }, 'Session information retrieved successfully');
  } catch (error) {
    console.error('Error checking session:', error);
    return errorResponse('An error occurred while checking session', HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
} 