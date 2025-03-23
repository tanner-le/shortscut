import { NextRequest } from 'next/server';
import { successResponse, errorResponse, HTTP_STATUS } from '@/lib/api-utils';
import { authService } from '@/services/authService';

// POST /api/auth/register - Register a new user
export async function POST(request: NextRequest) {
  try {
    const { name, email, password } = await request.json();

    if (!name || !email || !password) {
      return errorResponse('Name, email, and password are required', HTTP_STATUS.BAD_REQUEST);
    }

    try {
      // Use the auth service to handle registration
      const auth = await authService.register(name, email, password);

      return successResponse({
        user: auth.user,
        token: auth.accessToken,
      }, 'Registration successful');
    } catch (err: any) {
      return errorResponse(err.message || 'Registration failed', HTTP_STATUS.BAD_REQUEST);
    }
  } catch (error) {
    console.error('Registration error:', error);
    return errorResponse('An error occurred during registration', HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
} 