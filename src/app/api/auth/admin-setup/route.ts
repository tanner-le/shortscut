import { NextRequest } from 'next/server';
import { successResponse, errorResponse, HTTP_STATUS } from '@/lib/api-utils';
import { userService } from '@/services/userService';
import { createClient } from '@supabase/supabase-js';

// This endpoint is for initial admin setup only
// It should be protected or disabled after initial setup
export async function POST(request: NextRequest) {
  try {
    const { name, email, password, setupKey } = await request.json();

    // Check if the setup key matches the environment variable
    // This adds a layer of protection for admin setup
    const expectedSetupKey = process.env.ADMIN_SETUP_KEY;
    if (!expectedSetupKey || setupKey !== expectedSetupKey) {
      console.log('Invalid admin setup key provided');
      return errorResponse('Invalid setup key', HTTP_STATUS.UNAUTHORIZED);
    }

    // Ensure setup key is not using the default value
    if (expectedSetupKey === 'test' || expectedSetupKey.length < 12) {
      console.error('Admin setup key is using an insecure default value. Please update ADMIN_SETUP_KEY in environment variables.');
      return errorResponse('Admin setup is disabled with default key. Please configure a secure ADMIN_SETUP_KEY.', HTTP_STATUS.FORBIDDEN);
    }

    if (!name || !email || !password) {
      return errorResponse('Name, email, and password are required', HTTP_STATUS.BAD_REQUEST);
    }

    // Use the admin client with service role for all operations
    const supabaseAdmin = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Check if any admin already exists
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('role', 'admin')
      .limit(1);

    if (error) {
      console.error('Error checking for existing admin:', error);
      return errorResponse(`Error checking for existing admins: ${error.message}`, HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }

    if (data && data.length > 0) {
      return errorResponse('An admin user already exists', HTTP_STATUS.BAD_REQUEST);
    }

    // Create admin user in Supabase Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        name,
        role: 'admin'
      }
    });

    if (authError) {
      console.error('Error creating admin user:', authError);
      return errorResponse(authError.message, HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }

    return successResponse({
      user: {
        id: authData.user.id,
        email: authData.user.email,
        name,
        role: 'admin'
      }
    }, 'Admin user created successfully');
  } catch (error) {
    console.error('Admin setup error:', error);
    return errorResponse('An error occurred during admin setup', HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
} 