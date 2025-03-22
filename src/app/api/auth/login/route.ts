import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { successResponse, errorResponse, HTTP_STATUS } from '@/lib/api-utils';
import jwt from 'jsonwebtoken';

// Mock JWT secret (in production, store this in environment variables)
const JWT_SECRET = process.env.JWT_SECRET || 'shortscut-jwt-secret';
const JWT_EXPIRES_IN = '7d'; // 7 days

// POST /api/auth/login - Authenticate user
export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();
    
    if (!email || !password) {
      return errorResponse('Email and password are required', HTTP_STATUS.BAD_REQUEST);
    }
    
    // In a real application, you would use bcrypt to hash and compare passwords
    // For demo purposes, we're using a simple check
    // This is just for demo - in production, NEVER store plain text passwords
    
    // Find user by email
    const user = db.users.getByEmail(email);
    
    // For demo: admin@shortscut.com / password
    if (!user || (email !== 'admin@shortscut.com' || password !== 'password')) {
      return errorResponse('Invalid email or password', HTTP_STATUS.UNAUTHORIZED);
    }
    
    // Generate JWT
    const token = jwt.sign(
      { 
        userId: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );
    
    // In a real app, you might want to use HTTP-only cookies instead
    return successResponse({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token,
    }, 'Login successful');
    
  } catch (error) {
    console.error('Login error:', error);
    return errorResponse('An error occurred during login', HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
} 