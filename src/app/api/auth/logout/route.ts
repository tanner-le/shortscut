import { NextRequest } from 'next/server';
import { successResponse, errorResponse, HTTP_STATUS } from '@/lib/api-utils';
import { supabase } from '@/lib/supabase';

// POST /api/auth/logout - Log out the current user
export async function POST(request: NextRequest) {
  try {
    // Sign out the user from Supabase Auth
    const { error } = await supabase.auth.signOut();

    if (error) {
      return errorResponse(error.message, HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }

    return successResponse(null, 'Successfully logged out');
  } catch (error) {
    console.error('Logout error:', error);
    return errorResponse('An error occurred during logout', HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
} 