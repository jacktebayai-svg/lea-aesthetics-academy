import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refresh session if expired - required for Server Components
  // https://supabase.com/docs/guides/auth/server-side/nextjs
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Define protected routes and their required roles
  const protectedRoutes = {
    '/admin': ['ADMIN'],
    '/client': ['CLIENT'],
    '/student': ['STUDENT'],
  }

  const pathname = request.nextUrl.pathname
  const url = request.nextUrl.clone()

  // Handle tenant resolution for root path
  if (pathname === "/") {
    const defaultDomain = "leas-aesthetics.com";
    url.pathname = `/${defaultDomain}`;
    return NextResponse.rewrite(url);
  }

  // Check if the route is protected
  const protectedRoute = Object.keys(protectedRoutes).find(route => 
    pathname.startsWith(route)
  )

  if (protectedRoute) {
    // If no user and trying to access protected route, redirect to login
    if (!user) {
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      url.searchParams.set('redirectTo', pathname)
      return NextResponse.redirect(url)
    }

    // Get user's role from metadata or profile
    const userRole = user.user_metadata?.role || user.app_metadata?.role

    // Check if user has required role for this route
    const requiredRoles = protectedRoutes[protectedRoute as keyof typeof protectedRoutes]
    if (userRole && !requiredRoles.includes(userRole)) {
      // Redirect to appropriate dashboard based on user's role
      const url = request.nextUrl.clone()
      switch (userRole) {
        case 'ADMIN':
          url.pathname = '/admin'
          break
        case 'CLIENT':
          url.pathname = '/client/dashboard'
          break
        case 'STUDENT':
          url.pathname = '/student/dashboard'
          break
        default:
          url.pathname = '/login'
      }
      return NextResponse.redirect(url)
    }
  }

  // If user is logged in and trying to access auth pages, redirect to dashboard
  if (user && (pathname === '/login' || pathname === '/register')) {
    const userRole = user.user_metadata?.role || user.app_metadata?.role
    const url = request.nextUrl.clone()
    
    switch (userRole) {
      case 'ADMIN':
        url.pathname = '/admin'
        break
      case 'CLIENT':
        url.pathname = '/client/dashboard'
        break
      case 'STUDENT':
        url.pathname = '/student/dashboard'
        break
      default:
        url.pathname = '/dashboard'
    }
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
