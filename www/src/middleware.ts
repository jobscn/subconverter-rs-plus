import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyAuthToken } from '@/lib/auth';

const AUTH_COOKIE_NAME = 'subconverter_auth';

/**
 * Get protected paths that require authentication
 * These are the admin/management pages
 */
function getProtectedPaths(): string[] {
  return [
    '/links',      // 管理订阅链接
    '/settings',   // 服务器设置
    '/admin',      // 管理后台
    '/config',     // 配置管理
  ];
}

/**
 * Parse PROTECTED_PATHS environment variable to add custom protected paths
 */
function getCustomProtectedPaths(): string[] {
  const protectedPathsEnv = process.env.PROTECTED_PATHS || '';
  return protectedPathsEnv
    .split(',')
    .map(path => path.trim())
    .filter(Boolean);
}

export function middleware(request: NextRequest) {
  // Check if authentication is enabled
  const authEnabled = process.env.AUTH_ENABLE === 'true';
  
  // If auth is not enabled, allow all requests
  if (!authEnabled) {
    return NextResponse.next();
  }

  const { pathname } = request.nextUrl;

  // Always allow these paths (no authentication required)
  // Includes: initialization, subscription APIs, short links, login, auth APIs, and static resources
  const alwaysAllowedPaths = [
    '/startup',           // Initialization page
    '/api/init',          // Initialization API
    '/api/sub',           // Subscription conversion API (all sub routes)
    '/s/',                // Short link access
    '/login',             // Login page
    '/api/auth/',         // Authentication APIs
    '/_next/',            // Next.js internal
    '/static/',           // Static resources
    '/favicon.ico',       // Favicon
    '/logo.svg'           // Logo
  ];

  if (alwaysAllowedPaths.some(path => pathname.startsWith(path) || pathname === path)) {
    return NextResponse.next();
  }

  // Get protected paths (default + custom)
  const defaultProtectedPaths = getProtectedPaths();
  const customProtectedPaths = getCustomProtectedPaths();
  const allProtectedPaths = [...defaultProtectedPaths, ...customProtectedPaths];

  // Check if current path requires authentication
  const requiresAuth = allProtectedPaths.some(path => pathname.startsWith(path));

  // If path doesn't require auth, allow access
  if (!requiresAuth) {
    return NextResponse.next();
  }

  // Path requires auth - check for auth cookie
  const authCookie = request.cookies.get(AUTH_COOKIE_NAME);

  if (!authCookie) {
    // Redirect to login if not authenticated, preserve original path
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Verify token validity
  const tokenValid = verifyAuthToken(authCookie.value);
  
  if (!tokenValid.valid) {
    // Token is invalid or expired, redirect to login
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Allow the request to proceed
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};

