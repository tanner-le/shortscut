import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { db } from './db';
import { errorResponse, HTTP_STATUS } from './api-utils';

// Mock JWT secret (in production, store this in environment variables)
const JWT_SECRET = process.env.JWT_SECRET || 'shortscut-jwt-secret';

// JWT token payload type
export interface JwtPayload {
  userId: string;
  name: string;
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
  
  // Verify the token
  const payload = verifyToken(token);
  
  if (!payload) {
    return errorResponse('Invalid or expired token', HTTP_STATUS.UNAUTHORIZED);
  }
  
  // Verify user exists
  const user = db.users.getById(payload.userId);
  
  if (!user) {
    return errorResponse('User not found', HTTP_STATUS.UNAUTHORIZED);
  }
  
  // Call the handler with the authenticated user
  return handler(request, payload);
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