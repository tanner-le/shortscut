import { NextRequest } from 'next/server';
import { successResponse, errorResponse, HTTP_STATUS } from '@/lib/api-utils';
import { createClient } from '@supabase/supabase-js';

// GET /api/admin/stats - Get admin dashboard statistics
export async function GET(request: NextRequest) {
  try {
    // Create Supabase client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    
    // Get the session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session) {
      return errorResponse('Authentication required', HTTP_STATUS.UNAUTHORIZED);
    }
    
    // Check if user is admin
    const user = session.user;
    const role = user.user_metadata?.role || user.role;
    if (role !== 'admin') {
      return errorResponse('Unauthorized access', HTTP_STATUS.FORBIDDEN);
    }
    
    // For development purposes, return mock data
    // In production, you would query your database for real data
    const mockStats = {
      totalOrganizations: 5,
      totalUsers: 12,
      recentRegistrations: 2,
    };
    
    return successResponse(mockStats, 'Admin statistics retrieved successfully');
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return errorResponse('An error occurred while fetching admin statistics', HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
} 