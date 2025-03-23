import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { errorResponse, HTTP_STATUS } from './api-utils';
import { prisma } from './prisma';
import { authService } from '@/services/authService';

// JWT secret from environment variable
const JWT_SECRET = process.env.JWT_SECRET || 'default-secret-change-in-production';

// JWT token payload type
export interface JwtPayload {
  userId: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

// Get the authorization token from the request
export function getToken(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  
  return authHeader.split(' ')[1];
}

// Verify and decode the JWT token
export function verifyToken(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
  } catch (error) {
    console.error('Token verification error:', error);
    return null;
  }
}

// Middleware to protect routes
export async function authenticate(
  request: NextRequest,
  handler: (req: NextRequest, user: JwtPayload) => Promise<NextResponse>
): Promise<NextResponse> {
  // Get the token
  const token = getToken(request);
  
  if (!token) {
    return errorResponse('Authentication required', HTTP_STATUS.UNAUTHORIZED);
  }
  
  try {
    // Use the auth service to verify the token and get user
    const user = await authService.getUserFromToken(token);
    
    if (!user) {
      return errorResponse('Invalid or expired token', HTTP_STATUS.UNAUTHORIZED);
    }
    
    // Create a payload with the required user data
    const payload: JwtPayload = {
      userId: user.id,
      email: user.email,
      role: user.role
    };
    
    // Call the handler with the authenticated user
    return handler(request, payload);
  } catch (error) {
    console.error('Authentication error:', error);
    return errorResponse('Authentication failed', HTTP_STATUS.UNAUTHORIZED);
  }
}

// Check if user has required role
export function hasRole(payload: JwtPayload, role: string): boolean {
  return payload.role === role;
}

// Middleware to protect routes and check role
export async function authorizeRole(
  request: NextRequest,
  role: string,
  handler: (req: NextRequest, user: JwtPayload) => Promise<NextResponse>
): Promise<NextResponse> {
  return authenticate(request, async (req, user) => {
    if (!hasRole(user, role)) {
      return errorResponse('Forbidden: Insufficient permissions', HTTP_STATUS.FORBIDDEN);
    }
    
    return handler(req, user);
  });
} 