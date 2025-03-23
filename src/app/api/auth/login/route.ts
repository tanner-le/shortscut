import { NextRequest } from 'next/server';
import { successResponse, errorResponse, HTTP_STATUS } from '@/lib/api-utils';
import { authService } from '@/services/authService';

// POST /api/auth/login - Authenticate user
export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();
    
    if (!email || !password) {
      return errorResponse('Email and password are required', HTTP_STATUS.BAD_REQUEST);
    }
    
    try {
      // Use the auth service to handle login
      const auth = await authService.login(email, password);
      
      return successResponse({
        user: auth.user,
        token: auth.accessToken,
      }, 'Login successful');
    } catch (err: any) {
      return errorResponse(err.message || 'Invalid email or password', HTTP_STATUS.UNAUTHORIZED);
    }
  } catch (error) {
    console.error('Login error:', error);
    return errorResponse('An error occurred during login', HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
} 