import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Routes that don't require authentication
const publicRoutes = ['/login', '/reset-password']

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl

    // Skip middleware for API routes (handled by Next.js rewrites)
    if (pathname.startsWith('/api/')) {
        return NextResponse.next()
    }

    // Check if route is public
    const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route))

    // Get auth cookie
    const authToken = request.cookies.get('auth')?.value

    // If accessing a protected route without auth, redirect to login
    if (!isPublicRoute && !authToken) {
        const loginUrl = new URL('/login', request.url)
        return NextResponse.redirect(loginUrl)
    }

    // If authenticated user tries to access login, redirect to dashboard
    if (pathname === '/login' && authToken) {
        const dashboardUrl = new URL('/', request.url)
        return NextResponse.redirect(dashboardUrl)
    }

    return NextResponse.next()
}

export const config = {
    matcher: [
        /*
         * Match all request paths except:
         * - _next/static (static files)
         * - _next/image (image optimization)
         * - favicon.ico
         * - public files (images, etc.)
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
