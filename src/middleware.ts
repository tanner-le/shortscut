import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/**
 * Routes that require user authentication
 * These paths will redirect to login if no valid session is found
 */
const protectedRoutes = [
  '/dashboard',
  '/clients',
  '/contracts',
  '/projects',
  '/settings',
];

/**
 * Routes that require admin role authorization
 * User must be authenticated AND have admin role to access these
 */
const adminRoutes = [
  '/admin',
  '/admin/dashboard',
  '/admin/clients',
  '/admin/users',
  '/admin/settings',
  '/admin/analytics',
];

/**
 * Public routes accessible without authentication
 * These routes will not trigger authentication checks
 */
const publicRoutes = [
  '/',
  '/login',
  '/admin-setup',
  '/register/complete',
  '/api/auth/check-session', // Allow access to the session debugger API
];

/**
 * Next.js middleware that manages route protection and authorization
 * 
 * This middleware:
 * 1. Allows public routes to proceed without authentication
 * 2. Protects specified routes requiring authentication
 * 3. Requires admin role for admin routes
 * 4. Handles authentication via Supabase session
 * 
 * @param request - The incoming request object
 * @returns NextResponse object to proceed or redirect
 */
export async function middleware(request: NextRequest) {
  try {
    const res = NextResponse.next();
    const pathname = request.nextUrl.pathname;
    
    console.log(`[Middleware] Processing route: ${pathname}`);
    
    // Skip middleware for API routes except specifically protected ones
    if (pathname.startsWith('/api/') && !pathname.startsWith('/api/admin/')) {
      console.log('[Middleware] Skipping API route');
      return res;
    }
    
    // Check if this is a public route
    if (publicRoutes.some(route => pathname === route || pathname.startsWith(`${route}/`))) {
      console.log('[Middleware] Public route, proceeding');
      return res;
    }
    
    // Check if this is a protected or admin route
    const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
    const isAdminRoute = adminRoutes.some(route => pathname.startsWith(route));
    
    console.log(`[Middleware] Protected: ${isProtectedRoute}, Admin: ${isAdminRoute}`);
    
    if (!isProtectedRoute && !isAdminRoute) {
      // If not a protected or admin route, just proceed
      console.log('[Middleware] Not a protected or admin route, proceeding');
      return res;
    }

    // Special case for admin routes that handle auth client-side
    if (pathname === '/admin/dashboard' || 
        pathname.match(/^\/admin\/clients\/[^\/]+$/) ||
        pathname.match(/^\/admin\/clients\/[^\/]+\/team$/)) {
      console.log('[Middleware] Allowing admin page to handle auth client-side:', pathname);
      return res;
    }

    // Create Supabase client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    
    // Get the session
    const { data: { session }, error } = await supabase.auth.getSession();
    
    console.log(`[Middleware] Session: ${!!session}, Error: ${!!error}`);
    
    // If no session and this is a protected or admin route, redirect to login
    if (!session || error) {
      console.log('[Middleware] No session, redirecting to login');
      const redirectUrl = new URL('/login', request.url);
      redirectUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(redirectUrl);
    }
    
    // If admin route, check for admin role
    if (isAdminRoute) {
      const user = session.user;
      // Check both possible locations for role
      const role = user.user_metadata?.role || user.role;
      console.log(`[Middleware] Admin route check - User: ${user.id}, Role: ${role}`);
      
      if (role !== 'admin') {
        // User is not an admin, redirect to dashboard
        console.log('[Middleware] Not admin, redirecting to dashboard');
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
      
      console.log('[Middleware] Admin role confirmed, proceeding');
    }
    
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