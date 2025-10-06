import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { config, isFeatureEnabled } from './lib/config'

// Define protected routes
const protectedRoutes = [
  '/dashboard',
  '/profile',
  '/settings',
  '/billing',
  '/admin'
]

// Define public routes (accessible without authentication)
const publicRoutes = [
  '/',
  '/auth/login',
  '/auth/signup',
  '/auth/reset-password',
  '/pricing',
  '/features',
  '/docs',
  '/api/auth'
]

// Define admin routes (require admin role)
const adminRoutes = [
  '/admin'
]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip middleware for static files and API routes (except auth)
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.startsWith('/api/') && !pathname.startsWith('/api/auth')
  ) {
    return NextResponse.next()
  }

  // If authentication is disabled, allow all routes
  if (!isFeatureEnabled('authentication')) {
    return NextResponse.next()
  }

  // Check if route is public
  const isPublicRoute = publicRoutes.some(route => 
    pathname === route || pathname.startsWith(route)
  )

  if (isPublicRoute) {
    return NextResponse.next()
  }

  // Check if route is protected
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.startsWith(route)
  )

  if (isProtectedRoute) {
    // Get user from session/token (implement based on your auth provider)
    const user = getUserFromRequest(request)
    
    if (!user) {
      // Redirect to login
      const loginUrl = new URL('/auth/login', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }

    // Check admin routes
    const isAdminRoute = adminRoutes.some(route => 
      pathname.startsWith(route)
    )

    if (isAdminRoute && user.role !== 'admin') {
      // Redirect to dashboard if not admin
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  return NextResponse.next()
}

// Helper function to get user from request
function getUserFromRequest(request: NextRequest) {
  // This is a placeholder - implement based on your auth provider
  // For Supabase, you would check the session cookie
  // For Auth0, you would check the JWT token
  // For custom auth, you would check your session storage

  try {
    // Example for Supabase
    if (isProviderEnabled('supabase')) {
      const sessionCookie = request.cookies.get('sb-access-token')
      if (sessionCookie) {
        // Decode and validate the session
        // Return user object if valid
        return {
          id: 'user-id',
          email: 'user@example.com',
          role: 'user'
        }
      }
    }

    // Example for Auth0
    if (isProviderEnabled('auth0')) {
      const token = request.cookies.get('appSession')
      if (token) {
        // Decode and validate the JWT
        // Return user object if valid
        return {
          id: 'user-id',
          email: 'user@example.com',
          role: 'user'
        }
      }
    }

    return null
  } catch (error) {
    console.error('Error getting user from request:', error)
    return null
  }
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
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
