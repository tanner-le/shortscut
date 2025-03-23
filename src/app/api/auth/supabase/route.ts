import { NextRequest } from 'next/server';
import { successResponse, errorResponse, HTTP_STATUS } from '@/lib/api-utils';
import { supabase } from '@/lib/supabase';

// POST /api/auth/supabase/signup - Register a new user with Supabase Auth
export async function POST(request: NextRequest) {
  const { pathname } = new URL(request.url);
  const action = pathname.split('/').pop(); // Get the last part of the URL path
  
  try {
    const { email, password, name } = await request.json();

    if (!email || !password) {
      return errorResponse('Email and password are required', HTTP_STATUS.BAD_REQUEST);
    }

    switch(action) {
      case 'signup':
        // Sign up with Supabase Auth
        const { data: signupData, error: signupError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              name,
              role: 'user' // Default role for new registrations
            }
          }
        });

        if (signupError) {
          return errorResponse(signupError.message, HTTP_STATUS.BAD_REQUEST);
        }

        return successResponse({
          user: signupData.user,
          session: signupData.session
        }, 'Registration successful');

      case 'login':
        // Sign in with Supabase Auth
        const { data: signinData, error: signinError } = await supabase.auth.signInWithPassword({
          email,
          password
        });

        if (signinError) {
          return errorResponse(signinError.message, HTTP_STATUS.UNAUTHORIZED);
        }

        return successResponse({
          user: signinData.user,
          session: signinData.session
        }, 'Login successful');

      default:
        return errorResponse('Invalid action', HTTP_STATUS.BAD_REQUEST);
    }
  } catch (error) {
    console.error('Supabase Auth error:', error);
    return errorResponse('An error occurred', HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
}

// GET /api/auth/supabase/user - Get current user from Supabase session
export async function GET(request: NextRequest) {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();

    if (error) {
      return errorResponse(error.message, HTTP_STATUS.UNAUTHORIZED);
    }

    if (!session) {
      return errorResponse('No active session', HTTP_STATUS.UNAUTHORIZED);
    }

    return successResponse({
      user: session.user,
      session
    }, 'User session retrieved');
  } catch (error) {
    console.error('Session retrieval error:', error);
    return errorResponse('Failed to retrieve user session', HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
} 