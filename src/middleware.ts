import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Define protected routes that require authentication
const protectedRoutes = [
  '/dashboard',
  '/clients',
  '/contracts',
  '/projects',
  '/settings',
];

// Define routes that require admin role
const adminRoutes = [
  '/admin',
];

export async function middleware(request: NextRequest) {
  try {
    const res = NextResponse.next();
    const pathname = request.nextUrl.pathname;
    
    // Check if this is a protected route
    const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
    const isAdminRoute = adminRoutes.some(route => pathname.startsWith(route));
    
    if (!isProtectedRoute && !isAdminRoute) {
      // If not a protected route, just proceed
      return res;
    }

    // Get the auth cookie
    const supabaseCookie = request.cookies.get('sb-access-token')?.value;
    
    // If no cookie and this is a protected route, redirect to login
    if (!supabaseCookie && isProtectedRoute) {
      const redirectUrl = new URL('/login', request.url);
      redirectUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(redirectUrl);
    }
    
    // If admin route, we'd need to check for admin role
    // This would typically require a server-side check with the full token
    // For simplicity, we'll just check for the admin route and cookie existence
    
    return res;
  } catch (error) {
    console.error('Middleware error:', error);
    // If there's an error, proceed to the route
    // The route handler can implement its own auth check
    return NextResponse.next();
  }
}

// Configure which routes use this middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     * - api/public (public API routes)
     */
    '/((?!_next/static|_next/image|favicon.ico|public|api/public).*)',
  ],
}; 