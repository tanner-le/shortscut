import { NextRequest } from 'next/server';
import { authenticate } from '@/lib/auth';
import { successResponse } from '@/lib/api-utils';

// GET /api/auth/me - Get current user info
export async function GET(request: NextRequest) {
  return authenticate(request, async (req, user) => {
    return successResponse({
      user: {
        id: user.userId,
        name: user.name,
        email: user.email,
        role: user.role,
      }
    }, 'User authenticated');
  });
} 