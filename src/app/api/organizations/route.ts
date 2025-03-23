import { NextRequest } from 'next/server';
import { successResponse, errorResponse, HTTP_STATUS } from '@/lib/api-utils';
import { createClient } from '@supabase/supabase-js';
import { organizationService } from '@/services/organizationService';

// GET /api/organizations - Get all organizations
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
    const mockOrganizations = [
      {
        id: '1',
        name: 'Acme Corporation',
        company: 'Acme Inc.',
        email: 'contact@acme.com',
        userCount: 3,
        status: 'active',
        createdAt: '2023-06-15',
      },
      {
        id: '2',
        name: 'TechStart Solutions',
        company: 'TechStart LLC',
        email: 'info@techstart.com',
        userCount: 5,
        status: 'active',
        createdAt: '2023-08-22',
      },
      {
        id: '3',
        name: 'Global Designs',
        company: 'Global Designs Co.',
        email: 'hello@globaldesigns.com',
        userCount: 2,
        status: 'inactive',
        createdAt: '2023-09-10',
      },
    ];
    
    return successResponse(mockOrganizations, 'Organizations retrieved successfully');
  } catch (error) {
    console.error('Error fetching organizations:', error);
    return errorResponse('An error occurred while fetching organizations', HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
}

// POST /api/organizations - Create a new organization (admin only)
export async function POST(request: NextRequest) {
  try {
    // Get the Supabase auth header
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return errorResponse('Authentication required', HTTP_STATUS.UNAUTHORIZED);
    }

    // Create Supabase client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Verify the token and get the user
    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      return errorResponse('Invalid authentication token', HTTP_STATUS.UNAUTHORIZED);
    }

    // Check if user is admin
    if (user.user_metadata?.role !== 'admin') {
      return errorResponse('Admin access required', HTTP_STATUS.FORBIDDEN);
    }

    // Parse request body
    const { name, company, email, phone, industry, address, notes } = await request.json();

    // Validate required fields
    if (!name || !company) {
      return errorResponse('Name and company are required', HTTP_STATUS.BAD_REQUEST);
    }

    // Create the organization
    try {
      const organization = await organizationService.create({
        name,
        company,
        email,
        phone,
        industry,
        address,
        notes
      });

      return successResponse(organization, 'Organization created successfully');
    } catch (err: any) {
      return errorResponse(err.message || 'Error creating organization', HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
  } catch (error) {
    console.error('Organization creation error:', error);
    return errorResponse('An error occurred while creating the organization', HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
} 